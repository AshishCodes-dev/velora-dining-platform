import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import { apiRequest } from '../services/api';
import { useRestaurant } from '../context/RestaurantContext';
import { DishVisual } from '../components/DishVisual';
import type { Food, Review, CustomizationAddon } from '../types/restaurant';
import { FoodCustomizer } from '../components/food/FoodCustomizer';
import { FoodReviewsSection } from '../components/food/FoodReviewsSection';

export const FoodDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    user,
    foods,
    addToCart,
    toggleFavorite,
    isFavorite,
    showToast,
    refreshCatalog,
  } = useRestaurant();

  const [food, setFood] = useState<Food | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [visualMode, setVisualMode] = useState<'photo' | 'illustration'>('photo');

  // Customization State
  const [selectedSize, setSelectedSize] = useState<'Regular' | 'Large' | 'Family'>('Regular');
  const [selectedAddons, setSelectedAddons] = useState<CustomizationAddon[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');

  // Review Form State
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewImageUrl, setReviewImageUrl] = useState<string>('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadFoodDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await apiRequest<{ food: Food; reviews: Review[] }>(`/api/foods/${id}`);
      setFood(res.food);
      setReviews(res.reviews);
    } catch {
      const fallback = foods.find((f) => f.id === id || f.slug === id) || null;
      setFood(fallback);
    } finally {
      setLoading(false);
    }
  }, [id, foods]);

  useEffect(() => {
    loadFoodDetails();
  }, [loadFoodDetails]);

  // Price calculations
  const sizeDelta = useMemo(() => {
    if (!food) return 0;
    const found = food.sizes.find((s) => s.name === selectedSize);
    return found ? found.priceDelta : 0;
  }, [food, selectedSize]);

  const addonsTotal = useMemo(() => {
    return selectedAddons.reduce((acc, a) => acc + a.price, 0);
  }, [selectedAddons]);

  const unitBasePrice = useMemo(() => {
    if (!food) return 0;
    return food.price + sizeDelta + addonsTotal;
  }, [food, sizeDelta, addonsTotal]);

  const unitFinalPrice = useMemo(() => {
    if (!food) return 0;
    const discountMultiplier = 1 - food.discountPercent / 100;
    return Number((unitBasePrice * discountMultiplier).toFixed(2));
  }, [food, unitBasePrice]);

  const totalPrice = useMemo(() => {
    return Number((unitFinalPrice * quantity).toFixed(2));
  }, [unitFinalPrice, quantity]);

  const toggleAddon = (addon: CustomizationAddon) => {
    setSelectedAddons((prev) =>
      prev.some((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const handleAddToCart = () => {
    if (!food) return;
    addToCart({
      foodId: food.id,
      selectedSize,
      selectedAddons,
      specialInstructions,
      quantity,
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!food) return;
    if (!reviewComment.trim()) {
      showToast('✕ Please write your review comment', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      if (editingReviewId) {
        await apiRequest(`/api/reviews/${editingReviewId}`, {
          method: 'PUT',
          body: JSON.stringify({
            rating: reviewRating,
            comment: reviewComment,
            imageUrl: reviewImageUrl || undefined,
          }),
        });
        showToast('✓ Review updated successfully', 'success');
        setEditingReviewId(null);
      } else {
        await apiRequest('/api/reviews', {
          method: 'POST',
          body: JSON.stringify({
            foodId: food.id,
            rating: reviewRating,
            comment: reviewComment,
            imageUrl: reviewImageUrl || undefined,
          }),
        });
        showToast('✓ Thank you for your review!', 'success');
      }
      setReviewComment('');
      setReviewImageUrl('');
      setReviewRating(5);
      await loadFoodDetails();
      await refreshCatalog();
    } catch (err) {
      showToast(err instanceof Error ? `✕ ${err.message}` : '✕ Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await apiRequest(`/api/reviews/${reviewId}`, { method: 'DELETE' });
      showToast('✓ Review deleted', 'info');
      await loadFoodDetails();
      await refreshCatalog();
    } catch {
      showToast('✕ Could not delete review', 'error');
    }
  };

  const ratingDistribution = useMemo(() => {
    const counts: Record<1 | 2 | 3 | 4 | 5, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const k = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      counts[k] += 1;
    });
    return counts;
  }, [reviews]);

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-6 h-96 rounded-2xl bg-[#150F20] animate-pulse" />
        <div className="lg:col-span-6 h-96 rounded-2xl bg-[#150F20] animate-pulse" />
      </div>
    );
  }

  if (!food) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-20 text-center space-y-4">
        <h1 className="font-serif-display text-3xl text-[#F5F2FA]">Dish Not Found</h1>
        <p className="text-xs text-[#B8AFC9]">
          This creation may have rotated out of our seasonal tasting menu.
        </p>
        <Link
          to="/menu"
          className="inline-block px-5 py-2.5 rounded-xl bg-[#8B5CF6] text-white text-xs font-semibold"
        >
          Return to Menu
        </Link>
      </div>
    );
  }

  const fav = isFavorite(food.id);

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 space-y-16">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/menu')}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#B8AFC9] hover:text-[#F5F2FA] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Artisanal Menu</span>
        </button>

        <div className="text-xs text-[#7E7394]">
          <span>{food.categoryName}</span>
          <span className="mx-1.5">·</span>
          <span className="text-[#F5F2FA]">{food.name}</span>
        </div>
      </div>

      {/* CONTIGUOUS PURCHASE MODULE (PDP) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Dish Visual + Ingredients + Nutritional Telemetry */}
        <div className="lg:col-span-6 space-y-6 lg:sticky lg:top-24">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-[#150F20]">
            <DishVisual
              src={food.image}
              alt={food.name}
              illustrationType={food.illustrationType}
              mode={visualMode}
            />

            {/* Visual Mode Switcher: Photo vs 2D Culinary Art */}
            <div className="absolute top-3 left-3 flex items-center gap-1 p-1 rounded-xl bg-[#0D0914]/85 backdrop-blur-md border border-white/10">
              <button
                type="button"
                onClick={() => setVisualMode('photo')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  visualMode === 'photo'
                    ? 'bg-[#8B5CF6] text-white'
                    : 'text-[#B8AFC9] hover:text-white'
                }`}
              >
                Editorial Photo
              </button>
              <button
                type="button"
                onClick={() => setVisualMode('illustration')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  visualMode === 'illustration'
                    ? 'bg-[#8B5CF6] text-white'
                    : 'text-[#B8AFC9] hover:text-white'
                }`}
              >
                2D Culinary Art
              </button>
            </div>

            <button
              type="button"
              onClick={() => toggleFavorite(food.id)}
              aria-label="Toggle favorite"
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-[#0D0914]/85 flex items-center justify-center text-white hover:bg-[#0D0914] transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${
                  fav ? 'fill-[#EC4899] text-[#EC4899]' : 'text-[#F5F2FA]'
                }`}
              />
            </button>
          </div>

          {/* Nutritional & Preparation Facts */}
          <div className="nocturne-surface rounded-2xl p-5 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-[#7E7394]">Preparation Time</p>
              <p className="font-mono-tabular text-base font-semibold text-[#F5F2FA] mt-1">
                {food.prepTimeMinutes} mins
              </p>
            </div>
            <div className="border-x border-white/10">
              <p className="text-xs text-[#7E7394]">Energy Profile</p>
              <p className="font-mono-tabular text-base font-semibold text-[#10B981] mt-1">
                {food.calories} kcal
              </p>
            </div>
            <div>
              <p className="text-xs text-[#7E7394]">Guest Rating</p>
              <p className="font-mono-tabular text-base font-semibold text-[#F59E0B] mt-1">
                ★ {food.rating.toFixed(1)} ({food.reviewCount})
              </p>
            </div>
          </div>

          {/* Provenance & Ingredients */}
          <div className="nocturne-surface rounded-2xl p-6 space-y-3">
            <h2 className="font-serif-display text-xl font-semibold text-[#F5F2FA]">
              Key Ingredients &amp; Provenance
            </h2>
            <p className="text-xs text-[#B8AFC9] leading-relaxed">
              {food.ingredients.join(' · ')}
            </p>
            <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2 text-xs text-[#8B5CF6]">
              <span>Dietary &amp; Preparation Notes:</span>
              <span className="text-[#F5F2FA]">
                {food.isVeg ? '100% Vegetarian' : 'Chef Cut'} · {food.dietaryTags.join(' · ')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Contiguous Purchase & Customization Module */}
        <FoodCustomizer
          food={food}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          selectedAddons={selectedAddons}
          toggleAddon={toggleAddon}
          specialInstructions={specialInstructions}
          setSpecialInstructions={setSpecialInstructions}
          quantity={quantity}
          setQuantity={setQuantity}
          unitFinalPrice={unitFinalPrice}
          totalPrice={totalPrice}
          sizeDelta={sizeDelta}
          addonsTotal={addonsTotal}
          onAddToCart={handleAddToCart}
        />
      </div>

      {/* CUSTOMER REVIEWS & RATING DISTRIBUTION */}
      <FoodReviewsSection
        food={food}
        reviews={reviews}
        user={user}
        ratingDistribution={ratingDistribution}
        editingReviewId={editingReviewId}
        setEditingReviewId={setEditingReviewId}
        reviewRating={reviewRating}
        setReviewRating={setReviewRating}
        reviewComment={reviewComment}
        setReviewComment={setReviewComment}
        reviewImageUrl={reviewImageUrl}
        setReviewImageUrl={setReviewImageUrl}
        submittingReview={submittingReview}
        onSubmitReview={handleReviewSubmit}
        onDeleteReview={handleDeleteReview}
      />
    </div>
  );
};
