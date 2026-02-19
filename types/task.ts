export interface Task {
  id: string;
  title: string;
  category: string;
  deadline: string; // ISO string for serialisation
  reminderStart: string; // ISO string
  reminderInterval: number; // minutes
  isCompleted: boolean;
  notificationIds: string[]; // scheduled expo notification ids
  createdAt: string;
}

export type CategoryKey = 'All' | 'Work' | 'Personal' | 'Urgent' | 'Shopping' | 'Health';
