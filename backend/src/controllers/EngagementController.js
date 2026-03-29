/**
 * The All-in-One App — Engagement Controller
 * Cherry Computer Ltd.
 *
 * Handles the business logic for all engagement operations.
 * This controller orchestrates platform proxying, logging, and response formatting.
 */

const { v4: uuidv4 } = require('uuid');
const EngagementLog = require('../models/EngagementLog');
const PlatformProxyService = require('../services/PlatformProxyService');
const { getRedis } = require('../config/database');

class EngagementController {
  /**
   * POST /api/engagement/all
   * Execute engagement actions across all selected platforms simultaneously.
   */
  static async engageAll(req, res) {
    const { contentMap, action, comment, platforms } = req.body;
    const userId = req.userId;
    const batchId = uuidv4();

    try {
      // Filter to only connected platforms for this user
      const connectedPlatforms = req.user.platforms
        .filter(p => p.isActive && contentMap[p.platformId])
        .filter(p => !platforms || platforms.includes(p.platformId));

      if (connectedPlatforms.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No connected platforms found for the provided content IDs. Please connect your accounts first.',
        });
      }

      const startTime = Date.now();

      // Execute all engagements in parallel — this is the power of the One-Tap feature
      const results = await Promise.allSettled(
        connectedPlatforms.map(async (platformConn) => {
          const actionStartTime = Date.now();
          try {
            const result = await PlatformProxyService.execute({
              platform: platformConn.platformId,
              action,
              contentId: contentMap[platformConn.platformId],
              comment,
              tokens: platformConn, // Will be decrypted in PlatformProxyService
            });

            // Log successful engagement
            await EngagementLog.create({
              userId,
              platform: platformConn.platformId,
              action,
              contentId: contentMap[platformConn.platformId],
              status: 'success',
              batchId,
              responseTimeMs: Date.now() - actionStartTime,
            });

            return {
              platform: platformConn.platformId,
              username: platformConn.username,
              status: 'success',
              data: result,
            };
          } catch (platformError) {
            const isRateLimited = platformError.status === 429;

            // Log failed engagement
            await EngagementLog.create({
              userId,
              platform: platformConn.platformId,
              action,
              contentId: contentMap[platformConn.platformId],
              status: isRateLimited ? 'rate_limited' : 'failed',
              errorMessage: platformError.message,
              batchId,
              responseTimeMs: Date.now() - actionStartTime,
            });

            return {
              platform: platformConn.platformId,
              username: platformConn.username,
              status: isRateLimited ? 'rate_limited' : 'failed',
              error: platformError.message,
            };
          }
        })
      );

      const formattedResults = results.map(r =>
        r.status === 'fulfilled' ? r.value : { status: 'error', error: r.reason?.message }
      );

      const successCount = formattedResults.filter(r => r.status === 'success').length;
      const totalMs = Date.now() - startTime;

      // Update analytics snapshot in background
      EngagementController._updateAnalyticsSnapshot(userId, action, successCount).catch(console.error);

