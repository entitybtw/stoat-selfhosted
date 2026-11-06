import crypto from "node:crypto";

import { col } from "./db.js";
import { config } from "./config.js";
import { displayNameError } from "./validate.js";

/**
 * Temporary accounts.
 *
 * The backend images are upstream builds, so a guest is an ordinary account
 * whose email lives in a reserved domain; everything the panel needs to know
 * about it (when it dies, who created it) sits in `admin_guest_accounts`.
 * Restricting what a guest may upload happens in the client.
 */

const SETTINGS_ID = "config";
const SETTINGS_COLLECTION = "admin_guest_settings";
export const ACCOUNTS_COLLECTION = "admin_guest_accounts";

/** Email domain that marks an account as temporary */
export const GUEST_EMAIL_DOMAIN =
  process.env.GUEST_EMAIL_DOMAIN || "guest.entitybtw.ru";

/** Defaults used until an admin changes something */
export const DEFAULT_SETTINGS = {
  /** Whether the "continue as guest" button exists at all */
  enabled: false,

  /** How long an account lives */
  lifetimeDays: 180,

  /** Decorates the display name so everybody can see it is a temporary account */
  suffixEnabled: true,
  suffix: " [гость]",

  /**
   * What a guest may not do. The client hides the controls; the flags travel
   * to it through /api/guest/config.
   */
  blockFiles: true,
  blockAvatar: true,
  blockEmoji: true,
  blockSoundboard: true,
  blockServers: true,
  blockLocalEmoji: true,

  /**
   * How many guests one address may create.
   *
   * Zero means unlimited: guests are cheap and the instance owner decides
   * whether the feature is worth turning on at all.
   */
  perIpLimit: 0,
  perIpWindowHours: 24,
};

const BOOLEAN_SETTINGS = [
  "enabled",
  "suffixEnabled",
  "blockFiles",
  "blockAvatar",
  "blockEmoji",
  "blockSoundboard",
  "blockServers",
  "blockLocalEmoji",
];

/** Settings as the panel should see them */
export async function getGuestSettings() {
  const stored = await col(SETTINGS_COLLECTION).findOne({ _id: SETTINGS_ID });
  const settings = { ...DEFAULT_SETTINGS };

  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    if (stored && stored[key] !== undefined) settings[key] = stored[key];
  }

  return settings;
}

/**
 * Update the settings.
 * @param {Record<string, unknown>} patch
 */
export async function saveGuestSettings(patch) {
  const $set = {};

  for (const key of BOOLEAN_SETTINGS) {
    if (typeof patch[key] === "boolean") $set[key] = patch[key];
  }

  if (patch.lifetimeDays !== undefined) {
    const days = Math.round(Number(patch.lifetimeDays));
    if (!Number.isFinite(days) || days < 1 || days > 3650) {
      const error = new Error("lifetimeDays out of range");
      error.code = "invalid_lifetime";
      throw error;
    }
    $set.lifetimeDays = days;
  }

  if (patch.perIpLimit !== undefined) {
    const limit = Math.round(Number(patch.perIpLimit));
    if (!Number.isFinite(limit) || limit < 0 || limit > 100) {
      const error = new Error("perIpLimit out of range");
      error.code = "invalid_per_ip";
      throw error;
    }
    $set.perIpLimit = limit;
  }

  if (patch.perIpWindowHours !== undefined) {
    const hours = Math.round(Number(patch.perIpWindowHours));
    if (!Number.isFinite(hours) || hours < 1 || hours > 720) {
      const error = new Error("perIpWindowHours out of range");
      error.code = "invalid_per_ip";
      throw error;
    }
    $set.perIpWindowHours = hours;
  }

  if (patch.suffix !== undefined) {
    const suffix = String(patch.suffix).slice(0, 32);
    if (/[\n\r\u0000]/.test(suffix)) {
      const error = new Error("suffix contains control characters");
      error.code = "invalid_suffix";
      throw error;
    }
    $set.suffix = suffix;
  }

  $set.updatedAt = new Date();
  await col(SETTINGS_COLLECTION).updateOne(
    { _id: SETTINGS_ID },
    { $set },
    { upsert: true },
  );

  return getSettingsAndAccounts();
}

async function getSettingsAndAccounts() {
  return getGuestSettings();
}

