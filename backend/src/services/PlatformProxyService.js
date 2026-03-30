/**
 * The All-in-One App — Platform Proxy Service
 * Cherry Computer Ltd.
 *
 * The bridge between the app's unified data model and each platform's
 * native API. Every platform has its own adapter that maps API responses
 * into normalised FeedItem / EngagementResult shapes.
 *
 * Design principle: each platform adapter is independently replaceable.
 * When Instagram changes their API, only the Instagram adapter changes.
 */

const axios = require('axios');
const { decryptToken } = require('../../../src/utils/crypto');

// ─── Normalised Shapes ─────────────────────────────────────────────────────

/**
 * @typedef {Object} FeedItem
 * @property {string} id
 * @property {string} platform
 * @property {string} authorId
 * @property {string} authorName
 * @property {string} authorUsername
 * @property {string|null} authorAvatar
 * @property {string|null} text
 * @property {string|null} mediaUrl
 * @property {'image'|'video'|'text'|null} mediaType
 * @property {number} likeCount
 * @property {number} commentCount
 * @property {number} shareCount
 * @property {string} createdAt     — ISO 8601
 * @property {string} url
 */

/**
 * @typedef {Object} EngagementResult
 * @property {string} platform
 * @property {'like'|'comment'|'follow'} action
 * @property {'success'|'failed'} status
 * @property {string|null} error
 * @property {Object} data
 * @property {Date} firedAt
 * @property {Date} completedAt
 * @property {number} durationMs
 */

// ─── Platform Adapters ─────────────────────────────────────────────────────

