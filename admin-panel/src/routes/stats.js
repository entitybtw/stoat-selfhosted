import { col } from "../db.js";
import { ah } from "../util.js";

export const getStats = ah(async (req, res) => {
  const collections = [
    "users",
    "accounts",
    "servers",
    "channels",
    "messages",
    "sessions",
  ];

  const counts = await Promise.all(
    collections.map((name) => col(name).estimatedDocumentCount()),
  );

  res.json({
    users: counts[0],
    accounts: counts[1],
    servers: counts[2],
    channels: counts[3],
    messages: counts[4],
    sessions: counts[5],
  });
});
