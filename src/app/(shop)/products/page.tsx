import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { getProducts, getCategories } from '@/lib/strapi';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { SearchInput } from '@/components/shop/SearchInput';
import { Button } from '@/components/ui/button';
import { CATEGORY_COLORS } from '@/lib/constants';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: 'Produkty',
};

interface ProductsPageProps {
  searchParams: Promise<{
    tab?: string;
    sub?: string;
    page?: string;
    search?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const [productsRes, parentCategories] = await Promise.all([
    getProducts({
      parentCategory: params.tab && !params.sub ? params.tab : undefined,
      category: params.sub,
      search: params.search,
      page,
      pageSize: 24,
      locale: 'cs',
    }),
    getCategories('cs', true),
  ]);

  const { data: products, meta } = productsRes;
  const totalPages = meta.pagination?.pageCount ?? 1;

  const activeTab = parentCategories.find((c) => c.slug === params.tab);
  const activeTabIndex = parentCategories.findIndex((c) => c.slug === params.tab);
  const tabColor = activeTabIndex >= 0 ? CATEGORY_COLORS[activeTabIndex] : undefined;

  const pageTitle = activeTab
    ? activeTab.name.toUpperCase()
    : 'SIRUPY';

  return (
    <Container size="lg" className="py-8">
      {/* Title */}
      <h1 className="text-center font-black text-6xl md:text-8xl uppercase tracking-tight mb-10 leading-none">
        {pageTitle}
      </h1>

      {/* Search */}
      <div className="flex justify-center mb-8">
        <Suspense>
          <SearchInput />
        </Suspense>
      </div>

      {/* Category tabs */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {parentCategories.map((cat, i) => {
          const isActive = params.tab === cat.slug;
          const color = CATEGORY_COLORS[i] ?? '#E0E0E0';
          return (
            <Link
              key={cat.id}
              href={`/products?tab=${cat.slug}`}
              className="px-7 py-3 rounded-full font-black text-base uppercase tracking-wide transition-all hover:scale-105"
              style={{
                backgroundColor: isActive ? color : 'transparent',
                border: `2px solid ${color}`,
                color: isActive ? '#1a1a1a' : '#1a1a1a',
              }}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>

      {/* Subcategories */}
      {activeTab?.children && activeTab.children.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {activeTab.children.map((child) => {
            const isActive = params.sub === child.slug;
            return (
              <Link
                key={child.id}
                href={`/products?tab=${params.tab}&sub=${child.slug}`}
                className="px-4 py-1.5 rounded-full text-sm transition-all hover:scale-105"
                style={
                  isActive
                    ? { backgroundColor: tabColor, fontWeight: 700, color: '#1a1a1a' }
                    : { backgroundColor: '#f5f5f0', fontWeight: 500, color: '#555' }
                }
              >
                {child.name}
              </Link>
            );
          })}
        </div>
      )}

      {!activeTab && <div className="mb-8" />}

      {/* Products */}
      <ProductGrid products={products} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {page > 1 && (
            <Button variant="outline" asChild>
              <Link
                href={`/products?page=${page - 1}${params.tab ? `&tab=${params.tab}` : ''}${params.sub ? `&sub=${params.sub}` : ''}`}
              >
                Předchozí
              </Link>
            </Button>
          )}
          <span className="flex items-center text-sm text-muted-foreground">
            Stránka {page} z {totalPages}
          </span>
          {page < totalPages && (
            <Button variant="outline" asChild>
              <Link
                href={`/products?page=${page + 1}${params.tab ? `&tab=${params.tab}` : ''}${params.sub ? `&sub=${params.sub}` : ''}`}
              >
                Další
              </Link>
            </Button>
          )}
        </div>
      )}
    </Container>
  );
}
