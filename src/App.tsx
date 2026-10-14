import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { RestaurantProvider } from './context/RestaurantContext';
import { Navbar } from './components/Navbar';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Spinner } from './components/ui/Spinner';

// Lazy-loaded routes for code splitting
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const MenuPage = lazy(() => import('./pages/MenuPage').then((m) => ({ default: m.MenuPage })));
const FoodDetailsPage = lazy(() => import('./pages/FoodDetailsPage').then((m) => ({ default: m.FoodDetailsPage })));
const OffersPage = lazy(() => import('./pages/OffersPage').then((m) => ({ default: m.OffersPage })));
const CartAndCheckoutPage = lazy(() => import('./pages/CartAndCheckoutPage').then((m) => ({ default: m.CartAndCheckoutPage })));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage').then((m) => ({ default: m.OrderTrackingPage })));
const ReservationsPage = lazy(() => import('./pages/ReservationsPage').then((m) => ({ default: m.ReservationsPage })));
const AuthAndProfilePage = lazy(() => import('./pages/AuthAndProfilePage').then((m) => ({ default: m.AuthAndProfilePage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

function PageLoadingFallback() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 px-4 py-20">
      <Spinner size="lg" variant="yellow" />
      <p className="font-serif-display text-sm tracking-widest text-text-soft uppercase">
        Preparing Culinary Course...
      </p>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/menu/:id" element={<FoodDetailsPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/cart" element={<CartAndCheckoutPage />} />
          <Route path="/checkout" element={<CartAndCheckoutPage />} />
          <Route path="/track" element={<Navigate to="/track/10482" replace />} />
          <Route path="/track/:orderNumber" element={<OrderTrackingPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/profile" element={<AuthAndProfilePage />} />
          <Route path="/login" element={<AuthAndProfilePage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export function App() {
  const [searchOpen, setSearchOpen] = useState(false);

  // Global keyboard shortcut for Cmd/Ctrl+K search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <BrowserRouter>
      <RestaurantProvider>
        <ErrorBoundary>
          <div className="min-h-screen flex flex-col bg-canvas text-text">
            <Navbar onOpenSearch={() => setSearchOpen(true)} />
            <GlobalSearchModal
              isOpen={searchOpen}
              onClose={() => setSearchOpen(false)}
            />
            <div className="flex-1">
              <AnimatedRoutes />
            </div>
            <Footer />
          </div>
        </ErrorBoundary>
      </RestaurantProvider>
    </BrowserRouter>
  );
}

export default App;
