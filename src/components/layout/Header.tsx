import Link from 'next/link';
import { CartButton } from '@/components/shop/CartButton';
import { getCategories } from '@/lib/strapi';

export async function Header() {
  const categories = await getCategories().catch(() => []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4">
        <Link href="/" className="font-bold text-xl tracking-tight">
          ddsirup.co
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">
            Produkty
          </Link>
          {categories.slice(0, 5).map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <CartButton />
        </div>
      </div>
    </header>
  );
}
