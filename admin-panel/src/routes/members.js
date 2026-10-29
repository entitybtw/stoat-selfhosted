import crypto from "node:crypto";
import http from "node:http";
import https from "node:https";

import { col } from "../db.js";
import { decodeImage, encodeSquareJpeg } from "../image.js";
import { publishEvent } from "../redis.js";
import { escapeRegex, parsePaging, ah, ulid, ulidTimestamp } from "../util.js";
import { displayNameError } from "../validate.js";

/** ULID check shared with the other routes. */
const isId = (value) => /^[0-9A-HJKMNP-TV-Z]{26}$/.test(String(value || ""));

/** Mongo cannot index into a `null` `_id`, so every lookup is guarded. */
async function findServer(id) {
  if (!isId(id)) return null;
  return col("servers").findOne({ _id: id });
}

/** `username#1234`, with the display name alongside when there is one. */
function userLabel(user) {
  if (!user) return null;
  return {
    id: user._id,
    tag: `${user.username}#${user.discriminator}`,
    username: user.username,
    discriminator: user.discriminator,
    displayName: user.display_name || null,
    avatarId: user.avatar?._id || null,
  };
}

/** Role list as stored in `servers.roles` (an object keyed by role id). */
function normalizeRoles(roles) {
  if (!roles) return [];
  const entries = Array.isArray(roles)
    ? roles.map((role) => [role._id, role])
    : Object.entries(roles);

  return entries
    .map(([id, role]) => ({
      id,
      name: role?.name || id,
      rank: Number(role?.rank ?? 0),
      colour: role?.colour || null,
    }))
    .filter((role) => Boolean(role.id))
    .sort((a, b) => b.rank - a.rank);
}

/**
 * GET /api/servers/:id
 *
 * Everything the server drawer needs in one round trip: the server itself,
 * its roles and its members. Members are resolved against `users` for the
 * account tag and against `server_members` for the per-server nickname.
 */
export const getServer = ah(async (req, res) => {
  const server = await findServer(req.params.id);
  if (!server) {
    return res
      .status(404)
      .json({ error: "Сервер не найден", code: "not_found" });
  }

  const [members, owner] = await Promise.all([
    col("server_members")
      .find({ "_id.server": server._id })
      .sort({ joined_at: 1 })
      .toArray(),
    col("users")
      .findOne({ _id: server.owner })
      .then(userLabel)
      .catch(() => null),
  ]);

  const ids = members.map((member) => member._id.user);
  const users = ids.length
    ? await col("users")
        .find({ _id: { $in: ids } })
        .project({ username: 1, discriminator: 1, display_name: 1, avatar: 1 })
        .toArray()
    : [];
  const byId = new Map(users.map((user) => [user._id, user]));

  res.json({
    id: server._id,
    name: server.name,
    description: server.description ?? null,
    owner: server.owner,
    ownerUser: owner,
    channels: Array.isArray(server.channels) ? server.channels.length : 0,
    defaultPermissions: String(server.default_permissions ?? "0"),
    createdAt: ulidTimestamp(server._id),
    roles: normalizeRoles(server.roles),
    members: members.map((member) => {
      const account = byId.get(member._id.user);
      return {
        id: member._id.user,
        user: userLabel(account),
        nickname: member.nickname || null,
        // What the user is called inside this server right now.
        displayName:
          member.nickname || account?.display_name || account?.username || null,
        avatarId: member.avatar?._id || account?.avatar?._id || null,
        hasAvatar: Boolean(member.avatar?._id || account?.avatar?._id),
        roles: Array.isArray(member.roles) ? member.roles : [],
        joinedAt: Number(member.joined_at) || null,
        owner: member._id.user === server.owner,
      };
    }),
  });
});

/**
 * GET /api/servers/:id/members?q=
 *
 * Search the accounts of the instance for somebody to add to this server.
 * Accounts already in the server are marked so the UI can hide them.
 */
