import React from 'react';
import { Trash2 } from 'lucide-react';
import type { Review } from '../../types/restaurant';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

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
          className="nocturne-surface rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:border-border-accent"
        >
          <div className="space-y-1">
            <p className="text-xs text-yellow font-semibold">
              {rev.foodName} · ★ {rev.rating}.0 by {rev.userName}
            </p>
            <p className="text-xs sm:text-sm text-text">{rev.comment}</p>
            <div className="flex items-center gap-2 pt-0.5">
              <Badge
                variant={rev.status === 'PUBLISHED' ? 'success' : 'neutral'}
                dot
              >
                {rev.status}
              </Badge>
              <span className="text-[11px] font-mono-tabular text-text-muted">
                {new Date(rev.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant={rev.status === 'PUBLISHED' ? 'outline' : 'secondary'}
              size="sm"
              onClick={() => onToggleVisibility(rev)}
            >
              {rev.status === 'PUBLISHED' ? 'Hide' : 'Publish'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDeleteReview(rev.id)}
              aria-label={`Delete review by ${rev.userName}`}
              className="p-2 text-danger hover:text-danger hover:bg-danger/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
