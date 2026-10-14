import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { apiRequest, getStoredToken, setStoredToken } from '../services/api';
import type {
  User,
  Food,
  Category,
  CartItem,
  Coupon,
  Offer,
  NotificationItem,
  RestaurantSettings,
  CustomizationAddon,
  Address,
} from '../types/restaurant';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface RestaurantContextType {
  user: User | null;
  isLoadingAuth: boolean;
  foods: Food[];
  categories: Category[];
  offers: Offer[];
  coupons: Coupon[];
  settings: RestaurantSettings | null;
  loadingCatalog: boolean;
  cartItems: CartItem[];
  activeCartItems: CartItem[];
  savedCartItems: CartItem[];
  appliedCoupon: Coupon | null;
  discountAmount: number;
  cartSubtotal: number;
  cartDeliveryFee: number;
  cartTax: number;
  cartGrandTotal: number;
  cartCount: number;
  favorites: string[];
  notifications: NotificationItem[];
  unreadCount: number;
  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: { name: string; email: string; phone: string; password: string }) => Promise<User>;
  demoLogin: (role: 'CUSTOMER' | 'STAFF' | 'ADMIN') => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshCatalog: () => Promise<void>;
  refreshCart: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  addToCart: (payload: {
    foodId: string;
    selectedSize?: 'Regular' | 'Large' | 'Family';
    selectedAddons?: CustomizationAddon[];
    quantity?: number;
    specialInstructions?: string;
  }) => Promise<void>;
  updateCartItem: (id: string, updates: { quantity?: number; savedForLater?: boolean }) => Promise<void>;
  removeCartItem: (id: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  toggleFavorite: (foodId: string) => Promise<void>;
  isFavorite: (foodId: string) => boolean;
  saveAddress: (addr: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState<boolean>(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [guestFavorites, setGuestFavorites] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('an_guest_favs');
      return raw ? JSON.parse(raw) : ['food-1', 'food-2'];
    } catch {
      return ['food-1', 'food-2'];
    }
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-3), { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshCatalog = useCallback(async () => {
    try {
      setLoadingCatalog(true);
      const [foodsRes, catsRes, offersRes, coupsRes, settingsRes] = await Promise.all([
        apiRequest<{ foods: Food[] }>('/api/foods'),
        apiRequest<{ categories: Category[] }>('/api/categories'),
        apiRequest<{ offers: Offer[] }>('/api/offers'),
        apiRequest<{ coupons: Coupon[] }>('/api/coupons'),
        apiRequest<{ settings: RestaurantSettings }>('/api/settings'),
      ]);
      setFoods(foodsRes.foods);
      setCategories(catsRes.categories);
      setOffers(offersRes.offers);
      setCoupons(coupsRes.coupons);
      setSettings(settingsRes.settings);
    } catch (err) {
      console.error('Failed to load catalog:', err);
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      const res = await apiRequest<{ items: CartItem[] }>('/api/cart');
      setCartItems(res.items || []);
    } catch (err) {
      console.error('Failed to load cart:', err);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const res = await apiRequest<{ notifications: NotificationItem[] }>('/api/notifications');
      setNotifications(res.notifications || []);
    } catch {
      // silent
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setIsLoadingAuth(false);
      return;
    }
    try {
      const res = await apiRequest<{ user: User }>('/api/auth/profile');
      setUser(res.user);
    } catch {
      setStoredToken(null);
      setUser(null);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    refreshCatalog();
  }, [refreshUser, refreshCatalog]);

  useEffect(() => {
    refreshCart();
    refreshNotifications();
  }, [user, refreshCart, refreshNotifications]);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await apiRequest<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(res.token);
    setUser(res.user);
    showToast(`✓ Welcome back, ${res.user.name}`);
    return res.user;
  };

  const register = async (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<User> => {
    const res = await apiRequest<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setStoredToken(res.token);
    setUser(res.user);
    showToast(`✓ Account created for ${res.user.name}`);
    return res.user;
  };

  const demoLogin = async (role: 'CUSTOMER' | 'STAFF' | 'ADMIN'): Promise<User> => {
    const creds =
      role === 'ADMIN'
        ? { email: 'admin@velora.com', password: 'admin123' }
        : role === 'STAFF'
        ? { email: 'staff@velora.com', password: 'staff123' }
        : { email: 'elena@example.com', password: 'customer123' };
    return login(creds.email, creds.password);
  };

  const logout = () => {
    setStoredToken(null);
    setUser(null);
    setAppliedCoupon(null);
    showToast('✓ Signed out successfully', 'info');
  };

  const addToCart = async (payload: {
    foodId: string;
    selectedSize?: 'Regular' | 'Large' | 'Family';
    selectedAddons?: CustomizationAddon[];
    quantity?: number;
    specialInstructions?: string;
  }) => {
    try {
      const res = await apiRequest<{ items: CartItem[] }>('/api/cart', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setCartItems(res.items);
      showToast('✓ Added to cart', 'success');
    } catch (err) {
      showToast(err instanceof Error ? `✕ ${err.message}` : '✕ Something went wrong', 'error');
    }
  };

  const updateCartItem = async (
    id: string,
    updates: { quantity?: number; savedForLater?: boolean }
  ) => {
    try {
      const res = await apiRequest<{ items: CartItem[] }>(`/api/cart/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      setCartItems(res.items);
      if (updates.savedForLater !== undefined) {
        showToast(
          updates.savedForLater ? '✓ Saved for later' : '✓ Moved back to active cart',
          'info'
        );
      }
    } catch {
      showToast('✕ Something went wrong', 'error');
    }
  };

  const removeCartItem = async (id: string) => {
    try {
      const res = await apiRequest<{ items: CartItem[] }>(`/api/cart/${id}`, {
        method: 'DELETE',
      });
      setCartItems(res.items);
      showToast('✓ Removed from cart', 'info');
    } catch {
      showToast('✕ Something went wrong', 'error');
    }
  };

  const activeCartItems = useMemo(
    () => cartItems.filter((i) => !i.savedForLater),
    [cartItems]
  );

  const savedCartItems = useMemo(
    () => cartItems.filter((i) => i.savedForLater),
    [cartItems]
  );

  const cartSubtotal = useMemo(
    () =>
      Number(
        activeCartItems
          .reduce((sum, item) => sum + item.unitFinalPrice * item.quantity, 0)
          .toFixed(2)
      ),
    [activeCartItems]
  );

  const discountAmount = useMemo(() => {
    if (!appliedCoupon || cartSubtotal < appliedCoupon.minOrderValue) return 0;
    let disc =
      appliedCoupon.discountType === 'PERCENTAGE'
        ? (cartSubtotal * appliedCoupon.discountValue) / 100
        : appliedCoupon.discountValue;
    if (appliedCoupon.maxDiscountAmount && disc > appliedCoupon.maxDiscountAmount) {
      disc = appliedCoupon.maxDiscountAmount;
    }
    return Number(Math.min(cartSubtotal, disc).toFixed(2));
  }, [appliedCoupon, cartSubtotal]);

  const cartDeliveryFee = useMemo(() => {
    if (activeCartItems.length === 0) return 0;
    const threshold = settings?.freeDeliveryThreshold ?? 65;
    const fee = settings?.deliveryFee ?? 6;
    return cartSubtotal - discountAmount >= threshold ? 0 : fee;
  }, [activeCartItems.length, cartSubtotal, discountAmount, settings]);

  const cartTax = useMemo(() => {
    const rate = settings?.taxPercent ?? 9;
    const taxable = Math.max(0, cartSubtotal - discountAmount);
    return Number(((taxable * rate) / 100).toFixed(2));
  }, [cartSubtotal, discountAmount, settings]);

  const cartGrandTotal = useMemo(
    () => Number(Math.max(0, cartSubtotal - discountAmount + cartDeliveryFee + cartTax).toFixed(2)),
    [cartSubtotal, discountAmount, cartDeliveryFee, cartTax]
  );

  const cartCount = useMemo(
    () => activeCartItems.reduce((sum, item) => sum + item.quantity, 0),
    [activeCartItems]
  );

  const applyCoupon = async (code: string): Promise<boolean> => {
    try {
      const res = await apiRequest<{ coupon: Coupon; discountAmount: number; message: string }>(
        '/api/coupons/apply',
        {
          method: 'POST',
          body: JSON.stringify({ code, subtotal: cartSubtotal }),
        }
      );
      setAppliedCoupon(res.coupon);
      showToast('✓ Coupon applied', 'success');
      return true;
    } catch (err) {
      showToast(err instanceof Error ? `✕ ${err.message}` : '✕ Invalid coupon', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('✓ Coupon removed', 'info');
  };

  const favorites = user ? user.favorites : guestFavorites;

  const isFavorite = useCallback(
    (foodId: string) => favorites.includes(foodId),
    [favorites]
  );

  const toggleFavorite = async (foodId: string) => {
    if (user) {
      try {
        const res = await apiRequest<{ favorites: string[]; added: boolean }>(
          '/api/auth/favorites',
          {
            method: 'POST',
            body: JSON.stringify({ foodId }),
          }
        );
        setUser((prev) => (prev ? { ...prev, favorites: res.favorites } : prev));
        showToast(res.added ? '✓ Saved to favorites' : '✓ Removed from favorites', 'info');
      } catch {
        showToast('✕ Something went wrong', 'error');
      }
    } else {
      setGuestFavorites((prev) => {
        const exists = prev.includes(foodId);
        const next = exists ? prev.filter((id) => id !== foodId) : [...prev, foodId];
        localStorage.setItem('an_guest_favs', JSON.stringify(next));
        showToast(exists ? '✓ Removed from favorites' : '✓ Saved to favorites', 'info');
        return next;
      });
    }
  };

  const saveAddress = async (addr: Partial<Address>) => {
    const res = await apiRequest<{ addresses: Address[] }>('/api/auth/addresses', {
      method: 'POST',
      body: JSON.stringify(addr),
    });
    setUser((prev) => (prev ? { ...prev, addresses: res.addresses } : prev));
    showToast('✓ Address saved to profile', 'success');
  };

  const deleteAddress = async (id: string) => {
    const res = await apiRequest<{ addresses: Address[] }>(`/api/auth/addresses/${id}`, {
      method: 'DELETE',
    });
    setUser((prev) => (prev ? { ...prev, addresses: res.addresses } : prev));
    showToast('✓ Address removed', 'info');
  };

  const markNotificationRead = async (id: string) => {
    await apiRequest(`/api/notifications/${id}/read`, { method: 'PATCH' });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = async () => {
    await apiRequest('/api/notifications/read-all', { method: 'POST' });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  return (
    <RestaurantContext.Provider
      value={{
        user,
        isLoadingAuth,
        foods,
        categories,
        offers,
        coupons,
        settings,
        loadingCatalog,
        cartItems,
        activeCartItems,
        savedCartItems,
        appliedCoupon,
        discountAmount,
        cartSubtotal,
        cartDeliveryFee,
        cartTax,
        cartGrandTotal,
        cartCount,
        favorites,
        notifications,
        unreadCount,
        toasts,
        showToast,
        dismissToast,
        login,
        register,
        demoLogin,
        logout,
        refreshUser,
        refreshCatalog,
        refreshCart,
        refreshNotifications,
        addToCart,
        updateCartItem,
        removeCartItem,
        applyCoupon,
        removeCoupon,
        toggleFavorite,
        isFavorite,
        saveAddress,
        deleteAddress,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}

      {/* Accessible Global Toast Stack */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => dismissToast(t.id)}
            className={`pointer-events-auto cursor-pointer flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-xl transition-all duration-150 ${
              t.type === 'error'
                ? 'bg-danger/15 border-danger/40 text-danger'
                : t.type === 'info'
                ? 'bg-yellow/15 border-yellow/40 text-yellow'
                : 'bg-green-deep border-green-mid/50 text-green-light'
            }`}
          >
            <span className="text-sm font-medium">{t.text}</span>
            <span className="text-xs opacity-60 hover:opacity-100">Dismiss</span>
          </div>
        ))}
      </div>
    </RestaurantContext.Provider>
  );
};

export function useRestaurant() {
  const ctx = useContext(RestaurantContext);
  if (!ctx) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return ctx;
}
