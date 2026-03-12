import Image from 'next/image';
import type { Product, ProductInfoBox } from '@/types/product';
import RelatedProducts from '@/components/shop/RelatedProducts';

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

function InfoBox({ box, index, hasSplash, splashSide }: { box: ProductInfoBox; index: number; hasSplash: boolean; splashSide: 'left' | 'right' }) {
  const bg = box.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
  const textColor = isDarkBackground(bg) ? '#FFFFFF' : '#1a1a1a';
  const lines = box.content.split('\n').filter(Boolean);

  return (
    <div className="relative break-inside-avoid">
      {hasSplash && (
        <Image
          src="/pouze flek_result_result.webp"
          alt=""
          width={300}
          height={300}
          aria-hidden
          className={`absolute z-0 pointer-events-none hidden md:block w-62.5 h-auto ${
            splashSide === 'left'
              ? '-left-24 top-1/2 -translate-y-1/2'
              : '-right-24 top-1/2 -translate-y-1/2 -scale-x-100'
          }`}
        />
      )}
      <div className="rounded-3xl p-8 relative z-10" style={{ backgroundColor: bg, opacity: 0.9 }}>
        <h3 className="font-bold text-2xl md:text-3xl mb-3" style={{ color: textColor }}>
          {box.title}
        </h3>
        <ul className="space-y-1">
          {lines.map((line, i) => (
            <li key={i} className="text-md md:text-lg flex gap-2" style={{ color: textColor }}>
              <span>•</span>
              <span>{line.replace(/^[-•]\s*/, '')}</span>
            </li>
          ))}
        </ul>
      </div>
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

  const boxes = product.infoBoxes ?? [];
  const lastIndex = boxes.length - 1;

  return (
    <div className="mt-15 md:mt-35">
      {hasBoxes && (
        <div className="columns-1 sm:columns-2 gap-6 space-y-6">
          {boxes.map((box, i) => (
            <InfoBox
              key={box.id}
              box={box}
              index={i}
              hasSplash={i === 0 || i === lastIndex}
              splashSide={i === 0 ? 'left' : 'right'}
            />
          ))}
        </div>
      )}

      {hasFooter && (
        <div className="text-center text-sm md:text-lg text-muted-foreground space-y-1">
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

      <RelatedProducts products={product.relatedProducts ?? []} />
    </div>
  );
}
