/**
 * The All-in-One App — Loading Skeleton Component
 * Cherry Computer Ltd.
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

import { useTheme } from '../../hooks/useTheme';

const LoadingSkeleton = ({ style }) => {
  const { theme } = useTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [shimmer]);

  const bgColor = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: theme.colors.shimmer,
  });

  return (
    <Animated.View style={[styles.base, { backgroundColor: bgColor }, style]} />
  );
};

const styles = StyleSheet.create({
  base: { borderRadius: 12, minHeight: 24 },
});

export default LoadingSkeleton;
