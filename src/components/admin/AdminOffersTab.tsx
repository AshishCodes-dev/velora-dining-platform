import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Offer } from '../../types/restaurant';

interface AdminOffersTabProps {
  offers: Offer[];
  onPublishOffer: (data: { title: string; subtitle: string; couponCode: string }) => Promise<void>;
  onDeleteOffer: (id: string) => Promise<void>;
}

export const AdminOffersTab: React.FC<AdminOffersTabProps> = ({
  offers,
  onPublishOffer,
  onDeleteOffer,
}) => {
  const [offerTitle, setOfferTitle] = useState('');
  const [offerSub, setOfferSub] = useState('');
  const [offerCode, setOfferCode] = useState('WELCOME10');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerTitle.trim()) return;
    await onPublishOffer({
      title: offerTitle,
      subtitle: offerSub,
      couponCode: offerCode,
    });
    setOfferTitle('');
    setOfferSub('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-4 nocturne-surface rounded-2xl p-6 space-y-4 h-fit"
      >
        <h2 className="font-serif-display text-xl font-semibold text-text">
          Publish Promotional Offer
        </h2>
        <input
          type="text"
          required
          value={offerTitle}
          onChange={(e) => setOfferTitle(e.target.value)}
          placeholder="Offer Title"
          className="w-full px-3.5 py-2 rounded-xl bg-canvas border border-border text-xs text-text placeholder-text-muted focus:border-yellow"
        />
        <input
          type="text"
          required
          value={offerSub}
          onChange={(e) => setOfferSub(e.target.value)}
          placeholder="Subtitle (e.g. 20% Off Mains)"
          className="w-full px-3.5 py-2 rounded-xl bg-canvas border border-border text-xs text-text placeholder-text-muted focus:border-yellow"
        />
        <input
          type="text"
          required
          value={offerCode}
          onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
          placeholder="Linked Coupon Code"
          className="w-full px-3.5 py-2 rounded-xl bg-canvas border border-border text-xs font-mono-tabular text-text placeholder-text-muted focus:border-yellow"
        />
        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-yellow hover:bg-yellow-hover text-black text-xs font-semibold transition-colors"
        >
          Publish Offer
        </button>
      </form>

      <div className="lg:col-span-8 space-y-3">
        {offers.map((o) => (
          <div
            key={o.id}
            className="nocturne-surface rounded-xl p-5 flex items-center justify-between gap-4"
          >
            <div>
              <p className="text-sm font-semibold text-text">{o.title}</p>
              <p className="text-xs text-yellow">{o.subtitle}</p>
              <p className="text-xs font-mono-tabular text-green-light mt-1">
                Code: {o.couponCode}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onDeleteOffer(o.id)}
              aria-label={`Delete offer ${o.title}`}
              className="p-2 text-danger hover:bg-white/5 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
