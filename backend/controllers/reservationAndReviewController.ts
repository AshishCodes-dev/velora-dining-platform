import type { Request, Response } from 'express';
import {
  ReservationModel,
  ReviewModel,
  FoodModel,
  NotificationModel,
  CounterModel,
} from '../models/mongooseSchemas.ts';
import { sanitizeString, generateEntityId } from '../utils/security.ts';
import { validateReservationInput, validateReviewInput } from '../validators/index.ts';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import type { Reservation, ReservationStatus, Review, Food } from '../models/types.ts';

const ALL_TIME_SLOTS = [
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
  '22:00',
  '22:30',
];

const MAX_TABLES_PER_SLOT = 6;

export async function getAvailableSlots(req: Request, res: Response) {
  const date =
    typeof req.query.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date)
      ? req.query.date
      : new Date().toISOString().slice(0, 10);

  const existingForDate = (await ReservationModel.find({
    date,
    status: { $nin: ['CANCELLED', 'REJECTED'] },
  }).lean()) as unknown as Reservation[];

  const slots = ALL_TIME_SLOTS.map((time) => {
    const bookedTables = existingForDate.filter((r) => r.time === time).length;
    const remainingTables = Math.max(0, MAX_TABLES_PER_SLOT - bookedTables);
    return {
      time,
      available: remainingTables > 0,
      remainingTables,
    };
  });

  return res.json({ success: true, date, slots });
}

export async function createReservation(req: AuthenticatedRequest, res: Response) {
  const validation = validateReservationInput(req.body || {});
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.error,
      error: validation.error,
    });
  }

  const date = sanitizeString(req.body.date, 20);
  const time = sanitizeString(req.body.time, 20);
  const email = sanitizeString(
    req.body.email || req.user?.email || 'guest@example.com',
    120
  ).toLowerCase();
  const phone = sanitizeString(req.body.phone, 30);

  // Double-booking conflict check: race-safe check against current database reservations
  const activeForSlot = (await ReservationModel.find({
    date,
    time,
    status: { $nin: ['CANCELLED', 'REJECTED'] },
  }).lean()) as unknown as Reservation[];

  if (activeForSlot.length >= MAX_TABLES_PER_SLOT) {
    return res.status(409).json({
      success: false,
      message: `All tables for ${date} at ${time} are currently reserved. Please select another time slot.`,
      error: `All tables for ${date} at ${time} are currently reserved. Please select another time slot.`,
    });
  }

  const duplicateGuestBooking = activeForSlot.find(
    (r) =>
      (req.user?.userId && r.userId === req.user.userId) ||
      r.email.toLowerCase() === email ||
      r.phone === phone
  );

  if (duplicateGuestBooking) {
    return res.status(409).json({
      success: false,
      message: `You already have an active reservation (#${duplicateGuestBooking.reservationCode}) on ${date} at ${time}.`,
      error: `You already have an active reservation (#${duplicateGuestBooking.reservationCode}) on ${date} at ${time}.`,
    });
  }

  // Race-safe reservationCode via atomic counter + retry loop
  let code = '';
  for (let attempt = 0; attempt < 5; attempt++) {
    const counterDoc = await CounterModel.findByIdAndUpdate(
      'reservationCode',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const candidate = `VLR-R${counterDoc.seq}`;
    const collision = await ReservationModel.findOne({ reservationCode: candidate }).lean();
    if (!collision) {
      code = candidate;
      break;
    }
  }
  if (!code) {
    code = `VLR-R${Date.now().toString().slice(-4)}`;
  }

  const now = new Date().toISOString();

  const newRes: Reservation = {
    id: generateEntityId('res'),
    reservationCode: code,
    userId: req.user?.userId,
    name: sanitizeString(req.body.name, 100),
    email,
    phone,
    date,
    time,
    guests: Number(req.body.guests),
    tableArea: req.body.tableArea || 'Main Dining Room',
    specialRequest: sanitizeString(req.body.specialRequest, 300),
    status: 'CONFIRMED',
    createdAt: now,
  };

  await ReservationModel.create(newRes);

  await NotificationModel.insertMany([
    {
      id: generateEntityId('notif'),
      targetRole: 'ADMIN',
      type: 'RESERVATION',
      title: `New Table Reservation ${code}`,
      message: `${newRes.name} reserved for ${newRes.guests} guests on ${newRes.date} at ${newRes.time} (${newRes.tableArea}).`,
      read: false,
      createdAt: now,
      link: '/admin?tab=reservations',
    },
    {
      id: generateEntityId('notif'),
      targetRole: 'CUSTOMER',
      userId: newRes.userId,
      type: 'RESERVATION',
      title: `Reservation ${code} Confirmed`,
      message: `Table for ${newRes.guests} at ${newRes.tableArea} on ${newRes.date} at ${newRes.time} is confirmed at VELORA.`,
      read: false,
      createdAt: now,
      link: '/reservations',
    },
  ]);

  return res.status(201).json({ success: true, reservation: newRes });
}

