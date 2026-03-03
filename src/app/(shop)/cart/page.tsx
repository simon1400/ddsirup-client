'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCartStore, useCartTotals } from '@/store/cart.store';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCartStore();
  const { itemCount } = useCartTotals();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Košík</h1>
        <p className="text-muted-foreground mb-8">Váš košík je prázdný</p>
        <Button asChild>
          <Link href="/products">Pokračovat v nákupu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Košík ({itemCount})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>

        <div className="lg:col-span-1">
          <CartSummary />
        </div>
      </div>
    </div>
  );
}
