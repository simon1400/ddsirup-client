'use client';

import { ShoppingBag, Building2, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const steps = [
  { label: 'E-SHOP', href: '/produkty', icon: ShoppingBag },
  { label: 'KOŠÍK', href: '/kosik', icon: Building2 },
  { label: 'POKLADNA', href: '/pokladna', icon: CreditCard },
] as const;

interface CheckoutStepperProps {
  /** 0 = E-SHOP, 1 = KOŠÍK, 2 = POKLADNA */
  activeStep: number;
}

export function CheckoutStepper({ activeStep }: CheckoutStepperProps) {
  return (
    <div className="bg-green-soft rounded-3xl px-6 py-8 mb-10">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === activeStep;
          const isPast = i < activeStep;

          return (
            <div key={step.label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <Link
                  href={step.href}
                  className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center transition-all',
                    isActive
                      ? 'bg-white text-green-text scale-115 shadow-md'
                      : isPast
                        ? 'bg-white/60 text-green-text'
                        : 'bg-white/40 text-green-text/60'
                  )}
                >
                  <Icon className={cn('w-6 h-6', isActive && 'w-7 h-7')} />
                </Link>
                <span
                  className={cn(
                    'text-xs font-bold tracking-wide',
                    isActive ? 'text-green-text' : 'text-green-text/60'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {i < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-3 mt-[-1.5rem]',
                    i < activeStep ? 'bg-white/80' : 'bg-white/40'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
