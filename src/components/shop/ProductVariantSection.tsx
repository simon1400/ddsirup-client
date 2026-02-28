'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

  function decrement() {
    setQuantity((q) => Math.max(1, q - 1));
  }

  function increment() {
    setQuantity((q) => Math.min(stockCount, q + 1));
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold">{formatPrice(displayPrice)}</span>
      </div>

      {hasVariants && (
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
                {v.name}{v.volume ? ` – ${v.volume}` : ''}{typeof v.price === 'number' ? ` (${formatPrice(v.price)})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Separator />

      <div className="space-y-3">
        {isOutOfStock ? (
          <Badge variant="secondary" className="text-sm px-3 py-1">Vyprodáno</Badge>
        ) : (
          <p className="text-sm text-green-600">Skladem ({stockCount} ks)</p>
        )}

        <div className="flex items-center gap-3">
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-r-none"
                onClick={decrement}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center text-sm font-medium">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-l-none"
                onClick={increment}
                disabled={quantity >= stockCount}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <AddToCartButton product={product} variant={selectedVariant} quantity={quantity} />
            </div>
          </div>
      </div>
    </>
  );
}
