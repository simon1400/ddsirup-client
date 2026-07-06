import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Product } from '@/types/product';
import { STRAPI_URL } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Build product URL: /{categorySlug}/{productSlug} with fallback */
export function getProductUrl(productSlug: string, categorySlug?: string): string {
  return categorySlug ? `/${categorySlug}/${productSlug}` : `/produkty/${productSlug}`;
}

/** Highest badge sortPriority across a product's badges (0 if none). Higher sorts earlier. */
export function getProductBadgePriority(product: Pick<Product, 'badges'>): number {
  return (product.badges ?? []).reduce((max, b) => Math.max(max, b.sortPriority ?? 0), 0);
}

/** Compact volume label in liters, Czech notation: "1000ml" → "1 l", "500ml" → "0,5 l".
 *  Returns the original string if it can't be parsed. */
export function formatVolumeShort(volume?: string): string | undefined {
  if (!volume) return undefined;
  const cleaned = volume.trim().toLowerCase();
  const ml = cleaned.match(/^(\d+(?:[.,]\d+)?)\s*ml$/);
  const l = cleaned.match(/^(\d+(?:[.,]\d+)?)\s*l$/);

  let liters: number | null = null;
  if (ml) liters = parseFloat(ml[1].replace(',', '.')) / 1000;
  else if (l) liters = parseFloat(l[1].replace(',', '.'));
  if (liters === null || !Number.isFinite(liters)) return volume.trim();

  const num = liters.toFixed(3).replace(/\.?0+$/, '').replace('.', ',');
  return `${num} l`;
}

export function formatPrice(amount: number, currency = 'CZK'): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Calculate price without VAT (prices are stored with VAT included). vatRate in % (e.g. 12) */
export function priceWithoutVat(amount: number, vatRate: number): number {
  return Math.round(amount / (1 + vatRate / 100));
}

/** Format price without VAT. vatRate in % (e.g. 12) */
export function formatPriceWithoutVat(amount: number, vatRate: number, currency = 'CZK'): string {
  return formatPrice(priceWithoutVat(amount, vatRate), currency);
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
    case 'ALL':
      return 'Online platba';
    default:
      return method ?? 'Comgate';
  }
}

/** Format price with exactly 2 decimal places (for invoices/emails). */
export function formatPriceFixed(amount: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' Kč';
}

/** Format a date string as "D. M. YYYY". */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
}

/** Shipping label for Messenger with price. */
export function getShippingLabel(cost: number): string {
  return `Messenger (${formatPriceFixed(cost)})`;
}

export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `ORD-${year}-${random}`;
}
