/**
 * The All-in-One App — Platform Service
 * Cherry Computer Ltd.
 *
 * This is the heart of the engagement engine. PlatformService abstracts
 * all platform-specific API calls behind a unified interface so the rest
 * of the app doesn't need to know the difference between Instagram and LinkedIn.
 *
 * Each platform follows the same contract:
 *   - connect(tokens)     → Store OAuth tokens securely
 *   - like(contentId)     → Like / react to a post
 *   - comment(contentId, text) → Post a comment
 *   - follow(userId)      → Follow a user
 *   - getFeed(options)    → Fetch normalised content items
 *   - getAnalytics(range) → Fetch engagement metrics
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';
import { encryptToken, decryptToken } from '../../utils/crypto';
import { normalisePost } from '../../utils/normalise';

// ─────────────────────────────────────────────────────────────────────────────
// SUPPORTED PLATFORMS
// ─────────────────────────────────────────────────────────────────────────────

export const PLATFORMS = {
  INSTAGRAM: 'instagram',
  TWITTER: 'twitter',
  FACEBOOK: 'facebook',
  TIKTOK: 'tiktok',
  LINKEDIN: 'linkedin',
  YOUTUBE: 'youtube',
};

// ─────────────────────────────────────────────────────────────────────────────
// BASE PLATFORM CLASS
// ─────────────────────────────────────────────────────────────────────────────

class BasePlatform {
  constructor(platformId) {
    this.platformId = platformId;
    this.client = null;
    this.tokens = null;
  }

  /**
   * Securely store OAuth tokens for this platform.
   * Tokens are encrypted with AES-256 before persistence.
   */
  async connect(tokens) {
    this.tokens = tokens;
    const encrypted = encryptToken(JSON.stringify(tokens));
    await Keychain.setInternetCredentials(
      `allinone_${this.platformId}`,
      this.platformId,
      encrypted
    );
  }

  /**
   * Load stored tokens back from secure keychain.
   */
  async loadTokens() {
    const credentials = await Keychain.getInternetCredentials(
      `allinone_${this.platformId}`
    );
    if (credentials) {
      this.tokens = JSON.parse(decryptToken(credentials.password));
      return this.tokens;
    }
    return null;
  }

  /**
   * Remove stored credentials on disconnect / logout.
   */
  async disconnect() {
    await Keychain.resetInternetCredentials(`allinone_${this.platformId}`);
    this.tokens = null;
    this.client = null;
  }

  /**
   * Check whether this platform has valid, non-expired tokens.
   */
  isConnected() {
    if (!this.tokens) return false;
    if (this.tokens.expiresAt && Date.now() > this.tokens.expiresAt) return false;
    return true;
  }

  /**
   * Proxy the API call through our backend to handle rate limiting,
   * token refresh, and platform quirks centrally.
   */
  async proxyRequest(method, endpoint, data = {}) {
    const response = await axios({
      method,
      url: `${API_BASE_URL}/proxy/${this.platformId}${endpoint}`,
      data,
      headers: {
        'X-Platform-Token': this.tokens?.accessToken,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTAGRAM PLATFORM
// ─────────────────────────────────────────────────────────────────────────────

class InstagramPlatform extends BasePlatform {
  constructor() { super(PLATFORMS.INSTAGRAM); }

  async like(mediaId) {
    return this.proxyRequest('POST', `/media/${mediaId}/likes`);
  }

  async comment(mediaId, text) {
    return this.proxyRequest('POST', `/media/${mediaId}/comments`, { message: text });
  }

  async follow(userId) {
    return this.proxyRequest('POST', `/friendships/create/${userId}`);
  }

  async getFeed({ limit = 20, cursor = null } = {}) {
    const raw = await this.proxyRequest('GET', `/feed?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`);
    return raw.data.map(post => normalisePost(post, PLATFORMS.INSTAGRAM));
  }

  async getAnalytics(dateRange) {
    return this.proxyRequest('GET', `/insights?period=${dateRange}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TWITTER / X PLATFORM
// ─────────────────────────────────────────────────────────────────────────────

class TwitterPlatform extends BasePlatform {
  constructor() { super(PLATFORMS.TWITTER); }

  async like(tweetId) {
    return this.proxyRequest('POST', `/tweets/${tweetId}/likes`);
  }

  async comment(tweetId, text) {
    return this.proxyRequest('POST', `/tweets`, {
      text,
      reply: { in_reply_to_tweet_id: tweetId },
    });
  }

  async follow(userId) {
    return this.proxyRequest('POST', `/users/me/following`, { target_user_id: userId });
  }

  async getFeed({ limit = 20, cursor = null } = {}) {
    const raw = await this.proxyRequest('GET', `/timelines/reverse_chronological?max_results=${limit}${cursor ? `&pagination_token=${cursor}` : ''}`);
    return (raw.data || []).map(tweet => normalisePost(tweet, PLATFORMS.TWITTER));
  }

  async getAnalytics(dateRange) {
    return this.proxyRequest('GET', `/analytics?granularity=day&start_time=${dateRange.start}&end_time=${dateRange.end}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FACEBOOK PLATFORM
// ─────────────────────────────────────────────────────────────────────────────

class FacebookPlatform extends BasePlatform {
  constructor() { super(PLATFORMS.FACEBOOK); }

  async like(postId) {
    return this.proxyRequest('POST', `/${postId}/likes`);
  }

  async comment(postId, text) {
    return this.proxyRequest('POST', `/${postId}/comments`, { message: text });
  }

  async follow(pageId) {
    return this.proxyRequest('POST', `/${pageId}/subscribed_apps`);
  }

  async getFeed({ limit = 20, cursor = null } = {}) {
    const raw = await this.proxyRequest('GET', `/me/feed?fields=id,message,story,created_time,from,likes.summary(true),comments.summary(true)&limit=${limit}${cursor ? `&after=${cursor}` : ''}`);
    return (raw.data || []).map(post => normalisePost(post, PLATFORMS.FACEBOOK));
  }

  async getAnalytics(dateRange) {
    return this.proxyRequest('GET', `/me/insights?metric=page_impressions,page_engaged_users&period=day&since=${dateRange.start}&until=${dateRange.end}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TIKTOK PLATFORM
// ─────────────────────────────────────────────────────────────────────────────

class TikTokPlatform extends BasePlatform {
  constructor() { super(PLATFORMS.TIKTOK); }

  async like(videoId) {
    return this.proxyRequest('POST', `/video/like/`, { video_id: videoId });
  }

  async comment(videoId, text) {
    return this.proxyRequest('POST', `/video/comment/publish/`, { video_id: videoId, text });
  }

  async follow(userId) {
    return this.proxyRequest('POST', `/follow/list/`, { to_user_id: userId });
  }

  async getFeed({ limit = 20, cursor = 0 } = {}) {
    const raw = await this.proxyRequest('POST', `/video/list/`, { max_count: limit, cursor });
    return (raw.data?.videos || []).map(video => normalisePost(video, PLATFORMS.TIKTOK));
  }

  async getAnalytics(dateRange) {
    return this.proxyRequest('POST', `/research/video/query/`, { query: { and: [] }, start_date: dateRange.start, end_date: dateRange.end });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LINKEDIN PLATFORM
// ─────────────────────────────────────────────────────────────────────────────

class LinkedInPlatform extends BasePlatform {
  constructor() { super(PLATFORMS.LINKEDIN); }

  async like(postUrn) {
    return this.proxyRequest('POST', `/socialActions/${encodeURIComponent(postUrn)}/likes`, {
      actor: `urn:li:person:${this.tokens?.userId}`,
    });
  }

  async comment(postUrn, text) {
    return this.proxyRequest('POST', `/socialActions/${encodeURIComponent(postUrn)}/comments`, {
      actor: `urn:li:person:${this.tokens?.userId}`,
      message: { text },
    });
  }

  async follow(personUrn) {
    return this.proxyRequest('POST', `/me/following`, { target: personUrn });
  }

  async getFeed({ limit = 20, start = 0 } = {}) {
    const raw = await this.proxyRequest('GET', `/feed?q=memberNetworkFeed&count=${limit}&start=${start}`);
    return (raw.elements || []).map(post => normalisePost(post, PLATFORMS.LINKEDIN));
  }

  async getAnalytics(dateRange) {
    return this.proxyRequest('GET', `/organizationalEntityShareStatistics?q=organizationalEntity&timeIntervals.timeGranularityType=DAY&timeIntervals.timeRange.start=${dateRange.start}&timeIntervals.timeRange.end=${dateRange.end}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// YOUTUBE PLATFORM
// ─────────────────────────────────────────────────────────────────────────────

class YouTubePlatform extends BasePlatform {
  constructor() { super(PLATFORMS.YOUTUBE); }

  async like(videoId) {
    return this.proxyRequest('POST', `/videos/rate?id=${videoId}&rating=like`);
  }

  async comment(videoId, text) {
    return this.proxyRequest('POST', `/commentThreads`, {
      snippet: {
        videoId,
        topLevelComment: {
          snippet: { textOriginal: text },
        },
      },
    });
  }

  async follow(channelId) {
    return this.proxyRequest('POST', `/subscriptions`, {
      snippet: {
        resourceId: {
          kind: 'youtube#channel',
          channelId,
        },
      },
    });
  }

  async getFeed({ limit = 20, pageToken = null } = {}) {
    const raw = await this.proxyRequest('GET', `/activities?part=snippet,contentDetails&home=true&maxResults=${limit}${pageToken ? `&pageToken=${pageToken}` : ''}`);
    return (raw.items || []).map(item => normalisePost(item, PLATFORMS.YOUTUBE));
  }

  async getAnalytics(dateRange) {
    return this.proxyRequest('GET', `/reports?ids=channel%3D%3DMINE&startDate=${dateRange.start}&endDate=${dateRange.end}&metrics=views,estimatedMinutesWatched,likes,comments,shares`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM SERVICE FACTORY
// ─────────────────────────────────────────────────────────────────────────────

class PlatformServiceManager {
  constructor() {
    this.platforms = {
      [PLATFORMS.INSTAGRAM]: new InstagramPlatform(),
      [PLATFORMS.TWITTER]: new TwitterPlatform(),
      [PLATFORMS.FACEBOOK]: new FacebookPlatform(),
      [PLATFORMS.TIKTOK]: new TikTokPlatform(),
      [PLATFORMS.LINKEDIN]: new LinkedInPlatform(),
      [PLATFORMS.YOUTUBE]: new YouTubePlatform(),
    };
  }

  get(platformId) {
    const platform = this.platforms[platformId];
    if (!platform) throw new Error(`Unknown platform: ${platformId}`);
    return platform;
  }

  getAll() {
    return Object.values(this.platforms);
  }

  getConnected() {
    return Object.values(this.platforms).filter(p => p.isConnected());
  }

  /**
   * The signature feature — engage across ALL connected platforms with one call.
   * This is what "One-Tap Universal Engagement" runs on under the hood.
   */
  async engageAll({ contentMap, action, comment = '' }) {
    const connected = this.getConnected();
    const results = await Promise.allSettled(
      connected.map(async (platform) => {
        const contentId = contentMap[platform.platformId];
        if (!contentId) return { platform: platform.platformId, skipped: true };

        switch (action) {
          case 'like':
            await platform.like(contentId);
            break;
          case 'comment':
            await platform.comment(contentId, comment);
            break;
          case 'follow':
            await platform.follow(contentId);
            break;
          case 'all':
            await platform.like(contentId);
            if (comment) await platform.comment(contentId, comment);
            break;
          default:
            throw new Error(`Unknown action: ${action}`);
        }

        return { platform: platform.platformId, success: true };
      })
    );

    return results.map((result, i) => ({
      platform: connected[i].platformId,
      status: result.status,
      value: result.value || null,
      error: result.reason?.message || null,
    }));
  }

  /**
   * Aggregate feeds from all connected platforms into a unified, sorted stream.
   */
  async getUnifiedFeed({ limit = 10 } = {}) {
    const connected = this.getConnected();
    const feedResults = await Promise.allSettled(
      connected.map(platform => platform.getFeed({ limit }))
    );

    const allPosts = feedResults
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value);

    // Sort by timestamp, newest first
    return allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Aggregate analytics across all connected platforms.
   */
  async getAggregateAnalytics(dateRange) {
    const connected = this.getConnected();
    const analyticsResults = await Promise.allSettled(
      connected.map(platform => platform.getAnalytics(dateRange))
    );

    return analyticsResults.reduce((acc, result, i) => {
      acc[connected[i].platformId] = {
        status: result.status,
        data: result.value || null,
        error: result.reason?.message || null,
      };
      return acc;
    }, {});
  }
}

// Export a singleton instance
export const PlatformService = new PlatformServiceManager();
export default PlatformService;
