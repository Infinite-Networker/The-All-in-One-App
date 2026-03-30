/**
 * The All-in-One App — Analytics Routes
 * Cherry Computer Ltd.
 */

const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/AnalyticsController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// ─── Overview ──────────────────────────────────────────────────────────────
router.get('/overview',          AnalyticsController.getOverview);
router.get('/growth',            AnalyticsController.getGrowthTrends);
router.get('/engagement-rate',   AnalyticsController.getEngagementRate);
router.get('/best-times',        AnalyticsController.getBestPostingTimes);
router.get('/content-types',     AnalyticsController.getContentPerformance);
router.get('/platform/:id',      AnalyticsController.getPlatformStats);

module.exports = router;
