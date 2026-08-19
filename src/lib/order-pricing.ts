import { getProductPricing, validateCoupon } from './strapi';
import { calculateShipping } from './shipping';
import { FREE_SHIPPING_THRESHOLD } from './constants';
import type { CartLineIssue, CartLineRef } from './cart-validation';
import type { CreateOrderPayload, OrderItem } from '@/types/order';

/**
 * Thrown when an order cannot be priced (product gone, variant gone, variant
 * sold out, coupon invalid). Carries an HTTP status so the API route can
 * surface a clean message to the client.
 */
export class OrderPricingError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'OrderPricingError';
    this.status = status;
  }
}

export interface AuthoritativeOrder {
  items: Omit<OrderItem, 'id'>[];
  subtotal: number;
  shippingCost: number;
  totalWeight: number;
  discountAmount: number;
  couponCode?: string;
  total: number;
}

export type ResolvedCartLine =
  | {
      ok: true;
      productName: string;
      productSlug: string;
      unitPrice: number;
      variantName?: string;
      variantVolume?: string;
    }
  | {
      ok: false;
      issue: CartLineIssue;
      productName: string;
      productSlug: string;
      variantName?: string;
      variantVolume?: string;
    };

/**
 * Resolve cart lines against authoritative Strapi data: the product and variant
 * must still exist, the variant must still be in stock, and the price comes
 * from Strapi rather than the request.
 *
 * The cart lives in localStorage with no expiry, so a line can reference
 * something that was switched off days after it was added — this is the only
 * place that catches it.
 */
export async function resolveCartLines(lines: CartLineRef[]): Promise<ResolvedCartLine[]> {
  // Fetch each referenced product once, by slug, in parallel.
  const slugs = [...new Set(lines.map((l) => l.productSlug))];
  const fetched = await Promise.all(slugs.map((slug) => getProductPricing(slug)));
  const productBySlug = new Map(slugs.map((slug, idx) => [slug, fetched[idx]]));

  return lines.map((line): ResolvedCartLine => {
    const product = productBySlug.get(line.productSlug);
    if (!product) {
      return {
        ok: false,
        issue: 'product-missing',
        productName: line.productName ?? line.productSlug,
        productSlug: line.productSlug,
        variantName: line.variantName,
        variantVolume: line.variantVolume,
      };
    }

    // Lines without a variant reference just take the base product price;
    // stock is tracked per variant only.
    if (!line.variantName && !line.variantVolume) {
      return {
        ok: true,
        productName: product.name,
        productSlug: product.slug,
        unitPrice: product.price,
      };
    }

    // Match by volume first (stable), then name. Variant price overrides base.
    const variant = product.variants?.find(
      (v) =>
        (line.variantVolume != null && v.volume === line.variantVolume) ||
        (line.variantName != null && v.name === line.variantName)
    );
    if (!variant) {
      return {
        ok: false,
        issue: 'variant-missing',
        productName: product.name,
        productSlug: product.slug,
        variantName: line.variantName,
        variantVolume: line.variantVolume,
      };
    }

    // `inStock` defaults to true and older rows have it stored as null, so only
    // an explicit `false` means the variant was switched off in Strapi.
    if (variant.inStock === false) {
      return {
        ok: false,
        issue: 'out-of-stock',
        productName: product.name,
        productSlug: product.slug,
        variantName: variant.name,
        variantVolume: variant.volume,
      };
    }

    return {
      ok: true,
      productName: product.name,
      productSlug: product.slug,
      unitPrice: variant.price ?? product.price,
      variantName: variant.name,
      variantVolume: variant.volume,
    };
  });
}

/** Customer-facing Czech message for a line that cannot be ordered. */
export function cartLineIssueMessage(line: Extract<ResolvedCartLine, { ok: false }>): string {
  const label = line.variantName
    ? `${line.productName} – ${line.variantName}`
    : line.productName;

  switch (line.issue) {
    case 'out-of-stock':
      return `Produkt „${label}“ je momentálně vyprodaný.`;
    case 'variant-missing':
      return `Varianta produktu „${label}“ již není dostupná.`;
    default:
      return `Produkt „${label}“ již není dostupný.`;
  }
}

/**
 * Recompute every monetary value of an order on the server from authoritative
 * Strapi data. The client payload is treated as untrusted: prices, shipping,
 * discount and total are all derived here, never read from the request body.
 *
 * Throws {@link OrderPricingError} when the cart references something that no
 * longer exists, is sold out, or a coupon that is no longer valid.
 */
export async function computeAuthoritativeOrder(
  payload: Pick<CreateOrderPayload, 'items' | 'couponCode'>
): Promise<AuthoritativeOrder> {
  if (!payload.items?.length) {
    throw new OrderPricingError('Košík je prázdný.');
  }

  const resolved = await resolveCartLines(
    payload.items.map((i) => ({
      productSlug: i.productSlug,
      productName: i.productName,
      variantName: i.variantName,
      variantVolume: i.variantVolume,
    }))
  );

  // Rebuild each line item from server-side prices.
  const items: Omit<OrderItem, 'id'>[] = payload.items.map((item, idx) => {
    const line = resolved[idx];
    if (!line.ok) {
      throw new OrderPricingError(cartLineIssueMessage(line));
    }

    const quantity = Math.max(1, Math.floor(item.quantity));

    return {
      productName: line.productName,
      productSlug: line.productSlug,
      productCategorySlug: item.productCategorySlug,
      unitPrice: line.unitPrice,
      quantity,
      totalPrice: line.unitPrice * quantity,
      thumbnail: item.thumbnail,
      variantName: line.variantName,
      variantVolume: line.variantVolume,
    };
  });

  const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);

  // Shipping derived from real weight (variant volumes), never from the client.
  const shippingCalc = calculateShipping(
    items.map((i) => ({ quantity: i.quantity, variant: { volume: i.variantVolume } }))
  );

  // Re-validate the coupon against the authoritative subtotal and recompute the
  // discount with the same rules as the cart store.
  let discountAmount = 0;
  let couponCode: string | undefined;
  if (payload.couponCode) {
    let coupon;
    try {
      coupon = await validateCoupon(payload.couponCode, subtotal);
    } catch {
      throw new OrderPricingError('Slevový kupón již není platný. Obnovte prosím košík.');
    }
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }
    couponCode = coupon.code;
  }

  const isFreeShipping = subtotal - discountAmount >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = isFreeShipping ? 0 : shippingCalc.priceWithVat;

  const total = Math.max(0, subtotal - discountAmount + shippingCost);

  return {
    items,
    subtotal,
    shippingCost,
    totalWeight: shippingCalc.totalWeightKg,
    discountAmount,
    couponCode,
    total,
  };
}
