"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  CalendarCheck,
  CheckCircle2,
  FileEdit,
  ArrowUpRight,
  Sparkles,
  Target,
  MessageSquare,
} from "lucide-react";
import {
  fetchStudentDashboard,
  type StudentDashboardData,
} from "@/lib/actions/student-dashboard";

function StatSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-navy-700/50 bg-navy-900/80 p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="h-3 w-16 rounded bg-navy-700" />
          <div className="h-8 w-10 rounded bg-navy-700" />
          <div className="h-3 w-24 rounded bg-navy-700" />
        </div>
        <div className="h-10 w-10 rounded-xl bg-navy-700" />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded bg-navy-700" />
        <div className="h-4 w-72 animate-pulse rounded bg-navy-700" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="animate-pulse rounded-2xl border border-navy-700/50 bg-navy-900/80 lg:col-span-2">
          <div className="border-b border-navy-700/50 px-6 py-4">
            <div className="h-5 w-40 rounded bg-navy-700" />
          </div>
          <div className="space-y-4 p-6">
            <div className="h-12 rounded bg-navy-700" />
            <div className="h-12 rounded bg-navy-700" />
            <div className="h-12 rounded bg-navy-700" />
          </div>
        </div>
        <div className="animate-pulse rounded-2xl border border-navy-700/50 bg-navy-900/80">
          <div className="border-b border-navy-700/50 px-6 py-4">
            <div className="h-5 w-28 rounded bg-navy-700" />
          </div>
          <div className="space-y-3 p-4">
            <div className="h-12 rounded bg-navy-700" />
            <div className="h-12 rounded bg-navy-700" />
            <div className="h-12 rounded bg-navy-700" />
            <div className="h-12 rounded bg-navy-700" />
          </div>
        </div>
      </div>
    </div>
  );
}

const quickActions = [
  { label: "Add a school", icon: GraduationCap, href: "/student/schools" },
  { label: "Start an essay", icon: FileEdit, href: "/student/essays" },
  { label: "View deadlines", icon: CalendarCheck, href: "/student/tasks" },
  { label: "Ask AI assistant", icon: Sparkles, href: "/student/ai-tools" },
];

