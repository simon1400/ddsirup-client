import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { Button } from '@/components/ui/button';
import { getFeaturedProducts } from '@/lib/strapi';

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts('cs').catch(() => []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-muted py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">ddsirup.co</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
              Vítejte v našem obchodě
            </p>
            <Button size="lg" asChild>
              <Link href="/products">Prohlédnout produkty</Link>
            </Button>
          </div>
        </section>

        {/* Featured products */}
        {featuredProducts.length > 0 && (
          <section className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Doporučené produkty</h2>
              <Button variant="ghost" asChild>
                <Link href="/products">Zobrazit vše</Link>
              </Button>
            </div>
            <ProductGrid products={featuredProducts} />
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
