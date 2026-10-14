import type { Request, Response } from 'express';
import {
  CouponModel,
  OfferModel,
  StaffModel,
  UserModel,
  OrderModel,
  FoodModel,
  ReservationModel,
  ReviewModel,
  RestaurantSettingsModel,
  PaymentModel,
  NotificationModel,
} from '../models/mongooseSchemas.ts';
import { sanitizeString, generateEntityId } from '../utils/security.ts';
import { validateCouponInput } from '../validators/index.ts';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import type {
  Coupon,
  Offer,
  StaffMember,
  Order,
  Food,
  Reservation,
  Review,
  User,
} from '../models/types.ts';

export async function getCoupons(req: Request, res: Response) {
  const { all } = req.query;
  const filter = all === 'true' ? {} : { isActive: true };
  const coupons = await CouponModel.find(filter).lean();
  return res.json({ success: true, coupons });
}

export async function applyCoupon(req: Request, res: Response) {
  const code = sanitizeString(req.body?.code, 40).toUpperCase();
  const subtotal = Number(req.body?.subtotal || 0);

  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a coupon code.',
      error: 'Please enter a coupon code.',
    });
  }

  const coupon = (await CouponModel.findOne({ code }).lean()) as unknown as Coupon | null;
  if (!coupon || !coupon.isActive) {
    return res.status(404).json({
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

  if (subtotal < coupon.minOrderValue) {
    return res.status(400).json({
      success: false,
      message: `Minimum order of $${coupon.minOrderValue.toFixed(2)} required for ${code}.`,
      error: `Minimum order of $${coupon.minOrderValue.toFixed(2)} required for ${code}.`,
    });
  }

  let discountAmount =
    coupon.discountType === 'PERCENTAGE'
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;

  if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
    discountAmount = coupon.maxDiscountAmount;
  }

  discountAmount = Number(Math.min(subtotal, discountAmount).toFixed(2));

  return res.json({
    success: true,
    coupon,
    discountAmount,
    message: `Coupon ${coupon.code} applied! You saved $${discountAmount.toFixed(2)}.`,
  });
}

export async function createCoupon(req: Request, res: Response) {
  const validation = validateCouponInput(req.body || {});
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.error,
      error: validation.error,
    });
  }

  const code = sanitizeString(req.body?.code, 30).toUpperCase();
  const exists = await CouponModel.findOne({ code }).lean();
  if (exists) {
    return res.status(409).json({
      success: false,
      message: `Coupon code "${code}" already exists.`,
      error: `Coupon code "${code}" already exists.`,
    });
  }

  const newCoupon: Coupon = {
    id: generateEntityId('coup'),
    code,
    title: sanitizeString(req.body?.title || `${code} Special Privilege`, 100),
    description: sanitizeString(
      req.body?.description || 'Promotional culinary discount',
      200
    ),
    discountType: req.body?.discountType === 'FIXED' ? 'FIXED' : 'PERCENTAGE',
    discountValue: Number(req.body?.discountValue || 10),
    minOrderValue: Number(req.body?.minOrderValue || 25),
    maxDiscountAmount: req.body?.maxDiscountAmount
      ? Number(req.body.maxDiscountAmount)
      : undefined,
    expiryDate: sanitizeString(req.body?.expiryDate || '2027-12-31', 20),
    usageLimit: Number(req.body?.usageLimit || 100),
    usedCount: 0,
    isActive: req.body?.isActive !== undefined ? Boolean(req.body.isActive) : true,
  };

  await CouponModel.create(newCoupon);
  return res.status(201).json({ success: true, coupon: newCoupon });
}

