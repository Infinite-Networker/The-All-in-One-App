/**
 * The All-in-One App — OAuth 2.0 Authentication Service
 * Cherry Computer Ltd.
 *
 * I handle all OAuth 2.0 flows here with official platform SDKs.
 * Every authentication goes through the platform's own auth layer —
 * we never touch raw passwords. Security is non-negotiable.
 */

import { authorize, refresh } from 'react-native-app-auth';
import * as Keychain from 'react-native-keychain';
import { PLATFORMS } from '../platforms/PlatformService';
import { encryptToken, decryptToken } from '../../utils/crypto';

// ─────────────────────────────────────────────────────────────────────────────
// OAUTH CONFIGURATION PER PLATFORM
// ─────────────────────────────────────────────────────────────────────────────

const OAUTH_CONFIGS = {
  [PLATFORMS.INSTAGRAM]: {
    clientId: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    redirectUrl: 'allinoneapp://oauth/instagram',
    scopes: ['instagram_basic', 'instagram_content_publish', 'instagram_manage_comments', 'instagram_manage_insights'],
    serviceConfiguration: {
      authorizationEndpoint: 'https://api.instagram.com/oauth/authorize',
      tokenEndpoint: 'https://api.instagram.com/oauth/access_token',
    },
  },

  [PLATFORMS.TWITTER]: {
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
    redirectUrl: 'allinoneapp://oauth/twitter',
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'follows.write', 'like.write'],
    additionalParameters: { code_challenge_method: 'S256' },
    usePKCE: true,
    serviceConfiguration: {
      authorizationEndpoint: 'https://twitter.com/i/oauth2/authorize',
      tokenEndpoint: 'https://api.twitter.com/2/oauth2/token',
      revocationEndpoint: 'https://api.twitter.com/2/oauth2/revoke',
    },
  },

  [PLATFORMS.FACEBOOK]: {
    clientId: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    redirectUrl: 'allinoneapp://oauth/facebook',
    scopes: ['public_profile', 'email', 'pages_manage_posts', 'pages_read_engagement', 'user_posts'],
    serviceConfiguration: {
      authorizationEndpoint: 'https://www.facebook.com/v19.0/dialog/oauth',
      tokenEndpoint: 'https://graph.facebook.com/v19.0/oauth/access_token',
    },
  },

  [PLATFORMS.TIKTOK]: {
    clientId: process.env.TIKTOK_CLIENT_KEY,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
    redirectUrl: 'allinoneapp://oauth/tiktok',
    scopes: ['user.info.basic', 'video.list', 'video.upload', 'comment.list', 'like.list'],
    serviceConfiguration: {
      authorizationEndpoint: 'https://www.tiktok.com/v2/auth/authorize/',
      tokenEndpoint: 'https://open.tiktokapis.com/v2/oauth/token/',
    },
  },

  [PLATFORMS.LINKEDIN]: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    redirectUrl: 'allinoneapp://oauth/linkedin',
    scopes: ['openid', 'profile', 'email', 'w_member_social', 'r_basicprofile'],
    serviceConfiguration: {
      authorizationEndpoint: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenEndpoint: 'https://www.linkedin.com/oauth/v2/accessToken',
      revocationEndpoint: 'https://www.linkedin.com/oauth/v2/revoke',
    },
  },

  [PLATFORMS.YOUTUBE]: {
    clientId: process.env.YOUTUBE_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
    redirectUrl: 'allinoneapp://oauth/youtube',
    scopes: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.force-ssl',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
    ],
    serviceConfiguration: {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// OAUTH SERVICE
// ─────────────────────────────────────────────────────────────────────────────

class OAuthServiceClass {
  /**
   * Initiate OAuth 2.0 authorization flow for a given platform.
   * Opens the platform's native browser for authentication.
   * Returns normalised token object on success.
   */
  async authenticate(platformId) {
    const config = OAUTH_CONFIGS[platformId];
    if (!config) throw new Error(`OAuth config not found for platform: ${platformId}`);

    try {
      const authResult = await authorize(config);

      const tokens = {
        accessToken: authResult.accessToken,
        refreshToken: authResult.refreshToken,
        idToken: authResult.idToken || null,
        expiresAt: new Date(authResult.accessTokenExpirationDate).getTime(),
        scopes: authResult.scopes,
        platform: platformId,
        connectedAt: Date.now(),
      };

      await this._storeTokens(platformId, tokens);
      return tokens;
    } catch (error) {
      if (error.message?.includes('User cancelled')) {
        throw new Error('AUTH_CANCELLED');
      }
      throw new Error(`Authentication failed for ${platformId}: ${error.message}`);
    }
  }

  /**
   * Silently refresh access token using stored refresh token.
   */
  async refreshTokens(platformId) {
    const config = OAUTH_CONFIGS[platformId];
    const stored = await this._loadTokens(platformId);

    if (!stored?.refreshToken) {
      throw new Error(`No refresh token available for ${platformId}`);
    }

    try {
      const refreshed = await refresh(config, { refreshToken: stored.refreshToken });

      const tokens = {
        ...stored,
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken || stored.refreshToken,
        expiresAt: new Date(refreshed.accessTokenExpirationDate).getTime(),
        refreshedAt: Date.now(),
      };

      await this._storeTokens(platformId, tokens);
      return tokens;
    } catch (error) {
      // If refresh fails, the user needs to re-authenticate
      await this.revokeTokens(platformId);
      throw new Error(`Token refresh failed for ${platformId}. Please reconnect.`);
    }
  }

  /**
   * Revoke tokens and clean up stored credentials.
   */
  async revokeTokens(platformId) {
    await Keychain.resetInternetCredentials(`allinone_oauth_${platformId}`);
  }

  /**
   * Get valid tokens for a platform, refreshing automatically if needed.
   */
  async getValidTokens(platformId) {
    const tokens = await this._loadTokens(platformId);
    if (!tokens) return null;

    const bufferMs = 5 * 60 * 1000; // 5-minute buffer
    const isExpired = tokens.expiresAt && Date.now() > tokens.expiresAt - bufferMs;

    if (isExpired && tokens.refreshToken) {
      return await this.refreshTokens(platformId);
    }

    return tokens;
  }

  /**
   * Check if a platform is connected (has valid tokens).
   */
  async isConnected(platformId) {
    const tokens = await this.getValidTokens(platformId);
    return !!tokens;
  }

  /**
   * Get connection status for all platforms.
   */
  async getAllConnectionStatuses() {
    const statuses = {};
    for (const platformId of Object.values(PLATFORMS)) {
      statuses[platformId] = await this.isConnected(platformId);
    }
    return statuses;
  }

  // ─── Private Methods ───────────────────────────────────────────────────────

  async _storeTokens(platformId, tokens) {
    const encrypted = encryptToken(JSON.stringify(tokens));
    await Keychain.setInternetCredentials(
      `allinone_oauth_${platformId}`,
      platformId,
      encrypted
    );
  }

  async _loadTokens(platformId) {
    const credentials = await Keychain.getInternetCredentials(
      `allinone_oauth_${platformId}`
    );
    if (!credentials) return null;

    try {
      return JSON.parse(decryptToken(credentials.password));
    } catch {
      return null;
    }
  }
}

export const OAuthService = new OAuthServiceClass();
export default OAuthService;
