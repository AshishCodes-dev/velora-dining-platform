import type { Response } from 'express';
import {
  OrderModel,
  PaymentModel,
  CartModel,
  FoodModel,
  CouponModel,
  RestaurantSettingsModel,
  NotificationModel,
  CounterModel,
} from '../models/mongooseSchemas.ts';
import { sanitizeString, generateEntityId } from '../utils/security.ts';
import { validateOrderInput } from '../validators/index.ts';
import { processPaymentTransaction } from '../services/emailAndPaymentService.ts';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import type {
  CartItem,
  Order,
  OrderStatus,
  CustomizationAddon,
  PaymentRecord,
  Food,
  Coupon,
  RestaurantSettings,
} from '../models/types.ts';

function getCartKey(req: AuthenticatedRequest): string {
  if (req.user?.userId) {
    return `user-${req.user.userId}`;
  }
  const sessionHeader = req.headers['x-session-id'];
  if (typeof sessionHeader === 'string' && sessionHeader.trim()) {
    return `guest-${sessionHeader.trim().slice(0, 80)}`;
  }
  return 'guest-default';
}

const STATUS_MAP: Record<string, OrderStatus> = {
  placed: 'Order Placed',
  'order placed': 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  'out for delivery': 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function normalizeOrderStatus(raw: unknown): OrderStatus | null {
  if (typeof raw !== 'string') return null;
  return STATUS_MAP[raw.trim().toLowerCase()] || null;
}

export async function getCart(req: AuthenticatedRequest, res: Response) {
  const key = getCartKey(req);
  const cart = (await CartModel.findOne({ sessionKey: key }).lean()) as unknown as {
    sessionKey: string;
    items: CartItem[];
  } | null;
  return res.json({ success: true, items: cart?.items || [] });
}

export async function addToCart(req: AuthenticatedRequest, res: Response) {
  const key = getCartKey(req);
  const {
    foodId,
    selectedSize = 'Regular',
    selectedAddons = [],
    quantity = 1,
    specialInstructions = '',
  } = req.body || {};

  const numQty = Number(quantity);
  if (Number.isNaN(numQty) || !Number.isInteger(numQty) || numQty < 1 || numQty > 50) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be a whole number between 1 and 50.',
      error: 'Quantity must be a whole number between 1 and 50.',
    });
  }

  const food = (await FoodModel.findOne({ id: foodId, isAvailable: true }).lean()) as unknown as Food | null;
  if (!food) {
    return res.status(404).json({
      success: false,
      message: 'Dish not found or currently unavailable.',
      error: 'Dish not found or currently unavailable.',
    });
  }

  const sizeObj = food.sizes?.find((s: any) => s.name === selectedSize) || {
    name: 'Regular',
    priceDelta: 0,
    serves: 'Serves 1',
  };

  // Validate add-ons strictly against database food.addons prices
  const incomingAddonIds = Array.isArray(selectedAddons)
    ? selectedAddons.map((a: { id?: string }) => String(a?.id || ''))
    : [];
  const verifiedAddons: CustomizationAddon[] = (food.addons || []).filter((dbAddon: any) =>
    incomingAddonIds.includes(dbAddon.id)
  );

  const addonsSum = verifiedAddons.reduce((sum, a) => sum + a.price, 0);
  const discountedBase = food.price * (1 - food.discountPercent / 100);
  const unitFinalPrice = Number((discountedBase + sizeObj.priceDelta + addonsSum).toFixed(2));

  const cart = (await CartModel.findOne({ sessionKey: key }).lean()) as unknown as {
    sessionKey: string;
    items: CartItem[];
  } | null;
  const items: CartItem[] = cart?.items ? [...cart.items] : [];

  const addonKey = verifiedAddons.map((a) => a.id).sort().join(',');
  const existingItem = items.find(
    (item) =>
      item.foodId === food.id &&
      item.selectedSize === sizeObj.name &&
      item.selectedAddons.map((a) => a.id).sort().join(',') === addonKey &&
      !item.savedForLater
  );

  if (existingItem) {
    existingItem.quantity = Math.min(50, existingItem.quantity + numQty);
    existingItem.unitFinalPrice = unitFinalPrice;
  } else {
    const newItem: CartItem = {
      id: generateEntityId('ci'),
      foodId: food.id,
      foodName: food.name,
      foodImage: food.image,
      illustrationType: food.illustrationType,
      basePrice: food.price,
      discountPercent: food.discountPercent,
      selectedSize: sizeObj.name,
      sizeDelta: sizeObj.priceDelta,
      selectedAddons: verifiedAddons,
      unitFinalPrice,
      quantity: numQty,
      specialInstructions: sanitizeString(specialInstructions, 200),
      savedForLater: false,
    };
    items.push(newItem);
  }

  await CartModel.findOneAndUpdate(
    { sessionKey: key },
    { $set: { items, userId: req.user?.userId } },
    { upsert: true, new: true }
  );

  return res.status(201).json({ success: true, items });
}

