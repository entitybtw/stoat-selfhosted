import assert from "node:assert/strict";
import { test } from "node:test";

import { GUEST_EMAIL_DOMAIN, isGuestEmail } from "../src/guestEmail.js";

test("an address in the reserved domain with the prefix is a guest", () => {
  assert.equal(isGuestEmail(`guest-abc123@${GUEST_EMAIL_DOMAIN}`), true);
});

test("an address without the prefix is not a guest", () => {
  assert.equal(isGuestEmail(`someone@${GUEST_EMAIL_DOMAIN}`), false);
});

test("an address in another domain is not a guest", () => {
  assert.equal(isGuestEmail("guest-abc123@example.com"), false);
});

test("the case of the address does not matter", () => {
  assert.equal(isGuestEmail(`GUEST-ABC123@${GUEST_EMAIL_DOMAIN.toUpperCase()}`), true);
});

test("the whitespace around the address does not matter", () => {
  assert.equal(isGuestEmail(`  guest-abc123@${GUEST_EMAIL_DOMAIN}  `), true);
});

test("nothing is not a guest", () => {
  assert.equal(isGuestEmail(undefined), false);
  assert.equal(isGuestEmail(null), false);
  assert.equal(isGuestEmail(""), false);
});
