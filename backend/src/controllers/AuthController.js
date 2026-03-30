/**
 * The All-in-One App — Auth Controller
 * Cherry Computer Ltd.
 *
 * Handles OAuth 2.0 flows for all 6 social platforms.
 * Tokens are never stored raw — they're encrypted with AES-256
 * before persistence, and decrypted only at request time.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { encryptToken, decryptToken } = require('../../../src/utils/crypto');

// Platform OAuth configuration map
const PLATFORM_CONFIGS = {
  instagram: {
    authUrl:     'https://api.instagram.com/oauth/authorize',
    tokenUrl:    'https://api.instagram.com/oauth/access_token',
    scope:       'user_profile,user_media',
  },
  twitter: {
    authUrl:     'https://twitter.com/i/oauth2/authorize',
    tokenUrl:    'https://api.twitter.com/2/oauth2/token',
    scope:       'tweet.read users.read like.write follows.write',
  },
  facebook: {
    authUrl:     'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl:    'https://graph.facebook.com/v18.0/oauth/access_token',
    scope:       'public_profile,pages_manage_engagement',
  },
  tiktok: {
    authUrl:     'https://www.tiktok.com/v2/auth/authorize',
    tokenUrl:    'https://open.tiktokapis.com/v2/oauth/token/',
    scope:       'user.info.basic,video.list,like.video',
  },
  linkedin: {
    authUrl:     'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl:    'https://www.linkedin.com/oauth/v2/accessToken',
    scope:       'r_liteprofile r_emailaddress w_member_social',
  },
  youtube: {
    authUrl:     'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl:    'https://oauth2.googleapis.com/token',
    scope:       'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.force-ssl',
  },
};

const SUPPORTED_PLATFORMS = Object.keys(PLATFORM_CONFIGS);

class AuthController {
  /**
   * GET /api/auth/oauth/:platform/url
   * Returns the OAuth URL for the client to redirect to.
   */
  static async getOAuthUrl(req, res) {
    try {
      const { platform } = req.params;
      if (!SUPPORTED_PLATFORMS.includes(platform)) {
        return res.status(400).json({ error: `Unsupported platform: ${platform}` });
      }

      const config = PLATFORM_CONFIGS[platform];
      const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`];
      const redirectUri = `${process.env.API_BASE_URL}/auth/oauth/${platform}/callback`;

      if (!clientId) {
        return res.status(500).json({ error: `${platform} OAuth not configured` });
      }

      const state = jwt.sign(
        { platform, userId: req.user?.id, ts: Date.now() },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
      );

      const params = new URLSearchParams({
        client_id:     clientId,
        redirect_uri:  redirectUri,
        scope:         config.scope,
        response_type: 'code',
        state,
      });

      const authUrl = `${config.authUrl}?${params.toString()}`;
      res.json({ authUrl, platform });
    } catch (err) {
      console.error('[AuthController] getOAuthUrl error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /api/auth/oauth/:platform/callback
   * Exchange auth code for access/refresh tokens, encrypt and store.
   */
  static async handleOAuthCallback(req, res) {
    try {
      const { platform } = req.params;
      const { code, state } = req.body;

      if (!SUPPORTED_PLATFORMS.includes(platform)) {
        return res.status(400).json({ error: `Unsupported platform: ${platform}` });
      }

      // Verify state token
      let decoded;
      try {
        decoded = jwt.verify(state, process.env.JWT_SECRET);
      } catch {
        return res.status(400).json({ error: 'Invalid or expired state token' });
      }

      if (decoded.platform !== platform) {
        return res.status(400).json({ error: 'State platform mismatch' });
      }

      // Exchange code for tokens (simplified — real impl calls platform APIs)
      const tokenData = {
        accessToken:  `demo_access_${platform}_${Date.now()}`,
        refreshToken: `demo_refresh_${platform}_${Date.now()}`,
        expiresAt:    Date.now() + (3600 * 1000),
        platform,
      };

      // Encrypt tokens before storage
      const encryptedAccess  = encryptToken(tokenData.accessToken);
      const encryptedRefresh = encryptToken(tokenData.refreshToken);

      // Upsert platform connection on user
      await User.findByIdAndUpdate(
        decoded.userId,
        {
          [`platforms.${platform}`]: {
            connected:    true,
            accessToken:  encryptedAccess,
            refreshToken: encryptedRefresh,
            expiresAt:    tokenData.expiresAt,
            connectedAt:  new Date(),
          },
        },
        { upsert: true }
      );

      res.json({ success: true, platform, message: `${platform} connected successfully` });
    } catch (err) {
      console.error('[AuthController] handleOAuthCallback error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /api/auth/token/refresh
   * Refresh expired JWT session token.
   */
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ error: 'No refresh token provided' });
      }

      let decoded;
      try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      } catch {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
      }

      const user = await User.findById(decoded.sub);
      if (!user) return res.status(401).json({ error: 'User not found' });

      const newAccessToken = jwt.sign(
        { sub: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      res.json({ accessToken: newAccessToken });
    } catch (err) {
      console.error('[AuthController] refreshToken error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * DELETE /api/auth/oauth/:platform/disconnect
   */
  static async disconnectPlatform(req, res) {
    try {
      const { platform } = req.params;
      const userId = req.user?.id;

      await User.findByIdAndUpdate(userId, {
        [`platforms.${platform}`]: { connected: false },
      });

      res.json({ success: true, platform, message: `${platform} disconnected` });
    } catch (err) {
      console.error('[AuthController] disconnectPlatform error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /** POST /api/auth/login */
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+passwordHash');

      if (!user || !(await user.verifyPassword(password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const accessToken = jwt.sign(
        { sub: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { sub: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '30d' }
      );

      res.json({ accessToken, refreshToken, user: user.toPublic() });
    } catch (err) {
      console.error('[AuthController] login error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /** POST /api/auth/logout */
  static async logout(req, res) {
    // In a production implementation, invalidate the refresh token
    // by adding it to a Redis blocklist with its remaining TTL.
    res.json({ success: true, message: 'Logged out' });
  }

  /** GET /api/auth/me */
  static async getMe(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user.toPublic());
    } catch (err) {
      console.error('[AuthController] getMe error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = AuthController;
