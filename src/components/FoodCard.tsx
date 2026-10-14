import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus } from 'lucide-react';
import type { Food } from '../types/restaurant';
import { useRestaurant } from '../context/RestaurantContext';
import { DishVisual } from './DishVisual';

interface FoodCardProps {
  food: Food;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food }) => {
  const { addToCart, toggleFavorite, isFavorite } = useRestaurant();
  const fav = isFavorite(food.id);
  const discountedPrice = Number(
    (food.price * (1 - food.discountPercent / 100)).toFixed(2)
  );

  const spicyLabel =
    food.spicyLevel === 3
      ? 'Fiery Spice'
      : food.spicyLevel === 2
      ? 'Medium Spice'
      : food.spicyLevel === 1
      ? 'Warm Spice'
      : null;

  const statusKicker =
    food.discountPercent > 0
      ? `${food.discountPercent}% Privilege`
      : food.isNewDish
      ? 'New Season'
      : food.isPopular
      ? 'Guest Favorite'
      : null;

  return (
    <article className="group nocturne-surface rounded-2xl overflow-hidden flex flex-col justify-between card-lift">
      <div>
        {/* Image Frame (68% visual weight) */}
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Link to={`/menu/${food.id}`} className="block w-full h-full">
            <DishVisual
              src={food.image}
              alt={food.name}
              illustrationType={food.illustrationType}
            />
          </Link>

          {/* Favorite Button */}
          <button
            type="button"
            onClick={() => toggleFavorite(food.id)}
            aria-label={fav ? `Remove ${food.name} from favorites` : `Save ${food.name} to favorites`}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#0D0914]/80 hover:bg-[#0D0914] flex items-center justify-center text-white transition-colors"
          >
            <Heart
              className={`w-4 h-4 ${
                fav ? 'fill-[#EC4899] text-[#EC4899]' : 'text-[#F5F2FA]'
              }`}
            />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5">
          {/* Unboxed Metadata Line with Typographic Separators (Zero-Pill Rule) */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#B8AFC9]">
            <span className="text-[#8B5CF6] font-medium">{food.categoryName}</span>
            <span aria-hidden="true">·</span>
            <span className={food.isVeg ? 'text-[#10B981]' : 'text-[#F59E0B]'}>
              {food.isVeg ? 'Vegetarian' : 'Chef Cut'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular text-[#F59E0B]">
              ★ {food.rating.toFixed(1)} ({food.reviewCount})
            </span>
            {statusKicker && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#EC4899] font-medium">{statusKicker}</span>
              </>
            )}
          </div>

          {/* Dish Name */}
          <Link to={`/menu/${food.id}`} className="block mt-2">
            <h3 className="font-serif-display text-xl font-semibold text-[#F5F2FA] group-hover:text-[#A855F7] transition-colors line-clamp-1">
              {food.name}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-[#B8AFC9] mt-1.5 line-clamp-2 leading-relaxed">
            {food.description}
          </p>

          {/* Secondary Unboxed Dietary & Prep Metadata */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-[#7E7394] font-mono-tabular">
            <span>{food.prepTimeMinutes} min</span>
            <span aria-hidden="true">·</span>
            <span>{food.calories} kcal</span>
            {spicyLabel && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#EC4899]">{spicyLabel}</span>
              </>
            )}
            {food.dietaryTags[0] && (
              <>
                <span aria-hidden="true">·</span>
                <span>{food.dietaryTags[0]}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer Price & Action */}
      <div className="px-5 pb-5 pt-3 border-t border-white/5 flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2 font-mono-tabular">
          <span className="text-lg font-semibold text-[#F5F2FA]">
            ${discountedPrice.toFixed(2)}
          </span>
          {food.discountPercent > 0 && (
            <span className="text-xs text-[#7E7394] line-through">
              ${food.price.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/menu/${food.id}`}
            className="px-3 py-2 rounded-lg text-xs font-medium text-[#B8AFC9] hover:text-[#F5F2FA] hover:bg-white/5 transition-colors whitespace-nowrap"
          >
            Customize
          </Link>
          <button
            type="button"
            onClick={() => addToCart({ foodId: food.id, quantity: 1 })}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-[#081C15] text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </article>
  );
};
