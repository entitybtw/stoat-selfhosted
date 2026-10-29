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
    delete_q: "Сервер «{s}» и все его данные будут удалены безвозвратно.",
    deleting: "Удаление…",
    t_deleted: "Сервер удалён: каналов {c}, сообщений {m}, участников {n}",

    drawer_created: "Создан {d}",
    tab_members: "Участники",
    tab_roles: "Роли",
    tab_settings: "Настройки",
    m_add_title: "Добавить участника",
    m_add_hint: "Введите имя или username#дискриминатор — список сузится.",
    m_add_none: "Добавлять больше некого",
    m_add: "Добавить",
    m_search_ph: "Поиск участников",
    m_pick_hint: "Выберите участника, чтобы изменить его псевдоним или роли.",
    m_edit_title: "Участник",
    m_joined: "вступил {d}",
    m_owner: "Владелец",
    m_remove: "Удалить из сервера",
    f_nickname: "Псевдоним на этом сервере",
    nickname_hint: "Пусто — участник показывается под обычным именем.",
    f_roles: "Роли",
    roles_new: "Новая роль",
    roles_create: "Создать роль",
    f_role_name: "Название роли",
    f_role_colour: "Цвет",
    f_role_rank: "Ранг",
    roles_holders: "участников: {n}",
    roles_none: "Ролей пока нет",
    delete_warn_short: "Удаление сервера сотрёт его каналы, сообщения и участников.",
    confirm_member_remove: "Удалить {u} из этого сервера?",
    confirm_role_delete:
      "Удалить роль «{r}»? Она будет снята со всех участников.",
    t_member_added: "Участник добавлен",
    t_member_saved: "Участник обновлён",
    t_member_removed: "Участник удалён",
    t_role_created: "Роль создана",
    t_role_deleted: "Роль удалена, обновлено участников: {n}",
    err_missing_user: "Выберите пользователя",
    err_user_not_found: "Пользователь не найден",
    err_already_member: "Этот пользователь уже в сервере",
    err_is_owner: "Владельца нельзя удалить из сервера",
    err_invalid_roles: "Некорректный список ролей",
    err_invalid_role_name: "Название роли: 1–32 символа",
    err_too_many_roles: "Слишком много ролей (максимум 100)",

    /* drawer: split panes, avatar editing, role detail */
    cancel: "Отмена",
    delete_confirm_label: "Введите название сервера, чтобы подтвердить",
    copy_name: "Скопировать",
    chip_members: "Участников: {n}",
    chip_roles: "Ролей: {n}",
    chip_owner: "Владелец: {u}",
    m_add_search_ph: "Имя или username#0000",
    back_to_add: "К поиску участников",
    m_owner_note: "Владелец сервера — его нельзя удалить",
    remove_short: "Удалить из сервера",
    member_deleted_account: "Аккаунт удалён",
    roles_default_name: "Роль {n}",
    role_rank_short: "#{r}",
    role_rank_hint: "Больший ранг показывает роль выше в списке.",
    roles_holders_title: "У кого эта роль",
    roles_no_holders: "Пока ни у кого",
    roles_none_create: "Создать первую роль",
    role_edit_title: "Изменить роль…",
    avatar_change: "Сменить аватар на сервере",
    t_avatar_saved: "Аватар обновлён",
    err_avatar_not_found: "Файл аватара не найден",
    err_invalid_avatar: "Некорректный файл аватара",
    err_media_unavailable: "Хранилище файлов недоступно, попробуйте позже",
    err_invalid_image: "Эту картинку не прочитать. Подойдёт JPEG или PNG.",
    err_empty_file: "Файл пустой",
    err_file_too_large: "Файл больше 12 МБ",

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
    lang_title: "Выберите язык",
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
    delete_q: "The server “{s}” and all of its data will be gone for good.",
    deleting: "Deleting…",
    t_deleted: "Server deleted: {c} channels, {m} messages, {n} members",

    drawer_created: "Created {d}",
    tab_members: "Members",
    tab_roles: "Roles",
    tab_settings: "Settings",
    m_add_title: "Add a member",
    m_add_hint: "Type a name or username#discriminator to narrow the list.",
    m_add_none: "Nobody left to add",
    m_add: "Add",
    m_search_ph: "Search members",
    m_pick_hint: "Pick a member to change their nickname or roles.",
    m_edit_title: "Member",
    m_joined: "joined {d}",
    m_owner: "Owner",
    m_remove: "Remove from server",
    f_nickname: "Nickname on this server",
    nickname_hint: "Empty — the member is shown under the usual name.",
    f_roles: "Roles",
    roles_new: "New role",
    roles_create: "Create role",
    f_role_name: "Role name",
    f_role_colour: "Colour",
    f_role_rank: "Rank",
    roles_holders: "{n} members",
    roles_none: "No roles yet",
    delete_warn_short:
      "Deleting the server removes its channels, messages and members.",
    confirm_member_remove: "Remove {u} from this server?",
    confirm_role_delete:
      "Delete the role “{r}”? It will be taken off every member.",
    t_member_added: "Member added",
    t_member_saved: "Member updated",
    t_member_removed: "Member removed",
    t_role_created: "Role created",
    t_role_deleted: "Role deleted, members updated: {n}",
    err_missing_user: "Choose a user",
    err_user_not_found: "User not found",
    err_already_member: "This user is already in the server",
    err_is_owner: "The owner cannot be removed from the server",
    err_invalid_roles: "Invalid role list",
    err_invalid_role_name: "Role name: 1–32 characters",
    err_too_many_roles: "Too many roles (100 at most)",

    /* drawer: split panes, avatar editing, role detail */
    cancel: "Cancel",
    delete_confirm_label: "Type the server name to confirm",
    copy_name: "Copy",
    chip_members: "Members: {n}",
    chip_roles: "Roles: {n}",
    chip_owner: "Owner: {u}",
    m_add_search_ph: "Name or username#0000",
    back_to_add: "Back to adding members",
    m_owner_note: "This is the server owner and cannot be removed",
    remove_short: "Remove from server",
    member_deleted_account: "Deleted account",
    roles_default_name: "Role {n}",
    role_rank_short: "#{r}",
    role_rank_hint: "A higher rank shows the role further up the list.",
    roles_holders_title: "Who has this role",
    roles_no_holders: "Nobody yet",
    roles_none_create: "Create the first role",
    role_edit_title: "Edit role…",
    avatar_change: "Change the avatar on this server",
    t_avatar_saved: "Avatar updated",
    err_avatar_not_found: "Avatar file not found",
    err_invalid_avatar: "Invalid avatar file",
    err_media_unavailable: "File storage is unavailable, try again later",
    err_invalid_image: "This image cannot be read. JPEG or PNG will work.",
    err_empty_file: "The file is empty",
    err_file_too_large: "The file is larger than 12 MB",

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
    lang_title: "Select your language",
  },
};

/* All languages shipped by the Stoat client (Languages.ts), same order.
   en and ru are embedded below; every other code lazy-loads from
   ./i18n/<code>.js (a plain `export default { … }` module). */
