"use client";

import { MessageSquare, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useEssayEditorStore } from "@/hooks/use-essay-editor-store";
import { resolveFeedback } from "@/lib/actions/essays";
import { brandToast } from "@/components/ui";
import type { EssayFeedback } from "@/types/database";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function FeedbackPanel() {
  const { essay, content, resolveFeedbackItem, setActiveFeedbackId } =
    useEssayEditorStore();

  const feedback = essay?.essay_feedback
    ? [...essay.essay_feedback].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    : [];

  const inlineFeedback = feedback.filter((f) => f.feedback_type === "inline");
  const generalFeedback = feedback.filter((f) => f.feedback_type === "general");

  const handleResolve = async (fb: EssayFeedback) => {
    resolveFeedbackItem(fb.id);
    const { error } = await resolveFeedback(fb.id);
    if (error) {
      brandToast.error("Error", "Could not resolve feedback.");
    }
  };

  if (feedback.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquare className="h-8 w-8 text-ivory-800" />
        <p className="mt-3 font-sans text-body-sm text-ivory-600">
          No feedback yet
        </p>
        <p className="mt-1 font-sans text-caption text-ivory-700">
          Submit your essay for review to get coach feedback.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Inline Feedback */}
      {inlineFeedback.length > 0 && (
        <div>
          <p className="mb-2 font-sans text-caption font-medium uppercase tracking-wider text-ivory-700">
            Inline Comments
          </p>
          <div className="space-y-2">
            {inlineFeedback.map((fb) => {
              const snippet =
                fb.selection_start != null && fb.selection_end != null
                  ? content.slice(fb.selection_start, fb.selection_end)
                  : "";
              const truncated =
                snippet.length > 60 ? snippet.slice(0, 60) + "..." : snippet;

              return (
                <button
                  key={fb.id}
                  onClick={() => setActiveFeedbackId(fb.id)}
                  className="w-full rounded-lg border border-navy-700/50 bg-navy-900/40 p-3 text-left transition-colors hover:border-gold-500/30"
                >
                  {truncated && (
                    <p className="mb-1.5 truncate rounded bg-gold-500/10 px-2 py-1 font-serif text-caption italic text-gold-400">
                      &ldquo;{truncated}&rdquo;
                    </p>
                  )}
                  <p className="font-sans text-body-sm text-ivory-300 leading-relaxed">
                    {fb.content}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-sans text-caption text-ivory-700">
                      {formatDate(fb.created_at)}
                    </span>
                    {fb.status === "open" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResolve(fb);
                        }}
                        className="flex items-center gap-1 font-sans text-caption font-medium text-gold-400 hover:text-gold-300"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Resolve
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 font-sans text-caption text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Resolved
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* General Feedback */}
      {generalFeedback.length > 0 && (
        <div>
          <p className="mb-2 font-sans text-caption font-medium uppercase tracking-wider text-ivory-700">
            General Feedback
          </p>
          <div className="space-y-2">
            {generalFeedback.map((fb) => (
              <div
                key={fb.id}
                className={cn(
                  "rounded-lg border p-3",
                  fb.status === "open"
                    ? "border-navy-700/50 bg-navy-900/40"
                    : "border-navy-700/30 bg-navy-900/20"
                )}
              >
                <p className="font-sans text-body-sm text-ivory-300 leading-relaxed">
                  {fb.content}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-sans text-caption text-ivory-700">
                    {formatDate(fb.created_at)}
                  </span>
                  {fb.status === "open" ? (
                    <button
                      onClick={() => handleResolve(fb)}
                      className="flex items-center gap-1 font-sans text-caption font-medium text-gold-400 hover:text-gold-300"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Resolve
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 font-sans text-caption text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
