"use strict";

/* Base path for API calls: works whether the panel is served at
   /admin-panel/, /admin-panel or even directly at /. */
const BASE = location.pathname.replace(/\/+$/, "");
const url = (path) => `${BASE}/${path}`;

/* ---------- i18n ------------------------------------------------------- */

const I18N = {
  ru: {
    doc_title: "Stoat — Админ-панель",
    app_title: "Админ-панель",
    loading: "Загрузка…",
    empty: "Ничего не найдено",
    load_error: "Не удалось загрузить",
    total: "{n} всего",
    prev: "← Назад",
    next: "Вперёд →",
    page: "Стр. {p} из {n}",
    find: "Найти",
    close: "Закрыть",
    save: "Сохранить",
    copied: "Скопировано",

    login_title: "Админ-панель",
    login_subtitle: "Войдите аккаунтом с правами администратора",
    login_field: "Логин (email или username)",
    password_field: "Пароль",
    login: "Войти",
    login_pending: "Вход…",

    nav_overview: "Обзор",
    nav_users: "Пользователи",
    nav_servers: "Серверы",
    logout: "Выйти",

    stats_title: "Обзор",
    stats_subtitle: "Состояние базы данных инстанса",
    stat_users: "Пользователи",
    stat_servers: "Серверы",
    stat_channels: "Каналы",
    stat_messages: "Сообщения",
    stat_sessions: "Сессии",
    stat_accounts: "Аккаунты",
    stat_loading: "загрузка",

    users_title: "Пользователи",
    users_subtitle: "Поиск и редактирование учётных записей",
    users_ph: "Email, username, username#дискриминатор или ID",
    th_user: "Пользователь",
    th_email: "Email",
    th_role: "Роль",
    th_status: "Статус",
    th_sessions: "Сессии",
    th_created: "Создан",
    badge_admin: "Админ",
    badge_disabled: "Отключён",
    badge_active: "Активен",
    role_user: "Пользователь",

    servers_title: "Серверы",
    servers_subtitle: "Просмотр, переименование и удаление серверов",
    servers_ph: "Название или ID сервера",
    th_server: "Сервер",
    th_owner: "Владелец",
    th_channels: "Каналы",
    th_members: "Участники",
    delete: "Удалить",

    u_data: "Текущие данные",
    u_profile: "Профиль",
    u_account: "Учётная запись",
    u_access: "Доступ",
    f_username: "Имя пользователя",
    f_discriminator: "Дискриминатор",
    f_display_name: "Отображаемое имя",
    f_pronouns: "Местоимения",
    f_email: "Email",
    f_password_new: "Новый пароль (мин. 8 символов) — все сессии будут завершены",
    f_password_ph: "Новый пароль",
    auto: "Авто",
    auto_hint: "Пусто — при сохранении будет подобран новый случайный дискриминатор",
    change: "Сменить",
    save_profile: "Сохранить профиль",
    kv_email_norm: "Нормализованный email",
    kv_verification: "Верификация почты",
    kv_password_hash: "Хеш пароля (argon2)",
    hash_note:
      "Пароль в открытом виде не хранится, есть только этот хеш argon2. Нажмите, чтобы скопировать.",
    kv_mfa: "Двухфакторная аутентификация",
    kv_badges: "Бейджи",
    kv_flags: "Флаги",
    kv_suspended: "Блокировка до",
    verified: "Подтверждён",
    unverified: "Не подтверждён",
    mfa_on: "включена",
    mfa_off: "выключена",
    priv_grant: "Сделать админом",
    priv_revoke: "Снять админа",
    enable: "Включить аккаунт",
    disable: "Отключить аккаунт",
    confirm_password:
      "Сменить пароль для {u}?\nВсе сессии пользователя будут завершены.",
    confirm_priv_on: "Выдать права администратора {u}?",
    confirm_priv_off: "Снять права администратора у {u}?",
    confirm_disable:
      "Отключить аккаунт {u}?\nВсе сессии будут завершены.",
    confirm_enable: "Включить аккаунт {u}?",
    t_password_changed: "Пароль изменён, сессий завершено: {n}",
    t_priv_on: "Права администратора выданы",
    t_priv_off: "Права администратора сняты",
    t_disabled: "Аккаунт отключён, сессий завершено: {n}",
    t_enabled: "Аккаунт включён",
    t_profile_saved: "Профиль обновлён",
    t_profile_unchanged: "Профиль без изменений",
    t_email_saved: "Почта обновлена",

    s_info: "Информация",
    s_edit: "Редактирование",
    s_danger: "Опасная зона",
    s_desc: "Описание",
    f_server_name: "Название",
    f_server_desc: "Описание (до 1024 символов, пусто — убрать)",
    t_renamed: "Сервер переименован",
    delete_server: "Удалить сервер…",
    delete_warn:
      "Удаление сервера необратимо: каналы, сообщения, участники и роли будут удалены.",
    delete_ph: "Введите название сервера для подтверждения",
    deleting: "Удаление…",
    t_deleted: "Сервер удалён: каналов {c}, сообщений {m}, участников {n}",

    err_network: "Нет соединения с сервером",
    err_internal: "Внутренняя ошибка сервера",
    err_invalid_credentials: "Неверный логин или пароль",
    err_ambiguous_login:
      "Найдено несколько пользователей — уточните логин (username#дискриминатор или email)",
    err_rate_limited: "Слишком много попыток входа, попробуйте позже",
    err_missing_fields: "Укажите логин и пароль",
    err_account_disabled: "Аккаунт отключён",
    err_not_privileged: "Доступ только для привилегированных пользователей",
    err_unauthenticated: "Требуется вход",
    err_session_expired: "Сессия истекла",
    err_access_denied: "Доступ запрещён",
    err_bad_origin: "Запрос с другого origin отклонён",
    err_not_found: "Не найдено",
    err_account_not_found: "Аккаунт не найден",
    err_missing_password: "Укажите новый пароль",
    err_password_too_short: "Пароль должен быть не короче 8 символов",
    err_password_too_long: "Пароль слишком длинный",
    err_invalid_body: "Некорректные данные запроса",
    err_invalid_username:
      "Недопустимое имя пользователя: 2–32 символа, буквы/цифры/_. -, без зарезервированных слов",
    err_invalid_discriminator: "Недопустимый дискриминатор — 4 цифры",
    err_discriminator_taken: "Этот дискриминатор уже занят у такого имени",
    err_username_taken: "Нет свободных дискриминаторов для этого имени",
    err_invalid_display_name: "Недопустимое отображаемое имя: 2–32 символа",
    err_invalid_pronouns: "Недопустимые местоимения: 1–24 символа",
    err_invalid_email: "Некорректный email",
    err_email_taken: "Этот email уже используется",
    err_nothing_to_update: "Нет изменений",
    err_missing_name: "Укажите новое название",
    err_invalid_name: "Название сервера: 1–32 символа",
    err_invalid_description: "Описание: не более 1024 символов",
  },
  en: {
    doc_title: "Stoat — Admin panel",
    app_title: "Admin panel",
    loading: "Loading…",
    empty: "No results",
    load_error: "Failed to load",
    total: "{n} total",
    prev: "← Back",
    next: "Forward →",
    page: "Page {p} of {n}",
    find: "Search",
    close: "Close",
    save: "Save",
    copied: "Copied",

    login_title: "Admin panel",
    login_subtitle: "Sign in with an administrator account",
    login_field: "Login (email or username)",
    password_field: "Password",
    login: "Sign in",
    login_pending: "Signing in…",

    nav_overview: "Overview",
    nav_users: "Users",
    nav_servers: "Servers",
    logout: "Log out",

    stats_title: "Overview",
    stats_subtitle: "Instance database status",
    stat_users: "Users",
    stat_servers: "Servers",
    stat_channels: "Channels",
    stat_messages: "Messages",
    stat_sessions: "Sessions",
    stat_accounts: "Accounts",
    stat_loading: "loading",

    users_title: "Users",
    users_subtitle: "Search and edit accounts",
    users_ph: "Email, username, username#discriminator or ID",
    th_user: "User",
    th_email: "Email",
    th_role: "Role",
    th_status: "Status",
    th_sessions: "Sessions",
    th_created: "Created",
    badge_admin: "Admin",
    badge_disabled: "Disabled",
    badge_active: "Active",
    role_user: "User",

    servers_title: "Servers",
    servers_subtitle: "Browse, rename and delete servers",
    servers_ph: "Server name or ID",
    th_server: "Server",
    th_owner: "Owner",
    th_channels: "Channels",
    th_members: "Members",
    delete: "Delete",

    u_data: "Current data",
    u_profile: "Profile",
    u_account: "Account",
    u_access: "Access",
    f_username: "Username",
    f_discriminator: "Discriminator",
    f_display_name: "Display name",
    f_pronouns: "Pronouns",
    f_email: "Email",
    f_password_new: "New password (min. 8 characters) — all sessions will be terminated",
    f_password_ph: "New password",
    auto: "Auto",
    auto_hint: "Empty — a new random discriminator is picked on save",
    change: "Change",
    save_profile: "Save profile",
    kv_email_norm: "Normalised email",
    kv_verification: "Email verification",
    kv_password_hash: "Password hash (argon2)",
    hash_note:
      "No plaintext password is stored — only this argon2 hash. Click to copy.",
    kv_mfa: "Two-factor authentication",
    kv_badges: "Badges",
    kv_flags: "Flags",
    kv_suspended: "Suspended until",
    verified: "Verified",
    unverified: "Unverified",
    mfa_on: "enabled",
    mfa_off: "disabled",
    priv_grant: "Make admin",
    priv_revoke: "Revoke admin",
    enable: "Enable account",
    disable: "Disable account",
    confirm_password:
      "Change the password for {u}?\nAll of the user's sessions will be terminated.",
    confirm_priv_on: "Grant administrator rights to {u}?",
    confirm_priv_off: "Revoke administrator rights from {u}?",
    confirm_disable:
      "Disable the account {u}?\nAll sessions will be terminated.",
    confirm_enable: "Enable the account {u}?",
    t_password_changed: "Password changed, sessions terminated: {n}",
    t_priv_on: "Administrator rights granted",
    t_priv_off: "Administrator rights revoked",
    t_disabled: "Account disabled, sessions terminated: {n}",
    t_enabled: "Account enabled",
    t_profile_saved: "Profile updated",
    t_profile_unchanged: "Profile has no changes",
    t_email_saved: "Email updated",

    s_info: "Information",
    s_edit: "Editing",
    s_danger: "Danger zone",
    s_desc: "Description",
    f_server_name: "Name",
    f_server_desc: "Description (up to 1024 characters, empty to clear)",
    t_renamed: "Server renamed",
    delete_server: "Delete server…",
    delete_warn:
      "Deleting a server is irreversible: channels, messages, members and roles will be removed.",
    delete_ph: "Type the server name to confirm",
    deleting: "Deleting…",
    t_deleted: "Server deleted: {c} channels, {m} messages, {n} members",

    err_network: "Cannot reach the server",
    err_internal: "Internal server error",
    err_invalid_credentials: "Incorrect login or password",
    err_ambiguous_login:
      "Several users found — refine your login (username#discriminator or email)",
    err_rate_limited: "Too many login attempts, try again later",
    err_missing_fields: "Enter login and password",
    err_account_disabled: "The account is disabled",
    err_not_privileged: "Privileged users only",
    err_unauthenticated: "Sign-in required",
    err_session_expired: "Session expired",
    err_access_denied: "Access denied",
    err_bad_origin: "Request from another origin rejected",
    err_not_found: "Not found",
    err_account_not_found: "Account not found",
    err_missing_password: "Enter a new password",
    err_password_too_short: "Password must be at least 8 characters",
    err_password_too_long: "Password is too long",
    err_invalid_body: "Invalid request body",
    err_invalid_username:
      "Invalid username: 2–32 characters, letters/digits/_.,- and no reserved words",
    err_invalid_discriminator: "Invalid discriminator — 4 digits",
    err_discriminator_taken: "This discriminator is already taken for this name",
    err_username_taken: "No free discriminators left for this username",
    err_invalid_display_name: "Invalid display name: 2–32 characters",
    err_invalid_pronouns: "Invalid pronouns: 1–24 characters",
    err_invalid_email: "Invalid email address",
    err_email_taken: "This email is already in use",
    err_nothing_to_update: "No changes",
    err_missing_name: "Enter a new name",
    err_invalid_name: "Server name: 1–32 characters",
    err_invalid_description: "Description: at most 1024 characters",
  },
};

