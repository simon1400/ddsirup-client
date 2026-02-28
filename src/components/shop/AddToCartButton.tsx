'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart.store';
import { cartItemFromProduct } from '@/types/cart';
import type { Product, ProductVariant } from '@/types/product';

interface AddToCartButtonProps {
  product: Product;
  variant?: ProductVariant;
  quantity?: number;
}

export function AddToCartButton({ product, variant, quantity = 1 }: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { addItem, openCart } = useCartStore();

  const isOutOfStock = (variant?.stock ?? product.stock) <= 0;

  function handleAdd() {
    setIsAdding(true);
    addItem(cartItemFromProduct(product, quantity, variant));
    toast.success(`${product.name} přidán do košíku`);
    openCart();
    setTimeout(() => setIsAdding(false), 500);
  }

  return (
    <Button
      size="lg"
      className="w-full"
      onClick={handleAdd}
      disabled={isOutOfStock || isAdding}
    >
      <ShoppingCart className="h-5 w-5 mr-2" />
      {isOutOfStock ? 'Vyprodáno' : 'Přidat do košíku'}
    </Button>
  );
}
