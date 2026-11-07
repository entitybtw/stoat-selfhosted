/**
 * How an account is told apart from a guest.
 *
 * Kept apart from the rest of the guest code so it can be tested without a
 * database: the rules are the same ones the backend applies, and the two have
 * to agree, or the panel would call a guest a normal account.
 */

/** The domain reserved for temporary accounts */
export const GUEST_EMAIL_DOMAIN =
  process.env.GUEST_EMAIL_DOMAIN || "guest.entitybtw.ru";

/** The prefix every minted address carries */
const GUEST_PREFIX = "guest-";

/**
 * Whether an address belongs to a guest.
 *
 * Both the prefix and the domain have to match: the backend only looks at
 * the domain, so an address in the reserved domain that does not carry the
 * prefix is still refused there. The panel is stricter on purpose, because
 * it decides what the client may show.
 *
 * @param {string | undefined | null} email
 */
export function isGuestEmail(email) {
  if (typeof email !== "string") return false;

  const address = email.trim().toLowerCase();

  return (
    address.startsWith(GUEST_PREFIX) &&
    address.endsWith(`@${GUEST_EMAIL_DOMAIN.toLowerCase()}`)
  );
}
