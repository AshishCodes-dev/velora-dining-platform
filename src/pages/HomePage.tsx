import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Sparkles, Check } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { FoodCard } from '../components/FoodCard';
import { DishVisual } from '../components/DishVisual';

export const HomePage: React.FC = () => {
  const { foods, categories, offers, loadingCatalog, applyCoupon, showToast } = useRestaurant();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const displayedFoods = useMemo(() => {
    let list = foods.filter((f) => f.isFeatured || f.isPopular);
    if (selectedCategory !== 'All') {
      list = foods.filter(
        (f) => f.categoryName.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    return list.slice(0, 6);
  }, [foods, selectedCategory]);

  const handleClaimOffer = async (code: string) => {
    setCopiedCode(code);
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // ignore clipboard fallback
    }
    await applyCoupon(code);
    showToast(`✓ Coupon ${code} ready for checkout`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-24 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-white/5">
        {/* Decorative 2D Botanical & Celestial Background Shapes */}
        <svg
          aria-hidden="true"
          viewBox="0 0 600 600"
          className="absolute -top-24 -right-24 w-[480px] h-[480px] opacity-20 pointer-events-none"
          fill="none"
        >
          <circle cx="300" cy="300" r="260" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="6 6" />
          <circle cx="300" cy="300" r="190" stroke="#F59E0B" strokeWidth="0.75" />
          <path
            d="M300 40 C340 180, 420 260, 560 300 C420 340, 340 420, 300 560 C260 420, 180 340, 40 300 C180 260, 260 180, 300 40 Z"
            stroke="#EC4899"
            strokeWidth="0.75"
          />
        </svg>

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Editorial Copy & Primary CTAs */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#F59E0B] font-medium">
              <span className="tracking-[0.14em] font-semibold text-[#F5F2FA]">VELORA</span>
              <span aria-hidden="true">·</span>
              <span>Modern Dining. Crafted to Remember.</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#10B981]">Open Tonight until 01:00</span>
            </div>

            <h1 className="font-serif-display text-4xl sm:text-6xl font-semibold text-[#F5F2FA] leading-[1.08] tracking-tight">
              Modern Dining. Crafted to Remember.
            </h1>

            <p className="text-base text-[#B8AFC9] leading-relaxed max-w-xl">
              Welcome to <strong className="text-[#F5F2FA] font-semibold">VELORA</strong>—where wood-fired A5 Miyazaki Wagyu, 72-hour fermented black truffle sourdough, royal copper-sealed Awadhi handis, and botanical patisserie are delivered in heated obsidian vessels or served tableside.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#081C15] font-semibold text-sm transition-colors whitespace-nowrap"
              >
                <span>Order Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/reservations"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#1C142B] hover:bg-[#261B3B] border border-[#8B5CF6]/40 text-[#F5F2FA] font-semibold text-sm transition-colors whitespace-nowrap"
              >
                <Calendar className="w-4 h-4 text-[#8B5CF6]" />
                <span>Reserve a Table</span>
              </Link>
            </div>

            {/* Proof Metrics Row (Tabular Numerals) */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <p className="font-mono-tabular text-2xl font-semibold text-[#F5F2FA]">12.4K+</p>
                <p className="text-xs text-[#7E7394] mt-0.5">Happy Guests in 2026</p>
              </div>
              <div>
                <p className="font-mono-tabular text-2xl font-semibold text-[#F59E0B]">4.9 ★</p>
                <p className="text-xs text-[#7E7394] mt-0.5">1,240+ Verified Reviews</p>
              </div>
              <div>
                <p className="font-mono-tabular text-2xl font-semibold text-[#10B981]">50+</p>
                <p className="text-xs text-[#7E7394] mt-0.5">Artisanal Dishes</p>
              </div>
              <div>
                <p className="font-mono-tabular text-2xl font-semibold text-[#EC4899]">8+ Yrs</p>
                <p className="text-xs text-[#7E7394] mt-0.5">Culinary Excellence</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase + 2D Culinary Frame */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl aspect-[16/10] bg-[#150F20]">
              <DishVisual
                src="/images/hero_signature_platter.webp"
                alt="Velora Wagyu and Saffron Lobster Tasting Platter"
                illustrationType="platter"
              />
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-[#0D0914]/90 backdrop-blur-md border border-white/10 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-[#F59E0B] font-medium">
                    Chef Julian’s Evening Centerpiece · 25 min prep
                  </p>
                  <p className="font-serif-display text-lg font-semibold text-[#F5F2FA]">
                    Velora Wagyu &amp; Saffron Lobster Platter
                  </p>
                </div>
                <Link
                  to="/menu/food-1"
                  className="px-4 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold whitespace-nowrap shrink-0"
                >
                  View Dish · $48.60
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES & FEATURED / POPULAR DISHES */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs text-[#8B5CF6] font-medium">
              01. Curated Culinary Collections
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#F5F2FA] mt-1">
              Featured &amp; Guest-Favorite Creations
            </h2>
          </div>
          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#10B981] hover:underline whitespace-nowrap"
          >
            <span>Explore Complete Menu ({foods.length} Dishes)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Interactive Category Filter Bar */}
        <div
          role="tablist"
          aria-label="Filter featured dishes by category"
          className="flex items-center gap-2 overflow-x-auto pb-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'All'}
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === 'All'
                ? 'bg-[#8B5CF6] text-white'
                : 'bg-[#150F20] text-[#B8AFC9] hover:text-white border border-white/10'
            }`}
          >
            Featured Highlights
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat.name
                  ? 'bg-[#8B5CF6] text-white'
                  : 'bg-[#150F20] text-[#B8AFC9] hover:text-white border border-white/10'
              }`}
            >
              {cat.name} ({cat.dishCount ?? 2})
            </button>
          ))}
        </div>

        {/* Dish Cards Grid */}
        {loadingCatalog ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-96 rounded-2xl bg-[#150F20] border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : displayedFoods.length === 0 ? (
          <div className="p-12 rounded-2xl nocturne-surface text-center space-y-3">
            <p className="font-serif-display text-2xl text-[#F5F2FA]">No dishes in this category yet</p>
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className="px-4 py-2 rounded-lg bg-[#8B5CF6] text-white text-xs font-semibold"
            >
              Show Featured Highlights
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {displayedFoods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        )}
      </section>

      {/* 3. SPECIAL OFFERS & SEASONAL PRIVILEGES */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs text-[#EC4899] font-medium">
              02. Sommelier &amp; Dining Privileges
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#F5F2FA] mt-1">
              Exclusive Evening Offers &amp; Coupons
            </h2>
          </div>
          <Link
            to="/offers"
            className="text-xs font-semibold text-[#8B5CF6] hover:underline whitespace-nowrap"
          >
            View All Active Coupons →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.slice(0, 3).map((offer) => (
            <div
              key={offer.id}
              className="nocturne-surface rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden card-lift"
            >
              {/* 2D Abstract Corner Ornament */}
              <svg
                aria-hidden="true"
                viewBox="0 0 80 80"
                className="absolute top-0 right-0 w-20 h-20 opacity-20 pointer-events-none"
                fill="none"
              >
                <circle cx="80" cy="0" r="60" stroke="#EC4899" strokeWidth="1.5" />
                <circle cx="80" cy="0" r="40" stroke="#F59E0B" strokeWidth="1" />
              </svg>

              <div className="space-y-3">
                <p className="text-xs font-medium text-[#EC4899]">
                  {offer.badgeText} · Valid until {offer.validUntil}
                </p>
                <h3 className="font-serif-display text-2xl font-semibold text-[#F5F2FA]">
                  {offer.title}
                </h3>
                <p className="text-sm font-semibold text-[#F59E0B]">{offer.subtitle}</p>
                <p className="text-xs text-[#B8AFC9] leading-relaxed">{offer.description}</p>
              </div>

              <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-[#7E7394] block">Privilege Code</span>
                  <span className="font-mono-tabular text-sm font-semibold text-[#10B981]">
                    {offer.couponCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleClaimOffer(offer.couponCode)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  {copiedCode === offer.couponCode ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Applied</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Apply Coupon</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. ABOUT RESTAURANT, CHEF CRAFT & ATTRIBUTABLE GUEST TESTIMONIALS */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center nocturne-surface rounded-2xl p-6 sm:p-10">
          <div className="lg:col-span-7 space-y-5">
            <p className="text-xs text-[#F59E0B] font-medium">
              03. Our Culinary Philosophy &amp; Heritage
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#F5F2FA]">
              Crafted Over White Oak Embers, Delivered in Heated Obsidian.
            </h2>
            <p className="text-sm text-[#B8AFC9] leading-relaxed">
              Founded in 2018 by Executive Chef Julian Vance and Head of Spice Chef Ananya Mehra, VELORA bridges classical European wood-fired gastronomy with royal Awadhi slow-cooking and Japanese patisserie precision.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#10B981]">
                  Single-Origin &amp; Biodynamic Sourcing
                </h3>
                <p className="text-xs text-[#B8AFC9] leading-relaxed">
                  A5 Miyazaki Wagyu, 72-hour cold-fermented heritage wheat, Kashmiri saffron threads, and Périgord black winter truffles.
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#8B5CF6]">
                  Temperature-Locked Home Dining
                </h3>
                <p className="text-xs text-[#B8AFC9] leading-relaxed">
                  Every delivery order is sealed in custom ceramic-lined thermal vessels so crusts stay crisp and reductions arrive piping hot.
                </p>
              </div>
            </div>
          </div>

          {/* 2D Culinary Art & Chef Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-white/10">
              <DishVisual
                src="/images/dish_saffron_lamb_biryani.webp"
                alt="Royal Awadhi Saffron Lamb Biryani in hammered copper handi"
                illustrationType="biryani"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-[#B8AFC9] px-1">
              <span>Executive Chef Julian Vance &amp; Chef Ananya Mehra</span>
              <span className="font-mono-tabular text-[#F59E0B]">San Francisco, CA</span>
            </div>
          </div>
        </div>

        {/* Attributable Testimonials (Adjacent to Craft Claims) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <blockquote className="nocturne-surface rounded-2xl p-6 flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-[#F5F2FA] leading-relaxed">
              “Before discovering VELORA, fine-dining delivery always arrived lukewarm with soggy crusts. Their heated obsidian vessels kept our Black Truffle Burrata Pizza and A5 Wagyu medallions at ideal serving temperature 30 minutes across town.”
            </p>
            <footer className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-[#F5F2FA]">Elena Rostova</p>
                <p className="text-[#7E7394]">Principal Architect, Studio Lumina SF</p>
              </div>
              <span className="font-mono-tabular text-[#F59E0B]">5.0 ★</span>
            </footer>
          </blockquote>

          <blockquote className="nocturne-surface rounded-2xl p-6 flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-[#F5F2FA] leading-relaxed">
              “We hosted our executive client dinner in the Private Sommelier Vault. Reserving seats and pre-selecting dietary preferences online took under two minutes, and the 8-hour Saffron Lamb Biryani was unforgettable.”
            </p>
            <footer className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-[#F5F2FA]">Marcus Sterling</p>
                <p className="text-[#7E7394]">Managing Partner, Pacific Heights Ventures</p>
              </div>
              <span className="font-mono-tabular text-[#F59E0B]">5.0 ★</span>
            </footer>
          </blockquote>

          <blockquote className="nocturne-surface rounded-2xl p-6 flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-[#F5F2FA] leading-relaxed">
              “Finding plant-forward haute cuisine that feels indulgent used to be a challenge. VELORA’s Saffron Wild Morel Agnolotti and Velvet Raspberry Yuzu Tart turned our anniversary into a five-star tasting experience.”
            </p>
            <footer className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-[#F5F2FA]">Dr. Camille Laurent</p>
                <p className="text-[#7E7394]">Culinary Critic &amp; Editorial Columnist</p>
              </div>
              <span className="font-mono-tabular text-[#F59E0B]">4.9 ★</span>
            </footer>
          </blockquote>
        </div>
      </section>

      {/* 5. RESERVATION & GALLERY CTA BANNER */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="rounded-2xl bg-gradient-to-r from-[#1F1336] via-[#171026] to-[#11221F] border border-[#8B5CF6]/30 p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs text-[#10B981] font-medium">
              04. Intimate Dining Rooms &amp; Private Vaults
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#F5F2FA]">
              Reserve Your Evening at the Velvet Chef Counter or Garden Terrace.
            </h2>
            <p className="text-sm text-[#B8AFC9]">
              Instant real-time seat confirmation for parties of 1 to 20 guests, complete with custom sommelier pairings and anniversary table styling.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/reservations')}
              className="px-6 py-3.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-semibold transition-colors whitespace-nowrap"
            >
              Book a Table Now
            </button>
            <button
              type="button"
              onClick={() => navigate('/track/10482')}
              className="px-6 py-3.5 rounded-xl border border-white/15 hover:border-white/30 text-[#F5F2FA] text-sm font-semibold transition-colors whitespace-nowrap"
            >
              Track Live Order #10482
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
