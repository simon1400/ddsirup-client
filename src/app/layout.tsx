import type { Metadata } from 'next';
import { Josefin_Sans } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { Toaster } from '@/components/ui/sonner';
import { getGlobalInfo } from '@/lib/strapi';
import {
  GoogleTagManager,
  GoogleTagManagerNoscript,
} from '@/components/layout/GoogleTagManager';
import { VatRateProvider } from '@/providers/vat-rate-provider';

const josefinSans = Josefin_Sans({
  variable: '--font-josefin-sans',
  subsets: ['latin', 'latin-ext'],
  weight: ['100', '300', '400', '600', '700'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ddsirup.cz';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'DD Sirup | Prémiové české sirupy',
    template: '%s | DD Sirup',
  },
  description:
    'Prémiové české sirupy z přírodních ingrediencí. Ovocné, bylinné a hřejivé sirupy pro každého i pro barmany.',
  openGraph: {
    type: 'website',
    locale: 'cs_CZ',
    siteName: 'DD Sirup',
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

  return (
    <html lang="cs" suppressHydrationWarning>
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      <body className={`${josefinSans.variable} font-sans antialiased`}>
        {gtmId && <GoogleTagManagerNoscript gtmId={gtmId} />}
        <QueryProvider>
          <VatRateProvider vatRate={vatRate}>
            {children}
            <CartDrawer />
            <Toaster richColors />
          </VatRateProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
