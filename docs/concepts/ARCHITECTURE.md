# The All-in-One App — Architecture & Concepts
**Cherry Computer Ltd.** | Dr. Ahmad Mateen Ishanzai

---

## 🧠 Core Concept: The Unified Engagement Engine

The foundational idea behind The All-in-One App is deceptively simple: **what if every social media action you took happened everywhere simultaneously?**

Most social media tools focus on content scheduling or analytics in isolation. I built something different — an **engagement-first platform** that treats your digital presence as a single unified entity rather than six separate ones.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                     MOBILE APP (React Native)                       │
│                                                                      │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────────────┐  │
│  │  Feed Screen  │  │  Engage Modal │  │  Analytics Dashboard    │  │
│  │  (Unified)    │  │  (One-Tap)    │  │  (Cross-Platform)      │  │
│  └──────┬───────┘  └───────┬───────┘  └──────────┬─────────────┘  │
│         │                  │                       │                │
│  ┌──────▼──────────────────▼───────────────────────▼─────────────┐ │
│  │                    Redux Store + RTK                            │ │
│  │   feedSlice | engagementSlice | analyticsSlice | authSlice     │ │
│  └──────────────────────────────┬──────────────────────────────── ┘ │
│                                 │                                    │
│  ┌──────────────────────────────▼──────────────────────────────── ┐ │
│  │                    Service Layer                                 │ │
│  │   PlatformService  |  OAuthService  |  AnalyticsService        │ │
│  └──────────────────────────────┬──────────────────────────────── ┘ │
└─────────────────────────────────┼──────────────────────────────────┘
                                  │ HTTPS / WebSocket
┌─────────────────────────────────▼──────────────────────────────────┐
│                     BACKEND (Node.js + Express)                      │
│                                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Auth Router  │  │ Engagement   │  │  Feed / Analytics Router  │  │
│  │ /api/auth   │  │ /api/engage  │  │  /api/feed  /api/analytics│  │
│  └──────┬───── ┘  └──────┬───── ┘  └────────────┬─────────────┘  │
│         │                │                         │                │
│  ┌──────▼────────────────▼─────────────────────────▼─────────────┐ │
│  │              Middleware Stack                                    │ │
│  │  JWT Auth  |  Rate Limiter  |  Request Validator  |  Logger    │ │
│  └──────────────────────────────┬──────────────────────────────── ┘ │
│                                 │                                    │
│  ┌──────────────────────────────▼──────────────────────────────── ┐ │
│  │              Platform Proxy Service                              │ │
│  │   Instagram | Twitter | Facebook | TikTok | LinkedIn | YouTube  │ │
│  │   (Decrypts tokens, signs requests, handles retries)            │ │
│  └──────────────────────────────┬──────────────────────────────── ┘ │
│                                 │                                    │
│  ┌──────────────────────────────▼──────────────────────────────── ┐ │
│  │              Data Layer                                          │ │
│  │   MongoDB (Primary)  |  Redis (Cache + Sessions + Rate Limits) │ │
│  └──────────────────────────────────────────────────────────────── ┘ │
└──────────────────────────────────────────────────────────────────────┘
              │                                    │
              ▼                                    ▼
  ┌─────────────────────┐            ┌─────────────────────────┐
  │  Platform APIs      │            │  Platform APIs          │
  │  (Official SDKs)    │            │  (Official SDKs)        │
  │                     │            │                         │
  │  Instagram Graph    │            │  TikTok Open Platform  │
  │  Twitter API v2     │            │  LinkedIn REST API     │
  │  Facebook Graph     │            │  YouTube Data API v3   │
  └─────────────────────┘            └─────────────────────────┘
