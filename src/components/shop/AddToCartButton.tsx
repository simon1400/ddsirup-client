'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart.store';
import { cartItemFromProduct } from '@/types/cart';
import { trackAddToCart } from '@/lib/facebook-pixel';
import type { Product, ProductVariant } from '@/types/product';

interface AddToCartButtonProps {
  product: Product;
  variant?: ProductVariant;
  quantity?: number;
  disabled?: boolean;
}

export function AddToCartButton({ product, variant, quantity = 1, disabled }: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { addItem, openCart } = useCartStore();

  function handleAdd() {
    setIsAdding(true);
    const price = variant?.price ?? product.price;
    addItem(cartItemFromProduct(product, quantity, variant));
    trackAddToCart({
      contentId: String(product.id),
      contentName: product.name,
      value: price * quantity,
      quantity,
    });
    toast.success(`${product.name} přidán do košíku`);
    openCart();
    setTimeout(() => setIsAdding(false), 500);
  }

  return (
    <Button
      size="lg"
      className="w-full bg-coral hover:bg-coral/90 text-white"
      onClick={handleAdd}
      disabled={isAdding || disabled}
    >
      <ShoppingCart className="h-5 w-5 mr-2" />
      Přidat do košíku
    </Button>
  );
}
