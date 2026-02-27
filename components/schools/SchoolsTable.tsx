"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { StatusBadge } from "./StatusBadge";
import type { StudentSchoolWithRequirements } from "@/types/database";

interface SchoolsTableProps {
  schools: StudentSchoolWithRequirements[];
}

type SortKey = "school_name" | "deadline" | "status" | "progress";
type SortDir = "asc" | "desc" | null;

function getProgress(school: StudentSchoolWithRequirements): number {
  const total = school.school_requirements.length;
  if (total === 0) return 0;
  const completed = school.school_requirements.filter(
    (r) => r.is_completed
  ).length;
  return Math.round((completed / total) * 100);
}

function formatType(type: string): string {
  switch (type) {
    case "undergraduate":
      return "Undergraduate";
    case "law_school":
      return "Law School";
    case "transfer":
      return "Transfer";
    default:
      return type;
  }
}

export function SchoolsTable({ schools }: SchoolsTableProps) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(
        sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc"
      );
      if (sortDir === "desc") setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return schools;
    return [...schools].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "school_name":
          cmp = a.school_name.localeCompare(b.school_name);
          break;
        case "deadline":
          cmp = (a.deadline ?? "").localeCompare(b.deadline ?? "");
          break;
        case "progress":
          cmp = getProgress(a) - getProgress(b);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [schools, sortKey, sortDir]);

  if (schools.length === 0) return null;

  const SortButton = ({
    column,
    children,
  }: {
    column: SortKey;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={() => handleSort(column)}
      className="inline-flex items-center gap-1.5 transition-colors hover:text-ivory-300"
    >
      {children}
      {sortKey === column && sortDir === "asc" ? (
        <ArrowUp className="h-3 w-3 text-gold-400" />
      ) : sortKey === column && sortDir === "desc" ? (
        <ArrowDown className="h-3 w-3 text-gold-400" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-40" />
      )}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-navy-700/50 bg-navy-900/80">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-navy-700/50">
              <th className="px-5 py-3.5 text-left font-sans text-caption font-semibold uppercase tracking-wider text-ivory-700">
                <SortButton column="school_name">School</SortButton>
              </th>
              <th className="px-5 py-3.5 text-left font-sans text-caption font-semibold uppercase tracking-wider text-ivory-700">
                <SortButton column="status">Status</SortButton>
              </th>
              <th className="px-5 py-3.5 text-left font-sans text-caption font-semibold uppercase tracking-wider text-ivory-700">
                Type
              </th>
              <th className="px-5 py-3.5 text-left font-sans text-caption font-semibold uppercase tracking-wider text-ivory-700">
                <SortButton column="deadline">Deadline</SortButton>
              </th>
              <th className="px-5 py-3.5 text-left font-sans text-caption font-semibold uppercase tracking-wider text-ivory-700">
                <SortButton column="progress">Progress</SortButton>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-700/30">
            {sorted.map((school) => {
              const progress = getProgress(school);
              const deadline = school.deadline
                ? new Date(
                    school.deadline + "T00:00:00"
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—";

              return (
                <tr
                  key={school.id}
                  onClick={() =>
                    router.push(`/student/schools/${school.id}`)
                  }
                  className="cursor-pointer transition-colors hover:bg-navy-800/50"
                >
                  <td className="px-5 py-4 font-serif text-body-sm font-medium text-ivory-200">
                    {school.school_name}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={school.status} size="sm" />
                  </td>
                  <td className="px-5 py-4 font-sans text-caption text-ivory-600">
                    {formatType(school.application_type)}
                  </td>
                  <td className="px-5 py-4 font-sans text-caption text-ivory-600">
                    {deadline}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-navy-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="font-sans text-caption font-medium text-gold-400">
                        {progress}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
