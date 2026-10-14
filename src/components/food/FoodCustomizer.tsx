import React from 'react';
import { Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import { motion } from 'motion/react';
import type { Food, CustomizationAddon } from '../../types/restaurant';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';

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
          <span className="text-xs text-green-light font-medium">Required</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {food.sizes.map((s) => {
            const active = selectedSize === s.name;
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => setSelectedSize(s.name)}
                className={`p-3.5 rounded-xl border text-left transition-[background-color,border-color,transform] duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow cursor-pointer ${
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
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-xs transition-[background-color,border-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow cursor-pointer ${
                    checked
                      ? 'bg-yellow/10 border-yellow text-text'
                      : 'bg-canvas border-border text-text-soft hover:border-border-accent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                        checked
                          ? 'bg-yellow border-yellow text-black'
                          : 'border-border'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 text-black stroke-[3]" />}
                    </span>
                    <span className="font-medium text-text">{addon.name}</span>
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
          className="block text-xs font-semibold uppercase tracking-wider text-text-soft"
        >
          Special Kitchen Note (Allergies, Spice Adjustment, Plating)
        </label>
        <input
          id="special-notes"
          type="text"
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          placeholder="e.g., Sauce on the side, extra crispy crust, nut allergy..."
          className="w-full px-4 py-2.5 rounded-lg bg-canvas border border-border text-xs text-text placeholder:text-text-muted transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:border-yellow"
        />
      </div>

      {/* 4. Quantity Stepper & Dynamic Add to Cart CTA */}
      <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex items-center justify-between sm:justify-start gap-3 px-3 py-2 rounded-lg bg-canvas border border-border">
          {quantity <= 1 ? (
            <Tooltip content="Minimum 1 portion">
              <motion.button
                type="button"
                disabled
                aria-label="Decrease quantity"
                className="p-1.5 text-text-muted/40 cursor-not-allowed rounded"
              >
                <Minus className="w-4 h-4" />
              </motion.button>
            </Tooltip>
          ) : (
            <motion.button
              type="button"
              whileTap={{ scale: 0.88 }}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="p-1.5 text-text-soft hover:text-text hover:bg-white/5 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow"
            >
              <Minus className="w-4 h-4" />
            </motion.button>
          )}

          <span className="font-mono-tabular text-sm font-semibold text-text w-6 text-center select-none">
            {quantity}
          </span>

          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Increase quantity"
            className="p-1.5 text-text-soft hover:text-text hover:bg-white/5 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={onAddToCart}
          leftIcon={<ShoppingBag className="w-4 h-4" />}
          className="flex-1"
        >
          <span className="font-mono-tabular">
            Add to Cart — ${totalPrice.toFixed(2)}
          </span>
        </Button>
      </div>
    </div>
  );
};
