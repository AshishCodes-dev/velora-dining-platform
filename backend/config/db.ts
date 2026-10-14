import mongoose from 'mongoose';
import { seedDatabase } from '../scripts/seed.ts';

/**
 * VELORA Database Engine
 * Direct Mongoose ODM connection without in-memory cache/persist anti-pattern.
 * - In production: Requires real MONGODB_URI. Exits cleanly with fatal error if missing.
 * - In development: Falls back to mongodb-memory-server if MONGODB_URI is not provided.
 */
class DatabaseConnection {
  private isMongoConnected = false;

  public async connectMongo(): Promise<void> {
    const uri = process.env.MONGODB_URI?.trim();

    if (!uri) {
      if (process.env.NODE_ENV === 'production') {
        console.error(
          '\n======================================================\n' +
          'FATAL: MONGODB_URI environment variable is missing.\n' +
          'Set MONGODB_URI in your production environment (e.g., Render/Atlas).\n' +
          '======================================================\n'
        );
        process.exit(1);
      }

      console.warn(
        '[VELORA DB]: MONGODB_URI not provided. Initializing local mongodb-memory-server for development/preview...'
      );

      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        await mongoose.connect(memUri);
        this.isMongoConnected = true;
        console.log('[VELORA DB]: Connected to in-memory MongoDB instance.');
        // Seed development ephemeral instance
        await seedDatabase(false);
        console.log('[VELORA DB]: In-memory development database populated with initial seed data.');
        return;
      } catch (err) {
        console.error(
          '\n======================================================\n' +
          '[VELORA DB]: In-memory MongoDB could not be started (' +
          (err instanceof Error ? err.message : String(err)) +
          ')\n\n' +
          'INSTRUCTIONS TO RUN VELORA LOCALLY:\n' +
          '  1. Create a free cluster on MongoDB Atlas (https://www.mongodb.com/cloud/atlas)\n' +
          '     or run MongoDB locally (e.g., `mongod` or via Docker: `docker run -p 27017:27017 mongo`).\n' +
          '  2. Set MONGODB_URI in your .env file:\n' +
          '     MONGODB_URI=mongodb://localhost:27017/velora (local) or\n' +
          '     MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/velora (Atlas)\n' +
          '  3. Run: npm run seed\n' +
          '  4. Run: npm run dev\n' +
          '======================================================\n'
        );
        process.exit(1);
      }
    }

    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      this.isMongoConnected = true;
      console.log('[VELORA DB]: Connected to MongoDB via Mongoose.');
    } catch (error) {
      if (process.env.NODE_ENV === 'production') {
        console.error(
          `FATAL: Failed to connect to MongoDB at MONGODB_URI: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        process.exit(1);
      }

      console.warn(
        `[VELORA DB]: External MongoDB connection failed (${
          error instanceof Error ? error.message : 'connection refused'
        }). Falling back to mongodb-memory-server for development...`
      );

      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        await mongoose.connect(memUri);
        this.isMongoConnected = true;
        console.log('[VELORA DB]: Connected to in-memory MongoDB instance.');
        await seedDatabase(false);
      } catch (memErr) {
        console.error('[VELORA DB FATAL]: Could not connect to any MongoDB instance:', memErr);
        process.exit(1);
      }
    }
  }

  public isConnected(): boolean {
    return this.isMongoConnected && mongoose.connection.readyState === 1;
  }

  public async disconnect(): Promise<void> {
    await mongoose.disconnect();
    this.isMongoConnected = false;
  }
}

export const db = new DatabaseConnection();
