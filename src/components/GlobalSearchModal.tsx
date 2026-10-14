import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, UtensilsCrossed } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRestaurant } from '../context/RestaurantContext';
import { DishVisual } from './DishVisual';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTED_TERMS = [
  'Wagyu',
  'Truffle',
  'Saffron',
  'Burrata',
  'Gluten-Free',
  'Vegetarian',
  'Yuzu',
  'Dim Sum',
];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const { foods, addToCart } = useRestaurant();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('velora_recent_searches');
      return saved ? JSON.parse(saved) : ['Wagyu', 'Truffle Pizza', 'Biryani'];
    } catch {
      return ['Wagyu', 'Truffle Pizza'];
    }
  });

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return foods.slice(0, 4);
    return foods.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.categoryName.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.ingredients.some((i) => i.toLowerCase().includes(q)) ||
        f.dietaryTags.some((t) => t.toLowerCase().includes(q))
    );
  }, [foods, query]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  const saveRecent = React.useCallback(
    (term: string) => {
      if (!term.trim()) return;
      const trimmed = term.trim();
      setRecentSearches((prev) => {
        const updated = [trimmed, ...prev.filter((r) => r !== trimmed)].slice(0, 5);
        try {
          localStorage.setItem('velora_recent_searches', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    },
    []
  );

  const handleSelectDish = React.useCallback(
    (dish: (typeof results)[0]) => {
      saveRecent(query || dish.name);
      onClose();
      navigate(`/menu/${dish.id}`);
    },
    [query, onClose, navigate, saveRecent]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          e.preventDefault();
          handleSelectDish(results[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, handleSelectDish, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Global Culinary Search"
          className="fixed inset-0 z-50 flex items-start justify-center pt-14 px-4 overflow-y-auto"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl rounded-2xl bg-elevated border border-border shadow-2xl overflow-hidden z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <Search className="w-5 h-5 text-yellow shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by dish name, category, ingredient (e.g. Truffle, Yuzu)..."
                aria-label="Search dishes and ingredients"
                className="w-full bg-transparent text-sm sm:text-base text-text placeholder-text-muted focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-xs text-text-muted hover:text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow px-1"
                >
                  Clear
                </button>
              )}
              <Button
                variant="icon"
                size="sm"
                onClick={onClose}
                aria-label="Close search"
                className="text-text-soft hover:text-text"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Suggestions & Recent Searches */}
            <div className="px-5 py-3 bg-surface border-b border-border flex flex-wrap items-center gap-2">
              <span className="text-xs text-text-muted mr-1">Suggestions:</span>
              {SUGGESTED_TERMS.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setQuery(term);
                    saveRecent(term);
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-[background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow ${
                    query.toLowerCase() === term.toLowerCase()
                      ? 'bg-yellow text-black font-semibold'
                      : 'bg-white/5 text-text-soft hover:text-text hover:bg-white/10'
                  }`}
                >
                  {term}
                </button>
              ))}
            </div>

            {/* Search Results List */}
            <div className="max-h-[60vh] overflow-y-auto p-5 space-y-3" role="listbox">
              <div className="flex items-center justify-between text-xs text-text-muted pb-1">
                <span>
                  {query.trim()
                    ? `${results.length} matching culinary creations`
                    : 'Chef Featured Recommendations'}
                </span>
                {recentSearches.length > 0 && !query.trim() && (
                  <span>Recent: {recentSearches.join(' · ')}</span>
                )}
              </div>

              {results.length === 0 ? (
                <EmptyState
                  icon={<UtensilsCrossed className="w-8 h-8" />}
                  title="No dishes found"
                  description={`We couldn't find any dishes matching "${query}". Try searching for Wagyu, Burrata, Saffron, or Desserts.`}
                  actionLabel="Reset Search"
                  onAction={() => setQuery('')}
                  className="py-10"
                />
              ) : (
                results.map((dish, idx) => {
                  const finalPrice = Number((dish.price * (1 - dish.discountPercent / 100)).toFixed(2));
                  const isSelected = selectedIndex === idx;
                  return (
                    <div
                      key={dish.id}
                      role="option"
                      aria-selected={isSelected}
                      className={`flex items-center justify-between gap-4 p-3 rounded-xl transition-[background-color,border-color] duration-150 ${
                        isSelected
                          ? 'bg-green-deep border border-yellow'
                          : 'bg-surface hover:bg-green-deep/30 border border-transparent'
                      }`}
                    >
                      <div
                        onClick={() => handleSelectDish(dish)}
                        className="flex items-center gap-3.5 flex-1 cursor-pointer min-w-0"
                      >
                        <div className="w-16 h-14 rounded-lg overflow-hidden shrink-0">
                          <DishVisual
                            src={dish.image}
                            alt={dish.name}
                            illustrationType={dish.illustrationType}
                            showArtAccent={false}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-text truncate">{dish.name}</p>
                          <p className="text-xs text-text-muted truncate mt-0.5">
                            <span>{dish.categoryName}</span>
                            <span aria-hidden="true"> · </span>
                            <span className={dish.isVeg ? 'text-green-light' : 'text-danger'}>
                              {dish.isVeg ? 'Vegetarian' : 'Non-Veg'}
                            </span>
                            <span aria-hidden="true"> · </span>
                            <span>{dish.prepTimeMinutes} min</span>
                            <span aria-hidden="true"> · </span>
                            <span className="text-yellow">★ {dish.rating.toFixed(1)}</span>
                          </p>
                          <p className="text-[11px] text-text-soft truncate mt-0.5">
                            Ingredients: {dish.ingredients.slice(0, 4).join(', ')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono-tabular text-sm font-semibold text-yellow">
                          ${finalPrice.toFixed(2)}
                        </span>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => addToCart({ foodId: dish.id, quantity: 1 })}
                          className="min-h-[32px] px-3 py-1 text-xs"
                        >
                          + Add
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer link & keyboard shortcuts */}
            <div className="px-5 py-3 bg-surface border-t border-border flex items-center justify-between">
              <span className="text-[11px] text-text-muted">
                <kbd className="px-1.5 py-0.5 rounded bg-green-deep text-text">↑</kbd>{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-green-deep text-text">↓</kbd> navigate ·{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-green-deep text-text">Enter</kbd> select ·{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-green-deep text-text">Esc</kbd> close
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/menu${query ? `?search=${encodeURIComponent(query)}` : ''}`);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-yellow hover:text-yellow-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow rounded px-1"
              >
                <span>Explore Full Menu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
