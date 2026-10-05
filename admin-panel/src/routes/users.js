import { col } from "../db.js";
import { publishEvent } from "../redis.js";
import { hashPassword } from "../auth.js";
import {
  escapeRegex,
  parsePaging,
  ulidTimestamp,
  ulid,
  ah,
} from "../util.js";
import {
  usernameError,
  discriminatorError,
  displayNameError,
  pronounsError,
  emailError,
  normaliseEmail,
  availableDiscriminators,
} from "../validate.js";

export const listUsers = ah(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query);
  const q = String(req.query.q || "").trim();

  const filter = {};
  if (q) {
    if (q.includes("@")) {
      const accounts = await col("accounts")
        .find({ email: new RegExp(`^${escapeRegex(q)}$`, "i") })
        .project({ _id: 1 })
        .toArray();
      filter._id = { $in: accounts.map((account) => account._id) };
    } else if (q.includes("#")) {
      const [name, discriminator] = q.split("#");
      filter.username = name;
      filter.discriminator = discriminator;
    } else if (/^[0-9A-HJKMNP-TV-Z]{26}$/.test(q)) {
      filter._id = q.toUpperCase();
    } else {
      filter.username = new RegExp(escapeRegex(q), "i");
    }
  }

  const [total, users] = await Promise.all([
    col("users").countDocuments(filter),
    col("users")
      .find(filter)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
  ]);

  const ids = users.map((user) => user._id);
  const [accounts, sessionCounts] = await Promise.all([
    col("accounts")
      .find({ _id: { $in: ids } })
      .project({ email: 1, disabled: 1, verification: 1, mfa: 1 })
      .toArray(),
    col("sessions")
      .aggregate([
        { $match: { user_id: { $in: ids } } },
        { $group: { _id: "$user_id", count: { $sum: 1 } } },
      ])
      .toArray(),
  ]);

  const accountById = new Map(accounts.map((account) => [account._id, account]));
  const sessionsById = new Map(
    sessionCounts.map((entry) => [entry._id, entry.count]),
  );

  res.json({
    total,
    page,
    limit,
    items: users.map((user) => {
      const account = accountById.get(user._id);
      return {
        id: user._id,
        username: user.username,
        discriminator: user.discriminator,
        displayName: user.display_name || null,
        privileged: Boolean(user.privileged),
        badges: user.badges || 0,
        suspendedUntil: user.suspended_until || null,
        email: account?.email || null,
        disabled: Boolean(account?.disabled),
        verified: account?.verification?.status === "Verified",
        mfaEnabled: Boolean(account?.mfa?.totp_token),
        sessions: sessionsById.get(user._id) || 0,
        createdAt: ulidTimestamp(user._id),
      };
    }),
  });
});

export const getUser = ah(async (req, res) => {
  const user = await col("users").findOne({ _id: req.params.id });
  if (!user) {
    return res
      .status(404)
      .json({ error: "Пользователь не найден", code: "not_found" });
  }

  const [account, sessions] = await Promise.all([
    col("accounts").findOne({ _id: user._id }),
    col("sessions").countDocuments({ user_id: user._id }),
  ]);

  res.json({
    id: user._id,
    username: user.username,
    discriminator: user.discriminator,
    displayName: user.display_name || null,
    pronouns: user.pronouns || null,
    privileged: Boolean(user.privileged),
    badges: user.badges || 0,
    flags: user.flags || 0,
    suspendedUntil: user.suspended_until || null,
    email: account?.email || null,
    emailNormalised: account?.email_normalised || null,
    disabled: Boolean(account?.disabled),
    verified: account?.verification?.status === "Verified",
    verificationStatus:
      account?.verification?.status || null,
    mfaEnabled: Boolean(account?.mfa?.totp_token),
    // the backend only ever stores an argon2 hash — there is no plaintext
    // password anywhere; the panel exposes the stored credential material
    // read-only so admins can inspect it (never writable from here).
    passwordHash: account?.password || null,
    sessions,
    createdAt: ulidTimestamp(user._id),
  });
});

