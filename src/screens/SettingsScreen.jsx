/**
 * The All-in-One App — Settings Screen
 * Cherry Computer Ltd.
 *
 * Preferences, theme, security, and app info.
 * The settings screen reflects the same philosophy as the app itself —
 * powerful controls, clean presentation, nothing unnecessary.
 */

import React, { useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../hooks/useTheme';
import { PALETTE } from '../theme';

const SettingsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme.mode === 'dark';
  const styles = makeStyles(theme, insets);

  const openLink = useCallback((url) => {
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open link.'));
  }, []);

  const confirmReset = useCallback(() => {
    Alert.alert(
      'Reset All Data?',
      'This will disconnect all platforms and clear your engagement history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => {} },
      ]
    );
  }, []);

  const renderSection = (title, children) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );

  const renderRow = ({ icon, title, subtitle, right, onPress, danger }) => (
    <TouchableOpacity
      key={title}
      style={styles.row}
      onPress={onPress}
      disabled={!onPress && !right}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.rowLeft}>
        <Text style={styles.rowIcon}>{icon}</Text>
        <View style={styles.rowMeta}>
          <Text style={[styles.rowTitle, danger && styles.rowTitleDanger]}>{title}</Text>
          {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <View style={styles.rowRight}>
        {right || (onPress && <Text style={styles.rowChevron}>›</Text>)}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>CC</Text>
          </View>
          <View style={styles.profileMeta}>
            <Text style={styles.profileName}>Cherry Computer Ltd.</Text>
            <Text style={styles.profileEmail}>cherry@cherrycomputer.ltd</Text>
          </View>
          <TouchableOpacity style={styles.profileEditBtn}>
            <Text style={styles.profileEditText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Appearance */}
        {renderSection('Appearance', <>
          {renderRow({
            icon: isDark ? '🌙' : '☀️',
            title: 'Dark Mode',
            subtitle: isDark ? 'Switch to light theme' : 'Switch to dark theme',
            right: (
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.colors.border, true: `${PALETTE.cherry}60` }}
                thumbColor={isDark ? PALETTE.cherry : theme.colors.muted}
              />
            ),
          })}
          {renderRow({
            icon: '🎨',
            title: 'Accent Colour',
            subtitle: 'Cherry Red (default)',
            onPress: () => {},
          })}
        </>)}

        {/* Engagement defaults */}
        {renderSection('Engagement Defaults', <>
          {renderRow({
            icon: '💬',
            title: 'Default Comment',
            subtitle: 'Set a reusable comment template',
            onPress: () => {},
          })}
          {renderRow({
            icon: '⏰',
            title: 'Engagement Schedule',
            subtitle: 'Auto-engage at preferred times',
            onPress: () => {},
          })}
          {renderRow({
            icon: '🔕',
            title: 'Quiet Hours',
            subtitle: '10:00 PM – 8:00 AM',
            onPress: () => {},
          })}
        </>)}

        {/* Notifications */}
        {renderSection('Notifications', <>
          {renderRow({
            icon: '🔔',
            title: 'Push Notifications',
            subtitle: 'Engagement results & feed updates',
            right: (
              <Switch
                value={true}
                trackColor={{ false: theme.colors.border, true: `${PALETTE.cherry}60` }}
                thumbColor={PALETTE.cherry}
              />
            ),
          })}
          {renderRow({
            icon: '📊',
            title: 'Weekly Digest',
            subtitle: 'Performance summary every Monday',
            right: (
              <Switch
                value={true}
                trackColor={{ false: theme.colors.border, true: `${PALETTE.cherry}60` }}
                thumbColor={PALETTE.cherry}
              />
            ),
          })}
        </>)}

        {/* Security */}
        {renderSection('Security & Privacy', <>
          {renderRow({
            icon: '🔐',
            title: 'Biometric Lock',
            subtitle: 'Face ID / Fingerprint',
            right: (
              <Switch
                value={false}
                trackColor={{ false: theme.colors.border, true: `${PALETTE.cherry}60` }}
                thumbColor={theme.colors.muted}
              />
            ),
          })}
          {renderRow({
            icon: '🛡️',
            title: 'Privacy Policy',
            onPress: () => openLink('https://github.com/Infinite-Networker/The-All-in-One-App'),
          })}
          {renderRow({
            icon: '📋',
            title: 'Terms of Service',
            onPress: () => openLink('https://github.com/Infinite-Networker/The-All-in-One-App'),
          })}
        </>)}

        {/* About */}
        {renderSection('About', <>
          {renderRow({
            icon: '📱',
            title: 'Version',
            subtitle: '1.0.0 (build 100)',
          })}
          {renderRow({
            icon: '🏢',
            title: 'Made by',
            subtitle: 'Cherry Computer Ltd.',
          })}
          {renderRow({
            icon: '👨‍💻',
            title: 'Developer',
            subtitle: 'Dr. Ahmad Mateen Ishanzai',
          })}
          {renderRow({
            icon: '⭐',
            title: 'Rate on App Store',
            onPress: () => {},
          })}
          {renderRow({
            icon: '🐛',
            title: 'Report a Bug',
            onPress: () => openLink('https://github.com/Infinite-Networker/The-All-in-One-App/issues'),
          })}
          {renderRow({
            icon: '</>',
            title: 'GitHub Repository',
            subtitle: 'Infinite-Networker/The-All-in-One-App',
            onPress: () => openLink('https://github.com/Infinite-Networker/The-All-in-One-App'),
          })}
        </>)}

        {/* Danger zone */}
        {renderSection('Data', <>
          {renderRow({
            icon: '🗑️',
            title: 'Clear Engagement History',
            subtitle: 'Remove all activity logs',
            onPress: () => Alert.alert('Clear History?', 'This removes all local engagement history.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Clear', style: 'destructive', onPress: () => {} },
            ]),
          })}
          {renderRow({
            icon: '⚠️',
            title: 'Reset App',
            subtitle: 'Disconnect all platforms and clear data',
            onPress: confirmReset,
            danger: true,
          })}
        </>)}

        <Text style={styles.brandFooter}>
          The All-in-One App{'\n'}
          © 2026 Cherry Computer Ltd. · MIT License
        </Text>
      </ScrollView>
    </View>
  );
};

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
  content: { padding: theme.spacing.md, gap: theme.spacing.lg },
  profileCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: PALETTE.cherry,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  profileMeta: { flex: 1 },
  profileName: { fontSize: theme.typography.body, fontWeight: theme.typography.weightBold, color: theme.colors.textPrimary },
  profileEmail: { fontSize: theme.typography.caption, color: theme.colors.textSecondary },
  profileEditBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  profileEditText: { fontSize: theme.typography.caption, color: theme.colors.textSecondary, fontWeight: theme.typography.weightSemiBold },
  section: { gap: theme.spacing.sm },
  sectionTitle: {
    fontSize: theme.typography.caption,
    fontWeight: theme.typography.weightSemiBold,
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flex: 1 },
  rowIcon: { fontSize: 18, width: 26, textAlign: 'center' },
  rowMeta: { flex: 1 },
  rowTitle: { fontSize: theme.typography.body, fontWeight: theme.typography.weightMedium, color: theme.colors.textPrimary },
  rowTitleDanger: { color: PALETTE.error },
  rowSubtitle: { fontSize: theme.typography.caption, color: theme.colors.textSecondary, marginTop: 1 },
  rowRight: {},
  rowChevron: { fontSize: 20, color: theme.colors.textTertiary },
  brandFooter: {
    textAlign: 'center',
    fontSize: theme.typography.caption,
    color: theme.colors.textTertiary,
    lineHeight: 20,
    marginTop: theme.spacing.md,
  },
});

export default SettingsScreen;
