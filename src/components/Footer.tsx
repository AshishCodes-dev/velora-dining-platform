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
    <footer className="bg-[#09060E] border-t border-white/10 mt-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand & Story */}
          <div className="space-y-3">
            <Link
              to="/"
              className="font-serif-display text-2xl font-bold tracking-[0.14em] text-[#F5F2FA] block"
            >
              {settings?.name || 'VELORA'}
            </Link>
            <p className="text-xs font-medium text-[#F59E0B] tracking-wide">
              {settings?.tagline || 'Modern Dining. Crafted to Remember.'}
            </p>
            <p className="text-xs text-[#B8AFC9] leading-relaxed">
              Nocturnal hearth gastronomy &amp; botanical mixology crafted with seasonal wood-fired precision.
            </p>
            <p className="text-xs text-[#7E7394] pt-1">
              {settings?.address ||
                '428 Velvet Obsidian Way, Suite 100, Nob Hill, San Francisco, CA 94108'}
            </p>
            <p className="text-xs font-mono-tabular text-[#B8AFC9]">
              {settings?.phone || '+1 (415) 890-4420'} · {settings?.email || 'concierge@velora.com'}
            </p>
          </div>

          {/* Column 2: Dining & Ordering */}
          <div className="space-y-3">
            <h4 className="font-serif-display text-lg font-semibold text-[#F5F2FA]">
              Culinary Experience
            </h4>
            <ul className="space-y-2 text-xs text-[#B8AFC9]">
              <li>
                <Link to="/menu" className="hover:text-[#F5F2FA] transition-colors">
                  Full Artisanal Menu
                </Link>
              </li>
              <li>
                <Link to="/reservations" className="hover:text-[#F5F2FA] transition-colors">
                  Table & Vault Reservations
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-[#F5F2FA] transition-colors">
                  Seasonal Offers & Privileges
                </Link>
              </li>
              <li>
                <Link to="/track/10482" className="hover:text-[#F5F2FA] transition-colors">
                  Live Order Tracking (#10482)
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-[#8B5CF6] transition-colors">
                  Executive Admin Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Service Hours */}
          <div className="space-y-3">
            <h4 className="font-serif-display text-lg font-semibold text-[#F5F2FA]">
              Service Hours
            </h4>
            <div className="space-y-2 text-xs text-[#B8AFC9] font-mono-tabular">
              <p>{settings?.openingHours.weekdays || 'Mon – Thu: 17:00 – 23:30'}</p>
              <p>{settings?.openingHours.weekends || 'Fri – Sun: 12:00 – 01:00'}</p>
              <p className="text-[#F59E0B]">
                {settings?.openingHours.lateNight || 'Nocturne Tasting: 22:00 – 01:00'}
              </p>
            </div>
            <p className="text-xs text-[#10B981] pt-1">
              Complimentary Obsidian Delivery on orders over ${settings?.freeDeliveryThreshold ?? 65}
            </p>
          </div>

          {/* Column 4: Private Tasting Dispatches */}
          <div className="space-y-3">
            <h4 className="font-serif-display text-lg font-semibold text-[#F5F2FA]">
              Private Sommelier Dispatch
            </h4>
            <p className="text-xs text-[#B8AFC9] leading-relaxed">
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
                className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-[#150F20] border border-white/10 text-xs text-[#F5F2FA] placeholder-[#7E7394] focus:outline-none focus:border-[#8B5CF6]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold whitespace-nowrap transition-colors"
              >
                Join List
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7E7394]">
          <p>© {new Date().getFullYear()} VELORA — Premium Restaurant &amp; Dining Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/menu" className="hover:text-[#B8AFC9]">
              Dietary & Allergen Guide
            </Link>
            <span>·</span>
            <Link to="/reservations" className="hover:text-[#B8AFC9]">
              Private Dining Policy
            </Link>
            <span>·</span>
            <Link to="/profile" className="hover:text-[#B8AFC9]">
              Guest Concierge
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
