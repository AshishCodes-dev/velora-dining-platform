import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Sparkles, Check } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { FoodCard } from '../components/FoodCard';
import { DishVisual } from '../components/DishVisual';

const offerAccentBadge: Record<string, string> = {
  purple: 'text-yellow',
  emerald: 'text-green-light',
  pink: 'text-green-light',
  gold: 'text-yellow',
};

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
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-border">
        {/* Decorative 2D Botanical & Celestial Background Shapes */}
        <svg
          aria-hidden="true"
          viewBox="0 0 600 600"
          className="absolute -top-24 -right-24 w-[480px] h-[480px] opacity-20 pointer-events-none"
          fill="none"
        >
          <circle cx="300" cy="300" r="260" className="stroke-yellow" strokeWidth="1" strokeDasharray="6 6" />
          <circle cx="300" cy="300" r="190" className="stroke-green-mid" strokeWidth="0.75" />
          <path
            d="M300 40 C340 180, 420 260, 560 300 C420 340, 340 420, 300 560 C260 420, 180 340, 40 300 C180 260, 260 180, 300 40 Z"
            className="stroke-green-light"
            strokeWidth="0.75"
          />
        </svg>

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Editorial Copy & Primary CTAs */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-yellow font-medium">
              <span className="tracking-[0.14em] font-semibold text-text">VELORA</span>
              <span aria-hidden="true">·</span>
              <span>Modern Dining. Crafted to Remember.</span>
              <span aria-hidden="true">·</span>
              <span className="text-green-light">Open Tonight until 01:00</span>
            </div>

            <h1 className="font-serif-display text-4xl sm:text-6xl font-semibold text-text leading-[1.08] tracking-tight">
              Modern Dining. <span className="text-yellow">Crafted to Remember.</span>
            </h1>

            <p className="text-base text-text-soft leading-relaxed max-w-xl">
              Welcome to <strong className="text-text font-semibold">VELORA</strong>—where wood-fired A5 Miyazaki Wagyu, 72-hour fermented black truffle sourdough, royal copper-sealed Awadhi handis, and botanical patisserie are delivered in heated obsidian vessels or served tableside.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-yellow hover:bg-yellow-hover text-black font-semibold text-sm transition-colors whitespace-nowrap"
              >
                <span>Order Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/reservations"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl border border-green-mid bg-elevated hover:bg-green-deep text-text-soft hover:text-text font-semibold text-sm transition-colors whitespace-nowrap"
              >
                <Calendar className="w-4 h-4 text-yellow" />
                <span>Reserve a Table</span>
              </Link>
            </div>

            {/* Proof Metrics Row (Tabular Numerals) */}
            <div className="pt-6 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <p className="font-mono-tabular text-2xl font-semibold text-text">12.4K+</p>
                <p className="text-xs text-text-muted mt-0.5">Happy Guests in 2026</p>
              </div>
              <div>
                <p className="font-mono-tabular text-2xl font-semibold text-yellow">4.9 ★</p>
                <p className="text-xs text-text-muted mt-0.5">1,240+ Verified Reviews</p>
              </div>
              <div>
                <p className="font-mono-tabular text-2xl font-semibold text-green-light">50+</p>
                <p className="text-xs text-text-muted mt-0.5">Artisanal Dishes</p>
              </div>
              <div>
                <p className="font-mono-tabular text-2xl font-semibold text-yellow">8+ Yrs</p>
                <p className="text-xs text-text-muted mt-0.5">Culinary Excellence</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase + 2D Culinary Frame */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl aspect-[16/10] bg-surface">
              <DishVisual
                src="/images/hero_signature_platter.webp"
                alt="Velora Wagyu and Saffron Lobster Tasting Platter"
                illustrationType="platter"
              />
              <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-green-deep/50 via-canvas/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-canvas/90 backdrop-blur-md border border-border flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-yellow font-medium">
                    Chef Julian’s Evening Centerpiece · 25 min prep
                  </p>
                  <p className="font-serif-display text-lg font-semibold text-text">
                    Velora Wagyu &amp; Saffron Lobster Platter
                  </p>
                </div>
                <Link
                  to="/menu/food-1"
                  className="px-4 py-2 rounded-lg bg-yellow hover:bg-yellow-hover text-black text-xs font-semibold whitespace-nowrap shrink-0 transition-colors"
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
            <p className="text-xs text-yellow font-medium">
              01. Curated Culinary Collections
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-semibold text-text mt-1">
              Featured &amp; Guest-Favorite Creations
            </h2>
          </div>
          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-light hover:underline whitespace-nowrap"
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
                ? 'bg-yellow text-black'
                : 'bg-surface text-text-soft hover:text-text border border-border'
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
                  ? 'bg-yellow text-black'
                  : 'bg-surface text-text-soft hover:text-text border border-border'
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
                className="h-96 rounded-2xl bg-surface border border-border animate-pulse"
              />
            ))}
          </div>
        ) : displayedFoods.length === 0 ? (
          <div className="p-12 rounded-2xl nocturne-surface text-center space-y-3">
            <p className="font-serif-display text-2xl text-text">No dishes in this category yet</p>
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className="px-4 py-2 rounded-lg bg-yellow hover:bg-yellow-hover text-black text-xs font-semibold transition-colors"
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
            <p className="text-xs text-yellow font-medium">
              02. Sommelier &amp; Dining Privileges
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-semibold text-text mt-1">
              Exclusive Evening Offers &amp; Coupons
            </h2>
          </div>
          <Link
            to="/offers"
            className="text-xs font-semibold text-yellow hover:underline whitespace-nowrap"
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
                <circle cx="80" cy="0" r="60" className="stroke-green-mid" strokeWidth="1.5" />
                <circle cx="80" cy="0" r="40" className="stroke-yellow" strokeWidth="1" />
              </svg>

              <div className="space-y-3">
                <p className={`text-xs font-medium ${offerAccentBadge[offer.accentColor] ?? 'text-yellow'}`}>
                  {offer.badgeText} · Valid until {offer.validUntil}
                </p>
                <h3 className="font-serif-display text-2xl font-semibold text-text">
                  {offer.title}
                </h3>
                <p className="text-sm font-semibold text-yellow">{offer.subtitle}</p>
                <p className="text-xs text-text-soft leading-relaxed">{offer.description}</p>
              </div>

              <div className="pt-6 mt-6 border-t border-border flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-text-muted block">Privilege Code</span>
                  <span className="font-mono-tabular text-sm font-semibold text-green-light">
                    {offer.couponCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleClaimOffer(offer.couponCode)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-yellow hover:bg-yellow-hover text-black text-xs font-semibold transition-colors whitespace-nowrap"
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
            <p className="text-xs text-yellow font-medium">
              03. Our Culinary Philosophy &amp; Heritage
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-semibold text-text">
              Crafted Over White Oak Embers, Delivered in Heated Obsidian.
            </h2>
            <p className="text-sm text-text-soft leading-relaxed">
              Founded in 2018 by Executive Chef Julian Vance and Head of Spice Chef Ananya Mehra, VELORA bridges classical European wood-fired gastronomy with royal Awadhi slow-cooking and Japanese patisserie precision.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-green-light">
                  Single-Origin &amp; Biodynamic Sourcing
                </h3>
                <p className="text-xs text-text-soft leading-relaxed">
                  A5 Miyazaki Wagyu, 72-hour cold-fermented heritage wheat, Kashmiri saffron threads, and Périgord black winter truffles.
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-yellow">
                  Temperature-Locked Home Dining
                </h3>
                <p className="text-xs text-text-soft leading-relaxed">
                  Every delivery order is sealed in custom ceramic-lined thermal vessels so crusts stay crisp and reductions arrive piping hot.
                </p>
              </div>
            </div>
          </div>

          {/* 2D Culinary Art & Chef Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-border">
              <DishVisual
                src="/images/dish_saffron_lamb_biryani.webp"
                alt="Royal Awadhi Saffron Lamb Biryani in hammered copper handi"
                illustrationType="biryani"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-text-soft px-1">
              <span>Executive Chef Julian Vance &amp; Chef Ananya Mehra</span>
              <span className="font-mono-tabular text-yellow">San Francisco, CA</span>
            </div>
          </div>
        </div>

        {/* Attributable Testimonials (Adjacent to Craft Claims) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <blockquote className="nocturne-surface rounded-2xl p-6 flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-text leading-relaxed">
              “Before discovering VELORA, fine-dining delivery always arrived lukewarm with soggy crusts. Their heated obsidian vessels kept our Black Truffle Burrata Pizza and A5 Wagyu medallions at ideal serving temperature 30 minutes across town.”
            </p>
            <footer className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-text">Elena Rostova</p>
                <p className="text-text-muted">Principal Architect, Studio Lumina SF</p>
              </div>
              <span className="font-mono-tabular text-yellow">5.0 ★</span>
            </footer>
          </blockquote>

          <blockquote className="nocturne-surface rounded-2xl p-6 flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-text leading-relaxed">
              “We hosted our executive client dinner in the Private Sommelier Vault. Reserving seats and pre-selecting dietary preferences online took under two minutes, and the 8-hour Saffron Lamb Biryani was unforgettable.”
            </p>
            <footer className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-text">Marcus Sterling</p>
                <p className="text-text-muted">Managing Partner, Pacific Heights Ventures</p>
              </div>
              <span className="font-mono-tabular text-yellow">5.0 ★</span>
            </footer>
          </blockquote>

          <blockquote className="nocturne-surface rounded-2xl p-6 flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-text leading-relaxed">
              “Finding plant-forward haute cuisine that feels indulgent used to be a challenge. VELORA’s Saffron Wild Morel Agnolotti and Velvet Raspberry Yuzu Tart turned our anniversary into a five-star tasting experience.”
            </p>
            <footer className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-text">Dr. Camille Laurent</p>
                <p className="text-text-muted">Culinary Critic &amp; Editorial Columnist</p>
              </div>
              <span className="font-mono-tabular text-yellow">4.9 ★</span>
            </footer>
          </blockquote>
        </div>
      </section>

      {/* 5. RESERVATION & GALLERY CTA BANNER */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="rounded-2xl bg-gradient-to-r from-green-deep/40 via-surface to-elevated border border-yellow/30 p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs text-green-light font-medium">
              04. Intimate Dining Rooms &amp; Private Vaults
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-semibold text-text">
              Reserve Your Evening at the Velvet Chef Counter or Garden Terrace.
            </h2>
            <p className="text-sm text-text-soft">
              Instant real-time seat confirmation for parties of 1 to 20 guests, complete with custom sommelier pairings and anniversary table styling.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/reservations')}
              className="px-6 py-3.5 rounded-xl bg-yellow hover:bg-yellow-hover text-black text-sm font-semibold transition-colors whitespace-nowrap"
            >
              Book a Table Now
            </button>
            <button
              type="button"
              onClick={() => navigate('/track/10482')}
              className="px-6 py-3.5 rounded-xl border border-green-mid text-text-soft hover:text-text text-sm font-semibold transition-colors whitespace-nowrap"
            >
              Track Live Order #10482
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
