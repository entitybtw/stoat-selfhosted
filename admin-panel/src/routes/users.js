import { col } from "../db.js";
import { publishEvent } from "../redis.js";
import { hashPassword } from "../auth.js";
import { escapeRegex, parsePaging, ulidTimestamp, ah } from "../util.js";

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
  if (!user) return res.status(404).json({ error: "Пользователь не найден" });

  const [account, sessions] = await Promise.all([
    col("accounts").findOne(
      { _id: user._id },
      { projection: { email: 1, disabled: 1, verification: 1, mfa: 1 } },
    ),
    col("sessions").countDocuments({ user_id: user._id }),
  ]);

  res.json({
    id: user._id,
    username: user.username,
    discriminator: user.discriminator,
    privileged: Boolean(user.privileged),
    badges: user.badges || 0,
    suspendedUntil: user.suspended_until || null,
    pronouns: user.pronouns || null,
    email: account?.email || null,
    disabled: Boolean(account?.disabled),
    verified: account?.verification?.status === "Verified",
    mfaEnabled: Boolean(account?.mfa?.totp_token),
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
    return res.status(400).json({ error: "Укажите новый пароль" });
  }
  if (Buffer.byteLength(password, "utf8") < 8) {
    return res.status(400).json({ error: "Пароль должен быть не короче 8 символов" });
  }
  if (Buffer.byteLength(password, "utf8") > 1024) {
    return res.status(400).json({ error: "Пароль слишком длинный" });
  }

  const user = await col("users").findOne({ _id: req.params.id });
  if (!user) return res.status(404).json({ error: "Пользователь не найден" });

  const hashed = await hashPassword(password);
  const update = await col("accounts").updateOne(
    { _id: user._id },
    { $set: { password: hashed, password_reset: null } },
  );
  if (update.matchedCount === 0) {
    return res.status(404).json({ error: "Аккаунт не найден" });
  }

  const kicked = await kickSessions(user._id);
  res.json({ ok: true, sessionsDeleted: kicked });
});

export const setUserPrivileged = ah(async (req, res) => {
  const { privileged } = req.body || {};
  if (typeof privileged !== "boolean") {
    return res.status(400).json({ error: "Ожидается булево значение privileged" });
  }

  const result = await col("users").updateOne(
    { _id: req.params.id },
    { $set: { privileged } },
  );
  if (result.matchedCount === 0) {
    return res.status(404).json({ error: "Пользователь не найден" });
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
    return res.status(400).json({ error: "Ожидается булево значение disabled" });
  }

  const user = await col("users").findOne({ _id: req.params.id });
  if (!user) return res.status(404).json({ error: "Пользователь не найден" });

  const result = await col("accounts").updateOne(
    { _id: user._id },
    { $set: { disabled } },
  );
  if (result.matchedCount === 0) {
    return res.status(404).json({ error: "Аккаунт не найден" });
  }

  if (disabled) {
    const kicked = await kickSessions(user._id);
    return res.json({ ok: true, disabled, sessionsDeleted: kicked });
  }
  res.json({ ok: true, disabled });
});
