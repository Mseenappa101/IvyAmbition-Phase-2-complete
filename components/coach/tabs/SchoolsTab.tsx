"use client";

import { useEffect, useState } from "react";
import {
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Check,
  Circle,
} from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { brandToast } from "@/components/ui";
import {
  fetchStudentSchoolsForCoach,
  updateRequirementForCoach,
} from "@/lib/actions/coach";

interface Props {
  studentId: string;
}

const statusColors: Record<string, string> = {
  researching: "bg-ivory-700/15 text-ivory-500",
  applying: "bg-gold-500/15 text-gold-400",
  submitted: "bg-blue-500/15 text-blue-400",
  accepted: "bg-emerald-500/15 text-emerald-400",
  waitlisted: "bg-amber-500/15 text-amber-400",
  rejected: "bg-burgundy-500/15 text-burgundy-400",
  enrolled: "bg-emerald-500/15 text-emerald-500",
};

interface SchoolData {
  id: string;
  school_name: string;
  status: string;
  deadline: string | null;
  application_type: string;
  school_requirements: RequirementData[];
}

interface RequirementData {
  id: string;
  requirement_type: string;
  label: string;
  is_completed: boolean;
  due_date: string | null;
  sort_order: number;
}

export function SchoolsTab({ studentId }: Props) {
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await fetchStudentSchoolsForCoach(studentId);
      if (error) {
        brandToast.error(error);
      } else if (data) {
        setSchools(data as unknown as SchoolData[]);
      }
      setLoading(false);
    }
    load();
  }, [studentId]);

  const toggleRequirement = async (
    schoolIdx: number,
    reqIdx: number,
    reqId: string,
    currentValue: boolean
  ) => {
    // Optimistic update
    setSchools((prev) => {
      const next = [...prev];
      const school = { ...next[schoolIdx] };
      school.school_requirements = [...school.school_requirements];
      school.school_requirements[reqIdx] = {
        ...school.school_requirements[reqIdx],
        is_completed: !currentValue,
      };
      next[schoolIdx] = school;
      return next;
    });

    const { error } = await updateRequirementForCoach(reqId, {
      is_completed: !currentValue,
    });

    if (error) {
      brandToast.error("Failed to update requirement");
      // Revert
      setSchools((prev) => {
        const next = [...prev];
        const school = { ...next[schoolIdx] };
        school.school_requirements = [...school.school_requirements];
        school.school_requirements[reqIdx] = {
          ...school.school_requirements[reqIdx],
          is_completed: currentValue,
        };
        next[schoolIdx] = school;
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-2xl border border-navy-700/50 bg-navy-900/80"
          />
        ))}
      </div>
    );
  }

  if (schools.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-navy-700/50 bg-navy-900/80 py-16">
        <div className="text-center">
          <GraduationCap className="mx-auto h-8 w-8 text-ivory-800" />
          <p className="mt-2 font-sans text-body-sm text-ivory-600">
            No schools added yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {schools.map((school, schoolIdx) => {
        const isExpanded = expandedId === school.id;
        const reqs = school.school_requirements
          ? [...school.school_requirements].sort(
              (a, b) => a.sort_order - b.sort_order
            )
          : [];
        const completedCount = reqs.filter((r) => r.is_completed).length;
        const progress =
          reqs.length > 0
            ? Math.round((completedCount / reqs.length) * 100)
            : 0;

        return (
          <div
            key={school.id}
            className="rounded-2xl border border-navy-700/50 bg-navy-900/80 transition-all"
          >
            {/* School Header - clickable */}
            <button
              onClick={() =>
                setExpandedId(isExpanded ? null : school.id)
              }
              className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-navy-800/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-500/10">
                <GraduationCap className="h-5 w-5 text-gold-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-sans text-body-sm font-medium text-ivory-200">
                  {school.school_name}
                </p>
                <p className="mt-0.5 font-sans text-caption text-ivory-700">
                  {school.deadline
                    ? `Deadline: ${formatDate(school.deadline)}`
                    : "No deadline set"}{" "}
                  &middot; {completedCount}/{reqs.length} requirements
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-0.5 font-sans text-caption font-medium capitalize",
                  statusColors[school.status] ?? statusColors.researching
                )}
              >
                {school.status.replace("_", " ")}
              </span>
              {/* Progress mini bar */}
              <div className="hidden w-20 sm:block">
                <div className="h-1.5 overflow-hidden rounded-full bg-navy-700/50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-ivory-600" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-ivory-600" />
              )}
            </button>

            {/* Requirements List - expandable */}
            {isExpanded && (
              <div className="border-t border-navy-700/30 px-6 py-4">
                <p className="mb-3 font-sans text-caption font-medium uppercase tracking-wider text-ivory-700">
                  Requirements ({completedCount}/{reqs.length} complete)
                </p>
                {reqs.length === 0 ? (
                  <p className="font-sans text-body-sm text-ivory-600">
                    No requirements added
                  </p>
                ) : (
                  <div className="space-y-2">
                    {reqs.map((req, reqIdx) => (
                      <div
                        key={req.id}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-navy-800/50"
                      >
                        <button
                          onClick={() =>
                            toggleRequirement(
                              schoolIdx,
                              reqIdx,
                              req.id,
                              req.is_completed
                            )
                          }
                          className="shrink-0"
                        >
                          {req.is_completed ? (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                              <Check className="h-3 w-3" />
                            </div>
                          ) : (
                            <Circle className="h-5 w-5 text-ivory-700" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "font-sans text-body-sm",
                              req.is_completed
                                ? "text-ivory-600 line-through"
                                : "text-ivory-300"
                            )}
                          >
                            {req.label}
                          </p>
                          {req.due_date && (
                            <p className="font-sans text-[0.6875rem] text-ivory-800">
                              Due: {formatDate(req.due_date)}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 rounded-full bg-navy-800 px-2 py-0.5 font-sans text-[0.625rem] uppercase tracking-wider text-ivory-600">
                          {req.requirement_type.replace("_", " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
