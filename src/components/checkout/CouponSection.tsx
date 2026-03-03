'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppliedCouponBadge } from '@/components/cart/AppliedCouponBadge';
import { useCartStore, useCartTotals } from '@/store/cart.store';
import { validateCoupon } from '@/lib/strapi';

export function CouponSection() {
  const { appliedCoupon, applyCoupon, removeCoupon } = useCartStore();
  const { subtotal } = useCartTotals();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply() {
    const code = input.trim();
    if (!code) return;
    setIsLoading(true);
    setError(null);
    try {
      const coupon = await validateCoupon(code, subtotal);
      applyCoupon(coupon);
      setInput('');
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Neplatný kupón');
    } finally {
      setIsLoading(false);
    }
  }

  if (appliedCoupon) {
    return (
      <section>
        <AppliedCouponBadge coupon={appliedCoupon} onRemove={removeCoupon} />
      </section>
    );
  }

  return (
    <section className="space-y-2">
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={isOpen}
          onChange={(e) => {
            setIsOpen(e.target.checked);
            setError(null);
          }}
          className="h-4 w-4 rounded border-gray-300 accent-foreground"
        />
        <span className="text-sm">Máte kupon? Klikněte zde a zadejte Váš kód</span>
      </label>

      {isOpen && (
        <div className="space-y-2 pt-1">
          <div className="flex gap-2">
            <Input
              placeholder="Kód kupónu"
              value={input}
              onChange={(e) => {
                setInput(e.target.value.toUpperCase());
                setError(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              className="text-sm h-9"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 shrink-0"
              onClick={handleApply}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? '...' : 'Použít'}
            </Button>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}
    </section>
  );
}
