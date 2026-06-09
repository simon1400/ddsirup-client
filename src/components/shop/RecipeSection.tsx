import { AnimatedWave } from '@/components/ui/AnimatedWave';
import type { ProductRecipe } from '@/types/product';

const RECIPE_PALETTE = [
  '#A8D5A2',
  '#F08080'
] as const;

interface RecipeSectionProps {
  recipe: ProductRecipe;
}

export function RecipeSection({ recipe }: RecipeSectionProps) {
  const bg = RECIPE_PALETTE[recipe.id % RECIPE_PALETTE.length];

  return (
    <div
      className="relative @container break-inside-avoid rounded-3xl overflow-hidden h-full w-full mx-auto"
      style={{ backgroundColor: bg }}
    >
      <AnimatedWave position="top" size="small" absolute begin='-1.8s' />
      <AnimatedWave position="bottom" size="small" absolute begin="-2.3s" />
      <AnimatedWave position="left" size="small" absolute begin="-1.5s" />
      <AnimatedWave position="right" size="small" absolute begin="-3s" />

      <div className="relative z-10 px-10 py-10 md:py-14 h-full flex flex-col" style={{ paddingLeft: '3.5rem', paddingRight: '3.5rem' }}>
        {(recipe.recipeType || recipe.badge) && (
          <div className="flex flex-col items-start gap-2 mb-5">
            {recipe.badge && (
              <span
                className="inline-block bg-white px-4 py-1.5 mb-4 rounded-full text-xs md:text-sm font-black uppercase tracking-wider"
                style={{ color: recipe.badge.badgeColor || bg }}
              >
                {recipe.badge.badgeName}
              </span>
            )}
            {recipe.recipeType && (
              <span
                className="inline-block text-xs md:text-sm font-normal uppercase tracking-wider"
                style={{ color: 'rgba(255, 255, 255, 0.9)' }}
              >
                {recipe.recipeType}
              </span>
            )}
          </div>
        )}

        <h3 className="font-black text-2xl md:text-3xl mb-3 text-white">
          {recipe.recipeName}
        </h3>

        <div dangerouslySetInnerHTML={{ __html: recipe.recipe }} className="text-md md:text-lg text-white leading-relaxed font-medium whitespace-pre-wrap grow">
        </div>
      </div>
    </div>
  );
}
