'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCartStore, useCartTotals } from '@/store/cart.store';
import { formatPrice } from '@/lib/utils';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();
  const { subtotal, shipping, total, itemCount } = useCartTotals();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Košík ({itemCount})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <p>Košík je prázdný</p>
            <Button variant="outline" onClick={closeCart} asChild>
              <Link href="/products">Prohlédnout produkty</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => {
                const imgUrl = item.thumbnail
                  ? item.thumbnail.startsWith('http')
                    ? item.thumbnail
                    : `${STRAPI_URL}${item.thumbnail}`
                  : null;

                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                      {imgUrl ? (
                        <Image src={imgUrl} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      {item.variant && (
                        <p className="text-xs text-muted-foreground">{item.variant.name}</p>
                      )}
                      <p className="text-sm font-semibold mt-1">{formatPrice(item.price)}</p>

                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0 text-muted-foreground"
                      onClick={() => removeItem(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span>Mezisoučet</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Doprava</span>
                <span>{shipping === 0 ? 'Zdarma' : formatPrice(shipping)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Celkem</span>
                <span>{formatPrice(total)}</span>
              </div>

              <Button className="w-full" asChild onClick={closeCart}>
                <Link href="/checkout">Přejít k pokladně</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild onClick={closeCart}>
                <Link href="/cart">Zobrazit košík</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
