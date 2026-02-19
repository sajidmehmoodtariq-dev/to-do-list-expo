import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { CATEGORIES } from '../constants/categories';
import { CategoryKey, Task } from '../types/task';

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  isDark: boolean;
  index: number;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function isOverdue(iso: string, completed: boolean) {
  return !completed && new Date(iso).getTime() < Date.now();
}

export default function TaskCard({ task, onToggle, onDelete, isDark, index }: TaskCardProps) {
  const cfg = CATEGORIES[task.category as CategoryKey] ?? CATEGORIES.Personal;
  const overdue = isOverdue(task.deadline, task.isCompleted);

  // Entry animation
  const translateY = useSharedValue(40);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  // Completion scale pulse
  const checkScale = useSharedValue(1);

  useEffect(() => {
    const delay = index * 60;
    translateY.value = withDelay(delay, withSpring(0, { damping: 14, stiffness: 120 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 350 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 14 }));
  }, []);

  const handleToggle = () => {
    checkScale.value = withSpring(1.4, {}, () => {
      checkScale.value = withSpring(1);
      runOnJS(onToggle)();
    });
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#1e1e2e' : '#fff',
          borderLeftColor: cfg.bgColor,
          shadowColor: cfg.bgColor,
        },
        task.isCompleted && styles.cardCompleted,
        cardStyle,
      ]}
    >
      {/* Category accent strip */}
      <View style={[styles.strip, { backgroundColor: cfg.bgColor }]} />

      <View style={styles.body}>
        {/* Header row */}
        <View style={styles.headerRow}>
          {/* Complete toggle */}
          <TouchableOpacity onPress={handleToggle} activeOpacity={0.7}>
            <Animated.View style={checkStyle}>
              <View
                style={[
                  styles.circle,
                  {
                    borderColor: cfg.bgColor,
                    backgroundColor: task.isCompleted ? cfg.bgColor : 'transparent',
                  },
                ]}
              >
                {task.isCompleted && <Ionicons name="checkmark" size={13} color="#fff" />}
              </View>
            </Animated.View>
          </TouchableOpacity>

          {/* Title */}
          <Text
            style={[
              styles.title,
              { color: isDark ? '#f0f0f0' : '#1a1a2e' },
              task.isCompleted && styles.strikethrough,
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>

          {/* Delete */}
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="trash-outline" size={18} color={isDark ? '#ff6b6b' : '#e74c3c'} />
          </TouchableOpacity>
        </View>

        {/* Footer row */}
        <View style={styles.footerRow}>
          {/* Category chip */}
          <View style={[styles.catBadge, { backgroundColor: cfg.bgColor + '25' }]}>
            <Ionicons name={cfg.icon as any} size={11} color={cfg.bgColor} />
            <Text style={[styles.catText, { color: cfg.bgColor }]}>{cfg.label}</Text>
          </View>

          {/* Deadline */}
          <View style={styles.deadlineRow}>
            <Ionicons
              name={overdue ? 'alert-circle' : 'time-outline'}
              size={12}
              color={overdue ? '#ff6b6b' : isDark ? '#888' : '#888'}
            />
            <Text style={[styles.deadlineText, { color: overdue ? '#ff6b6b' : isDark ? '#888' : '#999' }]}>
              {formatDate(task.deadline)}
            </Text>
          </View>

          {/* Reminder info */}
          <View style={styles.deadlineRow}>
            <Ionicons name="notifications-outline" size={12} color={isDark ? '#666' : '#bbb'} />
            <Text style={[styles.deadlineText, { color: isDark ? '#666' : '#bbb' }]}>
              every {task.reminderInterval}m
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  cardCompleted: { opacity: 0.6 },
  strip: { width: 5 },
  body: { flex: 1, padding: 14, gap: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, fontSize: 15, fontWeight: '600', lineHeight: 20 },
  strikethrough: { textDecorationLine: 'line-through', opacity: 0.5 },
  footerRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  catBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  catText: { fontSize: 11, fontWeight: '700' },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  deadlineText: { fontSize: 11 },
});