export async function updateCartItem(req: AuthenticatedRequest, res: Response) {
  const key = getCartKey(req);
  const cart = (await CartModel.findOne({ sessionKey: key }).lean()) as unknown as {
    sessionKey: string;
    items: CartItem[];
  } | null;
  const items: CartItem[] = cart?.items ? [...cart.items] : [];
  const { id } = req.params;
  const item = items.find((i) => i.id === id);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Cart item not found.',
      error: 'Cart item not found.',
    });
  }

  if (req.body.quantity !== undefined) {
    const q = Number(req.body.quantity);
    if (Number.isNaN(q) || q > 50) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be between 1 and 50.',
        error: 'Quantity must be between 1 and 50.',
      });
    }
    if (q <= 0) {
      const remainingItems = items.filter((i) => i.id !== id);
      await CartModel.updateOne({ sessionKey: key }, { $set: { items: remainingItems } });
      return res.json({ success: true, items: remainingItems });
    }
    item.quantity = Math.round(q);
  }

  if (req.body.savedForLater !== undefined) {
    item.savedForLater = Boolean(req.body.savedForLater);
  }

  await CartModel.updateOne({ sessionKey: key }, { $set: { items } });
  return res.json({ success: true, items });
}

export async function removeCartItem(req: AuthenticatedRequest, res: Response) {
  const key = getCartKey(req);
  const cart = (await CartModel.findOne({ sessionKey: key }).lean()) as unknown as {
    sessionKey: string;
    items: CartItem[];
  } | null;
  const items = (cart?.items || []).filter((i: any) => i.id !== req.params.id);
  await CartModel.updateOne({ sessionKey: key }, { $set: { items } });
  return res.json({ success: true, items });
}

export async function clearCart(req: AuthenticatedRequest, res: Response) {
  const key = getCartKey(req);
  const cart = (await CartModel.findOne({ sessionKey: key }).lean()) as unknown as {
    sessionKey: string;
    items: CartItem[];
  } | null;
  const items = (cart?.items || []).filter((i: any) => i.savedForLater);
  await CartModel.updateOne({ sessionKey: key }, { $set: { items } });
  return res.json({ success: true, items });
}

/**
 * CREATE ORDER — Server-Authoritative Pricing & Coupon Calculation with Race-Safe Order Number
 */
