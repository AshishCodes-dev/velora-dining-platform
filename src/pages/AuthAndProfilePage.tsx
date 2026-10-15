import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { useRestaurant } from '../context/RestaurantContext';
import { apiRequest } from '../services/api';
import type { Order, Reservation, Review } from '../types/restaurant';
import { AuthSection } from '../components/auth/AuthSection';
import { UserProfileView, type ProfileTab } from '../components/profile/UserProfileView';
import { Button } from '../components/ui/Button';
import { pageTransitionVariants } from '../lib/motion';

export const AuthAndProfilePage: React.FC = () => {
  const {
    user,
    foods,
    favorites,
    login,
    register,
    demoLogin,
    logout,
    refreshUser,
    saveAddress,
    deleteAddress,
    showToast,
  } = useRestaurant();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const isDemoMode = true;
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);

  // Profile Active Tab
  const initialTab = (searchParams.get('tab') as ProfileTab) || 'overview';
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);

  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t) setActiveTab(t as ProfileTab);
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      apiRequest<{ orders: Order[] }>('/api/orders')
        .then((r) => setOrders(r.orders))
        .catch(() => {});
      apiRequest<{ reservations: Reservation[] }>('/api/reservations')
        .then((r) => setReservations(r.reservations))
        .catch(() => {});
      apiRequest<{ reviews: Review[] }>('/api/reviews/my')
        .then((r) => setMyReviews(r.reviews))
        .catch(() => {});
    }
  }, [user]);

  const selectTab = (tab: ProfileTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleLogin = async (emailInput: string, passInput: string) => {
    try {
      await login(emailInput, passInput);
      showToast('✓ Welcome back to VELORA', 'success');
      navigate('/profile');
    } catch (err) {
      showToast(err instanceof Error ? `✕ ${err.message}` : '✕ Invalid credentials', 'error');
    }
  };

  const handleRegister = async (data: { name: string; email: string; phone: string; password: string }) => {
    try {
      await register(data);
      showToast('✓ Welcome! Your profile is ready', 'success');
      navigate('/profile');
    } catch (err) {
      showToast(err instanceof Error ? `✕ ${err.message}` : '✕ Registration failed', 'error');
    }
  };

  const handleRequestForgot = async (emailInput: string): Promise<string | null> => {
    try {
      const res = await apiRequest<{ message: string; resetToken?: string }>(
        '/api/auth/forgot-password',
        {
          method: 'POST',
          body: JSON.stringify({ email: emailInput }),
        }
      );
      showToast(res.message, 'info');
      return res.resetToken || null;
    } catch (err) {
      showToast(err instanceof Error ? `✕ ${err.message}` : '✕ Error requesting reset', 'error');
      return null;
    }
  };

  const handleResetPassword = async (token: string, newPass: string) => {
    try {
      await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword: newPass }),
      });
      showToast('✓ Password reset successfully! Please sign in.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? `✕ ${err.message}` : '✕ Reset failed', 'error');
    }
  };

  const handleUpdateProfile = async (name: string, phone: string) => {
    try {
      await apiRequest('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, phone }),
      });
      await refreshUser();
      showToast('✓ Profile updated successfully', 'success');
    } catch {
      showToast('✕ Failed to update profile', 'error');
    }
  };

  const handleAddAddress = async (data: {
    label: string;
    houseFlat: string;
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
  }) => {
    try {
      await saveAddress(data);
    } catch {
      showToast('✕ Please complete address fields', 'error');
    }
  };

  const favoriteFoods = foods.filter((f) => favorites.includes(f.id));

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 space-y-10"
    >
      {/* Demo Accounts Bar (Controlled by VITE_DEMO_MODE=true) */}
      {isDemoMode && (
        <div className="nocturne-surface rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-yellow/30">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-yellow shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-text">
                  Demo Accounts
                </p>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-deep text-green-light border border-green-mid">
                  DEMO MODE
                </span>
              </div>
              <p className="text-[11px] text-text-soft">
                One-click access to pre-configured Customer, Staff, and Admin test accounts.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDemoAccounts((prev) => !prev)}
            >
              {showDemoAccounts ? 'Hide Demo Accounts ▲' : 'Demo Accounts ▼'}
            </Button>
            {showDemoAccounts && (
              <>
                <Button
                  variant={user?.role === 'CUSTOMER' ? 'success' : 'outline'}
                  size="sm"
                  onClick={() => demoLogin('CUSTOMER')}
                >
                  Customer (Elena)
                </Button>
                <Button
                  variant={user?.role === 'STAFF' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => demoLogin('STAFF')}
                >
                  Staff (Maître D’)
                </Button>
                <Button
                  variant={user?.role === 'ADMIN' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={async () => {
                    await demoLogin('ADMIN');
                  }}
                >
                  Admin (Chef Julian)
                </Button>
              </>
            )}
            {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/admin')}
              >
                Open Admin Console →
              </Button>
            )}
          </div>
        </div>
      )}

      {/* RENDER AUTH OR PROFILE VIEW */}
      {!user ? (
        <AuthSection
          favoriteFoods={favoriteFoods}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onRequestForgot={handleRequestForgot}
          onResetPassword={handleResetPassword}
        />
      ) : (
        <UserProfileView
          user={user}
          activeTab={activeTab}
          onSelectTab={selectTab}
          orders={orders}
          reservations={reservations}
          favoriteFoods={favoriteFoods}
          myReviews={myReviews}
          onUpdateProfile={handleUpdateProfile}
          onAddAddress={handleAddAddress}
          onDeleteAddress={deleteAddress}
          onLogout={logout}
        />
      )}
    </motion.div>
  );
};
