import type { Product, ProductInfoBox } from '@/types/product';
import { ProductCard } from '@/components/shop/ProductCard';
import { INFO_BOX_COLORS } from '@/lib/constants';

/**
 * Returns true if the background color is dark (text should be white).
 * Accepts hex colors like #RRGGBB or #RGB.
 */
function isDarkBackground(hex: string): boolean {
  const cleaned = hex.replace('#', '');
  const full = cleaned.length === 3
    ? cleaned.split('').map((c) => c + c).join('')
    : cleaned;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  // Relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.55;
}

const FALLBACK_COLORS = ['#F08080', '#A8D5A2', '#F08080', '#C8D84E'];

function InfoBox({ box, index }: { box: ProductInfoBox; index: number }) {
  const bg = box.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
  const textColor = isDarkBackground(bg) ? '#FFFFFF' : '#1a1a1a';
  const lines = box.content.split('\n').filter(Boolean);

  return (
    <div className="rounded-2xl p-6 break-inside-avoid" style={{ backgroundColor: bg }}>
      <h3 className="font-bold text-3xl mb-3" style={{ color: textColor }}>
        {box.title}
      </h3>
      <ul className="space-y-1">
        {lines.map((line, i) => (
          <li key={i} className="text-lg flex gap-2" style={{ color: textColor }}>
            <span>•</span>
            <span>{line.replace(/^[-•]\s*/, '')}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ProductInfoSectionsProps {
  product: Product;
}

export function ProductInfoSections({ product }: ProductInfoSectionsProps) {
  const hasBoxes = product.infoBoxes && product.infoBoxes.length > 0;
  const hasFooter = product.ingredients || product.countryOfOrigin || product.madeIn;
  const hasRelated = product.relatedProducts && product.relatedProducts.length > 0;

  if (!hasBoxes && !hasFooter && !hasRelated) return null;

  return (
    <div className="mt-25 space-y-10">
      {hasBoxes && (
        <div className="columns-1 sm:columns-2 gap-4 space-y-4">
          {product.infoBoxes!.map((box, i) => (
            <InfoBox key={box.id} box={box} index={i} />
          ))}
        </div>
      )}

      {hasFooter && (
        <div className="text-center text-sm text-muted-foreground space-y-1">
          {product.ingredients && (
            <p>Složení: {product.ingredients}</p>
          )}
          {(product.countryOfOrigin || product.madeIn) && (
            <p>
              {product.countryOfOrigin && `Země původu: ${product.countryOfOrigin}`}
              {product.countryOfOrigin && product.madeIn && '  '}
              {product.madeIn && `Vyrobeno: ${product.madeIn}`}
            </p>
          )}
        </div>
      )}

      {hasRelated && (
        <div className={'my-25'}>
          <h2 className="text-5xl font-bold text-center mb-6">Související produkty</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.relatedProducts!.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
