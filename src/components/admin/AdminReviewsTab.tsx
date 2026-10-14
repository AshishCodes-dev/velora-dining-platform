import React from 'react';
import { Trash2 } from 'lucide-react';
import type { Review } from '../../types/restaurant';

interface AdminReviewsTabProps {
  reviews: Review[];
  onToggleVisibility: (review: Review) => Promise<void>;
  onDeleteReview: (id: string) => Promise<void>;
}

export const AdminReviewsTab: React.FC<AdminReviewsTabProps> = ({
  reviews,
  onToggleVisibility,
  onDeleteReview,
}) => {
  return (
    <div className="space-y-4">
      {reviews.map((rev) => (
        <div
          key={rev.id}
          className="nocturne-surface rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <p className="text-xs text-yellow font-semibold">
              {rev.foodName} · ★ {rev.rating}.0 by {rev.userName}
            </p>
            <p className="text-xs sm:text-sm text-text">{rev.comment}</p>
            <p className="text-[11px] font-mono-tabular text-text-muted">
              Status: {rev.status} · {new Date(rev.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onToggleVisibility(rev)}
              className="px-3 py-1.5 rounded-lg border border-border hover:border-yellow text-xs text-text transition-colors"
            >
              {rev.status === 'PUBLISHED' ? 'Hide' : 'Publish'}
            </button>
            <button
              type="button"
              onClick={() => onDeleteReview(rev.id)}
              aria-label={`Delete review by ${rev.userName}`}
              className="p-2 text-danger hover:bg-white/5 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
