"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  GraduationCap,
  FileEdit,
  Trophy,
  CalendarCheck,
  FolderOpen,
  MessageSquare,
  Sparkles,
  UserCircle,
  LogOut,
  ChevronLeft,
  Users,
  Calendar,
  BookOpen,
  Settings,
  BarChart3,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAppStore } from "@/hooks/use-store";
import { useMessagesStore } from "@/hooks/use-messages-store";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface DashboardSidebarProps {
  role: "student" | "coach" | "admin";
}

const navItemsByRole: Record<string, NavItem[]> = {
  student: [
    { label: "Dashboard", href: "/student", icon: LayoutDashboard },
    { label: "My Schools", href: "/student/schools", icon: GraduationCap },
    { label: "Essays", href: "/student/essays", icon: FileEdit },
    { label: "Activities", href: "/student/activities", icon: Trophy },
    { label: "Tasks & Deadlines", href: "/student/tasks", icon: CalendarCheck },
    { label: "Documents", href: "/student/documents", icon: FolderOpen },
    { label: "Messages", href: "/student/messages", icon: MessageSquare },
    { label: "AI Tools", href: "/student/ai-tools", icon: Sparkles },
    { label: "My Profile", href: "/student/profile", icon: UserCircle },
  ],
  coach: [
    { label: "Dashboard", href: "/coach", icon: LayoutDashboard },
    { label: "My Students", href: "/coach/students", icon: Users },
    { label: "Messages", href: "/coach/messages", icon: MessageSquare },
    { label: "Calendar", href: "/coach/calendar", icon: Calendar },
    { label: "My Profile", href: "/coach/profile", icon: UserCircle },
  ],
  admin: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Students", href: "/admin/students", icon: Users },
    { label: "Coaches", href: "/admin/coaches", icon: GraduationCap },
    { label: "Assignments", href: "/admin/assignments", icon: UserPlus },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
};

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const { totalUnreadCount } = useMessagesStore();

  const navItems = useMemo(() => {
    const items = navItemsByRole[role] || [];
    return items.map((item) =>
      item.label === "Messages" && totalUnreadCount > 0
        ? { ...item, badge: totalUnreadCount }
        : item
    );
  }, [role, totalUnreadCount]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    window.location.href = "/auth/login";
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 260 : 72 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed left-0 top-0 z-20 flex h-screen flex-col bg-gradient-to-b from-navy-900 via-navy-900 to-navy-950"
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-navy-700/50 px-4">
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Link href="/" className="font-serif text-heading-sm text-gold-400">
                IvyAmbition
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={toggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ivory-600 transition-colors hover:bg-navy-800 hover:text-ivory-300"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              !sidebarOpen && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== `/${role}` && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 font-sans text-body-sm font-medium transition-all",
                isActive
                  ? "bg-gold-500/15 text-gold-400"
                  : "text-ivory-600 hover:bg-navy-800 hover:text-ivory-300"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-gold-400"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive ? "text-gold-400" : "text-ivory-700"
                )}
              />
              <AnimatePresence mode="wait">
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.badge && item.badge > 0 && sidebarOpen && (
                <span className="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gold-500 px-1.5 font-sans text-[0.625rem] font-bold text-navy-950">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
              {item.badge && item.badge > 0 && !sidebarOpen && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-gold-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-navy-700/50 px-3 py-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-sans text-body-sm font-medium text-ivory-700 transition-all hover:bg-navy-800 hover:text-burgundy-500"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