/** Payload the web client is allowed to see */
export function publicGuestConfig(settings) {
  return {
    enabled: settings.enabled,
    lifetimeDays: settings.lifetimeDays,
    suffix: settings.suffixEnabled ? settings.suffix : "",
    blocks: {
      files: settings.blockFiles,
      avatar: settings.blockAvatar,
      emoji: settings.blockEmoji,
      soundboard: settings.blockSoundboard,
      servers: settings.blockServers,
      localEmoji: settings.blockLocalEmoji,
    },
  };
}

/* ------------------------------------------------------------------ */
/* calls into the Stoat API                                            */
/* ------------------------------------------------------------------ */

async function api(method, path, { body, token } = {}) {
  const headers = { "content-type": "application/json" };
  if (token) headers["x-session-token"] = token;

  const res = await fetch(`${config.apiUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const detail =
      typeof data === "string" ? data.slice(0, 120) : JSON.stringify(data ?? {}).slice(0, 200);
    const error = new Error(`${method} ${path} → ${res.status}: ${detail}`);
    error.status = res.status;
    error.body = data;
    throw error;
  }

  return data;
}

/* ------------------------------------------------------------------ */
/* creating guests                                                     */
/* ------------------------------------------------------------------ */

const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

function randomToken(length) {
  let value = "";
  const bytes = crypto.randomBytes(length);
  for (let index = 0; index < length; index += 1) {
    value += ALPHABET[bytes[index] % ALPHABET.length];
  }
  return value;
}

/** Something nobody will ever type in, but the backend accepts as an email */
function guestEmail() {
  return `guest-${crypto.randomBytes(10).toString("hex")}@${GUEST_EMAIL_DOMAIN}`;
}

/** A password the client keeps next to the session so it can upgrade the account */
function guestPassword() {
  return crypto.randomBytes(24).toString("base64url");
}

/** Unique username: `guest_ab12cd` */
async function unusedUsername() {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const username = `guest_${randomToken(6)}`;
    const taken =
      (await col("users").countDocuments({ username })) > 0 ||
      (await col("users").countDocuments({ username: username.toLowerCase() })) > 0;

    if (!taken) return username;
  }

  return `guest_${randomToken(12)}`;
}

/** Split the display name so the suffix cannot push it past 32 characters */
function decorateName(name, settings) {
  if (!settings.suffixEnabled || !settings.suffix) return name;

  const limit = 32 - settings.suffix.length;
  const trimmed = [...name].slice(0, Math.max(1, limit)).join("");
  return `${trimmed}${settings.suffix}`;
}

/* rate limiting: guests per address */
const recentByIp = new Map();

function pruneIp(ip, windowMs) {
  const now = Date.now();
  const list = recentByIp.get(ip);
  if (!list) return [];

  const fresh = list.filter((at) => now - at < windowMs);
  if (fresh.length) recentByIp.set(ip, fresh);
  else recentByIp.delete(ip);

  return fresh;
}

/**
 * Create a temporary account.
 * @param {string} displayName What the person typed
 * @param {string} ip Request address
 * @param {object} settings Current settings
 */
export async function createGuest(displayName, ip, settings) {
  const invalid = displayNameError(displayName);
  if (invalid) {
    const error = new Error("invalid display name");
    error.code = invalid;
    throw error;
  }

  const windowMs = settings.perIpWindowHours * 3_600_000;
  const recent = pruneIp(ip, windowMs);
  if (settings.perIpLimit > 0 && recent.length >= settings.perIpLimit) {
    const error = new Error("too many guests from this address");
    error.code = "rate_limited";
    throw error;
  }

  const email = guestEmail();
  const password = guestPassword();
  const username = await unusedUsername();

  await api("POST", "/auth/account/create", { body: { email, password } });

  const session = await api("POST", "/auth/session/login", {
    body: { email, password },
  });

  const token = session?.token;
  if (!token) throw new Error("no session token after login");

  const name = decorateName(displayName, settings);

  await api("POST", "/onboard/complete", { body: { username }, token });
  await api("PATCH", "/users/@me", { body: { display_name: name }, token });

  const now = new Date();
  const expiresAt = new Date(now.getTime() + settings.lifetimeDays * 86_400_000);

  await col(ACCOUNTS_COLLECTION).insertOne({
    _id: session.user_id,
    email,
    username,
    displayName: name,
    rawDisplayName: displayName,
    createdAt: now,
    expiresAt,
    ip,
    convertedAt: null,
    expiredAt: null,
  });

  recent.push(now.getTime());
  recentByIp.set(ip, recent);

  return {
    userId: session.user_id,
    email,
    password,
    username,
    displayName: name,
    expiresAt,
    lifetimeDays: settings.lifetimeDays,
  };
}

/**
 * Whether the holder of a session token is a guest.
 *
 * A guest who set a real email is no longer temporary: the account email is
 * what counts, so the panel does not have to be told about the upgrade.
 *
 * The session is read straight out of Mongo instead of asking the API: the
 * API rate-limits by address, and the panel is on the same address as
 * everybody else, so asking it for every guest check burns the limit of the
 * whole instance.
 * @param {string} token Session token from the client
 */
export async function guestStatus(token) {
  const session = await col("sessions").findOne({ token });
  const userId = session?.user_id;
  if (!userId) throw new Error("no user for this session");

  const record = await col(ACCOUNTS_COLLECTION).findOne({ _id: userId });
  const account = await col("accounts").findOne({ _id: userId });
  const email = account?.email ?? "";

  const isGuest = email.startsWith("guest-") && email.endsWith(`@${GUEST_EMAIL_DOMAIN}`);

  if (record && !isGuest && !record.convertedAt) {
    await col(ACCOUNTS_COLLECTION).updateOne(
      { _id: userId },
      { $set: { convertedAt: new Date() } },
    );
  }

  const settings = await getGuestSettings();

  return {
    userId,
    guest: isGuest,
    expiresAt: record?.expiresAt ?? null,
    converted: !!record?.convertedAt,
    suffix: isGuest && settings.suffixEnabled ? settings.suffix : "",
    blocks: publicGuestConfig(settings).blocks,
  };
}

/* ------------------------------------------------------------------ */
/* expiring guests                                                     */
/* ------------------------------------------------------------------ */

/**
 * Disable an account and let the backend's hourly job finish the deletion.
 *
 * `deletion` is the same field the API writes when somebody deletes their own
 * account, so the cleanup (messages, memberships, sessions) is the backend's.
 * @param {string} userId
 */
export async function deleteGuestAccount(userId) {
  const now = new Date();

  const account = await col("accounts").findOne({ _id: userId });
  if (!account) return false;

  await col("accounts").updateOne(
    { _id: userId },
    { $set: { disabled: true, deletion: { status: "Scheduled", after: now } } },
  );

  await col("sessions").deleteMany({ user_id: userId });
  await col(ACCOUNTS_COLLECTION).updateOne(
    { _id: userId },
    { $set: { expiredAt: now } },
  );

  return true;
}

/**
 * Delete everybody whose time is up.
 *
 * Accounts that were upgraded to a real email are skipped and marked as
 * converted instead.
 */
export async function expireGuests() {
  const now = new Date();
  const due = await col(ACCOUNTS_COLLECTION)
    .find({ expiresAt: { $lte: now }, expiredAt: null })
    .toArray();

  let deleted = 0;
  let converted = 0;

  for (const record of due) {
    const account = await col("accounts").findOne({ _id: record._id });
    if (!account) {
      await col(ACCOUNTS_COLLECTION).updateOne(
        { _id: record._id },
        { $set: { expiredAt: now } },
      );
      continue;
    }

    const email = account.email ?? "";
    const isGuest = email.startsWith("guest-") && email.endsWith(`@${GUEST_EMAIL_DOMAIN}`);

    if (!isGuest) {
      converted += 1;
      await col(ACCOUNTS_COLLECTION).updateOne(
        { _id: record._id },
        { $set: { convertedAt: record.convertedAt ?? now } },
      );
      continue;
    }

    await deleteGuestAccount(record._id);
    deleted += 1;
  }

  return { deleted, converted };
}

/** Extend (or shorten) the life of one guest */
export async function extendGuest(userId, days) {
  const record = await col(ACCOUNTS_COLLECTION).findOne({ _id: userId });
  if (!record) return null;

  const base = record.expiresAt && record.expiresAt > new Date() ? record.expiresAt : new Date();
  const expiresAt = new Date(base.getTime() + days * 86_400_000);

  await col(ACCOUNTS_COLLECTION).updateOne(
    { _id: userId },
    { $set: { expiresAt, expiredAt: null } },
  );

  return expiresAt;
}
