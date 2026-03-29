# The All-in-One App — Wireframes & Screen Flows
**Cherry Computer Ltd.** | Dr. Ahmad Mateen Ishanzai

---

## 📱 Screen Inventory

### Core Screens (5 Primary Tabs)

```
1. 🏠 Feed (Home)         — Unified content stream from all platforms
2. ⚡ Engage              — One-Tap Engagement control centre
3. 📊 Analytics           — Cross-platform growth dashboard
4. 🔗 Accounts            — Platform connection management
5. ⚙️ Settings            — Preferences, theme, account settings
```

### Secondary Screens (Stack Navigation)
```
6. Post Detail            — Expanded view of a single post
7. Profile View           — User/creator profile from any platform
8. Connect Platform       — OAuth connection flow modal
9. Engagement History     — Log of all engagement actions
10. Notification Centre   — App-level notifications
```

---

## 📐 Screen Wireframes (ASCII)

### 1. Home Feed Screen

```
┌─────────────────────────────────────┐
│ ●●  12:00 PM               🔋100%  │
├─────────────────────────────────────┤
│                                     │
│  The All-in-One App    [🔔] [👤]  │
│  ─────────────────────────────────  │
│  🔴 LIVE  Syncing 6 platforms...   │
│  ─────────────────────────────────  │
│                                     │
│  [All] [📸IG] [🐦TW] [📘FB] [▶️YT]│
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📸 Instagram              2m  │ │
│ │ ┌───────┐  username_here       │ │
│ │ │ PHOTO │  Caption text here   │ │
│ │ │ HERE  │  with hashtags...    │ │
│ │ └───────┘                      │ │
│ │ ❤️ 1,204  💬 87   📤 43       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🐦 X (Twitter)            5m  │ │
│ │ ┌───┐  @username                │ │
│ │ │ 👤│  Tweet content here       │ │
│ │ └───┘  showing full text...     │ │
│ │ ❤️ 892  💬 43   🔁 201        │ │
│ └─────────────────────────────────┘ │
│                                     │
│              ⚡ One Tap Engage      │
│          All platforms · Simultaneously│
│                                     │
├─────────────────────────────────────┤
│  🏠 Feed  ⚡ Engage  📊  🔗  ⚙️  │
└─────────────────────────────────────┘
```

---

### 2. Engage Screen (One-Tap Control Centre)

```
┌─────────────────────────────────────┐
│ ●●  12:00 PM               🔋100%  │
├─────────────────────────────────────┤
│                                     │
│  ⚡ Engage                          │
│  One command. Every platform.       │
│  ─────────────────────────────────  │
│                                     │
│  Connected Platforms                │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐   │
│  │IG │ │TW │ │FB │ │TK │ │LI │   │
│  │✅ │ │✅ │ │✅ │ │✅ │ │✅ │   │
│  └───┘ └───┘ └───┘ └───┘ └───┘   │
│                                     │
│  Choose Action                      │
│  ┌─────────────────────────────────┐│
│  │ ◉ ❤️ Like + 💬 Comment + ➕ Follow││
│  │ ○ ❤️ Like Only                  ││
│  │ ○ 💬 Comment Only               ││
│  │ ○ ➕ Follow Only                ││
│  └─────────────────────────────────┘│
│                                     │
│  Comment Text (optional)            │
│  ┌─────────────────────────────────┐│
│  │ Write something great...        ││
│  │                             0/280││
│  └─────────────────────────────────┘│
│                                     │
│  Target Content                     │
│  ┌─────────────────────────────────┐│
│  │ 📸 Post: 17841400008460056      ││
│  │ 🐦 Tweet: 176012345678901234    ││
│  │ 📘 Post: 1234567890_98765       ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │   ⚡ ENGAGE NOW — 6 PLATFORMS   ││
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│  🏠 Feed  ⚡ Engage  📊  🔗  ⚙️  │
└─────────────────────────────────────┘
```

---

### 3. Analytics Dashboard

```
┌─────────────────────────────────────┐
│ ●●  12:00 PM               🔋100%  │
├─────────────────────────────────────┤
│                                     │
│  📊 Analytics                       │
│  Your engagement at a glance        │
│                                     │
│  [7D]  [30D]  [90D]                │
│                                     │
│  ┌──────────┐ ┌──────────┐         │
│  │ ❤️ 24.8K│ │ 💬 3.4K │         │
│  │ +12.4% ↑│ │ +8.1% ↑ │         │
│  └──────────┘ └──────────┘         │
│  ┌──────────┐ ┌──────────┐         │
│  │ ➕ 1.2K │ │ 📈 4.7% │         │
│  │ +23.7% ↑│ │ -0.3% ↓ │         │
│  └──────────┘ └──────────┘         │
│                                     │
│  Engagement Trend                   │
│  ┌─────────────────────────────────┐│
│  │  ╭─╮    ╭────╮                  ││
│  │ ╭╯ ╰──╮╯    ╰──╮               ││
│  │╭╯       ╰──────╰╮              ││
│  │Mon Tue Wed Thu Fri Sat Sun      ││
│  └─────────────────────────────────┘│
│                                     │
│  Platform Breakdown                 │
│  ┌─────────────────────────────────┐│
│  │ 🍕 pie chart of platforms       ││
│  │  IG 35% TW 22% FB 18% TK 15%  ││
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│  🏠 Feed  ⚡ Engage  📊  🔗  ⚙️  │
└─────────────────────────────────────┘
```

