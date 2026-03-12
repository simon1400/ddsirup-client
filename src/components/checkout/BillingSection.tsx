'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError, inputError } from './checkout.helpers';
import { AddressFields } from './AddressFields';
import { AnimatedCollapse } from '@/components/ui/AnimatedCollapse';
import type { CheckoutFormValues } from './checkout.schema';

const SELECT_CLASS =
  'mt-1 flex h-10 w-full rounded-full border border-input bg-background px-4 py-1 text-sm';

interface BillingSectionProps {
  form: UseFormReturn<CheckoutFormValues>;
}

export function BillingSection({ form }: BillingSectionProps) {
  const errors = form.formState.errors;
  const isCompany = form.watch('isCompany');

  const [aresLoading, setAresLoading] = useState(false);
  const [aresError, setAresError] = useState<string | null>(null);
  const icoValue = form.watch('billingAddress.ico');
  const isValidIco = /^\d{8}$/.test((icoValue ?? '').trim());

  async function handleIcoLookup(ico: string) {
    const trimmed = ico.trim();
    if (!/^\d{8}$/.test(trimmed)) {
      setAresError(null);
      return;
    }

    setAresLoading(true);
    setAresError(null);

    try {
      const res = await fetch(`/api/ares?ico=${trimmed}`);
      if (!res.ok) {
        const data = await res.json();
        setAresError(data.error || 'Chyba při vyhledávání v ARES');
        return;
      }

      const data = await res.json();

      // Fill company name
      if (data.obchodniJmeno) {
        form.setValue('billingAddress.company', data.obchodniJmeno, { shouldValidate: true });
      }

      // Fill DIČ
      if (data.dic) {
        form.setValue('billingAddress.dic', data.dic, { shouldValidate: true });
      }

      // Fill address from sidlo (registered office)
      const sidlo = data.sidlo;
      if (sidlo) {
        // Build street: "nazevUlice cisloOrientacni/cisloDomovni" or just the available parts
        const streetParts: string[] = [];
        if (sidlo.nazevUlice) {
          streetParts.push(sidlo.nazevUlice);
        } else if (sidlo.nazevObce) {
          streetParts.push(sidlo.nazevObce);
        }
        const orientacni = sidlo.cisloOrientacni
          ? `${sidlo.cisloOrientacni}${sidlo.cisloOrientacniPismeno || ''}`
          : null;
        const houseNum = [sidlo.cisloDomovni, orientacni].filter(Boolean).join('/');
        if (houseNum) streetParts.push(houseNum);

        if (streetParts.length > 0) {
          form.setValue('billingAddress.street', streetParts.join(' '), { shouldValidate: true });
        }

        if (sidlo.nazevObce) {
          form.setValue('billingAddress.city', sidlo.nazevObce, { shouldValidate: true });
        }

        if (sidlo.psc) {
          const psc = String(sidlo.psc);
          const formatted = psc.length === 5 ? `${psc.slice(0, 3)} ${psc.slice(3)}` : psc;
          form.setValue('billingAddress.zip', formatted, { shouldValidate: true });
        }
      }
    } catch {
      setAresError('Nepodařilo se spojit s ARES');
    } finally {
      setAresLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Fakturační údaje</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">Křestní jméno *</Label>
          <Input id="firstName" className={`mt-1 ${inputError(errors.firstName?.message)}`} {...form.register('firstName')} />
          <FieldError message={errors.firstName?.message} />
        </div>
        <div>
          <Label htmlFor="lastName">Příjmení *</Label>
          <Input id="lastName" className={`mt-1 ${inputError(errors.lastName?.message)}`} {...form.register('lastName')} />
          <FieldError message={errors.lastName?.message} />
        </div>
      </div>

      <AddressFields prefix="billingAddress" form={form} />

      <div>
        <Label htmlFor="phone">Telefon *</Label>
        <Input id="phone" type="tel" className={`mt-1 ${inputError(errors.phone?.message)}`} {...form.register('phone')} />
        <FieldError message={errors.phone?.message} />
      </div>

      <div>
        <Label htmlFor="email">E-mailová adresa *</Label>
        <Input id="email" type="email" className={`mt-1 ${inputError(errors.email?.message)}`} {...form.register('email')} />
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

      {/* Company toggle */}
      <label className="flex cursor-pointer items-center gap-3 pt-2">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 accent-foreground"
          {...form.register('isCompany')}
        />
        <span className="text-lg font-semibold">Nakupuji na firmu</span>
      </label>

      <AnimatedCollapse open={isCompany}>
        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="company">Název firmy *</Label>
            <Input id="company" className={`mt-1 ${inputError(errors.billingAddress?.company?.message)}`} {...form.register('billingAddress.company')} />
            <FieldError message={errors.billingAddress?.company?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ico">IČO *</Label>
              <div className="relative mt-1">
                <Input
                  id="ico"
                  placeholder="12345678"
                  className={`pr-24 ${inputError(errors.billingAddress?.ico?.message) || (aresError ? 'border-destructive' : '')}`}
                  {...form.register('billingAddress.ico')}
                />
                <button
                  type="button"
                  disabled={!isValidIco || aresLoading}
                  onClick={() => handleIcoLookup(icoValue ?? '')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors bg-coral text-white hover:bg-coral/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                >
                  {aresLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Search className="h-4 w-3.5" />
                  )}
                  <span className={'inline-block mt-1'}>Najít</span>
                </button>
              </div>
              <FieldError message={errors.billingAddress?.ico?.message} />
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
        </div>
      </AnimatedCollapse>
    </section>
  );
}
