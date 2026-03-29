/**
 * The All-in-One App — Database Configuration
 * Cherry Computer Ltd.
 *
 * MongoDB connection management with built-in retry logic,
 * connection pooling, and graceful shutdown handling.
 */

const mongoose = require('mongoose');
const Redis = require('ioredis');

// ─────────────────────────────────────────────────────────────────────────────
// MONGODB CONNECTION
// ─────────────────────────────────────────────────────────────────────────────

const MONGO_OPTIONS = {
  maxPoolSize: 20,
  minPoolSize: 5,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 5000,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  writeConcern: { w: 'majority' },
};

let mongoRetries = 0;
const MAX_RETRIES = 5;

const connectMongoDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/allinoneapp';
    await mongoose.connect(uri, MONGO_OPTIONS);

    console.log('✅ MongoDB connected successfully');
    console.log(`   Database: ${mongoose.connection.name}`);
    mongoRetries = 0;

    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting reconnect...');
      setTimeout(connectMongoDB, 5000);
    });

  } catch (error) {
    mongoRetries++;
    console.error(`❌ MongoDB connection failed (attempt ${mongoRetries}/${MAX_RETRIES}):`, error.message);

    if (mongoRetries < MAX_RETRIES) {
      const delay = Math.min(1000 * Math.pow(2, mongoRetries), 30000);
      console.log(`   Retrying in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectMongoDB();
    }

    console.error('💥 Max MongoDB retries reached. Exiting.');
    process.exit(1);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// REDIS CONNECTION
// ─────────────────────────────────────────────────────────────────────────────

let redisClient = null;

const connectRedis = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
    retryStrategy: (times) => {
      if (times > 10) return null;
      return Math.min(times * 100, 3000);
    },
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
  });

  redisClient.on('reconnecting', () => {
    console.warn('⚠️  Redis reconnecting...');
  });

  return redisClient;
};

const getRedis = () => {
  if (!redisClient) throw new Error('Redis not initialised. Call connectRedis() first.');
  return redisClient;
};

// ─────────────────────────────────────────────────────────────────────────────
// GRACEFUL SHUTDOWN
// ─────────────────────────────────────────────────────────────────────────────

const gracefulShutdown = async (signal) => {
  console.log(`\n🔴 ${signal} received. Graceful shutdown initiated...`);

  try {
    await mongoose.connection.close();
    console.log('   MongoDB connection closed.');

    if (redisClient) {
      await redisClient.quit();
      console.log('   Redis connection closed.');
    }

    console.log('✅ Graceful shutdown complete. Goodbye from Cherry Computer Ltd.!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = { connectMongoDB, connectRedis, getRedis };
