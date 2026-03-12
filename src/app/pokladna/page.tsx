'use client';

import { useEffect, useRef } from 'react';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper';
import { Container } from '@/components/ui/Container';
import { useCartStore, useCartTotals } from '@/store/cart.store';
import { trackInitiateCheckout } from '@/lib/facebook-pixel';

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const { total, itemCount } = useCartTotals();
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current && items.length > 0) {
      tracked.current = true;
      trackInitiateCheckout({
        contentIds: items.map((i) => String(i.productId)),
        value: total,
        numItems: itemCount,
      });
    }
  }, [items, total, itemCount]);

  return (
    <Container className="py-8 min-h-screen">
      <CheckoutStepper activeStep={2} />
      <CheckoutForm />
    </Container>
  );
}
