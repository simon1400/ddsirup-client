'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product, ProductVariant } from '@/types/product';
import { cn, formatPrice, formatPriceWithoutVat, getStrapiImageUrl, getProductUrl, formatVolumeShort } from '@/lib/utils';
import { useVatRate } from '@/providers/vat-rate-provider';
import { ProductBadges } from './ProductBadges';

interface ProductCardProps {
  product: Product;
}

/** Variant with the highest price — its price and volume are what the card shows. */
function getPricedVariant(product: Product): ProductVariant | undefined {
  return (product.variants ?? [])
    .filter((v): v is ProductVariant & { price: number } => typeof v.price === 'number' && v.price > 0)
    .sort((a, b) => b.price - a.price)[0];
}

export function ProductCard({ product }: ProductCardProps) {
  const vatRate = useVatRate();
  const thumbnailUrl = getStrapiImageUrl(product.images?.[0]?.url);
  const pricedVariant = getPricedVariant(product);
  const displayPrice = pricedVariant?.price ?? product.price;
  const priceVolume = formatVolumeShort(pricedVariant?.volume);
  const hasBadges = (product.badges?.length ?? 0) > 0;
  const accentColor = product.badges?.[0]?.badgeColor || undefined;

  return (
    <Link
      href={getProductUrl(product.slug, product.category?.slug)}
      draggable={false}
      className="group flex flex-col items-center text-center rounded-3xl border border-transparent p-3 md:p-4 transition-colors"
      style={
        hasBadges && accentColor
          ? {
              borderColor: `color-mix(in srgb, ${accentColor} 40%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${accentColor} 5%, transparent)`,
            }
          : undefined
      }
    >
      <div className="relative w-full aspect-2/3 mb-4 overflow-hidden">
        <ProductBadges badges={product.badges} variant="overlay" />
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={product.images?.[0]?.alternativeText ?? product.name}
            fill
            draggable={false}
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
      <p className="text-lg font-semibold text-coral">
        {formatPrice(displayPrice)}
        {priceVolume && <span className="text-muted-foreground font-normal"> / {priceVolume}</span>}
      </p>
      <p className="text-sm text-muted-foreground">{formatPriceWithoutVat(displayPrice, vatRate)} bez DPH</p>
    </Link>
  );
}
