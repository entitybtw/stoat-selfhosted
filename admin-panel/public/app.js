"use strict";

/* Base path for API calls: works whether the panel is served at
   /admin-panel/, /admin-panel or even directly at /. */
const BASE = location.pathname.replace(/\/+$/, "");
const url = (path) => `${BASE}/${path}`;

const state = {
  me: null,
  view: "stats",
  users: { q: "", page: 1 },
  servers: { q: "", page: 1 },
};

const app = document.getElementById("app");

// ---------- helpers ----------

function esc(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );
}

function fmtDate(ms) {
  if (!ms) return "—";
  return new Date(ms).toLocaleString("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function toast(message, isError = false) {
  const node = document.createElement("div");
  node.className = `toast${isError ? " err" : ""}`;
  node.textContent = message;
  document.getElementById("toasts").appendChild(node);
  setTimeout(() => node.remove(), 4200);
}

async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(url(path), {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (res.status === 401) {
    state.me = null;
    render();
  }
  if (!res.ok) throw new Error((data && data.error) || `HTTP ${res.status}`);
  return data;
}

function closeOverlays() {
  document.querySelectorAll(".overlay").forEach((node) => node.remove());
}

// ---------- render ----------

function render() {
  closeOverlays();
  if (!state.me) {
    renderLogin();
    return;
  }
  renderShell();
}

function renderLogin() {
  app.innerHTML = `
    <div class="login-wrap">
      <form class="login-card" id="login-form">
        <div class="brand-row"><span class="brand-dot"></span> Stoat</div>
        <h1>Админ-панель</h1>
        <div class="subtitle">Войдите аккаунтом с правами администратора</div>
        <div class="field">
          <label>Логин (email или username)</label>
          <input type="text" id="f-login" autocomplete="username" required />
        </div>
        <div class="field">
          <label>Пароль</label>
          <input type="password" id="f-password" autocomplete="current-password" required />
        </div>
        <div class="hint" id="f-hint"></div>
        <button class="btn primary" id="f-submit" type="submit">Войти</button>
      </form>
    </div>`;

  document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const hint = document.getElementById("f-hint");
    const button = document.getElementById("f-submit");
    hint.textContent = "";
    button.disabled = true;
    button.textContent = "Вход…";
    try {
      const data = await api("api/login", {
        method: "POST",
        body: {
          login: document.getElementById("f-login").value,
          password: document.getElementById("f-password").value,
        },
      });
      state.me = data.user;
      render();
    } catch (err) {
      hint.textContent = err.message;
      button.disabled = false;
      button.textContent = "Войти";
    }
  });

  document.getElementById("f-login").focus();
}

