"use client";

import { useEffect, useState } from "react";
import { Trophy, MessageSquare, Save } from "lucide-react";
import { brandToast } from "@/components/ui";
import {
  fetchStudentActivitiesForCoach,
  updateActivityFeedback,
} from "@/lib/actions/coach";

interface Props {
  studentId: string;
}

interface ActivityData {
  id: string;
  activity_name: string;
  category: string;
  organization: string;
  position_title: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  hours_per_week: number;
  weeks_per_year: number;
  grade_levels: string[];
  ranking: number;
  coach_feedback: string | null;
}

const categoryColors: Record<string, string> = {
  academic: "bg-blue-500/15 text-blue-400",
  athletics: "bg-emerald-500/15 text-emerald-400",
  arts: "bg-purple-500/15 text-purple-400",
  community_service: "bg-gold-500/15 text-gold-400",
  leadership: "bg-amber-500/15 text-amber-400",
  work_experience: "bg-ivory-700/15 text-ivory-400",
  research: "bg-blue-500/15 text-blue-400",
  volunteer: "bg-emerald-500/15 text-emerald-400",
};

export function ActivitiesTab({ studentId }: Props) {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [feedbackEdits, setFeedbackEdits] = useState<Record<string, string>>(
    {}
  );
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await fetchStudentActivitiesForCoach(studentId);
      if (error) {
        brandToast.error(error);
      } else if (data) {
        setActivities(data as unknown as ActivityData[]);
        // Initialize feedback edits from existing data
        const edits: Record<string, string> = {};
        for (const a of data as unknown as ActivityData[]) {
          if (a.coach_feedback) edits[a.id] = a.coach_feedback;
        }
        setFeedbackEdits(edits);
      }
      setLoading(false);
    }
    load();
  }, [studentId]);

  const saveFeedback = async (activityId: string) => {
    const text = feedbackEdits[activityId] ?? "";
    setSavingId(activityId);

    const { error } = await updateActivityFeedback(activityId, text);
    if (error) {
      brandToast.error(error);
    } else {
      brandToast.success("Feedback saved");
      // Update local state
      setActivities((prev) =>
        prev.map((a) =>
          a.id === activityId ? { ...a, coach_feedback: text } : a
        )
      );
    }
    setSavingId(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-2xl border border-navy-700/50 bg-navy-900/80"
          />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-navy-700/50 bg-navy-900/80 py-16">
        <div className="text-center">
          <Trophy className="mx-auto h-8 w-8 text-ivory-800" />
          <p className="mt-2 font-sans text-body-sm text-ivory-600">
            No activities yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, idx) => {
        const hasUnsavedChanges =
          (feedbackEdits[activity.id] ?? "") !==
          (activity.coach_feedback ?? "");

        return (
          <div
            key={activity.id}
            className="rounded-2xl border border-navy-700/50 bg-navy-900/80 p-5"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-500/10 font-serif text-body-sm font-semibold text-gold-400">
                {idx + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-sans text-body-sm font-medium text-ivory-200">
                    {activity.activity_name}
                  </h4>
                  <span
                    className={`rounded-full px-2 py-0.5 font-sans text-[0.625rem] font-medium capitalize ${
                      categoryColors[activity.category] ??
                      "bg-ivory-700/15 text-ivory-400"
                    }`}
                  >
                    {activity.category.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-0.5 font-sans text-caption text-ivory-600">
                  {activity.position_title}
                  {activity.organization && ` at ${activity.organization}`}
                </p>
                {activity.description && (
                  <p className="mt-2 font-sans text-caption text-ivory-500">
                    {activity.description}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-3 font-sans text-[0.6875rem] text-ivory-700">
                  <span>
                    {activity.hours_per_week}h/week, {activity.weeks_per_year}{" "}
                    weeks/year
                  </span>
                  {activity.grade_levels.length > 0 && (
                    <span>Grades: {activity.grade_levels.join(", ")}</span>
                  )}
                </div>

                {/* Coach Feedback */}
                <div className="mt-4 border-t border-navy-700/30 pt-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-gold-400" />
                    <p className="font-sans text-caption font-medium text-ivory-700">
                      Coach Feedback
                    </p>
                  </div>
                  <textarea
                    value={feedbackEdits[activity.id] ?? ""}
                    onChange={(e) =>
                      setFeedbackEdits((prev) => ({
                        ...prev,
                        [activity.id]: e.target.value,
                      }))
                    }
                    placeholder="Add your feedback on this activity..."
                    rows={2}
                    className="mt-2 w-full rounded-lg border border-navy-700/50 bg-navy-900/60 px-3 py-2 font-sans text-caption text-ivory-300 placeholder:text-ivory-800 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                  />
                  {hasUnsavedChanges && (
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => saveFeedback(activity.id)}
                        disabled={savingId === activity.id}
                        className="flex items-center gap-1.5 rounded-lg bg-gold-500 px-3 py-1.5 font-sans text-caption font-medium text-navy-950 transition-colors hover:bg-gold-400 disabled:opacity-50"
                      >
                        <Save className="h-3 w-3" />
                        {savingId === activity.id ? "Saving..." : "Save"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
