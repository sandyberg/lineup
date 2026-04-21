import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MarketInfo } from '@/lib/types';
import { fetchMarkets } from '@/lib/api';

interface MarketPickerProps {
  selectedMarket: string | null;
  onSelect: (marketId: string | null) => void;
  compact?: boolean;
}

export function MarketPicker({ selectedMarket, onSelect, compact }: MarketPickerProps) {
  const [markets, setMarkets] = useState<MarketInfo[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMarkets().then(setMarkets);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return markets;
    const q = search.toLowerCase();
    return markets.filter((m) => m.label.toLowerCase().includes(q));
  }, [markets, search]);

  const chipSize = compact
    ? { paddingHorizontal: 14, paddingVertical: 8 }
    : { paddingHorizontal: 18, paddingVertical: 10 };
  const fontSize = compact ? 14 : 16;

  return (
    <View>
      <TextInput
        testID="market-search"
        style={[styles.searchInput, compact && { fontSize: 14, height: 38 }]}
        placeholder="Search markets..."
        placeholderTextColor="#4A5568"
        value={search}
        onChangeText={setSearch}
      />

      <Pressable
        testID="market-none"
        onPress={() => onSelect(null)}
        style={[
          styles.chip,
          chipSize,
          !selectedMarket && styles.chipSelected,
        ]}
      >
        <Text style={[styles.chipText, { fontSize }]}>
          {!selectedMarket ? '✓ ' : ''}None
        </Text>
      </Pressable>

      <View style={styles.grid}>
        {filtered.map((market) => {
          const isSelected = selectedMarket === market.id;
          return (
            <Pressable
              key={market.id}
              testID={`market-${market.id}`}
              onPress={() => onSelect(market.id)}
              style={[
                styles.chip,
                chipSize,
                isSelected && styles.chipSelected,
              ]}
            >
              <Text style={[styles.chipText, { fontSize }]}>
                {isSelected ? '✓ ' : ''}{market.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchInput: {
    backgroundColor: '#1A1F2E',
    color: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    height: 44,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2D3548',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    backgroundColor: '#1A1F2E',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2D3548',
    marginBottom: 4,
  },
  chipSelected: {
    backgroundColor: '#1A3A5C',
    borderColor: '#5CAAFF',
  },
  chipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
