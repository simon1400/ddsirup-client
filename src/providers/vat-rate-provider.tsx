'use client';

import { createContext, useContext } from 'react';

const VatRateContext = createContext<number>(12);

export function VatRateProvider({
  vatRate,
  children,
}: {
  vatRate: number;
  children: React.ReactNode;
}) {
  return (
    <VatRateContext.Provider value={vatRate}>
      {children}
    </VatRateContext.Provider>
  );
}

export function useVatRate(): number {
  return useContext(VatRateContext);
}
