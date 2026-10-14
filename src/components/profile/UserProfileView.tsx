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
    await onUpdateProfile(profileName, profilePhone);
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Profile Sidebar */}
      <aside className="lg:col-span-3 nocturne-surface rounded-2xl p-5 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-full bg-[#8B5CF6]/25 border border-[#8B5CF6] flex items-center justify-center font-serif-display text-xl font-bold text-[#F5F2FA]">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#F5F2FA] truncate">{user.name}</p>
            <p className="text-xs text-[#8B5CF6] font-mono-tabular">{user.role}</p>
          </div>
        </div>

        <nav aria-label="Profile navigation" className="space-y-1">
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
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  active
                    ? 'bg-[#8B5CF6] text-white font-semibold'
                    : 'text-[#B8AFC9] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#F43F5E] hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Profile Main Content */}
      <div className="lg:col-span-9 space-y-6">
        {activeTab === 'overview' && (
          <form
            onSubmit={handleProfileSubmit}
            className="nocturne-surface rounded-2xl p-6 sm:p-8 space-y-6"
          >
            <h2 className="font-serif-display text-2xl font-semibold text-[#F5F2FA]">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#B8AFC9] mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#B8AFC9] mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#B8AFC9] mb-1">
                  Registered Email (Verified)
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0914]/50 border border-white/5 text-xs text-[#7E7394]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#B8AFC9] mb-1">Account Role</label>
                <input
                  type="text"
                  disabled
                  value={user.role}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0914]/50 border border-white/5 text-xs font-mono-tabular text-[#8B5CF6]"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#081C15] text-xs font-semibold"
            >
              Save Profile Changes
            </button>
          </form>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="font-serif-display text-2xl font-semibold text-[#F5F2FA]">
              Order History ({orders.length})
            </h2>
            {orders.length === 0 ? (
              <div className="nocturne-surface rounded-2xl p-10 text-center space-y-3">
                <p className="text-sm text-[#B8AFC9]">No orders placed yet.</p>
                <Link
                  to="/menu"
                  className="inline-block px-5 py-2.5 rounded-xl bg-[#10B981] text-[#081C15] text-xs font-semibold"
                >
                  Order Now
                </Link>
              </div>
            ) : (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  className="nocturne-surface rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono-tabular text-xs">
                      <span className="font-bold text-[#F59E0B]">#{ord.orderNumber}</span>
                      <span>·</span>
                      <span className="text-[#10B981]">{ord.status}</span>
                      <span>·</span>
                      <span className="text-[#7E7394]">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[#F5F2FA]">
                      {ord.items.map((i) => `${i.quantity}x ${i.foodName}`).join(', ')}
                    </p>
                    <p className="text-xs font-mono-tabular text-[#B8AFC9]">
                      Total: ${ord.grandTotal.toFixed(2)} · {ord.orderType} ·{' '}
                      {ord.paymentMethod}
                    </p>
                  </div>
                  <Link
                    to={`/track/${ord.orderNumber}`}
                    className="px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold whitespace-nowrap self-start sm:self-auto"
                  >
                    Track Order →
                  </Link>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'reservations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif-display text-2xl font-semibold text-[#F5F2FA]">
                Table Reservations ({reservations.length})
              </h2>
              <Link
                to="/reservations"
                className="px-4 py-2 rounded-xl bg-[#8B5CF6] text-white text-xs font-semibold"
              >
                + New Reservation
              </Link>
            </div>
            {reservations.length === 0 ? (
              <div className="nocturne-surface rounded-2xl p-8 text-center text-xs text-[#B8AFC9]">
                No reservations yet.
              </div>
            ) : (
              reservations.map((res) => (
                <div
                  key={res.id}
                  className="nocturne-surface rounded-2xl p-5 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <p className="font-mono-tabular text-xs font-bold text-[#F59E0B]">
                      #{res.reservationCode} · {res.date} at {res.time}
                    </p>
                    <p className="text-sm font-semibold text-[#F5F2FA]">
                      {res.tableArea} · {res.guests} Guests
                    </p>
                    {res.specialRequest && (
                      <p className="text-xs text-[#B8AFC9]">"{res.specialRequest}"</p>
                    )}
                  </div>
                  <span className="font-mono-tabular text-xs font-semibold text-[#10B981]">
                    {res.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="space-y-4">
            <h2 className="font-serif-display text-2xl font-semibold text-[#F5F2FA]">
              Saved Favorites &amp; Wishlist ({favoriteFoods.length})
            </h2>
            {favoriteFoods.length === 0 ? (
              <div className="nocturne-surface rounded-2xl p-10 text-center space-y-3">
                <p className="text-xs text-[#B8AFC9]">
                  Your wishlist is empty. Explore the menu to save your favorite dishes.
                </p>
                <Link
                  to="/menu"
                  className="inline-block px-5 py-2.5 rounded-xl bg-[#8B5CF6] text-white text-xs font-semibold"
                >
                  Explore Menu
                </Link>
              </div>
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
            <h2 className="font-serif-display text-2xl font-semibold text-[#F5F2FA]">
              Saved Delivery Addresses
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="nocturne-surface rounded-2xl p-5 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-[#8B5CF6]">{addr.label}</p>
                    <p className="text-sm font-semibold text-[#F5F2FA]">
                      {addr.houseFlat}, {addr.street}
                    </p>
                    <p className="text-[#B8AFC9]">
                      {addr.area}, {addr.city}, {addr.state} {addr.pincode}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteAddress(addr.id)}
                    aria-label={`Delete address ${addr.label}`}
                    className="p-1.5 text-[#F43F5E] hover:bg-white/5 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Address Form */}
            <form
              onSubmit={handleAddressSubmit}
              className="nocturne-surface rounded-2xl p-6 space-y-4"
            >
              <h3 className="font-serif-display text-xl font-semibold text-[#F5F2FA]">
                Add New Address
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  required
                  value={addrLabel}
                  onChange={(e) => setAddrLabel(e.target.value)}
                  placeholder="Label (e.g. Home, Studio)"
                  className="px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
                />
                <input
                  type="text"
                  required
                  value={addrHouse}
                  onChange={(e) => setAddrHouse(e.target.value)}
                  placeholder="House / Flat / Apt"
                  className="px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
                />
                <input
                  type="text"
                  required
                  value={addrStreet}
                  onChange={(e) => setAddrStreet(e.target.value)}
                  placeholder="Street Name"
                  className="px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
                />
                <input
                  type="text"
                  required
                  value={addrArea}
                  onChange={(e) => setAddrArea(e.target.value)}
                  placeholder="Area / Neighborhood"
                  className="px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
                />
                <input
                  type="text"
                  required
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                  placeholder="City"
                  className="px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
                />
                <input
                  type="text"
                  required
                  value={addrState}
                  onChange={(e) => setAddrState(e.target.value)}
                  placeholder="State"
                  className="px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
                />
                <input
                  type="text"
                  required
                  value={addrPin}
                  onChange={(e) => setAddrPin(e.target.value)}
                  placeholder="Pincode / ZIP"
                  className="px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#8B5CF6] text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Address</span>
              </button>
            </form>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <h2 className="font-serif-display text-2xl font-semibold text-[#F5F2FA]">
              My Culinary Reviews ({myReviews.length})
            </h2>
            {myReviews.length === 0 ? (
              <div className="nocturne-surface rounded-2xl p-8 text-center text-xs text-[#B8AFC9]">
                You haven’t written any reviews yet. Open any dish page to share your thoughts.
              </div>
            ) : (
              myReviews.map((rev) => (
                <div key={rev.id} className="nocturne-surface rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/menu/${rev.foodId}`}
                      className="font-serif-display text-lg font-semibold text-[#F5F2FA] hover:text-[#8B5CF6]"
                    >
                      {rev.foodName}
                    </Link>
                    <span className="font-mono-tabular text-xs font-bold text-[#F59E0B]">
                      {'★'.repeat(rev.rating)} ({rev.rating}.0)
                    </span>
                  </div>
                  <p className="text-xs text-[#B8AFC9] leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
