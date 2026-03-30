/**
 * The All-in-One App — Feed Card Component
 * Cherry Computer Ltd.
 *
 * The atomic unit of the unified feed. Every post, regardless of
 * platform, is rendered through this single composable component.
 * Platform identity is preserved through colour and icon — but
 * the layout remains consistent, clean, and intentional.
 */

import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useTheme } from '../../hooks/useTheme';
import { PALETTE, PLATFORM_THEMES } from '../../theme';

dayjs.extend(relativeTime);

const HAPTIC = { enableVibrateFallback: true };

const PLATFORM_EMOJI = {
  instagram: '📸',
  twitter:   '🐦',
  facebook:  '👥',
  tiktok:    '🎵',
  linkedin:  '💼',
  youtube:   '🎬',
};

const FeedCard = ({ post, onPress, onProfilePress }) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const platform = PLATFORM_THEMES[post.platform] || {};
  const platformColor = platform.primary || PALETTE.cherry;
  const gradientColors = platform.gradient || [PALETTE.cherry, PALETTE.cherryLight];

  // Like animation
  const likeScale = useRef(new Animated.Value(1)).current;

  const handleLike = useCallback(() => {
    ReactNativeHapticFeedback.trigger('impactLight', HAPTIC);
    Animated.sequence([
      Animated.timing(likeScale, { toValue: 1.4, duration: 120, useNativeDriver: true }),
      Animated.spring(likeScale, { toValue: 1, friction: 3, tension: 300, useNativeDriver: true }),
    ]).start();
  }, [likeScale]);

  const formattedTime = post.createdAt ? dayjs(post.createdAt).fromNow() : '';

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onPress}
      style={styles.card}
    >
      {/* Platform accent line */}
      <LinearGradient
        colors={gradientColors}
        style={styles.accentLine}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />

      <View style={styles.cardContent}>
        {/* Header: author + platform */}
        <View style={styles.cardHeader}>
          <TouchableOpacity
            style={styles.authorRow}
            onPress={onProfilePress}
            activeOpacity={0.8}
          >
            <View style={[styles.avatarWrapper, { borderColor: platformColor }]}>
              {post.authorAvatar ? (
                <Image source={{ uri: post.authorAvatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: `${platformColor}30` }]}>
                  <Text style={[styles.avatarInitial, { color: platformColor }]}>
                    {(post.authorName || post.authorUsername || '?')[0].toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.authorMeta}>
              <Text style={styles.authorName} numberOfLines={1}>
                {post.authorName || post.authorUsername}
              </Text>
              <Text style={styles.authorHandle} numberOfLines={1}>
                {post.authorUsername ? `@${post.authorUsername}` : ''}{' '}
                <Text style={styles.timeDot}>·</Text>{' '}
                {formattedTime}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Platform badge */}
          <View style={[styles.platformBadge, { backgroundColor: `${platformColor}18` }]}>
            <Text style={styles.platformEmoji}>{PLATFORM_EMOJI[post.platform] || '🌐'}</Text>
            <Text style={[styles.platformLabel, { color: platformColor }]}>{platform.label || post.platform}</Text>
          </View>
        </View>

        {/* Content */}
        {post.text ? (
          <Text style={styles.contentText} numberOfLines={4}>{post.text}</Text>
        ) : null}

        {/* Media */}
        {post.mediaUrl ? (
          <View style={styles.mediaWrapper}>
            <Image
              source={{ uri: post.mediaUrl }}
              style={styles.media}
              resizeMode="cover"
            />
          </View>
        ) : null}

        {/* Stats + actions */}
        <View style={styles.cardFooter}>
          <View style={styles.statsRow}>
            {post.likeCount !== undefined && (
              <Text style={styles.statItem}>
                ❤️ {formatCount(post.likeCount)}
              </Text>
            )}
            {post.commentCount !== undefined && (
              <Text style={styles.statItem}>
                💬 {formatCount(post.commentCount)}
              </Text>
            )}
            {post.shareCount !== undefined && (
              <Text style={styles.statItem}>
                🔁 {formatCount(post.shareCount)}
              </Text>
            )}
          </View>

          <View style={styles.actionsRow}>
            <Animated.View style={{ transform: [{ scale: likeScale }] }}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
                <Text style={styles.actionIcon}>❤️</Text>
              </TouchableOpacity>
            </Animated.View>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionIcon}>💬</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionIcon}>➕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const formatCount = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const makeStyles = (theme) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  accentLine: { height: 3 },
  cardContent: { padding: theme.spacing.md, gap: theme.spacing.sm },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flex: 1 },
  avatarWrapper: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1.5, overflow: 'hidden',
  },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontWeight: '700', fontSize: 16 },
  authorMeta: { flex: 1 },
  authorName: {
    fontSize: theme.typography.bodySmall,
    fontWeight: theme.typography.weightSemiBold,
    color: theme.colors.textPrimary,
  },
  authorHandle: { fontSize: theme.typography.caption, color: theme.colors.textTertiary },
  timeDot: { color: theme.colors.textTertiary },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  platformEmoji: { fontSize: 11 },
  platformLabel: { fontSize: 10, fontWeight: '700' },
  contentText: {
    fontSize: theme.typography.bodySmall,
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
  mediaWrapper: {
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    height: 200,
    backgroundColor: theme.colors.surface,
  },
  media: { width: '100%', height: '100%' },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  statsRow: { flexDirection: 'row', gap: theme.spacing.sm },
  statItem: { fontSize: theme.typography.caption, color: theme.colors.textSecondary },
  actionsRow: { flexDirection: 'row', gap: theme.spacing.xs },
  actionBtn: {
    padding: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
  },
  actionIcon: { fontSize: 14 },
});

export default FeedCard;
