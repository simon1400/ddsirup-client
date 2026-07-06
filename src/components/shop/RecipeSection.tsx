import type { ProductRecipe } from '@/types/product';

/**
 * Recipe cards reuse the site's existing brand fills (coral / soft green).
 * Text color follows the established site usage: white on coral (like the
 * "Add to cart" CTA), deep green on the light green fill (like green-text).
 */
const RECIPE_PALETTE = [
  {
    bg: '#F47070',
    text: '#FFFFFF',
    muted: 'rgba(255, 255, 255, 0.85)',
  },
  {
    bg: '#A8C98E',
    text: '#2A5A1A',
    muted: 'rgba(42, 90, 26, 0.8)',
  },
] as const;

const BUBBLE_COUNT = 42;

/** Deterministic pseudo-random in [0,1) — keeps SSR and client output identical. */
function rand(i: number, salt: number): number {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function RecipeBubbles({ seed }: { seed: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {Array.from({ length: BUBBLE_COUNT }).map((_, i) => {
        const k = i + seed * 100;
        const size = 4 + rand(k, 1) * 13; // 4–17px
        const left = rand(k, 2) * 100; // 0–100%
        const duration = 7 + rand(k, 3) * 8; // 7–15s
        const delay = -(rand(k, 4) * 15); // negative → pre-filled, scattered
        const drift = (rand(k, 5) - 0.5) * 50; // -25–25px horizontal sway
        const opacity = 0.12 + rand(k, 6) * 0.22; // 0.12–0.34
        return (
          <span
            key={i}
            className="recipe-bubble"
            style={
              {
                left: `${left}%`,
                width: `${size}px`,
                height: `${size}px`,
                '--bubble-dur': `${duration}s`,
                '--bubble-delay': `${delay}s`,
                '--bubble-drift': `${drift}px`,
                '--bubble-o': opacity,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

interface RecipeSectionProps {
  recipe: ProductRecipe;
  index?: number;
}

export function RecipeSection({ recipe, index = 0 }: RecipeSectionProps) {
  const palette = RECIPE_PALETTE[index % RECIPE_PALETTE.length];

  return (
    <div
      className="relative @container break-inside-avoid rounded-3xl overflow-hidden h-full w-full mx-auto"
      style={{ backgroundColor: palette.bg }}
    >
      <RecipeBubbles seed={index} />

      <div className="relative z-10 px-10 py-10 md:py-14 h-full flex flex-col" style={{ paddingLeft: '3.5rem', paddingRight: '3.5rem' }}>
        {(recipe.recipeType || recipe.badge) && (
          <div className="flex flex-col items-start gap-2 mb-5">
            {recipe.badge && (
              <span
                className="inline-block bg-white px-4 py-1.5 mb-4 rounded-full text-xs md:text-sm font-black uppercase tracking-wider"
                style={{ color: recipe.badge.badgeColor || palette.bg }}
              >
                {recipe.badge.badgeName}
              </span>
            )}
            {recipe.recipeType && (
              <span
                className="inline-block text-xs md:text-sm font-normal uppercase tracking-wider"
                style={{ color: palette.muted }}
              >
                {recipe.recipeType}
              </span>
            )}
          </div>
        )}

        <h3 className="font-black text-2xl md:text-3xl mb-3" style={{ color: palette.text }}>
          {recipe.recipeName}
        </h3>

        <div
          dangerouslySetInnerHTML={{ __html: recipe.recipe }}
          className="text-md md:text-lg leading-relaxed font-medium whitespace-pre-wrap grow"
          style={{ color: palette.text }}
        >
        </div>
      </div>
    </div>
  );
}
