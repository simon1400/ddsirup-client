'use client';

import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper';
import { Container } from '@/components/ui/Container';

export default function CheckoutPage() {
  return (
    <Container className="py-8 min-h-screen">
      <CheckoutStepper activeStep={2} />
      <CheckoutForm />
    </Container>
  );
}
