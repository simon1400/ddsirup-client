import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/product';
import { formatPrice, getStrapiImageUrl } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

function getMaxVariantPrice(product: Product): number | null {
  const prices = (product.variants ?? [])
    .map((v) => v.price)
    .filter((p): p is number => typeof p === 'number' && p > 0);
  return prices.length > 0 ? Math.max(...prices) : null;
}

export function ProductCard({ product }: ProductCardProps) {
  const thumbnailUrl = getStrapiImageUrl(product.images?.[0]?.url);
  const displayPrice = getMaxVariantPrice(product) ?? product.price;

  return (
    <Link href={`/produkty/${product.slug}`} className="group flex flex-col items-center text-center">
      <div className="relative w-full aspect-2/3 mb-4 overflow-hidden">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={product.images?.[0]?.alternativeText ?? product.name}
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

      <h3 className="font-bold leading-5 md:leading text-xl md:text-2xl mb-2">{product.name}</h3>
      <p className="text-lg font-semibold text-coral">{formatPrice(displayPrice)}</p>
    </Link>
  );
}
