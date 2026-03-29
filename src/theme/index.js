/**
 * The All-in-One App — Design System & Theme
 * Cherry Computer Ltd.
 *
 * A modern minimalist design system with Dark/Light mode support.
 * Every token here was crafted to balance aesthetic beauty with
 * functional clarity — because the best tools should also be beautiful.
 */

// ─────────────────────────────────────────────────────────────────────────────
// COLOUR PALETTE
// ─────────────────────────────────────────────────────────────────────────────

export const PALETTE = {
  // Cherry Computer Ltd. Brand Colours
  cherry: '#DC143C',
  cherryDeep: '#A50E2D',
  cherryLight: '#FF4D6D',
  cherryGlow: 'rgba(220, 20, 60, 0.15)',

  // Core Neutrals
  black: '#000000',
  richBlack: '#0A0A0F',
  darkSurface: '#12121A',
  cardDark: '#1A1A26',
  borderDark: '#2A2A3A',
  mutedDark: '#3A3A50',

  white: '#FFFFFF',
  offWhite: '#F8F8FC',
  cardLight: '#FFFFFF',
  borderLight: '#E8E8F0',
  mutedLight: '#C0C0D0',

  // Platform Brand Colours
  instagram: '#E1306C',
  instagramGradientStart: '#405DE6',
  instagramGradientEnd: '#FD1D1D',
  twitter: '#1DA1F2',
  facebook: '#1877F2',
  tiktok: '#FF0050',
  linkedin: '#0A66C2',
  youtube: '#FF0000',

  // Semantic Colours
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Text Colours
  textPrimaryDark: '#FFFFFF',
  textSecondaryDark: '#A0A0B8',
  textTertiaryDark: '#606080',
  textPrimaryLight: '#0A0A0F',
  textSecondaryLight: '#505070',
  textTertiaryLight: '#9090A8',

  // Gradients
  gradientPrimary: ['#DC143C', '#FF4D6D'],
  gradientDark: ['#0A0A0F', '#12121A'],
  gradientCard: ['#1A1A26', '#22223A'],
  gradientGlow: ['rgba(220,20,60,0.3)', 'rgba(220,20,60,0)'],
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPOGRAPHY
// ─────────────────────────────────────────────────────────────────────────────

export const TYPOGRAPHY = {
  // Font Families
  fontBold: 'SF Pro Display',
  fontSemiBold: 'SF Pro Display',
  fontMedium: 'SF Pro Text',
  fontRegular: 'SF Pro Text',
  fontMono: 'SF Mono',

  // Font Sizes
  display: 34,
  h1: 28,
  h2: 22,
  h3: 18,
  h4: 16,
  body: 15,
  bodySmall: 14,
  caption: 12,
  micro: 10,

  // Font Weights
  weightBold: '700',
  weightSemiBold: '600',
  weightMedium: '500',
  weightRegular: '400',

  // Line Heights
  lineHeightDisplay: 40,
  lineHeightH1: 34,
  lineHeightH2: 28,
  lineHeightH3: 24,
  lineHeightBody: 22,
  lineHeightCaption: 16,
};

// ─────────────────────────────────────────────────────────────────────────────
// SPACING SYSTEM (8pt Grid)
// ─────────────────────────────────────────────────────────────────────────────

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// ─────────────────────────────────────────────────────────────────────────────
// BORDER RADIUS
// ─────────────────────────────────────────────────────────────────────────────

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

// ─────────────────────────────────────────────────────────────────────────────
// SHADOWS
// ─────────────────────────────────────────────────────────────────────────────

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  cherry: {
    shadowColor: PALETTE.cherry,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION DURATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const ANIMATION = {
  fast: 150,
  normal: 250,
  slow: 400,
  spring: { damping: 15, stiffness: 150 },
};

// ─────────────────────────────────────────────────────────────────────────────
// DARK THEME
// ─────────────────────────────────────────────────────────────────────────────

export const DARK_THEME = {
  mode: 'dark',

  colors: {
    background: PALETTE.richBlack,
    surface: PALETTE.darkSurface,
    card: PALETTE.cardDark,
    border: PALETTE.borderDark,
    muted: PALETTE.mutedDark,
    primary: PALETTE.cherry,
    primaryHover: PALETTE.cherryLight,
    textPrimary: PALETTE.textPrimaryDark,
    textSecondary: PALETTE.textSecondaryDark,
    textTertiary: PALETTE.textTertiaryDark,
    icon: PALETTE.textSecondaryDark,
    tabBar: PALETTE.darkSurface,
    tabBarBorder: PALETTE.borderDark,
    statusBar: 'dark-content',
    inputBg: PALETTE.cardDark,
    inputBorder: PALETTE.borderDark,
    inputText: PALETTE.textPrimaryDark,
    inputPlaceholder: PALETTE.textTertiaryDark,
    success: PALETTE.success,
    warning: PALETTE.warning,
    error: PALETTE.error,
    info: PALETTE.info,
    overlay: 'rgba(0, 0, 0, 0.7)',
    shimmer: ['#1A1A26', '#22223A', '#1A1A26'],
  },

  typography: TYPOGRAPHY,
  spacing: SPACING,
  radius: RADIUS,
  shadows: SHADOWS,
  animation: ANIMATION,
  palette: PALETTE,
};

// ─────────────────────────────────────────────────────────────────────────────
// LIGHT THEME
// ─────────────────────────────────────────────────────────────────────────────

export const LIGHT_THEME = {
  mode: 'light',

  colors: {
    background: PALETTE.offWhite,
    surface: PALETTE.white,
    card: PALETTE.cardLight,
    border: PALETTE.borderLight,
    muted: PALETTE.mutedLight,
    primary: PALETTE.cherry,
    primaryHover: PALETTE.cherryDeep,
    textPrimary: PALETTE.textPrimaryLight,
    textSecondary: PALETTE.textSecondaryLight,
    textTertiary: PALETTE.textTertiaryLight,
    icon: PALETTE.textSecondaryLight,
    tabBar: PALETTE.white,
    tabBarBorder: PALETTE.borderLight,
    statusBar: 'light-content',
    inputBg: PALETTE.offWhite,
    inputBorder: PALETTE.borderLight,
    inputText: PALETTE.textPrimaryLight,
    inputPlaceholder: PALETTE.textTertiaryLight,
    success: PALETTE.success,
    warning: PALETTE.warning,
    error: PALETTE.error,
    info: PALETTE.info,
    overlay: 'rgba(0, 0, 0, 0.4)',
    shimmer: ['#F0F0F8', '#FFFFFF', '#F0F0F8'],
  },

  typography: TYPOGRAPHY,
  spacing: SPACING,
  radius: RADIUS,
  shadows: SHADOWS,
  animation: ANIMATION,
  palette: PALETTE,
};

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM THEME TOKENS
// ─────────────────────────────────────────────────────────────────────────────

export const PLATFORM_THEMES = {
  instagram: {
    primary: PALETTE.instagram,
    gradient: [PALETTE.instagramGradientStart, '#833AB4', PALETTE.instagramGradientEnd],
    icon: 'instagram',
    label: 'Instagram',
  },
  twitter: {
    primary: PALETTE.twitter,
    gradient: [PALETTE.twitter, '#0D8BD9'],
    icon: 'twitter',
    label: 'X (Twitter)',
  },
  facebook: {
    primary: PALETTE.facebook,
    gradient: [PALETTE.facebook, '#0D6EFD'],
    icon: 'facebook',
    label: 'Facebook',
  },
  tiktok: {
    primary: PALETTE.tiktok,
    gradient: ['#010101', PALETTE.tiktok],
    icon: 'music-note',
    label: 'TikTok',
  },
  linkedin: {
    primary: PALETTE.linkedin,
    gradient: [PALETTE.linkedin, '#0077B5'],
    icon: 'linkedin',
    label: 'LinkedIn',
  },
  youtube: {
    primary: PALETTE.youtube,
    gradient: [PALETTE.youtube, '#CC0000'],
    icon: 'youtube',
    label: 'YouTube',
  },
};

export default DARK_THEME;