export async function getReservations(req: AuthenticatedRequest, res: Response) {
  const { date, status, all, reservationCode, email } = req.query;
  const isStaffOrAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'STAFF';

  const filter: Record<string, any> = {};

  if (isStaffOrAdmin && all === 'true') {
    // Admin/Staff with ?all=true see everything
  } else if (req.user) {
    // Authenticated customer: see only their own
    filter.$or = [
      { userId: req.user.userId },
      { email: req.user.email.toLowerCase() },
    ];
  } else {
    // Unauthenticated guest: require reservationCode + email together
    const code = typeof reservationCode === 'string' ? reservationCode.trim().toUpperCase() : '';
    const eml = typeof email === 'string' ? email.toLowerCase().trim() : '';
    if (!code || !eml) {
      return res.status(401).json({
        success: false,
        message:
          'Authentication required. For guest reservations, please provide both reservationCode and email.',
        error:
          'Authentication required. For guest reservations, please provide both reservationCode and email.',
      });
    }
    filter.$and = [
      { $or: [{ reservationCode: code }, { id: code }] },
      { email: eml },
    ];
  }

  if (date && typeof date === 'string') {
    filter.date = date;
  }
  if (status && typeof status === 'string' && status !== 'All') {
    filter.status = status;
  }

  const reservations = await ReservationModel.find(filter)
    .sort({ date: 1, time: 1 })
    .lean();

  return res.json({ success: true, reservations });
}

export async function updateReservationStatus(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required to modify reservations.',
      error: 'Authentication required to modify reservations.',
    });
  }

  const { id } = req.params;
  const { status, date, time } = req.body || {};
  const reservation = (await ReservationModel.findOne({
    $or: [{ id }, { reservationCode: id }],
  }).lean()) as unknown as Reservation | null;

  if (!reservation) {
    return res.status(404).json({
      success: false,
      message: 'Reservation not found.',
      error: 'Reservation not found.',
    });
  }

  const isStaffOrAdmin = req.user.role === 'ADMIN' || req.user.role === 'STAFF';
  const isOwner =
    reservation.userId === req.user.userId ||
    reservation.email.toLowerCase() === req.user.email.toLowerCase();

  // Customers may only cancel their OWN reservation; staff/admin may set any status
  if (!isStaffOrAdmin) {
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage your own reservations.',
        error: 'You can only manage your own reservations.',
      });
    }
    if (status !== 'CANCELLED') {
      return res.status(403).json({
        success: false,
        message:
          'Customers may only cancel their own reservations. Please contact staff to change date or time.',
        error:
          'Customers may only cancel their own reservations. Please contact staff to change date or time.',
      });
    }
  }

  const validStatuses: ReservationStatus[] = [
    'PENDING',
    'CONFIRMED',
    'CANCELLED',
    'REJECTED',
    'COMPLETED',
  ];

  const updateFields: Partial<Reservation> = {};

  if (status && validStatuses.includes(status as ReservationStatus)) {
    updateFields.status = status as ReservationStatus;
  }

  if (isStaffOrAdmin) {
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
      updateFields.date = String(date);
    }
    if (time && /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(time))) {
      updateFields.time = String(time);
    }
  }

  const updated = (await ReservationModel.findOneAndUpdate(
    { $or: [{ id }, { reservationCode: id }] },
    { $set: updateFields },
    { new: true }
  ).lean()) as unknown as Reservation;

  return res.json({ success: true, reservation: updated });
}

