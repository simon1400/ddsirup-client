/**
 * Facebook Conversions API (CAPI) — server-side event sending.
 *
 * Docs: https://developers.facebook.com/docs/marketing-api/conversions-api
 */

import type { Order } from '@/types/order';

const FB_PIXEL_ID = process.env.FB_PIXEL_ID ?? '';
const FB_CAPI_TOKEN = process.env.FB_CAPI_TOKEN ?? '';
const FB_API_VERSION = 'v21.0';

export interface FbUserData {
  /** Hashed email (SHA-256, lowercase, trimmed) */
  em?: string;
  /** Hashed phone (SHA-256, E.164 format) */
  ph?: string;
  /** Hashed first name */
  fn?: string;
  /** Hashed last name */
  ln?: string;
  /** Hashed city */
  ct?: string;
  /** Hashed zip/postal code */
  zp?: string;
  /** ISO 3166-1 alpha-2 country code (lowercase, hashed) */
  country?: string;
  /** Client IP address (plain text) */
  client_ip_address?: string;
  /** Client user agent (plain text) */
  client_user_agent?: string;
  /** Facebook click ID (_fbc cookie) */
  fbc?: string;
  /** Facebook browser ID (_fbp cookie) */
  fbp?: string;
}

export interface FbCustomData {
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  num_items?: number;
  order_id?: string;
}

export interface FbEvent {
  event_name: string;
  event_time: number;
  event_id: string;
  event_source_url?: string;
  action_source: 'website';
  user_data: FbUserData;
  custom_data?: FbCustomData;
}

/**
 * Hash a value with SHA-256 for Facebook user_data fields.
 * Facebook requires lowercase, trimmed, SHA-256 hashed values.
 */
export async function hashForFb(value: string): Promise<string> {
  const { createHash } = await import('crypto');
  return createHash('sha256')
    .update(value.trim().toLowerCase())
    .digest('hex');
}

const FB_MAX_RETRIES = 3;

/**
 * Send one or more events to Facebook Conversions API.
 *
 * Transient failures (network errors, 5xx, 429) are retried with backoff.
 * Retries are safe because every event carries a stable `event_id` — Facebook
 * deduplicates re-sends, so a momentary CAPI outage no longer silently drops
 * a Purchase.
 */
export async function sendFbEvents(
  events: FbEvent[],
  attempt = 0
): Promise<{ success: boolean; error?: string }> {
  if (!FB_PIXEL_ID || !FB_CAPI_TOKEN) {
    console.warn('[fb-capi] Missing FB_PIXEL_ID or FB_CAPI_TOKEN — skipping');
    return { success: false, error: 'Missing credentials' };
  }

  const url = `https://graph.facebook.com/${FB_API_VERSION}/${FB_PIXEL_ID}/events`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: events,
        access_token: FB_CAPI_TOKEN,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      // Retry transient server-side failures only; 4xx (bad request) won't heal.
      if ((res.status >= 500 || res.status === 429) && attempt < FB_MAX_RETRIES) {
        return retryFbEvents(events, attempt, `HTTP ${res.status}`);
      }
      console.error(`[fb-capi] API error ${res.status}:`, body);
      return { success: false, error: body };
    }

    console.log(`[fb-capi] Sent ${events.length} event(s):`, events.map((e) => e.event_name).join(', '));
    return { success: true };
  } catch (err) {
    if (attempt < FB_MAX_RETRIES) {
      return retryFbEvents(events, attempt, String(err));
    }
    console.error('[fb-capi] Network error:', err);
    return { success: false, error: String(err) };
  }
}

async function retryFbEvents(
  events: FbEvent[],
  attempt: number,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const delay = 500 * 2 ** attempt; // 500ms, 1s, 2s
  console.warn(
    `[fb-capi] transient failure (${reason}), retry ${attempt + 1}/${FB_MAX_RETRIES} in ${delay}ms`
  );
  await new Promise((r) => setTimeout(r, delay));
  return sendFbEvents(events, attempt + 1);
}

/**
 * Build and send the server-side Purchase event for an order.
 *
 * Shared by the Comgate webhook (card payments) and the manual "paid"
 * admin path (bank transfers), so both report the sale to Facebook with an
 * identical, deduplicating `event_id`.
 */
export async function sendOrderPurchaseEvent(order: Order): Promise<void> {
  const event: FbEvent = {
    event_name: 'Purchase',
    event_time: Math.floor(Date.now() / 1000),
    event_id: `purchase_${order.orderNumber}`,
    action_source: 'website',
    user_data: {
      em: await hashForFb(order.customerEmail),
      ph: order.customerPhone ? await hashForFb(order.customerPhone.replace(/\s/g, '')) : undefined,
      fn: await hashForFb(order.customerFirstName),
      ln: await hashForFb(order.customerLastName),
      country: await hashForFb('cz'),
      fbp: order.fbp || undefined,
      fbc: order.fbc || undefined,
    },
    custom_data: {
      value: order.total,
      currency: 'CZK',
      content_type: 'product',
      content_ids: order.items.map((item) => item.productSlug),
      num_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
      order_id: order.orderNumber,
    },
  };
  await sendFbEvents([event]);
}

/**
 * Build user_data from request headers + cookies.
 */
export function buildUserDataFromRequest(req: Request): FbUserData {
  const headers = req.headers;
  const cookieHeader = headers.get('cookie') ?? '';

  const fbp = extractCookie(cookieHeader, '_fbp');
  const fbc = extractCookie(cookieHeader, '_fbc');

  return {
    client_ip_address:
      headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      headers.get('x-real-ip') ??
      undefined,
    client_user_agent: headers.get('user-agent') ?? undefined,
    fbp: fbp ?? undefined,
    fbc: fbc ?? undefined,
  };
}

function extractCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
