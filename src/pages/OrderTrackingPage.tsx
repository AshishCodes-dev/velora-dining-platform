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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <p className="text-xs text-[#10B981] font-medium">
            VELORA · Live Kitchen &amp; Courier Telemetry
          </p>
          <h1 className="font-serif-display text-4xl font-semibold text-[#F5F2FA] mt-1">
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
            <Search className="w-4 h-4 text-[#7E7394] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={lookupInput}
              onChange={(e) => setLookupInput(e.target.value)}
              placeholder="Order # (e.g. 10482)"
              aria-label="Order number lookup"
              className="pl-9 pr-4 py-2 rounded-xl bg-[#150F20] border border-white/10 text-xs font-mono-tabular text-[#F5F2FA] focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold"
          >
            Track Order
          </button>
        </form>
      </div>

      {/* Quick Switcher for Sample / Recent Orders */}
      {recentOrders.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#7E7394]">Quick Select Order:</span>
          {recentOrders.map((ro) => (
            <button
              key={ro.id}
              type="button"
              onClick={() => navigate(`/track/${ro.orderNumber}`)}
              className={`px-3 py-1 rounded-lg font-mono-tabular transition-colors ${
                order?.orderNumber === ro.orderNumber
                  ? 'bg-[#8B5CF6] text-white font-semibold'
                  : 'bg-[#150F20] text-[#B8AFC9] hover:text-white border border-white/10'
              }`}
            >
              #{ro.orderNumber} ({ro.status})
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="h-80 rounded-2xl bg-[#150F20] animate-pulse" />
      ) : error || !order ? (
        <div className="nocturne-surface rounded-2xl p-12 text-center space-y-4">
          <p className="font-serif-display text-3xl text-[#F5F2FA]">
            {error || 'Order not found'}
          </p>
          <p className="text-xs text-[#B8AFC9]">
            Try looking up sample order #10482, #10483, or #10481.
          </p>
          <button
            type="button"
            onClick={() => navigate('/track/10482')}
            className="px-5 py-2.5 rounded-xl bg-[#8B5CF6] text-white text-xs font-semibold"
          >
            View Sample Order #10482
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Visual Progress Stepper & Timeline */}
          <div className="lg:col-span-7 nocturne-surface rounded-2xl p-6 sm:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <p className="font-mono-tabular text-2xl font-bold text-[#F59E0B]">
                  ORDER #{order.orderNumber}
                </p>
                <p className="text-xs text-[#B8AFC9] mt-1">
                  {order.orderType} · Placed on{' '}
                  {new Date(order.createdAt).toLocaleString()} · Guest: {order.customerName}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#10B981]" />
                <span className="font-mono-tabular text-xs font-semibold text-[#10B981]">
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
              <div className="p-5 rounded-xl bg-[#23111E] border border-[#F43F5E]/40 text-xs text-[#FFE4E8]">
                ✕ This order was cancelled. Payment status: {order.paymentStatus}.
              </div>
            ) : (
              <div className="space-y-4">
                {stages.map((stage, index) => {
                  const isDone = index <= currentStageIndex;
                  const isCurrent = index === currentStageIndex;
                  const histEntry = order.statusHistory.find((h) => h.status === stage);

                  return (
                    <div
                      key={stage}
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-[#8B5CF6]/15 border-[#8B5CF6]'
                          : isDone
                          ? 'bg-[#11221F]/50 border-[#10B981]/30'
                          : 'bg-[#0D0914]/60 border-white/5 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isDone
                            ? 'bg-[#10B981] text-[#081C15]'
                            : 'bg-[#1D152C] text-[#7E7394]'
                        }`}
                      >
                        {isDone ? (
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        ) : (
                          <Circle className="w-3.5 h-3.5" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-[#F5F2FA]">
                            {isDone ? '✓' : '○'} {stage}
                          </p>
                          {histEntry && (
                            <span className="text-[11px] font-mono-tabular text-[#B8AFC9]">
                              {new Date(histEntry.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#B8AFC9] mt-0.5">
                          {histEntry?.note ||
                            (isDone
                              ? 'Completed by VELORA team'
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
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-xs text-[#7E7394]">
                  Want to test real-time status progression? Advance to the next kitchen/courier stage:
                </p>
                <button
                  type="button"
                  disabled={advancing}
                  onClick={handleAdvanceStatus}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold whitespace-nowrap shrink-0"
                >
                  <span>Advance Status → {stages[currentStageIndex + 1]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Order Receipt & Dispatch Details */}
          <div className="lg:col-span-5 nocturne-surface rounded-2xl p-6 space-y-6">
            <h2 className="font-serif-display text-2xl font-semibold text-[#F5F2FA]">
              Order Receipt &amp; Items
            </h2>

            <div className="divide-y divide-white/10 space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-[#F5F2FA]">
                      {item.quantity}x {item.foodName}
                    </p>
                    <p className="text-[11px] text-[#7E7394]">
                      Size: {item.selectedSize}
                      {item.selectedAddons.length > 0
                        ? ` · +${item.selectedAddons.map((a) => a.name).join(', ')}`
                        : ''}
                    </p>
                  </div>
                  <span className="font-mono-tabular text-xs font-semibold text-[#F59E0B]">
                    ${(item.unitFinalPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2 text-xs font-mono-tabular">
              <div className="flex justify-between text-[#B8AFC9]">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-[#10B981]">
                  <span>Discount ({order.couponCode || 'Privilege'})</span>
                  <span>-${order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#B8AFC9]">
                <span>Delivery / Service</span>
                <span>${order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#B8AFC9]">
                <span>Tax</span>
                <span>${order.taxAmount.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-bold text-[#F5F2FA]">
                <span>Grand Total ({order.paymentStatus})</span>
                <span className="text-[#F59E0B]">${order.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {order.deliveryAddress && (
              <div className="p-4 rounded-xl bg-[#0D0914] border border-white/5 text-xs space-y-1">
                <p className="text-[#7E7394] font-medium">Delivery Destination</p>
                <p className="text-[#F5F2FA] font-semibold">
                  {order.deliveryAddress.houseFlat}, {order.deliveryAddress.street}
                </p>
                <p className="text-[#B8AFC9]">
                  {order.deliveryAddress.area}, {order.deliveryAddress.city},{' '}
                  {order.deliveryAddress.state} {order.deliveryAddress.pincode}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <Link
                to="/menu"
                className="flex-1 text-center py-2.5 rounded-xl bg-[#10B981] text-[#081C15] text-xs font-semibold"
              >
                Order Again
              </Link>
              <Link
                to="/admin?tab=orders"
                className="flex-1 text-center py-2.5 rounded-xl border border-white/15 text-[#F5F2FA] text-xs font-semibold hover:bg-white/5"
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
