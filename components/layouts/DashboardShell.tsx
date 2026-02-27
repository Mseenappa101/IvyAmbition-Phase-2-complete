"use client";

import { useAppStore } from "@/hooks/use-store";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";

interface DashboardShellProps {
  role: "student" | "coach" | "admin";
  children: React.ReactNode;
}

export function DashboardShell({ role, children }: DashboardShellProps) {
  const { sidebarOpen } = useAppStore();

  return (
    <div className="min-h-screen bg-charcoal-900">
      <DashboardSidebar role={role} />
      <DashboardHeader />
      <main
        className="min-h-[calc(100vh-4rem)] p-6 transition-all lg:p-8"
        style={{ marginLeft: sidebarOpen ? 260 : 72 }}
      >
        {children}
      </main>
    </div>
  );
}