export async function getReviews(req: Request, res: Response) {
  const { foodId, all } = req.query;
  const filter: Record<string, any> = {};

  if (all !== 'true') {
    filter.status = 'PUBLISHED';
  }
  if (foodId && typeof foodId === 'string') {
    filter.foodId = foodId;
  }

  const reviews = await ReviewModel.find(filter).sort({ createdAt: -1 }).lean();
  return res.json({ success: true, reviews });
}

async function recalculateFoodRating(foodId: string): Promise<void> {
  const published = (await ReviewModel.find({
    foodId,
    status: 'PUBLISHED',
  }).lean()) as unknown as Review[];

  if (published.length === 0) return;
  const avg = published.reduce((sum, r) => sum + r.rating, 0) / published.length;
  await FoodModel.updateOne(
    { id: foodId },
    {
      $set: {
        rating: Number(avg.toFixed(1)),
        reviewCount: published.length,
      },
    }
  );
}

export async function createReview(req: AuthenticatedRequest, res: Response) {
  const validation = validateReviewInput(req.body || {});
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.error,
      error: validation.error,
    });
  }

  const { foodId, rating, comment, imageUrl } = req.body || {};
  const food = (await FoodModel.findOne({ id: foodId }).lean()) as unknown as Food | null;
  if (!food) {
    return res.status(404).json({
      success: false,
      message: 'Dish not found for review.',
      error: 'Dish not found for review.',
    });
  }

  const cleanComment = sanitizeString(comment, 800);
  const numRating = Math.min(5, Math.max(1, Math.round(Number(rating || 5))));
  const newRev: Review = {
    id: generateEntityId('rev'),
    foodId: food.id,
    foodName: food.name,
    userId: req.user?.userId || 'guest',
    userName: req.user?.name || sanitizeString(req.body.userName || 'Verified Guest', 80),
    rating: numRating,
    comment: cleanComment,
    imageUrl: imageUrl ? sanitizeString(imageUrl, 400) : undefined,
    status: 'PUBLISHED',
    createdAt: new Date().toISOString(),
  };

  await ReviewModel.create(newRev);
  await recalculateFoodRating(food.id);

  return res.status(201).json({ success: true, review: newRev });
}

export async function updateReview(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const review = (await ReviewModel.findOne({ id }).lean()) as unknown as Review | null;
  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found.',
      error: 'Review not found.',
    });
  }

  const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'STAFF';
  if (!isAdmin && review.userId !== req.user?.userId) {
    return res.status(403).json({
      success: false,
      message: 'You can only edit your own reviews.',
      error: 'You can only edit your own reviews.',
    });
  }

  const updateFields: Partial<Review> = {
    updatedAt: new Date().toISOString(),
  };

  if (req.body.rating !== undefined) {
    updateFields.rating = Math.min(5, Math.max(1, Number(req.body.rating)));
  }
  if (req.body.comment !== undefined) {
    const clean = sanitizeString(req.body.comment, 800);
    if (clean.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Review comment must be at least 5 characters.',
        error: 'Review comment must be at least 5 characters.',
      });
    }
    updateFields.comment = clean;
  }
  if (req.body.status !== undefined && isAdmin) {
    updateFields.status = req.body.status === 'HIDDEN' ? 'HIDDEN' : 'PUBLISHED';
  }

  const updated = (await ReviewModel.findOneAndUpdate(
    { id },
    { $set: updateFields },
    { new: true }
  ).lean()) as unknown as Review;

  await recalculateFoodRating(review.foodId);
  return res.json({ success: true, review: updated });
}

export async function deleteReview(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const review = (await ReviewModel.findOne({ id }).lean()) as unknown as Review | null;
  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found.',
      error: 'Review not found.',
    });
  }
  const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'STAFF';
  if (!isAdmin && review.userId !== req.user?.userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this review.',
      error: 'Not authorized to delete this review.',
    });
  }

  await ReviewModel.deleteOne({ id });
  await recalculateFoodRating(review.foodId);
  return res.json({ success: true, message: 'Review deleted.' });
}
