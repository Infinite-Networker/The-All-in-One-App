/**
 * The All-in-One App — Authentication Middleware
 * Cherry Computer Ltd.
 *
 * JWT verification, rate limiting, and request validation.
 * Security isn't an afterthought here — it's the foundation.
 */

const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { getRedis } = require('../config/database');
const User = require('../models/User');

// ─────────────────────────────────────────────────────────────────────────────
// JWT AUTHENTICATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verify JWT and attach user to request.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Check if token is blacklisted (logout / revocation)
    const redis = getRedis();
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ success: false, error: 'Token has been revoked.' });
    }

    // Verify JWT signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Load user (check they still exist and account is active)
    const user = await User.findById(decoded.userId).select('+passwordChangedAt');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'User not found or account deactivated.' });
    }

    // Check if password was changed after the token was issued
    if (user.passwordChangedAt) {
      const tokenIssuedAt = decoded.iat * 1000;
      if (user.passwordChangedAt.getTime() > tokenIssuedAt) {
        return res.status(401).json({
          success: false,
          error: 'Password recently changed. Please log in again.',
        });
      }
    }

    req.user = user;
    req.userId = user._id.toString();
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid authentication token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Authentication token expired.' });
    }
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// RATE LIMITING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * General API rate limiter — 100 requests per 15 minutes per IP.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please slow down and try again shortly.',
  },
});

/**
 * Stricter limiter for auth endpoints — 10 attempts per 15 minutes.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please wait before trying again.',
  },
});

/**
 * Engagement-specific limiter — per user, not per IP.
 * Respects platform-specific rate limits.
 */
const engagementLimiter = async (req, res, next) => {
  if (!req.userId) return next();

  try {
    const redis = getRedis();
    const key = `engagement_limit:${req.userId}:${req.params.platformId || 'global'}`;
    const windowSeconds = 3600; // 1 hour
    const maxActions = req.user?.preferences?.rateLimitPerPlatform || 100;

    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }

    const ttl = await redis.ttl(key);
    res.setHeader('X-RateLimit-Limit', maxActions);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxActions - current));
    res.setHeader('X-RateLimit-Reset', Math.floor(Date.now() / 1000) + ttl);

    if (current > maxActions) {
      return res.status(429).json({
        success: false,
        error: `Engagement rate limit reached (${maxActions}/hour). Resets in ${Math.ceil(ttl / 60)} minutes.`,
        retryAfter: ttl,
      });
    }

    next();
  } catch (error) {
    // Redis failure should not block engagement — fail open
    console.error('Rate limiter error (failing open):', error.message);
    next();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM AUTHORISATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verify the user has a connected account for the requested platform.
 */
const requirePlatformConnection = (platformId) => (req, res, next) => {
  const platform = req.user?.getPlatformConnection(platformId || req.params.platformId);
  if (!platform) {
    return res.status(403).json({
      success: false,
      error: `No connected ${platformId || req.params.platformId} account. Please connect in the Accounts screen.`,
    });
  }
  req.platformConnection = platform;
  next();
};

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

const validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map(d => ({ field: d.path.join('.'), message: d.message })),
    });
  }
  next();
};

module.exports = {
  authenticate,
  generalLimiter,
  authLimiter,
  engagementLimiter,
  requirePlatformConnection,
  validateBody,
};
