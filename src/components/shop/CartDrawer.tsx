'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingBag } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
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
      <SheetContent
        className="flex flex-col w-full sm:max-w-md border-none p-0 [&>button]:hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b">
          <h2 className="text-2xl font-bold uppercase tracking-wide">
            Košík <span className="text-coral">({itemCount})</span>
          </h2>
          <button
            onClick={closeCart}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Zavřít košík"
          >
            <X className="h-7 w-7" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
            <p className="text-lg text-muted-foreground">Košík je prázdný</p>
            <Link
              href="/produkty"
              onClick={closeCart}
              className="bg-coral text-white font-bold uppercase text-sm tracking-widest px-8 py-3 rounded-full hover:bg-coral/90 transition-colors"
            >
              Prohlédnout produkty
            </Link>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => {
                const imgUrl = getStrapiImageUrl(item.thumbnail);

                return (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-muted last:border-0">
                    <Link
                      href={`/produkty/${item.slug}`}
                      onClick={closeCart}
                      className="relative h-28 w-22 shrink-0"
                    >
                      {imgUrl ? (
                        <Image src={imgUrl} alt={item.name} fill className="object-contain" />
                      ) : (
                        <div className="w-full h-full bg-muted rounded-lg" />
                      )}
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/produkty/${item.slug}`}
                          onClick={closeCart}
                          className="font-semibold text-sm leading-tight hover:underline"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-coral hover:text-coral/70 shrink-0 transition-colors"
                          aria-label={`Odebrat ${item.name}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {item.variant && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.variant.name}</p>
                      )}

                      <p className="text-sm font-bold text-coral mt-1">{formatPrice(item.price)}</p>
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
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="bg-muted/40 px-6 py-5 space-y-3 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mezisoučet</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Doprava (Messenger)</span>
                <span className="font-medium">{formatPrice(shipping)}</span>
              </div>

              <div className="h-px bg-border" />

              <div className="flex justify-between items-baseline">
                <span className="text-lg font-bold">Celkem</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-coral">{formatPrice(total)}</span>
                  <p className="text-xs text-muted-foreground">{formatPriceWithoutVat(total, vatRate)} bez DPH</p>
                </div>
              </div>

              <Link
                href="/pokladna"
                onClick={closeCart}
                className="block w-full text-center bg-coral text-white font-bold uppercase text-sm tracking-widest px-6 py-4 rounded-full hover:bg-coral/90 transition-colors"
              >
                Přejít k pokladně
              </Link>
              <Link
                href="/kosik"
                onClick={closeCart}
                className="block w-full text-center border-2 border-foreground text-foreground font-bold uppercase text-sm tracking-widest px-6 py-3.5 rounded-full hover:bg-category-yellow hover:border-category-yellow hover:text-gray-900 transition-colors"
              >
                Zobrazit košík
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
