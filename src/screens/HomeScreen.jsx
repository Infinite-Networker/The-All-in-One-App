/**
 * The All-in-One App — Home Screen
 * Cherry Computer Ltd.
 *
 * The central hub of the app. This is where users live —
 * the unified feed that pulls everything together.
 * One screen. Every platform. Zero switching.
 */

import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  StatusBar,
  Animated,
  Text,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchUnifiedFeed, selectFilteredFeed, selectFeedStatus } from '../store/slices/feedSlice';
import { useTheme } from '../hooks/useTheme';
import FeedCard from '../components/feed/FeedCard';
import FeedHeader from '../components/feed/FeedHeader';
import PlatformFilterBar from '../components/feed/PlatformFilterBar';
import OneTapEngageButton from '../components/engagement/OneTapEngageButton';
import EmptyFeedState from '../components/common/EmptyFeedState';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import LiveBadge from '../components/common/LiveBadge';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = makeStyles(theme, insets);

  const feed = useSelector(selectFilteredFeed);
  const feedStatus = useSelector(selectFeedStatus);

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  const isLoading = feedStatus === 'loading' && feed.length === 0;
  const isRefreshing = feedStatus === 'loading' && feed.length > 0;

  // ─── Load feed on mount ──────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchUnifiedFeed({ refresh: true }));
  }, [dispatch]);

  // ─── Pull-to-refresh ─────────────────────────────────────────────────────
  const handleRefresh = useCallback(() => {
    dispatch(fetchUnifiedFeed({ refresh: true }));
  }, [dispatch]);

  // ─── Infinite scroll ─────────────────────────────────────────────────────
  const handleEndReached = useCallback(() => {
    if (feedStatus !== 'loading') {
      dispatch(fetchUnifiedFeed({ limit: 20 }));
    }
  }, [dispatch, feedStatus]);

  // ─── Render each post card ────────────────────────────────────────────────
  const renderItem = useCallback(({ item, index }) => (
    <Animated.View
      style={{
        opacity: 1,
        transform: [{ translateY: 0 }],
      }}
    >
      <FeedCard
        post={item}
        onPress={() => navigation.navigate('PostDetail', { post: item })}
        onProfilePress={() => navigation.navigate('Profile', { userId: item.authorId, platform: item.platform })}
      />
    </Animated.View>
  ), [navigation]);

  const keyExtractor = useCallback((item) => `${item.platform}_${item.id}`, []);

  const ListHeader = useCallback(() => (
    <View>
      <Animated.View style={{ opacity: headerOpacity }}>
        <FeedHeader />
        <LiveBadge />
        <PlatformFilterBar />
      </Animated.View>
    </View>
  ), [headerOpacity]);

  const ListEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.skeletonContainer}>
          {[...Array(5)].map((_, i) => (
            <LoadingSkeleton key={i} style={styles.skeletonCard} />
          ))}
        </View>
      );
    }
    return <EmptyFeedState onConnect={() => navigation.navigate('Accounts')} />;
  }, [isLoading, navigation, styles]);

  const ListFooter = useCallback(() => {
    if (feedStatus === 'loading' && feed.length > 0) {
      return <LoadingSkeleton style={styles.footerSkeleton} />;
    }
    return (
      <View style={styles.footer}>
        <Text style={styles.footerText}>You're all caught up ✨</Text>
        <Text style={styles.footerBrand}>The All-in-One App by Cherry Computer Ltd.</Text>
      </View>
    );
  }, [feedStatus, feed.length, styles]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.colors.statusBar} backgroundColor={theme.colors.background} />

      <Animated.FlatList
        data={feed}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={8}
      />

      {/* Floating One-Tap Engage Button */}
      <OneTapEngageButton />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const makeStyles = (theme, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    paddingBottom: insets.bottom + 100,
  },
  skeletonContainer: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
  },
  skeletonCard: {
    height: 280,
    borderRadius: theme.radius.lg,
  },
  footerSkeleton: {
    height: 200,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.radius.lg,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.xs,
  },
  footerText: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weightMedium,
  },
  footerBrand: {
    fontSize: theme.typography.caption,
    color: theme.colors.textTertiary,
  },
});

export default HomeScreen;
