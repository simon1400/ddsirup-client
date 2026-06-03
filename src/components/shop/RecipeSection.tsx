import { AnimatedWave } from '@/components/ui/AnimatedWave';
import type { ProductRecipe } from '@/types/product';

interface RecipeSectionProps {
  recipe: ProductRecipe;
}

export function RecipeSection({ recipe }: RecipeSectionProps) {
  return (
    <div 
      className="relative @container break-inside-avoid bg-coral rounded-3xl overflow-hidden h-full w-full mx-auto"
      style={recipe.recipeBg ? { backgroundColor: recipe.recipeBg } : undefined}
    >
      <AnimatedWave position="top" size="small" absolute />
      <AnimatedWave position="bottom" size="small" absolute />
      <AnimatedWave position="left" size="small" />
      <AnimatedWave position="right" size="small" />

      <div className="relative z-10 px-8 py-10 md:py-14 h-full flex flex-col items-center text-center">
        {(recipe.recipeType || recipe.badge) && (
          <div className="flex flex-col items-center gap-2 mb-5">
            {recipe.recipeType && (
              <span 
                className={`bg-white px-4 py-1.5 rounded-full text-xs md:text-sm font-black uppercase tracking-wider ${!recipe.recipeBg ? 'text-coral' : ''}`}
                style={recipe.recipeBg ? { color: recipe.recipeBg } : undefined}
              >
                {recipe.recipeType}
              </span>
            )}
            {recipe.badge && (
              <span 
                className="text-xs md:text-sm font-normal uppercase tracking-wider"
                style={{ color: recipe.badgeColor || recipe.badge.badgeColor || 'rgba(255, 255, 255, 0.9)' }}
              >
                {recipe.badge.badgeName}
              </span>
            )}
          </div>
        )}

        <h3 className="font-black text-2xl md:text-3xl mb-3 text-white">
          {recipe.recipeName}
        </h3>

        <div className="text-md md:text-lg text-white leading-relaxed font-medium whitespace-pre-wrap grow">
          {recipe.recipe}
        </div>
      </div>
    </div>
  );
}
