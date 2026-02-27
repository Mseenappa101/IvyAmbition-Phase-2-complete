"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui";
import {
  getCategoriesForType,
  GRADE_LEVEL_OPTIONS,
} from "@/lib/constants/activities";
import type { Activity, ApplicationType } from "@/types/database";

interface ActivityFormProps {
  activity: Activity;
  applicationType: ApplicationType;
  onSave: (updates: Record<string, unknown>) => void;
  onCancel: () => void;
}

export function ActivityForm({
  activity,
  applicationType,
  onSave,
  onCancel,
}: ActivityFormProps) {
  const [activityName, setActivityName] = useState(activity.activity_name);
  const [category, setCategory] = useState(activity.category);
  const [organization, setOrganization] = useState(activity.organization);
  const [positionTitle, setPositionTitle] = useState(activity.position_title);
  const [description, setDescription] = useState(activity.description);
  const [startDate, setStartDate] = useState(activity.start_date ?? "");
  const [endDate, setEndDate] = useState(activity.end_date ?? "");
  const [ongoing, setOngoing] = useState(!activity.end_date);
  const [hoursPerWeek, setHoursPerWeek] = useState(activity.hours_per_week);
  const [weeksPerYear, setWeeksPerYear] = useState(activity.weeks_per_year);
  const [gradeLevels, setGradeLevels] = useState<string[]>(
    activity.grade_levels
  );
  const [saving, setSaving] = useState(false);

  const categories = getCategoriesForType(applicationType);

  const handleSave = useCallback(async () => {
    if (!activityName.trim()) return;
    setSaving(true);
    onSave({
      activityName: activityName.trim(),
      category,
      organization: organization.trim(),
      positionTitle: positionTitle.trim(),
      description: description.trim(),
      startDate: startDate || null,
      endDate: ongoing ? null : endDate || null,
      hoursPerWeek,
      weeksPerYear,
      gradeLevels,
    });
    setSaving(false);
  }, [
    activityName,
    category,
    organization,
    positionTitle,
    description,
    startDate,
    endDate,
    ongoing,
    hoursPerWeek,
    weeksPerYear,
    gradeLevels,
    onSave,
  ]);

  const toggleGradeLevel = (grade: string) => {
    setGradeLevels((prev) =>
      prev.includes(grade)
        ? prev.filter((g) => g !== grade)
        : [...prev, grade]
    );
  };

  const inputClass =
    "w-full rounded-lg border border-navy-700/50 bg-navy-900 px-3 py-2 font-sans text-body-sm text-ivory-100 placeholder:text-ivory-500 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20";
  const labelClass =
    "mb-1.5 block font-sans text-caption font-medium text-ivory-300";

  return (
    <div className="space-y-4">
      {/* Row 1: Name + Category */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Activity Name</label>
          <input
            type="text"
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
            placeholder="e.g. Debate Team"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            className={inputClass}
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value} className="bg-navy-900">
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Organization + Position */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Organization</label>
          <input
            type="text"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="e.g. Lincoln High School"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Position / Title</label>
          <input
            type="text"
            value={positionTitle}
            onChange={(e) => setPositionTitle(e.target.value)}
            placeholder="e.g. Team Captain"
            className={inputClass}
          />
        </div>
      </div>

      {/* Description with character count */}
      <div>
        <div className="flex items-center justify-between">
          <label className={labelClass}>Description</label>
          <span
            className={`font-mono text-caption ${
              description.length > 150
                ? "text-burgundy-400"
                : "text-ivory-600"
            }`}
          >
            {description.length} / 150
          </span>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your role and accomplishments..."
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Row 3: Dates */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>End Date</label>
          <input
            type="date"
            value={ongoing ? "" : endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={ongoing}
            className={`${inputClass} ${ongoing ? "opacity-50" : ""}`}
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 font-sans text-body-sm text-ivory-300">
            <input
              type="checkbox"
              checked={ongoing}
              onChange={(e) => setOngoing(e.target.checked)}
              className="h-4 w-4 rounded border-navy-600 bg-navy-800 text-gold-500 focus:ring-gold-500/20"
            />
            Ongoing
          </label>
        </div>
      </div>

      {/* Row 4: Hours + Weeks */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Hours per Week</label>
          <input
            type="number"
            min={0}
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(parseInt(e.target.value) || 0)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Weeks per Year</label>
          <input
            type="number"
            min={0}
            max={52}
            value={weeksPerYear}
            onChange={(e) => setWeeksPerYear(parseInt(e.target.value) || 0)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Grade Levels — undergraduate only */}
      {applicationType === "undergraduate" && (
        <div>
          <label className={labelClass}>Grade Levels</label>
          <div className="flex gap-2">
            {GRADE_LEVEL_OPTIONS.map((g) => (
              <button
                key={g.value}
                onClick={() => toggleGradeLevel(g.value)}
                className={`rounded-lg px-3 py-1.5 font-sans text-caption transition-colors ${
                  gradeLevels.includes(g.value)
                    ? "bg-gold-500/20 text-gold-300 ring-1 ring-gold-500/30"
                    : "bg-navy-800 text-ivory-600 hover:text-ivory-400"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Save / Cancel */}
      <div className="flex justify-end gap-3">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!activityName.trim() || saving}
          loading={saving}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
