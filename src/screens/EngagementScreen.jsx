/**
 * The All-in-One App — Engagement Screen
 * Cherry Computer Ltd.
 *
 * The control centre for one-tap cross-platform engagement.
 * Select your content, choose your action, fire simultaneously.
 * This screen is the core power of the entire app.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  TextInput,
  Switch,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import { engageAll, selectIsEngaging, selectLastResults, selectEngagementHistory } from '../store/slices/engagementSlice';
import { useTheme } from '../hooks/useTheme';
import { PALETTE, PLATFORM_THEMES } from '../theme';
import PlatformIcon from '../components/common/PlatformIcon';
import EngagementResultBadge from '../components/engagement/EngagementResultBadge';
import HistoryItem from '../components/engagement/HistoryItem';

const HAPTIC_OPTIONS = { enableVibrateFallback: true, ignoreAndroidSystemSettings: false };

const ACTIONS = [
  {
    id: 'all',
    icon: '⚡',
    label: 'Full Engagement',
    description: 'Like + Comment + Follow across all platforms',
    gradient: [PALETTE.cherry, PALETTE.cherryLight],
  },
  {
    id: 'like',
    icon: '❤️',
    label: 'Like Only',
    description: 'React to content everywhere simultaneously',
    gradient: ['#E91E63', '#FF4081'],
  },
  {
    id: 'comment',
    icon: '💬',
    label: 'Comment Only',
    description: 'Join the conversation on every platform',
    gradient: ['#3B82F6', '#60A5FA'],
  },
  {
    id: 'follow',
    icon: '➕',
    label: 'Follow Only',
    description: 'Expand your network across all platforms',
    gradient: ['#22C55E', '#4ADE80'],
  },
];

const EngagementScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = makeStyles(theme, insets);

  const isEngaging = useSelector(selectIsEngaging);
  const lastResults = useSelector(selectLastResults);
  const history = useSelector(selectEngagementHistory);

  const [selectedAction, setSelectedAction] = useState('all');
  const [commentText, setCommentText] = useState('');
  const [enabledPlatforms, setEnabledPlatforms] = useState({
    instagram: true,
    twitter: true,
    facebook: true,
    tiktok: true,
    linkedin: true,
    youtube: true,
  });
  const [showResults, setShowResults] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Animation
  const fireAnim = useRef(new Animated.Value(1)).current;

  const togglePlatform = useCallback((platformId) => {
    ReactNativeHapticFeedback.trigger('selection', HAPTIC_OPTIONS);
    setEnabledPlatforms((prev) => ({ ...prev, [platformId]: !prev[platformId] }));
  }, []);

  const handleEngage = useCallback(async () => {
    const activePlatforms = Object.entries(enabledPlatforms)
      .filter(([, enabled]) => enabled)
      .reduce((acc, [id]) => {
        acc[id] = `demo_${id}_content`;
        return acc;
      }, {});

    if (Object.keys(activePlatforms).length === 0) return;

    ReactNativeHapticFeedback.trigger('notificationSuccess', HAPTIC_OPTIONS);

    // Fire button animation
    Animated.sequence([
      Animated.timing(fireAnim, { toValue: 0.92, duration: 100, useNativeDriver: true }),
      Animated.spring(fireAnim, { toValue: 1, friction: 3, tension: 300, useNativeDriver: true }),
    ]).start();

    await dispatch(engageAll({
      contentMap: activePlatforms,
      action: selectedAction,
      comment: commentText,
    }));

    setShowResults(true);
    setTimeout(() => setShowResults(false), 5000);
  }, [dispatch, enabledPlatforms, selectedAction, commentText, fireAnim]);

  const selectedActionData = ACTIONS.find((a) => a.id === selectedAction);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.headerTitle}>Engagement</Text>
          <Text style={styles.headerSub}>One tap. Every platform.</Text>
        </View>
        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => setShowHistory(!showHistory)}
        >
          <Text style={styles.historyBtnText}>History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Results banner */}
        {showResults && lastResults && (
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>⚡ Engagement Fired!</Text>
            <View style={styles.resultsRow}>
              {lastResults.map((result) => (
                <EngagementResultBadge key={result.platform} result={result} />
              ))}
            </View>
          </View>
        )}

        {/* Platform toggles */}
        <Text style={styles.sectionLabel}>Active Platforms</Text>
        <View style={styles.platformsCard}>
          {Object.entries(PLATFORM_THEMES).map(([id, platform]) => (
            <View key={id} style={styles.platformRow}>
              <View style={styles.platformLeft}>
                <PlatformIcon platformId={id} size={32} />
                <View>
                  <Text style={styles.platformName}>{platform.label}</Text>
                  <Text style={styles.platformStatus}>
                    {enabledPlatforms[id] ? 'Active' : 'Paused'}
                  </Text>
                </View>
              </View>
              <Switch
                value={enabledPlatforms[id]}
                onValueChange={() => togglePlatform(id)}
                trackColor={{ false: theme.colors.border, true: `${platform.primary}60` }}
                thumbColor={enabledPlatforms[id] ? platform.primary : theme.colors.muted}
              />
            </View>
          ))}
        </View>

        {/* Action selector */}
        <Text style={styles.sectionLabel}>Engagement Type</Text>
        <View style={styles.actionsGrid}>
          {ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[
                styles.actionCard,
                selectedAction === action.id && styles.actionCardSelected,
              ]}
              onPress={() => {
                ReactNativeHapticFeedback.trigger('selection', HAPTIC_OPTIONS);
                setSelectedAction(action.id);
              }}
              activeOpacity={0.8}
            >
              {selectedAction === action.id && (
                <LinearGradient
                  colors={[...action.gradient, 'transparent']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  locations={[0, 0.6, 1]}
                />
              )}
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={[
                styles.actionLabel,
                selectedAction === action.id && styles.actionLabelSelected,
              ]}>
                {action.label}
              </Text>
              <Text style={styles.actionDesc}>{action.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Comment input */}
        {(selectedAction === 'comment' || selectedAction === 'all') && (
          <>
            <Text style={styles.sectionLabel}>Comment Text</Text>
            <View style={styles.commentCard}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write something that resonates..."
                placeholderTextColor={theme.colors.textTertiary}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={280}
              />
              <View style={styles.commentFooter}>
                <Text style={styles.charCount}>{commentText.length}/280</Text>
                {commentText.length > 0 && (
                  <TouchableOpacity onPress={() => setCommentText('')}>
                    <Text style={styles.clearBtn}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </>
        )}

        {/* Fire button */}
        <Animated.View style={[styles.fireWrapper, { transform: [{ scale: fireAnim }] }]}>
          <TouchableOpacity
            onPress={handleEngage}
            disabled={isEngaging}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={selectedActionData?.gradient || [PALETTE.cherry, PALETTE.cherryLight]}
              style={styles.fireButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isEngaging ? (
                <Text style={styles.fireText}>Engaging across platforms…</Text>
              ) : (
                <>
                  <Text style={styles.fireIcon}>{selectedActionData?.icon}</Text>
                  <Text style={styles.fireText}>{selectedActionData?.label} — All Platforms</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.fireSub}>
            {Object.values(enabledPlatforms).filter(Boolean).length} platforms active
          </Text>
        </Animated.View>

        {/* Engagement history */}
        {showHistory && history.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Recent Activity</Text>
            <View style={styles.historyCard}>
              {history.slice(0, 10).map((item, i) => (
                <HistoryItem key={i} item={item} />
              ))}
            </View>
          </>
        )}

        {/* Brand footer */}
        <Text style={styles.brandFooter}>
          The All-in-One App · Cherry Computer Ltd.
        </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
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
  headerSub: {
    fontSize: theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  historyBtn: {
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  historyBtnText: {
    fontSize: theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weightSemiBold,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    paddingBottom: insets.bottom + theme.spacing.xxxl,
  },
  resultsCard: {
    backgroundColor: `${PALETTE.cherry}18`,
    borderWidth: 1,
    borderColor: `${PALETTE.cherry}40`,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  resultsTitle: {
    fontSize: theme.typography.h4,
    fontWeight: theme.typography.weightBold,
    color: PALETTE.cherryLight,
  },
  resultsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
  sectionLabel: {
    fontSize: theme.typography.bodySmall,
    fontWeight: theme.typography.weightSemiBold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: theme.spacing.sm,
  },
  platformsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  platformLeft: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  platformName: {
    fontSize: theme.typography.body,
    fontWeight: theme.typography.weightSemiBold,
    color: theme.colors.textPrimary,
  },
  platformStatus: {
    fontSize: theme.typography.caption,
    color: theme.colors.textTertiary,
  },
  actionsGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  actionCard: {
    width: '47%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: 6,
    overflow: 'hidden',
  },
  actionCardSelected: {
    borderColor: PALETTE.cherry,
  },
  actionIcon: { fontSize: 22 },
  actionLabel: {
    fontSize: theme.typography.body,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.textPrimary,
  },
  actionLabelSelected: { color: '#fff' },
  actionDesc: {
    fontSize: theme.typography.caption,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  commentCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  commentInput: {
    color: theme.colors.inputText,
    fontSize: theme.typography.body,
    minHeight: 88,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  commentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  charCount: { fontSize: theme.typography.caption, color: theme.colors.textTertiary },
  clearBtn: {
    fontSize: theme.typography.caption,
    color: PALETTE.cherry,
    fontWeight: theme.typography.weightSemiBold,
  },
  fireWrapper: { gap: 8, marginTop: theme.spacing.sm },
  fireButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md + 2,
    borderRadius: theme.radius.full,
    gap: theme.spacing.sm,
  },
  fireIcon: { fontSize: 20 },
  fireText: {
    color: '#fff',
    fontSize: theme.typography.h4,
    fontWeight: theme.typography.weightBold,
  },
  fireSub: {
    textAlign: 'center',
    fontSize: theme.typography.caption,
    color: theme.colors.textTertiary,
  },
  historyCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  brandFooter: {
    textAlign: 'center',
    fontSize: theme.typography.micro,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.lg,
  },
});

export default EngagementScreen;
