'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuantityControl } from '@/components/ui/QuantityControl';
import { CartSummary } from '@/components/cart/CartSummary';
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper';
import RelatedProducts from '@/components/shop/RelatedProducts';
import { Container } from '@/components/ui/Container';
import { useCartStore } from '@/store/cart.store';
import { formatPrice, formatPriceWithoutVat, getStrapiImageUrl, getProductUrl } from '@/lib/utils';
import { useVatRate } from '@/providers/vat-rate-provider';
import type { Product } from '@/types/product';
import { STRAPI_URL } from '@/lib/constants';

export default function CartPage() {
  const vatRate = useVatRate();
  const { items, removeItem, updateQuantity } = useCartStore();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch(`${STRAPI_URL}/api/products?populate=images,variants&pagination[pageSize]=4&sort=createdAt:desc`)
      .then((r) => r.json())
      .then((json) => setRelatedProducts(json.data ?? []))
      .catch(() => {});
  }, []);

  if (items.length === 0) {
    return (
      <Container className="py-8">
        <CheckoutStepper activeStep={1} />
        <div className="text-center py-16">
          <h1 className="text-3xl font-bold mb-4">Košík</h1>
          <p className="text-muted-foreground mb-8">Váš košík je prázdný</p>
          <Button asChild>
            <Link href="/pro-kazdeho">Pokračovat v nákupu</Link>
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <CheckoutStepper activeStep={1} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 min-h-[50vh]">
        {/* Left: Cart table + coupon */}
        <div className="lg:col-span-3">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 pb-3 border-b text-sm font-semibold text-muted-foreground">
            <span>Produkt</span>
            <span className="w-24 text-center">Cena</span>
            <span className="w-28 text-center">Množství</span>
            <span className="w-24 text-right">Mezisoučet</span>
          </div>

          {/* Cart items */}
          <div className="divide-y">
            {items.map((item) => {
              const imgUrl = getStrapiImageUrl(item.thumbnail);
              return (
                <div key={item.id} className="py-4">
                  {/* Desktop row */}
                  <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-coral hover:text-coral/70 shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="relative h-16 w-12 shrink-0">
                        {imgUrl ? (
                          <Image src={imgUrl} alt={item.name} fill className="object-contain" />
                        ) : (
                          <div className="w-full h-full bg-muted rounded" />
                        )}
                      </div>
                      <div>
                        <Link href={getProductUrl(item.slug, item.categorySlug)} className="font-medium hover:underline text-sm">
                          {item.name}
                        </Link>
                        {item.variant && (
                          <p className="text-xs text-muted-foreground">{item.variant.name}</p>
                        )}
                      </div>
                    </div>
                    <div className="w-24 text-center">
                      <span className="text-sm text-coral font-medium">{formatPrice(item.price)}</span>
                      <p className="text-xs text-muted-foreground">{formatPriceWithoutVat(item.price, vatRate)} bez DPH</p>
                    </div>
                    <div className="w-28 flex justify-center">
                      <QuantityControl
                        value={item.quantity}
                        onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
                        onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                        size="md"
                        bordered
                      />
                    </div>
                    <div className="w-24 text-right">
                      <span className="text-sm text-coral font-medium">{formatPrice(item.price * item.quantity)}</span>
                      <p className="text-xs text-muted-foreground">{formatPriceWithoutVat(item.price * item.quantity, vatRate)} bez DPH</p>
                    </div>
                  </div>

                  {/* Mobile card */}
                  <div className="sm:hidden flex gap-3">
                    <div className="relative h-20 w-16 shrink-0">
                      {imgUrl ? (
                        <Image src={imgUrl} alt={item.name} fill className="object-contain" />
                      ) : (
                        <div className="w-full h-full bg-muted rounded" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link href={getProductUrl(item.slug, item.categorySlug)} className="font-medium hover:underline text-sm leading-tight">
                            {item.name}
                          </Link>
                          {item.variant && (
                            <p className="text-xs text-muted-foreground">{item.variant.name}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-coral hover:text-coral/70 shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-coral font-medium mt-1">{formatPrice(item.price)}</p>
                      <p className="text-xs text-muted-foreground">{formatPriceWithoutVat(item.price, vatRate)} bez DPH</p>
                      <div className="flex items-center justify-between mt-2">
                        <QuantityControl
                          value={item.quantity}
                          onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
                          onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                          size="md"
                          bordered
                        />
                        <div className="text-right">
                          <span className="text-sm text-coral font-medium">{formatPrice(item.price * item.quantity)}</span>
                          <p className="text-xs text-muted-foreground">{formatPriceWithoutVat(item.price * item.quantity, vatRate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-2">
          <CartSummary />
        </div>
      </div>

      <RelatedProducts products={relatedProducts} className="mt-20 mb-8" />
    </Container>
  );
}
