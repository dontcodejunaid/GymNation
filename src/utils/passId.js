// Pass, booking and checkout-session reference IDs.
//
// IDs are prefixed `GN-` (Gymnation). Passes issued before the BodyFit ->
// Gymnation rebrand carry a `BF-` prefix and are still sitting in members'
// browsers and on the printed/screenshotted cards they show at the front desk,
// so every *lookup* accepts either prefix while everything newly generated
// uses GN-. Dropping BF- support would make those older passes unrecoverable.

export const PASS_PREFIX = 'GN-';
export const SESSION_PREFIX = 'GN-SESS-';

const ANY_PASS_PREFIX = /^(?:GN|BF)-/i;
const ANY_SESSION_PREFIX = /^(?:GN|BF)-SESS-/i;

/** True when the id already carries a current or legacy pass prefix. */
export const hasPassPrefix = (id) => ANY_PASS_PREFIX.test(String(id || ''));

/** True when the token already carries a current or legacy session prefix. */
export const hasSessionPrefix = (token) => ANY_SESSION_PREFIX.test(String(token || ''));

/** Removes a current or legacy prefix, leaving the bare reference. */
export const stripPassPrefix = (id) => String(id || '').replace(ANY_PASS_PREFIX, '');

/** Returns the id prefixed, leaving an already-prefixed id untouched. */
export const withPassPrefix = (id) => {
  const raw = String(id || '');
  return hasPassPrefix(raw) ? raw : `${PASS_PREFIX}${raw}`;
};
