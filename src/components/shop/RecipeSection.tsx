import { AnimatedWave } from '@/components/ui/AnimatedWave';
import type { ProductRecipe } from '@/types/product';

const RECIPE_PALETTE = [
  '#e0999aff',
  '#769d73ff',
  '#8cafd4ff',
  '#eda561ff',
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
      <AnimatedWave position="top" size="small" absolute begin='-1.8s'/>
      <AnimatedWave position="bottom" size="small" absolute begin="-2.3s" />
      <AnimatedWave position="left" size="small" begin="-1.5s" />
      <AnimatedWave position="right" size="small" begin="-3s" />

      <div className="relative z-10 px-8 py-10 md:py-14 h-full flex flex-col items-center text-center">
        {(recipe.recipeType || recipe.badge) && (
          <div className="flex flex-col items-center gap-2 mb-5">
            {recipe.badge && (
              <span
                className="bg-white px-4 py-1.5 rounded-full text-xs md:text-sm font-black uppercase tracking-wider"
                style={{ color: recipe.badge.badgeColor || bg }}
              >
                {recipe.badge.badgeName}
              </span>
            )}
            {recipe.recipeType && (
              <span
                className="text-xs md:text-sm font-normal uppercase tracking-wider"
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
