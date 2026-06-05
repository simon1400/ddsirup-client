import { useMemo } from 'react';
import Image from 'next/image';
import type { Product, ProductInfoBox } from '@/types/product';
import RelatedProducts from '@/components/shop/RelatedProducts';
import { RecipeSection } from '@/components/shop/RecipeSection';
import { DirectionSection } from '@/components/shop/DirectionSection';

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
          className={`absolute z-0 pointer-events-none hidden md:block w-62.5 h-auto ${splashSide === 'left'
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
  const hasRecipes = product.recipes && product.recipes.length > 0;
  const hasDirections = product.directions && product.directions.length > 0;
  const hasFooter = product.ingredients || product.countryOfOrigin || product.madeIn;
  const hasRelated = product.relatedProducts && product.relatedProducts.length > 0;

  const displayRecipes = useMemo(() => {
    const recipes = product.recipes ?? [];
    if (recipes.length <= 2) return recipes;
    const shuffled = [...recipes];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 2);
  }, [product.recipes]);

  if (!hasBoxes && !hasFooter && !hasRelated && !hasRecipes && !hasDirections) return null;

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
      {hasRecipes && (
        <div className="mt-12 md:mt-20 mb-12 md:mb-20">
          <h2 className="font-bold text-3xl md:text-5xl mb-6 md:mb-8">Recepty</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayRecipes.map((recipe) => (
              <RecipeSection key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      )}
      {hasDirections && (
        <div className="mt-12 md:mt-20 mb-12 md:mb-20">
          <h2 className="font-bold text-3xl md:text-5xl mb-6 md:mb-8">Jak použít</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {product.directions!.map((direction) => (
              <DirectionSection key={direction.id} direction={direction} />
            ))}
          </div>
        </div>
      )}

      {hasFooter && (
        <div className="relative mt-10 md:mt-0 rounded-3xl bg-muted p-8 md:p-10 space-y-4">
          {product.ingredients && (
            <div>
              <h3 className="font-bold text-lg md:text-xl mb-1">Složení</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {product.ingredients}
              </p>
            </div>
          )}
          {(product.countryOfOrigin || product.madeIn) && (
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {product.countryOfOrigin && (
                <div>
                  <span className=" text-md md:text-lg">Země původu: </span>
                  <span className="text-md md:text-lg text-coral font-bold">{product.countryOfOrigin}</span>
                </div>
              )}
              {product.madeIn && (
                <div>
                  <span className=" text-md md:text-lg">Vyrobeno: </span>
                  <span className="text-md md:text-lg text-coral font-bold">{product.madeIn}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <RelatedProducts products={product.relatedProducts ?? []} />
    </div>
  );
}
