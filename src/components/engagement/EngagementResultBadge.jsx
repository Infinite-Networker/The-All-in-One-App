/**
 * The All-in-One App — Engagement Result Badge
 * Cherry Computer Ltd.
 *
 * Compact badge shown after an engagement fires, confirming
 * success or failure per platform.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { PLATFORM_THEMES } from '../../theme';

const PLATFORM_EMOJI = {
  instagram: '📸', twitter: '🐦', facebook: '👥',
  tiktok: '🎵', linkedin: '💼', youtube: '🎬',
};

const EngagementResultBadge = ({ result }) => {
  const { theme } = useTheme();
  const platform = PLATFORM_THEMES[result.platform];
  const success = result.status === 'success';
  const color = success ? '#22C55E' : '#EF4444';

  const styles = makeStyles(theme);

  return (
    <View style={[styles.badge, { borderColor: `${color}40`, backgroundColor: `${color}12` }]}>
      <Text style={styles.platformEmoji}>{PLATFORM_EMOJI[result.platform] || '🌐'}</Text>
      <Text style={[styles.label, { color }]}>{success ? '✓' : '✗'}</Text>
    </View>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  platformEmoji: { fontSize: 12 },
  label: { fontSize: 12, fontWeight: '700' },
});

export default EngagementResultBadge;
