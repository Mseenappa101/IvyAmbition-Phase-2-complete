"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  ArrowLeft,
  MessageSquare,
  Check,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { brandToast } from "@/components/ui";
import { formatRelativeDate } from "@/lib/utils/format";
import {
  fetchEssayForCoach,
  createEssayFeedback,
  updateEssayStatusForCoach,
} from "@/lib/actions/coach";
import type { EssayStatus } from "@/types/database";

interface Props {
  essayId: string;
  studentId: string;
  onBack: () => void;
}

const essayStatuses = [
  "brainstorming",
  "outline",
  "first_draft",
  "revision",
  "coach_review",
  "final",
];

const statusColors: Record<string, string> = {
  brainstorming: "bg-ivory-700/15 text-ivory-500 border-ivory-700/30",
  outline: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  first_draft: "bg-gold-500/15 text-gold-400 border-gold-500/30",
  revision: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  coach_review: "bg-burgundy-500/15 text-burgundy-400 border-burgundy-500/30",
  final: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

interface FeedbackItem {
  id: string;
  feedback_type: string;
  content: string;
  selection_start: number | null;
  selection_end: number | null;
  status: string;
  created_at: string;
  profiles?: { first_name: string; last_name: string };
}

interface EssayData {
  id: string;
  title: string;
  prompt: string;
  content: string;
  word_count: number;
  status: string;
  student_schools: { school_name: string } | null;
  essay_feedback: FeedbackItem[];
}

export function EssayReviewView({ essayId, studentId, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [essay, setEssay] = useState<EssayData | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [sending, setSending] = useState(false);
  const [selection, setSelection] = useState<{
    start: number;
    end: number;
    text: string;
  } | null>(null);
  const [showInlinePopover, setShowInlinePopover] = useState(false);
  const [inlineComment, setInlineComment] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const loadEssay = useCallback(async () => {
    const { data, error } = await fetchEssayForCoach(essayId, studentId);
    if (error) {
      brandToast.error(error);
    } else if (data) {
      setEssay(data as unknown as EssayData);
    }
    setLoading(false);
  }, [essayId, studentId]);

  useEffect(() => {
    loadEssay();
  }, [loadEssay]);

  const handleTextSelect = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !contentRef.current) {
      setShowInlinePopover(false);
      return;
    }

    const text = sel.toString().trim();
    if (!text || !essay) return;

    // Calculate selection indices relative to essay content
    const range = sel.getRangeAt(0);
    const preRange = document.createRange();
    preRange.selectNodeContents(contentRef.current);
    preRange.setEnd(range.startContainer, range.startOffset);
    const start = preRange.toString().length;
    const end = start + text.length;

    setSelection({ start, end, text });
    setShowInlinePopover(true);
    setInlineComment("");
  };

  const submitInlineFeedback = async () => {
    if (!selection || !inlineComment.trim()) return;
    setSending(true);

    const { error } = await createEssayFeedback({
      essayId,
      feedbackType: "inline",
      content: inlineComment.trim(),
      selectionStart: selection.start,
      selectionEnd: selection.end,
    });

    if (error) {
      brandToast.error(error);
    } else {
      brandToast.success("Inline feedback added");
      setShowInlinePopover(false);
      setInlineComment("");
      setSelection(null);
      window.getSelection()?.removeAllRanges();
      await loadEssay();
    }
    setSending(false);
  };

  const submitGeneralFeedback = async () => {
    if (!feedbackText.trim()) return;
    setSending(true);

    const { error } = await createEssayFeedback({
      essayId,
      feedbackType: "general",
      content: feedbackText.trim(),
    });

    if (error) {
      brandToast.error(error);
    } else {
      brandToast.success("Feedback added");
      setFeedbackText("");
      await loadEssay();
    }
    setSending(false);
  };

  const handleStatusChange = async (newStatus: EssayStatus) => {
    if (!essay) return;
    const prev = essay.status;
    setEssay({ ...essay, status: newStatus });

    const { error } = await updateEssayStatusForCoach(essayId, newStatus);
    if (error) {
      brandToast.error(error);
      setEssay({ ...essay, status: prev });
    } else {
      brandToast.success("Status updated");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-32 animate-pulse rounded bg-navy-800/60" />
        <div className="h-8 w-64 animate-pulse rounded bg-navy-800/60" />
        <div className="h-64 animate-pulse rounded-2xl border border-navy-700/50 bg-navy-900/80" />
      </div>
    );
  }

  if (!essay) {
    return (
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-sans text-body-sm text-ivory-600 hover:text-ivory-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Essays
        </button>
        <p className="mt-4 font-sans text-body text-burgundy-500">
          Essay not found
        </p>
      </div>
    );
  }

  const inlineFeedback = essay.essay_feedback.filter(
    (f) => f.feedback_type === "inline"
  );
  const generalFeedback = essay.essay_feedback.filter(
    (f) => f.feedback_type === "general"
  );

  return (
    <div className="space-y-4">
      {/* Back + Title */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 font-sans text-body-sm text-ivory-600 transition-colors hover:text-ivory-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Essays
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-heading text-ivory-200">
            {essay.title}
          </h2>
          <p className="mt-0.5 font-sans text-caption text-ivory-700">
            {essay.student_schools?.school_name ?? "General Essay"} &middot;{" "}
            {essay.word_count} words
          </p>
        </div>
        {/* Status Selector */}
        <select
          value={essay.status}
          onChange={(e) => handleStatusChange(e.target.value as EssayStatus)}
          className="rounded-lg border border-navy-700/50 bg-navy-900/60 px-3 py-2 font-sans text-body-sm text-ivory-300 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        >
          {essayStatuses.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Essay Content - 2/3 */}
        <div className="lg:col-span-2">
          {essay.prompt && (
            <div className="mb-4 rounded-xl border border-navy-700/30 bg-navy-800/50 p-4">
              <p className="font-sans text-caption font-medium uppercase tracking-wider text-ivory-700">
                Prompt
              </p>
              <p className="mt-1 font-sans text-body-sm text-ivory-400">
                {essay.prompt}
              </p>
            </div>
          )}

          <div className="relative rounded-2xl border border-navy-700/50 bg-navy-900/80 p-6">
            <p className="mb-3 font-sans text-caption font-medium uppercase tracking-wider text-ivory-700">
              Essay Content{" "}
              <span className="normal-case tracking-normal">
                — Select text to add inline feedback
              </span>
            </p>
            <div
              ref={contentRef}
              onMouseUp={handleTextSelect}
              className="cursor-text whitespace-pre-wrap font-sans text-body-sm leading-relaxed text-ivory-300 selection:bg-gold-500/30"
            >
              {essay.content || "No content yet"}
            </div>

            {/* Inline feedback popover */}
            {showInlinePopover && selection && (
              <div className="mt-4 rounded-xl border border-gold-500/30 bg-navy-800 p-4">
                <p className="font-sans text-caption text-ivory-700">
                  Commenting on: &ldquo;
                  <span className="text-gold-400">
                    {selection.text.length > 80
                      ? selection.text.slice(0, 80) + "..."
                      : selection.text}
                  </span>
                  &rdquo;
                </p>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={inlineComment}
                    onChange={(e) => setInlineComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        submitInlineFeedback();
                      }
                    }}
                    placeholder="Add your comment..."
                    className="flex-1 rounded-lg border border-navy-700/50 bg-navy-900/60 px-3 py-2 font-sans text-body-sm text-ivory-300 placeholder:text-ivory-800 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                    autoFocus
                  />
                  <button
                    onClick={submitInlineFeedback}
                    disabled={sending || !inlineComment.trim()}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500 text-navy-950 transition-colors hover:bg-gold-400 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setShowInlinePopover(false);
                      setSelection(null);
                    }}
                    className="rounded-lg px-3 py-2 font-sans text-body-sm text-ivory-600 hover:text-ivory-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* General Feedback Input */}
          <div className="mt-4 rounded-2xl border border-navy-700/50 bg-navy-900/80 p-5">
            <p className="mb-3 font-sans text-caption font-medium uppercase tracking-wider text-ivory-700">
              Add General Feedback
            </p>
            <div className="flex gap-2">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Write your feedback..."
                rows={3}
                className="flex-1 rounded-lg border border-navy-700/50 bg-navy-900/60 px-4 py-3 font-sans text-body-sm text-ivory-300 placeholder:text-ivory-800 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
              />
            </div>
            <div className="mt-2 flex justify-end">
              <button
                onClick={submitGeneralFeedback}
                disabled={sending || !feedbackText.trim()}
                className="flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2 font-sans text-body-sm font-medium text-navy-950 transition-colors hover:bg-gold-400 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Send Feedback
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Sidebar - 1/3 */}
        <div className="space-y-4">
          {/* Inline Feedback */}
          <div className="rounded-2xl border border-navy-700/50 bg-navy-900/80">
            <div className="border-b border-navy-700/50 px-5 py-3">
              <h3 className="font-sans text-body-sm font-medium text-ivory-200">
                Inline Feedback ({inlineFeedback.length})
              </h3>
            </div>
            {inlineFeedback.length === 0 ? (
              <div className="px-5 py-6 text-center">
                <p className="font-sans text-caption text-ivory-600">
                  No inline feedback yet
                </p>
              </div>
            ) : (
              <div className="max-h-64 divide-y divide-navy-700/30 overflow-y-auto">
                {inlineFeedback.map((fb) => (
                  <div key={fb.id} className="px-5 py-3">
                    {fb.selection_start != null &&
                      fb.selection_end != null &&
                      essay.content && (
                        <p className="mb-1 truncate rounded bg-gold-500/10 px-2 py-0.5 font-sans text-[0.6875rem] italic text-gold-400">
                          &ldquo;
                          {essay.content
                            .slice(fb.selection_start, fb.selection_end)
                            .slice(0, 60)}
                          {fb.selection_end - fb.selection_start > 60
                            ? "..."
                            : ""}
                          &rdquo;
                        </p>
                      )}
                    <p className="font-sans text-caption text-ivory-300">
                      {fb.content}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="font-sans text-[0.6875rem] text-ivory-800">
                        {formatRelativeDate(fb.created_at)}
                      </p>
                      <span
                        className={cn(
                          "flex items-center gap-1 rounded-full px-1.5 py-0.5 font-sans text-[0.6875rem] font-medium",
                          fb.status === "resolved"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-gold-500/15 text-gold-400"
                        )}
                      >
                        {fb.status === "resolved" && (
                          <Check className="h-2.5 w-2.5" />
                        )}
                        {fb.status === "resolved" ? "Resolved" : "Open"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* General Feedback */}
          <div className="rounded-2xl border border-navy-700/50 bg-navy-900/80">
            <div className="border-b border-navy-700/50 px-5 py-3">
              <h3 className="font-sans text-body-sm font-medium text-ivory-200">
                General Feedback ({generalFeedback.length})
              </h3>
            </div>
            {generalFeedback.length === 0 ? (
              <div className="px-5 py-6 text-center">
                <MessageSquare className="mx-auto h-6 w-6 text-ivory-800" />
                <p className="mt-1 font-sans text-caption text-ivory-600">
                  No general feedback yet
                </p>
              </div>
            ) : (
              <div className="max-h-64 divide-y divide-navy-700/30 overflow-y-auto">
                {generalFeedback.map((fb) => (
                  <div key={fb.id} className="px-5 py-3">
                    <p className="font-sans text-caption text-ivory-300">
                      {fb.content}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="font-sans text-[0.6875rem] text-ivory-800">
                        {formatRelativeDate(fb.created_at)}
                      </p>
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 font-sans text-[0.6875rem] font-medium",
                          fb.status === "resolved"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-gold-500/15 text-gold-400"
                        )}
                      >
                        {fb.status === "resolved" ? "Resolved" : "Open"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
