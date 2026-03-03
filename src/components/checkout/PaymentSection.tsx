'use client';

import { UseFormReturn } from 'react-hook-form';
import { PAYMENT_METHODS, type CheckoutFormValues } from './checkout.schema';

interface PaymentSectionProps {
  form: UseFormReturn<CheckoutFormValues>;
  currentMethod: string;
}

export function PaymentSection({ form, currentMethod }: PaymentSectionProps) {
  return (
    <section className="space-y-3">
      {PAYMENT_METHODS.map((method) => (
        <label
          key={method.id}
          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
            currentMethod === method.id ? 'border-foreground bg-muted/40' : 'border-border'
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
  );
}
