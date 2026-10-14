import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';

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
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs text-[#EC4899] font-medium">
            VELORA · Sommelier &amp; Dining Privileges
          </p>
          <h1 className="font-serif-display text-4xl sm:text-5xl font-semibold text-[#F5F2FA] mt-1">
            Special Offers &amp; Active Coupons
          </h1>
        </div>
        <button
          type="button"
          onClick={() => navigate('/menu')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#10B981] text-[#081C15] text-xs font-semibold whitespace-nowrap self-start sm:self-auto"
        >
          <span>Browse Menu to Redeem</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Featured Promotional Campaigns */}
      <section className="space-y-6">
        <h2 className="font-serif-display text-2xl font-semibold text-[#F5F2FA]">
          Featured Evening Campaigns
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="nocturne-surface rounded-2xl p-6 flex flex-col justify-between card-lift"
            >
              <div className="space-y-3">
                <p className="text-xs text-[#EC4899] font-medium">
                  {offer.badgeText} · Valid until {offer.validUntil}
                </p>
                <h3 className="font-serif-display text-2xl font-semibold text-[#F5F2FA]">
                  {offer.title}
                </h3>
                <p className="text-sm font-semibold text-[#F59E0B]">{offer.subtitle}</p>
                <p className="text-xs text-[#B8AFC9] leading-relaxed">{offer.description}</p>
              </div>
              <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                <span className="font-mono-tabular text-sm font-semibold text-[#10B981]">
                  {offer.couponCode}
                </span>
                <button
                  type="button"
                  onClick={() => handleApply(offer.couponCode)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold transition-colors"
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
          ))}
        </div>
      </section>

      {/* Active Coupon Codes Ledger */}
      <section className="space-y-6">
        <h2 className="font-serif-display text-2xl font-semibold text-[#F5F2FA]">
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
                  <span className="text-base font-bold text-[#F59E0B]">{coup.code}</span>
                  <span className="text-xs text-[#7E7394]">·</span>
                  <span className="text-xs text-[#10B981]">
                    {coup.discountType === 'PERCENTAGE'
                      ? `${coup.discountValue}% OFF`
                      : `$${coup.discountValue} FLAT OFF`}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-[#F5F2FA]">{coup.title}</h3>
                <p className="text-xs text-[#B8AFC9]">{coup.description}</p>
                <p className="text-[11px] font-mono-tabular text-[#7E7394]">
                  Min Order: ${coup.minOrderValue}
                  {coup.maxDiscountAmount ? ` · Max Discount: $${coup.maxDiscountAmount}` : ''} ·
                  Expires: {coup.expiryDate}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleApply(coup.code)}
                className="px-4 py-2.5 rounded-xl bg-[#1D152C] hover:bg-[#8B5CF6] border border-[#8B5CF6]/40 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
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
