/**
 * The All-in-One App — Analytics Controller
 * Cherry Computer Ltd.
 *
 * Powers the engagement analytics dashboard. Aggregates data from
 * MongoDB engagement logs to surface growth trends, rate metrics,
 * best posting times, and content performance insights.
 */

const EngagementLog = require('../models/EngagementLog');
const User = require('../models/User');
const PlatformProxyService = require('../services/PlatformProxyService');

class AnalyticsController {
  /**
   * GET /api/analytics/overview
   * High-level stats: total engagements, success rate, platforms active.
   */
  static async getOverview(req, res) {
    try {
      const userId = req.user.id;
      const { from, to } = req.query;

      const dateFilter = {};
      if (from) dateFilter.$gte = new Date(from);
      if (to)   dateFilter.$lte = new Date(to);

      const query = {
        userId,
        ...(Object.keys(dateFilter).length && { createdAt: dateFilter }),
      };

      const [total, successful, failed] = await Promise.all([
        EngagementLog.countDocuments(query),
        EngagementLog.countDocuments({ ...query, status: 'success' }),
        EngagementLog.countDocuments({ ...query, status: 'failed' }),
      ]);

      const user = await User.findById(userId);
      const connectedPlatforms = Object.entries(user?.platforms || {})
        .filter(([, p]) => p.connected)
        .map(([id]) => id);

      const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;

      res.json({
        overview: {
          totalEngagements: total,
          successfulEngagements: successful,
          failedEngagements: failed,
          successRate,
          connectedPlatforms: connectedPlatforms.length,
          platformList: connectedPlatforms,
        },
      });
    } catch (err) {
      console.error('[AnalyticsController] getOverview error:', err);
      res.status(500).json({ error: 'Failed to fetch overview' });
    }
  }

  /**
   * GET /api/analytics/growth
   * Follower growth trend data (7d, 30d, 90d windows).
   */
  static async getGrowthTrends(req, res) {
    try {
      const userId = req.user.id;
      const { window = '7d' } = req.query;

      const days = window === '30d' ? 30 : window === '90d' ? 90 : 7;

      // In production: pull from per-platform follower snapshot history
      // Demo: generate synthetic trend data
      const trend = Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().split('T')[0],
        followers: 10000 + Math.floor(Math.random() * 500 * (i + 1)),
        delta: Math.floor(Math.random() * 200) - 50,
      }));

      res.json({ trend, window, days });
    } catch (err) {
      console.error('[AnalyticsController] getGrowthTrends error:', err);
      res.status(500).json({ error: 'Failed to fetch growth trends' });
    }
  }

  /**
   * GET /api/analytics/engagement-rate
   * Normalised engagement rate per platform over time.
   */
  static async getEngagementRate(req, res) {
    try {
      const userId = req.user.id;

      const byPlatform = await EngagementLog.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$platform',
            total:   { $sum: 1 },
            success: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
          },
        },
        {
          $project: {
            platform:      '$_id',
            total:         1,
            success:       1,
            successRate:   { $multiply: [{ $divide: ['$success', '$total'] }, 100] },
          },
        },
      ]);

      res.json({ byPlatform });
    } catch (err) {
      console.error('[AnalyticsController] getEngagementRate error:', err);
      res.status(500).json({ error: 'Failed to fetch engagement rate' });
    }
  }

  /**
   * GET /api/analytics/best-times
   * AI-inferred optimal posting windows based on engagement history.
   */
  static async getBestPostingTimes(req, res) {
    try {
      const userId = req.user.id;

      // Aggregate engagements by hour of day
      const byHour = await EngagementLog.aggregate([
        { $match: { userId, status: 'success' } },
        { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      const topHours = byHour.slice(0, 3).map((h) => ({
        hour: h._id,
        label: `${h._id}:00`,
        score: h.count,
      }));

      res.json({
        bestTimes: topHours,
        recommendation: topHours[0]
          ? `Peak engagement at ${topHours[0].label} — consider scheduling posts around this window.`
          : 'Engage more to unlock personalised best-time recommendations.',
      });
    } catch (err) {
      console.error('[AnalyticsController] getBestPostingTimes error:', err);
      res.status(500).json({ error: 'Failed to calculate best times' });
    }
  }

  /**
   * GET /api/analytics/content-types
   * Performance by content type (photo, video, text, reel, etc.)
   */
  static async getContentPerformance(req, res) {
    try {
      const userId = req.user.id;

      const byType = await EngagementLog.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id:     '$contentType',
            total:   { $sum: 1 },
            success: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
          },
        },
      ]);

      res.json({ byContentType: byType });
    } catch (err) {
      console.error('[AnalyticsController] getContentPerformance error:', err);
      res.status(500).json({ error: 'Failed to fetch content performance' });
    }
  }

  /**
   * GET /api/analytics/platform/:id
   * Deep stats for a single platform.
   */
  static async getPlatformStats(req, res) {
    try {
      const userId = req.user.id;
      const { id: platform } = req.params;

      const stats = await EngagementLog.aggregate([
        { $match: { userId, platform } },
        {
          $group: {
            _id:          '$action',
            total:        { $sum: 1 },
            successCount: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
          },
        },
      ]);

      res.json({ platform, stats });
    } catch (err) {
      console.error('[AnalyticsController] getPlatformStats error:', err);
      res.status(500).json({ error: 'Failed to fetch platform stats' });
    }
  }
}

module.exports = AnalyticsController;
