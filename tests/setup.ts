import { beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { db } from '../backend/config/db.ts';
import { seedDatabase } from '../backend/scripts/seed.ts';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-min-32-characters-long';
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/velora_test';
  await db.connectMongo();
  await seedDatabase(true);
});

afterAll(async () => {
  await mongoose.disconnect();
});
