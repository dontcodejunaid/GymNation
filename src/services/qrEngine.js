/**
 * Static QR Code Engine for Gym Access Control
 * Handles unique static token generation for member entry pass.
 */

export function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generates static token string for QR Code payload (Always normalized to UPPERCASE)
 */
export function generateStaticToken(memberId, passId) {
  const token = passId || memberId || 'GN-DEFAULT-PASS';
  return String(token).toUpperCase();
}
