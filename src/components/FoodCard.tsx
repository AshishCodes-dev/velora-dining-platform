import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus, Check } from 'lucide-react';
import { motion } from 'motion/react';
import type { Food } from '../types/restaurant';
import { useRestaurant } from '../context/RestaurantContext';
import { DishVisual } from './DishVisual';
import { Button } from './ui/Button';

interface FoodCardProps {
  food: Food;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food }) => {
  const { addToCart, toggleFavorite, isFavorite } = useRestaurant();
  const fav = isFavorite(food.id);
  const [justAdded, setJustAdded] = useState(false);
  const [heartPumping, setHeartPumping] = useState(false);

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

  const handleAddToCart = () => {
    addToCart({ foodId: food.id, quantity: 1 });
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 1200);
  };

  const handleToggleFavorite = () => {
    setHeartPumping(true);
    toggleFavorite(food.id);
    setTimeout(() => setHeartPumping(false), 350);
  };

  return (
    <article className="group nocturne-surface rounded-2xl overflow-hidden flex flex-col justify-between transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-border-accent hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.7)]">
      <div>
        {/* Image Frame with zoom on hover */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
          <Link
            to={`/menu/${food.id}`}
            className="block w-full h-full overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow"
          >
            <div className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-105">
              <DishVisual
                src={food.image}
                alt={food.name}
                illustrationType={food.illustrationType}
              />
            </div>
          </Link>

          {/* Favorite Button with pop bounce */}
          <motion.button
            type="button"
            animate={heartPumping ? { scale: [1, 1.3, 0.92, 1] } : { scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            onClick={handleToggleFavorite}
            aria-label={fav ? `Remove ${food.name} from favorites` : `Save ${food.name} to favorites`}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-canvas/80 backdrop-blur-sm hover:bg-canvas flex items-center justify-center text-text border border-border/50 hover:border-yellow/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                fav ? 'fill-yellow text-yellow' : 'text-text hover:text-yellow'
              }`}
            />
          </motion.button>
        </div>

        {/* Content Body */}
        <div className="p-5">
          {/* Metadata Line */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-soft">
            <span className="text-yellow font-medium">{food.categoryName}</span>
            <span aria-hidden="true">·</span>
            <span className={food.isVeg ? 'text-green-light' : 'text-danger'}>
              {food.isVeg ? 'Vegetarian' : 'Chef Cut'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular text-yellow">
              ★ {food.rating.toFixed(1)} ({food.reviewCount})
            </span>
            {statusKicker && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-green-light font-medium">{statusKicker}</span>
              </>
            )}
          </div>

          {/* Dish Name */}
          <Link to={`/menu/${food.id}`} className="block mt-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow rounded">
            <h3 className="font-serif-display text-xl font-semibold text-text group-hover:text-yellow transition-colors line-clamp-1">
              {food.name}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-text-soft mt-1.5 line-clamp-2 leading-relaxed">
            {food.description}
          </p>

          {/* Secondary Unboxed Dietary & Prep Metadata */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-text-muted font-mono-tabular">
            <span>{food.prepTimeMinutes} min</span>
            <span aria-hidden="true">·</span>
            <span>{food.calories} kcal</span>
            {spicyLabel && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-yellow">{spicyLabel}</span>
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
      <div className="px-5 pb-5 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-baseline gap-2 font-mono-tabular">
          <span className="text-lg font-semibold text-yellow">
            ${discountedPrice.toFixed(2)}
          </span>
          {food.discountPercent > 0 && (
            <span className="text-xs text-text-muted line-through">
              ${food.price.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            to={`/menu/${food.id}`}
            className="text-text-soft hover:text-text"
          >
            Customize
          </Button>
          <Button
            variant={justAdded ? 'success' : 'primary'}
            size="sm"
            onClick={handleAddToCart}
            leftIcon={
              justAdded ? (
                <Check className="w-3.5 h-3.5 text-black" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )
            }
          >
            {justAdded ? 'Added' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </article>
  );
};