export const searchServerMembers = ah(async (req, res) => {
  const server = await findServer(req.params.id);
  if (!server) {
    return res
      .status(404)
      .json({ error: "Сервер не найден", code: "not_found" });
  }

  const q = String(req.query.q || "").trim();
  const { limit } = parsePaging({ limit: req.query.limit }, 15);

  const filter = {};
  if (q) {
    if (q.includes("#")) {
      const [name, discriminator] = q.split("#");
      filter.username = name;
      filter.discriminator = discriminator;
    } else {
      filter.$or = [
        { username: new RegExp(escapeRegex(q), "i") },
        { display_name: new RegExp(escapeRegex(q), "i") },
      ];
    }
  }

  const users = await col("users")
    .find(filter)
    .sort({ _id: -1 })
    .limit(limit)
    .project({ username: 1, discriminator: 1, display_name: 1, avatar: 1 })
    .toArray();

  const present = new Set(
    (
      await col("server_members")
        .find({ "_id.server": server._id, "_id.user": { $in: users.map((user) => user._id) } })
        .project({ "_id.user": 1 })
        .toArray()
    ).map((member) => member._id.user),
  );

  res.json({
    items: users.map((user) => ({
      ...userLabel(user),
      member: present.has(user._id),
    })),
  });
});

/**
 * POST /api/servers/:id/members  { user_id, roles? }
 *
 * Add an account to the server, the way an invite or member join does:
 * a `server_members` document plus the `MemberJoin` event so connected
 * clients add it without a reload.
 */
export const addServerMember = ah(async (req, res) => {
  const server = await findServer(req.params.id);
  if (!server) {
    return res
      .status(404)
      .json({ error: "Сервер не найден", code: "not_found" });
  }

  const userId = String((req.body || {}).user_id || "");
  if (!isId(userId)) {
    return res
      .status(400)
      .json({ error: "Укажите пользователя", code: "missing_user" });
  }

  const user = await col("users").findOne({ _id: userId });
  if (!user) {
    return res
      .status(404)
      .json({ error: "Пользователь не найден", code: "user_not_found" });
  }

  if (userId === server.owner) {
    return res
      .status(409)
      .json({ error: "Владелец уже состоит в сервере", code: "already_member" });
  }

  const existing = await col("server_members").findOne({
    _id: { server: server._id, user: userId },
  });
  if (existing) {
    return res
      .status(409)
      .json({ error: "Пользователь уже в сервере", code: "already_member" });
  }

  const member = {
    _id: { server: server._id, user: userId },
    joined_at: Date.now(),
  };

  // An admin pick goes through here as a plain membership first: roles are
  // edited afterwards through the same endpoint as every other member.
  const roles = Array.isArray((req.body || {}).roles)
    ? (req.body || {}).roles.filter((role) => typeof role === "string")
    : [];
  const known = new Set(normalizeRoles(server.roles).map((role) => role.id));
  const validRoles = roles.filter((role) => known.has(role));
  if (validRoles.length) member.roles = validRoles;

  await col("server_members").insertOne(member);
  // An invite that was pending is spent now.
  await col("channel_invites").deleteMany({ "_id.user": userId, server: server._id });

  await publishEvent(server._id, {
    type: "MemberJoin",
    id: server._id,
    member: {
      _id: { server: server._id, user: userId },
      joined_at: member.joined_at,
      ...(member.roles ? { roles: member.roles } : {}),
    },
    user: {
      _id: user._id,
      username: user.username,
      discriminator: user.discriminator,
      ...(user.display_name ? { display_name: user.display_name } : {}),
    },
  });

  res.json({ ok: true, userId });
});

/**
 * DELETE /api/servers/:id/members/:userId
 *
 * Remove somebody from the server: the membership row, their bans-free
 * join state and the per-server nickname/avatar. The owner cannot be
 * removed — transferring ownership first is the honest way to do that.
 */
export const removeServerMember = ah(async (req, res) => {
  const server = await findServer(req.params.id);
  if (!server) {
    return res
      .status(404)
      .json({ error: "Сервер не найден", code: "not_found" });
  }

  const userId = req.params.userId;
  if (userId === server.owner) {
    return res.status(409).json({
      error: "Владельца нельзя удалить из сервера",
      code: "is_owner",
    });
  }

  const result = await col("server_members").deleteOne({
    _id: { server: server._id, user: userId },
  });
  if (result.deletedCount === 0) {
    return res
      .status(404)
      .json({ error: "Участник не найден", code: "not_found" });
  }

  await publishEvent(server._id, {
    type: "MemberLeave",
    id: server._id,
    user: userId,
    reason: null,
  });

  res.json({ ok: true });
});

