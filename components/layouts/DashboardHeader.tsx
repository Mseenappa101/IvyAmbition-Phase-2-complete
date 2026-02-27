"use client";

import { Bell, Search } from "lucide-react";
import { useAppStore } from "@/hooks/use-store";
import { formatInitials } from "@/lib/utils/format";

export function DashboardHeader() {
  const { profile, sidebarOpen } = useAppStore();

  return (
    <header
      className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-navy-700/30 bg-charcoal-900/95 px-6 backdrop-blur-sm transition-all"
      style={{ marginLeft: sidebarOpen ? 260 : 72 }}
    >
      {/* Search */}
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory-700" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-lg border border-navy-700/50 bg-navy-900/60 py-2 pl-10 pr-4 font-sans text-body-sm text-ivory-300 transition-colors placeholder:text-ivory-800 focus:border-gold-500/50 focus:bg-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-lg text-ivory-600 transition-colors hover:bg-navy-800 hover:text-ivory-300">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-gold-500 ring-2 ring-charcoal-900" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500/15 font-sans text-caption font-semibold text-gold-400 ring-1 ring-gold-500/30">
            {profile ? formatInitials(`${profile.first_name} ${profile.last_name}`) : "IA"}
          </div>
          <div className="hidden sm:block">
            <p className="font-sans text-body-sm font-medium text-ivory-300">
              {profile ? `${profile.first_name} ${profile.last_name}` : "User"}
            </p>
            <p className="font-sans text-caption text-ivory-700">
              {profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Student"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
