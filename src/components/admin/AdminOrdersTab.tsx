import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Order, OrderStatus } from '../../types/restaurant';

interface AdminOrdersTabProps {
  orders: Order[];
  onStatusUpdate: (orderNumber: string, status: OrderStatus) => Promise<void>;
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({
  orders,
  onStatusUpdate,
}) => {
  const navigate = useNavigate();
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');

  const filteredOrders =
    orderStatusFilter === 'All'
      ? orders
      : orders.filter(
          (o) =>
            o.status.toLowerCase() === orderStatusFilter.toLowerCase() ||
            (orderStatusFilter === 'Pending' && o.status === 'Order Placed')
        );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {[
          'All',
          'Pending',
          'Confirmed',
          'Preparing',
          'Ready',
          'Out for Delivery',
          'Delivered',
          'Cancelled',
        ].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setOrderStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              orderStatusFilter === st
                ? 'bg-yellow text-black'
                : 'bg-surface text-text-soft border border-border hover:text-text'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredOrders.map((ord) => (
          <div
            key={ord.id}
            className="nocturne-surface rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 font-mono-tabular text-xs">
                <span className="text-sm font-bold text-yellow">
                  ORDER #{ord.orderNumber}
                </span>
                <span className="text-text-muted">·</span>
                <span
                  className={`font-semibold ${
                    ord.status === 'Cancelled'
                      ? 'text-danger'
                      : ord.status === 'Delivered' ||
                        ord.status === 'Confirmed' ||
                        ord.status === 'Ready'
                      ? 'text-green-light'
                      : 'text-yellow'
                  }`}
                >
                  {ord.status}
                </span>
                <span className="text-text-muted">·</span>
                <span
                  className={
                    ord.paymentStatus === 'PAID'
                      ? 'text-green-light'
                      : 'text-yellow'
                  }
                >
                  {ord.paymentStatus}
                </span>
                <span className="text-text-muted">·</span>
                <span className="text-text-muted">
                  {new Date(ord.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm font-semibold text-text">
                Guest: {ord.customerName} ({ord.customerPhone}) · {ord.orderType}
              </p>
              <p className="text-xs text-text-soft">
                Items: {ord.items.map((i) => `${i.quantity}x ${i.foodName} (${i.selectedSize})`).join(' | ')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono-tabular text-base font-bold text-yellow mr-2">
                ${ord.grandTotal.toFixed(2)}
              </span>

              <select
                aria-label={`Update status for order ${ord.orderNumber}`}
                value={ord.status}
                onChange={(e) =>
                  onStatusUpdate(ord.orderNumber, e.target.value as OrderStatus)
                }
                className="px-3 py-2 rounded-xl bg-canvas border border-border text-xs text-text focus:border-yellow"
              >
                <option value="Order Placed">Order Placed</option>
                <option value="Confirmed">Accept / Confirmed</option>
                <option value="Preparing">Preparing</option>
                <option value="Ready">Ready</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancel &amp; Refund</option>
              </select>

              <button
                type="button"
                onClick={() => navigate(`/track/${ord.orderNumber}`)}
                className="px-3.5 py-2 rounded-xl bg-elevated hover:bg-yellow hover:text-black text-xs font-semibold text-text border border-border transition-colors"
              >
                View Live Tracker
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
