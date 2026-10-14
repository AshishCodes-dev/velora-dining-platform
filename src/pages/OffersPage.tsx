import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, ArrowRight, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import { useRestaurant } from '../context/RestaurantContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { pageTransitionVariants, staggerContainer, staggerItem } from '../lib/motion';

export const OffersPage: React.FC = () => {
  const { offers, coupons, applyCoupon, showToast } = useRestaurant();
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyAndApply = async (code: string) => {
    setCopiedCode(code);
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // ignore clipboard error
    }
    const ok = await applyCoupon(code);
    if (!ok) {
      showToast(`✓ Code ${code} copied! Add qualifying dishes to cart to redeem.`, 'info');
    }
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12 space-y-14"
    >
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
        <Button
          variant="success"
          size="md"
          onClick={() => navigate('/menu')}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          className="self-start sm:self-auto"
        >
          Browse Menu to Redeem
        </Button>
      </div>

      {/* Featured Promotional Campaigns */}
      <section className="space-y-6">
        <h2 className="font-serif-display text-2xl font-semibold text-text">
          Featured Evening Campaigns
        </h2>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {offers.map((offer) => {
            const isCopied = copiedCode === offer.couponCode;
            return (
              <motion.div key={offer.id} variants={staggerItem}>
                <Card
                  variant="surface"
                  interactive
                  className="h-full flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <Badge variant="yellow" size="sm">
                      {offer.badgeText} · Valid until {offer.validUntil}
                    </Badge>
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
                    <Button
                      variant={isCopied ? 'success' : 'primary'}
                      size="sm"
                      onClick={() => handleCopyAndApply(offer.couponCode)}
                      leftIcon={
                        isCopied ? (
                          <Check className="w-3.5 h-3.5 text-black" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )
                      }
                    >
                      {isCopied ? 'Copied!' : 'Copy & Apply'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Active Coupon Codes Ledger */}
      <section className="space-y-6">
        <h2 className="font-serif-display text-2xl font-semibold text-text">
          Active Coupon Codes
        </h2>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {coupons.map((coup) => {
            const isCopied = copiedCode === coup.code;
            return (
              <motion.div key={coup.id} variants={staggerItem}>
                <Card
                  variant="surface"
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 font-mono-tabular">
                      <span className="text-base font-bold text-yellow">{coup.code}</span>
                      <span className="text-xs text-text-muted">·</span>
                      <span className="text-xs text-green-light font-semibold">
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

                  <Button
                    variant={isCopied ? 'success' : 'outline'}
                    size="sm"
                    onClick={() => handleCopyAndApply(coup.code)}
                    leftIcon={isCopied ? <Check className="w-3.5 h-3.5 text-black" /> : <Tag className="w-3.5 h-3.5" />}
                    className="whitespace-nowrap shrink-0"
                  >
                    {isCopied ? 'Copied!' : 'Apply Code'}
                  </Button>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    </motion.div>
  );
};