/** Invalidate all backend sessions of a user and notify live clients. */
async function kickSessions(userId) {
  const result = await col("sessions").deleteMany({ user_id: userId });
  await publishEvent(`${userId}!`, {
    type: "DeleteAllSessions",
    user_id: userId,
    exclude_session_id: null,
  });
  await col("admin_sessions").deleteMany({ user_id: userId });
  return result.deletedCount;
}

export const setUserPassword = ah(async (req, res) => {
  const { password } = req.body || {};
  if (typeof password !== "string") {
    return res
      .status(400)
      .json({ error: "Укажите новый пароль", code: "missing_password" });
  }
  if (Buffer.byteLength(password, "utf8") < 8) {
    return res.status(400).json({
      error: "Пароль должен быть не короче 8 символов",
      code: "password_too_short",
    });
  }
  if (Buffer.byteLength(password, "utf8") > 1024) {
    return res
      .status(400)
      .json({ error: "Пароль слишком длинный", code: "password_too_long" });
  }

  const user = await col("users").findOne({ _id: req.params.id });
  if (!user) {
    return res
      .status(404)
      .json({ error: "Пользователь не найден", code: "not_found" });
  }

  const hashed = await hashPassword(password);
  const update = await col("accounts").updateOne(
    { _id: user._id },
    { $set: { password: hashed, password_reset: null } },
  );
  if (update.matchedCount === 0) {
    return res
      .status(404)
      .json({ error: "Аккаунт не найден", code: "account_not_found" });
  }

  const kicked = await kickSessions(user._id);
  res.json({ ok: true, sessionsDeleted: kicked });
});

export const setUserPrivileged = ah(async (req, res) => {
  const { privileged } = req.body || {};
  if (typeof privileged !== "boolean") {
    return res.status(400).json({
      error: "Ожидается булево значение privileged",
      code: "invalid_body",
    });
  }

  const result = await col("users").updateOne(
    { _id: req.params.id },
    { $set: { privileged } },
  );
  if (result.matchedCount === 0) {
    return res
      .status(404)
      .json({ error: "Пользователь не найден", code: "not_found" });
  }

  // losing panel rights must revoke an open panel session immediately
  if (!privileged) {
    await col("admin_sessions").deleteMany({ user_id: req.params.id });
  }
  res.json({ ok: true, privileged });
});

export const setUserDisabled = ah(async (req, res) => {
  const { disabled } = req.body || {};
  if (typeof disabled !== "boolean") {
    return res.status(400).json({
      error: "Ожидается булево значение disabled",
      code: "invalid_body",
    });
  }

  const user = await col("users").findOne({ _id: req.params.id });
  if (!user) {
    return res
      .status(404)
      .json({ error: "Пользователь не найден", code: "not_found" });
  }

  const result = await col("accounts").updateOne(
    { _id: user._id },
    { $set: { disabled } },
  );
  if (result.matchedCount === 0) {
    return res
      .status(404)
      .json({ error: "Аккаунт не найден", code: "account_not_found" });
  }

  if (disabled) {
    const kicked = await kickSessions(user._id);
    return res.json({ ok: true, disabled, sessionsDeleted: kicked });
  }
  res.json({ ok: true, disabled });
});

/** Case-insensitive lookup of discriminators already used by a username. */
async function usedDiscriminators(username) {
  const rows = await col("users")
    .find({ username: new RegExp(`^${escapeRegex(username)}$`, "i") })
    .project({ discriminator: 1 })
    .toArray();
  return new Set(rows.map((row) => String(row.discriminator)));
}

/** Is this (username, discriminator) pair taken by somebody else? */
async function tagTaken(username, discriminator, selfId) {
  const clash = await col("users").findOne({
    username: new RegExp(`^${escapeRegex(username)}$`, "i"),
    discriminator: String(discriminator),
    _id: { $ne: selfId },
  });
  return Boolean(clash);
}

