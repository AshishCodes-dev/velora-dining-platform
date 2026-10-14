import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Check, Circle, Clock, Search, ArrowRight } from 'lucide-react';
import { apiRequest } from '../services/api';
import { useRestaurant } from '../context/RestaurantContext';
import type { Order, OrderStatus } from '../types/restaurant';

const DELIVERY_STAGES: OrderStatus[] = [
  'Order Placed',
  'Confirmed',
  'Preparing',
  'Ready',
  'Out for Delivery',
  'Delivered',
];

const PICKUP_STAGES: OrderStatus[] = [
  'Order Placed',
  'Confirmed',
  'Preparing',
  'Ready',
  'Delivered',
];

export const OrderTrackingPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const { showToast, refreshNotifications } = useRestaurant();

  const [lookupInput, setLookupInput] = useState(orderNumber || '10482');
  const [order, setOrder] = useState<Order | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);

  const fetchOrder = async (num: string) => {
    try {
      setLoading(true);
      setError(null);
      const cleanNum = num.replace(/^#/, '').trim();
      const [orderRes, listRes] = await Promise.all([
        apiRequest<{ order: Order }>(`/api/orders/${cleanNum}`),
        apiRequest<{ orders: Order[] }>('/api/orders?all=true'),
      ]);
      setOrder(orderRes.order);
      setRecentOrders(listRes.orders.slice(0, 5));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order not found.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const target = orderNumber || '10482';
    setLookupInput(target);
    fetchOrder(target);
  }, [orderNumber]);

  const stages =
    order?.orderType === 'Delivery' ? DELIVERY_STAGES : PICKUP_STAGES;

  const currentStageIndex = order ? stages.indexOf(order.status) : -1;

  const handleAdvanceStatus = async () => {
    if (!order) return;
    const nextIdx = currentStageIndex + 1;
    if (nextIdx >= stages.length) return;
    const nextStatus = stages[nextIdx];

    try {
      setAdvancing(true);
      const res = await apiRequest<{ order: Order }>(
        `/api/orders/${order.orderNumber}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status: nextStatus,
            note: `Order progressed to ${nextStatus}`,
          }),
        }
      );
      setOrder(res.order);
      await refreshNotifications();
      showToast(`✓ Order #${order.orderNumber} status updated to ${nextStatus}`, 'success');
    } catch {
      showToast('✕ Could not update status', 'error');
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header & Order Lookup Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
        <div>
          <p className="text-xs text-green-light font-medium">
            VELORA · Live Kitchen &amp; Courier Telemetry
          </p>
          <h1 className="font-serif-display text-4xl font-semibold text-text mt-1">
            Order Status &amp; Tracking
          </h1>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (lookupInput.trim()) {
              navigate(`/track/${lookupInput.replace(/^#/, '').trim()}`);
            }
          }}
          className="flex items-center gap-2"
        >
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={lookupInput}
              onChange={(e) => setLookupInput(e.target.value)}
              placeholder="Order # (e.g. 10482)"
              aria-label="Order number lookup"
              className="pl-9 pr-4 py-2 rounded-xl bg-surface border border-border text-xs font-mono-tabular text-text placeholder-text-muted focus:outline-none focus:border-yellow"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-yellow hover:bg-yellow-hover text-black text-xs font-semibold transition-colors"
          >
            Track Order
          </button>
        </form>
      </div>

      {/* Quick Switcher for Sample / Recent Orders */}
      {recentOrders.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-text-muted">Quick Select Order:</span>
          {recentOrders.map((ro) => (
            <button
              key={ro.id}
              type="button"
              onClick={() => navigate(`/track/${ro.orderNumber}`)}
              className={`px-3 py-1 rounded-lg font-mono-tabular transition-colors ${
                order?.orderNumber === ro.orderNumber
                  ? 'bg-yellow text-black font-semibold'
                  : 'bg-surface text-text-soft hover:text-text border border-border'
              }`}
            >
              #{ro.orderNumber} ({ro.status})
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="h-80 rounded-2xl bg-surface animate-pulse" />
      ) : error || !order ? (
        <div className="nocturne-surface rounded-2xl p-12 text-center space-y-4">
          <p className="font-serif-display text-3xl text-text">
            {error || 'Order not found'}
          </p>
          <p className="text-xs text-text-soft">
            Try looking up sample order #10482, #10483, or #10481.
          </p>
          <button
            type="button"
            onClick={() => navigate('/track/10482')}
            className="px-5 py-2.5 rounded-xl bg-yellow hover:bg-yellow-hover text-black text-xs font-semibold transition-colors"
          >
            View Sample Order #10482
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Visual Progress Stepper & Timeline */}
          <div className="lg:col-span-7 nocturne-surface rounded-2xl p-6 sm:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
              <div>
                <p className="font-mono-tabular text-2xl font-bold text-yellow">
                  ORDER #{order.orderNumber}
                </p>
                <p className="text-xs text-text-soft mt-1">
                  {order.orderType} · Placed on{' '}
                  {new Date(order.createdAt).toLocaleString()} · Guest: {order.customerName}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-light" />
                <span className="font-mono-tabular text-xs font-semibold text-green-light">
                  {order.status === 'Delivered'
                    ? 'Completed'
                    : order.status === 'Cancelled'
                    ? 'Cancelled'
                    : `Est. ${order.estimatedDeliveryMinutes} mins`}
                </span>
              </div>
            </div>

            {/* Step-by-Step Visual Tracker */}
            {order.status === 'Cancelled' ? (
              <div className="p-5 rounded-xl bg-danger/10 border border-danger/40 text-xs text-text">
                ✕ This order was cancelled. Payment status: {order.paymentStatus}.
              </div>
            ) : (
              <div className="space-y-4">
                {stages.map((stage, index) => {
                  const isCompleted =
                    order.status === 'Delivered'
                      ? index <= currentStageIndex
                      : index < currentStageIndex;
                  const isCurrent =
                    order.status !== 'Delivered' && index === currentStageIndex;
                  const histEntry = order.statusHistory.find((h) => h.status === stage);

                  return (
                    <div
                      key={stage}
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-yellow/15 border-yellow'
                          : isCompleted
                          ? 'bg-green-mid/20 border-green-light/30'
                          : 'bg-canvas/60 border-border opacity-60'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isCompleted
                            ? 'bg-green-light text-black'
                            : isCurrent
                            ? 'bg-yellow text-black'
                            : 'bg-elevated text-text-muted'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        ) : isCurrent ? (
                          <Clock className="w-3.5 h-3.5" />
                        ) : (
                          <Circle className="w-3.5 h-3.5" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-sm font-semibold ${
                              isCompleted
                                ? 'text-green-light'
                                : isCurrent
                                ? 'text-yellow'
                                : 'text-text-muted'
                            }`}
                          >
                            {isCompleted ? '✓' : isCurrent ? '●' : '○'} {stage}
                          </p>
                          {histEntry && (
                            <span className="text-[11px] font-mono-tabular text-text-soft">
                              {new Date(histEntry.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs mt-0.5 ${
                            isCurrent
                              ? 'text-text'
                              : isCompleted
                              ? 'text-text-soft'
                              : 'text-text-muted'
                          }`}
                        >
                          {histEntry?.note ||
                            (isCompleted
                              ? 'Completed by VELORA team'
                              : isCurrent
                              ? 'Currently in progress'
                              : 'Awaiting next stage')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Interactive Simulator Control to test next stage */}
            {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
              <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-xs text-text-muted">
                  Want to test real-time status progression? Advance to the next kitchen/courier stage:
                </p>
                <button
                  type="button"
                  disabled={advancing}
                  onClick={handleAdvanceStatus}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow hover:bg-yellow-hover text-black text-xs font-semibold whitespace-nowrap shrink-0 transition-colors"
                >
                  <span>Advance Status → {stages[currentStageIndex + 1]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Order Receipt & Dispatch Details */}
          <div className="lg:col-span-5 nocturne-surface rounded-2xl p-6 space-y-6">
            <h2 className="font-serif-display text-2xl font-semibold text-text">
              Order Receipt &amp; Items
            </h2>

            <div className="divide-y divide-border space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-text">
                      {item.quantity}x {item.foodName}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      Size: {item.selectedSize}
                      {item.selectedAddons.length > 0
                        ? ` · +${item.selectedAddons.map((a) => a.name).join(', ')}`
                        : ''}
                    </p>
                  </div>
                  <span className="font-mono-tabular text-xs font-semibold text-yellow">
                    ${(item.unitFinalPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border space-y-2 text-xs font-mono-tabular">
              <div className="flex justify-between text-text-soft">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-light">
                  <span>Discount ({order.couponCode || 'Privilege'})</span>
                  <span>-${order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-text-soft">
                <span>Delivery / Service</span>
                <span>${order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-text-soft">
                <span>Tax</span>
                <span>${order.taxAmount.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between text-sm font-bold text-text">
                <span>Grand Total ({order.paymentStatus})</span>
                <span className="text-yellow">${order.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {order.deliveryAddress && (
              <div className="p-4 rounded-xl bg-canvas border border-border text-xs space-y-1">
                <p className="text-text-muted font-medium">Delivery Destination</p>
                <p className="text-text font-semibold">
                  {order.deliveryAddress.houseFlat}, {order.deliveryAddress.street}
                </p>
                <p className="text-text-soft">
                  {order.deliveryAddress.area}, {order.deliveryAddress.city},{' '}
                  {order.deliveryAddress.state} {order.deliveryAddress.pincode}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <Link
                to="/menu"
                className="flex-1 text-center py-2.5 rounded-xl bg-green-light hover:bg-green-mid text-black text-xs font-semibold transition-colors"
              >
                Order Again
              </Link>
              <Link
                to="/admin?tab=orders"
                className="flex-1 text-center py-2.5 rounded-xl border border-border text-text text-xs font-semibold hover:bg-elevated transition-colors"
              >
                Manage in Admin
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
