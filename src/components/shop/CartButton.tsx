'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore, useCartItemCount } from '@/store/cart.store';

export function CartButton() {
  const toggleCart = useCartStore((s) => s.toggleCart);
  const count = useCartItemCount();

  return (
    <Button variant="ghost" size="icon" onClick={toggleCart} className="relative">
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
          {count > 99 ? '99+' : count}
        </span>
      )}
      <span className="sr-only">Košík ({count})</span>
    </Button>
  );
}