/* All languages shipped by the Stoat client (Languages.ts), same order.
   en and ru are embedded below; every other code lazy-loads from
   ./i18n/<code>.js (a plain `export default { … }` module). */
const LANGS = [
  { code: "en", display: "English (Traditional)", emoji: "🇬🇧" },
  { code: "en-US", display: "English (Simplified)", emoji: "🇺🇸" },
  { code: "ar", display: "عربي", emoji: "🇸🇦", rtl: true },
  { code: "as", display: "অসমীয়া", emoji: "🇮🇳" },
  { code: "az", display: "Azərbaycan dili", emoji: "🇦🇿" },
  { code: "be", display: "Беларуская", emoji: "🇧🇾" },
  { code: "bg", display: "Български", emoji: "🇧🇬" },
  { code: "bn", display: "বাংলা", emoji: "🇧🇩" },
  { code: "br", display: "Brezhoneg" },
  { code: "ca", display: "Català", emoji: "🇪🇸" },
  { code: "ceb", display: "Bisaya", emoji: "🇵🇭" },
  { code: "ckb", display: "کوردی", rtl: true },
  { code: "cs", display: "Čeština", emoji: "🇨🇿" },
  { code: "da", display: "Dansk", emoji: "🇩🇰" },
  { code: "de", display: "Deutsch", emoji: "🇩🇪" },
  { code: "el", display: "Ελληνικά", emoji: "🇬🇷" },
  { code: "es", display: "Español", emoji: "🇪🇸" },
  { code: "es-419", display: "Español (América Latina)", emoji: "🇪🇸" },
  { code: "et", display: "eesti", emoji: "🇪🇪" },
  { code: "fi", display: "suomi", emoji: "🇫🇮" },
  { code: "fil", display: "Filipino", emoji: "🇵🇭" },
  { code: "fr", display: "Français", emoji: "🇫🇷" },
  { code: "ga", display: "Gaeilge", emoji: "🇮🇪" },
  { code: "hi", display: "हिन्दी", emoji: "🇮🇳" },
  { code: "hr", display: "Hrvatski", emoji: "🇭🇷" },
  { code: "hu", display: "Magyar", emoji: "🇭🇺" },
  { code: "hy", display: "հայերեն", emoji: "🇦🇲" },
  { code: "id", display: "Bahasa Indonesia", emoji: "🇮🇩" },
  { code: "is", display: "Íslenska", emoji: "🇮🇸" },
  { code: "it", display: "Italiano", emoji: "🇮🇹" },
  { code: "ja", display: "日本語", emoji: "🇯🇵" },
  { code: "ko", display: "한국어", emoji: "🇰🇷" },
  { code: "lb", display: "Lëtzebuergesch", emoji: "🇱🇺" },
  { code: "lt", display: "Lietuvių", emoji: "🇱🇹" },
  { code: "lv", display: "Latviešu", emoji: "🇱🇻" },
  { code: "mk", display: "Македонски", emoji: "🇲🇰" },
  { code: "ms", display: "Bahasa Melayu", emoji: "🇲🇾" },
  { code: "nb-NO", display: "Norsk bokmål", emoji: "🇳🇴" },
  { code: "nl", display: "Nederlands", emoji: "🇳🇱" },
  { code: "fa", display: "فارسی", emoji: "🇮🇷", rtl: true },
  { code: "pl", display: "Polski", emoji: "🇵🇱" },
  { code: "pt-BR", display: "Português (do Brasil)", emoji: "🇧🇷" },
  { code: "pt-PT", display: "Português (Portugal)", emoji: "🇵🇹" },
  { code: "ro", display: "Română", emoji: "🇷🇴" },
  { code: "ru", display: "Русский", emoji: "🇷🇺" },
  { code: "sk", display: "Slovensky", emoji: "🇸🇰" },
  { code: "sl", display: "Slovenščina", emoji: "🇸🇮" },
  { code: "sq", display: "Shqip", emoji: "🇦🇱" },
  { code: "sr", display: "Српски", emoji: "🇷🇸" },
  { code: "si", display: "සිංහල", emoji: "🇱🇰" },
  { code: "sv", display: "Svenska", emoji: "🇸🇪" },
  { code: "ta", display: "தமிழ்", emoji: "🇮🇳" },
  { code: "th", display: "ไทย", emoji: "🇹🇭" },
  { code: "tr", display: "Türkçe", emoji: "🇹🇷" },
  { code: "ur", display: "اردو", emoji: "🇵🇰", rtl: true },
  { code: "uk", display: "Українська", emoji: "🇺🇦" },
  { code: "vec", display: "Vèneto" },
  { code: "vi", display: "Tiếng Việt", emoji: "🇻🇳" },
  { code: "zh-Hans", display: "简体中文", emoji: "🇨🇳" },
  { code: "zh-Hant", display: "繁體中文", emoji: "🇹🇼" },
  { code: "tokipona", display: "Toki Pona", emoji: "🙂" },
  { code: "esperanto", display: "Esperanto" },
  { code: "owo", display: "OwO", emoji: "😸" },
  { code: "pr", display: "Pirate", emoji: "🏴‍☠️" },
  { code: "bottom", display: "Bottom", emoji: "🥺" },
  { code: "leet", display: "1337", emoji: "💾" },
  { code: "enchantment", display: "Enchantment Table", emoji: "🪄" },
  { code: "piglatin", display: "Pig Latin", emoji: "🐖" },
  { code: "dev", display: "Developer Test", emoji: "🦝" },
];

