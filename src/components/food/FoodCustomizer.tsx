import React from 'react';
import { Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import type { Food, CustomizationAddon } from '../../types/restaurant';

interface FoodCustomizerProps {
  food: Food;
  selectedSize: 'Regular' | 'Large' | 'Family';
  setSelectedSize: (size: 'Regular' | 'Large' | 'Family') => void;
  selectedAddons: CustomizationAddon[];
  toggleAddon: (addon: CustomizationAddon) => void;
  specialInstructions: string;
  setSpecialInstructions: (val: string) => void;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  unitFinalPrice: number;
  totalPrice: number;
  sizeDelta: number;
  addonsTotal: number;
  onAddToCart: () => void;
}

export const FoodCustomizer: React.FC<FoodCustomizerProps> = ({
  food,
  selectedSize,
  setSelectedSize,
  selectedAddons,
  toggleAddon,
  specialInstructions,
  setSpecialInstructions,
  quantity,
  setQuantity,
  unitFinalPrice,
  totalPrice,
  sizeDelta,
  addonsTotal,
  onAddToCart,
}) => {
  return (
    <div className="lg:col-span-6 nocturne-surface rounded-2xl p-6 sm:p-8 space-y-7">
      <div className="space-y-3 border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-text-soft">
          <span className="text-yellow font-semibold">{food.categoryName}</span>
          <span>·</span>
          <span className={food.isVeg ? 'text-green-light' : 'text-danger'}>
            {food.isVeg ? 'Vegetarian Creation' : 'Signature Protein'}
          </span>
          {food.discountPercent > 0 && (
            <>
              <span>·</span>
              <span className="text-yellow font-semibold">
                {food.discountPercent}% Evening Privilege
              </span>
            </>
          )}
        </div>

        <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-text">
          {food.name}
        </h1>

        <p className="text-sm text-text-soft leading-relaxed">{food.description}</p>

        {/* Dynamic Live Price Display */}
        <div className="pt-2 flex items-baseline gap-3 font-mono-tabular">
          <span className="text-3xl font-semibold text-yellow">
            ${unitFinalPrice.toFixed(2)}
          </span>
          {food.discountPercent > 0 && (
            <span className="text-sm text-text-muted line-through">
              ${(food.price + sizeDelta + addonsTotal).toFixed(2)}
            </span>
          )}
          <span className="text-xs text-text-muted">per customized portion</span>
        </div>
      </div>

      {/* 1. Size Customization */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text">
            Select Portion Size
          </h2>
          <span className="text-xs text-green-light">Required</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {food.sizes.map((s) => {
            const active = selectedSize === s.name;
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => setSelectedSize(s.name)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  active
                    ? 'bg-yellow border-yellow text-black'
                    : 'bg-canvas border-border text-text hover:border-border-accent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{s.name}</span>
                  <span className={`font-mono-tabular text-xs ${active ? 'text-black font-semibold' : 'text-yellow'}`}>
                    {s.priceDelta === 0 ? 'Base' : `+$${s.priceDelta.toFixed(2)}`}
                  </span>
                </div>
                <p className={`text-[11px] mt-1 ${active ? 'text-black/75' : 'text-text-muted'}`}>{s.serves}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Artisanal Add-Ons */}
      {food.addons.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text">
              Sommelier &amp; Kitchen Add-Ons
            </h2>
            <span className="text-xs text-text-muted">Optional enhancements</span>
          </div>
          <div className="space-y-2">
            {food.addons.map((addon) => {
              const checked = selectedAddons.some((a) => a.id === addon.id);
              return (
                <button
                  key={addon.id}
                  type="button"
                  onClick={() => toggleAddon(addon)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-xs transition-colors ${
                    checked
                      ? 'bg-yellow/10 border-yellow text-text'
                      : 'bg-canvas border-border text-text-soft hover:border-border-accent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                        checked
                          ? 'bg-yellow border-yellow text-black'
                          : 'border-border'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3" />}
                    </span>
                    <span className="font-medium">{addon.name}</span>
                  </div>
                  <span className="font-mono-tabular font-semibold text-yellow">
                    +${addon.price.toFixed(2)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Chef Special Notes */}
      <div className="space-y-2">
        <label
          htmlFor="special-notes"
          className="block text-xs font-semibold text-text-soft"
        >
          Special Kitchen Note (Allergies, Spice Adjustment, Plating)
        </label>
        <input
          id="special-notes"
          type="text"
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          placeholder="e.g., Sauce on the side, extra crispy crust, nut allergy..."
          className="w-full px-4 py-2.5 rounded-xl bg-canvas border border-border text-xs text-text placeholder-text-muted focus:outline-none focus:border-yellow"
        />
      </div>

      {/* 4. Quantity Stepper & Dynamic Add to Cart CTA */}
      <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex items-center justify-between sm:justify-start gap-4 px-4 py-2.5 rounded-xl bg-canvas border border-border">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="p-1 text-text-soft hover:text-text"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-mono-tabular text-sm font-semibold text-text w-6 text-center">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Increase quantity"
            className="p-1 text-text-soft hover:text-text"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={onAddToCart}
          className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-yellow hover:bg-yellow-hover text-black font-semibold text-sm transition-colors whitespace-nowrap"
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="font-mono-tabular">
            Add to Cart — ${totalPrice.toFixed(2)}
          </span>
        </button>
      </div>
    </div>
  );
};
