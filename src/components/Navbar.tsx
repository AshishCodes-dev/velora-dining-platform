import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User as UserIcon, Menu, X, Bell, Heart } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';

interface NavbarProps {
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const {
    user,
    cartCount,
    favorites,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useRestaurant();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const navLinks = [
    { label: 'Menu', to: '/menu' },
    { label: 'Reservations', to: '/reservations' },
    { label: 'Offers', to: '/offers' },
    { label: 'Track Order', to: '/track/10482' },
    { label: 'Admin', to: '/admin' },
  ];

  const isActive = (path: string) => {
    if (path.startsWith('/track')) return location.pathname.startsWith('/track');
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header className="sticky top-0 z-40 nocturne-glass">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <Link
          to="/"
          className="font-serif-display text-2xl font-bold tracking-[0.14em] text-[#F5F2FA] whitespace-nowrap shrink-0"
        >
          VELORA
        </Link>

        {/* Zone 2: 5 clean single-line navigation links */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-7 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 ${
                isActive(link.to)
                  ? 'text-[#F5F2FA] border-[#8B5CF6]'
                  : 'text-[#B8AFC9] border-transparent hover:text-[#F5F2FA]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Zone 3: Primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search dishes, ingredients, or categories"
            className="p-2.5 rounded-lg text-[#B8AFC9] hover:text-[#F5F2FA] hover:bg-white/5 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>

          <Link
            to="/profile?tab=favorites"
            aria-label={`Favorites (${favorites.length})`}
            className="hidden sm:flex items-center gap-1.5 p-2.5 rounded-lg text-[#B8AFC9] hover:text-[#F5F2FA] hover:bg-white/5 transition-colors"
          >
            <Heart className="w-4 h-4 text-[#EC4899]" />
            <span className="font-mono-tabular text-xs">{favorites.length}</span>
          </Link>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen((prev) => !prev)}
              aria-label={`Notifications (${unreadCount} unread)`}
              className="relative p-2.5 rounded-lg text-[#B8AFC9] hover:text-[#F5F2FA] hover:bg-white/5 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EC4899]" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#161024] border border-white/10 shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-sm font-semibold text-[#F5F2FA]">
                    Notifications ({unreadCount} unread)
                  </span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => markAllNotificationsRead()}
                      className="text-xs text-[#8B5CF6] hover:underline whitespace-nowrap"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-white/5 mt-1">
                  {notifications.length === 0 ? (
                    <p className="py-6 text-center text-xs text-[#7E7394]">
                      No notifications right now.
                    </p>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          setNotifOpen(false);
                          if (n.link) navigate(n.link);
                        }}
                        className={`py-3 px-2 cursor-pointer rounded-lg hover:bg-white/5 transition-colors ${
                          !n.read ? 'bg-[#8B5CF6]/10' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-[#F5F2FA]">{n.title}</p>
                          <span className="text-[11px] font-mono-tabular text-[#7E7394]">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-[#B8AFC9] mt-1 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <Link
            to="/cart"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-[#081C15] font-semibold text-xs transition-colors whitespace-nowrap shrink-0"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart</span>
            <span className="font-mono-tabular font-bold">({cartCount})</span>
          </Link>

          <Link
            to="/profile"
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/15 hover:border-[#8B5CF6] text-xs font-medium text-[#F5F2FA] transition-colors whitespace-nowrap shrink-0"
          >
            <UserIcon className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span className="max-w-[110px] truncate">
              {user ? user.name.split(' ')[0] : 'Sign In'}
            </span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2.5 rounded-lg text-[#F5F2FA] hover:bg-white/5"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#130D1E] border-b border-white/10 px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                isActive(link.to)
                  ? 'bg-[#8B5CF6]/20 text-[#F5F2FA]'
                  : 'text-[#B8AFC9] hover:text-[#F5F2FA] hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2.5 rounded-lg bg-[#8B5CF6] text-white text-xs font-semibold"
            >
              {user ? `Profile (${user.name.split(' ')[0]})` : 'Sign In / Register'}
            </Link>
            <Link
              to="/profile?tab=favorites"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-lg border border-white/15 text-xs font-medium text-[#F5F2FA]"
            >
              Favorites ({favorites.length})
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
