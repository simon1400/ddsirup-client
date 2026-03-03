'use client';

import { Tag, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { AppliedCoupon } from '@/types/coupon';

interface AppliedCouponBadgeProps {
  coupon: AppliedCoupon;
  onRemove: () => void;
}

export function AppliedCouponBadge({ coupon, onRemove }: AppliedCouponBadgeProps) {
  return (
    <div className="flex items-center justify-between rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm">
      <div className="flex items-center gap-2 text-green-700">
        <Tag className="h-4 w-4" />
        <span className="font-medium">{coupon.code}</span>
        {coupon.discountType === 'percentage' ? (
          <span>−{coupon.discountValue}%</span>
        ) : (
          <span>−{formatPrice(coupon.discountValue)}</span>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="text-green-600 hover:text-green-800 ml-2"
        aria-label="Odebrat kupón"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
