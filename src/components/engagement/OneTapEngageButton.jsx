/**
 * The All-in-One App — One-Tap Engage Button
 * Cherry Computer Ltd.
 *
 * THE signature component of this entire app.
 * This button is the physical manifestation of the core concept —
 * one tap, every platform, simultaneous engagement.
 *
 * I designed this with a spring animation and haptic feedback
 * because actions this powerful should feel just as powerful.
 */

import React, { useRef, useCallback, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useDispatch, useSelector } from 'react-redux';

import { engageAll, selectIsEngaging, selectLastResults } from '../../store/slices/engagementSlice';
import { useTheme } from '../../hooks/useTheme';
import { PALETTE, PLATFORM_THEMES } from '../../theme';
import PlatformIcon from '../common/PlatformIcon';
import EngagementResultBadge from './EngagementResultBadge';

const HAPTIC_OPTIONS = { enableVibrateFallback: true, ignoreAndroidSystemSettings: false };

const OneTapEngageButton = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const isEngaging = useSelector(selectIsEngaging);
  const lastResults = useSelector(selectLastResults);

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState('all');
  const [commentText, setCommentText] = useState('');
  const [resultsVisible, setResultsVisible] = useState(false);

  // ─── Pulse animation loop ───────────────────────────────────────────────
  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  // ─── Press animation ────────────────────────────────────────────────────
  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.93,
      useNativeDriver: true,
      damping: 12,
      stiffness: 200,
    }).start();
    ReactNativeHapticFeedback.trigger('impactMedium', HAPTIC_OPTIONS);
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 10,
      stiffness: 180,
    }).start();
  }, [scaleAnim]);

  // ─── Open engagement modal ───────────────────────────────────────────────
  const handlePress = useCallback(() => {
    ReactNativeHapticFeedback.trigger('impactLight', HAPTIC_OPTIONS);
    setModalVisible(true);
  }, []);

  // ─── Execute engagement ──────────────────────────────────────────────────
  const handleEngage = useCallback(async () => {
    ReactNativeHapticFeedback.trigger('notificationSuccess', HAPTIC_OPTIONS);
    setModalVisible(false);

    // For demo purposes — in real use, contentMap comes from selected posts
    const mockContentMap = {
      instagram: 'demo_post_123',
      twitter: 'demo_tweet_456',
      facebook: 'demo_fb_789',
      tiktok: 'demo_tiktok_321',
      linkedin: 'demo_li_654',
      youtube: 'demo_yt_987',
    };

    await dispatch(engageAll({
      contentMap: mockContentMap,
      action: selectedAction,
      comment: commentText,
    }));

    setResultsVisible(true);
    setTimeout(() => setResultsVisible(false), 4000);
  }, [dispatch, selectedAction, commentText]);

  const ACTION_OPTIONS = [
    { id: 'all', label: '❤️ Like + 💬 Comment + ➕ Follow', description: 'Full engagement package' },
    { id: 'like', label: '❤️ Like Only', description: 'React to content everywhere' },
    { id: 'comment', label: '💬 Comment Only', description: 'Join the conversation' },
    { id: 'follow', label: '➕ Follow Only', description: 'Expand your network' },
  ];

  return (
    <>
      {/* The Main Button */}
      <View style={styles.container}>
        {/* Results preview */}
        {resultsVisible && lastResults && (
          <Animated.View style={styles.resultsRow}>
            {lastResults.map((result) => (
              <EngagementResultBadge key={result.platform} result={result} />
            ))}
          </Animated.View>
        )}

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          {/* Glow ring */}
          <Animated.View style={[styles.glowRing, { opacity: isEngaging ? 0.6 : 0.3 }]} />

          <TouchableOpacity
            activeOpacity={1}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            disabled={isEngaging}
          >
            <LinearGradient
              colors={isEngaging ? [PALETTE.cherryDeep, PALETTE.cherry] : [PALETTE.cherry, PALETTE.cherryLight]}
              style={styles.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isEngaging ? (
                <Text style={styles.buttonText}>Engaging...</Text>
              ) : (
                <>
                  <Text style={styles.buttonIcon}>⚡</Text>
                  <Text style={styles.buttonText}>One Tap Engage</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.buttonSub}>All platforms · Simultaneously</Text>
      </View>

      {/* Engagement Action Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Handle bar */}
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>Choose Your Engagement</Text>
            <Text style={styles.modalSubtitle}>
              This action will fire across all your connected platforms instantly.
            </Text>

            {/* Platform indicators */}
            <View style={styles.platformRow}>
              {Object.keys(PLATFORM_THEMES).map((platformId) => (
                <PlatformIcon
                  key={platformId}
                  platformId={platformId}
                  size={28}
                  style={styles.platformIcon}
                />
              ))}
            </View>

            {/* Action selector */}
            <View style={styles.actionOptions}>
              {ACTION_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.actionOption,
                    selectedAction === opt.id && styles.actionOptionSelected,
                  ]}
                  onPress={() => setSelectedAction(opt.id)}
                >
                  <Text style={[
                    styles.actionOptionLabel,
                    selectedAction === opt.id && styles.actionOptionLabelSelected,
                  ]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.actionOptionDesc}>{opt.description}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Comment input — shown when comment action is selected */}
            {(selectedAction === 'comment' || selectedAction === 'all') && (
              <View style={styles.commentContainer}>
                <Text style={styles.commentLabel}>Comment Text</Text>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Write something great..."
                  placeholderTextColor={theme.colors.textTertiary}
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={280}
                />
                <Text style={styles.charCount}>{commentText.length}/280</Text>
              </View>
            )}

            {/* Action buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.engageButton}
                onPress={handleEngage}
              >
                <LinearGradient
                  colors={[PALETTE.cherry, PALETTE.cherryLight]}
                  style={styles.engageGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.engageText}>⚡ Engage Now</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalBrand}>The All-in-One App · Cherry Computer Ltd.</Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const makeStyles = (theme) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  glowRing: {
    position: 'absolute',
    width: 180,
    height: 54,
    borderRadius: theme.radius.full,
    backgroundColor: PALETTE.cherry,
    top: 4,
    left: 4,
    right: 4,
    shadowColor: PALETTE.cherry,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 0,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.full,
    gap: theme.spacing.xs,
    minWidth: 180,
    ...theme.shadows.cherry,
  },
  buttonIcon: {
    fontSize: 18,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.h4,
    fontWeight: theme.typography.weightBold,
    letterSpacing: 0.3,
  },
  buttonSub: {
    fontSize: theme.typography.caption,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.xs,
  },
  resultsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.muted,
    borderRadius: theme.radius.full,
    alignSelf: 'center',
    marginBottom: theme.spacing.sm,
  },
  modalTitle: {
    fontSize: theme.typography.h2,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  platformRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  platformIcon: {
    opacity: 0.9,
  },
  actionOptions: {
    gap: theme.spacing.sm,
  },
  actionOption: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  actionOptionSelected: {
    borderColor: PALETTE.cherry,
    backgroundColor: PALETTE.cherryGlow,
  },
  actionOptionLabel: {
    fontSize: theme.typography.body,
    fontWeight: theme.typography.weightSemiBold,
    color: theme.colors.textPrimary,
  },
  actionOptionLabelSelected: {
    color: PALETTE.cherry,
  },
  actionOptionDesc: {
    fontSize: theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  commentContainer: {
    gap: theme.spacing.xs,
  },
  commentLabel: {
    fontSize: theme.typography.bodySmall,
    fontWeight: theme.typography.weightSemiBold,
    color: theme.colors.textSecondary,
  },
  commentInput: {
    backgroundColor: theme.colors.inputBg,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    color: theme.colors.inputText,
    padding: theme.spacing.md,
    fontSize: theme.typography.body,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: theme.typography.caption,
    color: theme.colors.textTertiary,
    textAlign: 'right',
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  cancelButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weightSemiBold,
    fontSize: theme.typography.body,
  },
  engageButton: {
    flex: 2,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
  },
  engageGradient: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  engageText: {
    color: '#FFFFFF',
    fontWeight: theme.typography.weightBold,
    fontSize: theme.typography.body,
  },
  modalBrand: {
    fontSize: theme.typography.micro,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
});

export default OneTapEngageButton;
