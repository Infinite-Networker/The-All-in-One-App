/**
 * The All-in-One App — Platform Filter Bar
 * Cherry Computer Ltd.
 *
 * Horizontal scrollable chip bar for filtering the unified feed
 * by platform. "All" shows the full aggregate. Platform chips
 * filter to content from that specific source.
 */

import React, { useState, useCallback } from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import { useTheme } from '../../hooks/useTheme';
import { PALETTE, PLATFORM_THEMES } from '../../theme';

const HAPTIC = { enableVibrateFallback: true };

const FILTERS = [
  { id: 'all', label: 'All Platforms', emoji: '⚡', color: PALETTE.cherry, gradient: [PALETTE.cherry, PALETTE.cherryLight] },
  { id: 'instagram', label: 'Instagram', emoji: '📸' },
  { id: 'twitter',   label: 'X',         emoji: '🐦' },
  { id: 'facebook',  label: 'Facebook',  emoji: '👥' },
  { id: 'tiktok',    label: 'TikTok',    emoji: '🎵' },
  { id: 'linkedin',  label: 'LinkedIn',  emoji: '💼' },
  { id: 'youtube',   label: 'YouTube',   emoji: '🎬' },
];

const PlatformFilterBar = ({ onFilterChange }) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const [active, setActive] = useState('all');

  const handlePress = useCallback((id) => {
    ReactNativeHapticFeedback.trigger('selection', HAPTIC);
    setActive(id);
    onFilterChange?.(id);
  }, [onFilterChange]);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {FILTERS.map((filter) => {
          const isActive = active === filter.id;
          const platformTheme = PLATFORM_THEMES[filter.id];
          const color = filter.color || platformTheme?.primary || PALETTE.cherry;
          const gradient = filter.gradient || platformTheme?.gradient || [color, color];

          return (
            <TouchableOpacity
              key={filter.id}
              onPress={() => handlePress(filter.id)}
              activeOpacity={0.8}
              style={[
                styles.chip,
                isActive
                  ? { borderColor: color, backgroundColor: `${color}18` }
                  : { borderColor: theme.colors.border, backgroundColor: theme.colors.card },
              ]}
            >
              <Text style={styles.chipEmoji}>{filter.emoji}</Text>
              <Text style={[styles.chipLabel, { color: isActive ? color : theme.colors.textSecondary }]}>
                {filter.label}
              </Text>
              {isActive && (
                <LinearGradient
                  colors={gradient}
                  style={styles.activeDot}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
  },
  container: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    borderWidth: 1.5,
    position: 'relative',
  },
  chipEmoji: { fontSize: 13 },
  chipLabel: { fontSize: theme.typography.caption, fontWeight: theme.typography.weightSemiBold },
  activeDot: {
    position: 'absolute',
    bottom: -1,
    left: '20%',
    right: '20%',
    height: 2,
    borderRadius: 1,
  },
});

export default PlatformFilterBar;