export async function createOrder(req: AuthenticatedRequest, res: Response) {
  const validation = validateOrderInput(req.body || {});
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.error,
      error: validation.error,
    });
  }

  const rawItems = Array.isArray(req.body.items) ? req.body.items : [];
  const verifiedItems: CartItem[] = [];
  let computedSubtotal = 0;

  for (const raw of rawItems) {
    const food = (await FoodModel.findOne({ id: raw.foodId, isAvailable: true }).lean()) as unknown as Food | null;
    if (!food) {
      return res.status(400).json({
        success: false,
        message: `Dish "${raw.foodName || raw.foodId}" is no longer available.`,
        error: `Dish "${raw.foodName || raw.foodId}" is no longer available.`,
      });
    }

    const quantity = Math.min(50, Math.max(1, Math.round(Number(raw.quantity || 1))));
    const sizeObj = food.sizes?.find((s: any) => s.name === raw.selectedSize) || {
      name: 'Regular',
      priceDelta: 0,
      serves: 'Serves 1',
    };

    const requestedAddonIds = Array.isArray(raw.selectedAddons)
      ? raw.selectedAddons.map((a: { id?: string }) => String(a?.id || ''))
      : [];
    const verifiedAddons = (food.addons || []).filter((a: any) => requestedAddonIds.includes(a.id));
    const addonsSum = verifiedAddons.reduce((sum: number, a: any) => sum + a.price, 0);

    const discountedBase = food.price * (1 - food.discountPercent / 100);
    const unitFinalPrice = Number((discountedBase + sizeObj.priceDelta + addonsSum).toFixed(2));

    computedSubtotal += unitFinalPrice * quantity;

    verifiedItems.push({
      id: sanitizeString(raw.id, 60) || generateEntityId('ci'),
      foodId: food.id,
      foodName: food.name,
      foodImage: food.image,
      illustrationType: food.illustrationType,
      basePrice: food.price,
      discountPercent: food.discountPercent,
      selectedSize: sizeObj.name,
      sizeDelta: sizeObj.priceDelta,
      selectedAddons: verifiedAddons,
      unitFinalPrice,
      quantity,
      specialInstructions: raw.specialInstructions
        ? sanitizeString(raw.specialInstructions, 200)
        : undefined,
    });
  }

  computedSubtotal = Number(computedSubtotal.toFixed(2));

  // Server-side coupon verification & calculation
  let computedDiscount = 0;
  let verifiedCouponCode: string | undefined;

  if (req.body.couponCode) {
    const code = sanitizeString(req.body.couponCode, 40).toUpperCase();
    const coupon = (await CouponModel.findOne({ code, isActive: true }).lean()) as unknown as Coupon | null;
    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: `Coupon "${code}" is invalid or inactive.`,
        error: `Coupon "${code}" is invalid or inactive.`,
      });
    }
    if (new Date(coupon.expiryDate).getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: `Coupon "${code}" has expired.`,
        error: `Coupon "${code}" has expired.`,
      });
    }
    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: `Coupon "${code}" has reached its usage limit.`,
        error: `Coupon "${code}" has reached its usage limit.`,
      });
    }
    if (computedSubtotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order of $${coupon.minOrderValue.toFixed(2)} required for coupon ${code}.`,
        error: `Minimum order of $${coupon.minOrderValue.toFixed(2)} required for coupon ${code}.`,
      });
    }

    let rawDisc =
      coupon.discountType === 'PERCENTAGE'
        ? (computedSubtotal * coupon.discountValue) / 100
        : coupon.discountValue;
    if (coupon.maxDiscountAmount && rawDisc > coupon.maxDiscountAmount) {
      rawDisc = coupon.maxDiscountAmount;
    }
    computedDiscount = Number(Math.min(computedSubtotal, rawDisc).toFixed(2));
    verifiedCouponCode = coupon.code;

    // Atomically increment usage
    await CouponModel.updateOne({ code }, { $inc: { usedCount: 1 } });
  }

  const orderType = (req.body.orderType || 'Delivery') as Order['orderType'];
  const settings = ((await RestaurantSettingsModel.findOne().lean()) as unknown as RestaurantSettings | null) || {
    deliveryFee: 6,
    freeDeliveryThreshold: 65,
    taxPercent: 9,
  };
  const netAfterDiscount = Math.max(0, computedSubtotal - computedDiscount);

  const computedDeliveryFee =
    orderType === 'Delivery'
      ? netAfterDiscount >= (settings.freeDeliveryThreshold ?? 65)
        ? 0
        : settings.deliveryFee ?? 6
      : 0;

  const computedTaxAmount = Number(
    ((netAfterDiscount * (settings.taxPercent ?? 9)) / 100).toFixed(2)
  );
  const computedGrandTotal = Number(
    (netAfterDiscount + computedDeliveryFee + computedTaxAmount).toFixed(2)
  );

  // Race-safe order number generation via atomic counter + retry loop
  let orderNumber = '';
  for (let attempt = 0; attempt < 5; attempt++) {
    const counterDoc = await CounterModel.findByIdAndUpdate(
      'orderNumber',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const candidate = String(counterDoc.seq);
    const collision = await OrderModel.findOne({ orderNumber: candidate }).lean();
    if (!collision) {
      orderNumber = candidate;
      break;
    }
  }
  if (!orderNumber) {
    orderNumber = `${Date.now().toString().slice(-6)}`;
  }

  const now = new Date().toISOString();
  const paymentMethod: Order['paymentMethod'] =
    req.body.paymentMethod || 'Card (Test Mode)';

  const paymentTx = processPaymentTransaction({
    amount: computedGrandTotal,
    method: paymentMethod,
    orderNumber,
  });

  const newOrder: Order = {
    id: `ord-${orderNumber}`,
    orderNumber,
    userId: req.user?.userId || 'guest',
    customerName: sanitizeString(req.body.customerName, 100),
    customerEmail: sanitizeString(req.body.customerEmail, 120).toLowerCase(),
    customerPhone: sanitizeString(req.body.customerPhone, 30),
    items: verifiedItems,
    subtotal: computedSubtotal,
    discountAmount: computedDiscount,
    couponCode: verifiedCouponCode,
    deliveryFee: computedDeliveryFee,
    taxAmount: computedTaxAmount,
    grandTotal: computedGrandTotal,
    orderType,
    deliveryAddress:
      orderType === 'Delivery' && req.body.deliveryAddress
        ? {
            id: sanitizeString(req.body.deliveryAddress.id || 'addr-checkout', 50),
            label: sanitizeString(req.body.deliveryAddress.label || 'Delivery', 50),
            houseFlat: sanitizeString(req.body.deliveryAddress.houseFlat, 120),
            street: sanitizeString(req.body.deliveryAddress.street, 150),
            area: sanitizeString(req.body.deliveryAddress.area || 'Downtown', 100),
            city: sanitizeString(req.body.deliveryAddress.city || 'San Francisco', 80),
            state: sanitizeString(req.body.deliveryAddress.state || 'CA', 50),
            pincode: sanitizeString(req.body.deliveryAddress.pincode, 20),
          }
        : undefined,
    tableNumber:
      orderType === 'Dine-in' && req.body.tableNumber
        ? sanitizeString(req.body.tableNumber, 40)
        : undefined,
    paymentMethod,
    paymentStatus: paymentTx.status,
    status: 'Order Placed',
    statusHistory: [
      {
        status: 'Order Placed',
        timestamp: now,
        note: `${orderType} order received by VELORA Concierge`,
      },
    ],
    createdAt: now,
    estimatedDeliveryMinutes: orderType === 'Delivery' ? 35 : 20,
  };

  await OrderModel.create(newOrder);

  const payment: PaymentRecord = {
    id: generateEntityId('pay'),
    orderId: newOrder.id,
    orderNumber: newOrder.orderNumber,
    customerName: newOrder.customerName,
    amount: newOrder.grandTotal,
    method: newOrder.paymentMethod,
    status: newOrder.paymentStatus,
    transactionRef: paymentTx.transactionRef,
    createdAt: now,
  };
  await PaymentModel.create(payment);

  await NotificationModel.insertMany([
    {
      id: generateEntityId('notif'),
      targetRole: 'ADMIN',
      type: 'ORDER',
      title: `New Order #${newOrder.orderNumber} Placed`,
      message: `${newOrder.customerName} placed a $${newOrder.grandTotal.toFixed(2)} ${newOrder.orderType} order.`,
      read: false,
      createdAt: now,
      link: '/admin?tab=orders',
    },
    {
      id: generateEntityId('notif'),
      targetRole: 'CUSTOMER',
      userId: newOrder.userId,
      type: 'ORDER',
      title: `Order #${newOrder.orderNumber} Confirmed`,
      message: `Your ${newOrder.orderType} order ($${newOrder.grandTotal.toFixed(2)}) has been received by VELORA.`,
      read: false,
      createdAt: now,
      link: `/track/${newOrder.orderNumber}`,
    },
  ]);

  // Clear purchased items from cart
  const cartKey = getCartKey(req);
  const cart = (await CartModel.findOne({ sessionKey: cartKey }).lean()) as unknown as {
    sessionKey: string;
    items: CartItem[];
  } | null;
  if (cart) {
    const savedItems = (cart.items || []).filter((i: any) => i.savedForLater);
    await CartModel.updateOne({ sessionKey: cartKey }, { $set: { items: savedItems } });
  }

  return res.status(201).json({
    success: true,
    order: newOrder,
    payment: {
      ...payment,
      isSimulated: paymentTx.isSimulated,
      simulationNote: paymentTx.simulationNote,
    },
  });
}