/**
 * POST /api/servers/:id/members/:userId
 *
 * Set what the member is called inside the server (nickname) and which
 * roles they hold. Both live in the same `server_members` document, so
 * one endpoint keeps them consistent and emits a single `MemberUpdate`.
 */
export const updateServerMember = ah(async (req, res) => {
  const server = await findServer(req.params.id);
  if (!server) {
    return res
      .status(404)
      .json({ error: "Сервер не найден", code: "not_found" });
  }

  const userId = req.params.userId;
  const body = req.body || {};
  const memberDoc = await col("server_members").findOne({
    _id: { server: server._id, user: userId },
  });
  if (!memberDoc) {
    return res
      .status(404)
      .json({ error: "Участник не найден", code: "not_found" });
  }
  const $set = {};
  const $unset = {};
  const data = {};
  const clear = [];

  if (Object.prototype.hasOwnProperty.call(body, "nickname")) {
    const nickname = body.nickname === null ? "" : String(body.nickname).trim();
    if (nickname === "") {
      $unset.nickname = "";
      clear.push("Nickname");
    } else {
      const code = displayNameError(nickname);
      if (code) {
        return res
          .status(400)
          .json({ error: "Недопустимое имя на сервере", code });
      }
      $set.nickname = nickname;
      data.nickname = nickname;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "roles")) {
    if (!Array.isArray(body.roles)) {
      return res
        .status(400)
        .json({ error: "Ожидается список ролей", code: "invalid_roles" });
    }
    const known = new Map(
      normalizeRoles(server.roles).map((role) => [role.id, role]),
    );
    const roles = [...new Set(body.roles.filter((role) => typeof role === "string"))];
    const unknown = roles.find((role) => !known.has(role));
    if (unknown) {
      return res
        .status(400)
        .json({ error: "Неизвестная роль", code: "invalid_roles" });
    }
    const ordered = roles.sort(
      (a, b) => (known.get(b)?.rank ?? 0) - (known.get(a)?.rank ?? 0),
    );
    if (ordered.length) $set.roles = ordered;
    else $unset.roles = "";
    data.roles = ordered;
  }

  // `avatar` is a per-server picture: people see it inside this server and
  // it never touches the account. `null` (or "") removes it.
  if (Object.prototype.hasOwnProperty.call(body, "avatar")) {
    if (body.avatar === null || body.avatar === "") {
      if (member?.avatar !== undefined) clear.push("Avatar");
      $unset.avatar = "";
    } else {
      const id = String(body.avatar);
      const attachment = /^[A-Za-z0-9_\-]{16,64}$/.test(id)
        ? await col("attachments").findOne({ _id: id })
        : null;
      if (!attachment) {
        return res
          .status(404)
          .json({ error: "Файл аватара не найден", code: "avatar_not_found" });
      }
      $set.avatar = attachment;
      data.avatar = attachment;
    }
  }

  if (!Object.keys($set).length && !Object.keys($unset).length) {
    return res
      .status(400)
      .json({ error: "Нет изменений", code: "nothing_to_update" });
  }

  const member = memberDoc;

  // A nickname equal to the stored one is not a change at all; empty
  // strings already became an unset above, so compare what is on disk.
  const update = {};
  if (Object.keys($set).length) update.$set = $set;
  if (Object.keys($unset).length) update.$unset = $unset;
  await col("server_members").updateOne({ _id: member._id }, update);

  await publishEvent(server._id, {
    type: "MemberUpdate",
    id: server._id,
    user: userId,
    data,
    clear,
  });

  res.json({
    ok: true,
    nickname: $set.nickname ?? null,
    roles: data.roles ?? (Array.isArray(member.roles) ? member.roles : []),
  });
});

/**
 * POST /api/servers/:id/roles  { name, colour?, rank? }
 *
 * Create a role. Stoat stores roles as a map on the server document, keyed
 * by the role id, so the new role is added under a fresh id and announced
 * with `RoleCreate`.
 */
