import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { DishVisual } from './DishVisual';

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

  const saveRecent = (term: string) => {
    if (!term.trim()) return;
    const updated = [term.trim(), ...recentSearches.filter((r) => r !== term.trim())].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('velora_recent_searches', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleSelectDish = React.useCallback(
    (dish: (typeof results)[0]) => {
      saveRecent(query || dish.name);
      onClose();
      navigate(`/menu/${dish.id}`);
    },
    [query, onClose, navigate]
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

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Culinary Search"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-14 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-[#150F20] border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <Search className="w-5 h-5 text-[#8B5CF6] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by dish name, category, ingredient (e.g. Truffle, Yuzu)..."
            aria-label="Search dishes and ingredients"
            className="w-full bg-transparent text-sm sm:text-base text-[#F5F2FA] placeholder-[#7E7394] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-[#7E7394] hover:text-[#F5F2FA]"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="p-1.5 rounded-lg text-[#B8AFC9] hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggestions & Recent Searches */}
        <div className="px-5 py-3 bg-[#110B1A] border-b border-white/5 flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#7E7394] mr-1">Suggestions:</span>
          {SUGGESTED_TERMS.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setQuery(term);
                saveRecent(term);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                query.toLowerCase() === term.toLowerCase()
                  ? 'bg-[#8B5CF6] text-white'
                  : 'bg-white/5 text-[#B8AFC9] hover:text-white hover:bg-white/10'
              }`}
            >
              {term}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-3" role="listbox">
          <div className="flex items-center justify-between text-xs text-[#7E7394] pb-1">
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
            <div className="py-12 text-center space-y-3">
              <p className="font-serif-display text-2xl text-[#F5F2FA]">No dishes found</p>
              <p className="text-xs text-[#7E7394] max-w-md mx-auto">
                We couldn’t find any dishes matching "{query}". Try searching for Wagyu, Burrata, Saffron, Pasta, or Desserts.
              </p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="px-4 py-2 rounded-lg bg-[#8B5CF6] text-white text-xs font-semibold"
              >
                Reset Search
              </button>
            </div>
          ) : (
            results.map((dish, idx) => {
              const finalPrice = Number((dish.price * (1 - dish.discountPercent / 100)).toFixed(2));
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={dish.id}
                  role="option"
                  aria-selected={isSelected}
                  className={`flex items-center justify-between gap-4 p-3 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-[#2D1F47] border border-[#8B5CF6]'
                      : 'bg-[#1B132A] hover:bg-[#221835] border border-transparent'
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
                      <p className="text-sm font-semibold text-[#F5F2FA] truncate">{dish.name}</p>
                      <p className="text-xs text-[#7E7394] truncate mt-0.5">
                        {dish.categoryName} · {dish.isVeg ? 'Vegetarian' : 'Non-Veg'} · {dish.prepTimeMinutes} min · ★ {dish.rating.toFixed(1)}
                      </p>
                      <p className="text-[11px] text-[#B8AFC9] truncate mt-0.5">
                        Ingredients: {dish.ingredients.slice(0, 4).join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono-tabular text-sm font-semibold text-[#F59E0B]">
                      ${finalPrice.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => addToCart({ foodId: dish.id, quantity: 1 })}
                      className="px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-[#081C15] text-xs font-semibold whitespace-nowrap"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer link & keyboard shortcuts */}
        <div className="px-5 py-3 bg-[#110B1A] border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-[#7E7394]">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[#F5F2FA]">↑</kbd>{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[#F5F2FA]">↓</kbd> navigate ·{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[#F5F2FA]">Enter</kbd> select ·{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[#F5F2FA]">Esc</kbd> close
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(`/menu${query ? `?search=${encodeURIComponent(query)}` : ''}`);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B5CF6] hover:text-[#A855F7]"
          >
            <span>Explore Full Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
