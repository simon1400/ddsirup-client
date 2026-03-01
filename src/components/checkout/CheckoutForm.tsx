'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useCartStore, useCartTotals } from '@/store/cart.store';
import { formatPrice, generateOrderNumber } from '@/lib/utils';
import { validateCoupon } from '@/lib/strapi';

// Comgate method codes
const PAYMENT_METHODS = [
  { id: 'ALL', label: 'Comgate', description: 'Všechny platební metody' },
  { id: 'CARD_ALL', label: 'Platební kartou', description: 'Visa, Mastercard' },
  { id: 'GPAY', label: 'Google Pay', description: '' },
  { id: 'BANK_ALL', label: 'Rychlá platba online převodem', description: '' },
] as const;

const ZIP_REGEX = /^\d{3}\s?\d{2}$/;

const addressSchema = z.object({
  street: z.string().min(3, { message: 'Ulice je povinná' }),
  streetLine2: z.string().optional(),
  city: z.string().min(2, { message: 'Město je povinné' }),
  zip: z.string().refine((v) => ZIP_REGEX.test(v), { message: 'Neplatné PSČ (formát: 123 45)' }),
  country: z.string(),
  company: z.string().optional(),
  ico: z.string().optional(),
  dic: z.string().optional(),
});

const shippingAddressSchema = z.object({
  street: z.string().optional(),
  streetLine2: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  country: z.string(),
  company: z.string().optional(),
});

