// expo-notifications: the "Push notifications removed from Expo Go" message is
// an unavoidable Expo Go SDK 53 warning for remote push tokens.
// Local scheduled notifications still work fine in Expo Go.
// It is NOT a crash — ignore the warning and use a normal static import.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

let handlerSet = false;
function ensureHandler() {
  if (handlerSet) return;
  handlerSet = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  ensureHandler();
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleTaskNotifications(
  title: string,
  category: string,
  deadlineIso: string,
  reminderStartIso: string,
  intervalMinutes: number
): Promise<string[]> {
  ensureHandler();
  const ids: string[] = [];
  const start = new Date(reminderStartIso).getTime();
  const deadline = new Date(deadlineIso).getTime();
  const intervalMs = intervalMinutes * 60 * 1000;
  const now = Date.now();

  let current = start;
  while (current <= deadline) {
    if (current > now) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ Reminder: ${title}`,
          body:
            current === deadline
              ? `🚨 Deadline reached for [${category}] task!`
              : `⚡ [${category}] task due ${formatRelative(deadline - current)}`,
          sound: true,
          data: { taskTitle: title, category },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(current),
        },
      });
      ids.push(id);
    }
    current += intervalMs;
  }

  return ids;
}

export async function cancelTaskNotifications(ids: string[]): Promise<void> {
  if (!ids.length) return;
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}

function formatRelative(ms: number): string {
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `in ${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `in ${hrs}h ${rem}m` : `in ${hrs}h`;
}
