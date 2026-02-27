"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  FileEdit,
  CalendarCheck,
  MessageSquare,
  FolderOpen,
  Search,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Avatar } from "@/components/ui";
import { useAppStore } from "@/hooks/use-store";
import { formatRelativeDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import {
  fetchCoachDashboard,
  fetchStudentRoster,
} from "@/lib/actions/coach";
import type {
  CoachMetrics,
  AttentionStudent,
  ActivityFeedItem,
  RosterStudent,
} from "@/lib/actions/coach";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const metricCards = [
  {
    key: "activeStudents" as const,
    label: "Active Students",
    icon: Users,
    accent: "bg-gold-500/15 text-gold-400",
  },
  {
    key: "essaysAwaitingReview" as const,
    label: "Essays Awaiting Review",
    icon: FileEdit,
    accent: "bg-emerald-500/15 text-emerald-500",
  },
  {
    key: "upcomingDeadlines" as const,
    label: "Upcoming Deadlines",
    icon: CalendarCheck,
    accent: "bg-gold-500/15 text-gold-400",
  },
  {
    key: "unreadMessages" as const,
    label: "Unread Messages",
    icon: MessageSquare,
    accent: "bg-emerald-500/15 text-emerald-500",
  },
];

const activityIcons = {
  essay: FileEdit,
  task: CalendarCheck,
  document: FolderOpen,
};

export function CoachDashboardClient() {
  const { profile } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<CoachMetrics>({
    activeStudents: 0,
    essaysAwaitingReview: 0,
    upcomingDeadlines: 0,
    unreadMessages: 0,
  });
  const [attentionStudents, setAttentionStudents] = useState<AttentionStudent[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityFeedItem[]>([]);
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    async function load() {
      const [dashResult, rosterResult] = await Promise.all([
        fetchCoachDashboard(),
        fetchStudentRoster(),
      ]);

      if (dashResult.data) {
        setMetrics(dashResult.data.metrics);
        setAttentionStudents(dashResult.data.attentionStudents);
        setRecentActivity(dashResult.data.recentActivity);
      }

      if (rosterResult.data) {
        setRoster(rosterResult.data);
      }

      setLoading(false);
    }

    load();
  }, []);

  const filteredRoster = useMemo(() => {
    return roster.filter((student) => {
      const matchesSearch =
        searchQuery === "" ||
        `${student.firstName} ${student.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || student.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [roster, searchQuery, statusFilter]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header skeleton */}
        <div>
          <div className="h-9 w-72 animate-pulse rounded-lg bg-navy-800/60" />
          <div className="mt-2 h-5 w-48 animate-pulse rounded-lg bg-navy-800/40" />
        </div>
        {/* Metrics skeleton */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-navy-700/50 bg-navy-900/80"
            />
          ))}
        </div>
        {/* Content skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-2xl border border-navy-700/50 bg-navy-900/80 lg:col-span-2" />
          <div className="h-64 animate-pulse rounded-2xl border border-navy-700/50 bg-navy-900/80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-display text-ivory-200">
          {getGreeting()}, {profile?.first_name ?? "Coach"}
        </h1>
        <p className="mt-1 font-sans text-body-lg text-ivory-600">{today}</p>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => (
          <div
            key={card.key}
            className="group rounded-2xl border border-navy-700/50 bg-navy-900/80 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-navy-600 hover:shadow-elevated"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-sans text-caption uppercase tracking-wider text-ivory-700">
                  {card.label}
                </p>
                <p className="mt-2 font-serif text-display text-ivory-200">
                  {metrics[card.key]}
                </p>
              </div>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.accent}`}
              >
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Attention + Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Students Needing Attention */}
        <div className="rounded-2xl border border-navy-700/50 bg-navy-900/80 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-navy-700/50 px-6 py-4">
            <h2 className="font-serif text-heading text-ivory-200">
              Needs Attention
            </h2>
            {attentionStudents.length > 0 && (
              <span className="rounded-full bg-burgundy-500/15 px-2.5 py-0.5 font-sans text-caption font-medium text-burgundy-400">
                {attentionStudents.length} student{attentionStudents.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="divide-y divide-navy-700/30">
            {attentionStudents.length === 0 ? (
              <div className="flex items-center justify-center px-6 py-12">
                <div className="text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500/60" />
                  <p className="mt-2 font-sans text-body-sm text-ivory-600">
                    All students are on track
                  </p>
                </div>
              </div>
            ) : (
              attentionStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-navy-800/50"
                >
                  <Avatar
                    name={`${student.firstName} ${student.lastName}`}
                    src={student.avatarUrl}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-body-sm font-medium text-ivory-200">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="mt-0.5 font-sans text-caption text-ivory-700">
                      {student.reason}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 font-sans text-caption font-medium",
                      student.urgency === "high"
                        ? "bg-burgundy-500/15 text-burgundy-400"
                        : "bg-gold-500/15 text-gold-400"
                    )}
                  >
                    {student.urgency === "high" ? (
                      <span className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Urgent
                      </span>
                    ) : (
                      "Review"
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="rounded-2xl border border-navy-700/50 bg-navy-900/80">
          <div className="border-b border-navy-700/50 px-6 py-4">
            <h2 className="font-serif text-heading text-ivory-200">
              Recent Activity
            </h2>
          </div>
          <div className="divide-y divide-navy-700/30">
            {recentActivity.length === 0 ? (
              <div className="flex items-center justify-center px-6 py-12">
                <p className="font-sans text-body-sm text-ivory-600">
                  No recent activity
                </p>
              </div>
            ) : (
              recentActivity.slice(0, 8).map((item) => {
                const Icon = activityIcons[item.type];
                return (
                  <div
                    key={item.id}
                    className="flex gap-3 px-6 py-3 transition-colors hover:bg-navy-800/50"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-800/80">
                      <Icon className="h-4 w-4 text-ivory-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-sans text-caption text-ivory-400">
                        <span className="font-medium text-ivory-200">
                          {item.studentName}
                        </span>{" "}
                        {item.description.replace(/^Updated |^Uploaded /, "").toLowerCase().startsWith("essay") ? "updated" : item.description.startsWith("Uploaded") ? "uploaded" : "updated"}{" "}
                        {item.type === "document"
                          ? item.description.replace("Uploaded ", "")
                          : item.description.replace(/^Updated /, "")}
                      </p>
                      <p className="mt-0.5 font-sans text-[0.6875rem] text-ivory-800">
                        {formatRelativeDate(item.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Student Roster */}
      <div className="rounded-2xl border border-navy-700/50 bg-navy-900/80">
        <div className="flex flex-col gap-4 border-b border-navy-700/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-serif text-heading text-ivory-200">
            Student Roster
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory-700" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-navy-700/50 bg-navy-900/60 py-2 pl-10 pr-4 font-sans text-body-sm text-ivory-300 transition-colors placeholder:text-ivory-800 focus:border-gold-500/50 focus:bg-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-500/20 sm:w-56"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-navy-700/50 bg-navy-900/60 px-3 py-2 font-sans text-body-sm text-ivory-300 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="onboarding">Onboarding</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <div className="p-6">
          {filteredRoster.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Users className="mx-auto h-8 w-8 text-ivory-800" />
                <p className="mt-2 font-sans text-body-sm text-ivory-600">
                  {roster.length === 0
                    ? "No students assigned yet"
                    : "No students match your search"}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredRoster.map((student) => (
                <Link
                  key={student.id}
                  href={`/coach/students/${student.id}`}
                  className="group rounded-xl border border-navy-700/30 bg-navy-800/50 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-navy-600 hover:shadow-elevated"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={`${student.firstName} ${student.lastName}`}
                      src={student.avatarUrl}
                      size="lg"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-sans text-body-sm font-medium text-ivory-200">
                        {student.firstName} {student.lastName}
                      </p>
                      <span className="inline-flex rounded-full bg-gold-500/10 px-2 py-0.5 font-sans text-[0.625rem] font-medium uppercase tracking-wider text-gold-400">
                        {student.applicationType.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="font-serif text-heading-sm text-ivory-200">
                        {student.schoolCount}
                      </p>
                      <p className="font-sans text-[0.625rem] uppercase tracking-wider text-ivory-700">
                        Schools
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-serif text-heading-sm text-ivory-200">
                        {student.essayCount}
                      </p>
                      <p className="font-sans text-[0.625rem] uppercase tracking-wider text-ivory-700">
                        Essays
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-serif text-heading-sm text-ivory-200">
                        {student.taskCompletionPct}%
                      </p>
                      <p className="font-sans text-[0.625rem] uppercase tracking-wider text-ivory-700">
                        Tasks
                      </p>
                    </div>
                  </div>
                  {/* Task completion bar */}
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-navy-700/50">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all duration-500"
                      style={{ width: `${student.taskCompletionPct}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
