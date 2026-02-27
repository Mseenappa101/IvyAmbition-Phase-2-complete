"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Users, Search } from "lucide-react";
import { Avatar } from "@/components/ui";
import { fetchStudentRoster } from "@/lib/actions/coach";
import type { RosterStudent } from "@/lib/actions/coach";

export default function CoachStudentsPage() {
  const [loading, setLoading] = useState(true);
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function load() {
      const { data } = await fetchStudentRoster();
      if (data) setRoster(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return roster.filter((s) => {
      const matchesSearch =
        searchQuery === "" ||
        `${s.firstName} ${s.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [roster, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-display text-ivory-200">My Students</h1>
        <p className="mt-1 font-sans text-body-lg text-ivory-600">
          Manage and track your assigned students.
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory-700" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-navy-700/50 bg-navy-900/60 py-2 pl-10 pr-4 font-sans text-body-sm text-ivory-300 placeholder:text-ivory-800 focus:border-gold-500/50 focus:bg-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-navy-700/50 bg-navy-900/60 px-3 py-2 font-sans text-body-sm text-ivory-300 focus:border-gold-500/50 focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="onboarding">Onboarding</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Students Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl border border-navy-700/50 bg-navy-900/80"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl border border-navy-700/50 bg-navy-900/80 py-20">
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
          {filtered.map((student) => (
            <Link
              key={student.id}
              href={`/coach/students/${student.id}`}
              className="group rounded-2xl border border-navy-700/50 bg-navy-900/80 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-navy-600 hover:shadow-elevated"
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
              <p className="mt-2 font-sans text-caption text-ivory-700">
                {student.targetCycle} &middot;{" "}
                <span className="capitalize">{student.status}</span>
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
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
  );
}
