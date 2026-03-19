import {
  BOTTLE_WEIGHTS,
  DEFAULT_BOTTLE_WEIGHT,
  MESSENGER_PACKAGE_MAX_KG,
  MESSENGER_PRICE_TABLE,
  PACKAGING_WEIGHT_KG,
  SHIPPING_VAT_RATE,
} from './constants';

/**
 * Parse a variant volume string (e.g. "1000ml", "500ml", "1l", "0.5l")
 * and return the volume in liters.
 */
export function parseVolumeLiters(volume?: string): number {
  if (!volume) return 1;
  const cleaned = volume.trim().toLowerCase();

  const mlMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*ml$/);
  if (mlMatch) return parseFloat(mlMatch[1]) / 1000;

  const literMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*l$/);
  if (literMatch) return parseFloat(literMatch[1]);

  return 1; // fallback
}

/**
 * Get the weight (kg) of a single bottle based on its volume string.
 */
export function getBottleWeight(volume?: string): number {
  const liters = parseVolumeLiters(volume);
  return BOTTLE_WEIGHTS[liters] ?? DEFAULT_BOTTLE_WEIGHT;
}

export interface CartItemForShipping {
  quantity: number;
  variant?: { volume?: string };
}

export interface ShippingCalculation {
  totalWeightKg: number;
  packageCount: number;
  priceWithoutVat: number;
  priceWithVat: number;
}

/**
 * Calculate Messenger shipping cost based on total weight of cart items.
 * Pricing = MESSENGER_PRICE_TABLE[packageCount] + 12% DPH.
 */
export function calculateShipping(items: CartItemForShipping[]): ShippingCalculation {
  if (items.length === 0) {
    return { totalWeightKg: 0, packageCount: 0, priceWithoutVat: 0, priceWithVat: 0 };
  }

  const totalWeightKg = items.reduce((sum, item) => {
    return sum + getBottleWeight(item.variant?.volume) * item.quantity;
  }, 0);

  const packageCount = Math.max(1, Math.ceil(totalWeightKg / MESSENGER_PACKAGE_MAX_KG));
  const maxPackages = MESSENGER_PRICE_TABLE.length - 1;
  const clampedPackages = Math.min(packageCount, maxPackages);

  // Add packaging material weight per package
  const totalWeightWithPackaging = totalWeightKg + packageCount * PACKAGING_WEIGHT_KG;

  const priceWithoutVat = MESSENGER_PRICE_TABLE[clampedPackages];
  const priceWithVat = Math.round(priceWithoutVat * (1 + SHIPPING_VAT_RATE));

  return { totalWeightKg: totalWeightWithPackaging, packageCount, priceWithoutVat, priceWithVat };
}
