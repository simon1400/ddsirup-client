import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { STRAPI_URL } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = 'CZK'): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Resolves a Strapi media path to a full URL. Returns null if path is falsy. */
export function getStrapiImageUrl(path?: string | null): string | null {
  if (!path) return null;
  return path.startsWith('http') ? path : `${STRAPI_URL}${path}`;
}

export function getPaymentLabel(method?: string): string {
  switch (method) {
    case 'CARD_ALL':
      return 'Platební karta';
    case 'BANK_ALL':
      return 'Bankovní převod';
    case 'GPAY':
      return 'Google Pay';
    case 'TEST':
      return 'Testovací platba';
    case 'ALL':
    default:
      return method ?? 'Comgate';
  }
}

export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `ORD-${year}-${random}`;
}
