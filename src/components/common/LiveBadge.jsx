/**
 * The All-in-One App — Live Badge Component
 * Cherry Computer Ltd.
 *
 * Real-time connection status indicator shown at the top of the feed.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { PALETTE } from '../../theme';

const LiveBadge = () => {
  const { theme } = useTheme();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  const styles = makeStyles(theme);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, { opacity: pulse }]} />
      <Text style={styles.text}>Live · 6 platforms synced</Text>
      <Text style={styles.brand}>Cherry Computer Ltd.</Text>
    </View>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    gap: 6,
  },
  dot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  text: {
    fontSize: theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weightMedium,
    flex: 1,
  },
  brand: {
    fontSize: theme.typography.micro,
    color: theme.colors.textTertiary,
  },
});

export default LiveBadge;
