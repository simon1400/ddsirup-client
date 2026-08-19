'use client';

import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '@/store/cart.store';
import {
  cartItemRef,
  cartLineKey,
  type CartLineStatus,
  type CartValidationResponse,
} from '@/lib/cart-validation';
import type { CartItem } from '@/types/cart';

export interface CartValidation {
  statusByItemId: Record<string, CartLineStatus>;
  unavailableItems: CartItem[];
  /** True once the check has run and found something that blocks checkout. */
  hasBlockingIssues: boolean;
  isLoading: boolean;
}

async function fetchCartValidation(items: CartItem[]): Promise<CartValidationResponse> {
  const res = await fetch('/api/cart/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: items.map(cartItemRef) }),
  });
  if (!res.ok) throw new Error('Ověření košíku selhalo');
  return res.json();
}

/**
 * Re-checks the persisted cart against Strapi and keeps its prices in sync.
 *
 * The cart survives in localStorage indefinitely, so an item added while in
 * stock can sit there long after it was switched off. Without this the customer
 * only finds out when /api/payment/create rejects the order.
 */
export function useCartValidation(): CartValidation {
  const items = useCartStore((s) => s.items);
  const syncPrices = useCartStore((s) => s.syncPrices);

  // Key on product identity only — never on price, or the sync below would
  // change the key it just resolved and refetch forever.
  const queryKey = useMemo(
    () => items.map((i) => cartLineKey(cartItemRef(i))).sort().join(','),
    [items]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['cart-validation', queryKey],
    queryFn: () => fetchCartValidation(items),
    enabled: items.length > 0,
    staleTime: 15 * 1000,
    refetchOnWindowFocus: true,
  });

  const statusByItemId = useMemo(() => {
    if (!data) return {};
    const byKey = new Map(data.items.map((s) => [s.key, s]));
    return Object.fromEntries(
      items.flatMap((item) => {
        const status = byKey.get(cartLineKey(cartItemRef(item)));
        return status ? [[item.id, status] as const] : [];
      })
    );
  }, [data, items]);

  // Bring stale localStorage prices in line with Strapi so the cart, the
  // checkout summary and the amount actually charged all agree.
  useEffect(() => {
    const updates = items.flatMap((item) => {
      const status = statusByItemId[item.id];
      if (!status?.available || status.unitPrice == null) return [];
      if (status.unitPrice === item.price) return [];
      return [{ id: item.id, price: status.unitPrice }];
    });
    if (updates.length) syncPrices(updates);
  }, [statusByItemId, items, syncPrices]);

  const unavailableItems = useMemo(
    () => items.filter((item) => statusByItemId[item.id]?.available === false),
    [items, statusByItemId]
  );

  return {
    statusByItemId,
    unavailableItems,
    hasBlockingIssues: unavailableItems.length > 0,
    isLoading,
  };
}
