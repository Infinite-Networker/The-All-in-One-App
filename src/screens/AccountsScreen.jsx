/**
 * The All-in-One App — Accounts Screen
 * Cherry Computer Ltd.
 *
 * Platform account management. Connect, disconnect, re-auth.
 * Every integration lives here — this is the bridge between
 * the user's identity and the entire platform ecosystem.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import { useTheme } from '../hooks/useTheme';
import { PALETTE, PLATFORM_THEMES } from '../theme';
import OAuthService from '../services/auth/OAuthService';

const HAPTIC_OPTIONS = { enableVibrateFallback: true };

// Simulated connection state shape
const INITIAL_CONNECTIONS = {
  instagram: { connected: true,  username: '@cherry_creative', followers: '24.5K', avatar: null },
  twitter:   { connected: true,  username: '@CherryComputerLtd', followers: '12.1K', avatar: null },
  facebook:  { connected: false, username: null,                 followers: null,   avatar: null },
  tiktok:    { connected: true,  username: '@allInOneApp',       followers: '98.7K', avatar: null },
  linkedin:  { connected: false, username: null,                 followers: null,   avatar: null },
  youtube:   { connected: true,  username: 'Cherry Computer Ltd.', followers: '8.3K', avatar: null },
};

const AccountsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = makeStyles(theme, insets);

  const [connections, setConnections] = useState(INITIAL_CONNECTIONS);
  const [loading, setLoading] = useState({});

  const connectedCount = Object.values(connections).filter((c) => c.connected).length;

  const handleConnect = useCallback(async (platformId) => {
    ReactNativeHapticFeedback.trigger('impactLight', HAPTIC_OPTIONS);
    setLoading((prev) => ({ ...prev, [platformId]: true }));

    try {
      // In production: await OAuthService.authenticate(platformId);
      // Simulated for demo
      await new Promise((res) => setTimeout(res, 1200));
      setConnections((prev) => ({
        ...prev,
        [platformId]: {
          connected: true,
          username: `@demo_${platformId}`,
          followers: '0',
          avatar: null,
        },
      }));
      ReactNativeHapticFeedback.trigger('notificationSuccess', HAPTIC_OPTIONS);
    } catch (err) {
      Alert.alert('Connection Failed', `Could not connect to ${PLATFORM_THEMES[platformId].label}. Please try again.`);
    } finally {
      setLoading((prev) => ({ ...prev, [platformId]: false }));
    }
  }, []);

  const handleDisconnect = useCallback((platformId) => {
    const platform = PLATFORM_THEMES[platformId];
    Alert.alert(
      `Disconnect ${platform.label}?`,
      'You will no longer be able to engage on this platform until you reconnect.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            ReactNativeHapticFeedback.trigger('notificationWarning', HAPTIC_OPTIONS);
            setConnections((prev) => ({
              ...prev,
              [platformId]: { connected: false, username: null, followers: null, avatar: null },
            }));
          },
        },
      ]
    );
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.headerTitle}>Accounts</Text>
          <Text style={styles.headerSub}>{connectedCount} of 6 platforms connected</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Status card */}
        <LinearGradient
          colors={connectedCount === 6
            ? ['rgba(34,197,94,0.12)', 'rgba(34,197,94,0.04)']
            : [PALETTE.cherryGlow, 'transparent']}
          style={styles.statusCard}
        >
          <View style={styles.statusLeft}>
            <Text style={styles.statusIcon}>{connectedCount === 6 ? '🟢' : '⚡'}</Text>
            <View>
              <Text style={styles.statusTitle}>
                {connectedCount === 6 ? 'All Platforms Live' : `${connectedCount} Platforms Active`}
              </Text>
              <Text style={styles.statusDesc}>
                {connectedCount === 6
                  ? 'One-tap engagement is firing on all cylinders'
                  : `Connect ${6 - connectedCount} more for maximum reach`}
              </Text>
            </View>
          </View>
          <View style={styles.statusCount}>
            <Text style={[styles.statusCountNum, { color: connectedCount === 6 ? '#22C55E' : PALETTE.cherry }]}>
              {connectedCount}/6
            </Text>
          </View>
        </LinearGradient>

        {/* Platform list */}
        <Text style={styles.sectionLabel}>Connected Accounts</Text>
        <View style={styles.platformList}>
          {Object.entries(PLATFORM_THEMES).map(([id, platform]) => {
            const connection = connections[id];
            const isLoading = loading[id];
            const gradientColors = platform.gradient;

            return (
              <View key={id} style={styles.platformCard}>
                {/* Platform colour bar */}
                <LinearGradient
                  colors={gradientColors}
                  style={styles.platformBar}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />

                <View style={styles.platformContent}>
                  {/* Left: icon + info */}
                  <View style={styles.platformLeft}>
                    <View style={[styles.platformIconBox, { backgroundColor: `${gradientColors[0]}20` }]}>
                      <Text style={styles.platformEmoji}>
                        {{ instagram: '📸', twitter: '🐦', facebook: '👥', tiktok: '🎵', linkedin: '💼', youtube: '🎬' }[id]}
                      </Text>
                    </View>
                    <View style={styles.platformMeta}>
                      <Text style={styles.platformName}>{platform.label}</Text>
                      {connection.connected ? (
                        <>
                          <Text style={styles.platformUsername}>{connection.username}</Text>
                          <Text style={styles.platformFollowers}>{connection.followers} followers</Text>
                        </>
                      ) : (
                        <Text style={styles.platformNotConnected}>Not connected</Text>
                      )}
                    </View>
                  </View>

                  {/* Right: action button */}
                  {connection.connected ? (
                    <TouchableOpacity
                      style={styles.disconnectBtn}
                      onPress={() => handleDisconnect(id)}
                    >
                      <Text style={styles.disconnectText}>Disconnect</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleConnect(id)}
                      disabled={isLoading}
                    >
                      <LinearGradient
                        colors={gradientColors}
                        style={styles.connectBtn}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Text style={styles.connectText}>
                          {isLoading ? 'Connecting…' : '+ Connect'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Connected badge */}
                {connection.connected && (
                  <View style={styles.connectedBadge}>
                    <Text style={styles.connectedBadgeText}>✓ Live</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Security note */}
        <View style={styles.securityNote}>
          <Text style={styles.securityIcon}>🔐</Text>
          <View style={styles.securityText}>
            <Text style={styles.securityTitle}>Your credentials are always safe</Text>
            <Text style={styles.securityDesc}>
              All platform connections use OAuth 2.0. Your passwords are never stored — authentication
              flows through each platform's official SDK. Data encrypted at rest with AES-256.
            </Text>
          </View>
        </View>

        <Text style={styles.brandFooter}>The All-in-One App · Cherry Computer Ltd.</Text>
      </ScrollView>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const makeStyles = (theme, insets) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.h1,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.textPrimary,
  },
  headerSub: { fontSize: theme.typography.bodySmall, color: theme.colors.textSecondary },
  content: { padding: theme.spacing.md, gap: theme.spacing.md },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, flex: 1 },
  statusIcon: { fontSize: 24 },
  statusTitle: { fontSize: theme.typography.h4, fontWeight: theme.typography.weightBold, color: theme.colors.textPrimary },
  statusDesc: { fontSize: theme.typography.caption, color: theme.colors.textSecondary, marginTop: 2 },
  statusCount: {},
  statusCountNum: { fontSize: theme.typography.h2, fontWeight: theme.typography.weightBold },
  sectionLabel: {
    fontSize: theme.typography.bodySmall,
    fontWeight: theme.typography.weightSemiBold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  platformList: { gap: theme.spacing.sm },
  platformCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  platformBar: { height: 3, width: '100%' },
  platformContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  platformLeft: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flex: 1 },
  platformIconBox: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformEmoji: { fontSize: 20 },
  platformMeta: { flex: 1 },
  platformName: { fontSize: theme.typography.body, fontWeight: theme.typography.weightBold, color: theme.colors.textPrimary },
  platformUsername: { fontSize: theme.typography.caption, color: theme.colors.textSecondary, marginTop: 1 },
  platformFollowers: { fontSize: theme.typography.micro, color: theme.colors.textTertiary },
  platformNotConnected: { fontSize: theme.typography.caption, color: theme.colors.textTertiary },
  disconnectBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  disconnectText: { fontSize: theme.typography.caption, color: theme.colors.textSecondary, fontWeight: theme.typography.weightSemiBold },
  connectBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  connectText: { fontSize: theme.typography.caption, color: '#fff', fontWeight: theme.typography.weightBold },
  connectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderRadius: theme.radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  connectedBadgeText: { fontSize: 10, color: '#22C55E', fontWeight: '700' },
  securityNote: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  securityIcon: { fontSize: 22 },
  securityText: { flex: 1 },
  securityTitle: { fontSize: theme.typography.body, fontWeight: theme.typography.weightBold, color: theme.colors.textPrimary, marginBottom: 4 },
  securityDesc: { fontSize: theme.typography.caption, color: theme.colors.textSecondary, lineHeight: 18 },
  brandFooter: { textAlign: 'center', fontSize: theme.typography.micro, color: theme.colors.textTertiary, marginTop: theme.spacing.md },
});

export default AccountsScreen;
