import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { Toaster } from '@/components/ui/sonner';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin', 'latin-ext'],
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
      <body className={`${geist.variable} font-sans antialiased`}>
        <QueryProvider>
          {children}
          <CartDrawer />
          <Toaster richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
