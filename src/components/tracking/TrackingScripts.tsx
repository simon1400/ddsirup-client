'use client';

import { useEffect, useState, useCallback } from 'react';
import Script from 'next/script';
import { getConsent, isTrackingAllowed } from '@/lib/consent';

/**
 * Tracking scripts with GTM Consent Mode v2.
 *
 * GTM loads ALWAYS — but with consent defaults set to 'denied'.
 * When user accepts cookies, we push gtag('consent', 'update', {granted})
 * so GTM tags that respect consent mode start firing.
 *
 * Facebook Pixel loads only after consent (not managed by GTM consent mode).
 */
export function TrackingScripts({
  gtmId,
  fbPixelId,
}: {
  gtmId?: string;
  fbPixelId?: string;
}) {
  const [fbAllowed, setFbAllowed] = useState(false);

  const handleConsentUpdate = useCallback(() => {
    const allowed = isTrackingAllowed();
    setFbAllowed(allowed);

    // Push consent update to GTM dataLayer
    if (typeof window !== 'undefined' && allowed) {
      const w = window as unknown as Record<string, unknown>;
      const gtag = w.gtag as ((...args: unknown[]) => void) | undefined;
      if (gtag) {
        gtag('consent', 'update', {
          analytics_storage: 'granted',
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
        });
      }
    }
  }, []);

  useEffect(() => {
    // Check on mount (returning user with existing cookie)
    handleConsentUpdate();
    // Listen for banner clicks
    window.addEventListener('consent-updated', handleConsentUpdate);
    return () =>
      window.removeEventListener('consent-updated', handleConsentUpdate);
  }, [handleConsentUpdate]);

  // Build the consent default + GTM init script.
  // This MUST run before GTM loads so consent mode is set before any tags fire.
  const consentDefaultScript = gtmId
    ? `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

gtag('consent', 'default', {
  analytics_storage: '${getConsentStorageValue()}',
  ad_storage: '${getConsentStorageValue()}',
  ad_user_data: '${getConsentStorageValue()}',
  ad_personalization: '${getConsentStorageValue()}',
  wait_for_update: 500
});

(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`
    : undefined;

  return (
    <>
      {/* GTM + Consent Mode v2 defaults — always loads */}
      {consentDefaultScript && (
        <Script
          id="gtm-consent-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: consentDefaultScript }}
        />
      )}

      {/* Facebook Pixel — only after consent */}
      {fbAllowed && fbPixelId && (
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${fbPixelId}');`,
          }}
        />
      )}
    </>
  );
}

/** Read cookie at render time to set correct initial consent state */
function getConsentStorageValue(): 'granted' | 'denied' {
  if (typeof document === 'undefined') return 'denied';
  const match = document.cookie.match(/(?:^|;\s*)dd_cookie_consent=([^;]*)/);
  return match && decodeURIComponent(match[1]) === 'all' ? 'granted' : 'denied';
}
