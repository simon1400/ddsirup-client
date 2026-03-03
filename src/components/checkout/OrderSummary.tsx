import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';

interface OrderSummaryProps {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
}

export function OrderSummary({ subtotal, discount, shipping, total, couponCode }: OrderSummaryProps) {
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
      <div className="flex justify-between">
        <span>Doprava</span>
        <span>{shipping === 0 ? 'Zdarma' : formatPrice(shipping)}</span>
      </div>
      <Separator />
      <div className="flex justify-between font-semibold text-base">
        <span>Celkem k úhradě</span>
        <span>{formatPrice(total)}</span>
      </div>
    </section>
  );
}
