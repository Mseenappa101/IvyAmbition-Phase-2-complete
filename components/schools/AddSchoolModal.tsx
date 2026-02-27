"use client";

import { useState, useMemo } from "react";
import { Search, MapPin, Trophy, Check } from "lucide-react";
import { Modal, Button, brandToast } from "@/components/ui";
import { searchSchools, schoolsByType } from "@/lib/data/schools";
import { useSchoolsStore } from "@/hooks/use-schools-store";
import {
  addStudentSchool,
  seedDefaultRequirements,
} from "@/lib/actions/schools";
import { cn } from "@/lib/utils/cn";
import type { StaticSchool, ApplicationType } from "@/types";

interface AddSchoolModalProps {
  open: boolean;
  onClose: () => void;
  applicationType: ApplicationType;
  existingSlugs: Set<string>;
}

export function AddSchoolModal({
  open,
  onClose,
  applicationType,
  existingSlugs,
}: AddSchoolModalProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<StaticSchool | null>(null);
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { addSchool } = useSchoolsStore();

  const results = useMemo(() => {
    if (query.trim().length === 0) {
      return schoolsByType[applicationType].slice(0, 50);
    }
    return searchSchools(query, applicationType).slice(0, 50);
  }, [query, applicationType]);

  const handleSelect = (school: StaticSchool) => {
    setSelected(school);
    // Pre-fill the earliest deadline
    const firstDeadline = Object.values(school.deadlines)[0];
    if (firstDeadline) setDeadline(firstDeadline);
  };

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);

    const { data, error } = await addStudentSchool({
      schoolName: selected.name,
      schoolSlug: selected.slug,
      applicationType: selected.type,
      deadline: deadline || null,
    });

    if (error) {
      brandToast.error("Failed to add school", error);
      setSubmitting(false);
      return;
    }

    if (data) {
      // Seed default requirements
      const { data: reqs } = await seedDefaultRequirements(
        data.id,
        selected.type
      );
      const schoolWithReqs = {
        ...data,
        school_requirements: reqs ?? [],
      };
      addSchool(schoolWithReqs);
      brandToast.success(
        "School added",
        `${selected.name} has been added to your list.`
      );
    }

    setQuery("");
    setSelected(null);
    setDeadline("");
    setSubmitting(false);
    onClose();
  };

  const handleClose = () => {
    setQuery("");
    setSelected(null);
    setDeadline("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add a School"
      description="Search for a school to add to your application tracker."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!selected || submitting}
          >
            {submitting ? "Adding..." : "Add School"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
            }}
            placeholder="Search schools..."
            className="w-full rounded-xl border border-ivory-400 bg-white py-2.5 pl-10 pr-4 font-sans text-body-sm text-charcoal-700 placeholder:text-charcoal-300 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
          />
        </div>

        {/* Selected school details */}
        {selected && (
          <div className="rounded-xl border border-gold-200 bg-gold-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif text-body-sm font-semibold text-navy-900">
                  {selected.name}
                </h4>
                <p className="mt-0.5 font-sans text-caption text-charcoal-500">
                  {selected.location} · Rank #{selected.ranking}
                </p>
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-500">
                <Check className="h-3.5 w-3.5 text-white" />
              </div>
            </div>

            {/* Deadline field */}
            <div className="mt-3">
              <label className="font-sans text-caption font-medium text-charcoal-600">
                Application Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1 w-full rounded-lg border border-ivory-400 bg-white px-3 py-2 font-sans text-body-sm text-charcoal-700 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
              />
            </div>
          </div>
        )}

        {/* School list */}
        {!selected && (
          <div className="max-h-[300px] space-y-1.5 overflow-y-auto">
            {results.length === 0 && (
              <p className="py-8 text-center font-sans text-body-sm text-charcoal-400">
                No schools found matching &quot;{query}&quot;
              </p>
            )}
            {results.map((school) => {
              const alreadyAdded = existingSlugs.has(school.slug);
              return (
                <button
                  key={school.slug}
                  type="button"
                  disabled={alreadyAdded}
                  onClick={() => handleSelect(school)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                    alreadyAdded
                      ? "cursor-not-allowed border-ivory-300 bg-ivory-100 opacity-50"
                      : "border-ivory-400 bg-white hover:border-gold-300 hover:bg-gold-50/50"
                  )}
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-ivory-200">
                    <Trophy className="h-4 w-4 text-gold-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-body-sm font-medium text-navy-900">
                      {school.name}
                    </p>
                    <p className="flex items-center gap-1 font-sans text-caption text-charcoal-400">
                      <MapPin className="h-3 w-3" />
                      {school.location} · #{school.ranking}
                    </p>
                  </div>
                  {alreadyAdded && (
                    <span className="font-sans text-caption font-medium text-charcoal-400">
                      Added
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
