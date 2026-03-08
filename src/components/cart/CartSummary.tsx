'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppliedCouponBadge } from '@/components/cart/AppliedCouponBadge';
import { useCartStore, useCartTotals } from '@/store/cart.store';
import { formatPrice, formatPriceWithoutVat } from '@/lib/utils';
import { useVatRate } from '@/providers/vat-rate-provider';
import type { AppliedCoupon } from '@/types/coupon';

export function CartSummary() {
  const vatRate = useVatRate();
  const { appliedCoupon, applyCoupon, removeCoupon } = useCartStore();
  const { subtotal, discount, shipping, shippingWithoutVat, total, totalWeight, packageCount } = useCartTotals();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);


  async function handleApplyCoupon() {
    const code = couponInput.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Neplatný kupón');
      }
      const { data: coupon } = (await res.json()) as { data: AppliedCoupon };
      applyCoupon(coupon);
      setCouponInput('');
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Neplatný kupón');
    } finally {
      setCouponLoading(false);
    }
  }

  return (
    <div className="bg-muted/50 rounded-2xl p-6 space-y-5 sticky top-24">
      <h2 className="text-2xl font-bold text-coral">Celkem k platbě</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center border-b pb-3">
          <span className="font-medium">Mezisoučet</span>
          <div className="text-right">
            <span className="text-coral font-semibold">{formatPrice(subtotal)}</span>
            <p className="text-xs text-muted-foreground">{formatPriceWithoutVat(subtotal, vatRate)} bez DPH</p>
          </div>
        </div>

        {discount > 0 && (
          <div className="flex justify-between items-center border-b pb-3 text-green-600">
            <span className="font-medium">Sleva (kupón)</span>
            <span className="font-semibold">−{formatPrice(discount)}</span>
          </div>
        )}

        <div className="border-b pb-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Doprava (Messenger)</span>
            <div className="text-right">
              <span className="font-medium">{formatPrice(shipping)}</span>
              <p className="text-xs text-muted-foreground">{formatPrice(shippingWithoutVat)} bez DPH</p>
            </div>
          </div>
          {totalWeight > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {totalWeight.toFixed(1)} kg · {packageCount}{' '}
              {packageCount === 1 ? 'balík' : packageCount < 5 ? 'balíky' : 'balíků'}
            </p>
          )}
        </div>

        <div className="flex justify-between items-baseline pt-1">
          <span className="font-semibold text-base">Cena celkem</span>
          <div className="text-right">
            <span className="text-coral font-bold text-lg">{formatPrice(total)}</span>
            <p className="text-sm text-muted-foreground font-normal">
              {formatPriceWithoutVat(total, vatRate)} bez DPH
            </p>
          </div>
        </div>
      </div>

      {/* Coupon */}
      {appliedCoupon ? (
        <AppliedCouponBadge coupon={appliedCoupon} onRemove={removeCoupon} />
      ) : (
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Kód kuponu"
              value={couponInput}
              onChange={(e) => {
                setCouponInput(e.target.value.toUpperCase());
                setCouponError(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
              className="h-12 rounded-full px-5 text-sm"
            />
            <Button
              onClick={handleApplyCoupon}
              disabled={couponLoading || !couponInput.trim()}
              className="bg-coral hover:bg-coral/90 text-white h-12 px-6 rounded-full font-bold shrink-0 w-full sm:w-auto"
            >
              {couponLoading ? '...' : 'Použít kupon'}
            </Button>
          </div>
          {couponError && <p className="text-xs text-destructive">{couponError}</p>}
        </div>
      )}

      <Button
        className="w-full bg-coral hover:bg-coral/90 text-white font-bold uppercase tracking-wider rounded-full h-14 text-base"
        asChild
      >
        <Link href="/pokladna">Přejít k pokladně</Link>
      </Button>
    </div>
  );
}