const ADAPTERS = {
  instagram: {
    async getFeed(tokenData, { limit = 20 } = {}) {
      // Instagram Basic Display API
      const token = decryptToken(tokenData.accessToken);
      const { data } = await axios.get('https://graph.instagram.com/me/media', {
        params: {
          fields:        'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count,username',
          access_token:  token,
          limit,
        },
      });
      return (data.data || []).map((post) => ({
        id:              post.id,
        platform:        'instagram',
        authorId:        post.username,
        authorName:      post.username,
        authorUsername:  post.username,
        authorAvatar:    null,
        text:            post.caption || null,
        mediaUrl:        post.media_url || post.thumbnail_url || null,
        mediaType:       post.media_type === 'VIDEO' ? 'video' : 'image',
        likeCount:       post.like_count || 0,
        commentCount:    post.comments_count || 0,
        shareCount:      0,
        createdAt:       post.timestamp,
        url:             post.permalink,
      }));
    },

    async like(tokenData, contentId) {
      const token = decryptToken(tokenData.accessToken);
      const { data } = await axios.post(
        `https://graph.instagram.com/${contentId}/likes`,
        { access_token: token }
      );
      return { success: !!data.success, data };
    },

    async comment(tokenData, contentId, text) {
      const token = decryptToken(tokenData.accessToken);
      const { data } = await axios.post(
        `https://graph.instagram.com/${contentId}/comments`,
        { message: text, access_token: token }
      );
      return { success: !!data.id, data };
    },

    async follow(tokenData, userId) {
      // Instagram doesn't expose a public follow API — this is illustrative
      return { success: false, error: 'Follow not available via Instagram API' };
    },
  },

  twitter: {
    async getFeed(tokenData, { limit = 20 } = {}) {
      const token = decryptToken(tokenData.accessToken);
      const { data } = await axios.get('https://api.twitter.com/2/timelines/reverse_chronological', {
        headers:  { Authorization: `Bearer ${token}` },
        params: {
          'tweet.fields': 'created_at,public_metrics,author_id,text',
          'user.fields':  'name,username,profile_image_url',
          expansions:     'author_id,attachments.media_keys',
          'media.fields': 'url,type,preview_image_url',
          max_results:    limit,
        },
      });
      const users  = Object.fromEntries((data.includes?.users  || []).map((u) => [u.id, u]));
      const media  = Object.fromEntries((data.includes?.media  || []).map((m) => [m.media_key, m]));

      return (data.data || []).map((tweet) => {
        const author = users[tweet.author_id] || {};
        const firstMedia = tweet.attachments?.media_keys?.[0];
        const m = firstMedia ? media[firstMedia] : null;
        return {
          id:              tweet.id,
          platform:        'twitter',
          authorId:        tweet.author_id,
          authorName:      author.name,
          authorUsername:  author.username,
          authorAvatar:    author.profile_image_url,
          text:            tweet.text,
          mediaUrl:        m?.url || m?.preview_image_url || null,
          mediaType:       m?.type === 'video' ? 'video' : m ? 'image' : 'text',
          likeCount:       tweet.public_metrics?.like_count || 0,
          commentCount:    tweet.public_metrics?.reply_count || 0,
          shareCount:      tweet.public_metrics?.retweet_count || 0,
          createdAt:       tweet.created_at,
          url:             `https://twitter.com/i/web/status/${tweet.id}`,
        };
      });
    },

    async like(tokenData, tweetId) {
      const token = decryptToken(tokenData.accessToken);
      const userId = tokenData.userId;
      const { data } = await axios.post(
        `https://api.twitter.com/2/users/${userId}/likes`,
        { tweet_id: tweetId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { success: data?.data?.liked === true, data };
    },

    async comment(tokenData, tweetId, text) {
      const token = decryptToken(tokenData.accessToken);
      const { data } = await axios.post(
        'https://api.twitter.com/2/tweets',
        { text, reply: { in_reply_to_tweet_id: tweetId } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { success: !!data?.data?.id, data };
    },

    async follow(tokenData, targetUserId) {
      const token = decryptToken(tokenData.accessToken);
      const userId = tokenData.userId;
      const { data } = await axios.post(
        `https://api.twitter.com/2/users/${userId}/following`,
        { target_user_id: targetUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { success: data?.data?.following === true, data };
    },
  },

  // Facebook, TikTok, LinkedIn, YouTube adapters follow the same pattern.
  // Each wraps their platform's API and normalises the response into
  // the FeedItem / EngagementResult shape defined above.
  facebook:  _buildStubAdapter('facebook'),
  tiktok:    _buildStubAdapter('tiktok'),
  linkedin:  _buildStubAdapter('linkedin'),
  youtube:   _buildStubAdapter('youtube'),
};

function _buildStubAdapter(platform) {
  return {
    async getFeed(tokenData, { limit = 20 } = {}) {
      // Stub — returns demo data in development
      return Array.from({ length: 3 }, (_, i) => ({
        id:              `${platform}_demo_${i}`,
        platform,
        authorId:        `author_${i}`,
        authorName:      `Demo User ${i}`,
        authorUsername:  `demo_${platform}_${i}`,
        authorAvatar:    null,
        text:            `Sample ${platform} post ${i + 1} — Cherry Computer Ltd. demo data.`,
        mediaUrl:        null,
        mediaType:       'text',
        likeCount:       Math.floor(Math.random() * 10000),
        commentCount:    Math.floor(Math.random() * 500),
        shareCount:      Math.floor(Math.random() * 200),
        createdAt:       new Date(Date.now() - i * 3600000).toISOString(),
        url:             `https://${platform}.com/demo/${i}`,
      }));
    },
    async like()    { return { success: true, data: {} }; },
    async comment() { return { success: true, data: {} }; },
    async follow()  { return { success: true, data: {} }; },
  };
}

// ─── PlatformProxyService ──────────────────────────────────────────────────

class PlatformProxyService {
  static async getFeed(platform, tokenData, options = {}) {
    const adapter = ADAPTERS[platform];
    if (!adapter) throw new Error(`No adapter for platform: ${platform}`);
    return adapter.getFeed(tokenData, options);
  }

  static async getPost(platform, tokenData, postId) {
    // For demo — would call a platform-specific getPost endpoint
    return { id: postId, platform, text: 'Demo post content.', likeCount: 0, commentCount: 0 };
  }

  /**
   * Fire a single engagement action on a single platform.
   * Returns a normalised EngagementResult.
   */
  static async engage(platform, tokenData, action, contentId, extra = {}) {
    const adapter = ADAPTERS[platform];
    if (!adapter) throw new Error(`No adapter for platform: ${platform}`);

    const firedAt = new Date();
    try {
      let result;
      switch (action) {
        case 'like':
          result = await adapter.like(tokenData, contentId);
          break;
        case 'comment':
          result = await adapter.comment(tokenData, contentId, extra.commentText);
          break;
        case 'follow':
          result = await adapter.follow(tokenData, contentId);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      const completedAt = new Date();
      return {
        platform,
        action,
        contentId,
        status:       result.success ? 'success' : 'failed',
        error:        result.error || null,
        data:         result.data,
        firedAt,
        completedAt,
        durationMs:   completedAt - firedAt,
      };
    } catch (err) {
      const completedAt = new Date();
      return {
        platform,
        action,
        contentId,
        status:       'failed',
        error:        err.message,
        data:         null,
        firedAt,
        completedAt,
        durationMs:   completedAt - firedAt,
      };
    }
  }

  /**
   * Fire all actions on all platforms simultaneously.
   */
  static async engageAll(engagements) {
    const results = await Promise.allSettled(
      engagements.map(({ platform, tokenData, action, contentId, extra }) =>
        this.engage(platform, tokenData, action, contentId, extra)
      )
    );

    return results.map((r, i) => {
      if (r.status === 'fulfilled') return r.value;
      return {
        platform:    engagements[i].platform,
        action:      engagements[i].action,
        status:      'failed',
        error:       r.reason?.message || 'Unknown error',
        firedAt:     new Date(),
        completedAt: new Date(),
        durationMs:  0,
      };
    });
  }
}

module.exports = PlatformProxyService;
