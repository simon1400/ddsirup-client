'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCartStore, useCartTotals } from '@/store/cart.store';
import { formatPrice } from '@/lib/utils';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCartStore();
  const { subtotal, shipping, total, itemCount } = useCartTotals();

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
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const imgUrl = item.thumbnail
              ? item.thumbnail.startsWith('http')
                ? item.thumbnail
                : `${STRAPI_URL}${item.thumbnail}`
              : null;

            return (
              <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                <div className="relative h-24 w-24 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                  {imgUrl ? (
                    <Image src={imgUrl} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                </div>

                <div className="flex-1">
                  <Link href={`/products/${item.slug}`} className="font-medium hover:underline">
                    {item.name}
                  </Link>
                  {item.variant && (
                    <p className="text-sm text-muted-foreground">{item.variant.name}</p>
                  )}
                  <p className="font-semibold mt-1">{formatPrice(item.price)}</p>

                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground ml-2"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 space-y-4 sticky top-24">
            <h2 className="font-semibold text-lg">Souhrn objednávky</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Mezisoučet</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Doprava</span>
                <span>{shipping === 0 ? 'Zdarma' : formatPrice(shipping)}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Celkem</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Button className="w-full" size="lg" asChild>
              <Link href="/checkout">Přejít k pokladně</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/products">Pokračovat v nákupu</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
