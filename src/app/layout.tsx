import type { Metadata } from 'next';
import { Josefin_Sans } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { Toaster } from '@/components/ui/sonner';

const josefinSans = Josefin_Sans({
  variable: '--font-josefin-sans',
  subsets: ['latin', 'latin-ext'],
  weight: ['100', '300', '400', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'ddsirup.co',
    template: '%s | ddsirup.co',
  },
  description: 'Váš online obchod',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <body className={`${josefinSans.variable} font-sans antialiased`}>
        <QueryProvider>
          {children}
          <CartDrawer />
          <Toaster richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
