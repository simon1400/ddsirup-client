import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';

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
  return (
    <section className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span>Mezisoučet</span>
        <span>{formatPrice(subtotal)}</span>
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
          <span>{formatPrice(shipping)}</span>
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
        <span>{formatPrice(total)}</span>
      </div>
    </section>
  );
}
