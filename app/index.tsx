import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import AddTaskModal from '../components/AddTaskModal';
import CategoryFilter from '../components/CategoryFilter';
import EmptyState from '../components/EmptyState';
import TaskCard from '../components/TaskCard';
import { CATEGORIES } from '../constants/categories';
import { useTasks } from '../hooks/useTasks';
import { requestNotificationPermissions } from '../hooks/useNotifications';
import { CategoryKey, Task } from '../types/task';

// ─────────────────────────────────────────────────────────
//  Progress Bar
// ─────────────────────────────────────────────────────────
function ProgressBar({ ratio, color, isDark }: { ratio: number; color: string; isDark: boolean }) {
  const width = useSharedValue(0);
  useEffect(() => {
    width.value = withTiming(ratio, { duration: 600 });
  }, [ratio]);
  const barStyle = useAnimatedStyle(() => ({ width: `${width.value * 100}%` as any }));
  return (
    <View style={[progressStyles.track, { backgroundColor: isDark ? '#2a2a3e' : '#ebebf5' }]}>
      <Animated.View style={[progressStyles.fill, { backgroundColor: color }, barStyle]} />
    </View>
  );
}

const progressStyles = StyleSheet.create({
  track: { height: 6, borderRadius: 3, overflow: 'hidden', flex: 1 },
  fill: { height: '100%', borderRadius: 3 },
});

// ─────────────────────────────────────────────────────────
//  FAB
// ─────────────────────────────────────────────────────────
function FAB({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const fabStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <TouchableOpacity
      onPress={() => {
        scale.value = withSpring(0.88, {}, () => { scale.value = withSpring(1); });
        onPress();
      }}
      activeOpacity={1}
    >
      <Animated.View style={[styles.fab, fabStyle]}>
        <Ionicons name="add" size={30} color="#fff" />
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────
//  Header Stats
// ─────────────────────────────────────────────────────────
function HeaderStats({
  total,
  completed,
  filter,
  isDark,
}: {
  total: number;
  completed: number;
  filter: CategoryKey;
  isDark: boolean;
}) {
  const color = CATEGORIES[filter].bgColor;
  const ratio = total === 0 ? 0 : completed / total;
  return (
    <View style={[statsStyles.container, { backgroundColor: isDark ? '#1a1a2e' : '#f0efff' }]}>
      <View style={statsStyles.row}>
        <Text style={[statsStyles.title, { color: isDark ? '#ddd' : '#333' }]}>
          {completed} / {total} done
        </Text>
        <Text style={[statsStyles.pct, { color }]}>{Math.round(ratio * 100)}%</Text>
      </View>
      <ProgressBar ratio={ratio} color={color} isDark={isDark} />
    </View>
  );
}

const statsStyles = StyleSheet.create({
  container: { marginHorizontal: 16, marginBottom: 8, borderRadius: 14, padding: 14, gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 13, fontWeight: '600' },
  pct: { fontSize: 13, fontWeight: '800' },
});

// ─────────────────────────────────────────────────────────
//  Main Screen
// ─────────────────────────────────────────────────────────
export default function Index() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { tasks, loading, addTask, toggleTask, deleteTask, clearCompleted } = useTasks();

  const [modalVisible, setModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<CategoryKey>('All');

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  const filteredTasks = useMemo<Task[]>(() => {
    const list = activeFilter === 'All' ? tasks : tasks.filter((t) => t.category === activeFilter);
    return [...list].sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  }, [tasks, activeFilter]);

  const taskCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = { All: tasks.filter((t) => !t.isCompleted).length };
    tasks.forEach((t) => {
      if (!t.isCompleted) counts[t.category] = (counts[t.category] ?? 0) + 1;
    });
    return counts;
  }, [tasks]);

  const filterTasks = useMemo(
    () => (activeFilter === 'All' ? tasks : tasks.filter((t) => t.category === activeFilter)),
    [tasks, activeFilter]
  );
  const completedCount = filterTasks.filter((t) => t.isCompleted).length;
  const hasCompleted = tasks.some((t) => t.isCompleted);

  const colors = {
    bg: isDark ? '#0d0d1a' : '#f5f4ff',
    header: isDark ? '#0d0d1a' : '#f5f4ff',
    text: isDark ? '#ffffff' : '#1a1a2e',
    sub: isDark ? '#888' : '#888',
  };

  const renderItem = useCallback(
    ({ item, index }: { item: Task; index: number }) => (
      <TaskCard
        key={item.id}
        task={item}
        onToggle={() => toggleTask(item.id)}
        onDelete={() => deleteTask(item.id)}
        isDark={isDark}
        index={index}
      />
    ),
    [isDark, toggleTask, deleteTask]
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />

      <View style={[styles.topHeader, { backgroundColor: colors.header }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.sub }]}>My Tasks</Text>
          <Text style={[styles.appTitle, { color: colors.text }]}>To-Do <Text style={styles.accent}>Pro</Text></Text>
        </View>
        {hasCompleted && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearCompleted}>
            <Ionicons name="trash-bin-outline" size={14} color="#ff6b6b" />
            <Text style={styles.clearBtnText}>Clear done</Text>
          </TouchableOpacity>
        )}
      </View>

      <CategoryFilter
        active={activeFilter}
        onSelect={setActiveFilter}
        isDark={isDark}
        taskCounts={taskCounts}
      />

      <HeaderStats
        total={filterTasks.length}
        completed={completedCount}
        filter={activeFilter}
        isDark={isDark}
      />

      {loading ? null : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={filteredTasks.length === 0 ? { flex: 1 } : { paddingBottom: 120 }}
          ListEmptyComponent={<EmptyState isDark={isDark} activeFilter={activeFilter} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.fabWrapper} pointerEvents="box-none">
        <FAB onPress={() => setModalVisible(true)} />
      </View>

      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={addTask}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 28 : 54 },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  greeting: { fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  appTitle: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  accent: { color: '#6C63FF' },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ff6b6b22',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ff6b6b44',
  },
  clearBtnText: { color: '#ff6b6b', fontSize: 12, fontWeight: '700' },
  fabWrapper: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    alignItems: 'flex-end',
  },
  fab: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
});
