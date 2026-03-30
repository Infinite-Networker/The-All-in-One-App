/**
 * The All-in-One App — Database Configuration
 * Cherry Computer Ltd.
 *
 * MongoDB + Redis connection management with retry logic,
 * graceful shutdown, and production-grade event handling.
 */

'use strict';

const mongoose = require('mongoose');
const redis    = require('redis');

let redisClient = null;

// ─── MongoDB ──────────────────────────────────────────────────────────────

async function connectMongoDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[MongoDB] MONGODB_URI not set — skipping connection');
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS:          45000,
      maxPoolSize:              20,
    });
    console.log('[MongoDB] ✅ Connected');
  } catch (err) {
    console.error('[MongoDB] ❌ Connection failed:', err.message);
    throw err;
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] ⚠️  Disconnected — attempting reconnect...');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Error:', err.message);
  });
}

// ─── Redis ────────────────────────────────────────────────────────────────

async function connectRedis() {
  const url = process.env.REDIS_URL;
  if (!url) {
    console.warn('[Redis] REDIS_URL not set — skipping connection');
    return;
  }

  try {
    redisClient = redis.createClient({ url });

    redisClient.on('error',   (err) => console.error('[Redis] Error:', err.message));
    redisClient.on('connect', ()    => console.log('[Redis] ✅ Connected'));
    redisClient.on('reconnecting', () => console.warn('[Redis] ⚠️  Reconnecting...'));

    await redisClient.connect();
  } catch (err) {
    console.error('[Redis] ❌ Connection failed:', err.message);
    // Redis is non-critical — app continues without caching
    redisClient = null;
  }
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────

async function gracefulShutdown() {
  console.log('[Shutdown] Closing database connections...');
  await mongoose.connection.close();
  if (redisClient) await redisClient.quit();
  console.log('[Shutdown] Done.');
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT',  gracefulShutdown);

module.exports = {
  connectMongoDB,
  connectRedis,
  get redis() { return redisClient; },
};
