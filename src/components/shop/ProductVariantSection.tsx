'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { QuantityControl } from '@/components/ui/QuantityControl';
import { AddToCartButton } from '@/components/shop/AddToCartButton';
import { formatPrice } from '@/lib/utils';
import type { Product, ProductVariant } from '@/types/product';

interface ProductVariantSectionProps {
  product: Product;
}

function getMaxVariant(variants: ProductVariant[]): ProductVariant | undefined {
  return variants
    .filter((v) => typeof v.price === 'number' && v.price > 0)
    .sort((a, b) => (b.price ?? 0) - (a.price ?? 0))[0];
}

export function ProductVariantSection({ product }: ProductVariantSectionProps) {
  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;

  const defaultVariant = hasVariants ? getMaxVariant(variants) : undefined;
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(defaultVariant);
  const [quantity, setQuantity] = useState(1);

  const displayPrice = selectedVariant?.price ?? product.price;
  const isOutOfStock = (selectedVariant?.stock ?? product.stock) <= 0;
  const stockCount = selectedVariant?.stock ?? product.stock;

  function handleVariantChange(variantId: string) {
    const v = variants.find((v) => String(v.id) === variantId);
    setSelectedVariant(v);
    setQuantity(1);
  }

  return (
    <>
      {hasVariants && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Vyberte objem</label>
          <div className="flex items-center gap-4">
            <Select
              value={selectedVariant ? String(selectedVariant.id) : undefined}
              onValueChange={handleVariantChange}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Vyberte objem" />
              </SelectTrigger>
              <SelectContent>
                {variants.map((v) => (
                  <SelectItem key={v.id} value={String(v.id)}>
                    {v.name}{v.volume ? ` – ${v.volume}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-2xl font-bold text-coral">{formatPrice(displayPrice)}</span>
          </div>
        </div>
      )}

      {!hasVariants && (
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-coral">{formatPrice(displayPrice)}</span>
        </div>
      )}

      <Separator />

      <div className="space-y-3">
        {isOutOfStock ? (
          <Badge variant="secondary" className="text-sm px-3 py-1">Vyprodáno</Badge>
        ) : (
          <p className="text-sm text-green-600">Skladem ({stockCount} ks)</p>
        )}

        <div className="flex items-center gap-3">
          <QuantityControl
            value={quantity}
            onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
            onIncrement={() => setQuantity((q) => Math.min(stockCount, q + 1))}
            min={1}
            max={stockCount}
            size="lg"
            bordered
          />
          <div className="flex-1">
            <AddToCartButton product={product} variant={selectedVariant} quantity={quantity} />
          </div>
        </div>
      </div>
    </>
  );
}
