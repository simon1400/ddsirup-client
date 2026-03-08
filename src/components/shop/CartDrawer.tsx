'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { QuantityControl } from '@/components/ui/QuantityControl';
import { useCartStore, useCartTotals } from '@/store/cart.store';
import { formatPrice, formatPriceWithoutVat, getStrapiImageUrl } from '@/lib/utils';
import { useVatRate } from '@/providers/vat-rate-provider';

export function CartDrawer() {
  const vatRate = useVatRate();
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
              <Link href="/produkty">Prohlédnout produkty</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => {
                const imgUrl = getStrapiImageUrl(item.thumbnail);

                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-24 w-24 shrink-0 rounded-md overflow-hidden bg-muted">
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
                      <p className="text-xs text-muted-foreground">{formatPriceWithoutVat(item.price, vatRate)} bez DPH</p>

                      <div className="mt-2">
                        <QuantityControl
                          value={item.quantity}
                          onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
                          onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                          max={item.stock}
                          size="sm"
                        />
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground"
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
                <span>Doprava (Messenger)</span>
                <span>{formatPrice(shipping)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Celkem</span>
                <div className="text-right">
                  <span>{formatPrice(total)}</span>
                  <p className="text-xs text-muted-foreground font-normal">{formatPriceWithoutVat(total, vatRate)} bez DPH</p>
                </div>
              </div>

              <Button className="w-full" asChild onClick={closeCart}>
                <Link href="/pokladna">Přejít k pokladně</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild onClick={closeCart}>
                <Link href="/kosik">Zobrazit košík</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
