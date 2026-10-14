import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRestaurant } from '../context/RestaurantContext';

export const Footer: React.FC = () => {
  const { settings, showToast } = useRestaurant();
  const [email, setEmail] = useState('');

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      showToast('✕ Please enter a valid email address', 'error');
      return;
    }
    showToast('✓ Subscribed to Private Tasting & Seasonal Invitations', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-surface border-t border-border mt-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand & Story */}
          <div className="space-y-3">
            <Link
              to="/"
              className="font-serif-display text-2xl font-bold tracking-[0.14em] text-text block"
            >
              {settings?.name || 'VELORA'}
            </Link>
            <p className="text-xs font-medium text-yellow tracking-wide">
              {settings?.tagline || 'Modern Dining. Crafted to Remember.'}
            </p>
            <p className="text-xs text-text-soft leading-relaxed">
              Nocturnal hearth gastronomy &amp; botanical mixology crafted with seasonal wood-fired precision.
            </p>
            <p className="text-xs text-text-muted pt-1">
              {settings?.address ||
                '428 Velvet Obsidian Way, Suite 100, Nob Hill, San Francisco, CA 94108'}
            </p>
            <p className="text-xs font-mono-tabular text-text-soft">
              {settings?.phone || '+1 (415) 890-4420'} · {settings?.email || 'concierge@velora.com'}
            </p>
          </div>

          {/* Column 2: Dining & Ordering */}
          <div className="space-y-3">
            <h4 className="font-serif-display text-lg font-semibold text-text">
              Culinary Experience
            </h4>
            <ul className="space-y-2 text-xs text-text-soft">
              <li>
                <Link to="/menu" className="hover:text-text transition-colors">
                  Full Artisanal Menu
                </Link>
              </li>
              <li>
                <Link to="/reservations" className="hover:text-text transition-colors">
                  Table & Vault Reservations
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-text transition-colors">
                  Seasonal Offers & Privileges
                </Link>
              </li>
              <li>
                <Link to="/track/10482" className="hover:text-text transition-colors">
                  Live Order Tracking (#10482)
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-yellow transition-colors">
                  Executive Admin Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Service Hours */}
          <div className="space-y-3">
            <h4 className="font-serif-display text-lg font-semibold text-text">
              Service Hours
            </h4>
            <div className="space-y-2 text-xs text-text-soft font-mono-tabular">
              <p>{settings?.openingHours.weekdays || 'Mon – Thu: 17:00 – 23:30'}</p>
              <p>{settings?.openingHours.weekends || 'Fri – Sun: 12:00 – 01:00'}</p>
              <p className="text-yellow">
                {settings?.openingHours.lateNight || 'Nocturne Tasting: 22:00 – 01:00'}
              </p>
            </div>
            <p className="text-xs text-green-light pt-1">
              Complimentary Obsidian Delivery on orders over ${settings?.freeDeliveryThreshold ?? 65}
            </p>
          </div>

          {/* Column 4: Private Tasting Dispatches */}
          <div className="space-y-3">
            <h4 className="font-serif-display text-lg font-semibold text-text">
              Private Sommelier Dispatch
            </h4>
            <p className="text-xs text-text-soft leading-relaxed">
              Receive invitations to seasonal truffle harvests, chef counter seatings, and private privileges.
            </p>
            <form onSubmit={handleNewsletter} className="flex items-center gap-2 pt-1">
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guest@domain.com"
                className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-elevated border border-border text-xs text-text placeholder-text-muted focus:outline-none focus:border-yellow"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-yellow hover:bg-yellow-hover text-black text-xs font-semibold whitespace-nowrap transition-colors"
              >
                Join List
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} VELORA — Premium Restaurant &amp; Dining Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/menu" className="hover:text-text-soft">
              Dietary & Allergen Guide
            </Link>
            <span>·</span>
            <Link to="/reservations" className="hover:text-text-soft">
              Private Dining Policy
            </Link>
            <span>·</span>
            <Link to="/profile" className="hover:text-text-soft">
              Guest Concierge
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
