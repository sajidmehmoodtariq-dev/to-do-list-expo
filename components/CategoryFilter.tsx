import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { CATEGORIES, CATEGORY_KEYS } from '../constants/categories';
import { CategoryKey } from '../types/task';

interface CategoryFilterProps {
  active: CategoryKey;
  onSelect: (cat: CategoryKey) => void;
  isDark: boolean;
  taskCounts: Record<string, number>;
}

function CategoryChip({
  cat,
  active,
  isDark,
  onSelect,
  count,
}: {
  cat: CategoryKey;
  active: boolean;
  isDark: boolean;
  onSelect: () => void;
  count: number;
}) {
  const cfg = CATEGORIES[cat];

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(active ? 1.07 : 1) }],
  }));

  return (
    <TouchableOpacity onPress={onSelect} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.chip,
          {
            backgroundColor: active ? cfg.bgColor : isDark ? '#1e1e2e' : '#f1f0ff',
            borderColor: active ? cfg.bgColor : isDark ? '#333' : '#ddd',
          },
          animStyle,
        ]}
      >
        <Ionicons
          name={cfg.icon as any}
          size={14}
          color={active ? '#fff' : isDark ? '#bbb' : '#555'}
          style={{ marginRight: 5 }}
        />
        <Text style={[styles.chipText, { color: active ? '#fff' : isDark ? '#ccc' : '#444' }]}>
          {cfg.label}
        </Text>
        {count > 0 && (
          <View style={[styles.badge, { backgroundColor: active ? 'rgba(255,255,255,0.3)' : cfg.bgColor }]}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function CategoryFilter({ active, onSelect, isDark, taskCounts }: CategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {CATEGORY_KEYS.map((cat) => (
        <CategoryChip
          key={cat}
          cat={cat}
          active={active === cat}
          isDark={isDark}
          onSelect={() => onSelect(cat)}
          count={taskCounts[cat] ?? 0}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, flexDirection: 'row' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  badge: { marginLeft: 6, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
