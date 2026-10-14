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
        <h2 className="font-serif-display text-xl font-semibold text-text">
          Create Coupon Code
        </h2>
        <div>
          <label className="block text-xs text-text-soft mb-1">Coupon Code</label>
          <input
            type="text"
            required
            value={coupCode}
            onChange={(e) => setCoupCode(e.target.value.toUpperCase())}
            placeholder="ROYAL30"
            className="w-full px-3.5 py-2 rounded-xl bg-canvas border border-border text-xs font-mono-tabular text-text placeholder-text-muted focus:border-yellow"
          />
        </div>
        <div>
          <label className="block text-xs text-text-soft mb-1">Title</label>
          <input
            type="text"
            required
            value={coupTitle}
            onChange={(e) => setCoupTitle(e.target.value)}
            placeholder="30% Off Royal Tasting"
            className="w-full px-3.5 py-2 rounded-xl bg-canvas border border-border text-xs text-text placeholder-text-muted focus:border-yellow"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs text-text-soft mb-1">Type</label>
            <select
              value={coupType}
              onChange={(e) => setCoupType(e.target.value as 'PERCENTAGE' | 'FIXED')}
              className="w-full px-2 py-2 rounded-xl bg-canvas border border-border text-xs text-text focus:border-yellow"
            >
              <option value="PERCENTAGE">%</option>
              <option value="FIXED">$</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-soft mb-1">Value</label>
            <input
              type="number"
              value={coupValue}
              onChange={(e) => setCoupValue(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-canvas border border-border text-xs font-mono-tabular text-text focus:border-yellow"
            />
          </div>
          <div>
            <label className="block text-xs text-text-soft mb-1">Min ($)</label>
            <input
              type="number"
              value={coupMin}
              onChange={(e) => setCoupMin(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-canvas border border-border text-xs font-mono-tabular text-text focus:border-yellow"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-yellow hover:bg-yellow-hover text-black text-xs font-semibold transition-colors"
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
              <p className="font-mono-tabular text-sm font-bold text-yellow">
                {c.code} ·{' '}
                {c.discountType === 'PERCENTAGE'
                  ? `${c.discountValue}% OFF`
                  : `$${c.discountValue} OFF`}
              </p>
              <p className="text-xs text-text mt-0.5">{c.title}</p>
              <p className="text-[11px] font-mono-tabular text-text-muted mt-1">
                Min Order: ${c.minOrderValue} · Used: {c.usedCount}/{c.usageLimit}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleCoupon(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  c.isActive
                    ? 'bg-green-light/15 text-green-light'
                    : 'bg-white/5 text-text-muted'
                }`}
              >
                {c.isActive ? 'Active' : 'Inactive'}
              </button>
              <button
                type="button"
                onClick={() => onDeleteCoupon(c.id)}
                aria-label={`Delete coupon ${c.code}`}
                className="p-2 text-danger hover:bg-white/5 rounded-lg transition-colors"
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