export async function getOrders(req: AuthenticatedRequest, res: Response) {
  const { status, search, all, orderNumber, email } = req.query;
  const isStaffOrAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'STAFF';

  const filter: Record<string, any> = {};

  if (isStaffOrAdmin && all === 'true') {
    // Admin and Staff with ?all=true see all orders
  } else if (req.user) {
    // Authenticated customer: see only their own orders
    filter.$or = [
      { userId: req.user.userId },
      { customerEmail: req.user.email.toLowerCase() },
    ];
  } else {
    // Unauthenticated guest: require orderNumber + email together
    const ordNum = typeof orderNumber === 'string' ? orderNumber.replace(/^#/, '').trim() : '';
    const eml = typeof email === 'string' ? email.toLowerCase().trim() : '';
    if (!ordNum || !eml) {
      return res.status(401).json({
        success: false,
        message:
          'Authentication required. For guest order tracking, please provide both orderNumber and email.',
        error:
          'Authentication required. For guest order tracking, please provide both orderNumber and email.',
      });
    }
    filter.$and = [
      { $or: [{ orderNumber: ordNum }, { id: ordNum }] },
      { customerEmail: eml },
    ];
  }

  if (status && typeof status === 'string' && status !== 'All') {
    const normalized = normalizeOrderStatus(status);
    filter.status = normalized || status;
  }

  if (search && typeof search === 'string' && search.trim()) {
    const q = search.trim();
    const regex = new RegExp(q, 'i');
    filter.$or = [
      { orderNumber: regex },
      { customerName: regex },
      { customerEmail: regex },
    ];
  }

  const orders = await OrderModel.find(filter).sort({ createdAt: -1 }).lean();
  return res.json({ success: true, orders });
}

export async function getOrderById(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const cleanId = id.replace(/^#/, '').trim();
  const order = (await OrderModel.findOne({
    $or: [{ id }, { orderNumber: cleanId }],
  }).lean()) as unknown as Order | null;

  if (!order) {
    return res.status(404).json({
      success: false,
      message: `Order #${cleanId} not found.`,
      error: `Order #${cleanId} not found.`,
    });
  }

  const isStaffOrAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'STAFF';
  if (isStaffOrAdmin) {
    return res.json({ success: true, order });
  }

  if (req.user) {
    const isOwner =
      order.userId === req.user.userId ||
      order.customerEmail.toLowerCase() === req.user.email.toLowerCase();
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this order.',
        error: 'You do not have permission to view this order.',
      });
    }
    return res.json({ success: true, order });
  }

  // Unauthenticated guest lookup: require matching email in query (?email=...)
  const queryEmail = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : '';
  if (queryEmail && order.customerEmail.toLowerCase() === queryEmail) {
    return res.json({ success: true, order });
  }

  if (queryEmail) {
    return res.status(403).json({
      success: false,
      message: 'Email does not match this order.',
      error: 'Email does not match this order.',
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Authentication required. Please provide email verification for guest access.',
    error: 'Authentication required. Please provide email verification for guest access.',
  });
}

