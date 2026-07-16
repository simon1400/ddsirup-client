'use client';

import type { FbCustomData } from './facebook-capi';
import { isTrackingAllowed } from './consent';

/**
 * Client-side Facebook tracking helpers.
 *
 * Strategy: Pixel (client via GTM) + CAPI (server) with event_id deduplication.
 * - GTM fires the Facebook Pixel with the event_id via dataLayer
 * - Simultaneously, we POST to /api/fb-events for server-side CAPI
 * - Facebook deduplicates based on matching event_id + event_name
 *
 * All tracking is gated by cookie consent — nothing fires unless
 * the user has accepted cookies via the CMP banner.
 */

/** Generate a unique event ID for deduplication */
export function generateEventId(): string {
  return `${Date.now()}.${Math.random().toString(36).slice(2, 11)}`;
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

// ── Consent queue ────────────────────────────────────────────────────
//
// Events fired before the user accepts cookies must not be dropped —
// otherwise a Purchase that happens right before the consent click is
// lost forever (a real order slipped through this way). Instead we queue
// blocked events and flush them once consent is granted.

type QueuedEvent = { eventName: string; emit: () => void };
let consentQueue: QueuedEvent[] = [];
let consentListenerAttached = false;

function ensureConsentListener() {
  if (consentListenerAttached || typeof window === 'undefined') return;
  consentListenerAttached = true;
  window.addEventListener('consent-updated', () => {
    if (!isTrackingAllowed()) return;
    const pending = consentQueue;
    consentQueue = [];
    pending.forEach((e) => e.emit());
  });
}

function queueEvent(eventName: string, emit: () => void) {
  // Collapse repeated PageViews so a long pre-consent browse doesn't
  // dump a burst of identical PageViews at consent time. Keep everything
  // else (ViewContent, AddToCart, Purchase, …).
  if (eventName === 'PageView') {
    consentQueue = consentQueue.filter((e) => e.eventName !== 'PageView');
  }
  consentQueue.push({ eventName, emit });
  ensureConsentListener();
}

/**
 * Fire the client-side Pixel event. The Pixel script (fbq) only loads
 * after consent, so on the consent-time flush it may not exist yet —
 * retry briefly until it does instead of dropping the browser event.
 */
function fireClientPixel(
  eventName: string,
  customData: FbCustomData | undefined,
  eventId: string,
  attempt = 0
) {
  if (typeof window === 'undefined') return;
  const w = window as unknown as Record<string, unknown>;
  const fbq = w.fbq as ((...args: unknown[]) => void) | undefined;

  if (fbq) {
    fbq('track', eventName, customData ?? {}, { eventID: eventId });

    // Also push to dataLayer for GTM triggers (e.g., custom event-based tags)
    const dataLayer = (w.dataLayer as unknown[]) ?? [];
    w.dataLayer = dataLayer;
    dataLayer.push({
      event: `fb_${eventName}`,
      fb_event_id: eventId,
      fb_event_name: eventName,
      fb_custom_data: customData,
    });
    return;
  }

  // fbq not ready yet (pixel script still loading) — retry up to ~3s
  if (attempt < 20) {
    setTimeout(() => fireClientPixel(eventName, customData, eventId, attempt + 1), 150);
  }
}

/**
 * Fire a Facebook event both client-side (via fbq/dataLayer) and server-side (via CAPI).
 *
 * @param eventIdOverride Use a deterministic event_id (e.g. `purchase_{orderId}`)
 *   so the browser event deduplicates against the matching server CAPI event.
 * @param browserOnly Skip the /api/fb-events CAPI leg. Needed when the server
 *   already sends its own CAPI event for this action (e.g. Purchase from the
 *   payment webhook) — Meta deduplicates browser↔server pairs by event_id, but
 *   NOT two server events sent through the same CAPI channel, so a second
 *   server event would be counted as an extra conversion.
 */
export function trackFbEvent(
  eventName: string,
  customData?: FbCustomData,
  options?: TrackOptions,
  eventIdOverride?: string,
  browserOnly = false
) {
  const eventId = eventIdOverride ?? generateEventId();
  const eventSourceUrl =
    typeof window !== 'undefined' ? window.location.href : undefined;

  const emit = () => {
    // 1. Client-side Pixel (with fbq-ready retry)
    fireClientPixel(eventName, customData, eventId);

    if (browserOnly) return;

    // 2. Server-side: POST to our CAPI proxy
    const payload: Record<string, unknown> = {
      event_name: eventName,
      event_id: eventId,
      event_source_url: eventSourceUrl,
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
  };

  if (isTrackingAllowed()) {
    emit();
  } else {
    // Not consented yet — hold the event and replay it on consent.
    queueEvent(eventName, emit);
  }
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
    },
    // Deterministic event_id so this browser Purchase deduplicates against
    // the server-side CAPI Purchase from the webhook (`purchase_{orderNumber}`).
    params.orderId ? `purchase_${params.orderId}` : undefined,
    // browserOnly: the webhook (or send-confirmation) already sends the CAPI
    // Purchase — sending it again via /api/fb-events would double-count,
    // because Meta does not deduplicate two events from the same CAPI channel.
    true
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
