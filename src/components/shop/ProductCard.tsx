import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/product';
import { formatPrice } from '@/lib/utils';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';

interface ProductCardProps {
  product: Product;
}

function getPriceRange(product: Product): { min: number; max: number } | null {
  const variantPrices = (product.variants ?? [])
    .map((v) => v.price)
    .filter((p): p is number => typeof p === 'number' && p > 0);

  if (variantPrices.length === 0) return null;
  return {
    min: Math.min(...variantPrices),
    max: Math.max(...variantPrices),
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const thumbnailUrl = product.thumbnail?.url
    ? product.thumbnail.url.startsWith('http')
      ? product.thumbnail.url
      : `${STRAPI_URL}${product.thumbnail.url}`
    : null;

  const range = getPriceRange(product);

  return (
    <Link href={`/products/${product.slug}`} className="group flex flex-col items-center text-center">
      <div className="relative w-full aspect-2/3 mb-4 overflow-hidden">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={product.thumbnail?.alternativeText ?? product.name}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm bg-muted rounded">
            Bez obrázku
          </div>
        )}
      </div>

      <h3 className="font-bold text-base mb-1">{product.name}</h3>

      <p className="text-sm font-medium" style={{ color: '#C85A2A' }}>
        {formatPrice(range?.max ?? product.price)}
      </p>
    </Link>
  );
}
