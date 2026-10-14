import React, { useState } from 'react';
import { Tag, ArrowRight } from 'lucide-react';
import type { CartItem, Coupon, RestaurantSettings, OrderType } from '../../types/restaurant';
import { Button } from '../ui/Button';

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
  const [isApplying, setIsApplying] = useState(false);

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    const ok = await onApplyCoupon(couponInput.trim());
    setIsApplying(false);
    if (ok) setCouponInput('');
  };

  return (
    <div className="lg:col-span-5 nocturne-surface rounded-2xl p-6 sm:p-7 space-y-6 lg:sticky lg:top-24">
      <h2 className="font-serif-display text-2xl font-semibold text-text">
        Order Summary
      </h2>

      {/* Coupon Input Box */}
      <div className="space-y-3 pb-5 border-b border-border">
        <label htmlFor="coupon-input" className="block text-xs font-semibold uppercase tracking-wider text-text-soft">
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
              className="text-xs text-danger hover:underline font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-danger rounded px-1"
            >
              Remove
            </button>
          </div>
        ) : (
          <form onSubmit={handleCouponSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Tag className="w-3.5 h-3.5 text-yellow absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="coupon-input"
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Enter code (e.g. WELCOME10)"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-canvas border border-border text-xs font-mono-tabular text-text placeholder-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:border-yellow"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isApplying}
              disabled={!couponInput.trim()}
              className="whitespace-nowrap"
            >
              Apply
            </Button>
          </form>
        )}

        {/* Quick Clickable Coupons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {coupons.slice(0, 4).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onApplyCoupon(c.code)}
              className="px-2.5 py-1 rounded-md bg-elevated hover:bg-surface border border-border text-[11px] font-mono-tabular text-yellow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow"
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
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={activeCartItems.length === 0}
          onClick={() => setStep('checkout')}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Proceed to Checkout
        </Button>
      ) : (
        <div className="space-y-2.5">
          <Button
            type="submit"
            form="checkout-form"
            variant="primary"
            size="lg"
            fullWidth
            loading={placingOrder}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            <span>
              {placingOrder
                ? 'Confirming with Kitchen...'
                : `Confirm & Place Order — $${effectiveGrandTotal.toFixed(2)}`}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="md"
            fullWidth
            onClick={() => setStep('cart')}
          >
            ← Return to Cart
          </Button>
        </div>
      )}
    </div>
  );
};