function renderShell() {
  app.innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand"><span class="brand-dot"></span> Stoat <span class="brand-sub">админ</span></div>
        <nav>
          <button class="nav-item ${state.view === "stats" ? "active" : ""}" data-view="stats">Обзор</button>
          <button class="nav-item ${state.view === "users" ? "active" : ""}" data-view="users">Пользователи</button>
          <button class="nav-item ${state.view === "servers" ? "active" : ""}" data-view="servers">Серверы</button>
        </nav>
        <div class="sidebar-footer">
          <span class="who" title="${esc(state.me.username)}#${esc(state.me.discriminator)}">
            ${esc(state.me.username)}<span class="dim">#${esc(state.me.discriminator)}</span>
          </span>
          <button class="btn flat small" id="logout">Выйти</button>
        </div>
      </aside>
      <main class="main" id="main"></main>
    </div>`;

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      render();
    });
  });

  document.getElementById("logout").addEventListener("click", async () => {
    try {
      await api("api/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    state.me = null;
    render();
  });

  loadView();
}

function loadView() {
  if (state.view === "stats") renderStats();
  else if (state.view === "users") renderUsers();
  else if (state.view === "servers") renderServers();
}

// ---------- stats ----------

async function renderStats() {
  const main = document.getElementById("main");
  main.innerHTML = `
    <h1>Обзор</h1>
    <div class="subtitle">Состояние базы данных инстанса</div>
    <div class="cards" id="stats-cards">
      ${Array.from({ length: 6 })
        .map(() => `<div class="card"><div class="num">…</div><div class="label">загрузка</div></div>`)
        .join("")}
    </div>`;

  try {
    const stats = await api("api/stats");
    const cards = [
      ["users", "Пользователи"],
      ["servers", "Серверы"],
      ["channels", "Каналы"],
      ["messages", "Сообщения"],
      ["sessions", "Сессии"],
      ["accounts", "Аккаунты"],
    ];
    document.getElementById("stats-cards").innerHTML = cards
      .map(
        ([key, label]) => `
        <div class="card">
          <div class="num">${Number(stats[key] || 0).toLocaleString("ru-RU")}</div>
          <div class="label">${label}</div>
        </div>`,
      )
      .join("");
  } catch (err) {
    toast(err.message, true);
  }
}

// ---------- users ----------

function renderUsers() {
  const main = document.getElementById("main");
  main.innerHTML = `
    <h1>Пользователи</h1>
    <div class="subtitle" id="users-total">Загрузка…</div>
    <div class="toolbar">
      <input class="search" id="users-q" type="text"
        placeholder="Email, username, username#дискриминатор или ID"
        value="${esc(state.users.q)}" />
      <button class="btn tonal" id="users-go">Найти</button>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Пользователь</th><th>Email</th><th>Роль</th><th>Статус</th>
            <th>Сессии</th><th>Создан</th>
          </tr>
        </thead>
        <tbody id="users-body">
          <tr><td colspan="6" class="empty">Загрузка…</td></tr>
        </tbody>
      </table>
    </div>
    <div class="pager" id="users-pager"></div>`;

  const input = document.getElementById("users-q");
  let timer;
  const submit = () => {
    clearTimeout(timer);
    state.users.q = input.value;
    state.users.page = 1;
    loadUsers();
  };
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(submit, 300);
  });
  document.getElementById("users-go").addEventListener("click", submit);

  loadUsers();
}

async function loadUsers() {
  const body = document.getElementById("users-body");
  if (!body) return;
  try {
    const data = await api(
      `api/users?q=${encodeURIComponent(state.users.q)}&page=${state.users.page}`,
    );
    document.getElementById("users-total").textContent =
      `${data.total.toLocaleString("ru-RU")} всего`;

    body.innerHTML = data.items.length
      ? data.items
          .map(
            (user) => `
        <tr data-id="${user.id}">
          <td>
            <div class="strong">${esc(user.username)}<span class="dim">#${esc(user.discriminator)}</span></div>
            <div class="dim mono">${esc(user.id)}</div>
          </td>
          <td>${esc(user.email || "—")}</td>
          <td>${user.privileged ? '<span class="badge admin">Админ</span>' : '<span class="dim">—</span>'}</td>
          <td>${user.disabled ? '<span class="badge off">Отключён</span>' : '<span class="badge ok">Активен</span>'}</td>
          <td>${user.sessions}</td>
          <td>${fmtDate(user.createdAt)}</td>
        </tr>`,
          )
          .join("")
      : '<tr><td colspan="6" class="empty">Ничего не найдено</td></tr>';

    body.querySelectorAll("tr[data-id]").forEach((row) => {
      row.addEventListener("click", () => openUser(row.dataset.id));
    });

    renderPager(
      document.getElementById("users-pager"),
      data,
      (page) => {
        state.users.page = page;
        loadUsers();
      },
    );
  } catch (err) {
    toast(err.message, true);
    body.innerHTML = '<tr><td colspan="6" class="empty">Ошибка загрузки</td></tr>';
  }
}

function renderPager(element, data, go) {
  const pages = Math.max(1, Math.ceil(data.total / data.limit));
  element.innerHTML = `
    <button class="btn tonal small" id="page-prev" ${data.page <= 1 ? "disabled" : ""}>← Назад</button>
    <span>Стр. ${data.page} из ${pages}</span>
    <button class="btn tonal small" id="page-next" ${data.page >= pages ? "disabled" : ""}>Вперёд →</button>`;
  element.querySelector("#page-prev").addEventListener("click", () => go(data.page - 1));
  element.querySelector("#page-next").addEventListener("click", () => go(data.page + 1));
}

async function openUser(id) {
  let user;
  try {
    user = await api(`api/users/${id}`);
  } catch (err) {
    toast(err.message, true);
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `
    <div class="modal">
      <h2>${esc(user.username)}<span class="dim">#${esc(user.discriminator)}</span></h2>
      <div class="kv">
        <dt>ID</dt><dd class="mono">${esc(user.id)}</dd>
        <dt>Email</dt><dd>${esc(user.email || "—")}${
          user.email && !user.verified
            ? ' <span class="badge gray">не подтверждён</span>'
            : ""
        }</dd>
        <dt>Роль</dt><dd>${
          user.privileged
            ? '<span class="badge admin">Админ</span>'
            : "Пользователь"
        }</dd>
        <dt>Статус</dt><dd>${
          user.disabled
            ? '<span class="badge off">Аккаунт отключён</span>'
            : '<span class="badge ok">Активен</span>'
        } ${user.mfaEnabled ? '<span class="badge gray">2FA</span>' : ""}</dd>
        <dt>Сессий</dt><dd>${user.sessions}</dd>
        <dt>Создан</dt><dd>${fmtDate(user.createdAt)}</dd>
      </div>

      <div class="field">
        <label>Новый пароль (мин. 8 символов) — все сессии будут завершены</label>
        <div class="row">
          <input type="text" id="m-password" placeholder="Новый пароль" autocomplete="new-password" />
          <button class="btn primary" id="m-setpw">Сменить</button>
        </div>
        <div class="hint" id="m-hint"></div>
      </div>

      <div class="modal-actions">
        <button class="btn tonal" id="m-priv">${
          user.privileged ? "Снять админа" : "Сделать админом"
        }</button>
        <button class="btn ${user.disabled ? "tonal" : "danger"}" id="m-dis">${
          user.disabled ? "Включить аккаунт" : "Отключить аккаунт"
        }</button>
        <button class="btn flat" id="m-close">Закрыть</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  overlay.querySelector("#m-close").addEventListener("click", close);

  overlay.querySelector("#m-setpw").addEventListener("click", async () => {
    const password = overlay.querySelector("#m-password").value;
    const hint = overlay.querySelector("#m-hint");
    hint.textContent = "";
    if (password.length < 8) {
      hint.textContent = "Пароль короче 8 символов";
      return;
    }
    if (
      !confirm(
        `Сменить пароль для ${user.username}#${user.discriminator}?\nВсе сессии пользователя будут завершены.`,
      )
    ) {
      return;
    }
    try {
      const result = await api(`api/users/${user.id}/password`, {
        method: "POST",
        body: { password },
      });
      toast(`Пароль изменён, сессий завершено: ${result.sessionsDeleted}`);
      close();
      loadUsers();
    } catch (err) {
      hint.textContent = err.message;
    }
  });

  overlay.querySelector("#m-priv").addEventListener("click", async () => {
    const next = !user.privileged;
    const action = next ? "дать права администратора" : "снять права администратора";
    if (!confirm(`${action.charAt(0).toUpperCase()}${action.slice(1)} у ${user.username}#${user.discriminator}?`)) {
      return;
    }
    try {
      await api(`api/users/${user.id}/privileged`, {
        method: "POST",
        body: { privileged: next },
      });
      toast(next ? "Права администратора выданы" : "Права администратора сняты");
      close();
      loadUsers();
    } catch (err) {
      toast(err.message, true);
    }
  });

  overlay.querySelector("#m-dis").addEventListener("click", async () => {
    const next = !user.disabled;
    if (
      !confirm(
        `${next ? "Отключить" : "Включить"} аккаунт ${user.username}#${user.discriminator}?${
          next ? "\nВсе сессии будут завершены." : ""
        }`,
      )
    ) {
      return;
    }
    try {
      const result = await api(`api/users/${user.id}/disabled`, {
        method: "POST",
        body: { disabled: next },
      });
      toast(next
        ? `Аккаунт отключён, сессий завершено: ${result.sessionsDeleted}`
        : "Аккаунт включён");
      close();
      loadUsers();
    } catch (err) {
      toast(err.message, true);
    }
  });
}

