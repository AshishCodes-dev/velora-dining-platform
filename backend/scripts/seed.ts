import 'dotenv/config';
import mongoose from 'mongoose';
import {
  UserModel,
  CategoryModel,
  FoodModel,
  OrderModel,
  ReservationModel,
  ReviewModel,
  CouponModel,
  OfferModel,
  StaffModel,
  NotificationModel,
  PaymentModel,
  RestaurantSettingsModel,
  CounterModel,
} from '../models/mongooseSchemas.ts';
import {
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_FOODS,
  INITIAL_COUPONS,
  INITIAL_OFFERS,
  INITIAL_ORDERS,
  INITIAL_RESERVATIONS,
  INITIAL_REVIEWS,
  INITIAL_STAFF,
  INITIAL_NOTIFICATIONS,
  INITIAL_PAYMENTS,
  INITIAL_SETTINGS,
} from '../services/seedData.ts';

export async function seedDatabase(log = true): Promise<void> {
  const uri = process.env.MONGODB_URI?.trim();

  if (mongoose.connection.readyState === 0) {
    if (!uri) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('MONGODB_URI is not defined. Please configure MONGODB_URI before seeding in production.');
      }
      if (log) console.log('[VELORA SEED]: No MONGODB_URI found in dev environment. Starting mongodb-memory-server...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        await mongoose.connect(mongod.getUri());
      } catch (err) {
        console.error(
          '\n======================================================\n' +
          '[VELORA SEED]: Unable to launch in-memory MongoDB (' +
          (err instanceof Error ? err.message : String(err)) +
          ')\n\n' +
          'INSTRUCTIONS TO SEED DATABASE:\n' +
          '  1. Set your MongoDB connection string in .env:\n' +
          '     MONGODB_URI=mongodb://localhost:27017/velora (local) or\n' +
          '     MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/velora (Atlas)\n' +
          '  2. Run: npm run seed\n' +
          '======================================================\n'
        );
        throw new Error('Database connection required for seeding. Configure MONGODB_URI in .env.');
      }
    } else {
      if (log) console.log('[VELORA SEED]: Connecting to MongoDB at MONGODB_URI...');
      await mongoose.connect(uri);
    }
  }

  if (log) console.log('[VELORA SEED]: Upserting seed collections (idempotent)...');

  // Upsert Users (by email)
  for (const user of INITIAL_USERS) {
    await UserModel.findOneAndUpdate({ email: user.email.toLowerCase() }, { $set: user }, { upsert: true, new: true });
  }

  // Upsert Categories (by slug)
  for (const cat of INITIAL_CATEGORIES) {
    await CategoryModel.findOneAndUpdate({ slug: cat.slug }, { $set: cat }, { upsert: true, new: true });
  }

  // Upsert Foods (by slug)
  for (const food of INITIAL_FOODS) {
    await FoodModel.findOneAndUpdate({ slug: food.slug }, { $set: food }, { upsert: true, new: true });
  }

  // Upsert Coupons (by code)
  for (const coupon of INITIAL_COUPONS) {
    await CouponModel.findOneAndUpdate({ code: coupon.code.toUpperCase() }, { $set: coupon }, { upsert: true, new: true });
  }

  // Upsert Offers (by id)
  for (const offer of INITIAL_OFFERS) {
    await OfferModel.findOneAndUpdate({ id: offer.id }, { $set: offer }, { upsert: true, new: true });
  }

  // Upsert Staff (by email)
  for (const staff of INITIAL_STAFF) {
    await StaffModel.findOneAndUpdate({ email: staff.email.toLowerCase() }, { $set: staff }, { upsert: true, new: true });
  }

  // Upsert Settings
  await RestaurantSettingsModel.findOneAndUpdate({}, { $set: INITIAL_SETTINGS }, { upsert: true, new: true });

  // Seed Orders if none exist
  const orderCount = await OrderModel.countDocuments();
  if (orderCount === 0) {
    await OrderModel.insertMany(INITIAL_ORDERS);
  }

  // Seed Reservations if none exist
  const resCount = await ReservationModel.countDocuments();
  if (resCount === 0) {
    await ReservationModel.insertMany(INITIAL_RESERVATIONS);
  }

  // Seed Reviews if none exist
  const revCount = await ReviewModel.countDocuments();
  if (revCount === 0) {
    await ReviewModel.insertMany(INITIAL_REVIEWS);
  }

  // Seed Notifications if none exist
  const notifCount = await NotificationModel.countDocuments();
  if (notifCount === 0) {
    await NotificationModel.insertMany(INITIAL_NOTIFICATIONS);
  }

  // Seed Payments if none exist
  const payCount = await PaymentModel.countDocuments();
  if (payCount === 0) {
    await PaymentModel.insertMany(INITIAL_PAYMENTS);
  }

  // Initialize atomic counters
  await CounterModel.findOneAndUpdate(
    { _id: 'orderNumber' },
    { $setOnInsert: { seq: 1040 } },
    { upsert: true }
  );

  await CounterModel.findOneAndUpdate(
    { _id: 'reservationCode' },
    { $setOnInsert: { seq: 5120 } },
    { upsert: true }
  );

  if (log) console.log('✓ [VELORA SEED]: Database seeding completed successfully.');
}

async function main() {
  try {
    await seedDatabase(true);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('✕ [VELORA SEED ERROR]:', error instanceof Error ? error.message : error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

// Only auto-run main if executed directly via CLI
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  void main();
}
