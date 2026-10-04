const rawPath = process.env.ADMIN_PANEL_PATH || "/admin-panel";

export const config = {
  port: Number(process.env.PORT) || 8080,

  // MongoDB (the Stoat backend uses database name "revolt" by default)
  mongoUri: process.env.MONGODB_URI || "mongodb://database:27017",
  mongoDb: process.env.MONGODB_DB || "revolt",

  // Redis/Valkey used for voice state and event fan-out
  redisUri: process.env.REDIS_URI || "redis://redis:6379",

  // External mount path (Caddy strips this prefix before proxying here).
  // Used for the session cookie path so it applies to the whole panel.
  basePath:
    rawPath.length > 1 && rawPath.endsWith("/") ? rawPath.slice(0, -1) : rawPath,

  // Panel session lifetime
  sessionTtlMs: (Number(process.env.SESSION_TTL_DAYS) || 7) * 86_400_000,

  // Login brute-force protection (per IP)
  maxLoginAttempts: Number(process.env.MAX_LOGIN_ATTEMPTS) || 10,
  loginWindowMs: (Number(process.env.LOGIN_WINDOW_MINUTES) || 15) * 60_000,
};
