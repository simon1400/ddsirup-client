import Link from 'next/link';
import { CartButton } from '@/components/shop/CartButton';
import { NavMenu } from '@/components/layout/NavMenu';
import { getNavigation } from '@/lib/strapi';

export async function Header() {
  const navItems = await getNavigation().catch(() => []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4">
        <Link href="/" className="font-bold text-xl tracking-tight">
          ddsirup.co
        </Link>

        <div className="flex items-center gap-1">
          <CartButton />
          <NavMenu items={navItems} />
        </div>
      </div>
    </header>
  );
}
