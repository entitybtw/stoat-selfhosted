import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";

import { config } from "./config.js";
import { connectDb } from "./db.js";
import {
  handleLogin,
  handleLogout,
  requireAuth,
  publicUser,
} from "./auth.js";
import { ah } from "./util.js";
import { getStats } from "./routes/stats.js";
import {
  listUsers,
  getUser,
  setUserPassword,
  setUserPrivileged,
  setUserDisabled,
  setUserProfile,
  setUserEmail,
} from "./routes/users.js";
import { listServers, renameServer, deleteServer } from "./routes/servers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

const app = express();
app.set("trust proxy", true);
app.disable("x-powered-by");

// security headers
app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "same-origin",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'",
  });
  next();
});

app.use(express.json({ limit: "64kb" }));

// naive CSRF guard: same-origin mutations only (cookie is SameSite=Lax as well)
app.use((req, res, next) => {
  if (!["POST", "PATCH", "PUT", "DELETE"].includes(req.method)) return next();
  if (!req.path.startsWith("/api")) return next();
  const origin = req.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== req.get("host")) {
        return res.status(403).json({
          error: "Запрос с другого origin отклонён",
          code: "bad_origin",
        });
      }
    } catch {
      return res
        .status(403)
        .json({ error: "Некорректный origin", code: "bad_origin" });
    }
  }
  next();
});

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.post("/api/login", ah(handleLogin));
app.post("/api/logout", ah(handleLogout));
app.get("/api/me", requireAuth, (req, res) => res.json({ user: publicUser(req.admin.user) }));

app.get("/api/stats", requireAuth, getStats);

app.get("/api/users", requireAuth, listUsers);
app.get("/api/users/:id", requireAuth, getUser);
app.post("/api/users/:id/profile", requireAuth, setUserProfile);
app.post("/api/users/:id/email", requireAuth, setUserEmail);
app.post("/api/users/:id/password", requireAuth, setUserPassword);
app.post("/api/users/:id/privileged", requireAuth, setUserPrivileged);
app.post("/api/users/:id/disabled", requireAuth, setUserDisabled);

app.get("/api/servers", requireAuth, listServers);
app.post("/api/servers/:id/rename", requireAuth, renameServer);
app.delete("/api/servers/:id", requireAuth, deleteServer);

app.use(express.static(publicDir, { index: "index.html" }));
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "Не найдено", code: "not_found" });
  }
  res.sendFile(path.join(publicDir, "index.html"));
});

// error handler
app.use((err, req, res, next) => {
  console.error(`[error] ${req.method} ${req.path}:`, err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: "Внутренняя ошибка", code: "internal" });
});

await connectDb();
app.listen(config.port, () => {
  console.log(`[http] stoat admin panel listening on :${config.port}`);
  console.log(`[http] expected mount path: ${config.basePath}/`);
});
