import Redis from "ioredis";
import { config } from "./config.js";

let redis;

function getRedis() {
  if (!redis) {
    redis = new Redis(config.redisUri, {
      maxRetriesPerRequest: 2,
      retryStrategy: (times) => Math.min(times * 500, 5000),
    });
    // a missing Redis must not take the process down
    redis.on("error", (err) => {
      console.warn(`[redis] ${err.message}`);
    });
    redis.on("connect", () => console.log(`[redis] connected to ${config.redisUri}`));
  }
  return redis;
}

/**
 * Publish an EventV1 payload to the backend's Redis pub/sub channel.
 * Mirrors redis-kiss JSON publishing (REDIS_PAYLOAD_TYPE defaults to json).
 */
export async function publishEvent(channel, payload) {
  try {
    await getRedis().publish(channel, JSON.stringify(payload));
  } catch (err) {
    console.warn(`[redis] publish to ${channel} failed: ${err.message}`);
  }
}

/**
 * Best-effort cleanup of voice state (Redis) for deleted server channels.
 * Keys follow crates/core/database/src/voice/mod.rs:
 *   node:{channel}                 — hosting node
 *   vc_members:{channel}           — users currently in the channel
 *   vc:{user}                      — channels the user is in
 *   moved_from/moved_to:{user}:{channel}
 */
export async function cleanupChannelVoice(channelIds) {
  try {
    const r = getRedis();
    for (const channel of channelIds) {
      const members = await r.smembers(`vc_members:${channel}`);
      for (const user of members) {
        await r.srem(`vc:${user}`, channel);
        await r.del(
          `moved_from:${user}:${channel}`,
          `moved_to:${user}:${channel}`,
        );
      }
      await r.del(`vc_members:${channel}`, `node:${channel}`);
    }
  } catch (err) {
    console.warn(`[redis] voice cleanup failed: ${err.message}`);
  }
}

/**
 * Best-effort cleanup of per-user "current channel in server" state keys:
 *   {user}:{server}, joined_at/is_publishing/is_receiving/screensharing/camera:{user}:{server}
 */
export async function cleanupServerUserState(serverId, userIds) {
  try {
    const r = getRedis();
    for (const user of userIds) {
      await r.del(
        `${user}:${serverId}`,
        `joined_at:${user}:${serverId}`,
        `is_publishing:${user}:${serverId}`,
        `is_receiving:${user}:${serverId}`,
        `screensharing:${user}:${serverId}`,
        `camera:${user}:${serverId}`,
      );
    }
  } catch (err) {
    console.warn(`[redis] user voice cleanup failed: ${err.message}`);
  }
}
