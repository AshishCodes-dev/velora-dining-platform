import React, { useState, useEffect } from 'react';
import type { RestaurantSettings } from '../../types/restaurant';
import { Button } from '../ui/Button';

interface AdminSettingsTabProps {
  settings: RestaurantSettings | null;
  onSaveSettings: (settingsData: Partial<RestaurantSettings>) => Promise<void>;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [restName, setRestName] = useState(settings?.name || 'VELORA');
  const [restPhone, setRestPhone] = useState(settings?.phone || '+1 (415) 890-4420');
  const [restEmail, setRestEmail] = useState(settings?.email || 'concierge@velora.com');
  const [restAddress, setRestAddress] = useState(settings?.address || '');
  const [restDeliveryFee, setRestDeliveryFee] = useState(String(settings?.deliveryFee ?? 6));
  const [restMinOrder, setRestMinOrder] = useState(String(settings?.minimumOrder ?? 20));
  const [restTax, setRestTax] = useState(String(settings?.taxPercent ?? 9));

  useEffect(() => {
    if (settings) {
      setRestName(settings.name);
      setRestPhone(settings.phone);
      setRestEmail(settings.email);
      setRestAddress(settings.address);
      setRestDeliveryFee(String(settings.deliveryFee));
      setRestMinOrder(String(settings.minimumOrder));
      setRestTax(String(settings.taxPercent));
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings({
      name: restName,
      phone: restPhone,
      email: restEmail,
      address: restAddress,
      deliveryFee: Number(restDeliveryFee),
      minimumOrder: Number(restMinOrder),
      taxPercent: Number(restTax),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="nocturne-surface rounded-2xl p-6 sm:p-8 space-y-6 max-w-3xl"
    >
      <h2 className="font-serif-display text-2xl font-semibold text-text">
        Restaurant Configuration &amp; Tax Rules
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-text-soft mb-1">Restaurant Name</label>
          <input
            type="text"
            value={restName}
            onChange={(e) => setRestName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-border text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-text-soft mb-1">Concierge Phone</label>
          <input
            type="text"
            value={restPhone}
            onChange={(e) => setRestPhone(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-border text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-text-soft mb-1">Concierge Email</label>
          <input
            type="email"
            value={restEmail}
            onChange={(e) => setRestEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-border text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-text-soft mb-1">Address</label>
          <input
            type="text"
            value={restAddress}
            onChange={(e) => setRestAddress(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-border text-xs text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-text-soft mb-1">Delivery Fee ($)</label>
          <input
            type="number"
            value={restDeliveryFee}
            onChange={(e) => setRestDeliveryFee(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-border text-xs font-mono-tabular text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-text-soft mb-1">Tax Percentage (%)</label>
          <input
            type="number"
            value={restTax}
            onChange={(e) => setRestTax(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-border text-xs font-mono-tabular text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors"
          />
        </div>
      </div>
      <Button
        type="submit"
        variant="primary"
        size="md"
      >
        Save Restaurant Settings
      </Button>
    </form>
  );
};
