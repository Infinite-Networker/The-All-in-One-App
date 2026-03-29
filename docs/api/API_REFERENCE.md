# The All-in-One App — API Reference
**Cherry Computer Ltd.** | v1.0.0

Base URL: `https://api.allinoneapp.com/v1`
Auth: `Bearer <JWT_TOKEN>` header required on all authenticated endpoints.

---

## Authentication

### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "displayName": "Jane Creator",
  "password": "SecurePass123!"
}
```

**Response `201`:**
```json
{
  "success": true,
  "user": {
    "id": "65f1a2b3c4d5e6f7a8b9c0d1",
    "email": "user@example.com",
    "displayName": "Jane Creator",
    "plan": "free",
    "connectedPlatformCount": 0
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
    "expiresIn": 900
  }
}
```

---

### POST `/api/auth/login`
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response `200`:** Same structure as register.

---

### POST `/api/auth/refresh`
Refresh an expired access token using the refresh token.

**Request Body:**
```json
{ "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..." }
```

---

### POST `/api/auth/logout`
Revoke the current access token.

**Headers:** `Authorization: Bearer <token>`

---

## Platform Accounts

### GET `/api/accounts`
List all connected platform accounts for the authenticated user.

**Response `200`:**
```json
{
  "success": true,
  "platforms": [
    {
      "platformId": "instagram",
      "username": "jane_creates",
      "displayName": "Jane Creator",
      "avatarUrl": "https://...",
      "connectedAt": "2026-01-15T10:30:00Z",
      "isActive": true,
      "scopes": ["instagram_basic", "instagram_manage_comments"]
    }
  ]
}
```

---

### POST `/api/accounts/:platformId/connect`
Connect a platform account via OAuth token exchange.

**Request Body:**
```json
{
  "authCode": "oauth_auth_code_from_platform",
  "redirectUri": "allinoneapp://oauth/instagram",
  "codeVerifier": "pkce_code_verifier" 
}
```

---

### DELETE `/api/accounts/:platformId`
Disconnect a platform account and revoke stored tokens.

---

## Engagement (Core Feature)

### POST `/api/engagement/all` ⚡ *One-Tap Universal Engagement*
Execute engagement actions across ALL connected platforms simultaneously.

**Request Body:**
```json
{
  "contentMap": {
    "instagram": "17841400008460056",
    "twitter": "1760123456789012345",
    "facebook": "1234567890_9876543210",
    "tiktok": "7298765432112345678",
    "linkedin": "urn:li:activity:7012345678901234567",
    "youtube": "dQw4w9WgXcQ"
  },
  "action": "all",
  "comment": "Amazing content! Love this 🔥",
  "platforms": ["instagram", "twitter", "youtube"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `contentMap` | object | ✅ | Map of platformId → content ID |
| `action` | string | ✅ | `like` \| `comment` \| `follow` \| `all` |
| `comment` | string | — | Required when action is `comment` or `all` |
| `platforms` | string[] | — | Subset of platforms to engage. Defaults to all connected |

**Response `200`:**
```json
{
  "success": true,
  "batchId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "summary": {
    "total": 6,
    "succeeded": 5,
    "failed": 0,
    "rateLimited": 1,
    "executionTimeMs": 342
  },
  "results": [
    {
      "platform": "instagram",
      "username": "jane_creates",
      "status": "success",
      "data": { "id": "17841400008460056" }
    },
    {
      "platform": "tiktok",
      "username": "jane_tiktok",
      "status": "rate_limited",
      "error": "TikTok API rate limit reached. Try again in 60s."
    }
  ],
  "message": "Engaged across 5/6 platforms in 342ms",
  "poweredBy": "Cherry Computer Ltd. · The All-in-One App"
}
```

---

### POST `/api/engagement/:platformId`
Engage with a single specific platform.

**Path Parameters:**
- `platformId` — `instagram` | `twitter` | `facebook` | `tiktok` | `linkedin` | `youtube`

**Request Body:**
```json
{
  "contentId": "17841400008460056",
  "action": "like",
  "contentType": "post"
}
```

---

### GET `/api/engagement/history`
Retrieve paginated engagement history.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `platform` | string | — | Filter by platform |
| `action` | string | — | Filter by action type |
| `status` | string | — | Filter by status (`success`, `failed`, `rate_limited`) |
| `limit` | number | `50` | Results per page (max 200) |
| `offset` | number | `0` | Pagination offset |

---

### GET `/api/engagement/stats`
Summary engagement statistics for the authenticated user.

**Query Parameters:**
- `days` — Number of days to include (default: `30`)

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalLikes": 24892,
      "totalComments": 3471,
      "totalFollows": 1204,
      "lastCalculatedAt": "2026-03-29T00:00:00Z"
    },
    "breakdown": [
      {
        "_id": { "platform": "instagram", "action": "like" },
        "total": 8420,
        "avgResponseTime": 180,
        "dailyData": [
          { "day": "2026-03-22", "count": 312 }
        ]
      }
    ],
    "period": { "days": 30, "start": "2026-02-27", "end": "2026-03-29" }
  }
}
```

---

## Feed

### GET `/api/feed/unified`
Get the unified content feed from all connected platforms.

**Query Parameters:**
- `limit` — Posts per platform (default: `20`)
- `platform` — Filter to specific platform
- `contentType` — Filter by `video` | `image` | `text`

**Response `200`:**
```json
{
  "success": true,
  "posts": [
    {
      "id": "instagram_17841400008460056",
      "platform": "instagram",
      "contentType": "image",
      "text": "Check out this amazing sunset 🌅",
      "mediaUrls": ["https://cdn.instagram.com/..."],
      "authorId": "12345678",
      "authorUsername": "nature_photographer",
      "authorDisplayName": "Nature Photographer",
      "authorAvatarUrl": "https://...",
      "likesCount": 1204,
      "commentsCount": 87,
      "sharesCount": 43,
      "createdAt": "2026-03-29T10:15:00Z",
      "url": "https://instagram.com/p/AbCdEfGhIjK/"
    }
  ],
  "nextCursors": {
    "instagram": "AQD5...",
    "twitter": "7tq...",
    "youtube": "CAUQAA"
  }
}
```

---

## Analytics

### GET `/api/analytics/summary`
Aggregated analytics across all platforms for the specified date range.

### GET `/api/analytics/:platformId`
Platform-specific analytics and insights.

### GET `/api/analytics/growth`
Follower growth trends across all connected platforms.

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "details": [
    { "field": "comment", "message": "Must not exceed 280 characters" }
  ]
}
```

| Status | Meaning |
|--------|---------|
| `400` | Bad Request — Validation failed |
| `401` | Unauthorized — Missing or invalid JWT |
| `403` | Forbidden — Platform not connected |
| `404` | Not Found — Resource doesn't exist |
| `429` | Too Many Requests — Rate limit exceeded |
| `500` | Internal Server Error — Unexpected error |

---

## WebSocket Events

Connect to `wss://api.allinoneapp.com` with JWT in handshake auth.

### Client → Server
```javascript
// Subscribe to real-time updates for a platform
socket.emit('subscribe:platform', 'instagram');

// Unsubscribe
socket.emit('unsubscribe:platform', 'instagram');
```

### Server → Client
```javascript
// New post in unified feed
socket.on('feed:new_post', (post) => { /* NormalisedPost object */ });

// Engagement confirmation
socket.on('engagement:confirmed', ({ batchId, platform, action }) => {});

// Token about to expire
socket.on('auth:token_expiring', ({ platform }) => {});
```

---

*The All-in-One App API · Cherry Computer Ltd. · Dr. Ahmad Mateen Ishanzai*
