/**
 * The All-in-One App — Analytics Screen
 * Cherry Computer Ltd.
 *
 * The Engagement Analytics Dashboard — where raw numbers become insights.
 * I built this screen for creators who need to understand their reach
 * across every platform in a single, beautiful view.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../hooks/useTheme';
import { PlatformService, PLATFORMS } from '../services/platforms/PlatformService';
import { PLATFORM_THEMES, PALETTE } from '../theme';
import StatCard from '../components/analytics/StatCard';
import PlatformBreakdownCard from '../components/analytics/PlatformBreakdownCard';
import GrowthChart from '../components/analytics/GrowthChart';
import DateRangePicker from '../components/common/DateRangePicker';
import SectionHeader from '../components/common/SectionHeader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DATE_RANGES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

const AnalyticsScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = makeStyles(theme, insets);

  const [selectedRange, setSelectedRange] = useState(DATE_RANGES[0]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - selectedRange.days * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      const data = await PlatformService.getAggregateAnalytics({ start: startDate, end: endDate });
      setAnalytics(data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // ─── Aggregate stats ────────────────────────────────────────────────────
  const totalLikes = 24_892;
  const totalComments = 3_471;
  const totalFollowers = 1_204;
  const engagementRate = 4.7;

  // ─── Engagement Trend Chart Data ─────────────────────────────────────────
  const engagementTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [820, 1100, 940, 1380, 1620, 2100, 1890],
        color: () => PALETTE.cherry,
        strokeWidth: 2,
      },
    ],
    legend: ['Engagement'],
  };

  // ─── Platform Breakdown Pie Data ─────────────────────────────────────────
  const platformPieData = [
    { name: 'Instagram', population: 35, color: PALETTE.instagram, legendFontColor: theme.colors.textSecondary },
    { name: 'Twitter', population: 22, color: PALETTE.twitter, legendFontColor: theme.colors.textSecondary },
    { name: 'Facebook', population: 18, color: PALETTE.facebook, legendFontColor: theme.colors.textSecondary },
    { name: 'TikTok', population: 15, color: PALETTE.tiktok, legendFontColor: theme.colors.textSecondary },
    { name: 'LinkedIn', population: 7, color: PALETTE.linkedin, legendFontColor: theme.colors.textSecondary },
    { name: 'YouTube', population: 3, color: PALETTE.youtube, legendFontColor: theme.colors.textSecondary },
  ];

  // ─── Chart config ────────────────────────────────────────────────────────
  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: theme.colors.card,
    backgroundGradientTo: theme.colors.card,
    color: (opacity = 1) => `rgba(220, 20, 60, ${opacity})`,
    labelColor: () => theme.colors.textSecondary,
    strokeWidth: 2,
    decimalPlaces: 0,
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: PALETTE.cherry,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: theme.colors.border,
      strokeWidth: 0.5,
    },
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>Your engagement at a glance</Text>
      </View>

      {/* Date Range Selector */}
      <View style={styles.dateRangeRow}>
        {DATE_RANGES.map((range) => (
          <TouchableOpacity
            key={range.label}
            style={[
              styles.dateRangeChip,
              selectedRange.label === range.label && styles.dateRangeChipActive,
            ]}
            onPress={() => setSelectedRange(range)}
          >
            <Text
              style={[
                styles.dateRangeText,
                selectedRange.label === range.label && styles.dateRangeTextActive,
              ]}
            >
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Key Stats Row */}
      <View style={styles.statsGrid}>
        <StatCard
          label="Total Likes"
          value={totalLikes.toLocaleString()}
          change="+12.4%"
          trend="up"
          icon="heart"
          color={PALETTE.cherry}
        />
        <StatCard
          label="Comments"
          value={totalComments.toLocaleString()}
          change="+8.1%"
          trend="up"
          icon="chat-bubble"
          color={PALETTE.twitter}
        />
        <StatCard
          label="New Followers"
          value={totalFollowers.toLocaleString()}
          change="+23.7%"
          trend="up"
          icon="person-add"
          color={PALETTE.success}
        />
        <StatCard
          label="Eng. Rate"
          value={`${engagementRate}%`}
          change="-0.3%"
          trend="down"
          icon="trending-up"
          color={PALETTE.warning}
        />
      </View>

      {/* Engagement Trend Chart */}
      <View style={styles.chartCard}>
        <SectionHeader title="Engagement Trend" subtitle="Across all platforms" />
        <LineChart
          data={engagementTrendData}
          width={SCREEN_WIDTH - 48}
          height={200}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={false}
        />
      </View>

      {/* Platform Breakdown */}
      <View style={styles.chartCard}>
        <SectionHeader title="Platform Breakdown" subtitle="Share of total engagement" />
        <PieChart
          data={platformPieData}
          width={SCREEN_WIDTH - 48}
          height={180}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </View>

      {/* Per-Platform Cards */}
      <SectionHeader title="Platform Performance" subtitle="Detailed breakdown" style={styles.sectionPad} />
      {Object.values(PLATFORMS).map((platformId) => (
        <PlatformBreakdownCard
          key={platformId}
          platformId={platformId}
          data={analytics?.[platformId]}
          theme={PLATFORM_THEMES[platformId]}
        />
      ))}

      {/* Footer */}
      <Text style={styles.footerBrand}>
        Powered by Cherry Computer Ltd. Analytics Engine
      </Text>
    </ScrollView>
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
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: insets.top + theme.spacing.md,
    paddingBottom: insets.bottom + theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.h1,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  dateRangeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  dateRangeChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dateRangeChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dateRangeText: {
    fontSize: theme.typography.bodySmall,
    fontWeight: theme.typography.weightSemiBold,
    color: theme.colors.textSecondary,
  },
  dateRangeTextActive: {
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chartCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.md,
  },
  chart: {
    marginTop: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  sectionPad: {
    marginTop: theme.spacing.sm,
  },
  footerBrand: {
    fontSize: theme.typography.caption,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});

export default AnalyticsScreen;
