/**
 * The All-in-One App — Feed Routes
 * Cherry Computer Ltd.
 *
 * Unified feed aggregation endpoint. Pulls content from all
 * connected platforms, normalises it, and returns a sorted stream.
 */

const express = require('express');
const router = express.Router();
const FeedController = require('../controllers/FeedController');
const { authenticate } = require('../middleware/auth');

// All feed routes require authentication
router.use(authenticate);

// ─── Unified Feed ──────────────────────────────────────────────────────────
// GET /api/feed            — full unified feed (all platforms)
// GET /api/feed/:platform  — filtered by platform
router.get('/',            FeedController.getUnifiedFeed);
router.get('/:platform',   FeedController.getPlatformFeed);

// ─── Post Detail ───────────────────────────────────────────────────────────
router.get('/post/:platform/:postId', FeedController.getPost);

// ─── Feed Refresh ──────────────────────────────────────────────────────────
router.post('/refresh', FeedController.refreshFeed);

module.exports = router;
