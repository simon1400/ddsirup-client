'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/lib/facebook-pixel';

/**
 * Fires a Facebook PageView CAPI event on every client-side navigation.
 * The GTM Pixel tag already fires PageView client-side on gtm.js,
 * but this ensures CAPI gets every SPA navigation too.
 *
 * Note: GTM fires its own PageView on initial load, so the first
 * PageView will be deduplicated by Facebook (different event_id = 2 events,
 * which is fine — Facebook prefers both browser + server for accuracy).
 */
export function FacebookPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Send CAPI PageView on route change
    trackPageView();
  }, [pathname, searchParams]);

  return null;
}
