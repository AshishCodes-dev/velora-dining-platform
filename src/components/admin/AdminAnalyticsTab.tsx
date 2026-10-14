import React from 'react';
import type { AdminAnalyticsData } from '../../types/restaurant';

interface AdminAnalyticsTabProps {
  analytics: AdminAnalyticsData;
}

export const AdminAnalyticsTab: React.FC<AdminAnalyticsTabProps> = ({ analytics }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="nocturne-surface rounded-2xl p-6 space-y-4">
        <h2 className="font-serif-display text-2xl font-semibold text-[#F5F2FA]">
          Revenue by Category Share
        </h2>
        <div className="space-y-3">
          {analytics.categoryPerformance.map((cp) => (
            <div key={cp.category} className="space-y-1">
              <div className="flex justify-between text-xs font-mono-tabular">
                <span className="font-sans text-[#F5F2FA]">{cp.category}</span>
                <span className="text-[#F59E0B]">
                  ${cp.revenue.toLocaleString()} ({cp.share}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#0D0914] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#10B981] rounded-full"
                  style={{ width: `${cp.share}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="nocturne-surface rounded-2xl p-6 space-y-4">
        <h2 className="font-serif-display text-2xl font-semibold text-[#F5F2FA]">
          Peak Evening Ordering Hours
        </h2>
        <div className="h-52 flex items-end justify-between gap-3 pt-6">
          {analytics.peakHours.map((ph) => {
            const pct = Math.min(100, Math.round((ph.orders / 70) * 100));
            return (
              <div key={ph.hour} className="flex-1 flex flex-col items-center gap-2">
                <span className="font-mono-tabular text-[10px] text-[#F59E0B]">
                  {ph.orders}
                </span>
                <div className="w-full h-36 bg-[#0D0914] rounded-lg flex items-end p-1">
                  <div
                    className="w-full bg-[#EC4899] rounded-md"
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className="font-mono-tabular text-[11px] text-[#7E7394]">
                  {ph.hour}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
