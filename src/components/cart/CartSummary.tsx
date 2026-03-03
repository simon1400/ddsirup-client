'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { AppliedCouponBadge } from '@/components/cart/AppliedCouponBadge';
import { useCartStore, useCartTotals } from '@/store/cart.store';
import { formatPrice } from '@/lib/utils';
import { validateCoupon } from '@/lib/strapi';

export function CartSummary() {
  const { appliedCoupon, applyCoupon, removeCoupon } = useCartStore();
  const { subtotal, discount, shipping, total } = useCartTotals();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  async function handleApplyCoupon() {
    const code = couponInput.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const coupon = await validateCoupon(code, subtotal);
      applyCoupon(coupon);
      setCouponInput('');
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Neplatný kupón');
    } finally {
      setCouponLoading(false);
    }
  }

  return (
    <div className="border rounded-lg p-6 space-y-4 sticky top-24">
      <h2 className="font-semibold text-lg">Souhrn objednávky</h2>

      {appliedCoupon ? (
        <AppliedCouponBadge coupon={appliedCoupon} onRemove={removeCoupon} />
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Kód kupónu"
              value={couponInput}
              onChange={(e) => {
                setCouponInput(e.target.value.toUpperCase());
                setCouponError(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
              className="text-sm h-9"
            />
            <Button
              variant="outline"
              size="sm"
              className="h-9 shrink-0"
              onClick={handleApplyCoupon}
              disabled={couponLoading || !couponInput.trim()}
            >
              {couponLoading ? '...' : 'Použít'}
            </Button>
          </div>
          {couponError && <p className="text-xs text-destructive">{couponError}</p>}
        </div>
      )}

      <Separator />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Mezisoučet</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Sleva (kupón)</span>
            <span>−{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Doprava</span>
          <span>{shipping === 0 ? 'Zdarma' : formatPrice(shipping)}</span>
        </div>
      </div>

      <Separator />

      <div className="flex justify-between font-semibold">
        <span>Celkem</span>
        <span>{formatPrice(total)}</span>
      </div>

      <Button className="w-full" size="lg" asChild>
        <Link href="/checkout">Přejít k pokladně</Link>
      </Button>
      <Button variant="outline" className="w-full" asChild>
        <Link href="/products">Pokračovat v nákupu</Link>
      </Button>
    </div>
  );
}
