import type { CartItem } from '@/types/cart';

/**
 * Shared vocabulary for cart availability checks. Lives outside `order-pricing`
 * (which pulls in server-only Strapi helpers) so the browser can import the
 * types and the key builder without dragging the server code along.
 */

export type CartLineIssue = 'product-missing' | 'variant-missing' | 'out-of-stock';

/** Identifies one cart line by what survives in localStorage: slug + variant. */
export interface CartLineRef {
  productSlug: string;
  productName?: string;
  variantName?: string;
  variantVolume?: string;
}

export interface CartLineStatus {
  key: string;
  available: boolean;
  issue?: CartLineIssue;
  /** Ready-made Czech message for the customer; only set when unavailable. */
  message?: string;
  /** Authoritative unit price; only set when available. */
  unitPrice?: number;
  productName?: string;
}

export interface CartValidationResponse {
  items: CartLineStatus[];
}

/**
 * Stable identity of a cart line across client and server. Cart item ids are
 * built from Strapi numeric ids, which the checkout payload never carries, so
 * both sides key on slug + variant instead.
 */
export function cartLineKey(ref: CartLineRef): string {
  return [ref.productSlug, ref.variantVolume ?? '', ref.variantName ?? ''].join('|');
}

export function cartItemRef(item: CartItem): CartLineRef {
  return {
    productSlug: item.slug,
    productName: item.name,
    variantName: item.variant?.name,
    variantVolume: item.variant?.volume,
  };
}
