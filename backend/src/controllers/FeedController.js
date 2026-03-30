/**
 * The All-in-One App — Feed Controller
 * Cherry Computer Ltd.
 *
 * Orchestrates unified feed aggregation across all connected platforms.
 * Normalises platform-specific post shapes into a consistent FeedItem format.
 * Results are cached in Redis for fast delivery on subsequent requests.
 */

const redis = require('../config/database').redis;
const PlatformProxyService = require('../services/PlatformProxyService');
const User = require('../models/User');

const CACHE_TTL_SECONDS = 120; // 2 minutes

/**
 * Normalised FeedItem shape:
 * {
 *   id, platform, authorId, authorName, authorUsername, authorAvatar,
 *   text, mediaUrl, mediaType, likeCount, commentCount, shareCount,
 *   createdAt, url, isLiked, isFollowing
 * }
 */

class FeedController {
  /**
   * GET /api/feed
   * Returns unified feed from all connected platforms, sorted by recency.
   */
  static async getUnifiedFeed(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 20, before } = req.query;

      const cacheKey = `feed:${userId}:all`;
      const cached = await redis?.get(cacheKey);
      if (cached && !before) {
        return res.json({ items: JSON.parse(cached), source: 'cache' });
      }

      const user = await User.findById(userId);
      if (!user) return res.status(401).json({ error: 'User not found' });

      const connectedPlatforms = Object.entries(user.platforms || {})
        .filter(([, p]) => p.connected)
        .map(([id]) => id);

      if (connectedPlatforms.length === 0) {
        return res.json({ items: [], message: 'No platforms connected' });
      }

      // Fetch in parallel from all platforms
      const platformFeeds = await Promise.allSettled(
        connectedPlatforms.map((platform) =>
          PlatformProxyService.getFeed(platform, user.platforms[platform], { limit })
        )
      );

      // Collect successful results and normalize
      const allItems = [];
      platformFeeds.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          allItems.push(...result.value);
        } else {
          console.warn(`[FeedController] Platform ${connectedPlatforms[i]} feed failed:`, result.reason?.message);
        }
      });

      // Sort by creation time descending
      allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Apply cursor pagination
      const paginated = before
        ? allItems.filter((item) => new Date(item.createdAt) < new Date(before)).slice(0, limit)
        : allItems.slice(0, limit);

      // Cache the full feed (no cursor)
      if (!before && redis) {
        redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(allItems));
      }

      res.json({ items: paginated, source: 'live', total: allItems.length });
    } catch (err) {
      console.error('[FeedController] getUnifiedFeed error:', err);
      res.status(500).json({ error: 'Failed to fetch feed' });
    }
  }

  /**
   * GET /api/feed/:platform
   * Returns feed filtered to a single platform.
   */
  static async getPlatformFeed(req, res) {
    try {
      const { platform } = req.params;
      const userId = req.user.id;
      const { limit = 20 } = req.query;

      const user = await User.findById(userId);
      const platformData = user?.platforms?.[platform];

      if (!platformData?.connected) {
        return res.status(400).json({ error: `${platform} is not connected` });
      }

      const items = await PlatformProxyService.getFeed(platform, platformData, { limit });
      res.json({ items, platform });
    } catch (err) {
      console.error('[FeedController] getPlatformFeed error:', err);
      res.status(500).json({ error: 'Failed to fetch platform feed' });
    }
  }

  /**
   * GET /api/feed/post/:platform/:postId
   */
  static async getPost(req, res) {
    try {
      const { platform, postId } = req.params;
      const userId = req.user.id;
      const user = await User.findById(userId);

      const post = await PlatformProxyService.getPost(platform, user.platforms[platform], postId);
      res.json({ post });
    } catch (err) {
      console.error('[FeedController] getPost error:', err);
      res.status(500).json({ error: 'Failed to fetch post' });
    }
  }

  /**
   * POST /api/feed/refresh
   * Busts the feed cache and triggers a fresh pull.
   */
  static async refreshFeed(req, res) {
    try {
      const userId = req.user.id;
      const cacheKey = `feed:${userId}:all`;
      await redis?.del(cacheKey);
      res.json({ success: true, message: 'Feed cache cleared — next request will pull fresh data' });
    } catch (err) {
      console.error('[FeedController] refreshFeed error:', err);
      res.status(500).json({ error: 'Failed to refresh feed' });
    }
  }
}

module.exports = FeedController;
