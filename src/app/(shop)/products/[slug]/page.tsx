import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getProduct, getProducts } from '@/lib/strapi';
import { ProductVariantSection } from '@/components/shop/ProductVariantSection';
import { ProductInfoSections } from '@/components/shop/ProductInfoSections';
import { Separator } from '@/components/ui/separator';
import { Container } from '@/components/ui/Container';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ddsirup.cz';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug).catch(() => null);
  if (!product) return { title: 'Produkt nenalezen' };
  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDescription,
  };
}

export async function generateStaticParams() {
  const res = await getProducts({ pageSize: 100 }).catch(() => ({ data: [] }));
  return res.data.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug, 'cs');
  if (!product) notFound();

  const mainImage = product.images?.[0];
  const imageUrl = mainImage?.url
    ? mainImage.url.startsWith('http')
      ? mainImage.url
      : `${STRAPI_URL}${mainImage.url}`
    : null;

  const parentCategory = product.category?.parent;
  const category = product.category;

  const breadcrumbItems = [
    { name: 'Úvod', url: `${SITE_URL}/` },
    { name: 'Produkty', url: `${SITE_URL}/products` },
    ...(parentCategory
      ? [{ name: parentCategory.name, url: `${SITE_URL}/products?tab=${parentCategory.slug}` }]
      : []),
    ...(category
      ? [{ name: category.name, url: `${SITE_URL}/products?tab=${parentCategory?.slug ?? category.slug}&sub=${category.slug}` }]
      : []),
    { name: product.name, url: `${SITE_URL}/products/${product.slug}` },
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

  return (
    <Container className="py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">Úvod</Link>
          </li>
          <li><ChevronRight className="h-3.5 w-3.5" /></li>
          <li>
            <Link href="/products" className="hover:text-foreground transition-colors">Produkty</Link>
          </li>
          {parentCategory && (
            <>
              <li><ChevronRight className="h-3.5 w-3.5" /></li>
              <li>
                <Link href={`/products?tab=${parentCategory.slug}`} className="hover:text-foreground transition-colors">
                  {parentCategory.name}
                </Link>
              </li>
            </>
          )}
          {category && (
            <>
              <li><ChevronRight className="h-3.5 w-3.5" /></li>
              <li>
                <Link
                  href={`/products?tab=${parentCategory?.slug ?? category.slug}&sub=${category.slug}`}
                  className="hover:text-foreground transition-colors"
                >
                  {category.name}
                </Link>
              </li>
            </>
          )}
          <li><ChevronRight className="h-3.5 w-3.5" /></li>
          <li className="text-foreground font-medium truncate max-w-50">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={mainImage?.alternativeText ?? product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Bez obrázku
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold">{product.name}</h1>

          <ProductVariantSection product={product} />

          {product.description && (
            <>
              <Separator />
              <div
                className="prose prose-sm max-w-none text-xl"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </>
          )}
        </div>
      </div>

      <ProductInfoSections product={product} />
    </Container>
  );
}
