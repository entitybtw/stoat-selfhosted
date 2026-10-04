/** Crockford base32 alphabet used by ULIDs. */
const ULID_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** Extract creation time (ms) from a ULID, or null. */
export function ulidTimestamp(id) {
  if (typeof id !== "string" || id.length < 10) return null;
  let value = 0n;
  for (const char of id.slice(0, 10)) {
    const index = ULID_ALPHABET.indexOf(char);
    if (index < 0) return null;
    value = value * 32n + BigInt(index);
  }
  return Number(value);
}

/** Escape a string for use inside a RegExp. */
export function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Parse ?page=&limit= into safe paging values. */
export function parsePaging(query, defaultLimit = 25) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);
  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(limit) || limit < 1) limit = defaultLimit;
  if (limit > 100) limit = 100;
  return { page, limit, skip: (page - 1) * limit };
}

/** Wrap an async route handler so rejections reach Express (v4). */
export function ah(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
