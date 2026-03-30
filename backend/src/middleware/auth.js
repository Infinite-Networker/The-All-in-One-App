/**
 * The All-in-One App — Auth Middleware
 * Cherry Computer Ltd.
 *
 * JWT verification, rate limiting, and request logging middleware.
 */

'use strict';

const jwt = require('jsonwebtoken');

// ─── JWT Authentication ───────────────────────────────────────────────────

/**
 * authenticate
 * Verifies the Bearer JWT in the Authorization header.
 * Attaches decoded user data to req.user.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authentication token provided' });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.sub, email: decoded.email };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ─── Rate Limiter ─────────────────────────────────────────────────────────

const requestCounts = new Map(); // In-memory for dev — use Redis in production
const WINDOW_MS     = 60 * 1000; // 1 minute
const MAX_REQUESTS  = 60;

/**
 * rateLimiter
 * Simple in-memory rate limiter. In production, this is replaced
 * by express-rate-limit backed by Redis for distributed enforcement.
 */
function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const key = `${ip}:${Math.floor(Date.now() / WINDOW_MS)}`;

  const count = (requestCounts.get(key) || 0) + 1;
  requestCounts.set(key, count);

  // Clean up stale keys every 100 requests (approximate)
  if (count % 100 === 0) {
    const cutoff = `${ip}:${Math.floor(Date.now() / WINDOW_MS) - 2}`;
    requestCounts.forEach((_, k) => {
      if (k < cutoff) requestCounts.delete(k);
    });
  }

  if (count > MAX_REQUESTS) {
    return res.status(429).json({
      error:      'Too many requests',
      retryAfter: WINDOW_MS / 1000,
    });
  }

  res.setHeader('X-RateLimit-Limit',     MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - count));
  next();
}

module.exports = { authenticate, rateLimiter };
