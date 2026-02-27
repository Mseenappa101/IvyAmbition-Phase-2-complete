"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarCheck,
  Trash2,
} from "lucide-react";
import { Button, brandToast } from "@/components/ui";
import { StatusBadge, ALL_STATUSES, getStatusLabel } from "./StatusBadge";
import { RequirementsChecklist } from "./RequirementsChecklist";
import { useSchoolsStore } from "@/hooks/use-schools-store";
import {
  fetchStudentSchool,
  updateStudentSchool,
  deleteStudentSchool,
} from "@/lib/actions/schools";
import type {
  SchoolApplicationStatus,
  StudentSchoolWithRequirements,
} from "@/types/database";

interface SchoolDetailClientProps {
  schoolId: string;
}

export function SchoolDetailClient({ schoolId }: SchoolDetailClientProps) {
  const router = useRouter();
  const { schools, updateSchool, removeSchool } = useSchoolsStore();

  const [school, setSchool] = useState<StudentSchoolWithRequirements | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState(false);
  const [deadlineValue, setDeadlineValue] = useState("");

  useEffect(() => {
    // First, check if school is already in store
    const cached = schools.find((s) => s.id === schoolId);
    if (cached) {
      setSchool(cached);
      setDeadlineValue(cached.deadline ?? "");
      setLoading(false);
      return;
    }

    // Otherwise, fetch from server
    async function load() {
      const { data, error } = await fetchStudentSchool(schoolId);
      if (error || !data) {
        brandToast.error("Not found", "School not found.");
        router.push("/student/schools");
        return;
      }
      setSchool(data as StudentSchoolWithRequirements);
      setDeadlineValue(data.deadline ?? "");
      setLoading(false);
    }
    load();
  }, [schoolId, schools, router]);

  // Keep school in sync with store changes (e.g., requirement toggles)
  useEffect(() => {
    const updated = schools.find((s) => s.id === schoolId);
    if (updated) setSchool(updated);
  }, [schools, schoolId]);

  const handleStatusChange = async (newStatus: SchoolApplicationStatus) => {
    if (!school) return;
    updateSchool(school.id, { status: newStatus });
    setSchool((prev) => (prev ? { ...prev, status: newStatus } : prev));
    const { error } = await updateStudentSchool(school.id, {
      status: newStatus,
    });
    if (error) {
      brandToast.error("Update failed", "Could not update status.");
    }
  };

  const handleDeadlineSave = async () => {
    if (!school) return;
    const newDeadline = deadlineValue || null;
    updateSchool(school.id, { deadline: newDeadline });
    setSchool((prev) =>
      prev ? { ...prev, deadline: newDeadline } : prev
    );
    setEditingDeadline(false);
    const { error } = await updateStudentSchool(school.id, {
      deadline: newDeadline,
    });
    if (error) {
      brandToast.error("Update failed", "Could not update deadline.");
    }
  };

  const handleDelete = async () => {
    if (!school) return;
    if (!confirm(`Remove ${school.school_name} from your list?`)) return;
    setDeleting(true);
    const { error } = await deleteStudentSchool(school.id);
    if (error) {
      brandToast.error("Delete failed", "Could not remove school.");
      setDeleting(false);
      return;
    }
    removeSchool(school.id);
    brandToast.success("Removed", `${school.school_name} has been removed.`);
    router.push("/student/schools");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 animate-pulse rounded bg-navy-800/60" />
        <div className="h-10 w-64 animate-pulse rounded-lg bg-navy-800/60" />
        <div className="h-48 animate-pulse rounded-2xl bg-navy-900/40" />
      </div>
    );
  }

  if (!school) return null;

  const deadlineStr = school.deadline
    ? new Date(school.deadline + "T00:00:00").toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const completed = school.school_requirements.filter(
    (r) => r.is_completed
  ).length;
  const total = school.school_requirements.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        type="button"
        onClick={() => router.push("/student/schools")}
        className="flex items-center gap-1.5 font-sans text-caption font-medium text-ivory-600 transition-colors hover:text-gold-400"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to My Schools
      </button>

      {/* Header */}
      <div className="rounded-2xl border border-navy-700/50 bg-navy-900/80 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-serif text-display text-ivory-200">
              {school.school_name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <StatusBadge status={school.status} />

              {/* Deadline */}
              {editingDeadline ? (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={deadlineValue}
                    onChange={(e) => setDeadlineValue(e.target.value)}
                    className="rounded-lg border border-navy-600 bg-navy-800 px-2 py-1 font-sans text-caption text-ivory-300 focus:border-gold-500 focus:outline-none"
                  />
                  <button
                    onClick={handleDeadlineSave}
                    className="font-sans text-caption font-medium text-gold-400 hover:text-gold-300"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingDeadline(false);
                      setDeadlineValue(school.deadline ?? "");
                    }}
                    className="font-sans text-caption text-ivory-600 hover:text-ivory-400"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingDeadline(true)}
                  className="flex items-center gap-1.5 font-sans text-caption text-ivory-600 transition-colors hover:text-gold-400"
                >
                  <CalendarCheck className="h-3.5 w-3.5" />
                  {deadlineStr ?? "Set deadline"}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status selector */}
            <select
              value={school.status}
              onChange={(e) =>
                handleStatusChange(
                  e.target.value as SchoolApplicationStatus
                )
              }
              className="rounded-lg border border-navy-700/50 bg-navy-800 px-3 py-2 font-sans text-caption text-ivory-300 focus:border-gold-500 focus:outline-none"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {getStatusLabel(s)}
                </option>
              ))}
            </select>

            {/* Delete */}
            <Button
              variant="ghost"
              onClick={handleDelete}
              disabled={deleting}
              className="text-ivory-600 hover:text-rose-400"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Overall progress */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-sans text-caption text-ivory-600">
              Overall Progress
            </span>
            <span className="font-sans text-caption font-semibold text-gold-400">
              {progress}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-navy-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="rounded-2xl border border-navy-700/50 bg-navy-900/80 p-6">
        <RequirementsChecklist
          requirements={school.school_requirements}
          schoolId={school.id}
        />
      </div>
    </div>
  );
}
