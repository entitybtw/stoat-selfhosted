import { col } from "../db.js";
import { publishEvent } from "../redis.js";
import {
  ACCOUNTS_COLLECTION,
  GUEST_EMAIL_DOMAIN,
  createGuest,
  deleteGuestAccount,
  expireGuests,
  extendGuest,
  getGuestSettings,
  guestStatus,
  publicGuestConfig,
  saveGuestSettings,
} from "../guest.js";
import { ah, escapeRegex, parsePaging, ulid } from "../util.js";

/** Client address, honouring the proxy in front of the panel */
function clientIp(req) {
  return req.ip || req.socket?.remoteAddress || "unknown";
}

function isGuestEmail(email) {
  return (
    typeof email === "string" &&
    email.startsWith("guest-") &&
    email.endsWith(`@${GUEST_EMAIL_DOMAIN}`)
  );
}

/* ------------------------------------------------------------------ */
/* public: used by the web client                                      */
/* ------------------------------------------------------------------ */

/** What the login page needs to know before offering the button */
export const guestConfig = ah(async (req, res) => {
  const settings = await getGuestSettings();
  res.json(publicGuestConfig(settings));
});

/** Create a temporary account and hand back credentials the client can log in with */
export const guestRegister = ah(async (req, res) => {
  const settings = await getGuestSettings();

  if (!settings.enabled) {
    return res.status(403).json({
      error: "Гостевые аккаунты отключены",
      code: "guests_disabled",
    });
  }

  const displayName = String(req.body?.displayName ?? "").trim();

  if (!displayName) {
    return res
      .status(400)
      .json({ error: "Введите имя", code: "invalid_display_name" });
  }

  try {
    const created = await createGuest(displayName, clientIp(req), settings);
    res.json({ ...created, suffix: publicGuestConfig(settings).suffix });
  } catch (error) {
    if (error.code === "rate_limited") {
      return res.status(429).json({
        error: "Слишком много гостевых аккаунтов с этого адреса",
        code: "rate_limited",
      });
    }

    if (error.code === "invalid_display_name") {
      return res
        .status(400)
        .json({ error: "Недопустимое имя", code: "invalid_display_name" });
    }

    console.error("[guest] register failed:", error);
    res.status(500).json({
      error: "Не удалось создать гостевой аккаунт",
      code: "guest_create_failed",
    });
  }
});

/** Whether the calling session belongs to a guest */
export const guestStatusHandler = ah(async (req, res) => {
  const token = req.get("x-session-token");
  if (!token) {
    return res
      .status(401)
      .json({ error: "Нужен токен сессии", code: "missing_token" });
  }

  try {
    res.json(await guestStatus(token));
  } catch (error) {
    if (error.status === 401) {
      return res
        .status(401)
        .json({ error: "Сессия недействительна", code: "invalid_session" });
    }

    console.error("[guest] status failed:", error);
    res
      .status(500)
      .json({ error: "Не удалось проверить аккаунт", code: "guest_status_failed" });
  }
});

/* ------------------------------------------------------------------ */
/* admin                                                               */
/* ------------------------------------------------------------------ */

export const getGuestSettingsHandler = ah(async (req, res) => {
  const settings = await getGuestSettings();
  res.json(settings);
});

export const putGuestSettings = ah(async (req, res) => {
  try {
    const settings = await saveGuestSettings(req.body || {});
    res.json(settings);
  } catch (error) {
    if (
      error.code === "invalid_lifetime" ||
      error.code === "invalid_suffix" ||
      error.code === "invalid_per_ip"
    ) {
      return res
        .status(400)
        .json({ error: "Недопустимое значение", code: error.code });
    }
    throw error;
  }
});

/** Guests with their current state, newest first */
export const listGuests = ah(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query);
  const q = String(req.query.q || "").trim();
  const now = new Date();

  const filter = {};
  if (q) {
    filter.$or = [
      { email: new RegExp(escapeRegex(q), "i") },
      { displayName: new RegExp(escapeRegex(q), "i") },
      { username: new RegExp(escapeRegex(q), "i") },
    ];
  }

  const [total, records] = await Promise.all([
    col(ACCOUNTS_COLLECTION).countDocuments(filter),
    col(ACCOUNTS_COLLECTION)
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
  ]);

  const ids = records.map((record) => record._id);
  const [users, accounts] = await Promise.all([
    col("users").find({ _id: { $in: ids } }).toArray(),
    col("accounts")
      .find({ _id: { $in: ids } })
      .project({ email: 1, disabled: 1 })
      .toArray(),
  ]);

  const userById = new Map(users.map((user) => [user._id, user]));
  const accountById = new Map(accounts.map((account) => [account._id, account]));

  res.json({
    page,
    limit,
    total,
    pages: Math.max(1, Math.ceil(total / limit)),
    items: records.map((record) => {
      const user = userById.get(record._id);
      const account = accountById.get(record._id);
      const email = account?.email ?? record.email;

      return {
        id: record._id,
        username: user?.username ?? record.username,
        discriminator: user?.discriminator ?? null,
        displayName: user?.display_name ?? record.displayName,
        email,
        createdAt: record.createdAt ?? null,
        expiresAt: record.expiresAt ?? null,
        expiredAt: record.expiredAt ?? null,
        converted: !!record.convertedAt || !isGuestEmail(email),
        deleted: !user,
        disabled: !!account?.disabled,
        expired: !!record.expiresAt && record.expiresAt <= now,
      };
    }),
  });
});

/** Remove a guest right now */
export const removeGuest = ah(async (req, res) => {
  const userId = req.params.id;
  const record = await col(ACCOUNTS_COLLECTION).findOne({ _id: userId });

  const deleted = await deleteGuestAccount(userId);

  if (record) {
    await publishEvent("user_update", {
      id: ulid(),
      type: "UserUpdate",
      user_id: userId,
      data: { disabled: true },
      clear: [],
    });
  }

  res.json({ ok: true, deleted });
});

/** Give one guest more time */
export const extendGuestHandler = ah(async (req, res) => {
  const days = Math.round(Number(req.body?.days));
  if (!Number.isFinite(days) || days < 1 || days > 3650) {
    return res
      .status(400)
      .json({ error: "Недопустимый срок", code: "invalid_days" });
  }

  const expiresAt = await extendGuest(req.params.id, days);
  if (!expiresAt) {
    return res
      .status(404)
      .json({ error: "Гость не найден", code: "not_found" });
  }

  res.json({ ok: true, expiresAt });
});

/** Run the cleaner now instead of waiting for the timer */
export const runGuestCleanup = ah(async (req, res) => {
  res.json(await expireGuests());
});
