/**
 * The All-in-One App — Engagement Routes
 * Cherry Computer Ltd.
 *
 * The API routes powering the One-Tap Universal Engagement feature.
 * These endpoints are the backend backbone of the core product value.
 */

const express = require('express');
const router = express.Router();
const Joi = require('joi');

const {
  authenticate,
  engagementLimiter,
  validateBody,
} = require('../middleware/auth');
const EngagementController = require('../controllers/EngagementController');

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

const engageAllSchema = Joi.object({
  contentMap: Joi.object().pattern(
    Joi.string().valid('instagram', 'twitter', 'facebook', 'tiktok', 'linkedin', 'youtube'),
    Joi.string().required()
  ).required(),
  action: Joi.string().valid('like', 'comment', 'follow', 'all').required(),
  comment: Joi.string().max(280).allow('').optional(),
  platforms: Joi.array().items(
    Joi.string().valid('instagram', 'twitter', 'facebook', 'tiktok', 'linkedin', 'youtube')
  ).optional(),
});

const engageSingleSchema = Joi.object({
  contentId: Joi.string().required(),
  action: Joi.string().valid('like', 'comment', 'follow', 'unfollow', 'unlike').required(),
  comment: Joi.string().max(280).allow('').optional(),
  contentType: Joi.string().valid('post', 'video', 'tweet', 'reel', 'story', 'article').optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Apply authentication to all engagement routes
router.use(authenticate);
router.use(engagementLimiter);

/**
 * POST /api/engagement/all
 * The flagship endpoint — engage across ALL platforms with one request.
 * This is what powers the One-Tap Universal Engagement feature.
 */
router.post('/all',
  validateBody(engageAllSchema),
  EngagementController.engageAll
);

/**
 * POST /api/engagement/:platformId
 * Engage with a specific platform only.
 */
router.post('/:platformId',
  validateBody(engageSingleSchema),
  EngagementController.engageSingle
);

/**
 * GET /api/engagement/history
 * Retrieve the user's engagement history with filtering options.
 */
router.get('/history', EngagementController.getHistory);

/**
 * GET /api/engagement/stats
 * Summary statistics for the current user's engagement.
 */
router.get('/stats', EngagementController.getStats);

/**
 * DELETE /api/engagement/:platform/:contentId/like
 * Unlike a post on a specific platform.
 */
router.delete('/:platform/:contentId/like',
  EngagementController.unlike
);

/**
 * DELETE /api/engagement/:platform/:userId/follow
 * Unfollow a user on a specific platform.
 */
router.delete('/:platform/:userId/follow',
  EngagementController.unfollow
);

module.exports = router;
