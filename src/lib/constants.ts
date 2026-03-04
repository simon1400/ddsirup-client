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
