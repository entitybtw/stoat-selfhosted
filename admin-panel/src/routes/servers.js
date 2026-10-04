import { col } from "../db.js";
import { publishEvent, cleanupChannelVoice, cleanupServerUserState } from "../redis.js";
import { escapeRegex, parsePaging, ulidTimestamp, ah } from "../util.js";

export const listServers = ah(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query);
  const q = String(req.query.q || "").trim();

  const filter = {};
  if (q) {
    if (/^[0-9A-HJKMNP-TV-Z]{26}$/.test(q)) {
      filter._id = q.toUpperCase();
    } else {
      filter.name = new RegExp(escapeRegex(q), "i");
    }
  }

  const [total, servers] = await Promise.all([
    col("servers").countDocuments(filter),
    col("servers")
      .find(filter)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
  ]);

  const ids = servers.map((server) => server._id);
  const ownerIds = [...new Set(servers.map((server) => server.owner))];

  const [channelCounts, memberCounts, owners] = await Promise.all([
    col("channels")
      .aggregate([
        { $match: { server: { $in: ids } } },
        { $group: { _id: "$server", count: { $sum: 1 } } },
      ])
      .toArray(),
    col("server_members")
      .aggregate([
        { $match: { "_id.server": { $in: ids } } },
        { $group: { _id: "$_id.server", count: { $sum: 1 } } },
      ])
      .toArray(),
    col("users")
      .find({ _id: { $in: ownerIds } })
      .project({ username: 1, discriminator: 1 })
      .toArray(),
  ]);

  const channelsBy = new Map(channelCounts.map((entry) => [entry._id, entry.count]));
  const membersBy = new Map(memberCounts.map((entry) => [entry._id, entry.count]));
  const ownersBy = new Map(
    owners.map((owner) => [owner._id, `${owner.username}#${owner.discriminator}`]),
  );

  res.json({
    total,
    page,
    limit,
    items: servers.map((server) => ({
      id: server._id,
      name: server.name,
      owner: server.owner,
      ownerTag: ownersBy.get(server.owner) || null,
      channels: channelsBy.get(server._id) || 0,
      members: membersBy.get(server._id) || 0,
      createdAt: ulidTimestamp(server._id),
    })),
  });
});

/**
 * Delete a server with the same cascade as the backend
 * (MongoDb::delete_associated_server_objects + Server::delete):
 * messages/attachments → detach emojis → channels → invites/unreads/webhooks →
 * members/bans → attachment records → audit logs → server document,
 * then clean Redis voice state and publish EventV1::ServerDelete.
 */
export const deleteServer = ah(async (req, res) => {
  const id = req.params.id;
  const server = await col("servers").findOne({ _id: id });
  if (!server) return res.status(404).json({ error: "Сервер не найден" });

  const [channelDocs, memberDocs] = await Promise.all([
    col("channels").find({ server: id }).project({ _id: 1 }).toArray(),
    col("server_members")
      .find({ "_id.server": id })
      .project({ "_id.user": 1 })
      .toArray(),
  ]);
  const channelIds = channelDocs.map((channel) => channel._id);
  const memberIds = memberDocs.map((member) => member._id.user);

  // mark attachments of removed messages as deleted, then drop the messages
  const messagesWithAttachments = await col("messages")
    .find({ channel: { $in: channelIds }, attachments: { $exists: true } })
    .project({ _id: 1 })
    .toArray();
  if (messagesWithAttachments.length > 0) {
    await col("attachments").updateMany(
      { message_id: { $in: messagesWithAttachments.map((message) => message._id) } },
      { $set: { deleted: true } },
    );
  }
  const messagesDeleted = (
    await col("messages").deleteMany({ channel: { $in: channelIds } })
  ).deletedCount;

  // detach emojis that belong to this server
  await col("emojis").updateMany(
    { "parent.id": id },
    { $set: { parent: { type: "Detached" } } },
  );

  // channels and their associated objects
  const channelsDeleted = (
    await col("channels").deleteMany({ server: id })
  ).deletedCount;
  await col("channel_invites").deleteMany({ channel: { $in: channelIds } });
  await col("channel_unreads").deleteMany({ "_id.channel": { $in: channelIds } });
  await col("webhooks").deleteMany({ channel: { $in: channelIds } });

  // members and bans
  const membersDeleted = (
    await col("server_members").deleteMany({ "_id.server": id })
  ).deletedCount;
  await col("server_bans").deleteMany({ "_id.server": id });

  // attachment records used by this server (icon/banner) and audit trail
  await col("attachments").updateMany(
    { "used_for.id": id },
    { $set: { deleted: true } },
  );
  await col("audit_logs").deleteMany({ server: id });

  // finally remove the server document
  await col("servers").deleteOne({ _id: id });

  // best-effort voice state cleanup + live event for connected members
  await Promise.all([
    cleanupChannelVoice(channelIds),
    cleanupServerUserState(id, memberIds),
    publishEvent(id, { type: "ServerDelete", id }),
  ]);

  res.json({
    ok: true,
    deleted: {
      channels: channelsDeleted,
      messages: messagesDeleted,
      members: membersDeleted,
    },
  });
});
