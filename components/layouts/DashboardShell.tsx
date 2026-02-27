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

  const desktopMargin = sidebarOpen ? 260 : 72;

  return (
    <div className="min-h-screen bg-charcoal-900">
      <DashboardSidebar role={role} />
      <div
        className="dashboard-content transition-[margin] duration-200 ease-out"
      >
        <DashboardHeader />
        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <style jsx>{`
        .dashboard-content {
          margin-left: 0;
        }
        @media (min-width: 1024px) {
          .dashboard-content {
            margin-left: ${desktopMargin}px;
          }
        }
      `}</style>
    </div>
  );
}
