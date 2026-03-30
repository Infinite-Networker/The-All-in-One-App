/**
 * The All-in-One App — Empty Feed State
 * Cherry Computer Ltd.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { useTheme } from '../../hooks/useTheme';
import { PALETTE } from '../../theme';

const EmptyFeedState = ({ onConnect }) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>⚡</Text>
      </View>
      <Text style={styles.title}>Your feed is empty</Text>
      <Text style={styles.subtitle}>
        Connect your social accounts to start seeing a unified feed from all your platforms in one place.
      </Text>
      <TouchableOpacity onPress={onConnect} activeOpacity={0.85}>
        <LinearGradient
          colors={[PALETTE.cherry, PALETTE.cherryLight]}
          style={styles.btn}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.btnText}>Connect Accounts</Text>
        </LinearGradient>
      </TouchableOpacity>
      <Text style={styles.brand}>The All-in-One App · Cherry Computer Ltd.</Text>
    </View>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxxl,
    gap: theme.spacing.md,
  },
  iconWrap: {
    width: 80, height: 80,
    borderRadius: 40,
    backgroundColor: PALETTE.cherryGlow,
    borderWidth: 1, borderColor: `${PALETTE.cherry}30`,
    alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 36 },
  title: {
    fontSize: theme.typography.h2, fontWeight: theme.typography.weightBold,
    color: theme.colors.textPrimary, textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.body, color: theme.colors.textSecondary,
    textAlign: 'center', lineHeight: 22,
  },
  btn: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.full,
    marginTop: theme.spacing.sm,
  },
  btnText: { color: '#fff', fontWeight: theme.typography.weightBold, fontSize: theme.typography.body },
  brand: { fontSize: theme.typography.micro, color: theme.colors.textTertiary, marginTop: theme.spacing.sm },
});

export default EmptyFeedState;
