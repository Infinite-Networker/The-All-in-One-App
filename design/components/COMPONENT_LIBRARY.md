# The All-in-One App — Component Library Specification
**Cherry Computer Ltd.** | Dr. Ahmad Mateen Ishanzai

---

## 🧱 Component Inventory

### Foundation Components
| Component | File | Description |
|-----------|------|-------------|
| `Button` | `components/common/Button.jsx` | Primary, secondary, ghost, destructive |
| `Card` | `components/common/Card.jsx` | Base card container with shadows |
| `Avatar` | `components/common/Avatar.jsx` | User/platform avatars with fallback |
| `Badge` | `components/common/Badge.jsx` | Status indicators and count badges |
| `Chip` | `components/common/Chip.jsx` | Filter chips and tags |
| `Divider` | `components/common/Divider.jsx` | Section separators |
| `EmptyState` | `components/common/EmptyFeedState.jsx` | Empty feed/list states |
| `LoadingSkeleton` | `components/common/LoadingSkeleton.jsx` | Shimmer loading placeholders |
| `Modal` | `components/common/Modal.jsx` | Bottom sheet and centre modals |
| `PlatformIcon` | `components/common/PlatformIcon.jsx` | Platform-branded icon circles |
| `LiveBadge` | `components/common/LiveBadge.jsx` | Real-time connection indicator |
| `DateRangePicker` | `components/common/DateRangePicker.jsx` | Analytics date range selector |
| `SectionHeader` | `components/common/SectionHeader.jsx` | Consistent section titles |

### Feed Components
| Component | File | Description |
|-----------|------|-------------|
| `FeedCard` | `components/feed/FeedCard.jsx` | Individual post card |
| `FeedHeader` | `components/feed/FeedHeader.jsx` | Feed screen top header |
| `PlatformFilterBar` | `components/feed/PlatformFilterBar.jsx` | Platform filter chips |
| `MediaViewer` | `components/feed/MediaViewer.jsx` | Image/video media display |
| `PostActions` | `components/feed/PostActions.jsx` | Like/comment/share row |

### Engagement Components
| Component | File | Description |
|-----------|------|-------------|
| `OneTapEngageButton` | `components/engagement/OneTapEngageButton.jsx` | The flagship floating button |
| `EngagementResultBadge` | `components/engagement/EngagementResultBadge.jsx` | Per-platform result indicator |
| `PlatformSelector` | `components/engagement/PlatformSelector.jsx` | Multi-select platform picker |
| `CommentInput` | `components/engagement/CommentInput.jsx` | Comment text input with counter |

### Analytics Components
| Component | File | Description |
|-----------|------|-------------|
| `StatCard` | `components/analytics/StatCard.jsx` | Individual metric card |
| `GrowthChart` | `components/analytics/GrowthChart.jsx` | Line chart for trends |
| `PlatformBreakdownCard` | `components/analytics/PlatformBreakdownCard.jsx` | Per-platform stats |

### Settings Components
| Component | File | Description |
|-----------|------|-------------|
| `ThemeToggle` | `components/settings/ThemeToggle.jsx` | Dark/Light/System picker |
| `PlatformConnectionRow` | `components/settings/PlatformConnectionRow.jsx` | Account status row |

---

## 📋 Component Specifications

### Button Component

**Props:**
```typescript
interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;           // Icon name (vector icons)
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  haptic?: boolean;        // Enable haptic feedback (default: true)
}
```

**Variants:**
- `primary`: Cherry gradient background, white text, cherry shadow
- `secondary`: Transparent bg, cherry border and text
- `ghost`: No background or border, cherry text
- `destructive`: Error red (#EF4444) background, white text

**Sizes:**
- `sm`: height 36pt, padding 12pt h, SF Pro SemiBold 13px
- `md`: height 48pt, padding 20pt h, SF Pro SemiBold 15px (default)
- `lg`: height 56pt, padding 24pt h, SF Pro Bold 17px

---

### FeedCard Component

**Props:**
```typescript
interface FeedCardProps {
  post: NormalisedPost;
  onPress: (post: NormalisedPost) => void;
  onProfilePress: (authorId: string, platform: string) => void;
  onLike?: (post: NormalisedPost) => void;
  onComment?: (post: NormalisedPost) => void;
  onShare?: (post: NormalisedPost) => void;
  isLiked?: boolean;
}
```

**Layout Sections:**
1. **Header** (48pt): Platform badge, avatar, username, time, options menu
2. **Media** (variable): Image/video with aspect ratio preservation
3. **Caption** (variable): Text content, max 2 lines collapsed
4. **Actions** (44pt): Like, comment, share counts and buttons

---

### PlatformIcon Component

**Props:**
```typescript
interface PlatformIconProps {
  platformId: 'instagram' | 'twitter' | 'facebook' | 'tiktok' | 'linkedin' | 'youtube';
  size?: number;        // diameter in pt (default: 40)
  showBadge?: boolean;  // Show connection status badge
  isConnected?: boolean;
  style?: ViewStyle;
}
```

---

### StatCard Component

**Props:**
```typescript
interface StatCardProps {
  label: string;        // "Total Likes"
  value: string;        // "24.8K"
  change: string;       // "+12.4%"
  trend: 'up' | 'down' | 'neutral';
  icon: string;         // Material icon name
  color: string;        // Icon background colour
}
```

**Layout:**
- Width: (screen - 32 - 8) / 2 (two column grid)
- Background: Card colour token
- Icon: 32pt circle with colour background, 18pt icon
- Value: SF Pro Bold 22px, text primary
- Label: SF Pro Regular 12px, text secondary
- Change badge: Coloured pill with trend arrow

---

### LoadingSkeleton Component

**Props:**
```typescript
interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}
```

**Behaviour:**
- Uses `shimmer` colour token: `['#1A1A26', '#22223A', '#1A1A26']`
- Animated linear gradient that sweeps left to right
- Duration: 1200ms per cycle, looping
- Respects `AccessibilityInfo.isReduceMotionEnabled()` — shows static placeholder instead of animation

---

### OneTapEngageButton

This is the most complex component in the library. See full implementation in:
`src/components/engagement/OneTapEngageButton.jsx`

Key behaviours:
- Floating, positioned above tab bar
- Spring press animation
- Haptic feedback on press and on result
- Opens bottom sheet modal
- Dispatches Redux `engageAll` thunk
- Shows per-platform result badges
- 4-second auto-dismiss of results

---

## 🔄 Component State Management

Most components are **presentational** — they receive data via props and emit events.
State lives in Redux slices, accessed via `useSelector` in screen-level components.

Exception: `OneTapEngageButton` contains local state for:
- Modal visibility
- Selected action
- Comment text input
- Results visibility timer

---

*Component Library by Dr. Ahmad Mateen Ishanzai · Cherry Computer Ltd.*