export async function updateOrderStatus(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { status, note, paymentStatus } = req.body || {};

  const cleanId = id.replace(/^#/, '').trim();
  const order = (await OrderModel.findOne({
    $or: [{ id }, { orderNumber: cleanId }],
  }).lean()) as unknown as Order | null;

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found.',
      error: 'Order not found.',
    });
  }

  const now = new Date().toISOString();
  const updateData: Record<string, any> = {};

  if (status) {
    const normalizedStatus = normalizeOrderStatus(status);
    if (!normalizedStatus) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status: ${String(status)}`,
        error: `Invalid order status: ${String(status)}`,
      });
    }

    if (
      (order.status === 'Delivered' || order.status === 'Cancelled') &&
      normalizedStatus !== order.status
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition order from terminal state "${order.status}" to "${normalizedStatus}".`,
        error: `Cannot transition order from terminal state "${order.status}" to "${normalizedStatus}".`,
      });
    }

    updateData.status = normalizedStatus;
    const historyEntry = {
      status: normalizedStatus,
      timestamp: now,
      note: sanitizeString(note || `Order marked as ${normalizedStatus}`, 200),
    };

    if (normalizedStatus === 'Cancelled' && order.paymentStatus === 'PAID') {
      updateData.paymentStatus = 'REFUNDED';
      await PaymentModel.updateOne({ orderId: order.id }, { $set: { status: 'REFUNDED' } });
    }

    await NotificationModel.create({
      id: generateEntityId('notif'),
      targetRole: 'CUSTOMER',
      userId: order.userId,
      type: 'ORDER',
      title: `Order #${order.orderNumber}: ${normalizedStatus}`,
      message: note || `Your order status is now "${normalizedStatus}".`,
      read: false,
      createdAt: now,
      link: `/track/${order.orderNumber}`,
    });

    const updated = (await OrderModel.findOneAndUpdate(
      { $or: [{ id }, { orderNumber: cleanId }] },
      {
        $set: updateData,
        $push: { statusHistory: historyEntry },
      },
      { new: true }
    ).lean()) as unknown as Order;

    return res.json({ success: true, order: updated });
  }

  if (paymentStatus && ['PAID', 'PENDING', 'REFUNDED'].includes(paymentStatus)) {
    updateData.paymentStatus = paymentStatus;
    await PaymentModel.updateOne({ orderId: order.id }, { $set: { status: paymentStatus } });
  }

  const updated = (await OrderModel.findOneAndUpdate(
    { $or: [{ id }, { orderNumber: cleanId }] },
    { $set: updateData },
    { new: true }
  ).lean()) as unknown as Order;

  return res.json({ success: true, order: updated });
}
