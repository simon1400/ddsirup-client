import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategory, getProducts, getCategories } from '@/lib/strapi';
import { ProductGrid } from '@/components/shop/ProductGrid';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug).catch(() => null);
  if (!category) return { title: 'Kategorie nenalezena' };
  return {
    title: category.name,
    description: category.description,
  };
}

export async function generateStaticParams() {
  const categories = await getCategories().catch(() => []);
  return categories.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const [category, productsRes] = await Promise.all([
    getCategory(slug, 'cs'),
    getProducts({ category: slug, locale: 'cs' }),
  ]);

  if (!category) notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
      {category.description && (
        <p className="text-muted-foreground mb-8">{category.description}</p>
      )}
      <ProductGrid products={productsRes.data} />
    </div>
  );
}
