/**
 * The All-in-One App — Auth Routes
 * Cherry Computer Ltd.
 *
 * OAuth 2.0 callback handling for all platform integrations.
 * Routes are structured to keep each platform's flow isolated
 * and independently updatable.
 */

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { rateLimiter } = require('../middleware/auth');

// ─── OAuth Initiation ──────────────────────────────────────────────────────
// Returns the platform-specific OAuth URL for the mobile client to open
router.get('/oauth/:platform/url',      rateLimiter, AuthController.getOAuthUrl);

// ─── OAuth Callbacks ───────────────────────────────────────────────────────
// Receive auth codes from platforms and exchange for tokens
router.post('/oauth/:platform/callback', rateLimiter, AuthController.handleOAuthCallback);

// ─── Token Management ──────────────────────────────────────────────────────
router.post('/token/refresh',  rateLimiter, AuthController.refreshToken);
router.delete('/oauth/:platform/disconnect', AuthController.disconnectPlatform);

// ─── Session ───────────────────────────────────────────────────────────────
router.post('/login',   rateLimiter, AuthController.login);
router.post('/logout',  AuthController.logout);
router.get('/me',       AuthController.getMe);

module.exports = router;
