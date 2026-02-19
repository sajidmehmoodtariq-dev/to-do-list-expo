import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useEffect, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

import { CATEGORIES, TASK_CATEGORIES } from '../constants/categories';
import { CategoryKey, Task } from '../types/task';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (draft: Omit<Task, 'id' | 'isCompleted' | 'notificationIds' | 'createdAt'>) => Promise<void>;
  isDark: boolean;
}

type PickerTarget = 'deadline' | 'reminderStart' | null;

const DEFAULT_INTERVAL = '10';

export default function AddTaskModal({ visible, onClose, onAdd, isDark }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Exclude<CategoryKey, 'All'>>('Personal');
  const [deadline, setDeadline] = useState<Date>(() => {
    const d = new Date();
    d.setHours(d.getHours() + 2, 0, 0, 0);
    return d;
  });
  const [reminderStart, setReminderStart] = useState<Date>(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 30, 0, 0);
    return d;
  });
  const [interval, setInterval] = useState(DEFAULT_INTERVAL);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const slideY = useSharedValue(600);
  const backdropOpacity = useSharedValue(0);
  const titleRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 280 });
      slideY.value = withSpring(0, { damping: 18, stiffness: 150 });
      setTimeout(() => titleRef.current?.focus(), 350);
    } else {
      backdropOpacity.value = withTiming(0, { duration: 220 });
      slideY.value = withTiming(600, { duration: 260 });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: slideY.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));

  const resetForm = () => {
    setTitle('');
    setCategory('Personal');
    const d = new Date();
    d.setHours(d.getHours() + 2, 0, 0, 0);
    setDeadline(d);
    const r = new Date();
    r.setHours(r.getHours() + 1, 30, 0, 0);
    setReminderStart(r);
    setInterval(DEFAULT_INTERVAL);
    setError('');
    setSaving(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    const iv = parseInt(interval, 10);
    if (isNaN(iv) || iv < 1) { setError('Interval must be ≥ 1 minute'); return; }
    if (reminderStart >= deadline) { setError('Reminder start must be before deadline'); return; }
    setError('');
    setSaving(true);
    await onAdd({
      title: title.trim(),
      category,
      deadline: deadline.toISOString(),
      reminderStart: reminderStart.toISOString(),
      reminderInterval: iv,
    });
    setSaving(false);
    handleClose();
  };

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setPickerTarget(null);
    if (!date) return;
    if (pickerTarget === 'deadline') setDeadline(date);
    else if (pickerTarget === 'reminderStart') setReminderStart(date);
  };

  // Android: use imperative API to avoid crash when DateTimePicker unmounts inside a Modal
  const openAndroidPicker = (target: PickerTarget, current: Date) => {
    DateTimePickerAndroid.open({
      value: current,
      minimumDate: new Date(),
      mode: 'date',
      onChange: (e, dateVal) => {
        if (e.type !== 'set' || !dateVal) return;
        DateTimePickerAndroid.open({
          value: dateVal,
          mode: 'time',
          is24Hour: false,
          onChange: (te, timeVal) => {
            if (te.type !== 'set' || !timeVal) return;
            if (target === 'deadline') setDeadline(timeVal);
            else setReminderStart(timeVal);
          },
        });
      },
    });
  };

  const colors = {
    bg: isDark ? '#12121e' : '#fff',
    surface: isDark ? '#1e1e2e' : '#f7f7fb',
    text: isDark ? '#f0f0f0' : '#1a1a2e',
    sub: isDark ? '#888' : '#888',
    border: isDark ? '#2a2a3e' : '#e5e5f0',
    input: isDark ? '#252535' : '#f0f0fb',
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View style={[styles.sheet, { backgroundColor: colors.bg }, sheetStyle]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>New Task</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={28} color={colors.sub} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Title input */}
            <Text style={[styles.label, { color: colors.sub }]}>TASK TITLE</Text>
            <TextInput
              ref={titleRef}
              style={[styles.input, { backgroundColor: colors.input, color: colors.text, borderColor: title ? '#6C63FF' : colors.border }]}
              placeholder="What needs to be done?"
              placeholderTextColor={colors.sub}
              value={title}
              onChangeText={(t) => { setTitle(t); setError(''); }}
              returnKeyType="next"
            />

            {/* Category selector */}
            <Text style={[styles.label, { color: colors.sub }]}>CATEGORY</Text>
            <View style={styles.catRow}>
              {TASK_CATEGORIES.map((cat) => {
                const cfg = CATEGORIES[cat];
                const selected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.catChip,
                      {
                        backgroundColor: selected ? cfg.bgColor : colors.surface,
                        borderColor: selected ? cfg.bgColor : colors.border,
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={cfg.icon as any} size={13} color={selected ? '#fff' : colors.sub} />
                    <Text style={[styles.catChipText, { color: selected ? '#fff' : colors.sub }]}>
                      {cfg.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Deadline row */}
            <Text style={[styles.label, { color: colors.sub }]}>DEADLINE</Text>
            <TouchableOpacity
              style={[styles.dateBtn, { backgroundColor: colors.input, borderColor: colors.border }]}
              onPress={() => Platform.OS === 'android' ? openAndroidPicker('deadline', deadline) : setPickerTarget('deadline')}
            >
              <Ionicons name="calendar-outline" size={16} color="#6C63FF" />
              <Text style={[styles.dateBtnText, { color: colors.text }]}>
                {deadline.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Ionicons name="chevron-forward" size={14} color={colors.sub} />
            </TouchableOpacity>

            {/* Reminder start */}
            <Text style={[styles.label, { color: colors.sub }]}>START REMINDING AT</Text>
            <TouchableOpacity
              style={[styles.dateBtn, { backgroundColor: colors.input, borderColor: colors.border }]}
              onPress={() => Platform.OS === 'android' ? openAndroidPicker('reminderStart', reminderStart) : setPickerTarget('reminderStart')}
            >
              <Ionicons name="notifications-outline" size={16} color="#FF9F43" />
              <Text style={[styles.dateBtnText, { color: colors.text }]}>
                {reminderStart.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Ionicons name="chevron-forward" size={14} color={colors.sub} />
            </TouchableOpacity>

            {/* Interval */}
            <Text style={[styles.label, { color: colors.sub }]}>NOTIFY EVERY (MINUTES)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.input, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. 10"
              placeholderTextColor={colors.sub}
              value={interval}
              onChangeText={setInterval}
              keyboardType="number-pad"
              returnKeyType="done"
            />

            {/* Error */}
            {!!error && (
              <View style={styles.errorRow}>
                <Ionicons name="warning-outline" size={14} color="#ff6b6b" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Save button */}
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <Text style={styles.saveBtnText}>Scheduling...</Text>
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={20} color="#fff" />
                  <Text style={styles.saveBtnText}>Add Task</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* iOS only: render inline picker inside the modal */}
      {Platform.OS === 'ios' && pickerTarget && (
        <DateTimePicker
          value={pickerTarget === 'deadline' ? deadline : reminderStart}
          mode="datetime"
          display="inline"
          onChange={onDateChange}
          minimumDate={new Date()}
          themeVariant={isDark ? 'dark' : 'light'}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '92%', paddingBottom: 34 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  headerTitle: { fontSize: 20, fontWeight: '800', letterSpacing: 0.3 },
  body: { paddingHorizontal: 20, paddingBottom: 20, gap: 6 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  catChipText: { fontSize: 12, fontWeight: '700' },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateBtnText: { flex: 1, fontSize: 14, fontWeight: '500' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  errorText: { color: '#ff6b6b', fontSize: 13 },
  saveBtn: {
    marginTop: 18,
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