export const createServerRole = ah(async (req, res) => {
  const server = await findServer(req.params.id);
  if (!server) {
    return res
      .status(404)
      .json({ error: "Сервер не найден", code: "not_found" });
  }

  const body = req.body || {};
  const name = String(body.name || "").trim();
  if (name.length < 1 || name.length > 32) {
    return res
      .status(400)
      .json({ error: "Название роли: 1–32 символа", code: "invalid_role_name" });
  }

  if (normalizeRoles(server.roles).length >= 100) {
    return res
      .status(409)
      .json({ error: "Слишком много ролей (максимум 100)", code: "too_many_roles" });
  }

  const colour = typeof body.colour === "string" && /^#[0-9a-fA-F]{6}$/.test(body.colour)
    ? body.colour
    : null;
  const rank =
    Number.isFinite(Number(body.rank)) && Number(body.rank) >= 0
      ? Number(body.rank)
      : 0;

  const id = ulid();
  const role = {
    _id: id,
    name,
    permissions: { a: 0, d: 0 },
    rank,
    ...(colour ? { colour } : {}),
  };

  // `servers.roles` may be absent on servers created before roles existed.
  const existing = server.roles && !Array.isArray(server.roles) ? server.roles : {};
  await col("servers").updateOne(
    { _id: server._id },
    { $set: { [`roles.${id}`]: role } },
  );

  await publishEvent(server._id, {
    type: "RoleCreate",
    id: server._id,
    role: {
      _id: id,
      name,
      permissions: { a: "0", d: "0" },
      rank,
      ...(colour ? { colour } : {}),
    },
  });

  res.json({ ok: true, role: role && { ...role, id }, roles: normalizeRoles({ ...existing, [id]: role }) });
});

/**
 * DELETE /api/servers/:id/roles/:roleId
 *
 * Delete a role and take it off every member that held it, so nobody keeps
 * a dangling role id that the client cannot render.
 */
export const deleteServerRole = ah(async (req, res) => {
  const server = await findServer(req.params.id);
  if (!server) {
    return res
      .status(404)
      .json({ error: "Сервер не найден", code: "not_found" });
  }

  const roleId = req.params.roleId;
  const roles = server.roles && !Array.isArray(server.roles) ? server.roles : {};
  if (!roles[roleId]) {
    return res
      .status(404)
      .json({ error: "Роль не найдена", code: "not_found" });
  }

  await col("servers").updateOne({ _id: server._id }, { $unset: { [`roles.${roleId}`]: "" } });
  const holders = await col("server_members")
    .find({ "_id.server": server._id, roles: roleId })
    .project({ "_id.user": 1 })
    .toArray();
  // `$pull` keeps every other role: members with nothing left lose the
  // field entirely, the same shape a member without roles has.
  await col("server_members").updateMany(
    { "_id.server": server._id, roles: roleId },
    { $pull: { roles: roleId } },
  );
  await col("server_members").updateMany(
    { "_id.server": server._id, roles: { $size: 0 } },
    { $unset: { roles: "" } },
  );

  await publishEvent(server._id, {
    type: "RoleDelete",
    id: server._id,
    role_id: roleId,
  });
  for (const holder of holders) {
    await publishEvent(server._id, {
      type: "MemberUpdate",
      id: server._id,
      user: holder._id.user,
      data: {},
      clear: [],
    });
  }

  res.json({ ok: true, members: holders.length });
});

/** Autumn (file storage) lives next to us on the compose network. */
function mediaBase() {
  return (process.env.MEDIA_URL || "http://autumn:14704").replace(/\/+$/, "");
}

/**
 * Store one object on the media server: `POST /<bucket>` hands out an id,
 * `PUT /<bucket>/<id>` writes the bytes under it — the same two calls the
 * client makes when it uploads an avatar.
 */
function putMediaObject(bucket, id, data) {
  return new Promise((resolve, reject) => {
    const base = mediaBase();
    const target = new URL(`${base}/${bucket}/${encodeURIComponent(id)}`);
    const client = target.protocol === "https:" ? https : http;
    const req = client.request(
      target,
      {
        method: "PUT",
        headers: {
          "Content-Type": "image/jpeg",
          "Content-Length": data.length,
        },
      },
      (res) => {
        res.resume();
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`media responded ${res.statusCode}`));
        }
      },
    );
    req.setTimeout(10000, () => req.destroy(new Error("media timeout")));
    req.on("error", reject);
    req.end(data);
  });
}

/**
 * POST /api/servers/:id/members/:userId/avatar
 *
 * Set the picture this member shows inside this server. The body is the
 * raw image: it is cropped to a centred square and re-encoded as a small
 * JPEG before it is stored as an ordinary attachment (the same shape a
 * client upload makes), so the account picture is untouched and every
 * client renders it without asking us for anything.
 */
