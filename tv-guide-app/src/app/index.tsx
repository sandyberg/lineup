import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { EventRow } from '@/components/event-row';
import { SportFilter } from '@/components/sport-filter';
import { fetchEvents, groupEventsByTime, groupEventsBySport } from '@/lib/api';
import { TV_SIZES } from '@/lib/constants';
import { GroupedEvents, SportEvent } from '@/lib/types';
import { usePreferences } from '@/hooks/use-preferences';

export default function GuideScreen() {
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { prefs, setSport, loaded } = usePreferences();

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEvents();
      setEvents(data);
    } catch (err) {
      setError('Failed to load events');
      console.warn(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 60_000);
    return () => clearInterval(interval);
  }, [loadEvents]);

  const filteredEvents = events.filter((e) => {
    const sportMatch = prefs.selectedSport === 'all' || e.sport === prefs.selectedSport;
    const serviceMatch =
      e.availableServices.length === 0 ||
      e.availableServices.some((s) => prefs.selectedServices.includes(s));
    return sportMatch && serviceMatch;
  });

  const grouped: GroupedEvents[] = prefs.selectedSport === 'all'
    ? groupEventsBySport(filteredEvents)
    : groupEventsByTime(filteredEvents);

  if (!loaded || loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading sports...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lineup</Text>
        <Text style={styles.headerSubtitle}>
          {new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      <SportFilter selected={prefs.selectedSport} onSelect={setSport} />

      {grouped.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📺</Text>
          <Text style={styles.emptyText}>No games right now</Text>
          <Text style={styles.emptySubtext}>
            {prefs.selectedSport !== 'all'
              ? 'Try selecting a different sport or check back later'
              : 'Check back later for upcoming games'}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {grouped.map((group) => (
            <EventRow
              key={group.group}
              label={group.label}
              events={group.events}
              userServices={prefs.selectedServices}
            />
          ))}
          <View style={styles.scrollPadding} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: TV_SIZES.rowPadding,
    paddingTop: 80,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#8E8E93',
    fontSize: 22,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollPadding: {
    height: 60,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 22,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 24,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#8E8E93',
    fontSize: 20,
    textAlign: 'center',
    maxWidth: 400,
  },
});
