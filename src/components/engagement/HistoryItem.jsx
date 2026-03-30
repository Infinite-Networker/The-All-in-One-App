/**
 * The All-in-One App — History Item Component
 * Cherry Computer Ltd.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useTheme } from '../../hooks/useTheme';
import { PALETTE } from '../../theme';

dayjs.extend(relativeTime);

const ACTION_LABELS = {
  all:     '⚡ Full Engagement',
  like:    '❤️ Liked',
  comment: '💬 Commented',
  follow:  '➕ Followed',
};

const HistoryItem = ({ item }) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const success = item.results?.every((r) => r.status === 'success');

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.action}>{ACTION_LABELS[item.action] || item.action}</Text>
        <Text style={styles.time}>{dayjs(item.timestamp).fromNow()}</Text>
      </View>
      <View style={[styles.status, { backgroundColor: success ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }]}>
        <Text style={[styles.statusText, { color: success ? '#22C55E' : '#EF4444' }]}>
          {success ? 'Success' : 'Partial'}
        </Text>
      </View>
    </View>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  left: { gap: 2 },
  action: { fontSize: theme.typography.body, fontWeight: theme.typography.weightMedium, color: theme.colors.textPrimary },
  time: { fontSize: theme.typography.caption, color: theme.colors.textTertiary },
  status: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  statusText: { fontSize: theme.typography.caption, fontWeight: theme.typography.weightBold },
});

export default HistoryItem;