export async function updateCoupon(req: Request, res: Response) {
  const updateData: Partial<Coupon> = {};
  if (req.body.isActive !== undefined) updateData.isActive = Boolean(req.body.isActive);
  if (req.body.discountValue !== undefined) updateData.discountValue = Number(req.body.discountValue);
  if (req.body.minOrderValue !== undefined) updateData.minOrderValue = Number(req.body.minOrderValue);
  if (req.body.title !== undefined) updateData.title = sanitizeString(req.body.title, 100);

  const coupon = (await CouponModel.findOneAndUpdate(
    { id: req.params.id },
    { $set: updateData },
    { new: true }
  ).lean()) as unknown as Coupon | null;

  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: 'Coupon not found.',
      error: 'Coupon not found.',
    });
  }
  return res.json({ success: true, coupon });
}

export async function deleteCoupon(req: Request, res: Response) {
  await CouponModel.deleteOne({ id: req.params.id });
  const remaining = await CouponModel.find().lean();
  return res.json({ success: true, coupons: remaining });
}

export async function getOffers(_req: Request, res: Response) {
  const offers = await OfferModel.find().lean();
  return res.json({ success: true, offers });
}

export async function createOffer(req: Request, res: Response) {
  const title = sanitizeString(req.body?.title, 100);
  if (!title) {
    return res.status(400).json({
      success: false,
      message: 'Offer title is required.',
      error: 'Offer title is required.',
    });
  }
  const newOffer: Offer = {
    id: generateEntityId('offer'),
    title,
    subtitle: sanitizeString(req.body?.subtitle || 'Special Privilege', 100),
    description: sanitizeString(
      req.body?.description || 'Limited-time VELORA dining privilege.',
      300
    ),
    badgeText: sanitizeString(req.body?.badgeText || 'Featured Offer', 40),
    couponCode: sanitizeString(req.body?.couponCode || 'WELCOME10', 30).toUpperCase(),
    accentColor: req.body?.accentColor || 'purple',
    validUntil: sanitizeString(req.body?.validUntil || '2027-12-31', 20),
    isActive: true,
  };

  await OfferModel.create(newOffer);
  return res.status(201).json({ success: true, offer: newOffer });
}

export async function deleteOffer(req: Request, res: Response) {
  await OfferModel.deleteOne({ id: req.params.id });
  const remaining = await OfferModel.find().lean();
  return res.json({ success: true, offers: remaining });
}

/**
 * REAL DATABASE ANALYTICS ENGINE
 * Computes all KPIs directly from MongoDB collections with lean queries.
 */
