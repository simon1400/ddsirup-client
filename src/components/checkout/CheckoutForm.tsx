'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCartStore, useCartTotals } from '@/store/cart.store';
import { formatPrice, generateOrderNumber } from '@/lib/utils';
import { checkoutSchema, ZIP_REGEX, type CheckoutFormValues } from './checkout.schema';
import { FieldError } from './checkout.helpers';
import { BillingSection } from './BillingSection';
import { ShippingSection } from './ShippingSection';
import { CouponSection } from './CouponSection';
import { OrderSummary } from './OrderSummary';
import { PaymentSection } from './PaymentSection';

export function CheckoutForm() {
  const router = useRouter();
  const { items, clearCart, appliedCoupon } = useCartStore();
  const { subtotal, discount, shipping, total } = useCartTotals();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      billingAddress: { country: 'CZ' },
      shippingAddress: { country: 'CZ' },
      shipToDifferentAddress: false,
      paymentMethod: 'ALL',
      agreedToTerms: false,
      forChildren: 'false',
      forBar: 'false',
    },
  });

  const shipToDifferentAddress = form.watch('shipToDifferentAddress');
  const paymentMethod = form.watch('paymentMethod');
  const errors = form.formState.errors;

  async function onSubmit(values: CheckoutFormValues) {
    if (values.shipToDifferentAddress) {
      let hasError = false;
      const sa = values.shippingAddress;
      if (!sa?.street || sa.street.length < 3) {
        form.setError('shippingAddress.street', { message: 'Ulice je povinná' });
        hasError = true;
      }
      if (!sa?.city || sa.city.length < 2) {
        form.setError('shippingAddress.city', { message: 'Město je povinné' });
        hasError = true;
      }
      if (!sa?.zip || !ZIP_REGEX.test(sa.zip)) {
        form.setError('shippingAddress.zip', { message: 'Neplatné PSČ (formát: 123 45)' });
        hasError = true;
      }
      if (hasError) return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const orderNumber = generateOrderNumber();

      const shippingAddr = values.shipToDifferentAddress
        ? {
            street: values.shippingAddress!.street!,
            streetLine2: values.shippingAddress!.streetLine2,
            city: values.shippingAddress!.city!,
            zip: values.shippingAddress!.zip!,
            country: 'CZ',
            company: values.shippingAddress!.company,
          }
        : values.billingAddress;

      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber,
          items,
          subtotal,
          shippingCost: shipping,
          total,
          currency: 'CZK',
          customerEmail: values.email,
          customerFirstName: values.firstName,
          customerLastName: values.lastName,
          customerPhone: values.phone,
          shippingAddress: shippingAddr,
          billingAddress: values.billingAddress,
          notes: values.notes,
          couponCode: appliedCoupon?.code,
          discountAmount: discount > 0 ? discount : undefined,
          paymentMethod: values.paymentMethod,
          customerForChildren: values.forChildren === 'true',
          customerForBar: values.forBar === 'true',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Chyba při vytváření platby');

      clearCart();

      if (data.redirect) {
        window.location.href = data.redirect;
      } else {
        router.push(`/checkout/success?order=${orderNumber}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nastala chyba. Zkuste to prosím znovu.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <BillingSection form={form} />

      <Separator />

      <ShippingSection form={form} shipToDifferentAddress={shipToDifferentAddress} />

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-3">Další informace</h2>
        <div>
          <Label htmlFor="notes">Poznámky k objednávce (volitelný)</Label>
          <Textarea
            id="notes"
            className="mt-1"
            placeholder="Poznámky k Vaší objednávce, např. speciální požadavky na doručení."
            rows={4}
            {...form.register('notes')}
          />
        </div>
      </section>

      <Separator />

      <CouponSection />

      <Separator />

      <OrderSummary
        subtotal={subtotal}
        discount={discount}
        shipping={shipping}
        total={total}
        couponCode={appliedCoupon?.code}
      />

      <Separator />

      <PaymentSection form={form} currentMethod={paymentMethod} />

      <p className="text-xs text-muted-foreground">
        Vaše osobní údaje budou použity k vyřízení Vaší objednávky, zvýšení spokojenosti po celou
        dobu procházení tohoto webu a k dalším účelům popsaným na stránce{' '}
        <a href="/ochrana-osobnich-udaju" className="underline hover:text-foreground">
          ochrana osobních údajů
        </a>
        .
      </p>

      <div className="space-y-1">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            id="agreedToTerms"
            className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-foreground"
            {...form.register('agreedToTerms')}
          />
          <span className="text-sm">
            Přečetl/a jsem si{' '}
            <a href="/obchodni-podminky" className="underline hover:text-foreground">
              obchodní podmínky
            </a>{' '}
            a souhlasím s nimi *
          </span>
        </label>
        <FieldError message={errors.agreedToTerms?.message} />
      </div>

      {error && (
        <p className="rounded bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isLoading || items.length === 0}
      >
        {isLoading ? 'Zpracovávám...' : `Zaplatit ${formatPrice(total)}`}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Platba je zpracována bezpečně přes Comgate. Po kliknutí budete přesměrováni na platební bránu.
      </p>
    </form>
  );
}
