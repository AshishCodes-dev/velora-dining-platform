import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  FolderKanban,
  Users,
  Calendar,
  Star,
  Ticket,
  Sparkles,
  CreditCard,
  BarChart3,
  Settings,
  UserCheck,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  ShieldAlert,
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { useRestaurant } from '../context/RestaurantContext';
import type {
  AdminAnalyticsData,
  Order,
  OrderStatus,
  Food,
  Reservation,
  ReservationStatus,
  Review,
  Coupon,
  StaffMember,
  PaymentRecord,
  RestaurantSettings,
} from '../types/restaurant';

import { AdminOverviewTab } from '../components/admin/AdminOverviewTab';
import { AdminOrdersTab } from '../components/admin/AdminOrdersTab';
import { AdminMenuTab } from '../components/admin/AdminMenuTab';
import { AdminCategoriesTab } from '../components/admin/AdminCategoriesTab';
import { AdminCustomersTab, type CustomerSummary } from '../components/admin/AdminCustomersTab';
import { AdminReservationsTab } from '../components/admin/AdminReservationsTab';
import { AdminReviewsTab } from '../components/admin/AdminReviewsTab';
import { AdminCouponsTab } from '../components/admin/AdminCouponsTab';
import { AdminOffersTab } from '../components/admin/AdminOffersTab';
import { AdminPaymentsTab } from '../components/admin/AdminPaymentsTab';
import { AdminAnalyticsTab } from '../components/admin/AdminAnalyticsTab';
import { AdminSettingsTab } from '../components/admin/AdminSettingsTab';
import { AdminStaffTab } from '../components/admin/AdminStaffTab';
import { AdminNotificationsTab } from '../components/admin/AdminNotificationsTab';
import { Button } from '../components/ui/Button';

type AdminTab =
  | 'dashboard'
  | 'orders'
  | 'menu'
  | 'categories'
  | 'customers'
  | 'reservations'
  | 'reviews'
  | 'coupons'
  | 'offers'
  | 'payments'
  | 'analytics'
  | 'settings'
  | 'staff'
  | 'notifications';

