import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { User, Order, OrderType } from '../../types/restaurant';

interface CheckoutFormProps {
  user: User | null;
  orderType: OrderType;
  setOrderType: (t: OrderType) => void;
  customerName: string;
  setCustomerName: (v: string) => void;
  customerPhone: string;
  setCustomerPhone: (v: string) => void;
  customerEmail: string;
  setCustomerEmail: (v: string) => void;
  houseFlat: string;
  setHouseFlat: (v: string) => void;
  street: string;
  setStreet: (v: string) => void;
  area: string;
  setArea: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  state: string;
  setState: (v: string) => void;
  pincode: string;
  setPincode: (v: string) => void;
  tableNumber: string;
  setTableNumber: (v: string) => void;
  paymentMethod: Order['paymentMethod'];
  setPaymentMethod: (m: Order['paymentMethod']) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  user,
  orderType,
  setOrderType,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerEmail,
  setCustomerEmail,
  houseFlat,
  setHouseFlat,
  street,
  setStreet,
  area,
  setArea,
  city,
  setCity,
  state,
  setState,
  pincode,
  setPincode,
  tableNumber,
  setTableNumber,
  paymentMethod,
  setPaymentMethod,
  onSubmit,
}) => {
  return (
    <form id="checkout-form" onSubmit={onSubmit} className="space-y-6">
      {/* 1. Order Type Selection */}
      <div className="nocturne-surface rounded-2xl p-6 space-y-4">
        <h2 className="font-serif-display text-2xl font-semibold text-[#F5F2FA]">
          1. Select Dining &amp; Dispatch Mode
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {(['Delivery', 'Pickup', 'Dine-in'] as OrderType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setOrderType(type)}
              className={`p-3.5 rounded-xl border text-center transition-all ${
                orderType === type
                  ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#F5F2FA] font-semibold'
                  : 'bg-[#0D0914] border-white/10 text-[#B8AFC9] hover:border-white/25'
              }`}
            >
              <span className="text-xs sm:text-sm block">{type}</span>
              <span className="text-[11px] text-[#7E7394] block mt-0.5">
                {type === 'Delivery'
                  ? '30–40 mins'
                  : type === 'Pickup'
                  ? 'Ready in 20 mins'
                  : 'Served Tableside'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Customer Information */}
      <div className="nocturne-surface rounded-2xl p-6 space-y-4">
        <h2 className="font-serif-display text-2xl font-semibold text-[#F5F2FA]">
          2. Guest Contact Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-[#B8AFC9] mb-1">Full Name</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#B8AFC9] mb-1">Phone Number</label>
            <input
              type="tel"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#B8AFC9] mb-1">Email Address</label>
            <input
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
            />
          </div>
        </div>
      </div>

      {/* 3. Conditional Delivery Address OR Dine-in Table */}
      {orderType === 'Delivery' && (
        <div className="nocturne-surface rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-display text-2xl font-semibold text-[#F5F2FA]">
              3. Delivery Address
            </h2>
            {user && user.addresses.length > 0 && (
              <div className="flex items-center gap-2">
                {user.addresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => {
                      setHouseFlat(addr.houseFlat);
                      setStreet(addr.street);
                      setArea(addr.area);
                      setCity(addr.city);
                      setState(addr.state);
                      setPincode(addr.pincode);
                    }}
                    className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[11px] text-[#8B5CF6]"
                  >
                    Use {addr.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#B8AFC9] mb-1">
                House / Flat / Suite
              </label>
              <input
                type="text"
                required
                value={houseFlat}
                onChange={(e) => setHouseFlat(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#B8AFC9] mb-1">Street</label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#B8AFC9] mb-1">Area / District</label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-[#B8AFC9] mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-2.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#B8AFC9] mb-1">State</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-2.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#B8AFC9] mb-1">Pincode</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-2.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {orderType === 'Dine-in' && (
        <div className="nocturne-surface rounded-2xl p-6 space-y-3">
          <h2 className="font-serif-display text-2xl font-semibold text-[#F5F2FA]">
            3. Select Dining Room Table
          </h2>
          <select
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
          >
            <option>Table 04 — Velvet Chef Counter</option>
            <option>Table 11 — Main Dining Room</option>
            <option>Table 18 — Velora Garden Terrace</option>
            <option>Vault 02 — Private Sommelier Vault</option>
          </select>
        </div>
      )}

      {/* 4. Safe Test / Mock Payment Flow */}
      <div className="nocturne-surface rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif-display text-2xl font-semibold text-[#F5F2FA]">
            4. Payment Method (Safe Sandbox Mode)
          </h2>
          <span className="inline-flex items-center gap-1 text-xs text-[#10B981]">
            <ShieldCheck className="w-4 h-4" />
            <span>Test Mode</span>
          </span>
        </div>
        <p className="text-xs text-[#7E7394]">
          No real card credentials are required. Select a sandbox payment method to simulate checkout and generate your live order tracking receipt.
        </p>
        <div className="space-y-2.5">
          {(
            [
              'Card (Test Mode)',
              'UPI / Instant Pay (Test)',
              'Pay at Restaurant / COD',
            ] as Order['paymentMethod'][]
          ).map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setPaymentMethod(method)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-xs transition-colors ${
                paymentMethod === method
                  ? 'bg-[#10B981]/15 border-[#10B981] text-[#F5F2FA] font-semibold'
                  : 'bg-[#0D0914] border-white/10 text-[#B8AFC9]'
              }`}
            >
              <span>{method}</span>
              {paymentMethod === method && (
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
};
