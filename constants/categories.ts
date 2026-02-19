import { CategoryKey } from '../types/task';

export interface CategoryConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

export const CATEGORIES: Record<CategoryKey, CategoryConfig> = {
  All: {
    label: 'All',
    color: '#ffffff',
    bgColor: '#6C63FF',
    icon: 'apps',
  },
  Work: {
    label: 'Work',
    color: '#ffffff',
    bgColor: '#FF6B6B',
    icon: 'briefcase',
  },
  Personal: {
    label: 'Personal',
    color: '#ffffff',
    bgColor: '#4ECDC4',
    icon: 'person',
  },
  Urgent: {
    label: 'Urgent',
    color: '#ffffff',
    bgColor: '#FF9F43',
    icon: 'alert-circle',
  },
  Shopping: {
    label: 'Shopping',
    color: '#ffffff',
    bgColor: '#A29BFE',
    icon: 'cart',
  },
  Health: {
    label: 'Health',
    color: '#ffffff',
    bgColor: '#55EFC4',
    icon: 'heart',
  },
};

export const CATEGORY_KEYS: CategoryKey[] = ['All', 'Work', 'Personal', 'Urgent', 'Shopping', 'Health'];
export const TASK_CATEGORIES: Exclude<CategoryKey, 'All'>[] = ['Work', 'Personal', 'Urgent', 'Shopping', 'Health'];
