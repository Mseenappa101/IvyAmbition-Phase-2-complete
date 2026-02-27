import { create } from "zustand";
import type { NotificationType } from "@/types/database";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  related_url: string | null;
  read: boolean;
  created_at: string;
}

interface NotificationsState {
  notifications: NotificationItem[];
  unreadCount: number;
  isOpen: boolean;
  isLoading: boolean;

  setNotifications: (notifications: NotificationItem[]) => void;
  setUnreadCount: (count: number) => void;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  setLoading: (loading: boolean) => void;

  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: NotificationItem) => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isOpen: false,
  isLoading: true,

  setNotifications: (notifications) =>
    set({ notifications, isLoading: false }),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  setOpen: (isOpen) => set({ isOpen }),
  toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),
  setLoading: (isLoading) => set({ isLoading }),

  markAsRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(
        0,
        s.unreadCount - (s.notifications.find((n) => n.id === id && !n.read) ? 1 : 0)
      ),
    })),

  markAllAsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  addNotification: (notification) =>
    set((s) => ({
      notifications: [notification, ...s.notifications],
      unreadCount: s.unreadCount + (notification.read ? 0 : 1),
    })),
}));