/**
 * POST /api/users/:id/profile
 *
 * Detailed profile editing: username, discriminator, display name, pronouns.
 * Mirrors User::update_username + DataEditUser validation and publishes the
 * same UserUpdate event the backend would (p_user fan-out: the user's own
 * channel plus every `{server}u` member channel).
 */
export const setUserProfile = ah(async (req, res) => {
  const body = req.body || {};
  const has = (key) => Object.prototype.hasOwnProperty.call(body, key);

  if (!has("username") && !has("discriminator") && !has("display_name") && !has("pronouns")) {
    return res.status(400).json({
      error: "Укажите хотя бы одно поле для изменения",
      code: "nothing_to_update",
    });
  }

  const user = await col("users").findOne({ _id: req.params.id });
  if (!user) {
    return res
      .status(404)
      .json({ error: "Пользователь не найден", code: "not_found" });
  }

  const $set = {};
  const $unset = {};
  const data = {}; // PartialUser payload for UserUpdate
  const clear = [];

  // --- username ---------------------------------------------------------
  let nextUsername = user.username;
  if (has("username")) {
    const code = usernameError(body.username);
    if (code) {
      return res.status(400).json({ error: "Недопустимое имя пользователя", code });
    }
    nextUsername = body.username;
  }

  // --- discriminator ----------------------------------------------------
  let nextDiscriminator = String(user.discriminator);
  const usernameChanged =
    nextUsername.toLowerCase() !== String(user.username).toLowerCase();

  if (has("discriminator") && body.discriminator !== null && body.discriminator !== "") {
    // explicit tag: validate + uniqueness (also covers "keep current tag
    // while renaming" — self is excluded, so an unchanged tag always passes)
    const code = discriminatorError(body.discriminator);
    if (code) {
      return res
        .status(400)
        .json({ error: "Недопустимый дискриминатор", code });
    }
    const wanted = String(body.discriminator);
    if (await tagTaken(nextUsername, wanted, user._id)) {
      return res.status(409).json({
        error: "Этот дискриминатор уже занят у такого имени",
        code: "discriminator_taken",
      });
    }
    nextDiscriminator = wanted;
  } else if (has("discriminator")) {
    // explicit auto request (null/""): always re-roll a free tag
    const used = await usedDiscriminators(nextUsername);
    used.delete(nextDiscriminator); // the current tag is ours to reuse…
    const available = availableDiscriminators(used).filter(
      (tag) => tag !== nextDiscriminator, // …but the user asked for a new one
    );
    if (available.length === 0) {
      return res.status(409).json({
        error: "Нет свободных дискриминаторов для этого имени",
        code: "username_taken",
      });
    }
    nextDiscriminator = available[Math.floor(Math.random() * available.length)];
  } else if (usernameChanged) {
    // no explicit tag: keep the current one when it is free for the new
    // name (find_discriminator with a preferred value), otherwise re-roll
    if (await tagTaken(nextUsername, nextDiscriminator, user._id)) {
      const used = await usedDiscriminators(nextUsername);
      const available = availableDiscriminators(used);
      if (available.length === 0) {
        return res.status(409).json({
          error: "Нет свободных дискриминаторов для этого имени",
          code: "username_taken",
        });
      }
      nextDiscriminator =
        available[Math.floor(Math.random() * available.length)];
    }
  }

  if (nextUsername !== user.username) {
    $set.username = nextUsername;
    data.username = nextUsername;
  }
  if (nextDiscriminator !== String(user.discriminator)) {
    $set.discriminator = nextDiscriminator;
    data.discriminator = nextDiscriminator;
  }

  // --- display name -----------------------------------------------------
  if (has("display_name")) {
    if (body.display_name === null || body.display_name === "") {
      if (user.display_name !== undefined) {
        $unset.display_name = "";
        clear.push("DisplayName");
      }
    } else {
      const code = displayNameError(body.display_name);
      if (code) {
        return res
          .status(400)
          .json({ error: "Недопустимое отображаемое имя", code });
      }
      $set.display_name = body.display_name;
      data.display_name = body.display_name;
    }
  }

  // --- pronouns ---------------------------------------------------------
  if (has("pronouns")) {
    if (body.pronouns === null || body.pronouns === "") {
      if (user.pronouns !== undefined) {
        $unset.pronouns = "";
        clear.push("Pronouns");
      }
    } else {
      const code = pronounsError(body.pronouns);
      if (code) {
        return res.status(400).json({ error: "Недопустимые местоимения", code });
      }
      $set.pronouns = body.pronouns;
      data.pronouns = body.pronouns;
    }
  }

  if (Object.keys($set).length === 0 && Object.keys($unset).length === 0) {
    return res.json({ ok: true, changed: false });
  }

  const update = {};
  if (Object.keys($set).length > 0) update.$set = $set;
  if (Object.keys($unset).length > 0) update.$unset = $unset;

  let result;
  try {
    result = await col("users").updateOne({ _id: user._id }, update);
  } catch (err) {
    // unique index on (username, discriminator)
    if (err && err.code === 11000) {
      return res.status(409).json({
        error: "Сочетание имя#дискриминатор уже занято",
        code: "username_taken",
      });
    }
    throw err;
  }
  if (result.matchedCount === 0) {
    return res
      .status(404)
      .json({ error: "Пользователь не найден", code: "not_found" });
  }

  // publish UserUpdate like EventV1::p_user — own channel + member channels
  const event = {
    type: "UserUpdate",
    id: user._id,
    data,
    clear,
    event_id: ulid(),
  };
  await publishEvent(user._id, event);
  try {
    const memberships = await col("server_members")
      .find({ "_id.user": user._id })
      .project({ "_id.server": 1 })
      .toArray();
    for (const member of memberships) {
      await publishEvent(`${member._id.server}u`, { ...event });
    }
  } catch (err) {
    console.warn(`[events] user fan-out failed: ${err.message}`);
  }

  res.json({
    ok: true,
    changed: true,
    username: nextUsername,
    discriminator: nextDiscriminator,
  });
});

