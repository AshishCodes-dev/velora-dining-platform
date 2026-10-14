import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';

const getAccentClasses = (accentColor?: string) => {
  switch (accentColor) {
    case 'emerald':
      return {
        badge: 'bg-green-light/10 border-green-light/30 text-green-light',
        btn: 'bg-green-light hover:bg-green-mid text-black',
      };
    case 'pink':
      return {
        badge: 'bg-green-deep/30 border-green-mid/30 text-green-light',
        btn: 'bg-green-mid hover:bg-green-deep text-text',
      };
    case 'gold':
      return {
        badge: 'bg-yellow/10 border-yellow/30 text-yellow',
        btn: 'bg-yellow hover:bg-yellow-hover text-black',
      };
    case 'purple':
    default:
      return {
        badge: 'bg-yellow/10 border-yellow/30 text-yellow',
        btn: 'bg-yellow hover:bg-yellow-hover text-black',
      };
  }
};

export const OffersPage: React.FC = () => {
  const { offers, coupons, applyCoupon, showToast } = useRestaurant();
  const navigate = useNavigate();
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const handleApply = async (code: string) => {
    setAppliedCode(code);
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // ignore
    }
    const ok = await applyCoupon(code);
    if (!ok) {
      showToast(`✓ Code ${code} copied! Add qualifying dishes to cart to redeem.`, 'info');
    }
    setTimeout(() => setAppliedCode(null), 2500);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12 space-y-14">
      {/* Header */}
      <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs text-yellow font-medium">
            VELORA · Sommelier &amp; Dining Privileges
          </p>
          <h1 className="font-serif-display text-4xl sm:text-5xl font-semibold text-text mt-1">
            Special Offers &amp; Active Coupons
          </h1>
        </div>
        <button
          type="button"
          onClick={() => navigate('/menu')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-light hover:bg-green-mid text-black text-xs font-semibold whitespace-nowrap self-start sm:self-auto transition-colors"
        >
          <span>Browse Menu to Redeem</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Featured Promotional Campaigns */}
      <section className="space-y-6">
        <h2 className="font-serif-display text-2xl font-semibold text-text">
          Featured Evening Campaigns
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer) => {
            const accent = getAccentClasses(offer.accentColor);
            return (
              <div
                key={offer.id}
                className="nocturne-surface rounded-2xl p-6 flex flex-col justify-between card-lift"
              >
                <div className="space-y-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-medium ${accent.badge}`}>
                    {offer.badgeText} · Valid until {offer.validUntil}
                  </span>
                  <h3 className="font-serif-display text-2xl font-semibold text-text">
                    {offer.title}
                  </h3>
                  <p className="text-sm font-semibold text-yellow">{offer.subtitle}</p>
                  <p className="text-xs text-text-soft leading-relaxed">{offer.description}</p>
                </div>
                <div className="pt-6 mt-6 border-t border-border flex items-center justify-between">
                  <span className="font-mono-tabular text-sm font-semibold text-green-light">
                    {offer.couponCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleApply(offer.couponCode)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${accent.btn}`}
                  >
                    {appliedCode === offer.couponCode ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied &amp; Applied</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Copy &amp; Apply</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Active Coupon Codes Ledger */}
      <section className="space-y-6">
        <h2 className="font-serif-display text-2xl font-semibold text-text">
          Active Coupon Codes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coupons.map((coup) => (
            <div
              key={coup.id}
              className="nocturne-surface rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3 font-mono-tabular">
                  <span className="text-base font-bold text-yellow">{coup.code}</span>
                  <span className="text-xs text-text-muted">·</span>
                  <span className="text-xs text-green-light">
                    {coup.discountType === 'PERCENTAGE'
                      ? `${coup.discountValue}% OFF`
                      : `$${coup.discountValue} FLAT OFF`}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-text">{coup.title}</h3>
                <p className="text-xs text-text-soft">{coup.description}</p>
                <p className="text-[11px] font-mono-tabular text-text-muted">
                  Min Order: ${coup.minOrderValue}
                  {coup.maxDiscountAmount ? ` · Max Discount: $${coup.maxDiscountAmount}` : ''} ·
                  Expires: {coup.expiryDate}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleApply(coup.code)}
                className="px-4 py-2.5 rounded-xl bg-elevated hover:bg-yellow hover:text-black border border-yellow/40 text-text text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                {appliedCode === coup.code ? '✓ Applied' : 'Apply Code'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
