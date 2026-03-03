'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore, useCartItemCount } from '@/store/cart.store';

export function CartButton() {
  const toggleCart = useCartStore((s) => s.toggleCart);
  const count = useCartItemCount();

  return (
    <Button variant="ghost" onClick={toggleCart} className="relative h-12 w-12">
      <ShoppingCart className="h-10 w-10" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full text-black text-xs flex items-center justify-center font-bold" style={{ backgroundColor: '#C8D870' }}>
          {count > 99 ? '99+' : count}
        </span>
      )}
      <span className="sr-only">Košík ({count})</span>
    </Button>
  );
}
