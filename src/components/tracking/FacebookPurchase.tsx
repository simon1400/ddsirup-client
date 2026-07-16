'use client';

import { useEffect, useRef } from 'react';
import { trackPurchase } from '@/lib/facebook-pixel';

interface FacebookPurchaseProps {
  orderId: string;
  value: number;
  items: Array<{ productSlug: string; quantity: number }>;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  zip?: string;
}

/**
 * Fires the browser-side (Pixel only) Purchase event on the success page.
 * The server-side CAPI Purchase is sent exclusively from the payment webhook
 * (or the manual send-confirmation path) — Facebook deduplicates the
 * browser↔server pair via event_id = `purchase_{orderNumber}`.
 */
export function FacebookPurchase({
  orderId,
  value,
  items,
  email,
  phone,
  firstName,
  lastName,
  city,
  zip,
}: FacebookPurchaseProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    trackPurchase({
      contentIds: items.map((i) => i.productSlug),
      value,
      numItems: items.reduce((sum, i) => sum + i.quantity, 0),
      orderId,
      email,
      phone,
      firstName,
      lastName,
      city,
      zip,
    });
  }, [orderId, value, items, email, phone, firstName, lastName, city, zip]);

  return null;
}
