import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { getProducts, getCategories } from '@/lib/strapi';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { SearchInput } from '@/components/shop/SearchInput';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Produkty',
};

// Colors per parent-category index
const TAB_COLORS = ['#F0D060', '#E07878'];

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
  const tabColor = activeTabIndex >= 0 ? TAB_COLORS[activeTabIndex] : undefined;

  const pageTitle = activeTab
    ? activeTab.name.toUpperCase()
    : 'SIRUPY';

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto">
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
      <div className="flex gap-3 mb-2 flex-wrap">
        {parentCategories.map((cat, i) => (
          <Link
            key={cat.id}
            href={`/products?tab=${cat.slug}`}
            className="px-5 py-2 rounded-full font-bold text-sm transition-opacity hover:opacity-80"
            style={{ backgroundColor: TAB_COLORS[i] ?? '#E0E0E0' }}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Subcategories */}
      {activeTab?.children && activeTab.children.length > 0 && (
        <div className="flex flex-col gap-1 mb-8 mt-4">
          {activeTab.children.map((child) => {
            const isActive = params.sub === child.slug;
            return (
              <Link
                key={child.id}
                href={`/products?tab=${params.tab}&sub=${child.slug}`}
                className="w-fit text-sm px-3 py-1 rounded-full transition-colors hover:opacity-80"
                style={
                  isActive
                    ? { backgroundColor: tabColor, fontWeight: 600 }
                    : { color: 'inherit' }
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
    </div>
  );
}
