"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  MessageSquare,
  FileEdit,
  CalendarCheck,
  UserPlus,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  useNotificationsStore,
  type NotificationItem,
} from "@/hooks/use-notifications-store";
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/actions/notifications";
import type { NotificationType } from "@/types/database";

const typeIcons: Record<NotificationType, React.ElementType> = {
  message: MessageSquare,
  feedback: FileEdit,
  deadline: CalendarCheck,
  assignment: UserPlus,
  system: Bell,
};

const typeColors: Record<NotificationType, string> = {
  message: "text-blue-400",
  feedback: "text-gold-400",
  deadline: "text-amber-400",
  assignment: "text-emerald-400",
  system: "text-ivory-500",
};

function timeAgo(date: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

function groupNotifications(
  notifications: NotificationItem[]
): { label: string; items: NotificationItem[] }[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekStart = new Date(todayStart.getTime() - 6 * 86400000);

  const today: NotificationItem[] = [];
  const yesterday: NotificationItem[] = [];
  const thisWeek: NotificationItem[] = [];
  const earlier: NotificationItem[] = [];

  notifications.forEach((n) => {
    const d = new Date(n.created_at);
    if (d >= todayStart) today.push(n);
    else if (d >= yesterdayStart) yesterday.push(n);
    else if (d >= weekStart) thisWeek.push(n);
    else earlier.push(n);
  });

  const groups: { label: string; items: NotificationItem[] }[] = [];
  if (today.length > 0) groups.push({ label: "Today", items: today });
  if (yesterday.length > 0)
    groups.push({ label: "Yesterday", items: yesterday });
  if (thisWeek.length > 0)
    groups.push({ label: "This Week", items: thisWeek });
  if (earlier.length > 0) groups.push({ label: "Earlier", items: earlier });
  return groups;
}

export function NotificationBell() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    isOpen,
    toggleOpen,
    setOpen,
    setNotifications,
    setUnreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotificationsStore();

  // Load notifications on mount
  useEffect(() => {
    async function load() {
      const [notifRes, countRes] = await Promise.all([
        fetchNotifications(),
        fetchUnreadNotificationCount(),
      ]);
      if (notifRes.data) setNotifications(notifRes.data);
      setUnreadCount(countRes.count);
    }
    load();
  }, [setNotifications, setUnreadCount]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [isOpen, setOpen]);

  const handleNotificationClick = async (n: NotificationItem) => {
    if (!n.read) {
      markAsRead(n.id);
      await markNotificationAsRead(n.id);
    }
    setOpen(false);
    if (n.related_url) {
      router.push(n.related_url);
    }
  };

  const handleMarkAllRead = async () => {
    markAllAsRead();
    await markAllNotificationsAsRead();
  };

  const groups = groupNotifications(notifications);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={toggleOpen}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-ivory-600 transition-colors hover:bg-navy-800 hover:text-ivory-300"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gold-500 px-1 font-sans text-[0.625rem] font-bold text-navy-950">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-96 overflow-hidden rounded-2xl border border-navy-700/50 bg-navy-900 shadow-modal">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-navy-700/30 px-4 py-3">
            <h3 className="font-serif text-heading-sm text-ivory-200">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 font-sans text-caption font-medium text-gold-400 transition-colors hover:text-gold-300"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                <Bell className="h-8 w-8 text-ivory-800" />
                <p className="mt-3 font-sans text-body-sm text-ivory-600">
                  No notifications yet
                </p>
                <p className="mt-1 font-sans text-caption text-ivory-700">
                  You&apos;ll be notified about messages, feedback, and
                  deadlines.
                </p>
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.label}>
                  <div className="sticky top-0 bg-navy-900/95 px-4 py-2 backdrop-blur-sm">
                    <p className="font-sans text-caption font-semibold uppercase tracking-wider text-ivory-700">
                      {group.label}
                    </p>
                  </div>
                  {group.items.map((n) => {
                    const Icon = typeIcons[n.type] ?? Bell;
                    return (
                      <button
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={cn(
                          "flex w-full items-start gap-3 border-l-2 px-4 py-3 text-left transition-colors hover:bg-navy-800/60",
                          n.read
                            ? "border-transparent"
                            : "border-gold-400 bg-gold-500/5"
                        )}
                      >
                        <div
                          className={cn(
                            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-800",
                            typeColors[n.type]
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "truncate font-sans text-body-sm",
                              n.read
                                ? "text-ivory-400"
                                : "font-medium text-ivory-200"
                            )}
                          >
                            {n.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 font-sans text-caption text-ivory-600">
                            {n.body}
                          </p>
                          <p className="mt-1 font-sans text-[0.625rem] text-ivory-700">
                            {timeAgo(n.created_at)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
