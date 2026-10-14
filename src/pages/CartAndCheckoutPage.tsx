import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRestaurant } from '../context/RestaurantContext';
import { apiRequest } from '../services/api';
import type { Order, OrderType } from '../types/restaurant';
import { CartItemList } from '../components/cart/CartItemList';
import { CheckoutForm } from '../components/cart/CheckoutForm';
import { OrderSummarySidebar } from '../components/cart/OrderSummarySidebar';

export const CartAndCheckoutPage: React.FC = () => {
  const {
    user,
    activeCartItems,
    savedCartItems,
    appliedCoupon,
    discountAmount,
    cartSubtotal,
    cartDeliveryFee,
    cartTax,
    coupons,
    settings,
    updateCartItem,
    removeCartItem,
    applyCoupon,
    removeCoupon,
    refreshCart,
    refreshNotifications,
    showToast,
  } = useRestaurant();

  const navigate = useNavigate();

  const [step, setStep] = useState<'cart' | 'checkout'>('cart');

  // Checkout Form State
  const [customerName, setCustomerName] = useState(user?.name || 'Elena Rostova');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+1 (415) 602-8819');
  const [customerEmail, setCustomerEmail] = useState(user?.email || 'elena@example.com');
  const [orderType, setOrderType] = useState<OrderType>('Delivery');
  const [houseFlat, setHouseFlat] = useState(
    user?.addresses[0]?.houseFlat || 'Apt 1204, The Lumina'
  );
  const [street, setStreet] = useState(user?.addresses[0]?.street || '201 Folsom Street');
  const [area, setArea] = useState(user?.addresses[0]?.area || 'Rincon Hill');
  const [city, setCity] = useState(user?.addresses[0]?.city || 'San Francisco');
  const [state, setState] = useState(user?.addresses[0]?.state || 'CA');
  const [pincode, setPincode] = useState(user?.addresses[0]?.pincode || '94105');
  const [tableNumber, setTableNumber] = useState('Table 04 — Velvet Chef Counter');
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('Card (Test Mode)');
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    if (user) {
      setCustomerName(user.name);
      setCustomerPhone(user.phone);
      setCustomerEmail(user.email);
      const defAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      if (defAddr) {
        setHouseFlat(defAddr.houseFlat);
        setStreet(defAddr.street);
        setArea(defAddr.area);
        setCity(defAddr.city);
        setState(defAddr.state);
        setPincode(defAddr.pincode);
      }
    }
  }, [user]);

  const effectiveDeliveryFee = orderType === 'Delivery' ? cartDeliveryFee : 0;
  const effectiveGrandTotal = Number(
    Math.max(0, cartSubtotal - discountAmount + effectiveDeliveryFee + cartTax).toFixed(2)
  );

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeCartItems.length === 0) {
      showToast('✕ Your cart is empty', 'error');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      showToast('✕ Please complete customer contact details', 'error');
      return;
    }
    if (orderType === 'Delivery' && (!houseFlat.trim() || !street.trim() || !pincode.trim())) {
      showToast('✕ Please provide your delivery address (House/Flat, Street, Pincode)', 'error');
      return;
    }

    try {
      setPlacingOrder(true);
      const res = await apiRequest<{ order: Order }>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          items: activeCartItems,
          subtotal: cartSubtotal,
          discountAmount,
          couponCode: appliedCoupon?.code,
          deliveryFee: effectiveDeliveryFee,
          taxAmount: cartTax,
          grandTotal: effectiveGrandTotal,
          orderType,
          deliveryAddress:
            orderType === 'Delivery'
              ? {
                  id: 'addr-checkout',
                  label: 'Delivery Destination',
                  houseFlat,
                  street,
                  area,
                  city,
                  state,
                  pincode,
                }
              : undefined,
          tableNumber: orderType === 'Dine-in' ? tableNumber : undefined,
          paymentMethod,
        }),
      });

      removeCoupon();
      await refreshCart();
      await refreshNotifications();
      showToast('✓ Order placed successfully', 'success');
      navigate(`/track/${res.order.orderNumber}`);
    } catch (err) {
      showToast(err instanceof Error ? `✕ ${err.message}` : '✕ Something went wrong', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  const freeDeliveryThreshold = settings?.freeDeliveryThreshold ?? 65;
  const amountToFreeDelivery = Math.max(
    0,
    Number((freeDeliveryThreshold - (cartSubtotal - discountAmount)).toFixed(2))
  );

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header & Step Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-xs text-yellow font-medium">
            VELORA · Culinary Bag &amp; Dispatch
          </p>
          <h1 className="font-serif-display text-4xl font-semibold text-text mt-1">
            {step === 'cart' ? 'Your Tasting Cart' : 'Complete Your Order'}
          </h1>
        </div>

        {activeCartItems.length > 0 && (
          <div className="flex items-center gap-2 p-1 rounded-xl bg-surface border border-border self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setStep('cart')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                step === 'cart'
                  ? 'bg-yellow text-black'
                  : 'text-text-soft hover:text-text'
              }`}
            >
              1. Review Cart ({activeCartItems.length})
            </button>
            <button
              type="button"
              onClick={() => setStep('checkout')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                step === 'checkout'
                  ? 'bg-green-light text-black'
                  : 'text-text-soft hover:text-text'
              }`}
            >
              2. Checkout &amp; Dispatch
            </button>
          </div>
        )}
      </div>

      {/* Empty Cart State */}
      {activeCartItems.length === 0 && savedCartItems.length === 0 ? (
        <div className="nocturne-surface rounded-2xl py-20 px-4 text-center space-y-4">
          <p className="font-serif-display text-3xl text-text">Your cart is currently empty</p>
          <p className="text-xs sm:text-sm text-text-soft max-w-md mx-auto">
            Explore our wood-fired sourdough pizzas, A5 Wagyu medallions, royal saffron biryanis, and artisanal desserts.
          </p>
          <div className="pt-2 flex items-center justify-center gap-4">
            <Link
              to="/menu"
              className="px-6 py-3 rounded-xl bg-green-light hover:bg-green-mid text-black text-xs font-semibold transition-colors"
            >
              Explore Artisanal Menu
            </Link>
            <Link
              to="/track/10482"
              className="px-6 py-3 rounded-xl border border-border text-xs font-semibold text-text hover:bg-elevated transition-colors"
            >
              Track Active Order #10482
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Cart Items OR Checkout Form */}
          <div className="lg:col-span-7 space-y-6">
            {step === 'cart' ? (
              <CartItemList
                activeCartItems={activeCartItems}
                savedCartItems={savedCartItems}
                amountToFreeDelivery={amountToFreeDelivery}
                onUpdateCartItem={updateCartItem}
                onRemoveCartItem={removeCartItem}
              />
            ) : (
              <CheckoutForm
                user={user}
                orderType={orderType}
                setOrderType={setOrderType}
                customerName={customerName}
                setCustomerName={setCustomerName}
                customerPhone={customerPhone}
                setCustomerPhone={setCustomerPhone}
                customerEmail={customerEmail}
                setCustomerEmail={setCustomerEmail}
                houseFlat={houseFlat}
                setHouseFlat={setHouseFlat}
                street={street}
                setStreet={setStreet}
                area={area}
                setArea={setArea}
                city={city}
                setCity={setCity}
                state={state}
                setState={setState}
                pincode={pincode}
                setPincode={setPincode}
                tableNumber={tableNumber}
                setTableNumber={setTableNumber}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                onSubmit={handlePlaceOrder}
              />
            )}
          </div>

          {/* Right Column: Order Summary & Coupon Application */}
          <OrderSummarySidebar
            step={step}
            setStep={setStep}
            activeCartItems={activeCartItems}
            cartSubtotal={cartSubtotal}
            discountAmount={discountAmount}
            effectiveDeliveryFee={effectiveDeliveryFee}
            cartTax={cartTax}
            effectiveGrandTotal={effectiveGrandTotal}
            orderType={orderType}
            appliedCoupon={appliedCoupon}
            coupons={coupons}
            settings={settings}
            placingOrder={placingOrder}
            onApplyCoupon={applyCoupon}
            onRemoveCoupon={removeCoupon}
          />
        </div>
      )}
    </div>
  );
};
