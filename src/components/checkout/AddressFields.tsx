'use client';

import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError, CountryField } from './checkout.helpers';
import { AddressSuggest } from './AddressSuggest';
import type { CheckoutFormValues } from './checkout.schema';

type AddressPrefix = 'billingAddress' | 'shippingAddress';

interface AddressFieldsProps {
  prefix: AddressPrefix;
  form: UseFormReturn<CheckoutFormValues>;
}

export function AddressFields({ prefix, form }: AddressFieldsProps) {
  const errors =
    prefix === 'billingAddress'
      ? form.formState.errors.billingAddress
      : form.formState.errors.shippingAddress;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reg = (field: string) => form.register(`${prefix}.${field}` as any);

  return (
    <>
      <div>
        <Label>Země / Region *</Label>
        <div className="mt-1">
          <CountryField />
        </div>
        <input type="hidden" {...reg('country')} value="CZ" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Ulice a č.p. *</Label>
          <AddressSuggest prefix={prefix} form={form} className="mt-1" />
          <FieldError message={errors?.street?.message} />
        </div>
        <div>
          <Label>Číslo bytu, pokoje atd.</Label>
          <Input className="mt-1" {...reg('streetLine2')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Město *</Label>
          <Input className="mt-1" {...reg('city')} />
          <FieldError message={errors?.city?.message} />
        </div>
        <div>
          <Label>PSČ *</Label>
          <Input className="mt-1" placeholder="123 45" {...reg('zip')} />
          <FieldError message={errors?.zip?.message} />
        </div>
      </div>
    </>
  );
}
