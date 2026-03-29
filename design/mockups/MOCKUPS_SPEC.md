# The All-in-One App — High-Fidelity Mockup Specifications
**Cherry Computer Ltd.** | Dr. Ahmad Mateen Ishanzai

---

## 🎨 Mockup Design Specifications

This document defines the precise visual specifications for all high-fidelity mockups.
All dimensions assume iPhone 15 Pro as the primary reference device (393pt × 852pt logical resolution).

---

## Screen 1: Feed / Home — Dark Mode

### Background
- Base: `#0A0A0F` (Rich Black)
- Status bar height: 59pt (includes Dynamic Island)

### Navigation Bar
- Height: 44pt
- Background: `rgba(10, 10, 15, 0.95)` with 20pt blur backdrop
- Title: "The All-in-One App", SF Pro Display Bold 20px, `#FFFFFF`
- Notification bell: 24pt, `#A0A0B8`
- Avatar: 32pt circle, `#DC143C` accent ring 2pt

### Platform Filter Bar
- Horizontal scroll, 16pt leading margin
- Chips: 32pt height, border-radius 9999pt
- Active chip: `#DC143C` background, `#FFFFFF` text, SF Pro SemiBold 13px
- Inactive chip: `#1A1A26` background, `#A0A0B8` text, 1pt border `#2A2A3A`
- Spacing between chips: 8pt
- Chips: "All", "📸" (Instagram), "𝕏" (Twitter), "f" (Facebook), "▶" (TikTok), "in" (LinkedIn), "▶️" (YouTube)

### Feed Card — Instagram Post
- Width: screen width - 32pt
- Margin: 16pt horizontal, 12pt between cards
- Background: `#1A1A26`
- Border radius: 16pt
- Border: 1pt `#2A2A3A`

**Card Header (48pt height):**
- Platform indicator: 6pt circle `#E1306C` (Instagram brand)
- Avatar: 36pt circle
- Username: SF Pro SemiBold 14px, `#FFFFFF`
- Time: SF Pro Regular 12px, `#606080`, right-aligned
- Platform name: SF Pro Regular 11px, `#E1306C`

**Card Media:**
- Aspect ratio: 1:1 (square posts) or 4:5 (portrait), max height 320pt
- Border radius: 0pt (full-bleed within card)
- Overlay: subtle gradient bottom `rgba(0,0,0,0)` to `rgba(0,0,0,0.3)`

**Card Caption:**
- SF Pro Regular 14px, `#FFFFFF`, 2 lines max with "more..."
- 12pt padding all sides

**Card Actions Row:**
- Height: 44pt
- Icons: 20pt, `#A0A0B8`
- Counts: SF Pro Medium 13px, `#A0A0B8`
- Like button: when tapped → `#DC143C` with scale spring animation
- 16pt horizontal padding

### One-Tap Engage Button (Floating)
- Position: 100pt from bottom (above tab bar), centred
- Width: 180pt, Height: 50pt
- Background: gradient `#DC143C` → `#FF4D6D`, left to right
- Border radius: 9999pt
- Shadow: `#DC143C`, blur 20pt, opacity 0.4, y-offset 8pt
- Text: "⚡ One Tap Engage", SF Pro Bold 16px, `#FFFFFF`
- Sub-label: "All platforms · Simultaneously", SF Pro Regular 11px, `#A0A0B8`, 6pt below button

### Tab Bar
- Height: 49pt + safe area (home indicator zone)
- Background: `#12121A`
- Border top: 0.5pt `#2A2A3A`
- Active tab colour: `#DC143C`
- Inactive tab colour: `#606080`
- Icons: 22pt, Labels: SF Pro Regular 10px

---

## Screen 2: Engage Screen — Dark Mode

### Header
- Title: "⚡ Engage", SF Pro Display Bold 28px, `#FFFFFF`
- Subtitle: "One command. Every platform.", SF Pro Regular 15px, `#A0A0B8`

### Connected Platforms Row
- 6 platform icons in a row
- Each: 52pt circle with platform brand gradient background
- Platform icon: 26pt white icon (or platform logo)
- Checkmark badge: 16pt circle, `#22C55E` green, bottom-right of platform icon
- 12pt spacing between icons

### Action Selector
- Title: SF Pro SemiBold 15px, `#A0A0B8`, uppercase, letter-spacing 0.8
- Each option card: 12pt padding, 12pt border-radius, `#1A1A26` background
- Selected: `#DC143C` border 1.5pt, `rgba(220,20,60,0.1)` background
- Unselected: `#2A2A3A` border 1pt
- Label: SF Pro SemiBold 15px
- Description: SF Pro Regular 12px, `#A0A0B8`
- Radio indicator: 20pt circle, selected = `#DC143C` filled, unselected = `#2A2A3A` ring

