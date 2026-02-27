"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, LogOut } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "./Avatar";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SidebarNavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export interface SidebarNavSection {
  title?: string;
  items: SidebarNavItem[];
}

export interface SidebarNavUser {
  name: string;
  email: string;
  avatar?: string | null;
  role?: string;
}

export interface SidebarNavProps {
  brand?: string;
  sections: SidebarNavSection[];
  user?: SidebarNavUser;
  onSignOut?: () => void;
  defaultCollapsed?: boolean;
  className?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function SidebarNav({
  brand = "IvyAmbition",
  sections,
  user,
  onSignOut,
  defaultCollapsed = false,
  className,
}: SidebarNavProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-ivory-400 bg-white transition-all duration-200",
        collapsed ? "w-[72px]" : "w-[260px]",
        className
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-ivory-400 px-4">
        {!collapsed && (
          <Link
            href="/"
            className="font-serif text-heading-sm text-navy-900 truncate"
          >
            {brand}
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-charcoal-400 transition-colors hover:bg-ivory-200 hover:text-charcoal-600",
            collapsed && "mx-auto"
          )}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Navigation sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section, sectionIdx) => (
          <div
            key={sectionIdx}
            className={cn(sectionIdx > 0 && "mt-6")}
          >
            {section.title && !collapsed && (
              <p className="mb-2 px-3 font-sans text-overline text-charcoal-400">
                {section.title}
              </p>
            )}
            {sectionIdx > 0 && collapsed && (
              <div className="mx-3 mb-3 border-t border-ivory-400" />
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 font-sans text-body-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-navy-900 text-white shadow-card"
                        : "text-charcoal-500 hover:bg-ivory-200 hover:text-charcoal-900",
                      collapsed && "justify-center"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gold-500" />
                    )}

                    <span className="shrink-0">{item.icon}</span>

                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <span
                            className={cn(
                              "flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 font-sans text-[0.625rem] font-semibold",
                              isActive
                                ? "bg-gold-500 text-navy-950"
                                : "bg-ivory-200 text-charcoal-600"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User profile & sign-out */}
      <div className="border-t border-ivory-400 p-3">
        {user && !collapsed && (
          <div className="mb-3 flex items-center gap-3 rounded-lg px-3 py-2">
            <Avatar name={user.name} src={user.avatar} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-sans text-body-sm font-medium text-charcoal-900">
                {user.name}
              </p>
              <p className="truncate font-sans text-caption text-charcoal-400">
                {user.role || user.email}
              </p>
            </div>
          </div>
        )}
        {onSignOut && (
          <button
            onClick={onSignOut}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-sans text-body-sm font-medium text-charcoal-500 transition-colors hover:bg-ivory-200 hover:text-burgundy-600",
              collapsed && "justify-center"
            )}
            title={collapsed ? "Sign out" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