export default function StudentDashboardPage() {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await fetchStudentDashboard();
      if (result.data) setData(result.data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !data) {
    return <DashboardSkeleton />;
  }

  const taskPct =
    data.taskStats.total > 0
      ? Math.round((data.taskStats.completed / data.taskStats.total) * 100)
      : 0;

  const progressPct =
    data.essayStats.total > 0
      ? Math.round((data.essayStats.drafted / data.essayStats.total) * 100)
      : 0;

  const stats = [
    {
      label: "Schools",
      value: data.schoolCount.toString(),
      subtitle:
        data.upcomingDeadlines.length > 0
          ? `Next deadline: ${new Date(data.upcomingDeadlines[0].deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
          : "No upcoming deadlines",
      icon: GraduationCap,
      accent: "bg-gold-500/15 text-gold-400",
    },
    {
      label: "Upcoming Deadlines",
      value: data.upcomingDeadlines.length.toString(),
      subtitle:
        data.upcomingDeadlines.length > 0
          ? `${data.upcomingDeadlines[0].daysLeft}d until next`
          : "All clear",
      icon: CalendarCheck,
      accent: "bg-emerald-500/15 text-emerald-500",
    },
    {
      label: "Tasks Completed",
      value: `${data.taskStats.completed}/${data.taskStats.total}`,
      subtitle: `${taskPct}% completion`,
      icon: CheckCircle2,
      accent: "bg-gold-500/15 text-gold-400",
    },
    {
      label: "Essays",
      value: `${data.essayStats.drafted}/${data.essayStats.total}`,
      subtitle: `${data.essayStats.drafted} drafted`,
      icon: FileEdit,
      accent: "bg-emerald-500/15 text-emerald-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-display text-ivory-200">
          Welcome back, {data.firstName}
        </h1>
        <p className="mt-1 font-sans text-body-lg text-ivory-600">
          {data.coachName
            ? `Your coach: ${data.coachName}`
            : "Here\u2019s an overview of your admissions journey."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-2xl border border-navy-700/50 bg-navy-900/80 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-navy-600 hover:shadow-elevated"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-sans text-caption uppercase tracking-wider text-ivory-700">
                  {stat.label}
                </p>
                <p className="mt-2 font-serif text-display text-ivory-200">
                  {stat.value}
                </p>
                <p className="mt-1 font-sans text-caption text-ivory-700">
                  {stat.subtitle}
                </p>
              </div>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.accent}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Deadlines */}
        <div className="rounded-2xl border border-navy-700/50 bg-navy-900/80 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-navy-700/50 px-6 py-4">
            <h2 className="font-serif text-heading text-ivory-200">
              Upcoming Deadlines
            </h2>
            <Link
              href="/student/tasks"
              className="flex items-center gap-1 font-sans text-caption font-medium text-gold-400 transition-colors hover:text-gold-300"
            >
              View all
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-navy-700/30">
            {data.upcomingDeadlines.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <CalendarCheck className="h-8 w-8 text-ivory-800" />
                <p className="mt-3 font-sans text-body-sm text-ivory-600">
                  No upcoming deadlines
                </p>
                <p className="mt-1 font-sans text-caption text-ivory-700">
                  Add schools with deadlines to see them here.
                </p>
              </div>
            ) : (
              data.upcomingDeadlines.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-navy-800/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10">
                      <Target className="h-5 w-5 text-gold-400" />
                    </div>
                    <div>
                      <p className="font-sans text-body-sm font-medium text-ivory-200">
                        {item.schoolName}
                      </p>
                      <p className="mt-0.5 font-sans text-caption text-ivory-700">
                        {item.status.replace(/_/g, " ")} &middot;{" "}
                        {new Date(item.deadline).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 font-sans text-caption font-medium ${
                      item.daysLeft <= 7
                        ? "bg-burgundy-500/15 text-burgundy-400"
                        : "bg-gold-500/15 text-gold-400"
                    }`}
                  >
                    {item.daysLeft}d left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-navy-700/50 bg-navy-900/80">
          <div className="border-b border-navy-700/50 px-6 py-4">
            <h2 className="font-serif text-heading text-ivory-200">
              Quick Actions
            </h2>
          </div>
          <div className="space-y-2 p-4">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex w-full items-center gap-3 rounded-xl border border-navy-700/30 bg-navy-800/50 px-4 py-3 text-left font-sans text-body-sm font-medium text-ivory-400 transition-all hover:border-gold-500/30 hover:bg-gold-500/10 hover:text-gold-400"
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </Link>
            ))}
            {data.coachName && (
              <Link
                href="/student/messages"
                className="flex w-full items-center gap-3 rounded-xl border border-navy-700/30 bg-navy-800/50 px-4 py-3 text-left font-sans text-body-sm font-medium text-ivory-400 transition-all hover:border-gold-500/30 hover:bg-gold-500/10 hover:text-gold-400"
              >
                <MessageSquare className="h-4 w-4" />
                Message your coach
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="rounded-2xl border border-navy-700/50 bg-navy-900/80 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-heading text-ivory-200">
              Application Progress
            </h2>
            <p className="mt-1 font-sans text-body-sm text-ivory-700">
              {data.essayStats.total > 0
                ? "Track your essay progress across all schools."
                : "Start adding essays to track your progress."}
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/15">
            <span className="font-serif text-heading-lg text-gold-400">
              {progressPct}%
            </span>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-navy-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-3 flex justify-between font-sans text-caption text-ivory-700">
          <span>
            {data.essayStats.drafted} of {data.essayStats.total} essays drafted
          </span>
          <span>
            {data.schoolCount} school{data.schoolCount !== 1 ? "s" : ""} on your
            list
          </span>
        </div>
      </div>
    </div>
  );
}