export async function getAdminAnalytics(_req: Request, res: Response) {
  const [orders, foods, users, reservations, reviews] = await Promise.all([
    OrderModel.find().lean().then((d) => d as unknown as Order[]),
    FoodModel.find().lean().then((d) => d as unknown as Food[]),
    UserModel.find().lean().then((d) => d as unknown as User[]),
    ReservationModel.find().lean().then((d) => d as unknown as Reservation[]),
    ReviewModel.find({ status: 'PUBLISHED' }).lean().then((d) => d as unknown as Review[]),
  ]);

  const now = new Date();
  const todayIsoDate = now.toISOString().slice(0, 10);
  const thirtyDaysAgoMs = now.getTime() - 30 * 24 * 3600 * 1000;

  const nonCancelledOrders = orders.filter((o) => o.status !== 'Cancelled');
  const completedOrdersList = orders.filter((o) => o.status === 'Delivered');
  const cancelledOrdersList = orders.filter((o) => o.status === 'Cancelled');
  const pendingOrdersList = orders.filter(
    (o) =>
      o.status === 'Order Placed' ||
      o.status === 'Confirmed' ||
      o.status === 'Preparing' ||
      o.status === 'Ready' ||
      o.status === 'Out for Delivery'
  );

  const totalRevenue = Number(
    nonCancelledOrders.reduce((sum, o) => sum + o.grandTotal, 0).toFixed(2)
  );

  const todaysNonCancelled = nonCancelledOrders.filter(
    (o) => o.createdAt.slice(0, 10) === todayIsoDate
  );
  const todaysRevenue = Number(
    todaysNonCancelled.reduce((sum, o) => sum + o.grandTotal, 0).toFixed(2)
  );

  const totalOrders = orders.length;
  const todaysOrders = orders.filter((o) => o.createdAt.slice(0, 10) === todayIsoDate).length;
  const completedOrders = completedOrdersList.length;
  const pendingOrders = pendingOrdersList.length;
  const cancelledOrders = cancelledOrdersList.length;

  const customerUsers = users.filter((u) => u.role === 'CUSTOMER');
  const totalCustomers = customerUsers.length;
  const newCustomers = customerUsers.filter(
    (u) => new Date(u.createdAt).getTime() >= thirtyDaysAgoMs
  ).length;

  const totalReservations = reservations.length;
  const avgOrderValue =
    nonCancelledOrders.length > 0
      ? Number((totalRevenue / nonCancelledOrders.length).toFixed(2))
      : 0;

  const avgRating =
    reviews.length > 0
      ? Number(
          (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(2)
        )
      : foods.length > 0
      ? Number(
          (foods.reduce((acc, f) => acc + f.rating, 0) / foods.length).toFixed(2)
        )
      : 5.0;

  // 1. Revenue & Orders by Date over the last 7 days
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const revenueOverTime: { day: string; date: string; revenue: number; orders: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabel = dayNames[d.getUTCDay()];

    const dayOrders = orders.filter((o) => o.createdAt.slice(0, 10) === dateStr);
    const dayValidOrders = dayOrders.filter((o) => o.status !== 'Cancelled');
    const dayRev = Number(
      dayValidOrders.reduce((sum, o) => sum + o.grandTotal, 0).toFixed(2)
    );

    revenueOverTime.push({
      day: `${dayLabel} (${dateStr.slice(5)})`,
      date: dateStr,
      revenue: dayRev,
      orders: dayOrders.length,
    });
  }

  // 2. Order Status Distribution
  const statusCounts: Record<string, number> = {
    'Order Placed': 0,
    Confirmed: 0,
    Preparing: 0,
    Ready: 0,
    'Out for Delivery': 0,
    Delivered: 0,
    Cancelled: 0,
  };
  orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  // 3. Popular Dishes & Category Performance
  const dishStatsMap = new Map<
    string,
    {
      id: string;
      name: string;
      category: string;
      orders: number;
      revenue: number;
      rating: number;
    }
  >();

  const categoryRevMap = new Map<string, number>();

  foods.forEach((f) => {
    dishStatsMap.set(f.id, {
      id: f.id,
      name: f.name,
      category: f.categoryName,
      orders: 0,
      revenue: 0,
      rating: f.rating,
    });
  });

  nonCancelledOrders.forEach((ord) => {
    ord.items.forEach((item) => {
      const lineTotal = Number((item.unitFinalPrice * item.quantity).toFixed(2));
      const foodObj = foods.find((f) => f.id === item.foodId);
      const catName = foodObj?.categoryName || 'Main Course';

      categoryRevMap.set(catName, (categoryRevMap.get(catName) || 0) + lineTotal);

      const existing = dishStatsMap.get(item.foodId);
      if (existing) {
        existing.orders += item.quantity;
        existing.revenue = Number((existing.revenue + lineTotal).toFixed(2));
      } else {
        dishStatsMap.set(item.foodId, {
          id: item.foodId,
          name: item.foodName,
          category: catName,
          orders: item.quantity,
          revenue: lineTotal,
          rating: 4.9,
        });
      }
    });
  });

  const popularDishes = Array.from(dishStatsMap.values())
    .sort((a, b) => b.orders - a.orders || b.revenue - a.revenue)
    .slice(0, 6);

  const totalItemRevenue = Math.max(
    1,
    Array.from(categoryRevMap.values()).reduce((sum, v) => sum + v, 0)
  );

  const categoryPerformance = Array.from(categoryRevMap.entries())
    .map(([category, rev]) => ({
      category,
      revenue: Number(rev.toFixed(2)),
      share: Math.max(1, Math.round((rev / totalItemRevenue) * 100)),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // 4. Peak Ordering Times
  const hourBuckets: Record<string, number> = {
    '17:00': 0,
    '18:00': 0,
    '19:00': 0,
    '20:00': 0,
    '21:00': 0,
    '22:00': 0,
    '23:00': 0,
  };

  orders.forEach((o) => {
    const hr = new Date(o.createdAt).getUTCHours();
    const key = `${String(Math.min(23, Math.max(17, hr))).padStart(2, '0')}:00`;
    hourBuckets[key] = (hourBuckets[key] || 0) + 1;
  });

  const peakHours = Object.entries(hourBuckets).map(([hour, count]) => ({
    hour,
    orders: count,
  }));

  // 5. Reservation Trends
  const resByAreaMap = new Map<string, { area: string; count: number; guests: number }>();
  reservations.forEach((r) => {
    const cur = resByAreaMap.get(r.tableArea) || {
      area: r.tableArea,
      count: 0,
      guests: 0,
    };
    cur.count += 1;
    cur.guests += r.guests;
    resByAreaMap.set(r.tableArea, cur);
  });
  const reservationTrends = Array.from(resByAreaMap.values()).sort(
    (a, b) => b.count - a.count
  );

  return res.json({
    success: true,
    overview: {
      totalRevenue,
      todaysRevenue,
      liveSessionRevenue: totalRevenue,
      totalOrders,
      todaysOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      totalCustomers,
      newCustomers,
      totalReservations,
      avgRating,
      avgOrderValue,
    },
    revenueOverTime,
    statusCounts,
    popularDishes,
    categoryPerformance,
    peakHours,
    reservationTrends,
  });
}

export async function getCustomers(req: AuthenticatedRequest, res: Response) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.',
      error: 'Access denied. Administrator privileges required.',
    });
  }

  const [customerUsers, orders] = await Promise.all([
    UserModel.find({ role: 'CUSTOMER' }).lean().then((d) => d as unknown as User[]),
    OrderModel.find().lean().then((d) => d as unknown as Order[]),
  ]);

  const customers = customerUsers.map((u) => {
    const userOrders = orders.filter(
      (o) =>
        o.userId === u.id ||
        o.customerEmail.toLowerCase() === u.email.toLowerCase()
    );
    const totalSpending = Number(
      userOrders
        .filter((o) => o.status !== 'Cancelled')
        .reduce((acc, o) => acc + o.grandTotal, 0)
        .toFixed(2)
    );
    const lastOrder = userOrders.length > 0 ? userOrders[0].createdAt : null;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      status: u.status,
      totalOrders: userOrders.length,
      totalSpending,
      lastOrder,
      createdAt: u.createdAt,
    };
  });

  return res.json({ success: true, customers });
}

