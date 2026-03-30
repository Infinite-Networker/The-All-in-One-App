/**
 * The All-in-One App — Platform Icon Component
 * Cherry Computer Ltd.
 *
 * A reusable, consistent platform icon component.
 * Renders the platform emoji inside a colour-branded rounded box.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { PLATFORM_THEMES } from '../../theme';

const PLATFORM_EMOJI = {
  instagram: '📸',
  twitter:   '🐦',
  facebook:  '👥',
  tiktok:    '🎵',
  linkedin:  '💼',
  youtube:   '🎬',
};

const PlatformIcon = ({ platformId, size = 36, style }) => {
  const platform = PLATFORM_THEMES[platformId];
  if (!platform) return null;

  const color = platform.primary;
  const boxSize = size;
  const emojiSize = size * 0.52;
  const radius = size * 0.28;

  return (
    <View
      style={[
        {
          width: boxSize,
          height: boxSize,
          borderRadius: radius,
          backgroundColor: `${color}22`,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: `${color}30`,
        },
        style,
      ]}
    >
      <Text style={{ fontSize: emojiSize }}>
        {PLATFORM_EMOJI[platformId] || '🌐'}
      </Text>
    </View>
  );
};

export default PlatformIcon;
