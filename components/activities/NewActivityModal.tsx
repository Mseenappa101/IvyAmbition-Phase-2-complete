"use client";

import { useState } from "react";
import { Button, Modal, brandToast } from "@/components/ui";
import { createActivity } from "@/lib/actions/activities";
import { useActivitiesStore } from "@/hooks/use-activities-store";
import { getCategoriesForType } from "@/lib/constants/activities";
import type { ApplicationType, ActivityCategory } from "@/types/database";

interface NewActivityModalProps {
  open: boolean;
  onClose: () => void;
  applicationType: ApplicationType;
}

export function NewActivityModal({
  open,
  onClose,
  applicationType,
}: NewActivityModalProps) {
  const { addActivity } = useActivitiesStore();
  const [activityName, setActivityName] = useState("");
  const [category, setCategory] = useState<ActivityCategory>("other");
  const [submitting, setSubmitting] = useState(false);

  const categories = getCategoriesForType(applicationType);

  const handleSubmit = async () => {
    if (!activityName.trim()) return;
    setSubmitting(true);

    const { data, error } = await createActivity({
      activityName: activityName.trim(),
      category,
    });

    if (error) {
      brandToast.error("Error", error);
      setSubmitting(false);
      return;
    }

    if (data) {
      addActivity(data);
      brandToast.success("Activity added", `"${activityName}" has been added.`);
    }

    setActivityName("");
    setCategory("other");
    setSubmitting(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Activity"
      description="Add an extracurricular activity or experience."
      size="md"
      className="border-navy-700/50 bg-charcoal-900 [&_h2]:text-ivory-100 [&>div:first-child]:border-navy-700/50 [&>div:last-child]:border-navy-700/50 [&_p.text-charcoal-400]:text-ivory-500 [&_button.text-charcoal-400]:text-ivory-500 [&_button.text-charcoal-400:hover]:bg-navy-800 [&_button.text-charcoal-400:hover]:text-ivory-200"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!activityName.trim() || submitting}
            loading={submitting}
          >
            {submitting ? "Adding..." : "Add Activity"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block font-sans text-body-sm font-medium text-ivory-100">
            Activity Name
          </label>
          <input
            type="text"
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
            placeholder="e.g. Debate Team, Volunteer Tutoring"
            autoFocus
            className="w-full rounded-lg border border-navy-700/50 bg-navy-900 px-4 py-2.5 font-sans text-body-sm text-ivory-100 placeholder:text-ivory-500 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block font-sans text-body-sm font-medium text-ivory-100">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ActivityCategory)}
            className="w-full rounded-lg border border-navy-700/50 bg-navy-900 px-4 py-2.5 font-sans text-body-sm text-ivory-100 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value} className="bg-navy-900 text-ivory-100">
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
}