const LANGS = [
  { code: "en", display: "English (Traditional)", emoji: "🇬🇧" },
  { code: "en-US", display: "English (Simplified)", emoji: "🇺🇸" },
  { code: "ar", display: "عربي", emoji: "🇸🇦", rtl: true, verified: true },
  { code: "as", display: "অসমীয়া", emoji: "🇮🇳" },
  { code: "az", display: "Azərbaycan dili", emoji: "🇦🇿" },
  { code: "be", display: "Беларуская", emoji: "🇧🇾" },
  { code: "bg", display: "Български", emoji: "🇧🇬" },
  { code: "bn", display: "বাংলা", emoji: "🇧🇩" },
  { code: "br", display: "Brezhoneg", verified: true },
  { code: "ca", display: "Català", emoji: "🇪🇸" },
  { code: "ceb", display: "Bisaya", emoji: "🇵🇭" },
  { code: "ckb", display: "کوردی", rtl: true },
  { code: "cs", display: "Čeština", emoji: "🇨🇿" },
  { code: "da", display: "Dansk", emoji: "🇩🇰" },
  { code: "de", display: "Deutsch", emoji: "🇩🇪", verified: true },
  { code: "el", display: "Ελληνικά", emoji: "🇬🇷" },
  { code: "es", display: "Español", emoji: "🇪🇸" },
  { code: "es-419", display: "Español (América Latina)", emoji: "🇪🇸" },
  { code: "et", display: "eesti", emoji: "🇪🇪", verified: true },
  { code: "fi", display: "suomi", emoji: "🇫🇮" },
  { code: "fil", display: "Filipino", emoji: "🇵🇭" },
  { code: "fr", display: "Français", emoji: "🇫🇷", verified: true },
  { code: "ga", display: "Gaeilge", emoji: "🇮🇪" },
  { code: "hi", display: "हिन्दी", emoji: "🇮🇳" },
  { code: "hr", display: "Hrvatski", emoji: "🇭🇷" },
  { code: "hu", display: "Magyar", emoji: "🇭🇺", verified: true },
  { code: "hy", display: "հայերեն", emoji: "🇦🇲" },
  { code: "id", display: "Bahasa Indonesia", emoji: "🇮🇩" },
  { code: "is", display: "Íslenska", emoji: "🇮🇸" },
  { code: "it", display: "Italiano", emoji: "🇮🇹" },
  { code: "ja", display: "日本語", emoji: "🇯🇵" },
  { code: "ko", display: "한국어", emoji: "🇰🇷" },
  { code: "lb", display: "Lëtzebuergesch", emoji: "🇱🇺" },
  { code: "lt", display: "Lietuvių", emoji: "🇱🇹" },
  { code: "lv", display: "Latviešu", emoji: "🇱🇻", verified: true },
  { code: "mk", display: "Македонски", emoji: "🇲🇰" },
  { code: "ms", display: "Bahasa Melayu", emoji: "🇲🇾" },
  { code: "nb-NO", display: "Norsk bokmål", emoji: "🇳🇴" },
  { code: "nl", display: "Nederlands", emoji: "🇳🇱" },
  { code: "fa", display: "فارسی", emoji: "🇮🇷", rtl: true, verified: true },
  { code: "pl", display: "Polski", emoji: "🇵🇱" },
  { code: "pt-BR", display: "Português (do Brasil)", emoji: "🇧🇷" },
  { code: "pt-PT", display: "Português (Portugal)", emoji: "🇵🇹" },
  { code: "ro", display: "Română", emoji: "🇷🇴" },
  { code: "ru", display: "Русский", emoji: "🇷🇺", verified: true },
  { code: "sk", display: "Slovensky", emoji: "🇸🇰" },
  { code: "sl", display: "Slovenščina", emoji: "🇸🇮" },
  { code: "sq", display: "Shqip", emoji: "🇦🇱" },
  { code: "sr", display: "Српски", emoji: "🇷🇸" },
  { code: "si", display: "සිංහල", emoji: "🇱🇰" },
  { code: "sv", display: "Svenska", emoji: "🇸🇪", verified: true },
  { code: "ta", display: "தமிழ்", emoji: "🇮🇳" },
  { code: "th", display: "ไทย", emoji: "🇹🇭" },
  { code: "tr", display: "Türkçe", emoji: "🇹🇷" },
  { code: "ur", display: "اردو", emoji: "🇵🇰", rtl: true },
  { code: "uk", display: "Українська", emoji: "🇺🇦", verified: true },
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

function browserPreferredLang() {
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

function detectLang() {
  try {
    const saved = localStorage.getItem("stoat_admin_lang");
    if (saved && LANG_BY_CODE.has(saved)) return saved;
  } catch {
    /* storage unavailable */
  }
  return browserPreferredLang();
}

/* The language the browser asks for: the picker pins it to the top of the
   list, exactly like the Stoat settings language list does. */
const PREFERRED = browserPreferredLang();

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

/* Reflect a language choice in every switch on the page (optimistic on
   click, revert on a failed module load). */
function paintLangChoice(code) {
  const entry = LANG_BY_CODE.get(code);
  document.querySelectorAll("[data-set-lang]").forEach((wrap) => {
    wrap.querySelectorAll("[data-lang]").forEach((opt) => {
      const on = opt.getAttribute("data-lang") === code;
      opt.setAttribute("aria-selected", on ? "true" : "false");
      opt.classList.toggle("is-selected", on);
    });
    const desc = wrap.querySelector(".cat-desc");
    if (desc && entry) desc.textContent = entry.display;
  });
}

async function setLang(next) {
  if (next === lang || !LANG_BY_CODE.has(next) || langBusy) return;
  langBusy = true;
  /* Optimistic selection, then disable every control of the switch while the
     module loads so a second change cannot race the first one. */
  paintLangChoice(next);
  const controls = Array.from(
    document.querySelectorAll("[data-set-lang] button"),
  );
  controls.forEach((node) => {
    node.disabled = true;
  });
  const ok = await ensureLang(next);
  controls.forEach((node) => {
    node.disabled = false;
  });
  langBusy = false;
  if (!ok) {
    /* Module missing — put every switch back on the working language. */
    paintLangChoice(lang);
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
    active && active.closest && active.closest("[data-set-lang]"),
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
    const trigger = document.querySelector(
      "[data-set-lang] [data-set-lang-trigger]",
    );
    if (trigger) trigger.focus();
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

/* ---------- language switcher (Stoat settings: CategoryButton.Select) ---- */

/* Material Symbols used by the Stoat settings language picker. */
const ICON_LANG = `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 0 1 5.08 16zm2.95-8H5.08a7.987 7.987 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>`;
const ICON_CHEVRON = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>`;
const ICON_VERIFIED = `<svg class="cat-badge" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M23,12l-2.44-2.79l0.34-3.69l-3.61-0.82L15.4,1.5L12,2.96L8.6,1.5L6.71,4.69L3.1,5.5L3.44,9.2L1,12l2.44,2.79l-0.34,3.7 l3.61,0.82L8.6,22.5l3.4-1.47l3.4,1.46l1.89-3.19l3.61-0.82l-0.34-3.69L23,12z M10.09,16.72l-3.8-3.81l1.48-1.48l2.32,2.33 l5.85-5.87l1.48,1.48L10.09,16.72z"/></svg>`;

/* Same cap the Stoat select uses, clamped to the viewport so the list can
   never grow out of the sidebar (it expands upwards into the free space). */
const LANG_LIST_MAX = 340;

/* Keys the open list treats as "move the focus between the options". */
const LANG_LIST_KEYS = [
  "ArrowDown",
  "ArrowUp",
  "PageDown",
  "PageUp",
  "Home",
  "End",
];

/* The browser's preferred language goes first, exactly like the Stoat
   settings language list. */
function langOrder() {
  const idx = LANGS.findIndex((entry) => entry.code === PREFERRED);
  if (idx <= 0) return LANGS;
  return [LANGS[idx], ...LANGS.slice(0, idx), ...LANGS.slice(idx + 1)];
}

function langSwitchHTML() {
  const current = LANG_BY_CODE.get(lang) || LANGS[0];
  const title = t("lang_title");
  const options = langOrder()
    .map((entry) => {
      const on = entry.code === lang;
      const glyph = entry.emoji
        ? esc(entry.emoji)
        : `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 0 1 5.08 16zm2.95-8H5.08a7.987 7.987 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>`;
      const badge = entry.verified ? ICON_VERIFIED : "";
      return `
        <button type="button" class="cat-btn cat-opt${
          on ? " is-selected" : ""
        }" role="option" aria-selected="${on}" data-lang="${esc(entry.code)}">
          <span class="cat-icon"><span class="cat-emoji">${glyph}</span></span>
          <span class="cat-content">
            <span class="cat-text"><span class="cat-label">${esc(
              entry.display,
            )}</span>${badge}</span>
          </span>
          <span class="cat-action"><span class="cat-radio"></span></span>
        </button>`;
    })
    .join("");

  return `
    <div class="lang-switch" data-set-lang>
      <button type="button" class="cat-btn cat-tonal cat-trigger"
              data-set-lang-trigger aria-haspopup="listbox" aria-expanded="false">
        <span class="cat-icon">${ICON_LANG}</span>
        <span class="cat-content">
          <span class="cat-text"><span class="cat-label">${esc(
            title,
          )}</span></span>
          <span class="cat-desc">${esc(current.display)}</span>
        </span>
        <span class="cat-action">${ICON_CHEVRON}</span>
      </button>
      <div class="lang-options" role="listbox" aria-label="${esc(
        title,
      )}">${options}
      </div>
    </div>`;
}

function langListHeight(panel) {
  const room = Math.max(
    140,
    Math.min(LANG_LIST_MAX, window.innerHeight - 300),
  );
  return Math.min(panel.scrollHeight, room);
}

function openLangSwitch(wrap, focusOption) {
  const panel = wrap.querySelector(".lang-options");
  const trigger = wrap.querySelector("[data-set-lang-trigger]");
  if (!panel) return;
  wrap.classList.add("open");
  if (trigger) trigger.setAttribute("aria-expanded", "true");
  const content = panel.scrollHeight;
  const height = langListHeight(panel);
  panel.style.height = `${height}px`;
  /* Long lists open scrolled to the current language, like Stoat does. */
  const sel = panel.querySelector('[aria-selected="true"]');
  if (content > height && sel) {
    panel.scrollTop = Math.max(
      0,
      sel.offsetTop - (panel.clientHeight - sel.offsetHeight) / 2,
    );
  }
  /* Opening with the keyboard puts focus on the current option (listbox
     pattern); a click leaves it on the trigger so the pointer user is not
     moved around. preventScroll keeps the centering we just computed. */
  if (focusOption && sel) sel.focus({ preventScroll: true });
}

function closeLangSwitch(wrap) {
  const panel = wrap.querySelector(".lang-options");
  const trigger = wrap.querySelector("[data-set-lang-trigger]");
  wrap.classList.remove("open");
  if (trigger) trigger.setAttribute("aria-expanded", "false");
  if (panel) {
    panel.style.height = "0px";
    panel.scrollTop = 0;
  }
}

function toggleLangSwitch(wrap) {
  if (wrap.classList.contains("open")) closeLangSwitch(wrap);
  else openLangSwitch(wrap);
}

/* Clicking anywhere else — or pressing Esc — collapses every open list. */
function closeOpenLangSwitches(except) {
  document.querySelectorAll(".lang-switch.open").forEach((wrap) => {
    if (wrap !== except) closeLangSwitch(wrap);
  });
}

function wireLangSwitches() {
  document.querySelectorAll("[data-set-lang]").forEach((wrap) => {
    const trigger = wrap.querySelector("[data-set-lang-trigger]");
    if (!trigger) return;
    trigger.addEventListener("click", () => toggleLangSwitch(wrap));
    wrap.querySelectorAll("[data-lang]").forEach((opt) => {
      opt.addEventListener("click", () => {
        closeLangSwitch(wrap);
        /* The list disappears from under the pointer, so hand focus back to
           the trigger instead of dropping it on <body>. */
        const home = wrap.querySelector("[data-set-lang-trigger]");
        if (home) home.focus();
        setLang(opt.getAttribute("data-lang"));
      });
    });
    /* A listbox must answer the arrow keys: they open a closed list on the
       current language, then move the focus between the options. */
    wrap.addEventListener("keydown", (event) => {
      if (!LANG_LIST_KEYS.includes(event.key)) return;
      if (!wrap.classList.contains("open")) {
        event.preventDefault();
        openLangSwitch(wrap, true);
        return;
      }
      const opts = Array.from(wrap.querySelectorAll("[data-lang]"));
      if (!opts.length) return;
      let index = opts.indexOf(document.activeElement);
      if (index < 0) {
        /* Focus still sits on the trigger: land on the selected language.
           Home / End jump straight to the ends instead. */
        index =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? opts.length - 1
              : Math.max(
                  0,
                  opts.findIndex(
                    (node) => node.getAttribute("aria-selected") === "true",
                  ),
                );
      } else if (event.key === "ArrowDown") index += 1;
      else if (event.key === "ArrowUp") index -= 1;
      else if (event.key === "PageDown") index += 5;
      else if (event.key === "PageUp") index -= 5;
      else if (event.key === "Home") index = 0;
      else if (event.key === "End") index = opts.length - 1;
      event.preventDefault();
      const target = opts[Math.max(0, Math.min(opts.length - 1, index))];
      if (target) target.focus();
    });
    /* Tab (or a click) that carries the focus out of the switch must not
       leave a list hanging open over the content. */
    wrap.addEventListener("focusout", (event) => {
      if (!wrap.classList.contains("open")) return;
      const next = event.relatedTarget;
      if (next && wrap.contains(next)) return;
      closeLangSwitch(wrap);
    });
    /* Warm the translation modules the moment the control is pointed at or
       focused, so the first switch is instant. */
    wrap.addEventListener("pointerenter", prefetchLangs, { once: true });
    wrap.addEventListener("focusin", prefetchLangs, { once: true });
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
        <div class="sidebar-bottom">
          <div class="sidebar-lang">${langSwitchHTML()}</div>
          <div class="sidebar-footer">
            <span class="who" title="${esc(state.me.username)}#${esc(state.me.discriminator)}">
              ${esc(state.me.username)}<span class="dim">#${esc(state.me.discriminator)}</span>
            </span>
            <span class="footer-actions">
              <button class="btn flat small" id="logout">${esc(t("logout"))}</button>
            </span>
          </div>
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

/* Rows open on click, but a row is not a button: make it reachable with the
   keyboard too. Enter / Space reuse the click handler (so the server row's
   "delete button inside a row" guard keeps working), and the keydown is
   ignored when a real control inside the row holds the focus. */
function wireRowKeys(row) {
  row.tabIndex = 0;
  row.addEventListener("keydown", (event) => {
    if (event.target !== row) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    row.click();
  });
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
    wireRowKeys(row);
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
  // A payload without paging (an empty list answered by a stub or an older
  // build) used to print "Page undefined of NaN"; fall back to a single page.
  const limit = data.limit > 0 ? data.limit : (data.items?.length || 1);
  const total = Number.isFinite(data.total) ? data.total : (data.items?.length || 0);
  const page = Number.isFinite(data.page) && data.page >= 1 ? data.page : 1;
  const pages = Math.max(1, Math.ceil(total / limit));
  element.innerHTML = `
    <button class="btn tonal small" id="page-prev" ${page <= 1 ? "disabled" : ""}>${esc(t("prev"))}</button>
    <span>${esc(t("page", { p: page, n: pages }))}</span>
    <button class="btn tonal small" id="page-next" ${page >= pages ? "disabled" : ""}>${esc(t("next"))}</button>`;
  element.querySelector("#page-prev").addEventListener("click", () => go(page - 1));
  element.querySelector("#page-next").addEventListener("click", () => go(page + 1));
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
    wireRowKeys(row);
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

/* ---------- server drawer ------------------------------------------------ */

/* One server, opened from the servers table.
   Each tab is a layout of its own: the roster and the editor are two panes
   that scroll independently, so nothing ever slides under the header and
   the page never grows a second scrollbar. */

const drawerSeq = { current: null };
/** Where the open drawer lives, so avatars can be fetched through it. */
let drawerServerId = null;
/** The role detail pane: `id` null means "create a new one". */
let roleDraft = { id: null, colour: "#5470ec", rank: 0 };

/* One letter, not two: a two-letter monogram of "deleted user" reads as a
   real name ("DE") instead of a placeholder. */
function initials(name) {
  const clean = String(name || "").trim();
  const first = Array.from(clean)[0] || "";
  return esc(first.toUpperCase() || "?");
}

/** Avatar via the panel's own media proxy; initials when there is none. */
function avatarHTML(hasAvatar, name, size = 32, userId) {
  const style = `--avatar-size:${size}px`;
  if (hasAvatar && userId && drawerServerId) {
    const src = url(
      `api/servers/${drawerServerId}/members/${encodeURIComponent(userId)}/avatar?v=${avatarStamp(userId)}`,
    );
    return `<span class="avatar" style="${style}"><img src="${esc(
      src,
    )}" alt="" onerror="this.remove()" /></span>`;
  }
  return `<span class="avatar" style="${style}">${initials(name)}</span>`;
}

/* Bumped whenever a picture changes, so the browser drops the cached copy of
   the proxied avatar without waiting for the one-hour max-age to run out. */
const avatarStamps = new Map();
function avatarStamp(userId) {
  return avatarStamps.get(userId) || 0;
}

function roleTag(role) {
  const colour = role.colour ? ` style="color:${esc(role.colour)}"` : "";
  return `<span class="role-tag" title="${esc(role.name)}"><span class="role-dot"${
    role.colour ? ` style="background:${esc(role.colour)}"` : ""
  }></span><span${colour}>${esc(role.name)}</span></span>`;
}

/** Short date for rows: joining in 2026 is past, the time of day is noise. */
function fmtDay(ms) {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString(locale(), { dateStyle: "medium" });
}

function rolesOf(data, ids) {
  const byId = new Map(data.roles.map((role) => [role.id, role]));
  return (ids || []).map((id) => byId.get(id)).filter(Boolean);
}

/** Owner first, then by name — the way a roster reads. */
function sortMembers(members) {
  return [...members].sort((a, b) => {
    if (a.owner !== b.owner) return a.owner ? -1 : 1;
    return String(a.displayName || a.id).localeCompare(
      String(b.displayName || b.id),
    );
  });
}

function memberMatches(member, query) {
  if (!query) return true;
  const needle = query.toLowerCase();
  return [
    member.displayName,
    member.user && member.user.tag,
    member.user && member.user.username,
    member.user && member.user.displayName,
    member.id,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(needle));
}

async function openServer(server, deleteMode = false) {
  if (!server) return;
  closeOverlays();
  const seq = bump();
  let data;
  try {
    data = await api(`api/servers/${server.id}`);
  } catch (err) {
    if (seq === viewSeq) toast(errText(err), true);
    return;
  }
  if (seq !== viewSeq) return;

  if (deleteMode) {
    openServerDelete(server);
    return;
  }
  openServerDrawer(data);
}

/* Deletion keeps the type-the-name confirmation: it is the one place where
   an admin really does have to spell something out. The name sits right
   above the box and can be copied, so nobody retypes it by hand. */
function openServerDelete(server) {
  closeOverlays();
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `
    <div class="modal dialog-sm" role="dialog" aria-modal="true">
      <h2>${esc(t("delete_server"))}</h2>
      <p class="dialog-lead">${esc(t("delete_q", { s: server.name }))}</p>
      <div class="hint note">${esc(t("delete_warn"))}</div>
      <div class="field">
        <label for="m-confirm">${esc(t("delete_confirm_label"))}</label>
        <div class="confirm-box">
          <span class="confirm-name" title="${esc(server.name)}">${esc(
            server.name,
          )}</span>
          <button class="btn tonal small" id="m-copy" type="button">${esc(
            t("copy_name"),
          )}</button>
        </div>
        <input type="text" id="m-confirm" autocomplete="off" spellcheck="false" />
      </div>
      <div class="modal-actions">
        <button class="btn flat" id="m-close" type="button">${esc(t("cancel"))}</button>
        <button class="btn danger" id="m-delete" type="button" disabled>${esc(
          t("delete"),
        )}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  overlay.querySelector("#m-close").addEventListener("click", close);
  overlay.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });

  const confirmInput = overlay.querySelector("#m-confirm");
  const deleteButton = overlay.querySelector("#m-delete");
  const sync = () => {
    deleteButton.disabled = confirmInput.value !== server.name;
  };
  confirmInput.addEventListener("input", sync);
  overlay.querySelector("#m-copy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(server.name);
      confirmInput.value = server.name;
      sync();
      toast(t("copied"));
    } catch {
      // Clipboard is unavailable on plain HTTP; selecting the text is the
      // next best thing and still saves retyping.
      const box = overlay.querySelector(".confirm-name");
      const range = document.createRange();
      range.selectNodeContents(box);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
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
      deleteButton.disabled = false;
      deleteButton.textContent = t("delete");
    }
  });
  confirmInput.focus();
}

function openServerDrawer(data) {
  const seq = bump();
  drawerSeq.current = seq;
  drawerServerId = data.id;

  const view = {
    tab: "members",
    query: "",
    picked: null,
    rolesDraft: [],
  };
  roleDraft = { id: null, colour: "#5470ec", rank: 0 };

  const overlay = document.createElement("div");
  overlay.className = "overlay overlay-drawer";
  overlay.innerHTML = `
    <div class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-name">
      <header class="drawer-head">
        <div class="drawer-title">
          <h2 id="drawer-name" title="${esc(data.name)}">${esc(data.name)}</h2>
          <div class="drawer-sub">
            <span class="chip" id="drawer-chip-members"></span>
            <span class="chip" id="drawer-chip-roles"></span>
            <span class="chip" id="drawer-chip-owner"></span>
          </div>
        </div>
        <button class="icon-btn" id="drawer-close" type="button" aria-label="${esc(
          t("close"),
        )}" title="${esc(t("close"))}">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </header>
      <div class="drawer-tabs" id="drawer-tabs" role="tablist">
        <button class="drawer-tab active" data-tab="members" role="tab" type="button">
          ${esc(t("tab_members"))}<span class="drawer-count" id="tab-members-count"></span>
        </button>
        <button class="drawer-tab" data-tab="roles" role="tab" type="button">
          ${esc(t("tab_roles"))}<span class="drawer-count" id="tab-roles-count"></span>
        </button>
        <button class="drawer-tab" data-tab="settings" role="tab" type="button">${esc(
          t("tab_settings"),
        )}</button>
      </div>
      <div class="drawer-body" id="drawer-body"></div>
    </div>`;
  document.body.appendChild(overlay);

  const close = () => {
    drawerSeq.current = null;
    drawerServerId = null;
    overlay.remove();
    if (state.view === "servers") loadServers();
  };
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  overlay.querySelector("#drawer-close").addEventListener("click", close);
  overlay.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !document.querySelector(".overlay:not(.overlay-drawer)"))
      close();
  });

  overlay.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      view.tab = button.dataset.tab;
      overlay
        .querySelectorAll("[data-tab]")
        .forEach((tab) => tab.classList.toggle("active", tab === button));
      paintTab();
    });
  });

  const bodyOf = () => overlay.querySelector("#drawer-body");

  function setData(next) {
    data = next;
    const nameEl = overlay.querySelector("#drawer-name");
    if (nameEl) {
      nameEl.textContent = data.name;
      nameEl.title = data.name;
    }
    const chip = (id, text) => {
      const el = overlay.querySelector(id);
      if (el) el.textContent = text;
    };
    chip("#drawer-chip-members", t("chip_members", { n: data.members.length }));
    chip("#drawer-chip-roles", t("chip_roles", { n: data.roles.length }));
    chip(
      "#drawer-chip-owner",
      data.ownerUser ? t("chip_owner", { u: data.ownerUser.tag }) : "",
    );
    chip("#tab-members-count", data.members.length);
    chip("#tab-roles-count", data.roles.length);
  }
  setData(data);

  async function refresh() {
    const mine = bump();
    drawerSeq.current = mine;
    try {
      const next = await api(`api/servers/${data.id}`);
      if (drawerSeq.current !== mine) return;
      setData(next);
      paintTab();
    } catch (err) {
      toast(errText(err), true);
    }
  }

  function paintTab() {
    const body = bodyOf();
    if (!body) return;
    const pick = view.picked && data.members.find((m) => m.id === view.picked);
    if (!pick) view.picked = null;
    if (view.tab === "members") paintMembers(body, pick);
    else if (view.tab === "roles") paintRoles(body);
    else paintSettings(body);
  }

  function goTab(tab) {
    view.tab = tab;
    overlay
      .querySelectorAll("[data-tab]")
      .forEach((node) => node.classList.toggle("active", node.dataset.tab === tab));
    paintTab();
  }

  /* ---- members -------------------------------------------------------- */

  function paintMembers(body, picked) {
    body.className = "drawer-body split";
    body.innerHTML = `
      <section class="pane pane-list">
        <div class="pane-head">
          <input class="pane-search" id="m-search" type="search" placeholder="${esc(
            t("m_search_ph"),
          )}" value="${esc(view.query)}" autocomplete="off" />
        </div>
        <div class="pane-scroll" id="m-member-list"></div>
      </section>
      <section class="pane pane-detail" id="m-detail"></section>`;
    paintMemberList(body);
    paintDetail(body, picked);
    wireAddPane(body);
  }

  function memberRowHTML(member) {
    const roles = rolesOf(data, member.roles);
    const tags = roles.slice(0, 2).map(roleTag).join("");
    const more =
      roles.length > 2 ? `<span class="role-tag">+${roles.length - 2}</span>` : "";
    const also =
      member.user && member.user.displayName && member.nickname
        ? `<span class="member-meta-dim">${esc(member.user.displayName)}</span>`
        : "";
    return `
      <button class="member-row ${view.picked === member.id ? "picked" : ""}" data-member="${esc(
        member.id,
      )}" type="button">
        ${avatarHTML(member.hasAvatar, member.displayName, 32, member.id)}
        <span class="member-main">
          <span class="member-name">
            <span class="member-name-text">${esc(member.displayName || member.id)}</span>
            ${
              member.owner
                ? `<span class="badge admin owner-badge">${esc(t("m_owner"))}</span>`
                : ""
            }
          </span>
          <span class="member-sub">${also}</span>
          ${tags ? `<span class="member-meta">${tags}${more}</span>` : ""}
        </span>
        <span class="member-since">${esc(fmtDay(member.joinedAt))}</span>
      </button>`;
  }

  function paintMemberList(body) {
    const list = body.querySelector("#m-member-list");
    if (!list) return;
    const shown = sortMembers(data.members).filter((member) =>
      memberMatches(member, view.query),
    );
    list.innerHTML = shown.length
      ? shown.map(memberRowHTML).join("")
      : `<div class="pane-empty">${esc(t("empty"))}</div>`;
    list.querySelectorAll("[data-member]").forEach((row) => {
      row.addEventListener("click", () => pick(row.dataset.member));
    });
  }

  function pick(id) {
    const next = view.picked === id ? null : id;
    view.picked = next;
    const member = next ? data.members.find((entry) => entry.id === next) : null;
    view.rolesDraft = member ? [...member.roles] : [];
    const body = bodyOf();
    if (!body) return;
    paintMemberList(body);
    paintDetail(body, member);
  }

  /**
   * Add, search and edit share the right-hand pane: searching there offers
   * the accounts that are not in the server yet, so adding somebody is a
   * search and one click, never a separate form off to the side.
   */
  function paintDetail(body, picked) {
    const detail = body.querySelector("#m-detail");
    if (!detail) return;
    detail.innerHTML = picked ? memberEditorHTML(picked) : addPaneHTML();
    if (picked) wireMemberEditor(body, picked);
    else wireAddPane(body);
  }

  function addPaneHTML() {
    return `
      <div class="pane-head">
        <input class="pane-search" id="m-add-q" type="search" placeholder="${esc(
          t("m_add_search_ph"),
        )}" value="${esc(view.query)}" autocomplete="off" />
      </div>
      <div class="pane-scroll">
        <div class="pick-list" id="m-add-results">
          <div class="pane-empty">${esc(t("loading"))}</div>
        </div>
        <div class="pane-note">${esc(t("m_pick_hint"))}</div>
      </div>`;
  }

  function wireAddPane(body) {
    const input = body.querySelector("#m-add-q");
    const results = body.querySelector("#m-add-results");
    if (!results) return;

    let timer;
    const run = async () => {
      const query = (view.query || "").trim();
      try {
        const found = await api(
          `api/servers/${data.id}/members?q=${encodeURIComponent(query)}`,
        );
        if (drawerSeq.current !== seq || !results.isConnected) return;
        const free = found.items.filter((user) => !user.member);
        results.innerHTML = free.length
          ? free
              .map(
                (user) => `
                <div class="search-hit">
                  ${avatarHTML(
                    Boolean(user.avatarId),
                    user.displayName || user.username,
                    30,
                    user.id,
                  )}
                  <span class="member-main">
                    <span class="member-name">
                      <span class="member-name-text">${esc(
                        user.displayName || user.username,
                      )}</span>
                    </span>
                    <span class="member-sub">${esc(user.tag)}</span>
                  </span>
                  <button class="btn tonal small" data-add="${esc(
                    user.id,
                  )}" type="button">${esc(t("m_add"))}</button>
                </div>`,
              )
              .join("")
          : `<div class="pane-empty">${esc(
              query ? t("empty") : t("m_add_none"),
            )}</div>`;
        results.querySelectorAll("[data-add]").forEach((button) => {
          button.addEventListener("click", () =>
            addMember(button.dataset.add, button),
          );
        });
      } catch (err) {
        if (drawerSeq.current !== seq) return;
        results.innerHTML = `<div class="pane-empty">${esc(errText(err))}</div>`;
      }
    };
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(run, 200);
    };
    if (input) {
      input.addEventListener("input", () => {
        view.query = input.value;
        const list = body.querySelector("#m-search");
        if (list) list.value = view.query;
        paintMemberList(body);
        schedule();
      });
    }
    run();
  }

  async function addMember(id, button) {
    button.disabled = true;
    try {
      await api(`api/servers/${data.id}/members`, {
        method: "POST",
        body: { user_id: id },
      });
      toast(t("t_member_added"));
      // Straight into the editor of the new member, so roles can be handed
      // out right away instead of making another trip through the list.
      view.picked = id;
      view.query = "";
      await refresh();
    } catch (err) {
      toast(errText(err), true);
      button.disabled = false;
    }
  }

  function memberEditorHTML(member) {
    const roles = rolesOf(data, member.roles);
    const account = member.user || {};
    const removed = !member.user;
    return `
      <div class="pane-head edit-head">
        <button class="avatar-btn" id="m-avatar" type="button" title="${esc(
          t("avatar_change"),
        )}" aria-label="${esc(t("avatar_change"))}">
          ${avatarHTML(member.hasAvatar, member.displayName, 48, member.id)}
          <span class="avatar-badge"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></span>
        </button>
        <input type="file" id="m-avatar-file" accept="image/png,image/jpeg,image/webp" hidden />
        <div class="edit-who">
          <div class="edit-name" title="${esc(member.displayName || member.id)}">${esc(
            member.displayName || member.id,
          )}</div>
          <div class="edit-sub">${esc(
            removed ? t("member_deleted_account") : account.tag || member.id,
          )}</div>
        </div>
        <button class="icon-btn" id="m-unpick" type="button" aria-label="${esc(
          t("back_to_add"),
        )}" title="${esc(t("back_to_add"))}">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>

      <div class="pane-scroll edit-body">
        <label class="edit-label" for="m-nickname">${esc(t("f_nickname"))}</label>
        <input class="edit-input" type="text" id="m-nickname" maxlength="32"
          placeholder="${esc(removed ? member.id : account.displayName || account.username || "")}"
          value="${esc(member.nickname || "")}" autocomplete="off" />
        <div class="edit-hint">${esc(t("nickname_hint"))}</div>

        <div class="edit-label">${esc(t("f_roles"))}</div>
        <div class="pick-list role-picks" id="m-role-picks">
          ${
            data.roles.length
              ? data.roles
                  .map(
                    (role) => `
                    <button class="role-pick ${
                      view.rolesDraft.includes(role.id) ? "on" : ""
                    }" data-role="${esc(role.id)}" type="button" aria-pressed="${
                      view.rolesDraft.includes(role.id) ? "true" : "false"
                    }">
                      <span class="role-check"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                      <span class="role-dot"${
                        role.colour ? ` style="background:${esc(role.colour)}"` : ""
                      }></span>
                      <span class="role-name">${esc(role.name)}</span>
                    </button>`,
                  )
                  .join("")
              : `<button class="role-pick add-role" id="m-go-roles" type="button">
                  <span class="role-check">+</span>
                  <span class="role-name">${esc(t("roles_none_create"))}</span>
                </button>`
          }
        </div>
        <div class="edit-hint error" id="m-role-hint"></div>

        <div class="edit-meta">
          <span>${esc(t("m_joined", { d: fmtDate(member.joinedAt) }))}</span>
          ${roles.length ? `<span class="role-tags">${roles.map(roleTag).join("")}</span>` : ""}
        </div>
      </div>

      <footer class="pane-foot">
        ${
          member.owner
            ? `<span class="pane-note">${esc(t("m_owner_note"))}</span>`
            : `<button class="btn danger small" id="m-remove" type="button">${esc(
                t("remove_short"),
              )}</button>`
        }
        <button class="btn primary" id="m-save-member" type="button">${esc(t("save"))}</button>
      </footer>`;
  }

  function wireMemberEditor(body, member) {
    const nickname = body.querySelector("#m-nickname");
    const save = body.querySelector("#m-save-member");
    const hint = body.querySelector("#m-role-hint");

    const sync = () => {
      const rolesChanged =
        [...view.rolesDraft].sort().join() !==
        [...(member.roles || [])].sort().join();
      const nickChanged =
        (nickname.value.trim() || null) !== (member.nickname || null);
      save.disabled = !rolesChanged && !nickChanged;
    };
    sync();
    nickname.addEventListener("input", sync);
    nickname.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !save.disabled) save.click();
    });

    body.querySelectorAll("#m-role-picks [data-role]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.role;
        view.rolesDraft = view.rolesDraft.includes(id)
          ? view.rolesDraft.filter((role) => role !== id)
          : [...view.rolesDraft, id];
        const on = view.rolesDraft.includes(id);
        button.classList.toggle("on", on);
        button.setAttribute("aria-pressed", on ? "true" : "false");
        sync();
      });
    });

    const goRoles = body.querySelector("#m-go-roles");
    if (goRoles) goRoles.addEventListener("click", () => goTab("roles"));

    save.addEventListener("click", async () => {
      hint.textContent = "";
      save.disabled = true;
      try {
        await api(`api/servers/${data.id}/members/${member.id}`, {
          method: "POST",
          body: {
            nickname: nickname.value.trim() || null,
            roles: view.rolesDraft,
          },
        });
        toast(t("t_member_saved"));
        await refresh();
      } catch (err) {
        hint.textContent = errText(err);
        sync();
      }
    });

    body.querySelector("#m-unpick").addEventListener("click", () => pick(member.id));

    /* ---- server avatar ---------------------------------------------- */

    const fileInput = body.querySelector("#m-avatar-file");
    const avatarButton = body.querySelector("#m-avatar");
    avatarButton.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      if (file.size > 12 * 1024 * 1024) {
        toast(t("err_file_too_large"), true);
        fileInput.value = "";
        return;
      }
      avatarButton.classList.add("busy");
      try {
        const bytes = await file.arrayBuffer();
        // Raw body, not JSON: the panel crops and re-encodes it server-side.
        const res = await fetch(
          url(
            `api/servers/${data.id}/members/${encodeURIComponent(member.id)}/avatar`,
          ),
          {
            method: "PUT",
            headers: { "Content-Type": file.type || "application/octet-stream" },
            body: bytes,
          },
        );
        let payload = null;
        try {
          payload = await res.json();
        } catch {
          /* empty body */
        }
        if (!res.ok) {
          const error = new Error((payload && payload.error) || `HTTP ${res.status}`);
          if (payload && payload.code) error.code = payload.code;
          throw error;
        }
        member.hasAvatar = true;
        avatarStamps.set(member.id, Date.now());
        toast(t("t_avatar_saved"));
        await refresh();
      } catch (err) {
        toast(errText(err), true);
      } finally {
        avatarButton.classList.remove("busy");
        fileInput.value = "";
      }
    });

    const remove = body.querySelector("#m-remove");
    if (remove) {
      remove.addEventListener("click", async () => {
        if (
          !window.confirm(
            t("confirm_member_remove", { u: member.displayName || member.id }),
          )
        )
          return;
        remove.disabled = true;
        try {
          await api(`api/servers/${data.id}/members/${member.id}`, {
            method: "DELETE",
          });
          toast(t("t_member_removed"));
          view.picked = null;
          await refresh();
        } catch (err) {
          toast(errText(err), true);
          remove.disabled = false;
        }
      });
    }
  }

  /* ---- roles ---------------------------------------------------------- */

  const ROLE_COLOURS = [
    "#f43f5e",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#06b6d4",
    "#5470ec",
    "#a855f7",
    "#ec4899",
  ];

  function nextRoleName() {
    const taken = new Set(data.roles.map((role) => role.name));
    for (let index = 1; index < 1000; index += 1) {
      const name = t("roles_default_name", { n: index });
      if (!taken.has(name)) return name;
    }
    return "";
  }

  function paintRoles(body) {
    body.className = "drawer-body split";
    const editing = data.roles.find((role) => role.id === roleDraft.id);
    body.innerHTML = `
      <section class="pane pane-list">
        <div class="pane-head">
          <span class="pane-title">${esc(t("tab_roles"))}</span>
          <button class="btn tonal small" id="r-new" type="button">${esc(
            t("roles_create"),
          )}</button>
        </div>
        <div class="pane-scroll">
          <div class="member-list" id="r-list">
            ${
              data.roles.length
                ? data.roles
                    .map((role) => {
                      const holders = data.members.filter((member) =>
                        member.roles.includes(role.id),
                      ).length;
                      return `
                        <button class="member-row ${role.id === roleDraft.id ? "picked" : ""}" data-open-role="${esc(
                          role.id,
                        )}" type="button">
                          <span class="avatar role-avatar"${
                            role.colour ? ` style="background:${esc(role.colour)}"` : ""
                          }>${esc((role.name || "#").slice(0, 1).toUpperCase())}</span>
                          <span class="member-main">
                            <span class="member-name"><span class="member-name-text">${esc(
                              role.name,
                            )}</span></span>
                            <span class="member-sub">${esc(
                              t("roles_holders", { n: holders }),
                            )}</span>
                          </span>
                          <span class="role-rank">${esc(
                            t("role_rank_short", { r: role.rank }),
                          )}</span>
                        </button>`;
                    })
                    .join("")
                : `<div class="pane-empty">${esc(t("roles_none"))}</div>`
            }
          </div>
        </div>
      </section>
      <section class="pane pane-detail" id="r-detail"></section>`;
    body.querySelectorAll("[data-open-role]").forEach((row) => {
      row.addEventListener("click", () => {
        const id = row.dataset.openRole;
        if (roleDraft.id === id) {
          roleDraft = { id: null, colour: "#5470ec", rank: 0 };
        } else {
          const role = data.roles.find((entry) => entry.id === id);
          roleDraft = { id, colour: role.colour || "#5470ec", rank: role.rank || 0 };
        }
        paintRoles(body);
      });
    });
    body.querySelector("#r-new").addEventListener("click", () => {
      roleDraft = { id: null, colour: "#5470ec", rank: 0 };
      paintRoles(body);
    });
    paintRoleDetail(body, editing);
  }

  function paintRoleDetail(body, editing) {
    const detail = body.querySelector("#r-detail");
    if (!detail) return;
    const holders = editing
      ? data.members.filter((member) => member.roles.includes(editing.id))
      : [];

    detail.innerHTML = `
      <div class="pane-head">
        <span class="pane-title">${
          editing ? esc(t("role_edit_title")) : esc(t("roles_new"))
        }</span>
      </div>
      <div class="pane-scroll edit-body">
        <label class="edit-label" for="r-name">${esc(t("f_role_name"))}</label>
        <input class="edit-input" type="text" id="r-name" maxlength="32"
          value="${esc(editing ? editing.name : nextRoleName())}" autocomplete="off" />

        <div class="edit-label">${esc(t("f_role_colour"))}</div>
        <div class="swatches" id="r-swatches">
          ${ROLE_COLOURS.map(
            (colour) => `
            <button class="swatch ${colour === roleDraft.colour ? "on" : ""}" data-colour="${colour}"
              type="button" style="--swatch:${colour}" aria-label="${colour}"
              aria-pressed="${colour === roleDraft.colour}"></button>`,
          ).join("")}
          <label class="swatch custom" title="${esc(t("f_role_colour"))}">
            <input type="color" id="r-colour" value="${esc(roleDraft.colour)}" />
          </label>
        </div>

        <div class="edit-label">${esc(t("f_role_rank"))}</div>
        <div class="rank-row">
          <button class="icon-btn" id="r-rank-down" type="button" aria-label="−">−</button>
          <span class="rank-value" id="r-rank-value">${esc(roleDraft.rank)}</span>
          <button class="icon-btn" id="r-rank-up" type="button" aria-label="+">+</button>
        </div>
        <div class="edit-hint">${esc(t("role_rank_hint"))}</div>

        ${
          editing
            ? `<div class="edit-label">${esc(t("roles_holders_title"))}</div>
               <div class="role-holders">
                 ${
                   holders.length
                     ? holders
                         .map(
                           (member) => `<span class="holder" title="${esc(
                             member.user ? member.user.tag : member.id,
                           )}">${avatarHTML(
                             member.hasAvatar,
                             member.displayName,
                             22,
                             member.id,
                           )}<span>${esc(member.displayName || member.id)}</span></span>`,
                         )
                         .join("")
                     : `<span class="pane-note">${esc(t("roles_no_holders"))}</span>`
                 }
               </div>`
            : ""
        }
        <div class="edit-hint error" id="r-hint"></div>
      </div>
      <footer class="pane-foot">
        ${
          editing
            ? `<button class="btn danger small" id="r-delete" type="button">${esc(
                t("delete"),
              )}</button>`
            : `<button class="btn flat" id="r-cancel" type="button">${esc(
                t("cancel"),
              )}</button>`
        }
        <button class="btn primary" id="r-save" type="button">${esc(
          editing ? t("save") : t("roles_create"),
        )}</button>
      </footer>`;

    const syncSwatches = () => {
      detail.querySelectorAll("[data-colour]").forEach((button) => {
        const on = button.dataset.colour === roleDraft.colour;
        button.classList.toggle("on", on);
        button.setAttribute("aria-pressed", on ? "true" : "false");
      });
    };
    detail.querySelectorAll("[data-colour]").forEach((button) => {
      button.addEventListener("click", () => {
        roleDraft.colour = button.dataset.colour;
        detail.querySelector("#r-colour").value = roleDraft.colour;
        syncSwatches();
      });
    });
    detail.querySelector("#r-colour").addEventListener("input", (event) => {
      roleDraft.colour = event.target.value;
      syncSwatches();
    });

    const setRank = (value) => {
      roleDraft.rank = Math.max(0, Math.min(999, value));
      detail.querySelector("#r-rank-value").textContent = String(roleDraft.rank);
    };
    detail
      .querySelector("#r-rank-down")
      .addEventListener("click", () => setRank(roleDraft.rank - 1));
    detail
      .querySelector("#r-rank-up")
      .addEventListener("click", () => setRank(roleDraft.rank + 1));

    const save = detail.querySelector("#r-save");
    save.addEventListener("click", async () => {
      const hint = detail.querySelector("#r-hint");
      hint.textContent = "";
      save.disabled = true;
      try {
        await api(`api/servers/${data.id}/roles`, {
          method: "POST",
          body: {
            name: detail.querySelector("#r-name").value.trim(),
            colour: roleDraft.colour,
            rank: roleDraft.rank,
          },
        });
        toast(t("t_role_created"));
        roleDraft = { id: null, colour: "#5470ec", rank: 0 };
        await refresh();
      } catch (err) {
        hint.textContent = errText(err);
        save.disabled = false;
      }
    });

    const del = detail.querySelector("#r-delete");
    if (del) {
      del.addEventListener("click", async () => {
        if (!window.confirm(t("confirm_role_delete", { r: editing.name }))) return;
        del.disabled = true;
        try {
          const result = await api(`api/servers/${data.id}/roles/${editing.id}`, {
            method: "DELETE",
          });
          toast(t("t_role_deleted", { n: result.members }));
          roleDraft = { id: null, colour: "#5470ec", rank: 0 };
          await refresh();
        } catch (err) {
          toast(errText(err), true);
          del.disabled = false;
        }
      });
    }

    const cancel = detail.querySelector("#r-cancel");
    if (cancel) {
      cancel.addEventListener("click", () => {
        roleDraft = { id: null, colour: "#5470ec", rank: 0 };
        paintRoles(body);
      });
    }
  }

  /* ---- settings ------------------------------------------------------- */

  function paintSettings(body) {
    body.className = "drawer-body single";
    body.innerHTML = `
      <div class="settings-cols">
        <section class="pane">
          <div class="pane-head"><span class="pane-title">${esc(t("s_edit"))}</span></div>
          <div class="pane-scroll edit-body">
            <label class="edit-label" for="m-name">${esc(t("f_server_name"))}</label>
            <input class="edit-input" type="text" id="m-name" maxlength="32" value="${esc(
              data.name,
            )}" />
            <label class="edit-label" for="m-desc">${esc(t("f_server_desc"))}</label>
            <textarea class="edit-input" id="m-desc" rows="3">${esc(
              data.description || "",
            )}</textarea>
            <div class="edit-hint error" id="m-rename-hint"></div>
          </div>
          <footer class="pane-foot">
            <button class="btn primary" id="m-rename" type="button">${esc(
              t("save"),
            )}</button>
          </footer>
        </section>

        <section class="pane">
          <div class="pane-head"><span class="pane-title">${esc(t("s_info"))}</span></div>
          <div class="pane-scroll edit-body">
            <dl class="info-list">
              <dt>ID</dt><dd class="mono">${esc(data.id)}</dd>
              <dt>${esc(t("th_owner"))}</dt><dd>${esc(
                data.ownerUser ? data.ownerUser.tag : data.owner,
              )}</dd>
              <dt>${esc(t("th_channels"))}</dt><dd>${esc(fmtNum(data.channels))}</dd>
              <dt>${esc(t("th_members"))}</dt><dd>${esc(fmtNum(data.members.length))}</dd>
              <dt>${esc(t("tab_roles"))}</dt><dd>${esc(fmtNum(data.roles.length))}</dd>
              <dt>${esc(t("th_created"))}</dt><dd>${esc(fmtDay(data.createdAt))}</dd>
            </dl>
            <div class="danger-block">
              <div class="danger-text">
                <strong>${esc(t("s_danger"))}</strong>
                <span>${esc(t("delete_warn_short"))}</span>
              </div>
              <button class="btn danger" id="m-del-open" type="button">${esc(
                t("delete_server"),
              )}</button>
            </div>
          </div>
        </section>
      </div>`;

    const save = body.querySelector("#m-rename");
    save.addEventListener("click", async () => {
      const hint = body.querySelector("#m-rename-hint");
      hint.textContent = "";
      save.disabled = true;
      try {
        await api(`api/servers/${data.id}/rename`, {
          method: "POST",
          body: {
            name: body.querySelector("#m-name").value.trim(),
            description: body.querySelector("#m-desc").value,
          },
        });
        toast(t("t_renamed"));
        await refresh();
      } catch (err) {
        hint.textContent = errText(err);
        save.disabled = false;
      }
    });

    body.querySelector("#m-del-open").addEventListener("click", () => {
      openServerDelete({ id: data.id, name: data.name });
    });
  }

  paintTab();

  // The roster should open on the list, not on an empty editor.
  const firstInput = overlay.querySelector("#m-search");
  if (firstInput) firstInput.focus({ preventScroll: true });
}

/* ---------- boot ------------------------------------------------------- */
/* ---------- boot ------------------------------------------------------- */

async function boot() {
  lang = detectLang();
  if (!(await ensureLang(lang))) lang = "en";
  applyStaticLang();

  /* Language picker: clicking anywhere else (or Esc) collapses an open list
     and the open list keeps its height in sync with the viewport. */
  document.addEventListener("click", (event) => {
    const target = event.target;
    const inside =
      target && target.closest ? target.closest(".lang-switch") : null;
    closeOpenLangSwitches(inside);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const active = document.activeElement;
    const wrap =
      active && active.closest ? active.closest(".lang-switch") : null;
    closeOpenLangSwitches(null);
    /* Collapsing hides the option that had the focus — put it back on the
       trigger instead of dropping it on <body>. */
    if (wrap) {
      const trigger = wrap.querySelector("[data-set-lang-trigger]");
      if (trigger) trigger.focus();
    }
  });
  window.addEventListener("resize", () => {
    document.querySelectorAll(".lang-switch.open").forEach((wrap) => {
      const panel = wrap.querySelector(".lang-options");
      if (panel) panel.style.height = `${langListHeight(panel)}px`;
    });
  });

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
