import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface EmptyStateProps {
  isDark: boolean;
  activeFilter: string;
}

export default function EmptyState({ isDark, activeFilter }: EmptyStateProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
    scale.value = withDelay(
      200,
      withRepeat(
        withSequence(withTiming(1.08, { duration: 900 }), withTiming(1, { duration: 900 })),
        -1,
        true
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <Ionicons name="checkmark-done-circle-outline" size={90} color={isDark ? '#6C63FF' : '#A29BFE'} />
      <Text style={[styles.title, { color: isDark ? '#fff' : '#2d3436' }]}>
        {activeFilter === 'All' ? 'No Tasks Yet' : `No ${activeFilter} Tasks`}
      </Text>
      <Text style={[styles.sub, { color: isDark ? '#888' : '#636e72' }]}>Tap the + button to add your first task</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: 0.3 },
  sub: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
});