const checkoutSchema = z.object({
  firstName: z.string().min(2, { message: 'Jméno je povinné' }),
  lastName: z.string().min(2, { message: 'Příjmení je povinné' }),
  email: z.string().email({ message: 'Neplatný e-mail' }),
  phone: z.string().min(9, { message: 'Telefon je povinný' }),
  billingAddress: addressSchema,
  shipToDifferentAddress: z.boolean(),
  shippingAddress: shippingAddressSchema.optional(),
  notes: z.string().optional(),
  forChildren: z.string(),
  forBar: z.string(),
  paymentMethod: z.string(),
  agreedToTerms: z.boolean().refine((v) => v === true, {
    message: 'Musíte souhlasit s obchodními podmínkami',
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

function CountryField() {
  return (
    <div className="flex h-9 w-full items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
      Česká republika
    </div>
  );
}

export function CheckoutForm() {
  const router = useRouter();
  const { items, clearCart, appliedCoupon, applyCoupon, removeCoupon } = useCartStore();
  const { subtotal, discount, shipping, total } = useCartTotals();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

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

  async function handleApplyCoupon() {
    const code = couponInput.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const coupon = await validateCoupon(code, subtotal);
      applyCoupon(coupon);
      setCouponInput('');
      setCouponOpen(false);
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Neplatný kupón');
    } finally {
      setCouponLoading(false);
    }
  }

  async function onSubmit(values: CheckoutFormValues) {
    // Manual validation for shipping address when delivering to different address
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

      {/* ── Fakturační údaje ─────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Fakturační údaje</h2>

        {/* Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Křestní jméno *</Label>
            <Input id="firstName" className="mt-1" {...form.register('firstName')} />
            <FieldError message={errors.firstName?.message} />
          </div>
          <div>
            <Label htmlFor="lastName">Příjmení *</Label>
            <Input id="lastName" className="mt-1" {...form.register('lastName')} />
            <FieldError message={errors.lastName?.message} />
          </div>
        </div>

        {/* Company */}
        <div>
          <Label htmlFor="company">Název firmy (volitelný)</Label>
          <Input id="company" className="mt-1" {...form.register('billingAddress.company')} />
          <p className="text-xs text-muted-foreground mt-1">Vyplňte IČO pro vyplnění</p>
        </div>

        {/* IČO + DIČ */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ico">IČO (volitelný)</Label>
            <Input id="ico" className="mt-1" placeholder="IČO" {...form.register('billingAddress.ico')} />
          </div>
          <div>
            <Label htmlFor="dic">DIČ (volitelný)</Label>
            <Input id="dic" className="mt-1" placeholder="DIČ" {...form.register('billingAddress.dic')} />
          </div>
        </div>

        {/* Country */}
        <div>
          <Label>Země / Region *</Label>
          <div className="mt-1">
            <CountryField />
          </div>
          <input type="hidden" {...form.register('billingAddress.country')} value="CZ" />
        </div>

        {/* Street */}
        <div>
          <Label htmlFor="street">Ulice a č.p. *</Label>
          <Input id="street" className="mt-1" {...form.register('billingAddress.street')} />
          <FieldError message={errors.billingAddress?.street?.message} />
        </div>

        {/* Street line 2 */}
        <Input
          placeholder="Číslo bytu, hotelového pokoje atd. (nepovinné)"
          {...form.register('billingAddress.streetLine2')}
        />

        {/* City + ZIP */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">Město *</Label>
            <Input id="city" className="mt-1" {...form.register('billingAddress.city')} />
            <FieldError message={errors.billingAddress?.city?.message} />
          </div>
          <div>
            <Label htmlFor="zip">PSČ *</Label>
            <Input id="zip" className="mt-1" placeholder="123 45" {...form.register('billingAddress.zip')} />
            <FieldError message={errors.billingAddress?.zip?.message} />
          </div>
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone">Telefon *</Label>
          <Input id="phone" type="tel" className="mt-1" {...form.register('phone')} />
          <FieldError message={errors.phone?.message} />
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">E-mailová adresa *</Label>
          <Input id="email" type="email" className="mt-1" {...form.register('email')} />
          <FieldError message={errors.email?.message} />
        </div>

        {/* For children + For bar */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Nakupuji pro děti? (volitelný)</Label>
            <select
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              {...form.register('forChildren')}
            >
              <option value="false">Ne</option>
              <option value="true">Ano</option>
            </select>
          </div>
          <div>
            <Label>Nakupuji pro bar? (volitelný)</Label>
            <select
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              {...form.register('forBar')}
            >
              <option value="false">Ne</option>
              <option value="true">Ano</option>
            </select>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Doručit na jinou adresu ───────────────────── */}
      <section className="space-y-4">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 accent-foreground"
            {...form.register('shipToDifferentAddress')}
          />
          <span className="text-lg font-semibold">Doručit na jinou adresu?</span>
        </label>

        {shipToDifferentAddress && (
          <div className="space-y-4 pt-2">
            {/* Company */}
            <div>
              <Label>Název firmy (volitelný)</Label>
              <Input className="mt-1" {...form.register('shippingAddress.company')} />
            </div>

            {/* Country */}
            <div>
              <Label>Země / Region *</Label>
              <div className="mt-1">
                <CountryField />
              </div>
              <input type="hidden" {...form.register('shippingAddress.country')} value="CZ" />
            </div>

            {/* Street */}
            <div>
              <Label>Ulice a č.p. *</Label>
              <Input className="mt-1" {...form.register('shippingAddress.street')} />
              <FieldError message={errors.shippingAddress?.street?.message} />
            </div>

            {/* Street line 2 */}
            <Input
              placeholder="Číslo bytu, hotelového pokoje atd. (nepovinné)"
              {...form.register('shippingAddress.streetLine2')}
            />

            {/* City + ZIP */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Město *</Label>
                <Input className="mt-1" {...form.register('shippingAddress.city')} />
                <FieldError message={errors.shippingAddress?.city?.message} />
              </div>
              <div>
                <Label>PSČ *</Label>
                <Input className="mt-1" placeholder="123 45" {...form.register('shippingAddress.zip')} />
                <FieldError message={errors.shippingAddress?.zip?.message} />
              </div>
            </div>
          </div>
        )}
      </section>

      <Separator />

      {/* ── Další informace ───────────────────────────── */}
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

      {/* ── Kupon ────────────────────────────────────── */}
      <section className="space-y-2">
        {appliedCoupon ? (
          <div className="flex items-center justify-between rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm">
            <div className="flex items-center gap-2 text-green-700">
              <Tag className="h-4 w-4" />
              <span className="font-medium">{appliedCoupon.code}</span>
              {appliedCoupon.discountType === 'percentage' ? (
                <span>−{appliedCoupon.discountValue}%</span>
              ) : (
                <span>−{formatPrice(appliedCoupon.discountValue)}</span>
              )}
            </div>
            <button
              type="button"
              onClick={removeCoupon}
              className="text-green-600 hover:text-green-800 ml-2"
              aria-label="Odebrat kupón"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={couponOpen}
                onChange={(e) => {
                  setCouponOpen(e.target.checked);
                  setCouponError(null);
                }}
                className="h-4 w-4 rounded border-gray-300 accent-foreground"
              />
              <span className="text-sm">Máte kupon? Klikněte zde a zadejte Váš kód</span>
            </label>
            {couponOpen && (
              <div className="space-y-2 pt-1">
                <div className="flex gap-2">
                  <Input
                    placeholder="Kód kupónu"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      setCouponError(null);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    className="text-sm h-9"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 shrink-0"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                  >
                    {couponLoading ? '...' : 'Použít'}
                  </Button>
                </div>
                {couponError && (
                  <p className="text-xs text-destructive">{couponError}</p>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      <Separator />

      {/* ── Souhrn objednávky ─────────────────────────── */}
      <section className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Mezisoučet</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && appliedCoupon && (
          <div className="flex justify-between text-green-600">
            <span>Sleva ({appliedCoupon.code})</span>
            <span>−{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Doprava</span>
          <span>{shipping === 0 ? 'Zdarma' : formatPrice(shipping)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-semibold text-base">
          <span>Celkem k úhradě</span>
          <span>{formatPrice(total)}</span>
        </div>
      </section>

      <Separator />

      {/* ── Způsob platby ─────────────────────────────── */}
      <section className="space-y-3">
        {PAYMENT_METHODS.map((method) => (
          <label
            key={method.id}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
              paymentMethod === method.id ? 'border-foreground bg-muted/40' : 'border-border'
            }`}
          >
            <input
              type="radio"
              value={method.id}
              className="h-4 w-4 accent-foreground"
              {...form.register('paymentMethod')}
            />
            <span className="text-sm font-medium">{method.label}</span>
          </label>
        ))}
      </section>

      {/* ── Ochrana osobních údajů ────────────────────── */}
      <p className="text-xs text-muted-foreground">
        Vaše osobní údaje budou použity k vyřízení Vaší objednávky, zvýšení spokojenosti po celou
        dobu procházení tohoto webu a k dalším účelům popsaným na stránce{' '}
        <a href="/ochrana-osobnich-udaju" className="underline hover:text-foreground">
          ochrana osobních údajů
        </a>
        .
      </p>

      {/* ── Souhlas s podmínkami ──────────────────────── */}
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
