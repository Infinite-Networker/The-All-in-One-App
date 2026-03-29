/**
 * The All-in-One App — Platform Proxy Service
 * Cherry Computer Ltd.
 *
 * The backend proxy layer that routes engagement actions to each platform's API.
 * This service handles token decryption, request signing, retry logic,
 * and platform-specific quirks — so the rest of the backend stays clean.
 */

const axios = require('axios');
const crypto = require('crypto');

// ─────────────────────────────────────────────────────────────────────────────
// ENCRYPTION UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || 'a'.repeat(32), 'utf8').slice(0, 32);

const decryptToken = (encryptedToken) => {
  const [ivHex, encrypted] = encryptedToken.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
};

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM API BASE URLS
// ─────────────────────────────────────────────────────────────────────────────

const PLATFORM_BASES = {
  instagram: 'https://graph.instagram.com/v18.0',
  twitter: 'https://api.twitter.com/2',
  facebook: 'https://graph.facebook.com/v19.0',
  tiktok: 'https://open.tiktokapis.com/v2',
  linkedin: 'https://api.linkedin.com/v2',
  youtube: 'https://www.googleapis.com/youtube/v3',
};

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM PROXY MAPS (action → API endpoint + method)
// ─────────────────────────────────────────────────────────────────────────────

const PLATFORM_ACTION_MAP = {
  instagram: {
    like: ({ contentId }) => ({
      method: 'POST',
      url: `${PLATFORM_BASES.instagram}/${contentId}/likes`,
      data: {},
    }),
    unlike: ({ contentId }) => ({
      method: 'DELETE',
      url: `${PLATFORM_BASES.instagram}/${contentId}/likes`,
    }),
    comment: ({ contentId, comment }) => ({
      method: 'POST',
      url: `${PLATFORM_BASES.instagram}/${contentId}/comments`,
      data: { message: comment },
    }),
    follow: ({ contentId }) => ({
      method: 'POST',
      url: `${PLATFORM_BASES.instagram}/me/follows`,
      data: { target_user_id: contentId },
    }),
  },

  twitter: {
    like: ({ contentId, userId }) => ({
      method: 'POST',
      url: `${PLATFORM_BASES.twitter}/users/${userId}/likes`,
      data: { tweet_id: contentId },
    }),
    unlike: ({ contentId, userId }) => ({
      method: 'DELETE',
      url: `${PLATFORM_BASES.twitter}/users/${userId}/likes/${contentId}`,
    }),
    comment: ({ contentId, comment }) => ({
      method: 'POST',
      url: `${PLATFORM_BASES.twitter}/tweets`,
      data: { text: comment, reply: { in_reply_to_tweet_id: contentId } },
    }),
    follow: ({ contentId, userId }) => ({
      method: 'POST',
      url: `${PLATFORM_BASES.twitter}/users/${userId}/following`,
      data: { target_user_id: contentId },
    }),
    unfollow: ({ contentId, userId }) => ({
      method: 'DELETE',
      url: `${PLATFORM_BASES.twitter}/users/${userId}/following/${contentId}`,
    }),
  },

  facebook: {
    like: ({ contentId }) => ({
      method: 'POST',
      url: `${PLATFORM_BASES.facebook}/${contentId}/likes`,
    }),
    unlike: ({ contentId }) => ({
      method: 'DELETE',
      url: `${PLATFORM_BASES.facebook}/${contentId}/likes`,
    }),
    comment: ({ contentId, comment }) => ({
      method: 'POST',
      url: `${PLATFORM_BASES.facebook}/${contentId}/comments`,
      data: { message: comment },
    }),
    follow: ({ contentId }) => ({
      method: 'POST',
      url: `${PLATFORM_BASES.facebook}/${contentId}/subscribed_apps`,
    }),
  },

  tiktok: {
    like: ({ contentId }) => ({
      method: 'POST',
      url: `${PLATFORM_BASES.tiktok}/video/like/`,
      data: { video_id: contentId },
    }),
    comment: ({ contentId, comment }) => ({
      method: 'POST',
      url: `${PLATFORM_BASES.tiktok}/video/comment/publish/`,
      data: { video_id: contentId, text: comment },
    }),
    follow: ({ contentId }) => ({
      method: 'POST',
      url: `${PLATFORM_BASES.tiktok}/follow/list/`,
      data: { to_user_id: contentId },
    }),
  },

  linkedin: {
    like: ({ contentId, userId }) => ({
      method: 'POST',
      url: `${PLATFORM_BASES.linkedin}/socialActions/${encodeURIComponent(contentId)}/likes`,
      data: { actor: `urn:li:person:${userId}` },
    }),
    comment: ({ contentId, userId, comment }) => ({
      method: 'POST',
      url: `${PLATFORM_BASES.linkedin}/socialActions/${encodeURIComponent(contentId)}/comments`,
      data: {
        actor: `urn:li:person:${userId}`,
        message: { text: comment },
      },
    }),
    follow: ({ contentId }) => ({
      method: 'POST',
      url: `${PLATFORM_BASES.linkedin}/me/following`,
      data: { target: contentId },
    }),
  },

  youtube: {
    like: ({ contentId }) => ({
      method: 'POST',
      url: `${PLATFORM_BASES.youtube}/videos/rate`,
      params: { id: contentId, rating: 'like' },
    }),
    unlike: ({ contentId }) => ({
      method: 'POST',
      url: `${PLATFORM_BASES.youtube}/videos/rate`,
      params: { id: contentId, rating: 'none' },
    }),
    comment: ({ contentId, comment }) => ({
      method: 'POST',
      url: `${PLATFORM_BASES.youtube}/commentThreads`,
      params: { part: 'snippet' },
      data: {
        snippet: {
          videoId: contentId,
          topLevelComment: { snippet: { textOriginal: comment } },
        },
      },
    }),
    follow: ({ contentId }) => ({
      method: 'POST',
      url: `${PLATFORM_BASES.youtube}/subscriptions`,
      params: { part: 'snippet' },
      data: {
        snippet: {
          resourceId: { kind: 'youtube#channel', channelId: contentId },
        },
      },
    }),
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM PROXY SERVICE
// ─────────────────────────────────────────────────────────────────────────────

class PlatformProxyServiceClass {
  /**
   * Execute a platform action, with retry logic and error normalisation.
   */
  async execute({ platform, action, contentId, comment, tokens }) {
    const actionMap = PLATFORM_ACTION_MAP[platform];
    if (!actionMap) throw new Error(`Unknown platform: ${platform}`);

    const actionFn = actionMap[action];
    if (!actionFn) throw new Error(`Action "${action}" not supported for ${platform}`);

    // Decrypt access token
    let accessToken;
    try {
      accessToken = decryptToken(tokens.encryptedAccessToken);
    } catch {
      throw new Error(`Failed to decrypt ${platform} access token`);
    }

    const requestConfig = actionFn({
      contentId,
      comment,
      userId: tokens.platformUserId,
    });

    return this._executeWithRetry({
      ...requestConfig,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'TheAllInOneApp/1.0 (Cherry Computer Ltd.)',
      },
      timeout: 10000,
    });
  }

  /**
   * Execute HTTP request with exponential backoff retry.
   */
  async _executeWithRetry(config, attempt = 1, maxAttempts = 3) {
    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      const status = error.response?.status;

      // Don't retry on client errors (except 429 rate limit)
      if (status && status < 500 && status !== 429) {
        const apiError = new Error(
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          `API error ${status}`
        );
        apiError.status = status;
        throw apiError;
      }

      // Retry on server errors and rate limits
      if (attempt < maxAttempts) {
        const delay = status === 429
          ? (parseInt(error.response?.headers['retry-after']) || 60) * 1000
          : Math.min(1000 * Math.pow(2, attempt), 10000);

        await new Promise(resolve => setTimeout(resolve, delay));
        return this._executeWithRetry(config, attempt + 1, maxAttempts);
      }

      throw new Error(`Request failed after ${maxAttempts} attempts: ${error.message}`);
    }
  }
}

const PlatformProxyService = new PlatformProxyServiceClass();
module.exports = PlatformProxyService;