const LANG_BY_CODE = new Map(LANGS.map((entry) => [entry.code, entry]));

function detectLang() {
  try {
    const saved = localStorage.getItem("stoat_admin_lang");
    if (saved && LANG_BY_CODE.has(saved)) return saved;
  } catch {
    /* storage unavailable */
  }

  const nav = (navigator.language || "en").toLowerCase();

  /* exact code match, case-insensitive (pt-pt → pt-PT, nb-no → nb-NO …) */
  const exact = LANGS.find((entry) => entry.code.toLowerCase() === nav);
  if (exact) return exact.code;

  /* base language with no usable sibling match */
  const special = new Map([
    ["zh", "zh-Hans"],
    ["zh-cn", "zh-Hans"],
    ["zh-sg", "zh-Hans"],
    ["zh-tw", "zh-Hant"],
    ["zh-hk", "zh-Hant"],
    ["zh-mo", "zh-Hant"],
    ["no", "nb-NO"],
    ["nb", "nb-NO"],
    ["nn", "nb-NO"],
    ["pt", "pt-BR"],
    ["fa-af", "fa"],
    ["ckb-ir", "ckb"],
  ]);
  if (special.has(nav)) return special.get(nav);

  const base = nav.split("-")[0];
  if (LANG_BY_CODE.has(base)) return base;
  const partial = LANGS.find(
    (entry) => entry.code.toLowerCase().split("-")[0] === base,
  );
  if (partial) return partial.code;
  return "en";
}

let lang = detectLang();
/* Guards against overlapping language switches (double change while the
   translation module is still being imported). */
let langBusy = false;

/* Lazily import a translation module (en/ru are already embedded). */
async function ensureLang(code) {
  if (I18N[code]) return true;
  try {
    const mod = await import(`./i18n/${code}.js`);
    if (mod && mod.default && typeof mod.default === "object") {
      I18N[code] = mod.default;
      return true;
    }
  } catch {
    /* missing or broken file */
  }
  return false;
}

function t(key, vars) {
  const dict = I18N[lang] || I18N.en;
  let text = dict[key];
  if (text === undefined) text = I18N.en[key];
  if (text === undefined) text = key;
  if (vars) {
    for (const name of Object.keys(vars)) {
      text = text.split(`{${name}}`).join(String(vars[name]));
    }
  }
  return text;
}

