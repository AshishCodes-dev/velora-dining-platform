import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User as UserIcon, Menu, X, Bell, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRestaurant } from '../context/RestaurantContext';
import { Button } from './ui/Button';

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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header
      className={`sticky top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        isScrolled
          ? 'bg-black/90 backdrop-blur-xl border-b border-border shadow-lg shadow-black/40'
          : 'bg-black/60 backdrop-blur-md border-b border-transparent'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <Link
          to="/"
          className="font-serif-display text-2xl font-bold tracking-[0.14em] text-text whitespace-nowrap shrink-0 hover:text-yellow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow rounded-lg px-1"
        >
          VELORA
        </Link>

        {/* Zone 2: 5 clean navigation links with animated indicator */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-7 text-sm font-medium">
          {navLinks.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative whitespace-nowrap shrink-0 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow rounded-md ${
                  active ? 'text-text' : 'text-text-soft hover:text-text'
                }`}
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="navbarActiveIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="icon"
            size="sm"
            onClick={onOpenSearch}
            aria-label="Search dishes, ingredients, or categories"
            className="text-text-soft hover:text-text"
          >
            <Search className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            to="/profile?tab=favorites"
            aria-label={`Favorites (${favorites.length})`}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-text-soft hover:text-text"
          >
            <Heart className="w-4 h-4 text-yellow fill-yellow/20" />
            <span className="font-mono-tabular">{favorites.length}</span>
          </Button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <Button
              variant="icon"
              size="sm"
              onClick={() => setNotifOpen((prev) => !prev)}
              aria-label={`Notifications (${unreadCount} unread)`}
              className="relative text-text-soft hover:text-text"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-yellow animate-pulse" />
              )}
            </Button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-elevated border border-border shadow-2xl p-4 z-50"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <span className="text-sm font-semibold text-text">
                      Notifications ({unreadCount} unread)
                    </span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => markAllNotificationsRead()}
                        className="text-xs text-yellow hover:underline whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow rounded px-1"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-border mt-1">
                    {notifications.length === 0 ? (
                      <p className="py-6 text-center text-xs text-text-muted">
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
                            !n.read ? 'bg-yellow/10' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-text">{n.title}</p>
                            <span className="text-[11px] font-mono-tabular text-text-muted">
                              {new Date(n.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-text-soft mt-1 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cart Button with animated bounce badge */}
          <Button
            variant="primary"
            size="sm"
            to="/cart"
            aria-label={`Cart with ${cartCount} items`}
            className="gap-1.5 sm:gap-2 px-2.5 sm:px-3.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            <motion.span
              key={cartCount}
              initial={{ scale: 0.8 }}
              animate={{ scale: [1, 1.35, 0.95, 1] }}
              transition={{ duration: 0.3 }}
              className="font-mono-tabular font-bold"
            >
              ({cartCount})
            </motion.span>
          </Button>

          {/* Profile Button */}
          <Button
            variant="outline"
            size="sm"
            to="/profile"
            leftIcon={<UserIcon className="w-3.5 h-3.5 text-yellow" />}
            className="hidden sm:inline-flex max-w-[130px] truncate"
          >
            <span className="truncate">
              {user ? user.name.split(' ')[0] : 'Sign In'}
            </span>
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="icon"
            size="sm"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="md:hidden text-text hover:bg-white/5"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-surface border-b border-border px-4 pt-3 pb-5 space-y-2 overflow-hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-yellow/20 text-yellow'
                    : 'text-text-soft hover:text-text hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
              <Button
                variant="primary"
                size="sm"
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1"
              >
                {user ? `Profile (${user.name.split(' ')[0]})` : 'Sign In / Register'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                to="/profile?tab=favorites"
                onClick={() => setMobileMenuOpen(false)}
              >
                Favorites ({favorites.length})
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
