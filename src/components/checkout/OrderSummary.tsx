'use client';

import { Separator } from '@/components/ui/separator';
import { formatPrice, formatPriceWithoutVat } from '@/lib/utils';
import { useVatRate } from '@/providers/vat-rate-provider';

interface OrderSummaryProps {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
  totalWeight?: number;
  packageCount?: number;
}

export function OrderSummary({
  subtotal,
  discount,
  shipping,
  total,
  couponCode,
  totalWeight,
  packageCount,
}: OrderSummaryProps) {
  const vatRate = useVatRate();

  return (
    <section className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span>Mezisoučet</span>
        <div className="text-right">
          <span>{formatPrice(subtotal)}</span>
          <p className="text-xs text-muted-foreground">{formatPriceWithoutVat(subtotal, vatRate)} bez DPH</p>
        </div>
      </div>
      {discount > 0 && couponCode && (
        <div className="flex justify-between text-green-600">
          <span>Sleva ({couponCode})</span>
          <span>−{formatPrice(discount)}</span>
        </div>
      )}
      <div>
        <div className="flex justify-between">
          <span>Doprava (Messenger)</span>
          <div className="text-right">
            <span>{formatPrice(shipping)}</span>
            <p className="text-xs text-muted-foreground">{formatPriceWithoutVat(shipping, vatRate)} bez DPH</p>
          </div>
        </div>
        {totalWeight != null && totalWeight > 0 && packageCount != null && (
          <p className="text-xs text-muted-foreground">
            {totalWeight.toFixed(1)} kg · {packageCount}{' '}
            {packageCount === 1 ? 'balík' : packageCount < 5 ? 'balíky' : 'balíků'}
          </p>
        )}
      </div>
      <Separator />
      <div className="flex justify-between font-semibold text-base">
        <span>Celkem k úhradě</span>
        <div className="text-right">
          <span>{formatPrice(total)}</span>
          <p className="text-sm text-muted-foreground font-normal">{formatPriceWithoutVat(total, vatRate)} bez DPH</p>
        </div>
      </div>
    </section>
  );
}
