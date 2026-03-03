'use client';

import Image from 'next/image';
import { UseFormReturn } from 'react-hook-form';
import { PAYMENT_METHODS, type CheckoutFormValues } from './checkout.schema';

interface PaymentSectionProps {
  form: UseFormReturn<CheckoutFormValues>;
  currentMethod: string;
}

const PAYMENT_ICONS: Record<string, string> = {
  ALL: '/UniAgmoLogo.png',
  CARD_ALL: '/UniAgmoCardAllLogo.png',
  GPAY: '/UniAgmoGooglePayLogo.png',
  BANK_ALL: '/UniAgmoBankAllLogo.png',
};

export function PaymentSection({ form, currentMethod }: PaymentSectionProps) {
  return (
    <section className="space-y-3">
      {PAYMENT_METHODS.map((method) => {
        const icon = PAYMENT_ICONS[method.id];
        return (
          <label
            key={method.id}
            className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors ${
              currentMethod === method.id ? 'border-foreground bg-muted/40' : 'border-border'
            }`}
          >
            <input
              type="radio"
              value={method.id}
              className="h-4 w-4 accent-foreground"
              {...form.register('paymentMethod')}
            />
            <span className="text-sm font-medium flex-1">{method.label}</span>
            {icon && (
              <Image
                src={icon}
                alt={method.label}
                width={60}
                height={30}
                className="object-contain h-7 w-auto"
              />
            )}
          </label>
        );
      })}
    </section>
  );
}