// ---------- servers ----------

function renderServers() {
  const main = document.getElementById("main");
  main.innerHTML = `
    <h1>Серверы</h1>
    <div class="subtitle" id="servers-total">Загрузка…</div>
    <div class="toolbar">
      <input class="search" id="servers-q" type="text"
        placeholder="Название или ID сервера" value="${esc(state.servers.q)}" />
      <button class="btn tonal" id="servers-go">Найти</button>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Сервер</th><th>Владелец</th><th>Каналы</th><th>Участники</th>
            <th>Создан</th><th></th>
          </tr>
        </thead>
        <tbody id="servers-body">
          <tr><td colspan="6" class="empty">Загрузка…</td></tr>
        </tbody>
      </table>
    </div>
    <div class="pager" id="servers-pager"></div>`;

  const input = document.getElementById("servers-q");
  let timer;
  const submit = () => {
    clearTimeout(timer);
    state.servers.q = input.value;
    state.servers.page = 1;
    loadServers();
  };
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(submit, 300);
  });
  document.getElementById("servers-go").addEventListener("click", submit);

  loadServers();
}

async function loadServers() {
  const body = document.getElementById("servers-body");
  if (!body) return;
  try {
    const data = await api(
      `api/servers?q=${encodeURIComponent(state.servers.q)}&page=${state.servers.page}`,
    );
    document.getElementById("servers-total").textContent =
      `${data.total.toLocaleString("ru-RU")} всего`;

    body.innerHTML = data.items.length
      ? data.items
          .map(
            (server) => `
        <tr data-id="${server.id}">
          <td>
            <div class="strong">${esc(server.name)}</div>
            <div class="dim mono">${esc(server.id)}</div>
          </td>
          <td>${esc(server.ownerTag || server.owner)}</td>
          <td>${server.channels}</td>
          <td>${server.members}</td>
          <td>${fmtDate(server.createdAt)}</td>
          <td><button class="btn danger small" data-delete="${server.id}">Удалить</button></td>
        </tr>`,
          )
          .join("")
      : '<tr><td colspan="6" class="empty">Ничего не найдено</td></tr>';

    body.querySelectorAll("tr[data-id]").forEach((row) => {
      row.addEventListener("click", (event) => {
        if (event.target.closest("[data-delete]")) return;
        const server = data.items.find((item) => item.id === row.dataset.id);
        openServer(server);
      });
    });
    body.querySelectorAll("[data-delete]").forEach((button) => {
      button.addEventListener("click", () => {
        const server = data.items.find((item) => item.id === button.dataset.delete);
        openServer(server, true);
      });
    });

    renderPager(
      document.getElementById("servers-pager"),
      data,
      (page) => {
        state.servers.page = page;
        loadServers();
      },
    );
  } catch (err) {
    toast(err.message, true);
    body.innerHTML = '<tr><td colspan="6" class="empty">Ошибка загрузки</td></tr>';
  }
}

