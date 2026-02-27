"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button, Modal, brandToast } from "@/components/ui";
import { RequirementItem } from "./RequirementItem";
import { useSchoolsStore } from "@/hooks/use-schools-store";
import { addSchoolRequirement } from "@/lib/actions/schools";
import type { SchoolRequirement, RequirementType } from "@/types/database";

interface RequirementsChecklistProps {
  requirements: SchoolRequirement[];
  schoolId: string;
}

const requirementTypeOptions: { value: RequirementType; label: string }[] = [
  { value: "application_form", label: "Application Form" },
  { value: "transcript", label: "Transcript" },
  { value: "test_score", label: "Test Score" },
  { value: "essay", label: "Essay" },
  { value: "recommendation", label: "Recommendation" },
  { value: "resume", label: "Resume / CV" },
  { value: "fee", label: "Fee" },
  { value: "interview", label: "Interview" },
  { value: "supplement", label: "Supplement" },
  { value: "other", label: "Other" },
];

export function RequirementsChecklist({
  requirements,
  schoolId,
}: RequirementsChecklistProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [reqType, setReqType] = useState<RequirementType>("other");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { addRequirement } = useSchoolsStore();

  const sorted = [...requirements].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  const completed = requirements.filter((r) => r.is_completed).length;
  const total = requirements.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleAddRequirement = async () => {
    if (!label.trim()) return;
    setSubmitting(true);

    const { data, error } = await addSchoolRequirement({
      studentSchoolId: schoolId,
      label: label.trim(),
      requirementType: reqType,
      dueDate: dueDate || null,
    });

    if (error) {
      brandToast.error("Failed", "Could not add requirement.");
      setSubmitting(false);
      return;
    }

    if (data) {
      addRequirement(schoolId, data);
    }

    setLabel("");
    setReqType("other");
    setDueDate("");
    setSubmitting(false);
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Progress summary */}
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-heading text-ivory-200">
          Requirements
        </h2>
        <div className="flex items-center gap-3">
          <span className="font-sans text-caption text-ivory-600">
            {completed}/{total} complete
          </span>
          <span className="font-sans text-caption font-semibold text-gold-400">
            {progress}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-navy-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Requirement items */}
      <div className="space-y-2">
        {sorted.map((req) => (
          <RequirementItem
            key={req.id}
            requirement={req}
            schoolId={schoolId}
          />
        ))}
      </div>

      {/* Add requirement button */}
      <button
        type="button"
        onClick={() => setIsAddOpen(true)}
        className="flex w-full items-center gap-2 rounded-xl border border-dashed border-navy-700/50 px-4 py-3 font-sans text-body-sm text-ivory-600 transition-all hover:border-gold-500/30 hover:text-gold-400"
      >
        <Plus className="h-4 w-4" />
        Add custom requirement
      </button>

      {/* Add Requirement Modal */}
      <Modal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Requirement"
        description="Add a custom requirement to your checklist."
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsAddOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddRequirement}
              disabled={!label.trim() || submitting}
            >
              {submitting ? "Adding..." : "Add"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="font-sans text-body-sm font-medium text-charcoal-700">
              Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Write diversity statement"
              className="mt-1 w-full rounded-xl border border-ivory-400 bg-white px-4 py-2.5 font-sans text-body-sm text-charcoal-700 placeholder:text-charcoal-300 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
          </div>

          <div>
            <label className="font-sans text-body-sm font-medium text-charcoal-700">
              Type
            </label>
            <select
              value={reqType}
              onChange={(e) => setReqType(e.target.value as RequirementType)}
              className="mt-1 w-full rounded-xl border border-ivory-400 bg-white px-4 py-2.5 font-sans text-body-sm text-charcoal-700 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            >
              {requirementTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-sans text-body-sm font-medium text-charcoal-700">
              Due Date (optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-ivory-400 bg-white px-4 py-2.5 font-sans text-body-sm text-charcoal-700 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