```

---

## 🔐 Security Architecture

### Credential Storage
I made a deliberate architectural decision: **we never store plain-text OAuth tokens anywhere in the system.**

**Mobile (Frontend):**
- OAuth tokens are encrypted with AES-256 before being stored in the device's secure Keychain (iOS Keychain Services / Android Keystore)
- React Native Keychain abstracts this platform-level secure storage
- No tokens are ever written to AsyncStorage or plain disk

**Backend:**
- Platform tokens stored in MongoDB are encrypted at rest using AES-256-CBC
- Encryption key is stored as an environment variable (never in code or database)
- Tokens are only decrypted in memory at the moment of an API call, in the Platform Proxy Service

### OAuth 2.0 Flow

```
User              App              Backend           Platform
  │                │                  │                  │
  │  Tap Connect   │                  │                  │
  │───────────────►│                  │                  │
  │                │  Open OAuth URL  │                  │
  │                │─────────────────────────────────────►
  │                │                  │    Platform Auth │
  │  Auth in       │                  │    Page          │
  │  Browser       │◄─────────────────────────────────────
  │                │                  │                  │
  │  Grant Access  │                  │                  │
  │───────────────►│  Auth Code       │                  │
  │                │─────────────────────────────────────►
  │                │                  │  Exchange Code   │
  │                │                  │─────────────────►│
  │                │                  │   Access + Refresh Token
  │                │                  │◄─────────────────│
  │                │  Encrypted Tokens│                  │
  │                │◄─────────────────│                  │
  │                │  Store in Keychain                  │
  │  Connected ✅  │                  │                  │
```

---

## ⚡ One-Tap Engagement: Under the Hood

When a user taps "Engage Now," here's exactly what happens in ~300ms:

```
1. User taps One-Tap Engage Button
   └─► Haptic feedback fires immediately (imperceptible to user, feels responsive)
   └─► Optimistic UI update (post shows as liked/commented instantly)

2. Redux dispatch: engageAll({ contentMap, action, comment })
   └─► engagementSlice async thunk fires

3. Mobile calls POST /api/engagement/all
   └─► JWT verified
   └─► Rate limit checked (Redis)
   └─► Request validated (Joi schema)

4. EngagementController.engageAll()
   └─► Filters connected platforms
   └─► Creates batch ID (UUID) for grouping
   └─► Fires Promise.allSettled() across ALL platforms simultaneously

5. For EACH platform (all happening in parallel):
   └─► PlatformProxyService.execute()
       └─► Decrypt access token (AES-256)
       └─► Build platform-specific request
       └─► Fire HTTP request to platform API
       └─► Handle retries on 5xx / 429
   └─► Log to EngagementLog collection

6. Aggregate results → return summary to app
   └─► Redux state updated with results
   └─► UI shows success badges per platform
   └─► Analytics snapshot updated (background)

Total wall-clock time: ~200-600ms (depending on slowest platform API)
```

---

## 📊 Analytics Architecture

The analytics system operates in two modes:

### Real-Time (WebSocket)
- Socket.IO rooms per user + platform
- Backend emits events when new engagement data arrives
- Frontend Redux store updates via `wsEventReceived` action

### Batch (Periodic Aggregation)
- MongoDB aggregation pipeline runs hourly
- Results cached in Redis with 30-minute TTL
- EngagementLog TTL auto-purges entries older than 90 days

---

## 🔄 Feed Aggregation Strategy

The unified feed poses a real technical challenge: how do you merge 6 different feed schemas into one coherent experience?

My solution is a **normalisation layer** in `utils/normalise.js` that converts any platform's post format into a common `NormalisedPost` schema:

```javascript
NormalisedPost {
  id: string           // platform-prefixed: "instagram_123456"
  platform: string     // 'instagram' | 'twitter' | ...
  contentType: string  // 'video' | 'image' | 'text' | 'article'
  text: string         // Post content / caption
  mediaUrls: string[]  // Images / video thumbnails
  authorId: string     // Platform user ID
  authorUsername: string
  authorDisplayName: string
  authorAvatarUrl: string
  likesCount: number
  commentsCount: number
  sharesCount: number
  createdAt: Date      // Normalised timestamp
  url: string          // Deep link to original post
  raw: object          // Original API response preserved
}
```

This normalisation happens on the mobile service layer before data reaches Redux, keeping the Redux store platform-agnostic.

---

## 🏢 About Cherry Computer Ltd.

**The All-in-One App** is a flagship product of **Cherry Computer Ltd.**, developed by Dr. Ahmad Mateen Ishanzai.

Cherry Computer Ltd. is committed to building intelligent, user-first software solutions that make the digital world more accessible and efficient. This project represents our vision for the future of unified digital interaction.

---

*Cherry Computer Ltd. · Crafting intelligent software for the connected world.*
