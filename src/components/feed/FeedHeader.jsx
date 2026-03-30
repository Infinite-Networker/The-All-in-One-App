/**
 * The All-in-One App — Feed Header Component
 * Cherry Computer Ltd.
 *
 * The top bar of the unified feed. Greets the user, shows connection
 * status, and surfaces the quick-action trigger.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { useTheme } from '../../hooks/useTheme';
import { PALETTE } from '../../theme';

const FeedHeader = () => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
                'Good evening';

  return (
    <View style={styles.header}>
      {/* Left: logo + greeting */}
      <View style={styles.left}>
        <View style={styles.logoCard}>
          {/* App icon */}
          <View style={styles.logoInner}>
            <Text style={styles.logoHeart}>♥</Text>
            <Text style={styles.logoBubble}>💬</Text>
            <Text style={styles.logoPerson}>👤</Text>
          </View>
        </View>
        <View>
          <Text style={styles.greeting}>{greeting} 👋</Text>
          <Text style={styles.appName}>The All-in-One App</Text>
        </View>
      </View>

      {/* Right: notification bell + avatar */}
      <View style={styles.right}>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.iconBtnText}>🔔</Text>
          <View style={styles.notifDot} />
        </TouchableOpacity>
        <TouchableOpacity>
          <LinearGradient
            colors={[PALETTE.cherry, PALETTE.cherryLight]}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>CC</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  logoCard: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.textPrimary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  logoHeart: { fontSize: 9 },
  logoBubble: { fontSize: 9 },
  logoPerson: { fontSize: 9 },
  greeting: {
    fontSize: theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  appName: {
    fontSize: theme.typography.body,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.textPrimary,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconBtnText: { fontSize: 16 },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PALETTE.cherry,
    borderWidth: 1.5,
    borderColor: theme.colors.card,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
});

export default FeedHeader;
