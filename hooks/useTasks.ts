import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Task } from '../types/task';
import { cancelTaskNotifications, scheduleTaskNotifications } from './useNotifications';

const STORAGE_KEY = '@todo_tasks_v2';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Load tasks from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setTasks(JSON.parse(raw));
      } catch (e) {
        console.warn('Failed to load tasks:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Persist tasks whenever they change
  const persist = useCallback(async (updated: Task[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save tasks:', e);
    }
  }, []);

  const addTask = useCallback(
    async (draft: Omit<Task, 'id' | 'isCompleted' | 'notificationIds' | 'createdAt'>) => {
      const notificationIds = await scheduleTaskNotifications(
        draft.title,
        draft.category,
        draft.deadline,
        draft.reminderStart,
        draft.reminderInterval
      );

      const newTask: Task = {
        ...draft,
        id: Date.now().toString(),
        isCompleted: false,
        notificationIds,
        createdAt: new Date().toISOString(),
      };

      setTasks((prev) => {
        const updated = [newTask, ...prev];
        persist(updated);
        return updated;
      });
    },
    [persist]
  );

  const toggleTask = useCallback(
    async (id: string) => {
      setTasks((prev) => {
        const updated = prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
        persist(updated);
        return updated;
      });
    },
    [persist]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (task?.notificationIds?.length) {
        await cancelTaskNotifications(task.notificationIds);
      }
      setTasks((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        persist(updated);
        return updated;
      });
    },
    [tasks, persist]
  );

  const clearCompleted = useCallback(async () => {
    const completed = tasks.filter((t) => t.isCompleted);
    await Promise.all(completed.map((t) => cancelTaskNotifications(t.notificationIds)));
    setTasks((prev) => {
      const updated = prev.filter((t) => !t.isCompleted);
      persist(updated);
      return updated;
    });
  }, [tasks, persist]);

  return { tasks, loading, addTask, toggleTask, deleteTask, clearCompleted };
}
