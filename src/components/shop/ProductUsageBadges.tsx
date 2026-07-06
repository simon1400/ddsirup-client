import type { ProductUsage } from '@/types/product';

interface ProductUsageBadgesProps {
  usages?: ProductUsage[];
}

/**
 * "Vhodné pro" — product usage line (e.g. "Limonády, Koktejly").
 * Eyebrow above the product title. Names rendered as plain coral text (no pill).
 * Data comes from the `product-usage` collection (manyToMany on Product).
 */
export function ProductUsageBadges({ usages }: ProductUsageBadgesProps) {
  if (!usages || usages.length === 0) return null;

  return (
    <p className="text-sm md:text-base font-semibold uppercase tracking-wider text-coral">
      {usages.map((u) => u.name).join(', ')}
    </p>
  );
}
