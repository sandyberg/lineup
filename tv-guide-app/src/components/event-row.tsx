import React, { useMemo } from 'react';
import { FlatList, Platform, StyleSheet, Text, View } from 'react-native';
import { EventCard } from './event-card';
import { SportEvent, StreamingService } from '@/lib/types';
import { type ResponsiveSizes } from '@/lib/constants';

interface EventRowProps {
  label: string;
  events: SportEvent[];
  userServices: string[];
  sizes: ResponsiveSizes;
  liveCount?: number;
  onShowServicePicker?: (services: StreamingService[], event: SportEvent) => void;
}

export function EventRow({ label, events, userServices, sizes, onShowServicePicker }: EventRowProps) {
  const liveCount = events.filter((e) => e.status === 'live').length;

  const dynamicStyles = useMemo(() => ({
    labelRow: { paddingHorizontal: sizes.rowPadding, marginBottom: sizes.rowPadding < 32 ? 10 : Platform.isTV ? 22 : 16 },
    label: { fontSize: sizes.sectionLabelSize },
    count: { fontSize: sizes.subtitleSize + 2 },
    listContent: { paddingHorizontal: sizes.rowPadding },
  }), [sizes]);

  if (events.length === 0) return null;

  return (
    <View testID={`event-row-${label.toLowerCase().replace(/\s+/g, '-')}`} style={styles.container}>
      <View style={[styles.labelRow, dynamicStyles.labelRow]}>
        <Text testID="event-row-label" style={[styles.label, dynamicStyles.label]}>{label}</Text>
        {liveCount > 0 && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>
              {liveCount} LIVE
            </Text>
          </View>
        )}
        <Text
          style={[
            styles.count,
            dynamicStyles.count,
            Platform.isTV && styles.countTv,
          ]}
        >
          {events.length} game{events.length !== 1 ? 's' : ''}
        </Text>
      </View>
      <FlatList
        horizontal
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            userServices={userServices}
            sizes={sizes}
            onShowServicePicker={onShowServicePicker}
          />
        )}
        contentContainerStyle={dynamicStyles.listContent}
        showsHorizontalScrollIndicator={false}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Platform.isTV ? 46 : 32,
    overflow: 'visible',
  },
  list: {
    overflow: 'visible',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Platform.isTV ? 18 : 12,
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  liveBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: Platform.isTV ? 14 : 10,
    paddingVertical: Platform.isTV ? 6 : 4,
    borderRadius: 6,
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: Platform.isTV ? 18 : 14,
    fontWeight: '800',
  },
  count: {
    color: '#4A5568',
    fontWeight: '500',
  },
  countTv: {
    color: '#9AA5B5',
  },
});
