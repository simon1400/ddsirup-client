import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { ChevronRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getCategory, getProducts, getCategories } from '@/lib/strapi';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { SearchInput } from '@/components/shop/SearchInput';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/Container';
import { CATEGORY_COLORS } from '@/lib/constants';
import { buildPageMetadata, getCanonicalUrl } from '@/lib/seo';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategory(slug).catch(() => null);
  if (!category) return { title: 'Kategorie nenalezena' };
  return buildPageMetadata({
    title: category.seo?.metaTitle ?? category.name,
    description: category.seo?.metaDescription ?? category.description ?? `Sirupy v kategorii ${category.name}. Prémiové české sirupy od DD Sirup.`,
    path: category.seo?.canonicalURL ?? `/${slug}`,
    ogImage: category.seo?.metaImage ?? category.image ?? null,
  });
}

export async function generateStaticParams() {
  const categories = await getCategories().catch(() => []);
  return categories.map((c) => ({ category: c.slug }));
}

export const revalidate = 3600;

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category: slug } = await params;
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  const [category, parentCategories] = await Promise.all([
    getCategory(slug, 'cs'),
    getCategories('cs', true),
  ]);

  if (!category) notFound();

  const isParent = !category.parent;
  const parentCategory = isParent ? category : category.parent!;
  const parentIndex = parentCategories.findIndex((c) => c.slug === parentCategory.slug);
  const tabColor = parentIndex >= 0 ? CATEGORY_COLORS[parentIndex] : undefined;

  // Fetch products: parent → all children, child → specific category
  const productsRes = await getProducts({
    parentCategory: isParent ? slug : undefined,
    category: !isParent ? slug : undefined,
    search: sp.search,
    page,
    pageSize: 24,
    locale: 'cs',
  });

  const { data: products, meta } = productsRes;
  const totalPages = meta.pagination?.pageCount ?? 1;

  const subcategories = isParent
    ? category.children ?? []
    : parentCategory.children ?? [];

  // Build breadcrumb
  const breadcrumbItems = [
    { name: 'Úvod', url: getCanonicalUrl('/') },
    ...(!isParent
      ? [{ name: parentCategory.name, url: getCanonicalUrl(`/${parentCategory.slug}`) }]
      : []),
    { name: category.name, url: getCanonicalUrl(`/${slug}`) },
  ];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  const buildHref = (params: Record<string, string | undefined>) => {
    const base = `/${slug}`;
    const qs = Object.entries(params)
      .filter(([k, v]) => v !== undefined && k !== 'sub')
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    return qs ? `${base}?${qs}` : base;
  };

  return (
    <Container size="lg" className="pt-8 pb-25">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-25">
        <ol className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">Úvod</Link>
          </li>
          {!isParent && (
            <>
              <li><ChevronRight className="h-3.5 w-3.5" /></li>
              <li>
                <Link href={`/${parentCategory.slug}`} className="hover:text-foreground transition-colors">
                  {parentCategory.name}
                </Link>
              </li>
            </>
          )}
          <li><ChevronRight className="h-3.5 w-3.5" /></li>
          <li className="text-foreground font-medium">{category.name}</li>
        </ol>
      </nav>

      {/* Title */}
      <h1 className="text-center font-black text-6xl md:text-8xl uppercase tracking-tight mb-15 leading-none">
        {category.name}
      </h1>

      {/* Search */}
      <div className="flex justify-center mb-15">
        <Suspense>
          <SearchInput />
        </Suspense>
      </div>

      {/* Parent category tabs */}
      <div className="flex gap-3 mb-8 flex-wrap justify-center">
        {parentCategories.map((cat, i) => {
          const isActive = cat.slug === parentCategory.slug;
          const color = CATEGORY_COLORS[i] ?? '#E0E0E0';
          return (
            <Link
              key={cat.id}
              href={`/${cat.slug}`}
              className="px-7 py-3 rounded-full font-black text-base uppercase tracking-wide transition-all hover:scale-105"
              style={{
                backgroundColor: isActive ? color : 'transparent',
                border: `2px solid ${color}`,
                color: '#1a1a1a',
              }}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>

      {/* Subcategory tabs */}
      {subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {subcategories.map((child) => {
            const isActiveSub = child.slug === slug;
            return (
              <Link
                key={child.id}
                href={`/${child.slug}`}
                className="px-4 py-1.5 rounded-full text-sm transition-all hover:scale-105"
                style={
                  isActiveSub
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

      {/* Products */}
      <ProductGrid products={products} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {page > 1 && (
            <Button variant="outline" asChild>
              <Link href={buildHref({ page: String(page - 1) })}>
                Předchozí
              </Link>
            </Button>
          )}
          <span className="flex items-center text-sm text-muted-foreground">
            Stránka {page} z {totalPages}
          </span>
          {page < totalPages && (
            <Button variant="outline" asChild>
              <Link href={buildHref({ page: String(page + 1) })}>
                Další
              </Link>
            </Button>
          )}
        </div>
      )}
    </Container>
  );
}
