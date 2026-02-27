"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { EssayFeedback } from "@/types/database";

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays < 1) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface InlineFeedbackPopoverProps {
  feedback: EssayFeedback;
  anchorRect: DOMRect;
  onResolve: (id: string) => void;
  onClose: () => void;
}

export function InlineFeedbackPopover({
  feedback,
  anchorRect,
  onResolve,
  onClose,
}: InlineFeedbackPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return createPortal(
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="fixed z-50 w-72 rounded-xl border border-navy-700/50 bg-navy-900/95 p-4 shadow-elevated backdrop-blur-sm"
      style={{
        top: anchorRect.bottom + 8,
        left: Math.min(anchorRect.left, window.innerWidth - 304),
      }}
    >
      <p className="font-sans text-body-sm text-ivory-300 leading-relaxed">
        {feedback.content}
      </p>
      <div className="mt-3 flex items-center justify-between border-t border-navy-700/50 pt-3">
        <span className="font-sans text-caption text-ivory-700">
          {formatRelativeDate(feedback.created_at)}
        </span>
        {feedback.status === "open" ? (
          <button
            onClick={() => onResolve(feedback.id)}
            className="flex items-center gap-1 font-sans text-caption font-medium text-gold-400 transition-colors hover:text-gold-300"
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
    </motion.div>,
    document.body
  );
}