export async function toggleCustomerStatus(req: AuthenticatedRequest, res: Response) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.',
      error: 'Access denied. Administrator privileges required.',
    });
  }

  const user = (await UserModel.findOne({ id: req.params.id }).lean()) as unknown as User | null;
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found.',
      error: 'Customer not found.',
    });
  }

  const newStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
  await UserModel.updateOne({ id: req.params.id }, { $set: { status: newStatus } });
  return res.json({ success: true, status: newStatus });
}

export async function getStaff(req: AuthenticatedRequest, res: Response) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.',
      error: 'Access denied. Administrator privileges required.',
    });
  }
  const staff = await StaffModel.find().lean();
  return res.json({ success: true, staff });
}

export async function createStaff(req: AuthenticatedRequest, res: Response) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.',
      error: 'Access denied. Administrator privileges required.',
    });
  }

  const name = sanitizeString(req.body?.name, 80);
  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Staff member name is required.',
      error: 'Staff member name is required.',
    });
  }
  const member: StaffMember = {
    id: generateEntityId('staff'),
    name,
    roleTitle: sanitizeString(req.body?.roleTitle || 'Sous Chef', 80),
    department: req.body?.department || 'Culinary',
    email: sanitizeString(req.body?.email || 'staff@velora.com', 100),
    phone: sanitizeString(req.body?.phone || '+1 (415) 890-4420', 30),
    shift: req.body?.shift || 'Evening Service (16:00 - 00:00)',
    status: 'ON_DUTY',
    specialty: sanitizeString(req.body?.specialty || 'Artisanal Plating', 120),
  };

  await StaffModel.create(member);
  const staff = await StaffModel.find().lean();
  return res.status(201).json({ success: true, staff });
}

