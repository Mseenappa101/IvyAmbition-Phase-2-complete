"use client";

import { useState } from "react";
import { Trash2, FileText } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  toggleRequirementCompletion,
  deleteSchoolRequirement,
} from "@/lib/actions/schools";
import { useSchoolsStore } from "@/hooks/use-schools-store";
import { brandToast } from "@/components/ui";
import type { SchoolRequirement } from "@/types/database";

interface RequirementItemProps {
  requirement: SchoolRequirement;
  schoolId: string;
}

const typeLabels: Record<string, string> = {
  transcript: "Transcript",
  test_score: "Test Score",
  essay: "Essay",
  recommendation: "Recommendation",
  resume: "Resume",
  application_form: "Application",
  fee: "Fee",
  interview: "Interview",
  supplement: "Supplement",
  other: "Other",
};

export function RequirementItem({
  requirement,
  schoolId,
}: RequirementItemProps) {
  const { toggleRequirement, removeRequirement } = useSchoolsStore();
  const [deleting, setDeleting] = useState(false);

  const handleToggle = async () => {
    // Optimistic update
    toggleRequirement(schoolId, requirement.id);

    const { error } = await toggleRequirementCompletion(
      requirement.id,
      !requirement.is_completed
    );

    if (error) {
      // Revert
      toggleRequirement(schoolId, requirement.id);
      brandToast.error("Update failed", "Could not update requirement.");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await deleteSchoolRequirement(requirement.id);
    if (error) {
      brandToast.error("Delete failed", "Could not delete requirement.");
      setDeleting(false);
      return;
    }
    removeRequirement(schoolId, requirement.id);
  };

  const dueStr = requirement.due_date
    ? new Date(requirement.due_date + "T00:00:00").toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric" }
      )
    : null;

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-xl border border-navy-700/30 bg-navy-800/40 px-4 py-3 transition-all hover:border-navy-600",
        deleting && "pointer-events-none opacity-50"
      )}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all",
          requirement.is_completed
            ? "border-gold-500 bg-gold-500"
            : "border-ivory-700 hover:border-gold-400"
        )}
      >
        {requirement.is_completed && (
          <svg
            className="h-3 w-3 text-navy-950"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M2 6l3 3 5-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "font-sans text-body-sm transition-all",
            requirement.is_completed
              ? "text-ivory-700 line-through"
              : "text-ivory-300"
          )}
        >
          {requirement.label}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="font-sans text-[0.625rem] uppercase tracking-wider text-ivory-800">
            {typeLabels[requirement.requirement_type] || requirement.requirement_type}
          </span>
          {dueStr && (
            <>
              <span className="text-ivory-800">·</span>
              <span className="font-sans text-[0.625rem] text-ivory-700">
                Due {dueStr}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Type icon */}
      {requirement.file_url && (
        <FileText className="h-4 w-4 flex-shrink-0 text-gold-400" />
      )}

      {/* Delete button */}
      <button
        type="button"
        onClick={handleDelete}
        className="flex-shrink-0 text-ivory-800 opacity-0 transition-all hover:text-rose-400 group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
