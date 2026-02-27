"use client";

import {
  GraduationCap,
  FileEdit,
  CalendarCheck,
  FolderOpen,
  Trophy,
  MessageSquare,
  ArrowUpRight,
} from "lucide-react";
import { formatRelativeDate, formatDate } from "@/lib/utils/format";
import type { StudentDetailData } from "@/lib/actions/coach";

interface Props {
  detail: StudentDetailData;
  onTabChange: (tab: string) => void;
}

const statusColors: Record<string, string> = {
  researching: "text-ivory-500",
  applying: "text-gold-400",
  submitted: "text-blue-400",
  accepted: "text-emerald-400",
  waitlisted: "text-amber-400",
  rejected: "text-burgundy-400",
  enrolled: "text-emerald-500",
};

const activityIcons = {
  essay: FileEdit,
  task: CalendarCheck,
  document: FolderOpen,
};

export function OverviewTab({ detail, onTabChange }: Props) {
  const { profile, studentProfile, schoolSummary, essayStats, taskStats, recentActivity } =
    detail;

  const taskPct =
    taskStats.total > 0
      ? Math.round((taskStats.completed / taskStats.total) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Profile & Stats Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="rounded-2xl border border-navy-700/50 bg-navy-900/80 p-6 lg:col-span-2">
          <h3 className="font-serif text-heading-sm text-ivory-200">
            Student Profile
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <InfoRow label="Email" value={profile.email} />
            <InfoRow
              label="Application Type"
              value={studentProfile.applicationType.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            />
            <InfoRow label="Target Cycle" value={studentProfile.targetCycle} />
            <InfoRow
              label="Current School"
              value={studentProfile.currentSchool ?? "—"}
            />
            <InfoRow
              label="GPA"
              value={studentProfile.currentGpa?.toFixed(2) ?? "—"}
            />
            <InfoRow
              label="Intended Major"
              value={studentProfile.intendedMajor ?? "—"}
            />
            {studentProfile.satScore && (
              <InfoRow label="SAT Score" value={String(studentProfile.satScore)} />
            )}
            {studentProfile.actScore && (
              <InfoRow label="ACT Score" value={String(studentProfile.actScore)} />
            )}
            {studentProfile.lsatScore && (
              <InfoRow label="LSAT Score" value={String(studentProfile.lsatScore)} />
            )}
          </div>
        </div>

        {/* Progress Card */}
        <div className="rounded-2xl border border-navy-700/50 bg-navy-900/80 p-6">
          <h3 className="font-serif text-heading-sm text-ivory-200">
            Overall Progress
          </h3>
          <div className="mt-6 flex flex-col items-center">
            {/* Progress Ring */}
            <div className="relative h-28 w-28">
              <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-navy-800"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${taskPct * 2.51} 251`}
                  className="text-gold-400 transition-all duration-700"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-serif text-heading-lg text-gold-400">
                {taskPct}%
              </span>
            </div>
            <p className="mt-3 font-sans text-caption text-ivory-700">
              {taskStats.completed} of {taskStats.total} tasks completed
            </p>
            {taskStats.overdue > 0 && (
              <p className="mt-1 font-sans text-caption text-burgundy-400">
                {taskStats.overdue} overdue
              </p>
            )}
          </div>
          <div className="mt-4 space-y-2 border-t border-navy-700/30 pt-4">
            <div className="flex justify-between font-sans text-caption">
              <span className="text-ivory-700">Essays</span>
              <span className="text-ivory-400">{essayStats.total} total</span>
            </div>
            <div className="flex justify-between font-sans text-caption">
              <span className="text-ivory-700">Schools</span>
              <span className="text-ivory-400">
                {schoolSummary.length} total
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Schools + Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Schools Summary */}
        <div className="rounded-2xl border border-navy-700/50 bg-navy-900/80 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-navy-700/50 px-6 py-4">
            <h3 className="font-serif text-heading-sm text-ivory-200">
              Schools
            </h3>
            <button
              onClick={() => onTabChange("schools")}
              className="flex items-center gap-1 font-sans text-caption font-medium text-gold-400 transition-colors hover:text-gold-300"
            >
              View all
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          {schoolSummary.length === 0 ? (
            <div className="flex items-center justify-center px-6 py-8">
              <p className="font-sans text-body-sm text-ivory-600">
                No schools added yet
              </p>
            </div>
          ) : (
            <div className="divide-y divide-navy-700/30">
              {schoolSummary.slice(0, 5).map((school) => (
                <div
                  key={school.id}
                  className="flex items-center justify-between px-6 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500/10">
                      <GraduationCap className="h-4 w-4 text-gold-400" />
                    </div>
                    <div>
                      <p className="font-sans text-body-sm font-medium text-ivory-200">
                        {school.schoolName}
                      </p>
                      {school.deadline && (
                        <p className="font-sans text-[0.6875rem] text-ivory-700">
                          Deadline: {formatDate(school.deadline)}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`font-sans text-caption font-medium capitalize ${
                      statusColors[school.status] ?? "text-ivory-500"
                    }`}
                  >
                    {school.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-navy-700/50 bg-navy-900/80">
          <div className="border-b border-navy-700/50 px-6 py-4">
            <h3 className="font-serif text-heading-sm text-ivory-200">
              Recent Activity
            </h3>
          </div>
          {recentActivity.length === 0 ? (
            <div className="flex items-center justify-center px-6 py-8">
              <p className="font-sans text-body-sm text-ivory-600">
                No recent activity
              </p>
            </div>
          ) : (
            <div className="divide-y divide-navy-700/30">
              {recentActivity.map((item) => {
                const Icon = activityIcons[item.type];
                return (
                  <div key={item.id} className="flex gap-3 px-6 py-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy-800/80">
                      <Icon className="h-3.5 w-3.5 text-ivory-700" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-sans text-caption text-ivory-400">
                        {item.description}
                      </p>
                      <p className="font-sans text-[0.6875rem] text-ivory-800">
                        {formatRelativeDate(item.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="rounded-2xl border border-navy-700/50 bg-navy-900/80 p-6">
        <h3 className="font-serif text-heading-sm text-ivory-200">
          Quick Links
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { id: "schools", label: "Schools", icon: GraduationCap },
            { id: "essays", label: "Essays", icon: FileEdit },
            { id: "activities", label: "Activities", icon: Trophy },
            { id: "documents", label: "Documents", icon: FolderOpen },
            { id: "tasks", label: "Tasks", icon: CalendarCheck },
            { id: "messages", label: "Messages", icon: MessageSquare },
          ].map((link) => (
            <button
              key={link.id}
              onClick={() => onTabChange(link.id)}
              className="flex items-center gap-2 rounded-xl border border-navy-700/30 bg-navy-800/50 px-4 py-3 font-sans text-body-sm font-medium text-ivory-400 transition-all hover:border-gold-500/30 hover:bg-gold-500/10 hover:text-gold-400"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-sans text-caption uppercase tracking-wider text-ivory-700">
        {label}
      </p>
      <p className="mt-0.5 font-sans text-body-sm text-ivory-300">{value}</p>
    </div>
  );
}
