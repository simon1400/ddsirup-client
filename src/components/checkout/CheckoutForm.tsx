'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useCartStore, useCartTotals } from '@/store/cart.store';
import { formatPrice, generateOrderNumber } from '@/lib/utils';
import type { CheckoutFormData } from '@/types/order';

const addressSchema = z.object({
  street: z.string().min(3, 'Ulice je povinná'),
  city: z.string().min(2, 'Město je povinné'),
  zip: z.string().regex(/^\d{3}\s?\d{2}$/, 'Neplatné PSČ'),
  country: z.string().min(2),
  company: z.string().optional(),
  ico: z.string().optional(),
  dic: z.string().optional(),
});

const checkoutSchema = z.object({
  firstName: z.string().min(2, 'Jméno je povinné'),
  lastName: z.string().min(2, 'Příjmení je povinné'),
  email: z.string().email('Neplatný e-mail'),
  phone: z.string().optional(),
  shippingAddress: addressSchema,
  billingAddressSameAsShipping: z.boolean(),
  billingAddress: addressSchema.optional(),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function CheckoutForm() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { subtotal, shipping, total } = useCartTotals();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      billingAddressSameAsShipping: true,
      shippingAddress: { country: 'CZ' },
    },
  });

  const sameAddress = form.watch('billingAddressSameAsShipping');

  async function onSubmit(values: CheckoutFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const orderNumber = generateOrderNumber();

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
          shippingAddress: values.shippingAddress,
          billingAddress: values.billingAddressSameAsShipping
            ? values.shippingAddress
            : values.billingAddress,
          notes: values.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Chyba při vytváření platby');

      clearCart();

      // Redirect to Comgate payment page
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal info */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Osobní údaje</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="firstName">Jméno *</Label>
            <Input id="firstName" {...form.register('firstName')} />
            {form.formState.errors.firstName && (
              <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="lastName">Příjmení *</Label>
            <Input id="lastName" {...form.register('lastName')} />
            {form.formState.errors.lastName && (
              <p className="text-xs text-destructive">{form.formState.errors.lastName.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">E-mail *</Label>
            <Input id="email" type="email" {...form.register('email')} />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" type="tel" {...form.register('phone')} />
          </div>
        </div>
      </section>

      <Separator />

      {/* Shipping address */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Doručovací adresa</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <Label htmlFor="street">Ulice a číslo popisné *</Label>
            <Input id="street" {...form.register('shippingAddress.street')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="city">Město *</Label>
              <Input id="city" {...form.register('shippingAddress.city')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="zip">PSČ *</Label>
              <Input id="zip" {...form.register('shippingAddress.zip')} placeholder="123 45" />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="company">Firma (nepovinné)</Label>
            <Input id="company" {...form.register('shippingAddress.company')} />
          </div>
        </div>
      </section>

      <Separator />

      {/* Notes */}
      <section>
        <div className="space-y-1">
          <Label htmlFor="notes">Poznámka k objednávce</Label>
          <Textarea id="notes" {...form.register('notes')} rows={3} />
        </div>
      </section>

      <Separator />

      {/* Order summary */}
      <section className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Mezisoučet</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Doprava</span>
          <span>{shipping === 0 ? 'Zdarma' : formatPrice(shipping)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-semibold text-lg">
          <span>Celkem k úhradě</span>
          <span>{formatPrice(total)}</span>
        </div>
      </section>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded p-3">{error}</p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={isLoading || items.length === 0}>
        {isLoading ? 'Zpracovávám...' : `Zaplatit ${formatPrice(total)}`}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Platba je zpracována bezpečně přes Comgate. Po kliknutí budete přesměrováni na platební bránu.
      </p>
    </form>
  );
}
