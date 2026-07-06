import type { Metadata } from 'next';
import { Josefin_Sans } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { Toaster } from '@/components/ui/sonner';
import { getGlobalInfo } from '@/lib/strapi';
import { GoogleTagManagerNoscript } from '@/components/layout/GoogleTagManager';
import { VatRateProvider } from '@/providers/vat-rate-provider';
import { SITE_URL } from '@/lib/constants';
import { Header } from '@/components/layout/Header';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Footer } from '@/components/layout/Footer';
import { Suspense } from 'react';
import { FacebookPageView } from '@/components/tracking/FacebookPageView';
import { TrackingScripts } from '@/components/tracking/TrackingScripts';
import { CookieConsent } from '@/components/layout/CookieConsent';

const josefinSans = Josefin_Sans({
  variable: '--font-josefin-sans',
  subsets: ['latin', 'latin-ext'],
  weight: ['100', '300', '400', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'DD Sirup | Prémiové české sirupy',
    template: '%s | DD Sirup',
  },
  description:
    'Prémiové české sirupy z přírodních ingrediencí. Ovocné, bylinné a hřejivé sirupy pro každého i pro barmany.',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'cs_CZ',
    siteName: 'DD Sirup',
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: 'DD Sirup — Prémiové české sirupy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const globalInfo = await getGlobalInfo();
  const gtmId = globalInfo?.gtmId;
  const vatRate = globalInfo?.vatRate ?? 12;
  const fbPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

  return (
    <html lang="cs" suppressHydrationWarning>
      <body className={`${josefinSans.variable} font-sans antialiased`}>
        {gtmId && <GoogleTagManagerNoscript gtmId={gtmId} />}
        <QueryProvider>
          <VatRateProvider vatRate={vatRate}>
            <div className="min-h-screen flex flex-col">
              <div className="sticky top-0 z-50">
                <AnnouncementBar />
                <Header />
              </div>
              <main className="flex-1 flex flex-col">{children}</main>
              <Footer />
            </div>
            <CartDrawer />
            <Suspense fallback={null}>
              <FacebookPageView />
            </Suspense>
            <Toaster richColors />
            <TrackingScripts gtmId={gtmId} fbPixelId={fbPixelId} />
            <CookieConsent />
          </VatRateProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
