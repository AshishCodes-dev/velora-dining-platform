import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User as UserIcon,
  ShoppingBag,
  Calendar,
  Heart,
  MapPin,
  MessageSquare,
  LogOut,
  Plus,
  Trash2,
} from 'lucide-react';
import { FoodCard } from '../FoodCard';
import type { User, Order, Reservation, Review, Food } from '../../types/restaurant';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

export type ProfileTab = 'overview' | 'orders' | 'reservations' | 'favorites' | 'reviews' | 'addresses';

interface UserProfileViewProps {
  user: User;
  activeTab: ProfileTab;
  onSelectTab: (tab: ProfileTab) => void;
  orders: Order[];
  reservations: Reservation[];
  favoriteFoods: Food[];
  myReviews: Review[];
  onUpdateProfile: (name: string, phone: string) => Promise<void>;
  onAddAddress: (data: {
    label: string;
    houseFlat: string;
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
  }) => Promise<void>;
  onDeleteAddress: (id: string) => Promise<void>;
  onLogout: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  user,
  activeTab,
  onSelectTab,
  orders,
  reservations,
  favoriteFoods,
  myReviews,
  onUpdateProfile,
  onAddAddress,
  onDeleteAddress,
  onLogout,
}) => {
  const [profileName, setProfileName] = useState(user.name);
  const [profilePhone, setProfilePhone] = useState(user.phone);
  const [savingProfile, setSavingProfile] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);

  // New Address Form State
  const [addrLabel, setAddrLabel] = useState('Residence');
  const [addrHouse, setAddrHouse] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrArea, setAddrArea] = useState('');
  const [addrCity, setAddrCity] = useState('San Francisco');
  const [addrState, setAddrState] = useState('CA');
  const [addrPin, setAddrPin] = useState('');

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await onUpdateProfile(profileName, profilePhone);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingAddress(true);
    try {
      await onAddAddress({
        label: addrLabel,
        houseFlat: addrHouse,
        street: addrStreet,
        area: addrArea,
        city: addrCity,
        state: addrState,
        pincode: addrPin,
      });
      setAddrHouse('');
      setAddrStreet('');
      setAddrArea('');
      setAddrPin('');
    } finally {
      setAddingAddress(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Profile Sidebar */}
      <aside className="lg:col-span-3 nocturne-surface rounded-2xl p-5 space-y-6">
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-yellow/15 border border-yellow/30 flex items-center justify-center font-serif-display text-lg lg:text-xl font-bold text-yellow shadow-inner shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text truncate">{user.name}</p>
              <p className="text-xs text-yellow font-mono-tabular">{user.role}</p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={onLogout}
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
            className="lg:hidden shrink-0"
          >
            Sign Out
          </Button>
        </div>

        <nav aria-label="Profile navigation" className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
          {[
            { id: 'overview' as const, label: 'Personal Profile', icon: UserIcon },
            { id: 'orders' as const, label: `My Orders (${orders.length})`, icon: ShoppingBag },
            {
              id: 'reservations' as const,
              label: `Reservations (${reservations.length})`,
              icon: Calendar,
            },
            {
              id: 'favorites' as const,
              label: `Favorites (${favoriteFoods.length})`,
              icon: Heart,
            },
            {
              id: 'addresses' as const,
              label: `Saved Addresses (${user.addresses.length})`,
              icon: MapPin,
            },
            { id: 'reviews' as const, label: `My Reviews (${myReviews.length})`, icon: MessageSquare },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-[background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow cursor-pointer ${
                  active
                    ? 'bg-yellow text-black font-semibold'
                    : 'text-text-soft hover:text-text hover:bg-elevated'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-border hidden lg:block">
          <Button
            variant="danger"
            size="sm"
            fullWidth
            onClick={onLogout}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Profile Main Content */}
      <div className="lg:col-span-9 space-y-6">
        {activeTab === 'overview' && (
          <form
            onSubmit={handleProfileSubmit}
            className="nocturne-surface rounded-2xl p-6 sm:p-8 space-y-6"
          >
            <h2 className="font-serif-display text-2xl font-semibold text-text">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-soft mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-canvas border border-border text-xs text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:border-yellow transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-soft mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-canvas border border-border text-xs text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:border-yellow transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-soft mb-1.5">
                  Registered Email (Verified)
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-canvas/50 border border-border text-xs text-text-muted cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-soft mb-1.5">Account Role</label>
                <input
                  type="text"
                  disabled
                  value={user.role}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-canvas/50 border border-border text-xs font-mono-tabular text-yellow cursor-not-allowed"
                />
              </div>
            </div>
            <Button
              type="submit"
              variant="success"
              size="md"
              loading={savingProfile}
            >
              Save Profile Changes
            </Button>
          </form>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="font-serif-display text-2xl font-semibold text-text">
              Order History ({orders.length})
            </h2>
            {orders.length === 0 ? (
              <EmptyState
                icon={<ShoppingBag className="w-8 h-8" />}
                title="No orders placed yet"
                description="Experience our wood-fired pizzas, Wagyu steaks, and signature desserts."
                actionLabel="Explore Menu"
                actionTo="/menu"
                className="py-12"
              />
            ) : (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  className="nocturne-surface rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono-tabular text-xs">
                      <span className="font-bold text-yellow">#{ord.orderNumber}</span>
                      <span>·</span>
                      <span className="text-green-light font-semibold">{ord.status}</span>
                      <span>·</span>
                      <span className="text-text-muted">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-text">
                      {ord.items.map((i) => `${i.quantity}x ${i.foodName}`).join(', ')}
                    </p>
                    <p className="text-xs font-mono-tabular text-text-soft">
                      Total: ${ord.grandTotal.toFixed(2)} · {ord.orderType} ·{' '}
                      {ord.paymentMethod}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    to={`/track/${ord.orderNumber}`}
                    className="whitespace-nowrap self-start sm:self-auto"
                  >
                    Track Order →
                  </Button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'reservations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif-display text-2xl font-semibold text-text">
                Table Reservations ({reservations.length})
              </h2>
              <Button
                variant="primary"
                size="sm"
                to="/reservations"
              >
                + New Reservation
              </Button>
            </div>
            {reservations.length === 0 ? (
              <EmptyState
                icon={<Calendar className="w-8 h-8" />}
                title="No reservations on record"
                description="Book an evening at the Velvet Chef Counter or Private Vault."
                actionLabel="Book a Table"
                actionTo="/reservations"
                className="py-12"
              />
            ) : (
              reservations.map((res) => (
                <div
                  key={res.id}
                  className="nocturne-surface rounded-2xl p-5 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <p className="font-mono-tabular text-xs font-bold text-yellow">
                      #{res.reservationCode} · {res.date} at {res.time}
                    </p>
                    <p className="text-sm font-semibold text-text">
                      {res.tableArea} · {res.guests} Guests
                    </p>
                    {res.specialRequest && (
                      <p className="text-xs text-text-soft">"{res.specialRequest}"</p>
                    )}
                  </div>
                  <span className="font-mono-tabular text-xs font-semibold text-green-light">
                    {res.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="space-y-4">
            <h2 className="font-serif-display text-2xl font-semibold text-text">
              Saved Favorites &amp; Wishlist ({favoriteFoods.length})
            </h2>
            {favoriteFoods.length === 0 ? (
              <EmptyState
                icon={<Heart className="w-8 h-8 text-yellow" />}
                title="Your wishlist is empty"
                description="Explore the menu to save and bookmark your favorite creations."
                actionLabel="Explore Menu"
                actionTo="/menu"
                className="py-12"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {favoriteFoods.map((food) => (
                  <FoodCard key={food.id} food={food} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <h2 className="font-serif-display text-2xl font-semibold text-text">
              Saved Delivery Addresses
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="nocturne-surface rounded-2xl p-5 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-yellow">{addr.label}</p>
                    <p className="text-sm font-semibold text-text">
                      {addr.houseFlat}, {addr.street}
                    </p>
                    <p className="text-text-soft">
                      {addr.area}, {addr.city}, {addr.state} {addr.pincode}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteAddress(addr.id)}
                    aria-label={`Delete address ${addr.label}`}
                    className="p-1.5 text-danger hover:text-danger hover:bg-danger/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add Address Form */}
            <form
              onSubmit={handleAddressSubmit}
              className="nocturne-surface rounded-2xl p-6 space-y-4"
            >
              <h3 className="font-serif-display text-xl font-semibold text-text">
                Add New Address
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  required
                  value={addrLabel}
                  onChange={(e) => setAddrLabel(e.target.value)}
                  placeholder="Label (e.g. Home, Studio)"
                  className="px-3.5 py-2.5 rounded-lg bg-canvas border border-border text-xs text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:border-yellow transition-colors duration-200"
                />
                <input
                  type="text"
                  required
                  value={addrHouse}
                  onChange={(e) => setAddrHouse(e.target.value)}
                  placeholder="House / Flat / Apt"
                  className="px-3.5 py-2.5 rounded-lg bg-canvas border border-border text-xs text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:border-yellow transition-colors duration-200"
                />
                <input
                  type="text"
                  required
                  value={addrStreet}
                  onChange={(e) => setAddrStreet(e.target.value)}
                  placeholder="Street Name"
                  className="px-3.5 py-2.5 rounded-lg bg-canvas border border-border text-xs text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:border-yellow transition-colors duration-200"
                />
                <input
                  type="text"
                  required
                  value={addrArea}
                  onChange={(e) => setAddrArea(e.target.value)}
                  placeholder="Area / Neighborhood"
                  className="px-3.5 py-2.5 rounded-lg bg-canvas border border-border text-xs text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:border-yellow transition-colors duration-200"
                />
                <input
                  type="text"
                  required
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                  placeholder="City"
                  className="px-3.5 py-2.5 rounded-lg bg-canvas border border-border text-xs text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:border-yellow transition-colors duration-200"
                />
                <input
                  type="text"
                  required
                  value={addrState}
                  onChange={(e) => setAddrState(e.target.value)}
                  placeholder="State"
                  className="px-3.5 py-2.5 rounded-lg bg-canvas border border-border text-xs text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:border-yellow transition-colors duration-200"
                />
                <input
                  type="text"
                  required
                  value={addrPin}
                  onChange={(e) => setAddrPin(e.target.value)}
                  placeholder="Pincode / ZIP"
                  className="px-3.5 py-2.5 rounded-lg bg-canvas border border-border text-xs text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:border-yellow transition-colors duration-200"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={addingAddress}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Save Address
              </Button>
            </form>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <h2 className="font-serif-display text-2xl font-semibold text-text">
              My Culinary Reviews ({myReviews.length})
            </h2>
            {myReviews.length === 0 ? (
              <EmptyState
                icon={<MessageSquare className="w-8 h-8" />}
                title="No reviews written yet"
                description="Open any dish in the menu to share your dining notes and ratings."
                actionLabel="Explore Menu"
                actionTo="/menu"
                className="py-12"
              />
            ) : (
              myReviews.map((rev) => (
                <div key={rev.id} className="nocturne-surface rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/menu/${rev.foodId}`}
                      className="font-serif-display text-lg font-semibold text-text hover:text-yellow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow rounded"
                    >
                      {rev.foodName}
                    </Link>
                    <span className="font-mono-tabular text-xs font-bold text-yellow">
                      {'★'.repeat(rev.rating)} ({rev.rating}.0)
                    </span>
                  </div>
                  <p className="text-xs text-text-soft leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