      return res.status(200).json({
        success: true,
        batchId,
        summary: {
          total: connectedPlatforms.length,
          succeeded: successCount,
          failed: formattedResults.filter(r => r.status === 'failed').length,
          rateLimited: formattedResults.filter(r => r.status === 'rate_limited').length,
          executionTimeMs: totalMs,
        },
        results: formattedResults,
        message: `Engaged across ${successCount}/${connectedPlatforms.length} platforms in ${totalMs}ms`,
        poweredBy: 'Cherry Computer Ltd. · The All-in-One App',
      });

    } catch (error) {
      console.error('engageAll error:', error);
      return res.status(500).json({
        success: false,
        error: 'Engagement engine encountered an unexpected error. Please try again.',
      });
    }
  }

  /**
   * POST /api/engagement/:platformId
   * Single-platform engagement.
   */
  static async engageSingle(req, res) {
    const { platformId } = req.params;
    const { contentId, action, comment } = req.body;
    const userId = req.userId;

    try {
      const platformConn = req.user.getPlatformConnection(platformId);
      if (!platformConn) {
        return res.status(403).json({
          success: false,
          error: `${platformId} account not connected.`,
        });
      }

      const startTime = Date.now();
      const result = await PlatformProxyService.execute({
        platform: platformId,
        action,
        contentId,
        comment,
        tokens: platformConn,
      });

      await EngagementLog.create({
        userId,
        platform: platformId,
        action,
        contentId,
        status: 'success',
        responseTimeMs: Date.now() - startTime,
      });

      return res.status(200).json({
        success: true,
        platform: platformId,
        action,
        contentId,
        data: result,
        executionTimeMs: Date.now() - startTime,
      });

    } catch (error) {
      await EngagementLog.create({
        userId,
        platform: platformId,
        action,
        contentId: req.body.contentId,
        status: 'failed',
        errorMessage: error.message,
      }).catch(console.error);

      return res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Engagement failed.',
      });
    }
  }

  /**
   * GET /api/engagement/history
   */
  static async getHistory(req, res) {
    try {
      const { platform, action, status, limit = 50, offset = 0 } = req.query;

      const filter = { userId: req.userId };
      if (platform) filter.platform = platform;
      if (action) filter.action = action;
      if (status) filter.status = status;

      const [logs, total] = await Promise.all([
        EngagementLog.find(filter)
          .sort({ executedAt: -1 })
          .skip(parseInt(offset))
          .limit(Math.min(parseInt(limit), 200))
          .lean(),
        EngagementLog.countDocuments(filter),
      ]);

      return res.json({
        success: true,
        data: logs,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: total > parseInt(offset) + logs.length,
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/engagement/stats
   */
  static async getStats(req, res) {
    try {
      const { days = 30 } = req.query;
      const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const analytics = await EngagementLog.getAnalyticsSummary(req.userId, startDate, endDate);
      const snapshot = req.user.analyticsSnapshot;

      return res.json({
        success: true,
        data: {
          summary: snapshot,
          breakdown: analytics,
          period: { days: parseInt(days), start: startDate, end: endDate },
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * DELETE /api/engagement/:platform/:contentId/like
   */
  static async unlike(req, res) {
    const { platform, contentId } = req.params;
    try {
      await PlatformProxyService.execute({
        platform,
        action: 'unlike',
        contentId,
        tokens: req.user.getPlatformConnection(platform),
      });

      await EngagementLog.create({
        userId: req.userId,
        platform,
        action: 'unlike',
        contentId,
        status: 'success',
      });

      return res.json({ success: true, platform, contentId, action: 'unlike' });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * DELETE /api/engagement/:platform/:userId/follow
   */
  static async unfollow(req, res) {
    const { platform } = req.params;
    const targetUserId = req.params.userId;

    try {
      await PlatformProxyService.execute({
        platform,
        action: 'unfollow',
        contentId: targetUserId,
        tokens: req.user.getPlatformConnection(platform),
      });

      return res.json({ success: true, platform, targetUserId, action: 'unfollow' });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  static async _updateAnalyticsSnapshot(userId, action, successCount) {
    const User = require('../models/User');
    const updateFields = {};

    if (action === 'like' || action === 'all') {
      updateFields['analyticsSnapshot.totalLikes'] = successCount;
    }
    if (action === 'comment' || action === 'all') {
      updateFields['analyticsSnapshot.totalComments'] = successCount;
    }
    if (action === 'follow' || action === 'all') {
      updateFields['analyticsSnapshot.totalFollows'] = successCount;
    }

    if (Object.keys(updateFields).length > 0) {
      updateFields['analyticsSnapshot.lastCalculatedAt'] = new Date();
      await User.findByIdAndUpdate(userId, { $inc: updateFields });
    }
  }
}

module.exports = EngagementController;
