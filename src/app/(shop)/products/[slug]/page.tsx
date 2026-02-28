import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProduct, getProducts } from '@/lib/strapi';
import { AddToCartButton } from '@/components/shop/AddToCartButton';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
    description: product.seoDescription ?? product.shortDescription,
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

  const mainImage = product.images?.[0] ?? product.thumbnail;
  const imageUrl = mainImage?.url
    ? mainImage.url.startsWith('http')
      ? mainImage.url
      : `${STRAPI_URL}${mainImage.url}`
    : null;

  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="container mx-auto px-4 py-8">
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

          {product.shortDescription && (
            <p className="text-muted-foreground">{product.shortDescription}</p>
          )}

          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
            {isOnSale && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
            {isOnSale && <Badge variant="destructive">Sleva</Badge>}
          </div>

          {product.sku && (
            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
          )}

          <Separator />

          <div className="space-y-3">
            {isOutOfStock ? (
              <Badge variant="secondary" className="text-sm px-3 py-1">Vyprodáno</Badge>
            ) : (
              <p className="text-sm text-green-600">Skladem ({product.stock} ks)</p>
            )}

            <AddToCartButton product={product} />
          </div>

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
    </div>
  );
}