/**
 * POST /api/users/:id/email
 *
 * Change an account's email outright (admin action, no verification mail):
 * the value is normalised like util/email.rs::normalise_email, duplicate
 * checked against both unique indexes, and the account is marked Verified —
 * the backend refuses to log in Pending accounts (UnverifiedAccount).
 */
export const setUserEmail = ah(async (req, res) => {
  const { email } = req.body || {};
  const code = emailError(typeof email === "string" ? email.trim() : email);
  if (code) {
    return res
      .status(400)
      .json({ error: "Некорректный email", code });
  }

  const value = String(email).trim();
  const normalised = normaliseEmail(value);

  const user = await col("users").findOne({ _id: req.params.id });
  if (!user) {
    return res
      .status(404)
      .json({ error: "Пользователь не найден", code: "not_found" });
  }

  // both accounts.email and accounts.email_normalised carry unique indexes
  // (the former with an en/secondary collation → case-insensitive)
  const clash = await col("accounts").findOne({
    _id: { $ne: user._id },
    $or: [
      { email_normalised: normalised },
      { email: new RegExp(`^${escapeRegex(value)}$`, "i") },
    ],
  });
  if (clash) {
    return res.status(409).json({
      error: "Этот email уже используется",
      code: "email_taken",
    });
  }

  let result;
  try {
    result = await col("accounts").updateOne(
      { _id: user._id },
      {
        $set: {
          email: value,
          email_normalised: normalised,
          // admin-forced change: skip the verification round-trip so the
          // account stays loginable (login.rs rejects Pending)
          verification: { status: "Verified" },
        },
      },
    );
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({
        error: "Этот email уже используется",
        code: "email_taken",
      });
    }
    throw err;
  }
  if (result.matchedCount === 0) {
    return res
      .status(404)
      .json({ error: "Аккаунт не найден", code: "account_not_found" });
  }

  res.json({ ok: true, email: value, emailNormalised: normalised });
});
