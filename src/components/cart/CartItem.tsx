'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuantityControl } from '@/components/ui/QuantityControl';
import { formatPrice, getStrapiImageUrl } from '@/lib/utils';
import type { CartItem as CartItemType } from '@/types/cart';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const imgUrl = getStrapiImageUrl(item.thumbnail);

  return (
    <div className="flex gap-4 p-4 border rounded-lg">
      <div className="relative h-24 w-24 shrink-0 rounded-md overflow-hidden bg-muted">
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
          <QuantityControl
            value={item.quantity}
            onDecrement={() => onUpdateQuantity(item.id, item.quantity - 1)}
            onIncrement={() => onUpdateQuantity(item.id, item.quantity + 1)}
            max={item.stock}
            size="md"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground ml-2"
            onClick={() => onRemove(item.id)}
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
}
