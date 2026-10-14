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
      <div className="space-y-3 border-b border-white/10 pb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#B8AFC9]">
          <span className="text-[#8B5CF6] font-semibold">{food.categoryName}</span>
          <span>·</span>
          <span className={food.isVeg ? 'text-[#10B981]' : 'text-[#F59E0B]'}>
            {food.isVeg ? 'Vegetarian Creation' : 'Signature Protein'}
          </span>
          {food.discountPercent > 0 && (
            <>
              <span>·</span>
              <span className="text-[#EC4899] font-semibold">
                {food.discountPercent}% Evening Privilege
              </span>
            </>
          )}
        </div>

        <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#F5F2FA]">
          {food.name}
        </h1>

        <p className="text-sm text-[#B8AFC9] leading-relaxed">{food.description}</p>

        {/* Dynamic Live Price Display */}
        <div className="pt-2 flex items-baseline gap-3 font-mono-tabular">
          <span className="text-3xl font-semibold text-[#F59E0B]">
            ${unitFinalPrice.toFixed(2)}
          </span>
          {food.discountPercent > 0 && (
            <span className="text-sm text-[#7E7394] line-through">
              ${(food.price + sizeDelta + addonsTotal).toFixed(2)}
            </span>
          )}
          <span className="text-xs text-[#7E7394]">per customized portion</span>
        </div>
      </div>

      {/* 1. Size Customization */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#F5F2FA]">
            Select Portion Size
          </h2>
          <span className="text-xs text-[#10B981]">Required</span>
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
                    ? 'bg-[#8B5CF6]/15 border-[#8B5CF6] text-[#F5F2FA]'
                    : 'bg-[#0D0914] border-white/10 text-[#B8AFC9] hover:border-white/25'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{s.name}</span>
                  <span className="font-mono-tabular text-xs text-[#F59E0B]">
                    {s.priceDelta === 0 ? 'Base' : `+$${s.priceDelta.toFixed(2)}`}
                  </span>
                </div>
                <p className="text-[11px] text-[#7E7394] mt-1">{s.serves}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Artisanal Add-Ons */}
      {food.addons.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#F5F2FA]">
              Sommelier &amp; Kitchen Add-Ons
            </h2>
            <span className="text-xs text-[#7E7394]">Optional enhancements</span>
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
                      ? 'bg-[#10B981]/15 border-[#10B981] text-[#F5F2FA]'
                      : 'bg-[#0D0914] border-white/10 text-[#B8AFC9] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                        checked
                          ? 'bg-[#10B981] border-[#10B981] text-[#081C15]'
                          : 'border-white/25'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3" />}
                    </span>
                    <span className="font-medium">{addon.name}</span>
                  </div>
                  <span className="font-mono-tabular font-semibold text-[#F59E0B]">
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
          className="block text-xs font-semibold text-[#B8AFC9]"
        >
          Special Kitchen Note (Allergies, Spice Adjustment, Plating)
        </label>
        <input
          id="special-notes"
          type="text"
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          placeholder="e.g., Sauce on the side, extra crispy crust, nut allergy..."
          className="w-full px-4 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA] placeholder-[#7E7394] focus:outline-none focus:border-[#8B5CF6]"
        />
      </div>

      {/* 4. Quantity Stepper & Dynamic Add to Cart CTA */}
      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex items-center justify-between sm:justify-start gap-4 px-4 py-2.5 rounded-xl bg-[#0D0914] border border-white/15">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="p-1 text-[#B8AFC9] hover:text-white"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-mono-tabular text-sm font-semibold text-[#F5F2FA] w-6 text-center">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Increase quantity"
            className="p-1 text-[#B8AFC9] hover:text-white"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={onAddToCart}
          className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#081C15] font-semibold text-sm transition-colors whitespace-nowrap"
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