export const AdminDashboardPage: React.FC = () => {
  const {
    user,
    categories,
    offers,
    settings,
    notifications,
    demoLogin,
    logout,
    refreshCatalog,
    refreshNotifications,
    markAllNotificationsRead,
    showToast,
  } = useRestaurant();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialTab = (searchParams.get('tab') as AdminTab) || 'dashboard';
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Admin Data States
  const [analytics, setAnalytics] = useState<AdminAnalyticsData | null>(null);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [adminFoods, setAdminFoods] = useState<Food[]>([]);
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [adminReservations, setAdminReservations] = useState<Reservation[]>([]);
  const [adminReviews, setAdminReviews] = useState<Review[]>([]);
  const [adminCoupons, setAdminCoupons] = useState<Coupon[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  // Dish Form State (Coordinator)
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [showDishForm, setShowDishForm] = useState(false);

  const isAuthorized = user && (user.role === 'ADMIN' || user.role === 'STAFF');

  const fetchAllAdminData = useCallback(async () => {
    if (!isAuthorized) return;
    try {
      setLoadingAdmin(true);
      const [
        analyticsRes,
        ordersRes,
        foodsRes,
        custRes,
        resvRes,
        revRes,
        coupRes,
        staffRes,
        payRes,
      ] = await Promise.all([
        apiRequest<AdminAnalyticsData>('/api/analytics'),
        apiRequest<{ orders: Order[] }>('/api/orders?all=true'),
        apiRequest<{ foods: Food[] }>('/api/foods?includeUnavailable=true'),
        apiRequest<{ customers: CustomerSummary[] }>('/api/customers'),
        apiRequest<{ reservations: Reservation[] }>('/api/reservations?all=true'),
        apiRequest<{ reviews: Review[] }>('/api/reviews?all=true'),
        apiRequest<{ coupons: Coupon[] }>('/api/coupons?all=true'),
        apiRequest<{ staff: StaffMember[] }>('/api/staff'),
        apiRequest<{ payments: PaymentRecord[] }>('/api/payments'),
      ]);
      setAnalytics(analyticsRes);
      setAdminOrders(ordersRes.orders);
      setAdminFoods(foodsRes.foods);
      setCustomers(custRes.customers);
      setAdminReservations(resvRes.reservations);
      setAdminReviews(revRes.reviews);
      setAdminCoupons(coupRes.coupons);
      setStaffList(staffRes.staff);
      setPayments(payRes.payments);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoadingAdmin(false);
    }
  }, [isAuthorized]);

  useEffect(() => {
    fetchAllAdminData();
  }, [fetchAllAdminData]);

  const selectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Handlers
  const handleOrderStatusUpdate = async (orderNumber: string, status: OrderStatus) => {
    try {
      await apiRequest(`/api/orders/${orderNumber}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      showToast(`✓ Order #${orderNumber} updated to ${status}`);
      await fetchAllAdminData();
    } catch {
      showToast('✕ Failed to update order status', 'error');
    }
  };

  const handleSaveDish = async (e: React.FormEvent, payload: Partial<Food>) => {
    e.preventDefault();
    try {
      if (editingFood) {
        await apiRequest(`/api/foods/${editingFood.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        showToast('✓ Dish updated successfully');
      } else {
        await apiRequest('/api/foods', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showToast('✓ New dish added to menu');
      }
      setShowDishForm(false);
      setEditingFood(null);
      await fetchAllAdminData();
      await refreshCatalog();
    } catch (err) {
      showToast(err instanceof Error ? `✕ ${err.message}` : '✕ Failed to save dish', 'error');
    }
  };

  const handleToggleDishAvailability = async (food: Food) => {
    await apiRequest(`/api/foods/${food.id}`, {
      method: 'PUT',
      body: JSON.stringify({ isAvailable: !food.isAvailable }),
    });
    showToast(`✓ ${food.name} ${!food.isAvailable ? 'enabled' : 'disabled'}`);
    await fetchAllAdminData();
    await refreshCatalog();
  };

  const handleDeleteDish = async (id: string) => {
    await apiRequest(`/api/foods/${id}`, { method: 'DELETE' });
    showToast('✓ Dish deleted', 'info');
    await fetchAllAdminData();
    await refreshCatalog();
  };

  const handleAddCategory = async (name: string, description: string) => {
    await apiRequest('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
    showToast('✓ Category added');
    await refreshCatalog();
  };

  const handleDeleteCategory = async (id: string) => {
    await apiRequest(`/api/categories/${id}`, { method: 'DELETE' });
    await refreshCatalog();
    showToast('✓ Category removed', 'info');
  };

  const handleReservationStatus = async (id: string, status: ReservationStatus) => {
    await apiRequest(`/api/reservations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    showToast(`✓ Reservation marked ${status}`);
    await fetchAllAdminData();
  };

  const handleToggleCustomer = async (id: string) => {
    await apiRequest(`/api/customers/${id}/status`, { method: 'PATCH' });
    showToast('✓ Customer account status updated');
    await fetchAllAdminData();
  };

  const handleCreateCoupon = async (data: {
    code: string;
    title: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    minOrderValue: number;
  }) => {
    await apiRequest('/api/coupons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    showToast('✓ Coupon created');
    await fetchAllAdminData();
    await refreshCatalog();
  };

  const handleToggleCoupon = async (c: Coupon) => {
    await apiRequest(`/api/coupons/${c.id}`, {
      method: 'PUT',
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    showToast(`✓ Coupon ${c.code} ${!c.isActive ? 'activated' : 'deactivated'}`);
    await fetchAllAdminData();
    await refreshCatalog();
  };

  const handleDeleteCoupon = async (id: string) => {
    await apiRequest(`/api/coupons/${id}`, { method: 'DELETE' });
    await fetchAllAdminData();
    await refreshCatalog();
    showToast('✓ Coupon deleted', 'info');
  };

  const handlePublishOffer = async (data: { title: string; subtitle: string; couponCode: string }) => {
    await apiRequest('/api/offers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await refreshCatalog();
    showToast('✓ Promotional offer published');
  };

  const handleDeleteOffer = async (id: string) => {
    await apiRequest(`/api/offers/${id}`, { method: 'DELETE' });
    await refreshCatalog();
    showToast('✓ Offer removed', 'info');
  };

  const handleToggleReviewVisibility = async (rev: Review) => {
    await apiRequest(`/api/reviews/${rev.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: rev.status === 'PUBLISHED' ? 'HIDDEN' : 'PUBLISHED',
      }),
    });
    await fetchAllAdminData();
    showToast('✓ Review visibility updated');
  };

  const handleDeleteReview = async (id: string) => {
    await apiRequest(`/api/reviews/${id}`, { method: 'DELETE' });
    await fetchAllAdminData();
    showToast('✓ Review deleted', 'info');
  };

  const handleSaveSettings = async (settingsData: Partial<RestaurantSettings>) => {
    await apiRequest('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
    showToast('✓ Restaurant settings saved');
    await refreshCatalog();
  };

  const handleAddStaff = async (data: {
    name: string;
    roleTitle: string;
    department: StaffMember['department'];
    email: string;
    phone: string;
  }) => {
    await apiRequest('/api/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await fetchAllAdminData();
    showToast('✓ Staff member added');
  };

  const handleToggleStaffStatus = async (id: string) => {
    await apiRequest(`/api/staff/${id}/status`, { method: 'PATCH' });
    await fetchAllAdminData();
  };

  // If visitor is not yet logged in as ADMIN or STAFF, show 1-click Admin Gate
  if (!isAuthorized) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20">
        <div className="nocturne-surface rounded-2xl p-8 text-center space-y-5 border border-yellow/40">
          <ShieldAlert className="w-10 h-10 text-yellow mx-auto" />
          <h1 className="font-serif-display text-3xl font-semibold text-text">
            Executive Restaurant Admin Console
          </h1>
          <p className="text-xs sm:text-sm text-text-soft leading-relaxed">
            This workspace is protected by Role-Based Access Control (ADMIN / STAFF). Click below to sign in instantly as Executive Chef Julian Vance (Admin) or Maître D’ Sora Takahashi (Staff).
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => demoLogin('ADMIN')}
              className="w-full sm:w-auto"
            >
              Sign In as Executive Admin
            </Button>
            <Button
              variant="success"
              size="lg"
              onClick={() => demoLogin('STAFF')}
              className="w-full sm:w-auto"
            >
              Sign In as Staff Member
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const sidebarItems: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'menu', label: 'Menu Management', icon: UtensilsCrossed },
    { id: 'categories', label: 'Categories', icon: FolderKanban },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'reservations', label: 'Reservations', icon: Calendar },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'coupons', label: 'Coupons', icon: Ticket },
    { id: 'offers', label: 'Offers', icon: Sparkles },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Restaurant Settings', icon: Settings },
    { id: 'staff', label: 'Staff Management', icon: UserCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row">
      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`bg-canvas border-r border-border p-4 transition-[width,padding] duration-200 ease-out shrink-0 ${
          sidebarCollapsed ? 'w-full md:w-20' : 'w-full md:w-64'
        }`}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="font-serif-display font-bold text-sm tracking-wider text-text truncate">
                VELORA OPS
              </p>
              <p className="text-[11px] text-text-muted truncate">
                Role: {user?.role} · {user?.name.split(' ')[0]}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-white/5 hidden md:block shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow cursor-pointer"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        <nav aria-label="Admin Navigation" className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectTab(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-[background-color,color] duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow cursor-pointer ${
                  active
                    ? 'bg-yellow text-black font-semibold'
                    : 'text-text-soft hover:text-text hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-text-soft hover:text-text hover:bg-white/5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow cursor-pointer"
          >
            <Users className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Profile</span>}
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-danger hover:bg-white/5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </nav>
      </aside>

      {/* MAIN ADMIN CONTENT VIEWPORT */}
      <main className="flex-1 p-4 sm:p-8 max-w-[1400px] w-full mx-auto space-y-8 overflow-x-hidden">
        {/* Top Bar Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="text-xs text-text-muted font-mono-tabular">
              Admin Console / {activeTab.toUpperCase()}
            </p>
            <h1 className="font-serif-display text-3xl font-semibold text-text mt-0.5 capitalize">
              {sidebarItems.find((i) => i.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAllAdminData}
              loading={loadingAdmin}
            >
              Sync Telemetry
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingFood(null);
                setShowDishForm(true);
                selectTab('menu');
              }}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Dish
            </Button>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'dashboard' && analytics && (
          <AdminOverviewTab
            analytics={analytics}
            adminOrders={adminOrders}
            onSelectTab={selectTab}
          />
        )}

        {activeTab === 'orders' && (
          <AdminOrdersTab
            orders={adminOrders}
            onStatusUpdate={handleOrderStatusUpdate}
          />
        )}

        {activeTab === 'menu' && (
          <AdminMenuTab
            foods={adminFoods}
            categories={categories}
            showDishForm={showDishForm}
            setShowDishForm={setShowDishForm}
            editingFood={editingFood}
            setEditingFood={setEditingFood}
            onSaveDish={handleSaveDish}
            onToggleDishAvailability={handleToggleDishAvailability}
            onDeleteDish={handleDeleteDish}
          />
        )}

        {activeTab === 'categories' && (
          <AdminCategoriesTab
            categories={categories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {activeTab === 'customers' && (
          <AdminCustomersTab
            customers={customers}
            onToggleCustomer={handleToggleCustomer}
          />
        )}

        {activeTab === 'reservations' && (
          <AdminReservationsTab
            reservations={adminReservations}
            onReservationStatus={handleReservationStatus}
          />
        )}

        {activeTab === 'reviews' && (
          <AdminReviewsTab
            reviews={adminReviews}
            onToggleVisibility={handleToggleReviewVisibility}
            onDeleteReview={handleDeleteReview}
          />
        )}

        {activeTab === 'coupons' && (
          <AdminCouponsTab
            coupons={adminCoupons}
            onCreateCoupon={handleCreateCoupon}
            onToggleCoupon={handleToggleCoupon}
            onDeleteCoupon={handleDeleteCoupon}
          />
        )}

        {activeTab === 'offers' && (
          <AdminOffersTab
            offers={offers}
            onPublishOffer={handlePublishOffer}
            onDeleteOffer={handleDeleteOffer}
          />
        )}

        {activeTab === 'payments' && (
          <AdminPaymentsTab payments={payments} />
        )}

        {activeTab === 'analytics' && analytics && (
          <AdminAnalyticsTab analytics={analytics} />
        )}

        {activeTab === 'settings' && (
          <AdminSettingsTab
            settings={settings}
            onSaveSettings={handleSaveSettings}
          />
        )}

        {activeTab === 'staff' && (
          <AdminStaffTab
            staffList={staffList}
            onAddStaff={handleAddStaff}
            onToggleStatus={handleToggleStaffStatus}
          />
        )}

        {activeTab === 'notifications' && (
          <AdminNotificationsTab
            notifications={notifications}
            onMarkAllRead={async () => {
              await markAllNotificationsRead();
              await refreshNotifications();
              showToast('✓ All notifications marked as read');
            }}
          />
        )}
      </main>
    </div>
  );
};
