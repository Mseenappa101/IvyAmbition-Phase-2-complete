"use client";

import { useEffect, useState } from "react";
import { FileEdit } from "lucide-react";
import { brandToast } from "@/components/ui";
import { fetchStudentEssaysForCoach } from "@/lib/actions/coach";
import { EssayReviewView } from "./EssayReviewView";

interface Props {
  studentId: string;
}

const statusColors: Record<string, string> = {
  brainstorming: "bg-ivory-700/15 text-ivory-500",
  outline: "bg-blue-500/15 text-blue-400",
  first_draft: "bg-gold-500/15 text-gold-400",
  revision: "bg-amber-500/15 text-amber-400",
  coach_review: "bg-burgundy-500/15 text-burgundy-400",
  final: "bg-emerald-500/15 text-emerald-400",
};

interface EssayListItem {
  id: string;
  title: string;
  status: string;
  word_count: number;
  updated_at: string;
  student_schools: { school_name: string } | null;
  essay_feedback: { id: string; status: string }[];
}

export function EssaysTab({ studentId }: Props) {
  const [loading, setLoading] = useState(true);
  const [essays, setEssays] = useState<EssayListItem[]>([]);
  const [selectedEssayId, setSelectedEssayId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await fetchStudentEssaysForCoach(studentId);
      if (error) {
        brandToast.error(error);
      } else if (data) {
        setEssays(data as unknown as EssayListItem[]);
      }
      setLoading(false);
    }
    load();
  }, [studentId]);

  // Show review view when an essay is selected
  if (selectedEssayId) {
    return (
      <EssayReviewView
        essayId={selectedEssayId}
        studentId={studentId}
        onBack={() => setSelectedEssayId(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-36 animate-pulse rounded-2xl border border-navy-700/50 bg-navy-900/80"
          />
        ))}
      </div>
    );
  }

  if (essays.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-navy-700/50 bg-navy-900/80 py-16">
        <div className="text-center">
          <FileEdit className="mx-auto h-8 w-8 text-ivory-800" />
          <p className="mt-2 font-sans text-body-sm text-ivory-600">
            No essays yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {essays.map((essay) => {
        const openFeedback = essay.essay_feedback.filter(
          (f) => f.status === "open"
        ).length;

        return (
          <button
            key={essay.id}
            onClick={() => setSelectedEssayId(essay.id)}
            className="group rounded-2xl border border-navy-700/50 bg-navy-900/80 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-navy-600 hover:shadow-elevated"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500/10">
                <FileEdit className="h-4 w-4 text-gold-400" />
              </div>
              <span
                className={`rounded-full px-2 py-0.5 font-sans text-[0.625rem] font-medium capitalize ${
                  statusColors[essay.status] ?? statusColors.brainstorming
                }`}
              >
                {essay.status.replace("_", " ")}
              </span>
            </div>
            <h4 className="mt-3 truncate font-sans text-body-sm font-medium text-ivory-200">
              {essay.title}
            </h4>
            <p className="mt-1 font-sans text-caption text-ivory-700">
              {essay.student_schools?.school_name ?? "General Essay"} &middot;{" "}
              {essay.word_count} words
            </p>
            {openFeedback > 0 && (
              <p className="mt-2 font-sans text-caption text-gold-400">
                {openFeedback} open feedback{openFeedback !== 1 ? "s" : ""}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
