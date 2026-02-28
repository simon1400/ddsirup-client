import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/product';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const thumbnailUrl = product.thumbnail?.url
    ? product.thumbnail.url.startsWith('http')
      ? product.thumbnail.url
      : `${STRAPI_URL}${product.thumbnail.url}`
    : null;

  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const isOutOfStock = product.stock <= 0;

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group overflow-hidden hover:shadow-md transition-shadow h-full">
        <div className="relative aspect-square bg-muted overflow-hidden">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={product.thumbnail?.alternativeText ?? product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              Bez obrázku
            </div>
          )}

          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isOnSale && <Badge variant="destructive">Sleva</Badge>}
            {isOutOfStock && <Badge variant="secondary">Vyprodáno</Badge>}
          </div>
        </div>

        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground mb-1">{product.category?.name}</p>
          <h3 className="font-medium text-sm line-clamp-2 mb-2">{product.name}</h3>

          <div className="flex items-center gap-2">
            <span className="font-semibold">{formatPrice(product.price)}</span>
            {isOnSale && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