function openServer(server, deleteMode = false) {
  if (!server) return;

  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `
    <div class="modal">
      <h2>${esc(server.name)}</h2>
      <div class="kv">
        <dt>ID</dt><dd class="mono">${esc(server.id)}</dd>
        <dt>Владелец</dt><dd>${esc(server.ownerTag || server.owner)}</dd>
        <dt>Каналов</dt><dd>${server.channels}</dd>
        <dt>Участников</dt><dd>${server.members}</dd>
        <dt>Создан</dt><dd>${fmtDate(server.createdAt)}</dd>
      </div>

      ${
        deleteMode
          ? `
      <div class="field">
        <label>Удаление сервера необратимо: каналы, сообщения, участники и роли будут удалены.</label>
        <div class="row">
          <input type="text" id="m-confirm" placeholder="Введите название сервера для подтверждения" />
          <button class="btn danger" id="m-delete" disabled>Удалить</button>
        </div>
      </div>`
          : ""
      }

      <div class="modal-actions">
        <button class="btn danger" id="m-del-open">${deleteMode ? "Закрыть" : "Удалить сервер…"}</button>
        <button class="btn flat" id="m-close">Закрыть</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  overlay.querySelector("#m-close").addEventListener("click", close);

  const delOpen = overlay.querySelector("#m-del-open");
  delOpen.addEventListener("click", () => {
    if (deleteMode) {
      close();
    } else {
      close();
      openServer(server, true);
    }
  });

  if (deleteMode) {
    const confirmInput = overlay.querySelector("#m-confirm");
    const deleteButton = overlay.querySelector("#m-delete");
    confirmInput.addEventListener("input", () => {
      deleteButton.disabled = confirmInput.value !== server.name;
    });
    deleteButton.addEventListener("click", async () => {
      deleteButton.disabled = true;
      deleteButton.textContent = "Удаление…";
      try {
        const result = await api(`api/servers/${server.id}`, { method: "DELETE" });
        toast(
          `Сервер удалён: каналов ${result.deleted.channels}, сообщений ${result.deleted.messages}, участников ${result.deleted.members}`,
        );
        close();
        loadServers();
      } catch (err) {
        toast(err.message, true);
        deleteButton.disabled = false;
        deleteButton.textContent = "Удалить";
      }
    });
    confirmInput.focus();
  }
}

// ---------- boot ----------

async function boot() {
  try {
    const data = await api("api/me");
    state.me = data.user;
  } catch {
    state.me = null;
  }
  render();
}

boot();
