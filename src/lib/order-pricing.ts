import { getProductPricing, validateCoupon } from './strapi';
import { calculateShipping } from './shipping';
import { FREE_SHIPPING_THRESHOLD } from './constants';
import type { CreateOrderPayload, OrderItem } from '@/types/order';

/**
 * Thrown when an order cannot be priced (product gone, variant gone, coupon invalid).
 * Carries an HTTP status so the API route can surface a clean message to the client.
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

/**
 * Recompute every monetary value of an order on the server from authoritative
 * Strapi data. The client payload is treated as untrusted: prices, shipping,
 * discount and total are all derived here, never read from the request body.
 *
 * Throws {@link OrderPricingError} when the cart references something that no
 * longer exists or a coupon that is no longer valid.
 */
export async function computeAuthoritativeOrder(
  payload: Pick<CreateOrderPayload, 'items' | 'couponCode'>
): Promise<AuthoritativeOrder> {
  if (!payload.items?.length) {
    throw new OrderPricingError('Košík je prázdný.');
  }

  // Fetch each referenced product once, by slug, in parallel.
  const slugs = [...new Set(payload.items.map((i) => i.productSlug))];
  const fetched = await Promise.all(slugs.map((slug) => getProductPricing(slug)));
  const productBySlug = new Map(slugs.map((slug, idx) => [slug, fetched[idx]]));

  // Rebuild each line item from server-side prices.
  const items: Omit<OrderItem, 'id'>[] = payload.items.map((item) => {
    const product = productBySlug.get(item.productSlug);
    if (!product) {
      throw new OrderPricingError(`Produkt „${item.productName}" již není dostupný.`);
    }

    let unitPrice = product.price;
    let variantName = item.variantName;
    let variantVolume = item.variantVolume;

    // If the cart line referenced a variant, it must still exist; match by
    // volume first (stable), then name. Variant price overrides base price.
    if (item.variantName || item.variantVolume) {
      const variant = product.variants?.find(
        (v) =>
          (item.variantVolume != null && v.volume === item.variantVolume) ||
          (item.variantName != null && v.name === item.variantName)
      );
      if (!variant) {
        throw new OrderPricingError(
          `Varianta produktu „${item.productName}" již není dostupná.`
        );
      }
      unitPrice = variant.price ?? product.price;
      variantName = variant.name;
      variantVolume = variant.volume;
    }

    const quantity = Math.max(1, Math.floor(item.quantity));

    return {
      productName: product.name,
      productSlug: product.slug,
      productCategorySlug: item.productCategorySlug,
      unitPrice,
      quantity,
      totalPrice: unitPrice * quantity,
      thumbnail: item.thumbnail,
      variantName,
      variantVolume,
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
