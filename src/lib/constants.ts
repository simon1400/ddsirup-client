export const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ddsirup.cz';

/** Fallback colors for parent categories (by index) when category.color is not set */
export const CATEGORY_COLORS = ['var(--color-category-yellow)', 'var(--color-coral)'] as const;

/** Color scheme for product info boxes (cycles) */
export const INFO_BOX_COLORS = [
  { bg: 'var(--color-coral)',      text: 'var(--color-coral-text)' },
  { bg: 'var(--color-green-soft)', text: 'var(--color-green-text)' },
  { bg: 'var(--color-coral)',      text: 'var(--color-coral-text)' },
  { bg: 'var(--color-lime)',       text: 'var(--color-lime-text)'  },
] as const;

/** Color scheme for homepage feature blocks (alternating, 2-cycle) */
export const FEATURE_BLOCK_COLORS = [
  { bg: 'var(--color-coral)',      title: '#FFFFFF', text: '#FFFFFF', button: '#7A2020' },
  { bg: 'var(--color-green-soft)', title: '#2A4A20', text: '#2A4A20', button: '#2D4A2A' },
] as const;

// ── Shipping (Messenger) ────────────────────────────────────────────────

/** Weight in kg per bottle volume (liters) */
export const BOTTLE_WEIGHTS: Record<number, number> = {
  1: 1.55,    // 1L bottle
  0.5: 0.830, // 0.5L bottle
};
export const DEFAULT_BOTTLE_WEIGHT = 1.55;

/** Max weight per Messenger package in kg */
export const MESSENGER_PACKAGE_MAX_KG = 10;

/** Max bottles per Messenger package (7+ bottles = 2 packages) */
export const BOTTLES_PER_PACKAGE = 6;

/** Weight of packaging material per package in kg (included in bottle weights) */
export const PACKAGING_WEIGHT_KG = 0;

/** Shipping price table per number of packages (bez DPH). Index = package count. */
export const MESSENGER_PRICE_TABLE = [
  0,     // 0 — placeholder
  145,   // 1 zásilka
  220,   // 2
  295,   // 3
  370,   // 4
  445,   // 5
  520,   // 6
  595,   // 7
  670,   // 8
  745,   // 9
  820,   // 10
  895,   // 11
  970,   // 12
  1045,  // 13
  1120,  // 14
  1195,  // 15
  1270,  // 16
  1345,  // 17
  1420,  // 18
  1495,  // 19
  1570,  // 20
] as const;

/** Shipping VAT rate — same as products (vedlejší plnění) */
export const SHIPPING_VAT_RATE = 0.12;
