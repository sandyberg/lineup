import React, { useCallback, useMemo, useRef } from 'react';
import {
  Animated,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SPORT_FILTERS, type ResponsiveSizes } from '@/lib/constants';
import { SportCategory } from '@/lib/types';

interface SportFilterProps {
  selected: SportCategory;
  onSelect: (sport: SportCategory) => void;
  sizes: ResponsiveSizes;
}

export function SportFilter({ selected, onSelect, sizes }: SportFilterProps) {
  const dynamicStyles = useMemo(() => {
    // Extra vertical space so 2px focus border (and any scale) isn’t clipped by the row / FlatList.
    const listPadY = 6;
    return {
      container: {
        minHeight: sizes.filterHeight + 16 + listPadY * 2,
        marginBottom: sizes.rowPadding < 32 ? 4 : 8,
        justifyContent: 'center',
      } as const,
      listContent: {
        paddingHorizontal: sizes.rowPadding,
        paddingVertical: listPadY,
        gap: sizes.rowPadding < 32 ? 8 : 12,
      },
      chipLabel: { fontSize: sizes.rowPadding < 32 ? 14 : 18 },
      chipIcon: { fontSize: sizes.rowPadding < 32 ? 16 : 20 },
      chip: { paddingHorizontal: sizes.rowPadding < 32 ? 14 : 20, paddingVertical: sizes.rowPadding < 32 ? 8 : 10 },
    };
  }, [sizes]);

  return (
    <View testID="sport-filter" style={dynamicStyles.container}>
      <FlatList
        horizontal
        data={SPORT_FILTERS}
        keyExtractor={(item) => item.id}
        removeClippedSubviews={false}
        renderItem={({ item }) => (
          <FilterChip
            label={item.label}
            icon={item.icon}
            isSelected={selected === item.id}
            onPress={() => onSelect(item.id)}
            sizes={sizes}
            dynamicStyles={dynamicStyles}
          />
        )}
        contentContainerStyle={[styles.listContent, dynamicStyles.listContent]}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

function FilterChip({
  label,
  icon,
  isSelected,
  onPress,
  sizes,
  dynamicStyles,
}: {
  label: string;
  icon: string;
  isSelected: boolean;
  onPress: () => void;
  sizes: ResponsiveSizes;
  dynamicStyles: Record<string, object>;
}) {
  // Large TV scale + tight row height clips the focus border; use app focus scale and milder on TV.
  const focusTo = useMemo(
    () => (Platform.isTV ? Math.min(1.04, sizes.focusScale) : 1.1),
    [sizes.focusScale],
  );
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleFocus = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: focusTo,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [scaleAnim, focusTo]);

  const handleBlur = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        testID={`sport-filter-${label.toLowerCase().replace(/\s+/g, '-')}`}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPress={onPress}
        style={({ focused }) => [
          styles.chip,
          dynamicStyles.chip,
          isSelected && styles.chipSelected,
          focused && styles.chipFocused,
        ]}
      >
        <Text style={[styles.chipIcon, dynamicStyles.chipIcon]}>{icon}</Text>
        <Text
          style={[
            styles.chipLabel,
            dynamicStyles.chipLabel,
            isSelected && styles.chipLabelSelected,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: '#1A1F2E',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 8,
  },
  chipSelected: {
    backgroundColor: '#FFFFFF',
  },
  chipFocused: {
    borderColor: '#FFFFFF',
  },
  chipIcon: {},
  chipLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  chipLabelSelected: {
    color: '#000000',
  },
});
