'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { QuantityControl } from '@/components/ui/QuantityControl';
import { AddToCartButton } from '@/components/shop/AddToCartButton';
import { formatPrice, formatPriceWithoutVat } from '@/lib/utils';
import { useVatRate } from '@/providers/vat-rate-provider';
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
  const vatRate = useVatRate();
  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;

  const defaultVariant = hasVariants ? getMaxVariant(variants) : undefined;
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(defaultVariant);
  const [quantity, setQuantity] = useState(1);

  const displayPrice = selectedVariant?.price ?? product.price;

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
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <span className="text-2xl font-bold text-coral">{formatPrice(displayPrice)}</span>
              <p className="text-sm text-muted-foreground">{formatPriceWithoutVat(displayPrice, vatRate)} bez DPH</p>
            </div>
          </div>
        </div>
      )}

      {!hasVariants && (
        <div>
          <span className="text-2xl font-bold text-coral">{formatPrice(displayPrice)}</span>
          <p className="text-sm text-muted-foreground">{formatPriceWithoutVat(displayPrice, vatRate)} bez DPH</p>
        </div>
      )}

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <QuantityControl
            value={quantity}
            onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
            onIncrement={() => setQuantity((q) => q + 1)}
            min={1}
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
