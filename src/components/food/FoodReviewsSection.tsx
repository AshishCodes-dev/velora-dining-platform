import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import type { Food, Review, User } from '../../types/restaurant';

interface FoodReviewsSectionProps {
  food: Food;
  reviews: Review[];
  user: User | null;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
  editingReviewId: string | null;
  setEditingReviewId: (id: string | null) => void;
  reviewRating: number;
  setReviewRating: (rating: number) => void;
  reviewComment: string;
  setReviewComment: (comment: string) => void;
  reviewImageUrl: string;
  setReviewImageUrl: (url: string) => void;
  submittingReview: boolean;
  onSubmitReview: (e: React.FormEvent) => Promise<void>;
  onDeleteReview: (id: string) => Promise<void>;
}

export const FoodReviewsSection: React.FC<FoodReviewsSectionProps> = ({
  food,
  reviews,
  user,
  ratingDistribution,
  editingReviewId,
  setEditingReviewId,
  reviewRating,
  setReviewRating,
  reviewComment,
  setReviewComment,
  reviewImageUrl,
  setReviewImageUrl,
  submittingReview,
  onSubmitReview,
  onDeleteReview,
}) => {
  return (
    <section className="pt-10 border-t border-border grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* Left Column: Rating Summary + Write a Review Form */}
      <div className="lg:col-span-5 space-y-6">
        <div className="nocturne-surface rounded-2xl p-6 space-y-4">
          <h2 className="font-serif-display text-2xl font-semibold text-text">
            Guest Ratings &amp; Reviews
          </h2>
          <div className="flex items-center gap-6">
            <div>
              <p className="font-mono-tabular text-4xl font-semibold text-yellow">
                {food.rating.toFixed(1)}
              </p>
              <p className="text-xs text-text-muted mt-1">
                Based on {food.reviewCount} reviews
              </p>
            </div>
            <div className="flex-1 space-y-1.5">
              {([5, 4, 3, 2, 1] as const).map((star) => {
                const count = ratingDistribution[star] || 0;
                const pct =
                  reviews.length > 0 ? Math.round((count / reviews.length) * 100) : star === 5 ? 90 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs font-mono-tabular">
                    <span className="w-8 text-text-soft">{star} ★</span>
                    <div className="flex-1 h-2 rounded-full bg-canvas overflow-hidden">
                      <div
                        className="h-full bg-yellow rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-text-muted">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Write / Edit Review Form */}
        <form
          onSubmit={onSubmitReview}
          className="nocturne-surface rounded-2xl p-6 space-y-4"
        >
          <h3 className="font-serif-display text-xl font-semibold text-text">
            {editingReviewId ? 'Edit Your Culinary Review' : 'Share Your Tasting Experience'}
          </h3>

          <div>
            <label className="block text-xs text-text-soft mb-1.5">
              Select Star Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className={`px-3 py-1.5 rounded-lg font-mono-tabular text-xs font-semibold transition-colors ${
                    reviewRating >= star
                      ? 'bg-yellow text-black'
                      : 'bg-canvas text-text-muted border border-border hover:border-yellow/40'
                  }`}
                >
                  {star} ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="review-comment" className="block text-xs text-text-soft mb-1.5">
              Your Review
            </label>
            <textarea
              id="review-comment"
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Describe the flavor profile, presentation, and temperature..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-canvas border border-border text-xs text-text placeholder-text-muted focus:outline-none focus:border-yellow"
            />
          </div>

          <div>
            <label htmlFor="review-photo" className="block text-xs text-text-soft mb-1.5">
              Optional Dish Photo URL
            </label>
            <input
              id="review-photo"
              type="text"
              value={reviewImageUrl}
              onChange={(e) => setReviewImageUrl(e.target.value)}
              placeholder="Optional photo URL or leave blank"
              className="w-full px-3.5 py-2 rounded-xl bg-canvas border border-border text-xs text-text placeholder-text-muted focus:outline-none focus:border-yellow"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={submittingReview}
              className="flex-1 py-2.5 rounded-xl bg-yellow hover:bg-yellow-hover text-black text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {submittingReview
                ? 'Saving...'
                : editingReviewId
                ? 'Update Review'
                : 'Publish Review'}
            </button>
            {editingReviewId && (
              <button
                type="button"
                onClick={() => {
                  setEditingReviewId(null);
                  setReviewComment('');
                  setReviewRating(5);
                }}
                className="px-4 py-2.5 rounded-xl border border-border text-xs text-text-soft hover:text-text transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Right Column: Reviews List */}
      <div className="lg:col-span-7 space-y-4">
        {reviews.length === 0 ? (
          <div className="nocturne-surface rounded-2xl p-10 text-center space-y-2">
            <p className="font-serif-display text-2xl text-text">
              No guest reviews for this dish yet
            </p>
            <p className="text-xs text-text-muted">
              Be the first to taste and review {food.name}.
            </p>
          </div>
        ) : (
          reviews.map((rev) => {
            const canManage =
              user &&
              (user.id === rev.userId || user.role === 'ADMIN' || user.role === 'STAFF');
            return (
              <article
                key={rev.id}
                className="nocturne-surface rounded-2xl p-6 space-y-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-text">{rev.userName}</p>
                    <p className="text-[11px] font-mono-tabular text-text-muted">
                      {new Date(rev.createdAt).toLocaleDateString()} · Verified Tasting
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono-tabular text-sm font-semibold">
                      <span className="text-yellow">{'★'.repeat(rev.rating)}</span>
                      {5 - rev.rating > 0 && (
                        <span className="text-text-muted">{'★'.repeat(5 - rev.rating)}</span>
                      )}
                      <span className="text-yellow ml-1">({rev.rating}.0)</span>
                    </span>
                    {canManage && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingReviewId(rev.id);
                            setReviewRating(rev.rating);
                            setReviewComment(rev.comment);
                          }}
                          aria-label="Edit review"
                          className="p-1.5 rounded-lg text-text-soft hover:text-text hover:bg-elevated transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteReview(rev.id)}
                          aria-label="Delete review"
                          className="p-1.5 rounded-lg text-danger hover:bg-elevated transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-text-soft leading-relaxed">
                  {rev.comment}
                </p>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};
