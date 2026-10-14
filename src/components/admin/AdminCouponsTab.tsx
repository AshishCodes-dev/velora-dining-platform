import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Coupon } from '../../types/restaurant';

interface AdminCouponsTabProps {
  coupons: Coupon[];
  onCreateCoupon: (data: {
    code: string;
    title: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    minOrderValue: number;
  }) => Promise<void>;
  onToggleCoupon: (coupon: Coupon) => Promise<void>;
  onDeleteCoupon: (id: string) => Promise<void>;
}

export const AdminCouponsTab: React.FC<AdminCouponsTabProps> = ({
  coupons,
  onCreateCoupon,
  onToggleCoupon,
  onDeleteCoupon,
}) => {
  const [coupCode, setCoupCode] = useState('');
  const [coupTitle, setCoupTitle] = useState('');
  const [coupType, setCoupType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [coupValue, setCoupValue] = useState('15');
  const [coupMin, setCoupMin] = useState('40');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupCode.trim()) return;
    await onCreateCoupon({
      code: coupCode,
      title: coupTitle || `${coupCode.toUpperCase()} Privilege`,
      discountType: coupType,
      discountValue: Number(coupValue),
      minOrderValue: Number(coupMin),
    });
    setCoupCode('');
    setCoupTitle('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-4 nocturne-surface rounded-2xl p-6 space-y-4 h-fit"
      >
        <h2 className="font-serif-display text-xl font-semibold text-[#F5F2FA]">
          Create Coupon Code
        </h2>
        <div>
          <label className="block text-xs text-[#B8AFC9] mb-1">Coupon Code</label>
          <input
            type="text"
            required
            value={coupCode}
            onChange={(e) => setCoupCode(e.target.value.toUpperCase())}
            placeholder="ROYAL30"
            className="w-full px-3.5 py-2 rounded-xl bg-[#0D0914] border border-white/10 text-xs font-mono-tabular text-[#F5F2FA]"
          />
        </div>
        <div>
          <label className="block text-xs text-[#B8AFC9] mb-1">Title</label>
          <input
            type="text"
            required
            value={coupTitle}
            onChange={(e) => setCoupTitle(e.target.value)}
            placeholder="30% Off Royal Tasting"
            className="w-full px-3.5 py-2 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs text-[#B8AFC9] mb-1">Type</label>
            <select
              value={coupType}
              onChange={(e) => setCoupType(e.target.value as 'PERCENTAGE' | 'FIXED')}
              className="w-full px-2 py-2 rounded-xl bg-[#0D0914] border border-white/10 text-xs text-[#F5F2FA]"
            >
              <option value="PERCENTAGE">%</option>
              <option value="FIXED">$</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#B8AFC9] mb-1">Value</label>
            <input
              type="number"
              value={coupValue}
              onChange={(e) => setCoupValue(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-[#0D0914] border border-white/10 text-xs font-mono-tabular text-[#F5F2FA]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#B8AFC9] mb-1">Min ($)</label>
            <input
              type="number"
              value={coupMin}
              onChange={(e) => setCoupMin(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-[#0D0914] border border-white/10 text-xs font-mono-tabular text-[#F5F2FA]"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-[#10B981] text-[#081C15] text-xs font-semibold"
        >
          Create Coupon
        </button>
      </form>

      <div className="lg:col-span-8 space-y-3">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="nocturne-surface rounded-xl p-5 flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-mono-tabular text-sm font-bold text-[#F59E0B]">
                {c.code} ·{' '}
                {c.discountType === 'PERCENTAGE'
                  ? `${c.discountValue}% OFF`
                  : `$${c.discountValue} OFF`}
              </p>
              <p className="text-xs text-[#F5F2FA] mt-0.5">{c.title}</p>
              <p className="text-[11px] font-mono-tabular text-[#7E7394] mt-1">
                Min Order: ${c.minOrderValue} · Used: {c.usedCount}/{c.usageLimit}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleCoupon(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  c.isActive
                    ? 'bg-[#10B981]/20 text-[#10B981]'
                    : 'bg-white/5 text-[#7E7394]'
                }`}
              >
                {c.isActive ? 'Active' : 'Inactive'}
              </button>
              <button
                type="button"
                onClick={() => onDeleteCoupon(c.id)}
                aria-label={`Delete coupon ${c.code}`}
                className="p-2 text-[#F43F5E]"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
