import Script from 'next/script';

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

/**
 * Loads Facebook Pixel (fbevents.js) directly — not via GTM.
 * This ensures fbq() is available for client-side event tracking
 * and creates _fbp/_fbc cookies for CAPI deduplication.
 *
 * Does NOT fire PageView here — FacebookPageView handles all PageViews
 * with event_id for proper Pixel + CAPI deduplication.
 */
export function FacebookPixelScript() {
  if (!FB_PIXEL_ID) return null;

  return (
    <Script
      id="fb-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${FB_PIXEL_ID}');`,
      }}
    />
  );
}
