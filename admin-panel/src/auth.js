import crypto from "node:crypto";
import argon2 from "@node-rs/argon2";
import { col } from "./db.js";
import { config } from "./config.js";
import { escapeRegex } from "./util.js";

const { hash, verify } = argon2;

export const COOKIE_NAME = "stoat_admin";

/**
 * Match rust-argon2 Config::default used by the backend:
 * $argon2i$v=19$m=4096,t=3,p=1$… (algorithm 1 = Argon2i)
 */
const ARGON_OPTIONS = {
  algorithm: 1,
  memoryCost: 4096,
  timeCost: 3,
  parallelism: 1,
};

export function hashPassword(password) {
  return hash(password, ARGON_OPTIONS);
}

export async function checkPassword(hashed, password) {
  try {
    return await verify(hashed, password);
  } catch {
    return false;
  }
}

// --- login rate limiting (per IP) ---

const attempts = new Map();

function bucketFor(ip) {
  const now = Date.now();
  let bucket = attempts.get(ip);
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + config.loginWindowMs };
    attempts.set(ip, bucket);
  }
  return bucket;
}

function canAttempt(ip) {
  return bucketFor(ip).count < config.maxLoginAttempts;
}

function registerFailure(ip) {
  bucketFor(ip).count += 1;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, bucket] of attempts) {
    if (now > bucket.resetAt) attempts.delete(ip);
  }
}, 60_000).unref();

// --- cookies ---

export function readCookie(req, name) {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    if (part.slice(0, index).trim() === name) {
      return decodeURIComponent(part.slice(index + 1).trim());
    }
  }
  return null;
}

function setSessionCookie(res, token, req) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: req.secure,
    path: config.basePath,
    maxAge: config.sessionTtlMs,
  });
}

export function clearSessionCookie(res, req) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: req.secure,
    path: config.basePath,
  });
}

// --- credential resolution ---

/**
 * Resolve a login identifier to { account, user }.
 * Accepts an email, a username, or username#discriminator.
 * account._id is the same ULID as users._id (both sides of authifier).
 */
async function findTarget(login) {
  const invalid = { error: "Неверный логин или пароль", code: "invalid_credentials" };

  if (login.includes("@")) {
    const email = new RegExp(`^${escapeRegex(login)}$`, "i");
    const account = await col("accounts").findOne({
      $or: [{ email }, { email_normalised: login.toLowerCase() }],
    });
    if (!account) return invalid;
    const user = await col("users").findOne({ _id: account._id });
    if (!user) return invalid;
    return { account, user };
  }

  let name = login;
  let discriminator = null;
  const hashIndex = login.lastIndexOf("#");
  if (hashIndex > 0) {
    name = login.slice(0, hashIndex);
    discriminator = login.slice(hashIndex + 1);
  }

  let users = await col("users").find({ username: name }).toArray();
  if (discriminator) {
    users = users.filter((user) => String(user.discriminator) === discriminator);
  }
  if (users.length === 0) return invalid;
  if (users.length > 1) {
    return {
      error: "Найдено несколько пользователей — войдите по email или username#дискриминатор",
      code: "ambiguous_login",
    };
  }

  const user = users[0];
  const account = await col("accounts").findOne({ _id: user._id });
  if (!account) return invalid;
  return { account, user };
}

export function publicUser(user) {
  return {
    id: user._id,
    username: user.username,
    discriminator: user.discriminator,
    privileged: Boolean(user.privileged),
  };
}

// --- handlers ---

export async function handleLogin(req, res) {
  const ip = req.ip || "unknown";
  if (!canAttempt(ip)) {
    return res.status(429).json({
      error: "Слишком много попыток входа, попробуйте позже",
      code: "rate_limited",
    });
  }

  const { login, password } = req.body || {};
  if (typeof login !== "string" || typeof password !== "string" || !login || !password) {
    return res
      .status(400)
      .json({ error: "Укажите логин и пароль", code: "missing_fields" });
  }

  const target = await findTarget(login.trim());
  if (target.error) {
    registerFailure(ip);
    return res
      .status(401)
      .json({ error: target.error, code: target.code || "invalid_credentials" });
  }

  const { account, user } = target;
  const valid = await checkPassword(account.password, password);
  if (!valid) {
    registerFailure(ip);
    return res
      .status(401)
      .json({ error: "Неверный логин или пароль", code: "invalid_credentials" });
  }
  if (account.disabled) {
    return res
      .status(403)
      .json({ error: "Аккаунт отключён", code: "account_disabled" });
  }
  if (!user.privileged) {
    // password was correct — do not count this as a failed attempt
    return res.status(403).json({
      error: "Доступ только для привилегированных пользователей",
      code: "not_privileged",
    });
  }

  attempts.delete(ip);

  const token = crypto.randomBytes(32).toString("base64url");
  const now = new Date();
  await col("admin_sessions").insertOne({
    _id: token,
    user_id: user._id,
    created: now,
    expires: new Date(now.getTime() + config.sessionTtlMs),
  });

  setSessionCookie(res, token, req);
  res.json({ user: publicUser(user) });
}

export async function handleLogout(req, res) {
  const token = readCookie(req, COOKIE_NAME);
  if (token) {
    await col("admin_sessions").deleteOne({ _id: token });
  }
  clearSessionCookie(res, req);
  res.json({ ok: true });
}

/** Require a valid panel session backed by a still-privileged user. */
export async function requireAuth(req, res, next) {
  try {
    const token = readCookie(req, COOKIE_NAME);
    if (!token) {
      return res
        .status(401)
        .json({ error: "Требуется вход", code: "unauthenticated" });
    }

    const session = await col("admin_sessions").findOne({ _id: token });
    if (!session || session.expires < new Date()) {
      clearSessionCookie(res, req);
      return res
        .status(401)
        .json({ error: "Сессия истекла", code: "session_expired" });
    }

    const user = await col("users").findOne({ _id: session.user_id });
    if (!user || !user.privileged) {
      await col("admin_sessions").deleteOne({ _id: token });
      clearSessionCookie(res, req);
      return res
        .status(403)
        .json({ error: "Доступ запрещён", code: "access_denied" });
    }

    req.admin = { user, sessionId: token };
    next();
  } catch (err) {
    next(err);
  }
}
