'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart.store';
import type { CartLineStatus } from '@/lib/cart-validation';
import type { CartItem } from '@/types/cart';

interface UnavailableItemsAlertProps {
  items: CartItem[];
  statusByItemId: Record<string, CartLineStatus>;
  className?: string;
}

/**
 * Warns about cart lines that can no longer be ordered — typically a variant
 * switched off in Strapi long after it was added to the persisted cart.
 */
export function UnavailableItemsAlert({
  items,
  statusByItemId,
  className,
}: UnavailableItemsAlertProps) {
  const removeItems = useCartStore((s) => s.removeItems);

  if (items.length === 0) return null;

  return (
    <div
      className={`rounded-2xl border border-coral/40 bg-coral/10 p-4 sm:p-5 ${className ?? ''}`}
      role="alert"
    >
      <div className="flex gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-coral" />
        <div className="flex-1 space-y-2">
          <p className="font-semibold text-sm">
            {items.length === 1
              ? 'Jedna položka v košíku už není dostupná'
              : 'Některé položky v košíku už nejsou dostupné'}
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {items.map((item) => (
              <li key={item.id}>
                {statusByItemId[item.id]?.message ??
                  `Produkt „${item.name}“ již není dostupný.`}
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            Objednávku lze dokončit až po jejich odebrání.
          </p>
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-coral text-coral hover:bg-coral hover:text-white"
            onClick={() => removeItems(items.map((i) => i.id))}
          >
            Odebrat nedostupné položky
          </Button>
        </div>
      </div>
    </div>
  );
}
