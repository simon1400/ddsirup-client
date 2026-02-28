import type { Metadata } from 'next';
import { getProducts, getCategories } from '@/lib/strapi';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Produkty',
};

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    page?: string;
    search?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const [productsRes, categories] = await Promise.all([
    getProducts({
      category: params.category,
      search: params.search,
      page,
      pageSize: 24,
      locale: 'cs',
    }),
    getCategories('cs'),
  ]);

  const { data: products, meta } = productsRes;
  const totalPages = meta.pagination?.pageCount ?? 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Produkty</h1>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={!params.category ? 'default' : 'outline'}
            size="sm"
            asChild
          >
            <Link href="/products">Vše</Link>
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={params.category === cat.slug ? 'default' : 'outline'}
              size="sm"
              asChild
            >
              <Link href={`/products?category=${cat.slug}`}>{cat.name}</Link>
            </Button>
          ))}
        </div>
      )}

      <ProductGrid products={products} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <Button variant="outline" asChild>
              <Link href={`/products?page=${page - 1}${params.category ? `&category=${params.category}` : ''}`}>
                Předchozí
              </Link>
            </Button>
          )}
          <span className="flex items-center text-sm text-muted-foreground">
            Stránka {page} z {totalPages}
          </span>
          {page < totalPages && (
            <Button variant="outline" asChild>
              <Link href={`/products?page=${page + 1}${params.category ? `&category=${params.category}` : ''}`}>
                Další
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
