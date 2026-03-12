'use client';

import { useEffect, useState, useCallback } from 'react';
import Script from 'next/script';
import { isTrackingAllowed } from '@/lib/consent';

/**
 * Loads GTM + Facebook Pixel scripts ONLY when the user has accepted cookies.
 * Listens for the 'consent-updated' event so scripts mount immediately
 * after the user clicks "Accept" without requiring a page reload.
 */
export function TrackingScripts({
  gtmId,
  fbPixelId,
}: {
  gtmId?: string;
  fbPixelId?: string;
}) {
  const [allowed, setAllowed] = useState(false);

  const checkConsent = useCallback(() => {
    setAllowed(isTrackingAllowed());
  }, []);

  useEffect(() => {
    checkConsent();
    window.addEventListener('consent-updated', checkConsent);
    return () => window.removeEventListener('consent-updated', checkConsent);
  }, [checkConsent]);

  if (!allowed) return null;

  return (
    <>
      {/* Google Tag Manager */}
      {gtmId && (
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`,
          }}
        />
      )}

      {/* Facebook Pixel */}
      {fbPixelId && (
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
