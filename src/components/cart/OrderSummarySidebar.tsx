import React, { useState } from 'react';
import { Tag, ArrowRight } from 'lucide-react';
import type { CartItem, Coupon, RestaurantSettings, OrderType } from '../../types/restaurant';

interface OrderSummarySidebarProps {
  step: 'cart' | 'checkout';
  setStep: (s: 'cart' | 'checkout') => void;
  activeCartItems: CartItem[];
  cartSubtotal: number;
  discountAmount: number;
  effectiveDeliveryFee: number;
  cartTax: number;
  effectiveGrandTotal: number;
  orderType: OrderType;
  appliedCoupon: Coupon | null;
  coupons: Coupon[];
  settings: RestaurantSettings | null;
  placingOrder: boolean;
  onApplyCoupon: (code: string) => Promise<boolean>;
  onRemoveCoupon: () => void;
}

export const OrderSummarySidebar: React.FC<OrderSummarySidebarProps> = ({
  step,
  setStep,
  activeCartItems,
  cartSubtotal,
  discountAmount,
  effectiveDeliveryFee,
  cartTax,
  effectiveGrandTotal,
  orderType,
  appliedCoupon,
  coupons,
  settings,
  placingOrder,
  onApplyCoupon,
  onRemoveCoupon,
}) => {
  const [couponInput, setCouponInput] = useState('');

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const ok = await onApplyCoupon(couponInput.trim());
    if (ok) setCouponInput('');
  };

  return (
    <div className="lg:col-span-5 nocturne-surface rounded-2xl p-6 sm:p-7 space-y-6 lg:sticky lg:top-24">
      <h2 className="font-serif-display text-2xl font-semibold text-text">
        Order Summary
      </h2>

      {/* Coupon Input Box */}
      <div className="space-y-3 pb-5 border-b border-border">
        <label htmlFor="coupon-input" className="block text-xs font-medium text-text-soft">
          Have a coupon?
        </label>

        {appliedCoupon ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-green-light/15 border border-green-light/40">
            <div>
              <p className="font-mono-tabular text-xs font-bold text-green-light">
                ✓ {appliedCoupon.code} APPLIED
              </p>
              <p className="text-[11px] text-text-soft">
                Saving ${discountAmount.toFixed(2)} on this order
              </p>
            </div>
            <button
              type="button"
              onClick={onRemoveCoupon}
              className="text-xs text-danger hover:underline font-medium"
            >
              Remove
            </button>
          </div>
        ) : (
          <form onSubmit={handleCouponSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Tag className="w-3.5 h-3.5 text-yellow absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="coupon-input"
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Enter code (e.g. WELCOME10)"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-canvas border border-border text-xs font-mono-tabular text-text placeholder-text-muted focus:outline-none focus:border-yellow"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-yellow hover:bg-yellow-hover text-black text-xs font-semibold transition-colors whitespace-nowrap"
            >
              Apply
            </button>
          </form>
        )}

        {/* Quick Clickable Coupons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {coupons.slice(0, 4).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onApplyCoupon(c.code)}
              className="px-2.5 py-1 rounded-md bg-elevated hover:bg-surface border border-border text-[11px] font-mono-tabular text-yellow transition-colors"
            >
              {c.code} (Min ${c.minOrderValue})
            </button>
          ))}
        </div>
      </div>

      {/* Itemized Cost Breakdown */}
      <div className="space-y-3 text-xs font-mono-tabular">
        <div className="flex items-center justify-between text-text-soft">
          <span className="font-sans">Subtotal ({activeCartItems.length} dishes)</span>
          <span>${cartSubtotal.toFixed(2)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-green-light">
            <span className="font-sans">Coupon Discount ({appliedCoupon?.code})</span>
            <span>-${discountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-text-soft">
          <span className="font-sans">
            {orderType === 'Delivery' ? 'Obsidian Heated Delivery' : `${orderType} Service`}
          </span>
          <span>
            {effectiveDeliveryFee === 0 ? (
              <span className="text-green-light">FREE</span>
            ) : (
              `$${effectiveDeliveryFee.toFixed(2)}`
            )}
          </span>
        </div>

        <div className="flex items-center justify-between text-text-soft">
          <span className="font-sans">Culinary Tax ({settings?.taxPercent ?? 9}%)</span>
          <span>${cartTax.toFixed(2)}</span>
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-between text-base font-semibold text-text">
          <span className="font-serif-display text-xl">Grand Total</span>
          <span className="text-yellow">${effectiveGrandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Primary CTA Button */}
      {step === 'cart' ? (
        <button
          type="button"
          disabled={activeCartItems.length === 0}
          onClick={() => setStep('checkout')}
          className="w-full py-3.5 rounded-xl bg-yellow hover:bg-yellow-hover disabled:opacity-40 text-black font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      ) : (
        <div className="space-y-2.5">
          <button
            type="submit"
            form="checkout-form"
            disabled={placingOrder}
            className="w-full py-3.5 rounded-xl bg-yellow hover:bg-yellow-hover text-black font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors"
          >
            <span>
              {placingOrder
                ? 'Confirming with Kitchen...'
                : `Confirm & Place Order — $${effectiveGrandTotal.toFixed(2)}`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setStep('cart')}
            className="w-full py-2.5 rounded-xl border border-border text-xs text-text-soft hover:text-text transition-colors"
          >
            ← Return to Cart
          </button>
        </div>
      )}
    </div>
  );
};