### Comment Input
- Background: `#1A1A26`
- Border: 1pt `#2A2A3A`, focus: 1.5pt `#DC143C`
- Placeholder: `#606080`
- Text: `#FFFFFF`, SF Pro Regular 15px
- Border radius: 12pt
- Padding: 14pt all sides
- Min height: 80pt
- Character count: SF Pro Regular 11px, `#606080`, bottom-right

### Engage Now Button
- Height: 52pt, full width minus 32pt margins
- Gradient: `#DC143C` → `#FF4D6D`
- Border radius: 12pt
- Text: "⚡ Engage Now", SF Pro Bold 17px, `#FFFFFF`
- Shadow: cherry glow (same as floating button)

---

## Screen 3: Analytics Dashboard — Dark Mode

### Header
- "Analytics" — SF Pro Display Bold 28px, `#FFFFFF`
- "Your engagement at a glance" — SF Pro Regular 15px, `#A0A0B8`

### Date Range Selector
- Three chips: "7D", "30D", "90D"
- Active: `#DC143C` background
- Inactive: `#1A1A26` background, `#2A2A3A` border

### Stat Cards Grid
- 2-column grid, 8pt gap
- Each card: `#1A1A26` background, 12pt radius, 14pt padding
- Icon: 24pt, platform or semantic colour
- Value: SF Pro Bold 22px, `#FFFFFF`
- Label: SF Pro Regular 12px, `#A0A0B8`
- Change badge: SF Pro SemiBold 11px, `#22C55E` (positive) or `#EF4444` (negative)

### Line Chart
- Background: transparent
- Line colour: `#DC143C`, 2pt stroke width
- Data points: 5pt radius, `#DC143C` fill, 2pt white stroke
- Grid lines: 0.5pt, `#2A2A3A`
- Labels: SF Pro Regular 11px, `#606080`
- Bezier curve enabled

### Pie Chart
- Platform colours as defined in brand palette
- Legend: SF Pro Regular 12px, `#A0A0B8`
- Background: transparent

### Platform Breakdown Cards
- Same card style as feed cards
- Platform colour accent on left border (4pt)

---

## Light Mode Adaptations

When light mode is active, these changes apply:

| Dark Value | Light Value |
|------------|-------------|
| `#0A0A0F` Background | `#F8F8FC` Background |
| `#1A1A26` Card | `#FFFFFF` Card |
| `#2A2A3A` Border | `#E8E8F0` Border |
| `#FFFFFF` Text Primary | `#0A0A0F` Text Primary |
| `#A0A0B8` Text Secondary | `#505070` Text Secondary |
| `#12121A` Tab Bar | `#FFFFFF` Tab Bar |

Cherry red `#DC143C` remains constant across both modes.

---

## Component States

### Button States
```
Default:   Cherry gradient, shadow active
Pressed:   Scale 0.93, shadow reduced
Loading:   Pulse animation, disabled
Disabled:  50% opacity, no shadow
Success:   Brief green flash, then back to default
Error:     Brief red shake animation
```

### Card States
```
Default:   Standard dark card
Pressed:   Scale 0.98, slight brightness increase
Liked:     Like icon and count turn cherry red
Commented: Comment icon turns cherry red briefly
```

---

## Animation Specs

### One-Tap Button Press
```
Press in:
  - Scale: 1.0 → 0.93
  - Duration: 80ms
  - Easing: spring (stiffness: 200, damping: 12)

Press out:
  - Scale: 0.93 → 1.0
  - Duration: 120ms
  - Easing: spring (stiffness: 180, damping: 10)

Haptic: impactMedium on press-in
```

### Engagement Modal
```
Open:
  - translateY: screenHeight → 0
  - Duration: 350ms
  - Easing: ease-out cubic

Close:
  - translateY: 0 → screenHeight
  - Duration: 250ms
  - Easing: ease-in cubic
```

### Result Badges
```
Entry:
  - Scale: 0 → 1
  - opacity: 0 → 1
  - Duration: 200ms per badge, 50ms stagger between
  - Easing: spring

Exit (after 3.5s):
  - opacity: 1 → 0
  - translateY: 0 → -20
  - Duration: 300ms
```

---

*Mockup specifications by Dr. Ahmad Mateen Ishanzai · Cherry Computer Ltd.*