export const uploadMemberAvatar = ah(async (req, res) => {
  const server = await findServer(req.params.id);
  if (!server) {
    return res
      .status(404)
      .json({ error: "Сервер не найден", code: "not_found" });
  }

  const member = await col("server_members").findOne({
    _id: { server: server._id, user: req.params.userId },
  });
  if (!member) {
    return res
      .status(404)
      .json({ error: "Участник не найден", code: "not_found" });
  }

  const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
  if (!raw.length) {
    return res.status(400).json({ error: "Пустой файл", code: "empty_file" });
  }
  if (raw.length > 12 * 1024 * 1024) {
    return res
      .status(413)
      .json({ error: "Файл больше 12 МБ", code: "file_too_large" });
  }

  let image;
  try {
    image = decodeImage(raw);
  } catch {
    return res.status(400).json({
      error: "Эту картинку не прочитать. Подойдёт JPEG или PNG.",
      code: "invalid_image",
    });
  }

  let jpeg;
  try {
    jpeg = encodeSquareJpeg(image, 256);
  } catch {
    return res.status(400).json({
      error: "Картинку не удалось подготовить, попробуйте другую.",
      code: "invalid_image",
    });
  }

  const id = ulid();
  const now = new Date().toISOString();
  const attachment = {
    _id: id,
    tag: "avatars",
    filename: `${id}.jpg`,
    hash: crypto.createHash("sha256").update(jpeg).digest("hex"),
    uploaded_at: now,
    uploader_id: req.admin?.user?._id ?? null,
    metadata: { type: "Image", width: 256, height: 256, animated: false },
    content_type: "image/jpeg",
    size: jpeg.length,
  };

  // Best effort: the media object is what clients fetch, the attachment
  // record is what they read. The picture is still set when the object
  // store is unreachable, and text-only members do not break.
  try {
    await putMediaObject("avatars", attachment.filename, jpeg);
  } catch (err) {
    console.warn(`[media] avatar upload failed: ${err.message}`);
    return res.status(502).json({
      error: "Хранилище файлов недоступно, попробуйте позже",
      code: "media_unavailable",
    });
  }

  await col("attachments").insertOne(attachment);
  await col("server_members").updateOne(
    { _id: member._id },
    { $set: { avatar: attachment } },
  );
  await publishEvent(server._id, {
    type: "MemberUpdate",
    id: server._id,
    user: req.params.userId,
    data: { avatar: attachment },
    clear: [],
  });

  res.json({ ok: true, attachment });
});

/**
 * GET /api/servers/:id/members/:userId/avatar
 *
 * Proxies the user's avatar from the media server (autumn). The panel is
 * mounted under a path prefix and served from its own origin, so the file
 * server cannot be reached by the browser directly — and keeping the
 * request server-side also keeps the media host out of the CSP.
 */
export const getMemberAvatar = ah(async (req, res) => {
  const server = await findServer(req.params.id);
  if (!server) {
    return res
      .status(404)
      .json({ error: "Сервер не найден", code: "not_found" });
  }

  const member = await col("server_members").findOne({
    _id: { server: server._id, user: req.params.userId },
  });
  if (!member) {
    return res
      .status(404)
      .json({ error: "Участник не найден", code: "not_found" });
  }

  // The per-server avatar wins, the account avatar is the fallback.
  let id = member.avatar?._id || null;
  if (!id) {
    const user = await col("users").findOne({ _id: req.params.userId });
    id = user?.avatar?._id || null;
  }
  if (!id) return res.status(404).end();

  const target = new URL(`${mediaBase()}/avatars/${encodeURIComponent(id)}`);
  const client = target.protocol === "https:" ? https : http;

  const upstream = client.get(target, (proxied) => {
    if (proxied.statusCode !== 200) {
      proxied.resume();
      return res.status(404).end();
    }
    res.set({
      "Content-Type": proxied.headers["content-type"] || "image/webp",
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    });
    proxied.pipe(res);
  });
  upstream.setTimeout(5000, () => upstream.destroy());
  upstream.on("error", () => {
    if (!res.headersSent) res.status(404).end();
    else res.end();
  });
});