function applyStaticLang() {
  const entry = LANG_BY_CODE.get(lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = entry && entry.rtl ? "rtl" : "ltr";
  document.title = t("doc_title");
}

async function setLang(next) {
  if (next === lang || !LANG_BY_CODE.has(next) || langBusy) return;
  langBusy = true;
  /* Disable the control while the module loads so a second change cannot
     race the first one. */
  const selects = Array.from(document.querySelectorAll("[data-set-lang]"));
  selects.forEach((node) => {
    node.disabled = true;
  });
  const ok = await ensureLang(next);
  selects.forEach((node) => {
    node.disabled = false;
  });
  langBusy = false;
  if (!ok) {
    /* Module missing — put every switch back on the working language. */
    selects.forEach((node) => {
      node.value = lang;
    });
    toast(t("load_error"));
    return;
  }
  lang = next;
  try {
    localStorage.setItem("stoat_admin_lang", lang);
  } catch {
    /* storage unavailable */
  }
  applyStaticLang();
  retranslate();
}

/* Repaint the whole UI in the new language without losing the user's place:
   scroll offset, focused control (+ caret), typed-but-uncommitted search
   text and the login form values all survive the repaint. */
function retranslate() {
  const main = document.getElementById("main");
  const scroll = main ? main.scrollTop : 0;
  const active = document.activeElement;
  const focusId = active && active.id ? active.id : null;
  const focusLang = Boolean(
    active && active.matches && active.matches("[data-set-lang]"),
  );
  let caret = null;
  if (active && typeof active.selectionStart === "number") {
    try {
      caret = [active.selectionStart, active.selectionEnd];
    } catch {
      caret = null;
    }
  }
  const typed = {};
  ["users-q", "servers-q", "f-login", "f-password"].forEach((id) => {
    const node = document.getElementById(id);
    if (node) typed[id] = node.value;
  });

  render();

  const mainNow = document.getElementById("main");
  if (mainNow) mainNow.scrollTop = scroll;
  Object.keys(typed).forEach((id) => {
    const node = document.getElementById(id);
    if (node) node.value = typed[id];
  });
  if (focusLang) {
    const select = document.querySelector("[data-set-lang]");
    if (select) select.focus();
  } else if (focusId) {
    const node = document.getElementById(focusId);
    if (node) {
      node.focus();
      if (caret && typeof node.setSelectionRange === "function") {
        try {
          node.setSelectionRange(caret[0], caret[1]);
        } catch {
          /* inputs without a caret */
        }
      }
    }
  }
}

function locale() {
  try {
    new Intl.DateTimeFormat(lang);
    return lang;
  } catch {
    /* non-BCP47 joke tags like "leet" or "enchantment" */
    return "en";
  }
}

/* ---------- state ------------------------------------------------------ */

const state = {
  me: null,
  view: "stats",
  users: { q: "", page: 1 },
  servers: { q: "", page: 1 },
  /* Last successful payload per view, keyed by the query it belongs to.
     A re-render (language switch, nav click) repaints from here instantly
     and refreshes in the background, so the UI never flashes "loading". */
  cache: { stats: null, users: null, usersKey: "", servers: null, serversKey: "" },
  /* Draft of the login form — survives re-renders (e.g. language switch). */
  login: { login: "", password: "" },
};

const app = document.getElementById("app");

/* View generation: every render() and every async data load bumps the
   counter; after each `await` the caller verifies its generation is still
   current AND re-queries elements with null guards, so a stale response can
   never write into a DOM that no longer exists. */
let viewSeq = 0;
const bump = () => ++viewSeq;

/* ---------- helpers ---------------------------------------------------- */

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
  return new Date(ms).toLocaleString(locale(), {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function fmtNum(value) {
  return Number(value || 0).toLocaleString(locale());
}

function toast(message, isError = false) {
  const container = document.getElementById("toasts");
  if (!container) return;
  const node = document.createElement("div");
  node.className = `toast${isError ? " err" : ""}`;
  node.textContent = message;
  container.appendChild(node);
  setTimeout(() => node.remove(), 4200);
}

/* Localise by error `code` when we know it, else fall back to the
   server-provided message, else a generic string. */
function errText(err) {
  const code = err && err.code;
  if (code && I18N[lang] && I18N[lang][`err_${code}`]) return t(`err_${code}`);
  if (err && err.message) return err.message;
  return t("err_internal");
}

async function api(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(url(path), {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    const error = new Error(t("err_network"));
    error.code = "network";
    throw error;
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  const fatal =
    res.status === 401 ||
    (res.status === 403 && data && data.code === "access_denied");
  if (fatal && state.me) {
    state.me = null;
    render();
    toast(errText({ code: data && data.code, message: data && data.error }));
  }
  if (!res.ok) {
    const error = new Error((data && data.error) || `HTTP ${res.status}`);
    if (data && data.code) error.code = data.code;
    error.status = res.status;
    throw error;
  }
  return data;
}

function closeOverlays() {
  document.querySelectorAll(".overlay").forEach((node) => node.remove());
}

function langSwitchHTML() {
  const options = LANGS.map((entry) => {
    const label = (entry.emoji ? `${entry.emoji} ` : "") + entry.display;
    return `<option value="${esc(entry.code)}"${
      entry.code === lang ? " selected" : ""
    }>${esc(label)}</option>`;
  }).join("");
  return `
    <div class="lang-switch">
      <select class="lang-select" data-set-lang>${options}</select>
    </div>`;
}

function wireLangSwitches() {
  document.querySelectorAll("[data-set-lang]").forEach((node) => {
    node.addEventListener("change", () => setLang(node.value));
    /* Warm the translation modules the moment the control is pointed at or
       focused, so the first switch is instant. */
    node.addEventListener("pointerenter", prefetchLangs, { once: true });
    node.addEventListener("focus", prefetchLangs, { once: true });
  });
}

/* Import every i18n module once, a few at a time, so switching languages
   never waits for the network again. */
let prefetchStarted = false;
function prefetchLangs() {
  if (prefetchStarted) return;
  prefetchStarted = true;
  const queue = LANGS.map((entry) => entry.code).filter((code) => !I18N[code]);
  let index = 0;
  const worker = async () => {
    while (index < queue.length) {
      await ensureLang(queue[index++]);
    }
  };
  for (let i = 0; i < 4; i += 1) worker();
}

/* Start warming after the first paint, when the browser is idle. */
function scheduleLangPrefetch() {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(() => prefetchLangs(), { timeout: 6000 });
  } else {
    setTimeout(() => prefetchLangs(), 2500);
  }
}

/* Esc closes the topmost dialog (canonical Stoat behaviour). */
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const overlays = document.querySelectorAll(".overlay");
  if (overlays.length > 0) overlays[overlays.length - 1].remove();
});

/* ---------- render ----------------------------------------------------- */

function render() {
  bump();
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
        ${langSwitchHTML()}
        <h1>${esc(t("login_title"))}</h1>
        <div class="subtitle">${esc(t("login_subtitle"))}</div>
        <div class="field">
          <label>${esc(t("login_field"))}</label>
          <input type="text" id="f-login" autocomplete="username"
            value="${esc(state.login.login)}" required />
        </div>
        <div class="field">
          <label>${esc(t("password_field"))}</label>
          <input type="password" id="f-password" autocomplete="current-password"
            value="${esc(state.login.password)}" required />
        </div>
        <div class="hint" id="f-hint"></div>
        <button class="btn primary" id="f-submit" type="submit">${esc(t("login"))}</button>
      </form>
    </div>`;

  wireLangSwitches();

  ["f-login", "f-password"].forEach((id) => {
    document.getElementById(id).addEventListener("input", (event) => {
      state.login[id === "f-login" ? "login" : "password"] = event.target.value;
    });
  });

  document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const loginValue = document.getElementById("f-login").value;
    const passwordValue = document.getElementById("f-password").value;
    state.login.login = loginValue;
    state.login.password = passwordValue;
    const hint = document.getElementById("f-hint");
    const button = document.getElementById("f-submit");
    if (hint) hint.textContent = "";
    if (button) {
      button.disabled = true;
      button.textContent = t("login_pending");
    }
    try {
      const data = await api("api/login", {
        method: "POST",
        body: { login: loginValue, password: passwordValue },
      });
      state.me = data.user;
      state.login.password = ""; // never keep the password in memory after login
      render();
    } catch (err) {
      const hintAfter = document.getElementById("f-hint");
      if (hintAfter) hintAfter.textContent = errText(err);
      const buttonAfter = document.getElementById("f-submit");
      if (buttonAfter) {
        buttonAfter.disabled = false;
        buttonAfter.textContent = t("login");
      }
    }
  });

  document.getElementById("f-login").focus();
}

function renderShell() {
  app.innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="sidebar-header">${esc(t("app_title"))}</div>
        <nav>
          <button class="nav-item ${state.view === "stats" ? "active" : ""}" data-view="stats">${esc(t("nav_overview"))}</button>
          <button class="nav-item ${state.view === "users" ? "active" : ""}" data-view="users">${esc(t("nav_users"))}</button>
          <button class="nav-item ${state.view === "servers" ? "active" : ""}" data-view="servers">${esc(t("nav_servers"))}</button>
        </nav>
        <div class="sidebar-footer">
          <span class="who" title="${esc(state.me.username)}#${esc(state.me.discriminator)}">
            ${esc(state.me.username)}<span class="dim">#${esc(state.me.discriminator)}</span>
          </span>
          <span class="footer-actions">
            ${langSwitchHTML()}
            <button class="btn flat small" id="logout">${esc(t("logout"))}</button>
          </span>
        </div>
      </aside>
      <main class="main" id="main"></main>
    </div>`;

  wireLangSwitches();

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

/* ---------- stats ------------------------------------------------------ */

async function renderStats() {
  const seq = bump();
  const main = document.getElementById("main");
  if (!main) return;
  main.innerHTML = `
    <h1>${esc(t("stats_title"))}</h1>
    <div class="subtitle">${esc(t("stats_subtitle"))}</div>
    <div class="cards" id="stats-cards">
      ${Array.from({ length: 6 })
        .map(
          () =>
            `<div class="card"><div class="num">…</div><div class="label">${esc(t("stat_loading"))}</div></div>`,
        )
        .join("")}
    </div>`;

  const hadCache = Boolean(state.cache.stats);
  if (hadCache) paintStats(state.cache.stats);

  try {
    const stats = await api("api/stats");
    if (seq !== viewSeq) return;
    state.cache.stats = stats;
    paintStats(stats);
  } catch (err) {
    if (seq !== viewSeq) return;
    toast(errText(err), true);
  }
}

function paintStats(stats) {
  const cards = document.getElementById("stats-cards");
  if (!cards) return;
  const entries = [
    ["users", t("stat_users")],
    ["servers", t("stat_servers")],
    ["channels", t("stat_channels")],
    ["messages", t("stat_messages")],
    ["sessions", t("stat_sessions")],
    ["accounts", t("stat_accounts")],
  ];
  cards.innerHTML = entries
    .map(
      ([key, label]) => `
      <div class="card">
        <div class="num">${esc(fmtNum(stats[key] || 0))}</div>
        <div class="label">${esc(label)}</div>
      </div>`,
    )
    .join("");
}

/* ---------- users ------------------------------------------------------ */

function renderUsers() {
  bump();
  const main = document.getElementById("main");
  if (!main) return;
  main.innerHTML = `
    <h1>${esc(t("users_title"))}</h1>
    <div class="subtitle" id="users-total">${esc(t("loading"))}</div>
    <div class="toolbar">
      <input class="search" id="users-q" type="text"
        placeholder="${esc(t("users_ph"))}"
        value="${esc(state.users.q)}" />
      <button class="btn tonal" id="users-go">${esc(t("find"))}</button>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>${esc(t("th_user"))}</th><th>${esc(t("th_email"))}</th><th>${esc(t("th_role"))}</th><th>${esc(t("th_status"))}</th>
            <th>${esc(t("th_sessions"))}</th><th>${esc(t("th_created"))}</th>
          </tr>
        </thead>
        <tbody id="users-body">
          <tr><td colspan="6" class="empty">${esc(t("loading"))}</td></tr>
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
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") submit();
  });
  document.getElementById("users-go").addEventListener("click", submit);

  loadUsers();
}

async function loadUsers() {
  const seq = bump();
  const body = document.getElementById("users-body");
  if (!body) return;
  const key = `${state.users.q}|${state.users.page}`;
  /* Repaint from cache for this exact query when we have it; otherwise keep
     the rows already on screen (stale-while-revalidate) instead of flashing
     a "loading" row on every keystroke or language switch. */
  const cached =
    state.cache.users && state.cache.usersKey === key ? state.cache.users : null;
  if (cached) paintUsers(cached);
  else if (!body.querySelector("tr[data-id]")) {
    body.innerHTML = `<tr><td colspan="6" class="empty">${esc(t("loading"))}</td></tr>`;
  }
  try {
    const data = await api(
      `api/users?q=${encodeURIComponent(state.users.q)}&page=${state.users.page}`,
    );
    if (seq !== viewSeq) return;
    state.cache.users = data;
    state.cache.usersKey = key;
    paintUsers(data);
  } catch (err) {
    if (seq !== viewSeq) return;
    toast(errText(err), true);
    const bodyNow = document.getElementById("users-body");
    if (bodyNow && !bodyNow.querySelector("tr[data-id]")) {
      bodyNow.innerHTML = `<tr><td colspan="6" class="empty">${esc(t("load_error"))}</td></tr>`;
    }
  }
}

function paintUsers(data) {
  const total = document.getElementById("users-total");
  if (total) total.textContent = t("total", { n: fmtNum(data.total) });

  const body = document.getElementById("users-body");
  if (!body) return;
  body.innerHTML = data.items.length
    ? data.items
        .map(
          (user) => `
      <tr data-id="${esc(user.id)}">
        <td>
          <div class="strong">${esc(user.username)}<span class="dim">#${esc(user.discriminator)}</span></div>
          <div class="dim mono">${esc(user.id)}</div>
        </td>
        <td>${esc(user.email || "—")}</td>
        <td>${user.privileged ? `<span class="badge admin">${esc(t("badge_admin"))}</span>` : `<span class="dim">${esc(t("role_user"))}</span>`}</td>
        <td>${user.disabled ? `<span class="badge off">${esc(t("badge_disabled"))}</span>` : `<span class="badge ok">${esc(t("badge_active"))}</span>`}</td>
        <td>${esc(fmtNum(user.sessions))}</td>
        <td>${esc(fmtDate(user.createdAt))}</td>
      </tr>`,
        )
        .join("")
    : `<tr><td colspan="6" class="empty">${esc(t("empty"))}</td></tr>`;

  body.querySelectorAll("tr[data-id]").forEach((row) => {
    row.addEventListener("click", () => openUser(row.dataset.id));
  });

  const pager = document.getElementById("users-pager");
  if (pager) {
    renderPager(pager, data, (page) => {
      state.users.page = page;
      loadUsers();
    });
  }
}

function renderPager(element, data, go) {
  if (!element) return;
  const pages = Math.max(1, Math.ceil(data.total / data.limit));
  element.innerHTML = `
    <button class="btn tonal small" id="page-prev" ${data.page <= 1 ? "disabled" : ""}>${esc(t("prev"))}</button>
    <span>${esc(t("page", { p: data.page, n: pages }))}</span>
    <button class="btn tonal small" id="page-next" ${data.page >= pages ? "disabled" : ""}>${esc(t("next"))}</button>`;
  element.querySelector("#page-prev").addEventListener("click", () => go(data.page - 1));
  element.querySelector("#page-next").addEventListener("click", () => go(data.page + 1));
}

/* ---------- user editor ------------------------------------------------ */

async function openUser(id) {
  const seq = bump();
  let user;
  try {
    user = await api(`api/users/${id}`);
  } catch (err) {
    if (seq === viewSeq) toast(errText(err), true);
    return;
  }
  if (seq !== viewSeq) return;

  closeOverlays();

  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = userModalHTML(user);
  document.body.appendChild(overlay);

  wireUserModal(overlay, user);
}

function userModalHTML(user) {
  const tag = `${esc(user.username)}<span class="dim">#${esc(user.discriminator)}</span>`;
  return `
    <div class="modal">
      <h2>${tag}</h2>

      <div class="msec">
        <div class="msec-title">${esc(t("u_data"))}</div>
        <div class="kv">
          <dt>ID</dt><dd class="mono">${esc(user.id)}</dd>
          <dt>${esc(t("f_email"))}</dt><dd>${esc(user.email || "—")}</dd>
          <dt>${esc(t("kv_email_norm"))}</dt><dd>${esc(user.emailNormalised || "—")}</dd>
          <dt>${esc(t("kv_verification"))}</dt><dd>${
            user.verified
              ? `<span class="badge ok">${esc(t("verified"))}</span>`
              : `<span class="badge gray">${esc(t("unverified"))}</span>`
          }</dd>
          <dt>${esc(t("f_username"))}</dt><dd>${esc(user.username)}</dd>
          <dt>${esc(t("f_discriminator"))}</dt><dd>${esc(user.discriminator)}</dd>
          <dt>${esc(t("f_display_name"))}</dt><dd>${esc(user.displayName || "—")}</dd>
          <dt>${esc(t("f_pronouns"))}</dt><dd>${esc(user.pronouns || "—")}</dd>
          <dt>${esc(t("kv_password_hash"))}</dt>
          <dd><input type="text" id="m-hash" class="mono" readonly value="${esc(user.passwordHash || "—")}" title="${esc(t("hash_note"))}" /></dd>
          <dt>${esc(t("th_role"))}</dt><dd>${
            user.privileged
              ? `<span class="badge admin">${esc(t("badge_admin"))}</span>`
              : esc(t("role_user"))
          }</dd>
          <dt>${esc(t("th_status"))}</dt><dd>${
            user.disabled
              ? `<span class="badge off">${esc(t("badge_disabled"))}</span>`
              : `<span class="badge ok">${esc(t("badge_active"))}</span>`
          }</dd>
          <dt>${esc(t("kv_mfa"))}</dt><dd>${esc(user.mfaEnabled ? t("mfa_on") : t("mfa_off"))}</dd>
          <dt>${esc(t("kv_badges"))}</dt><dd>${esc(user.badges ?? 0)}</dd>
          <dt>${esc(t("kv_flags"))}</dt><dd>${esc(user.flags ?? 0)}</dd>
          <dt>${esc(t("kv_suspended"))}</dt><dd>${esc(fmtDate(user.suspendedUntil))}</dd>
          <dt>${esc(t("th_sessions"))}</dt><dd>${esc(fmtNum(user.sessions))}</dd>
          <dt>${esc(t("th_created"))}</dt><dd>${esc(fmtDate(user.createdAt))}</dd>
        </div>
        <div class="hint note" id="m-hash-note">${esc(t("hash_note"))}</div>
      </div>

      <div class="msec">
        <div class="msec-title">${esc(t("u_profile"))}</div>
        <div class="grid2">
          <div class="field">
            <label>${esc(t("f_username"))}</label>
            <input type="text" id="m-username" value="${esc(user.username)}" />
          </div>
          <div class="field">
            <label>${esc(t("f_discriminator"))}</label>
            <div class="row">
              <input type="text" id="m-discriminator" value="${esc(user.discriminator)}" maxlength="4" inputmode="numeric" />
              <button class="btn outlined" id="m-reroll" type="button">${esc(t("auto"))}</button>
            </div>
          </div>
        </div>
        <div class="field">
          <label>${esc(t("f_display_name"))}</label>
          <input type="text" id="m-display" value="${esc(user.displayName || "")}" />
        </div>
        <div class="field">
          <label>${esc(t("f_pronouns"))}</label>
          <input type="text" id="m-pronouns" value="${esc(user.pronouns || "")}" />
        </div>
        <div class="hint note">${esc(t("auto_hint"))}</div>
        <div class="hint" id="m-profile-hint"></div>
        <div class="row end">
          <button class="btn primary" id="m-save-profile" type="button">${esc(t("save_profile"))}</button>
        </div>
      </div>

      <div class="msec">
        <div class="msec-title">${esc(t("u_account"))}</div>
        <div class="field">
          <label>${esc(t("f_email"))}</label>
          <div class="row">
            <input type="email" id="m-email" value="${esc(user.email || "")}" />
            <button class="btn tonal" id="m-save-email" type="button">${esc(t("change"))}</button>
          </div>
          <div class="hint" id="m-email-hint"></div>
        </div>
        <div class="field">
          <label>${esc(t("f_password_new"))}</label>
          <div class="row">
            <input type="password" id="m-password" placeholder="${esc(t("f_password_ph"))}" autocomplete="new-password" />
            <button class="btn tonal" id="m-setpw" type="button">${esc(t("change"))}</button>
          </div>
          <div class="hint" id="m-pw-hint"></div>
        </div>
      </div>

      <div class="msec">
        <div class="msec-title">${esc(t("u_access"))}</div>
        <div class="row">
          <button class="btn tonal" id="m-priv" type="button">${
            user.privileged ? esc(t("priv_revoke")) : esc(t("priv_grant"))
          }</button>
          <button class="btn ${user.disabled ? "tonal" : "danger"}" id="m-dis" type="button">${
            user.disabled ? esc(t("enable")) : esc(t("disable"))
          }</button>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn flat esc-hint" id="m-close" type="button">${esc(t("close"))}</button>
      </div>
    </div>`;
}

function wireUserModal(overlay, user) {
  const close = () => overlay.remove();
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  overlay.querySelector("#m-close").addEventListener("click", close);

  /* click-to-copy the argon2 hash */
  overlay.querySelector("#m-hash").addEventListener("click", (event) => {
    event.target.select();
    navigator.clipboard
      ?.writeText(event.target.value)
      .then(() => toast(t("copied")))
      .catch(() => {});
  });

  /* discriminator "auto" button: clear the field → server re-rolls */
  overlay.querySelector("#m-reroll").addEventListener("click", () => {
    overlay.querySelector("#m-discriminator").value = "";
    overlay.querySelector("#m-discriminator").focus();
  });

  /* ---- profile save ---- */
  overlay.querySelector("#m-save-profile").addEventListener("click", async () => {
    const hint = overlay.querySelector("#m-profile-hint");
    if (hint) hint.textContent = "";
    const body = {
      username: overlay.querySelector("#m-username").value.trim(),
      discriminator: overlay.querySelector("#m-discriminator").value.trim() || null,
      display_name: overlay.querySelector("#m-display").value.trim(),
      pronouns: overlay.querySelector("#m-pronouns").value.trim(),
    };
    const button = overlay.querySelector("#m-save-profile");
    button.disabled = true;
    try {
      const result = await api(`api/users/${user.id}/profile`, {
        method: "POST",
        body,
      });
      if (result.changed) toast(t("t_profile_saved"));
      else toast(t("t_profile_unchanged"));
      /* Refresh the modal first — openUser bumps the view generation, so a
         list reload started before it would be discarded as stale. */
      await openUser(user.id); // refresh with fresh data
      if (state.view === "users") loadUsers();
    } catch (err) {
      const hintNow = overlay.querySelector("#m-profile-hint");
      if (hintNow) hintNow.textContent = errText(err);
      const buttonNow = overlay.querySelector("#m-save-profile");
      if (buttonNow) buttonNow.disabled = false;
    }
  });

  /* ---- email change ---- */
  overlay.querySelector("#m-save-email").addEventListener("click", async () => {
    const hint = overlay.querySelector("#m-email-hint");
    if (hint) hint.textContent = "";
    const button = overlay.querySelector("#m-save-email");
    button.disabled = true;
    try {
      await api(`api/users/${user.id}/email`, {
        method: "POST",
        body: { email: overlay.querySelector("#m-email").value.trim() },
      });
      toast(t("t_email_saved"));
      await openUser(user.id);
      if (state.view === "users") loadUsers();
    } catch (err) {
      const hintNow = overlay.querySelector("#m-email-hint");
      if (hintNow) hintNow.textContent = errText(err);
      const buttonNow = overlay.querySelector("#m-save-email");
      if (buttonNow) buttonNow.disabled = false;
    }
  });

  /* ---- password change ---- */
  overlay.querySelector("#m-setpw").addEventListener("click", async () => {
    const hint = overlay.querySelector("#m-pw-hint");
    if (hint) hint.textContent = "";
    const password = overlay.querySelector("#m-password").value;
    if (password.length < 8) {
      if (hint) hint.textContent = t("err_password_too_short");
      return;
    }
    if (!confirm(t("confirm_password", { u: `${user.username}#${user.discriminator}` }))) {
      return;
    }
    try {
      const result = await api(`api/users/${user.id}/password`, {
        method: "POST",
        body: { password },
      });
      toast(t("t_password_changed", { n: result.sessionsDeleted }));
      await openUser(user.id);
      if (state.view === "users") loadUsers();
    } catch (err) {
      const hintNow = overlay.querySelector("#m-pw-hint");
      if (hintNow) hintNow.textContent = errText(err);
    }
  });

  /* ---- privileged toggle ---- */
  overlay.querySelector("#m-priv").addEventListener("click", async () => {
    const next = !user.privileged;
    const question = next
      ? t("confirm_priv_on", { u: `${user.username}#${user.discriminator}` })
      : t("confirm_priv_off", { u: `${user.username}#${user.discriminator}` });
    if (!confirm(question)) return;
    try {
      await api(`api/users/${user.id}/privileged`, {
        method: "POST",
        body: { privileged: next },
      });
      toast(next ? t("t_priv_on") : t("t_priv_off"));
      await openUser(user.id);
      if (state.view === "users") loadUsers();
    } catch (err) {
      toast(errText(err), true);
    }
  });

  /* ---- disabled toggle ---- */
  overlay.querySelector("#m-dis").addEventListener("click", async () => {
    const next = !user.disabled;
    const question = next
      ? t("confirm_disable", { u: `${user.username}#${user.discriminator}` })
      : t("confirm_enable", { u: `${user.username}#${user.discriminator}` });
    if (!confirm(question)) return;
    try {
      const result = await api(`api/users/${user.id}/disabled`, {
        method: "POST",
        body: { disabled: next },
      });
      toast(
        next
          ? t("t_disabled", { n: result.sessionsDeleted ?? 0 })
          : t("t_enabled"),
      );
      await openUser(user.id);
      if (state.view === "users") loadUsers();
    } catch (err) {
      toast(errText(err), true);
    }
  });
}

/* ---------- servers ---------------------------------------------------- */

function renderServers() {
  bump();
  const main = document.getElementById("main");
  if (!main) return;
  main.innerHTML = `
    <h1>${esc(t("servers_title"))}</h1>
    <div class="subtitle" id="servers-total">${esc(t("loading"))}</div>
    <div class="toolbar">
      <input class="search" id="servers-q" type="text"
        placeholder="${esc(t("servers_ph"))}" value="${esc(state.servers.q)}" />
      <button class="btn tonal" id="servers-go">${esc(t("find"))}</button>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>${esc(t("th_server"))}</th><th>${esc(t("th_owner"))}</th><th>${esc(t("th_channels"))}</th><th>${esc(t("th_members"))}</th>
            <th>${esc(t("th_created"))}</th><th></th>
          </tr>
        </thead>
        <tbody id="servers-body">
          <tr><td colspan="6" class="empty">${esc(t("loading"))}</td></tr>
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
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") submit();
  });
  document.getElementById("servers-go").addEventListener("click", submit);

  loadServers();
}

async function loadServers() {
  const seq = bump();
  const body = document.getElementById("servers-body");
  if (!body) return;
  const key = `${state.servers.q}|${state.servers.page}`;
  const cached =
    state.cache.servers && state.cache.serversKey === key
      ? state.cache.servers
      : null;
  if (cached) paintServers(cached);
  else if (!body.querySelector("tr[data-id]")) {
    body.innerHTML = `<tr><td colspan="6" class="empty">${esc(t("loading"))}</td></tr>`;
  }
  try {
    const data = await api(
      `api/servers?q=${encodeURIComponent(state.servers.q)}&page=${state.servers.page}`,
    );
    if (seq !== viewSeq) return;
    state.cache.servers = data;
    state.cache.serversKey = key;
    paintServers(data);
  } catch (err) {
    if (seq !== viewSeq) return;
    toast(errText(err), true);
    const bodyNow = document.getElementById("servers-body");
    if (bodyNow && !bodyNow.querySelector("tr[data-id]")) {
      bodyNow.innerHTML = `<tr><td colspan="6" class="empty">${esc(t("load_error"))}</td></tr>`;
    }
  }
}

function paintServers(data) {
  const total = document.getElementById("servers-total");
  if (total) total.textContent = t("total", { n: fmtNum(data.total) });

  const body = document.getElementById("servers-body");
  if (!body) return;
  body.innerHTML = data.items.length
    ? data.items
        .map(
          (server) => `
      <tr data-id="${esc(server.id)}">
        <td>
          <div class="strong">${esc(server.name)}</div>
          <div class="dim mono">${esc(server.id)}</div>
        </td>
        <td>${esc(server.ownerTag || server.owner)}</td>
        <td>${esc(fmtNum(server.channels))}</td>
        <td>${esc(fmtNum(server.members))}</td>
        <td>${esc(fmtDate(server.createdAt))}</td>
        <td><button class="btn danger small" data-delete="${esc(server.id)}">${esc(t("delete"))}</button></td>
      </tr>`,
        )
        .join("")
    : `<tr><td colspan="6" class="empty">${esc(t("empty"))}</td></tr>`;

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

  const pager = document.getElementById("servers-pager");
  if (pager) {
    renderPager(pager, data, (page) => {
      state.servers.page = page;
      loadServers();
    });
  }
}

function openServer(server, deleteMode = false) {
  if (!server) return;
  closeOverlays();

  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `
    <div class="modal">
      <h2>${esc(server.name)}</h2>

      <div class="msec">
        <div class="msec-title">${esc(t("s_info"))}</div>
        <div class="kv">
          <dt>ID</dt><dd class="mono">${esc(server.id)}</dd>
          <dt>${esc(t("th_owner"))}</dt><dd>${esc(server.ownerTag || server.owner)}</dd>
          <dt>${esc(t("th_channels"))}</dt><dd>${esc(fmtNum(server.channels))}</dd>
          <dt>${esc(t("th_members"))}</dt><dd>${esc(fmtNum(server.members))}</dd>
          <dt>${esc(t("s_desc"))}</dt><dd>${esc(server.description || "—")}</dd>
          <dt>${esc(t("th_created"))}</dt><dd>${esc(fmtDate(server.createdAt))}</dd>
        </div>
      </div>

      ${
        deleteMode
          ? `
      <div class="msec">
        <div class="msec-title">${esc(t("s_danger"))}</div>
        <div class="hint note">${esc(t("delete_warn"))}</div>
        <div class="field">
          <label>${esc(t("delete_ph"))}</label>
          <div class="row">
            <input type="text" id="m-confirm" />
            <button class="btn danger" id="m-delete" type="button" disabled>${esc(t("delete"))}</button>
          </div>
        </div>
      </div>`
          : `
      <div class="msec">
        <div class="msec-title">${esc(t("s_edit"))}</div>
        <div class="field">
          <label>${esc(t("f_server_name"))}</label>
          <input type="text" id="m-name" value="${esc(server.name)}" />
        </div>
        <div class="field">
          <label>${esc(t("f_server_desc"))}</label>
          <textarea id="m-desc" rows="3">${esc(server.description || "")}</textarea>
        </div>
        <div class="hint" id="m-rename-hint"></div>
        <div class="row end">
          <button class="btn primary" id="m-rename" type="button">${esc(t("save"))}</button>
        </div>
      </div>`
      }

      <div class="modal-actions">
        <button class="btn ${deleteMode ? "tonal" : "danger"}" id="m-del-open" type="button">${
          deleteMode ? esc(t("close")) : esc(t("delete_server"))
        }</button>
        <button class="btn flat esc-hint" id="m-close" type="button">${esc(t("close"))}</button>
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
      deleteButton.textContent = t("deleting");
      try {
        const result = await api(`api/servers/${server.id}`, { method: "DELETE" });
        toast(
          t("t_deleted", {
            c: result.deleted.channels,
            m: result.deleted.messages,
            n: result.deleted.members,
          }),
        );
        close();
        if (state.view === "servers") loadServers();
      } catch (err) {
        toast(errText(err), true);
        const buttonNow = overlay.querySelector("#m-delete");
        if (buttonNow) {
          buttonNow.disabled = false;
          buttonNow.textContent = t("delete");
        }
      }
    });
    confirmInput.focus();
  } else {
    /* rename */
    overlay.querySelector("#m-rename").addEventListener("click", async () => {
      const hint = overlay.querySelector("#m-rename-hint");
      if (hint) hint.textContent = "";
      const button = overlay.querySelector("#m-rename");
      button.disabled = true;
      try {
        await api(`api/servers/${server.id}/rename`, {
          method: "POST",
          body: {
            name: overlay.querySelector("#m-name").value.trim(),
            description: overlay.querySelector("#m-desc").value,
          },
        });
        toast(t("t_renamed"));
        close();
        if (state.view === "servers") loadServers();
      } catch (err) {
        const hintNow = overlay.querySelector("#m-rename-hint");
        if (hintNow) hintNow.textContent = errText(err);
        const buttonNow = overlay.querySelector("#m-rename");
        if (buttonNow) buttonNow.disabled = false;
      }
    });
  }
}

/* ---------- boot ------------------------------------------------------- */

async function boot() {
  lang = detectLang();
  if (!(await ensureLang(lang))) lang = "en";
  applyStaticLang();
  try {
    const data = await api("api/me");
    state.me = data.user;
  } catch {
    state.me = null;
  }
  render();
  scheduleLangPrefetch();
}

boot();
