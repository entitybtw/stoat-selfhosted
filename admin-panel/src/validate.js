/**
 * Server-side validation mirroring the backend rules:
 *   crates/core/database/src/models/users/model.rs   (username/discriminator)
 *   crates/core/database/src/util/email.rs           (email + normalisation)
 *   crates/core/models/src/v0/servers.rs             (server name/description)
 *   crates/core/models/src/v0/users.rs               (display name/pronouns)
 *
 * Every helper returns `null` when the value is fine, or an error `code`
 * (machine readable, so the panel UI can localise the message itself).
 */

// --- usernames ----------------------------------------------------------

const USERNAME_RE = /^(\p{L}|[\d_.-])+$/u;
const BLOCKED_USERNAMES = ["admin", "revolt", "stoat"];
const BLOCKED_USERNAME_PATTERNS =
  /`{3}|(discord|rvlt|guilded|stt)\.gg|(revolt|stoat)\.chat|https?:\/\//i;

/** Codepoint length (Rust validator counts chars, not UTF-16 units). */
function length(value) {
  return [...value].length;
}

/** Validate a username exactly like User::validate_username. */
export function usernameError(username) {
  if (typeof username !== "string") return "invalid_username";
  const len = length(username);
  if (len < 2 || len > 32) return "invalid_username";
  if (!USERNAME_RE.test(username)) return "invalid_username";
  const lower = username.toLowerCase();
  if (BLOCKED_USERNAMES.includes(lower)) return "invalid_username";
  if (BLOCKED_USERNAME_PATTERNS.test(username)) return "invalid_username";
  return null;
}

// --- discriminators -----------------------------------------------------

/** DISCRIMINATOR_SEARCH_SPACE minus the reserved patterns (model.rs:160). */
const RESERVED = new Set([
  "0123", "1234", "1111", "2222", "3333", "4444",
  "5555", "6666", "7777", "8888", "9999", "1488",
]);

const SEARCH_SPACE = (() => {
  const all = [];
  for (let value = 2; value < 9999; value += 1) {
    const tag = String(value).padStart(4, "0");
    if (!RESERVED.has(tag)) all.push(tag);
  }
  return all;
})();

/** Validate an explicitly requested discriminator. */
export function discriminatorError(discriminator) {
  if (typeof discriminator !== "string" && typeof discriminator !== "number") {
    return "invalid_discriminator";
  }
  const tag = String(discriminator);
  if (!/^\d{4}$/.test(tag)) return "invalid_discriminator";
  if (RESERVED.has(tag)) return "invalid_discriminator";
  return null;
}

/** A random discriminator from the backend's search space. */
export function randomDiscriminator() {
  return SEARCH_SPACE[Math.floor(Math.random() * SEARCH_SPACE.length)];
}

/** All valid discriminators minus the given used set. */
export function availableDiscriminators(used) {
  return SEARCH_SPACE.filter((tag) => !used.has(tag));
}

// --- display name / pronouns -------------------------------------------

const DISPLAY_NAME_RE = /^[^\u200B\n\r]+$/;

export function displayNameError(displayName) {
  if (typeof displayName !== "string") return "invalid_display_name";
  const len = length(displayName);
  if (len < 2 || len > 32) return "invalid_display_name";
  if (!DISPLAY_NAME_RE.test(displayName)) return "invalid_display_name";
  return null;
}

export function pronounsError(pronouns) {
  if (typeof pronouns !== "string") return "invalid_pronouns";
  const len = length(pronouns);
  if (len < 1 || len > 24) return "invalid_pronouns";
  return null;
}

// --- email --------------------------------------------------------------

// Modelled after validator::validate_email: local part, then a dotted domain.
const EMAIL_RE =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

export function emailError(email) {
  if (typeof email !== "string") return "invalid_email";
  const value = email.trim();
  if (value.length < 3 || value.length > 254) return "invalid_email";
  if (!EMAIL_RE.test(value)) return "invalid_email";
  return null;
}

/**
 * Normalise an email exactly like util/email.rs::normalise_email:
 * split local@domain, strip "+"-tags and dots from the local part only,
 * lowercase the whole thing.
 */
export function normaliseEmail(original) {
  const match = /^([^@]+)(@.+)$/.exec(original);
  if (!match) return original.toLowerCase();
  const clean = match[1].replace(/\+.+|\./g, "");
  return `${clean}${match[2]}`.toLowerCase();
}

// --- server -------------------------------------------------------------

export function serverNameError(name) {
  if (typeof name !== "string") return "invalid_name";
  const len = length(name);
  if (len < 1 || len > 32) return "invalid_name";
  return null;
}

export function serverDescriptionError(description) {
  if (typeof description !== "string") return "invalid_description";
  if (length(description) > 1024) return "invalid_description";
  return null;
}
