import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProduct, getProducts } from '@/lib/strapi';
import { ProductVariantSection } from '@/components/shop/ProductVariantSection';
import { ProductInfoSections } from '@/components/shop/ProductInfoSections';
import { Separator } from '@/components/ui/separator';
import { Container } from '@/components/ui/Container';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';

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

  return (
    <Container className="py-8">
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
          {product.category && (
            <p className="text-sm text-muted-foreground">{product.category.name}</p>
          )}

          <h1 className="text-3xl font-bold">{product.name}</h1>

          <ProductVariantSection product={product} />

          {product.description && (
            <>
              <Separator />
              <div
                className="prose prose-sm max-w-none"
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
