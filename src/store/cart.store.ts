import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, CartTotals } from '@/types/cart';
import type { AppliedCoupon } from '@/types/coupon';
import { calculateShipping } from '@/lib/shipping';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  appliedCoupon: AppliedCoupon | null;

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      appliedCoupon: null,

      addItem: (newItem) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === newItem.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === newItem.id
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, newItem] };
        }),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) =>
                  i.id === id ? { ...i, quantity } : i
                ),
        })),

      clearCart: () => set({ items: [], appliedCoupon: null }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),
      removeCoupon: () => set({ appliedCoupon: null }),
    }),
    {
      name: 'ddsirup-cart',
      partialize: (state) => ({ items: state.items, appliedCoupon: state.appliedCoupon }),
    }
  )
);

// Selectors
export function useCartTotals(): CartTotals {
  const items = useCartStore((s) => s.items);
  const appliedCoupon = useCartStore((s) => s.appliedCoupon);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const shippingCalc = calculateShipping(items);
  const shipping = itemCount === 0 ? 0 : shippingCalc.priceWithVat;
  const shippingWithoutVat = itemCount === 0 ? 0 : shippingCalc.priceWithoutVat;

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
    } else {
      discount = Math.min(appliedCoupon.discountValue, subtotal);
    }
  }

  const total = Math.max(0, subtotal - discount + shipping);
  return {
    subtotal,
    discount,
    shipping,
    shippingWithoutVat,
    totalWeight: shippingCalc.totalWeightKg,
    packageCount: shippingCalc.packageCount,
    total,
    itemCount,
  };
}

export function useCartItemCount(): number {
  return useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
}