---

### 4. Accounts Screen

```
┌─────────────────────────────────────┐
│ ●●  12:00 PM               🔋100%  │
├─────────────────────────────────────┤
│                                     │
│  🔗 Connected Accounts              │
│  Manage your platform connections   │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 📸 Instagram         ✅ Active ││
│  │    @username_here               ││
│  │    Connected: Jan 15, 2026  [⋮]││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 🐦 X (Twitter)       ✅ Active ││
│  │    @twitter_handle              ││
│  │    Connected: Jan 20, 2026  [⋮]││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 📘 Facebook          ✅ Active ││
│  │    Facebook Name                ││
│  │    Connected: Feb 1, 2026   [⋮]││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 🎵 TikTok            ✅ Active ││
│  │    @tiktok_user                 ││
│  │    Connected: Feb 5, 2026   [⋮]││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 💼 LinkedIn          ✅ Active ││
│  │    Full Name                    ││
│  │    Connected: Feb 10, 2026  [⋮]││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ ▶️ YouTube           ✅ Active ││
│  │    Channel Name                 ││
│  │    Connected: Feb 15, 2026  [⋮]││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │    + Connect Another Account    ││
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│  🏠 Feed  ⚡ Engage  📊  🔗  ⚙️  │
└─────────────────────────────────────┘
```

---

### 5. Settings Screen

```
┌─────────────────────────────────────┐
│ ●●  12:00 PM               🔋100%  │
├─────────────────────────────────────┤
│                                     │
│  ⚙️ Settings                        │
│                                     │
│  👤 PROFILE                        │
│  ┌─────────────────────────────────┐│
│  │ Display Name            Edit > ││
│  │ Email Address           Edit > ││
│  │ Change Password              > ││
│  └─────────────────────────────────┘│
│                                     │
│  🎨 APPEARANCE                     │
│  ┌─────────────────────────────────┐│
│  │ Theme           [Dark] Light Sys││
│  │ Language              English > ││
│  └─────────────────────────────────┘│
│                                     │
│  ⚡ ENGAGEMENT DEFAULTS            │
│  ┌─────────────────────────────────┐│
│  │ Default Action          All > ││
│  │ Default Comment       Edit >  ││
│  │ Auto-Follow on Like  [●──]    ││
│  │ Rate Limit (per hr)    100 >  ││
│  └─────────────────────────────────┘│
│                                     │
│  🔔 NOTIFICATIONS                  │
│  ┌─────────────────────────────────┐│
│  │ Push Notifications    [──●]    ││
│  │ Engagement Alerts     [●──]    ││
│  └─────────────────────────────────┘│
│                                     │
│  ℹ️ ABOUT                          │
│  ┌─────────────────────────────────┐│
│  │ Version                  1.0.0 ││
│  │ Made by         Cherry Computer ││
│  │                            Ltd. ││
│  │ Privacy Policy               > ││
│  │ Terms of Service             > ││
│  └─────────────────────────────────┘│
│                                     │
│  [        Sign Out        ]         │
│                                     │
├─────────────────────────────────────┤
│  🏠 Feed  ⚡ Engage  📊  🔗  ⚙️  │
└─────────────────────────────────────┘
```

---

## 🔄 User Flow Diagrams

### Primary Flow: One-Tap Engagement

```
User on Feed Screen
        │
        ▼
  Sees content they want to engage with
        │
        ▼
  Taps "⚡ One Tap Engage" button
        │
        ▼
  Engagement Modal opens (slide-up)
   ├── Select action (Like/Comment/Follow/All)
   ├── Type comment (if applicable)
   └── Tap "⚡ Engage Now"
        │
        ▼
  Haptic feedback fires
  Optimistic UI updates instantly
        │
        ▼
  API call: POST /api/engagement/all
  (All platforms fire in parallel — ~300ms)
        │
        ▼
  Results shown as badge per platform
  ✅ Instagram  ✅ Twitter  ✅ TikTok
  ✅ Facebook   ✅ LinkedIn ⚠️ YouTube (rate limited)
        │
        ▼
  History logged for analytics
```

### Onboarding Flow: Connect First Platform

```
App Launch
    │
    ▼
Splash Screen (1.5s)
    │
    ▼
Login / Register
    │
    ▼
Welcome Screen: "Connect your first platform"
    │
    ▼
Tap "Connect Instagram" (or any platform)
    │
    ▼
OAuth browser opens (Instagram Auth Page)
    │
    ▼
User logs in to Instagram
User grants permissions
    │
    ▼
Redirect back to app
Token stored securely in Keychain
    │
    ▼
"Instagram Connected! ✅" confirmation
    │
    ▼
Prompt: "Connect more platforms?"
    │
    ├─── Yes → Repeat for next platform
    └─── Skip → Main Feed Screen
```

---

*The All-in-One App · Cherry Computer Ltd. · Dr. Ahmad Mateen Ishanzai*
