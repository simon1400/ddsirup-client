'use client';

import { useCartTotals } from '@/store/cart.store';
import { formatPrice } from '@/lib/utils';

export function FreeShippingProgress() {
  const { subtotal, discount } = useCartTotals();
  const currentTotal = subtotal - discount;
  const threshold = 1000; 
  if (currentTotal <= 0) return null;

  const isFree = currentTotal >= threshold;
  const remaining = Math.max(0, threshold - currentTotal);
  const progress = Math.min(100, (currentTotal / threshold) * 100);

  return (
    <div className="space-y-2 py-3 px-4 bg-muted/30 rounded-xl mb-4 border border-border/50">
      <div className="flex justify-between text-sm">
        {isFree ? (
          <span className="font-semibold text-green-600 flex items-center gap-1.5">
            🎉 Gratulujeme, máte dopravu zdarma!
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">
            Nakupte ještě za <span className="font-bold text-foreground">{formatPrice(remaining)}</span> a máte dopravu zdarma!
          </span>
        )}
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-2">
        <div 
          className={`h-full transition-all duration-500 ease-in-out ${isFree ? 'bg-green-500' : 'bg-coral'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
