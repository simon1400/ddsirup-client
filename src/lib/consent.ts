/**
 * Cookie consent management.
 *
 * Consent values:
 * - "all"       — user accepted all cookies (analytics + marketing)
 * - "necessary"  — user rejected optional cookies
 * - undefined   — user hasn't decided yet (banner should be shown)
 *
 * Cookie name: dd_cookie_consent, expires in 365 days.
 */

const CONSENT_COOKIE = 'dd_cookie_consent';
const CONSENT_EXPIRY_DAYS = 365;

export type ConsentValue = 'all' | 'necessary';

/** Read consent from cookie (client-side only) */
export function getConsent(): ConsentValue | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${CONSENT_COOKIE}=([^;]*)`)
  );
  const val = match ? decodeURIComponent(match[1]) : undefined;
  if (val === 'all' || val === 'necessary') return val;
  return undefined;
}

/** Write consent cookie */
export function setConsent(value: ConsentValue): void {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setDate(expires.getDate() + CONSENT_EXPIRY_DAYS);
  document.cookie = `${CONSENT_COOKIE}=${value};path=/;expires=${expires.toUTCString()};SameSite=Lax`;
}

/** Whether analytics/marketing tracking is allowed */
export function isTrackingAllowed(): boolean {
  return getConsent() === 'all';
}
