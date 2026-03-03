import type { Metadata } from 'next';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: 'Pokladna',
};

export default function CheckoutPage() {
  return (
    <Container size="sm" className="py-8">
      <h1 className="text-3xl font-bold mb-8">Pokladna</h1>
      <CheckoutForm />
    </Container>
  );
}
