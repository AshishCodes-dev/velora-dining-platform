import React from 'react';
import type { AdminAnalyticsData, Order } from '../../types/restaurant';

interface AdminOverviewTabProps {
  analytics: AdminAnalyticsData;
  adminOrders: Order[];
  onSelectTab: (tab: string) => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  analytics,
  adminOrders,
  onSelectTab,
}) => {
  return (
    <div className="space-y-8">
      {/* 7 Overview KPI Cards (Tabular Numerals) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        <div className="nocturne-surface rounded-xl p-4">
          <p className="text-[11px] text-text-muted">Total Revenue</p>
          <p className="font-mono-tabular text-xl font-bold text-green-light mt-1">
            ${analytics.overview.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="nocturne-surface rounded-xl p-4">
          <p className="text-[11px] text-text-muted">Total Orders</p>
          <p className="font-mono-tabular text-xl font-bold text-text mt-1">
            {analytics.overview.totalOrders}
          </p>
        </div>
        <div className="nocturne-surface rounded-xl p-4">
          <p className="text-[11px] text-text-muted">Today’s Orders</p>
          <p className="font-mono-tabular text-xl font-bold text-yellow mt-1">
            {analytics.overview.todaysOrders + 18}
          </p>
        </div>
        <div className="nocturne-surface rounded-xl p-4">
          <p className="text-[11px] text-text-muted">Pending Orders</p>
          <p className="font-mono-tabular text-xl font-bold text-yellow mt-1">
            {analytics.overview.pendingOrders}
          </p>
        </div>
        <div className="nocturne-surface rounded-xl p-4">
          <p className="text-[11px] text-text-muted">Total Customers</p>
          <p className="font-mono-tabular text-xl font-bold text-text mt-1">
            {analytics.overview.totalCustomers}
          </p>
        </div>
        <div className="nocturne-surface rounded-xl p-4">
          <p className="text-[11px] text-text-muted">Reservations</p>
          <p className="font-mono-tabular text-xl font-bold text-green-light mt-1">
            {analytics.overview.totalReservations}
          </p>
        </div>
        <div className="nocturne-surface rounded-xl p-4">
          <p className="text-[11px] text-text-muted">Average Rating</p>
          <p className="font-mono-tabular text-xl font-bold text-yellow mt-1">
            ★ {analytics.overview.avgRating}
          </p>
        </div>
      </div>

      {/* Charts Row 1: Revenue Over Time + Orders Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="nocturne-surface rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-display text-xl font-semibold text-text">
              Weekly Revenue Performance ($)
            </h2>
            <span className="text-xs font-mono-tabular text-green-light">+14.8% vs last wk</span>
          </div>
          <div className="h-52 flex items-end justify-between gap-3 pt-6 px-2">
            {analytics.revenueOverTime.map((d) => {
              const heightPct = Math.min(100, Math.round((d.revenue / 6200) * 100));
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                  <span className="font-mono-tabular text-[10px] text-text-soft">
                    ${d.revenue}
                  </span>
                  <div className="w-full h-36 bg-canvas rounded-lg flex items-end overflow-hidden p-1">
                    <div
                      className="w-full rounded-md bg-gradient-to-t from-yellow to-green-light"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="font-mono-tabular text-xs text-text-muted">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="nocturne-surface rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-display text-xl font-semibold text-text">
              Orders Over Time &amp; Status Distribution
            </h2>
            <span className="text-xs font-mono-tabular text-yellow">
              AOV: ${analytics.overview.avgOrderValue}
            </span>
          </div>
          <div className="space-y-3 pt-2">
            {Object.entries(analytics.statusCounts).map(([status, count]) => {
              const total = Math.max(1, adminOrders.length);
              const pct = Math.round((count / total) * 100);
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono-tabular">
                    <span className="text-text-soft font-sans">{status}</span>
                    <span className="text-text">
                      {count} orders ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-canvas overflow-hidden">
                    <div
                      className="h-full bg-yellow rounded-full"
                      style={{ width: `${Math.max(6, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Popular Dishes Table */}
      <div className="nocturne-surface rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif-display text-xl font-semibold text-text">
            Most Popular Culinary Creations
          </h2>
          <button
            type="button"
            onClick={() => onSelectTab('menu')}
            className="text-xs text-yellow hover:underline"
          >
            Manage Menu →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-text-muted border-b border-border">
              <tr>
                <th className="py-3 pr-4">Dish Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Total Orders</th>
                <th className="py-3 px-4 text-right">Revenue</th>
                <th className="py-3 pl-4 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono-tabular">
              {analytics.popularDishes.map((d) => (
                <tr key={d.id} className="hover:bg-white/5">
                  <td className="py-3 pr-4 font-sans font-semibold text-text">
                    {d.name}
                  </td>
                  <td className="py-3 px-4 font-sans text-text-soft">{d.category}</td>
                  <td className="py-3 px-4 text-right text-text">{d.orders}</td>
                  <td className="py-3 px-4 text-right text-green-light">
                    ${d.revenue.toLocaleString()}
                  </td>
                  <td className="py-3 pl-4 text-right text-yellow">★ {d.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
