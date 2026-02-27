"use client";

import { useRef, useCallback, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useEssayEditorStore } from "@/hooks/use-essay-editor-store";
import { InlineFeedbackPopover } from "./InlineFeedbackPopover";
import { resolveFeedback } from "@/lib/actions/essays";
import { brandToast } from "@/components/ui";
import type { EssayFeedback } from "@/types/database";

export function EssayWritingArea() {
  const {
    essay,
    content,
    wordCount,
    setContent,
    activeFeedbackId,
    setActiveFeedbackId,
    resolveFeedbackItem,
  } = useEssayEditorStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [popoverAnchor, setPopoverAnchor] = useState<DOMRect | null>(null);
  const [popoverFeedback, setPopoverFeedback] = useState<EssayFeedback | null>(
    null
  );

  const inlineFeedback =
    essay?.essay_feedback?.filter(
      (f) =>
        f.feedback_type === "inline" &&
        f.selection_start != null &&
        f.selection_end != null
    ) ?? [];

  const hasInlineFeedback = inlineFeedback.length > 0;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
    },
    [setContent]
  );

  const handleHighlightClick = useCallback(
    (fb: EssayFeedback, e: React.MouseEvent) => {
      e.stopPropagation();
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setPopoverFeedback(fb);
      setPopoverAnchor(rect);
      setActiveFeedbackId(fb.id);
    },
    [setActiveFeedbackId]
  );

  const handleResolve = useCallback(
    async (feedbackId: string) => {
      resolveFeedbackItem(feedbackId);
      setPopoverFeedback(null);
      setPopoverAnchor(null);
      setActiveFeedbackId(null);

      const { error } = await resolveFeedback(feedbackId);
      if (error) {
        brandToast.error("Error", "Could not resolve feedback.");
      }
    },
    [resolveFeedbackItem, setActiveFeedbackId]
  );

  const handleClosePopover = useCallback(() => {
    setPopoverFeedback(null);
    setPopoverAnchor(null);
    setActiveFeedbackId(null);
  }, [setActiveFeedbackId]);

  // Sync scroll between textarea and overlay
  const handleScroll = useCallback(() => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  // Build highlighted content for overlay
  const renderHighlightedContent = () => {
    if (!hasInlineFeedback) return null;

    const sorted = [...inlineFeedback].sort(
      (a, b) => a.selection_start! - b.selection_start!
    );

    const segments: React.ReactNode[] = [];
    let cursor = 0;

    for (const fb of sorted) {
      const start = fb.selection_start!;
      const end = Math.min(fb.selection_end!, content.length);

      if (start > content.length) continue;

      if (cursor < start) {
        segments.push(
          <span key={`t-${cursor}`}>{content.slice(cursor, start)}</span>
        );
      }

      segments.push(
        <span
          key={fb.id}
          className={cn(
            "cursor-pointer rounded-sm transition-colors",
            fb.status === "resolved"
              ? "bg-emerald-500/15"
              : "bg-gold-400/20 hover:bg-gold-400/30",
            activeFeedbackId === fb.id && "bg-gold-400/40 ring-1 ring-gold-400"
          )}
          style={{ pointerEvents: "auto" }}
          onClick={(e) => handleHighlightClick(fb, e)}
        >
          {content.slice(start, end)}
        </span>
      );

      cursor = end;
    }

    if (cursor < content.length) {
      segments.push(
        <span key={`t-${cursor}`}>{content.slice(cursor)}</span>
      );
    }

    // Add trailing newline to match textarea sizing
    segments.push(<span key="trailing">{"\n"}</span>);

    return segments;
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Prompt display */}
      {essay?.prompt && (
        <div className="mb-4 rounded-xl border border-navy-700/50 bg-navy-900/60 p-4">
          <p className="font-sans text-caption font-medium uppercase tracking-wider text-ivory-700">
            Essay Prompt
          </p>
          <p className="mt-2 font-sans text-body-sm italic text-ivory-400 leading-relaxed">
            {essay.prompt}
          </p>
        </div>
      )}

      {/* Writing area */}
      <div className="relative flex-1">
        {/* Highlight overlay */}
        {hasInlineFeedback && (
          <div
            ref={overlayRef}
            className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words rounded-xl border border-transparent p-6 font-serif text-body-lg leading-relaxed text-transparent"
            aria-hidden="true"
          >
            {renderHighlightedContent()}
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onScroll={handleScroll}
          placeholder="Start writing your essay..."
          className={cn(
            "relative z-10 min-h-[60vh] w-full resize-none rounded-xl border border-navy-700/50 bg-navy-900/40 p-6 font-serif text-body-lg leading-relaxed transition-colors placeholder:text-ivory-800 focus:border-gold-500/30 focus:outline-none focus:ring-2 focus:ring-gold-500/10",
            hasInlineFeedback
              ? "text-transparent caret-ivory-200"
              : "text-ivory-200"
          )}
          style={
            hasInlineFeedback ? { caretColor: "rgb(var(--ivory-200))" } : {}
          }
        />
      </div>

      {/* Word count bar */}
      <div className="mt-3 flex items-center justify-between rounded-lg border border-navy-700/30 bg-navy-900/40 px-4 py-2">
        <span className="font-sans text-caption text-ivory-700">
          {wordCount.toLocaleString()} {wordCount === 1 ? "word" : "words"}
        </span>
        {inlineFeedback.length > 0 && (
          <span className="font-sans text-caption text-gold-400">
            {inlineFeedback.filter((f) => f.status === "open").length} coach{" "}
            {inlineFeedback.filter((f) => f.status === "open").length === 1
              ? "comment"
              : "comments"}
          </span>
        )}
      </div>

      {/* Feedback popover */}
      {popoverFeedback && popoverAnchor && (
        <InlineFeedbackPopover
          feedback={popoverFeedback}
          anchorRect={popoverAnchor}
          onResolve={handleResolve}
          onClose={handleClosePopover}
        />
      )}
    </div>
  );
}
