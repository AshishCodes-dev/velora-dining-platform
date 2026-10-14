import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { FoodCard } from '../components/FoodCard';

export const MenuPage: React.FC = () => {
  const { foods, categories, loadingCatalog } = useRestaurant();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCat = searchParams.get('category') || 'All';
  const initialQuery = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [spicyFilter, setSpicyFilter] = useState<'all' | 'mild' | 'spicy'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [selectedTag, setSelectedTag] = useState<string>('All');

  useEffect(() => {
    const qCat = searchParams.get('category');
    const qSearch = searchParams.get('search');
    if (qCat) setSelectedCategory(qCat);
    if (qSearch !== null) setSearchQuery(qSearch);
  }, [searchParams]);

  const allDietaryTags = useMemo(() => {
    const set = new Set<string>();
    foods.forEach((f) => f.dietaryTags.forEach((t) => set.add(t)));
    return ['All', ...Array.from(set).slice(0, 7)];
  }, [foods]);

  const filteredFoods = useMemo(() => {
    let list = [...foods];

    if (selectedCategory !== 'All') {
      list = list.filter(
        (f) => f.categoryName.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (dietFilter === 'veg') {
      list = list.filter((f) => f.isVeg);
    } else if (dietFilter === 'non-veg') {
      list = list.filter((f) => !f.isVeg);
    }

    if (spicyFilter === 'mild') {
      list = list.filter((f) => f.spicyLevel <= 1);
    } else if (spicyFilter === 'spicy') {
      list = list.filter((f) => f.spicyLevel >= 2);
    }

    if (selectedTag !== 'All') {
      list = list.filter((f) => f.dietaryTags.includes(selectedTag));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.categoryName.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.ingredients.some((i) => i.toLowerCase().includes(q)) ||
          f.dietaryTags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'price-asc') {
      list.sort(
        (a, b) =>
          a.price * (1 - a.discountPercent / 100) -
          b.price * (1 - b.discountPercent / 100)
      );
    } else if (sortBy === 'price-desc') {
      list.sort(
        (a, b) =>
          b.price * (1 - b.discountPercent / 100) -
          a.price * (1 - a.discountPercent / 100)
      );
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    }

    return list;
  }, [foods, selectedCategory, dietFilter, spicyFilter, selectedTag, searchQuery, sortBy]);

  const resetAllFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setDietFilter('all');
    setSpicyFilter('all');
    setSortBy('featured');
    setSelectedTag('All');
    setSearchParams({});
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-xs text-yellow font-medium">
            VELORA · Seasonal Artisanal Menu
          </p>
          <h1 className="font-serif-display text-4xl sm:text-5xl font-semibold text-text mt-1">
            Artisanal Culinary Menu
          </h1>
        </div>
        <p className="text-xs font-mono-tabular text-text-soft">
          Showing {filteredFoods.length} of {foods.length} available creations
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setSelectedCategory('All')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
            selectedCategory === 'All'
              ? 'bg-yellow text-black'
              : 'bg-surface text-text-soft hover:text-text border border-border'
          }`}
        >
          All Categories ({foods.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory.toLowerCase() === cat.name.toLowerCase()
                ? 'bg-yellow text-black'
                : 'bg-surface text-text-soft hover:text-text border border-border'
            }`}
          >
            {cat.name} ({cat.dishCount ?? 0})
          </button>
        ))}
      </div>

      {/* Search, Veg/Non-Veg, Spice, and Sort Control Bar */}
      <div className="nocturne-surface rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dishes, ingredients (truffle, saffron, wagyu), or tags..."
            aria-label="Search menu dishes"
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-canvas border border-border text-xs sm:text-sm text-text placeholder-text-muted focus:outline-none focus:border-yellow"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search query"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Segmented Dietary Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-canvas border border-border">
            <button
              type="button"
              onClick={() => setDietFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                dietFilter === 'all' ? 'bg-yellow text-black font-semibold' : 'text-text-soft hover:text-text'
              }`}
            >
              All Diet
            </button>
            <button
              type="button"
              onClick={() => setDietFilter('veg')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                dietFilter === 'veg' ? 'bg-green-light text-black font-semibold' : 'text-text-soft hover:text-text'
              }`}
            >
              Vegetarian
            </button>
            <button
              type="button"
              onClick={() => setDietFilter('non-veg')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                dietFilter === 'non-veg' ? 'bg-danger text-black font-semibold' : 'text-text-soft hover:text-text'
              }`}
            >
              Chef Cuts / Non-Veg
            </button>
          </div>

          {/* Spice Filter */}
          <select
            aria-label="Filter by spice level"
            value={spicyFilter}
            onChange={(e) => setSpicyFilter(e.target.value as 'all' | 'mild' | 'spicy')}
            className="px-3.5 py-2 rounded-xl bg-canvas border border-border text-xs text-text focus:outline-none focus:border-yellow"
          >
            <option value="all">All Spice Levels</option>
            <option value="mild">Mild &amp; Subtle</option>
            <option value="spicy">Medium &amp; Fiery Spice</option>
          </select>

          {/* Sort Select */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-yellow hidden sm:block" />
            <select
              aria-label="Sort menu items"
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as 'featured' | 'price-asc' | 'price-desc' | 'rating'
                )
              }
              className="px-3.5 py-2 rounded-xl bg-canvas border border-border text-xs text-text focus:outline-none focus:border-yellow"
            >
              <option value="featured">Sort: Chef Curated</option>
              <option value="rating">Sort: Highest Rated</option>
              <option value="price-asc">Sort: Price (Low to High)</option>
              <option value="price-desc">Sort: Price (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dietary Tag Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-text-muted shrink-0">Dietary &amp; Craft Tags:</span>
        {allDietaryTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              selectedTag === tag
                ? 'bg-elevated text-green-light border border-green-light/50'
                : 'text-text-soft hover:text-text bg-white/5'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Menu Grid / Loading / Empty State */}
      {loadingCatalog ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-96 rounded-2xl bg-surface border border-border animate-pulse"
            />
          ))}
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="py-16 px-4 rounded-2xl nocturne-surface text-center space-y-4">
          <p className="font-serif-display text-3xl text-text">No dishes found</p>
          <p className="text-xs sm:text-sm text-text-soft max-w-md mx-auto">
            No culinary creations match your active filters. Try clearing your search query or switching dietary preferences.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="px-5 py-2.5 rounded-xl bg-yellow hover:bg-yellow-hover text-black text-xs font-semibold transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredFoods.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      )}
    </div>
  );
};
