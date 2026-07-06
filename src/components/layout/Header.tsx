import Link from 'next/link';
import Image from 'next/image';
import { CartButton } from '@/components/shop/CartButton';
import { NavMenu } from '@/components/layout/NavMenu';
import { getNavigation } from '@/lib/strapi';

export async function Header() {
  const navItems = await getNavigation().catch(() => []);

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between mx-auto px-4">
        <Link href="/">
          <Image src="/logo.png" alt="ddsirup.co" height={80} width={160} priority />
        </Link>

        <div className="flex items-center gap-1">
          <CartButton />
          <NavMenu items={navItems} />
        </div>
      </div>
    </header>
  );
}