export async function toggleStaffStatus(req: AuthenticatedRequest, res: Response) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.',
      error: 'Access denied. Administrator privileges required.',
    });
  }

  const member = (await StaffModel.findOne({ id: req.params.id }).lean()) as unknown as StaffMember | null;
  if (!member) {
    return res.status(404).json({
      success: false,
      message: 'Staff member not found.',
      error: 'Staff member not found.',
    });
  }

  const newStatus = member.status === 'ON_DUTY' ? 'OFF_DUTY' : 'ON_DUTY';
  await StaffModel.updateOne({ id: req.params.id }, { $set: { status: newStatus } });
  const staff = await StaffModel.find().lean();
  return res.json({ success: true, staff });
}

export async function deleteStaff(req: AuthenticatedRequest, res: Response) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.',
      error: 'Access denied. Administrator privileges required.',
    });
  }

  await StaffModel.deleteOne({ id: req.params.id });
  const staff = await StaffModel.find().lean();
  return res.json({ success: true, staff });
}

export async function getSettings(_req: Request, res: Response) {
  const settings = await RestaurantSettingsModel.findOne().lean();
  return res.json({ success: true, settings });
}

export async function updateSettings(req: AuthenticatedRequest, res: Response) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.',
      error: 'Access denied. Administrator privileges required.',
    });
  }

  const settings = await RestaurantSettingsModel.findOneAndUpdate(
    {},
    { $set: req.body },
    { upsert: true, new: true }
  ).lean();

  return res.json({ success: true, settings });
}

export async function getPayments(req: AuthenticatedRequest, res: Response) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.',
      error: 'Access denied. Administrator privileges required.',
    });
  }
  const payments = await PaymentModel.find().sort({ createdAt: -1 }).lean();
  return res.json({ success: true, payments });
}

export async function getNotifications(req: AuthenticatedRequest, res: Response) {
  const isStaffOrAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'STAFF';
  const filter: Record<string, any> = {};

  if (!isStaffOrAdmin) {
    filter.$or = [
      { targetRole: 'ALL' },
      { targetRole: 'CUSTOMER', userId: req.user?.userId },
      { targetRole: 'CUSTOMER', userId: { $exists: false } },
    ];
  } else {
    filter.$or = [
      { targetRole: 'ADMIN' },
      { targetRole: 'ALL' },
    ];
  }

  const notifications = await NotificationModel.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  return res.json({ success: true, notifications });
}

export async function markNotificationRead(req: AuthenticatedRequest, res: Response) {
  await NotificationModel.updateOne({ id: req.params.id }, { $set: { read: true } });
  return res.json({ success: true, ok: true });
}

export async function markAllNotificationsRead(req: AuthenticatedRequest, res: Response) {
  const isStaffOrAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'STAFF';
  const filter: Record<string, any> = {};

  if (isStaffOrAdmin) {
    filter.targetRole = 'ADMIN';
  } else if (req.user?.userId) {
    filter.$or = [
      { userId: req.user.userId },
      { targetRole: 'CUSTOMER', userId: { $exists: false } },
    ];
  }

  await NotificationModel.updateMany(filter, { $set: { read: true } });
  return res.json({ success: true, ok: true });
}
