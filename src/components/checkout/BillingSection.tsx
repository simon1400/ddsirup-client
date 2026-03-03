'use client';

import { UseFormReturn } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError } from './checkout.helpers';
import { AddressFields } from './AddressFields';
import type { CheckoutFormValues } from './checkout.schema';

const SELECT_CLASS =
  'mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm';

interface BillingSectionProps {
  form: UseFormReturn<CheckoutFormValues>;
}

export function BillingSection({ form }: BillingSectionProps) {
  const errors = form.formState.errors;

  // TODO: enable ARES lookup when ready
  const aresLoading = false;
  const aresError = null as string | null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function handleIcoLookup(_ico: string) { /* stub */ }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Fakturační údaje</h2>

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

      <div>
        <Label htmlFor="company">Název firmy (volitelný)</Label>
        <Input id="company" className="mt-1" {...form.register('billingAddress.company')} />
        <p className="text-xs text-muted-foreground mt-1">Zadejte IČO pro automatické vyplnění</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ico">IČO (volitelný)</Label>
          <div className="relative mt-1">
            <Input
              id="ico"
              placeholder="12345678"
              className={aresError ? 'border-destructive pr-8' : 'pr-8'}
              {...form.register('billingAddress.ico')}
              onBlur={(e) => {
                form.register('billingAddress.ico').onBlur(e);
                handleIcoLookup(e.target.value);
              }}
            />
            {aresLoading && (
              <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          {aresError && <p className="text-xs text-destructive mt-1">{aresError}</p>}
        </div>
        <div>
          <Label htmlFor="dic">DIČ (volitelný)</Label>
          <Input
            id="dic"
            className="mt-1"
            placeholder="CZ12345678"
            {...form.register('billingAddress.dic')}
          />
        </div>
      </div>

      <AddressFields prefix="billingAddress" form={form} />

      <div>
        <Label htmlFor="phone">Telefon *</Label>
        <Input id="phone" type="tel" className="mt-1" {...form.register('phone')} />
        <FieldError message={errors.phone?.message} />
      </div>

      <div>
        <Label htmlFor="email">E-mailová adresa *</Label>
        <Input id="email" type="email" className="mt-1" {...form.register('email')} />
        <FieldError message={errors.email?.message} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nakupuji pro děti? (volitelný)</Label>
          <select className={SELECT_CLASS} {...form.register('forChildren')}>
            <option value="false">Ne</option>
            <option value="true">Ano</option>
          </select>
        </div>
        <div>
          <Label>Nakupuji pro bar? (volitelný)</Label>
          <select className={SELECT_CLASS} {...form.register('forBar')}>
            <option value="false">Ne</option>
            <option value="true">Ano</option>
          </select>
        </div>
      </div>
    </section>
  );
}
