'use client';

import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AddressFields } from './AddressFields';
import { AnimatedCollapse } from '@/components/ui/AnimatedCollapse';
import type { CheckoutFormValues } from './checkout.schema';

interface ShippingSectionProps {
  form: UseFormReturn<CheckoutFormValues>;
  shipToDifferentAddress: boolean;
}

export function ShippingSection({ form, shipToDifferentAddress }: ShippingSectionProps) {
  return (
    <section className="space-y-4">
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 accent-foreground"
          {...form.register('shipToDifferentAddress')}
        />
        <span className="text-lg font-semibold">Doručit na jinou adresu?</span>
      </label>

      <AnimatedCollapse open={shipToDifferentAddress}>
        <div className="space-y-4 pt-2">
          <div>
            <Label>Název firmy (volitelný)</Label>
            <Input className="mt-1" {...form.register('shippingAddress.company')} />
          </div>
          <AddressFields prefix="shippingAddress" form={form} />
        </div>
      </AnimatedCollapse>
    </section>
  );
}
