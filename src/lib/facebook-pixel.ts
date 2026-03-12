'use client';

import type { FbCustomData } from './facebook-capi';

/**
 * Client-side Facebook tracking helpers.
 *
 * Strategy: Pixel (client via GTM) + CAPI (server) with event_id deduplication.
 * - GTM fires the Facebook Pixel with the event_id via dataLayer
 * - Simultaneously, we POST to /api/fb-events for server-side CAPI
 * - Facebook deduplicates based on matching event_id + event_name
 */

/** Generate a unique event ID for deduplication */
export function generateEventId(): string {
  return `${Date.now()}.${Math.random().toString(36).slice(2, 11)}`;
}

/** Get _fbp cookie value */
function getFbp(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(/(?:^|;\s*)_fbp=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

/** Get _fbc cookie value */
function getFbc(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(/(?:^|;\s*)_fbc=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

interface TrackOptions {
  /** PII for enhanced matching (hashed server-side) */
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  zip?: string;
  country?: string;
}

/**
 * Fire a Facebook event both client-side (via fbq/dataLayer) and server-side (via CAPI).
 */
export function trackFbEvent(
  eventName: string,
  customData?: FbCustomData,
  options?: TrackOptions
) {
  const eventId = generateEventId();

  // 1. Client-side: call fbq() directly (loaded by GTM's Facebook Pixel tag)
  //    Pass eventID for deduplication with CAPI
  if (typeof window !== 'undefined') {
    const w = window as unknown as Record<string, unknown>;
    const fbq = w.fbq as ((...args: unknown[]) => void) | undefined;

    if (fbq) {
      fbq('track', eventName, customData ?? {}, { eventID: eventId });
    }

    // Also push to dataLayer for GTM triggers (e.g., custom event-based tags)
    const dataLayer = (w.dataLayer as unknown[]) ?? [];
    w.dataLayer = dataLayer;
    dataLayer.push({
      event: `fb_${eventName}`,
      fb_event_id: eventId,
      fb_event_name: eventName,
      fb_custom_data: customData,
    });
  }

  // 2. Server-side: POST to our CAPI proxy
  const payload: Record<string, unknown> = {
    event_name: eventName,
    event_id: eventId,
    event_source_url: typeof window !== 'undefined' ? window.location.href : undefined,
    custom_data: customData,
  };

  if (options?.email) payload.email = options.email;
  if (options?.phone) payload.phone = options.phone;
  if (options?.firstName) payload.first_name = options.firstName;
  if (options?.lastName) payload.last_name = options.lastName;
  if (options?.city) payload.city = options.city;
  if (options?.zip) payload.zip = options.zip;
  if (options?.country) payload.country = options.country ?? 'cz';

  fetch('/api/fb-events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Silent fail — tracking should never break the UX
  });
}

// ── Convenience wrappers ─────────────────────────────────────────────

export function trackPageView() {
  trackFbEvent('PageView');
}

export function trackViewContent(params: {
  contentId: string;
  contentName: string;
  contentCategory?: string;
  value: number;
  currency?: string;
}) {
  trackFbEvent('ViewContent', {
    content_ids: [params.contentId],
    content_name: params.contentName,
    content_category: params.contentCategory,
    content_type: 'product',
    value: params.value,
    currency: params.currency ?? 'CZK',
  });
}

export function trackAddToCart(params: {
  contentId: string;
  contentName: string;
  value: number;
  currency?: string;
  quantity?: number;
}) {
  trackFbEvent('AddToCart', {
    content_ids: [params.contentId],
    content_name: params.contentName,
    content_type: 'product',
    contents: [{ id: params.contentId, quantity: params.quantity ?? 1 }],
    value: params.value,
    currency: params.currency ?? 'CZK',
  });
}

export function trackInitiateCheckout(params: {
  contentIds: string[];
  value: number;
  numItems: number;
  currency?: string;
}) {
  trackFbEvent('InitiateCheckout', {
    content_ids: params.contentIds,
    content_type: 'product',
    value: params.value,
    num_items: params.numItems,
    currency: params.currency ?? 'CZK',
  });
}

export function trackPurchase(params: {
  contentIds: string[];
  value: number;
  numItems: number;
  currency?: string;
  orderId?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  zip?: string;
}) {
  trackFbEvent(
    'Purchase',
    {
      content_ids: params.contentIds,
      content_type: 'product',
      value: params.value,
      num_items: params.numItems,
      currency: params.currency ?? 'CZK',
      order_id: params.orderId,
    },
    {
      email: params.email,
      phone: params.phone,
      firstName: params.firstName,
      lastName: params.lastName,
      city: params.city,
      zip: params.zip,
      country: 'cz',
    }
  );
}

export function trackLead(params?: {
  email?: string;
  firstName?: string;
  lastName?: string;
}) {
  trackFbEvent('Lead', {}, {
    email: params?.email,
    firstName: params?.firstName,
    lastName: params?.lastName,
  });
}
