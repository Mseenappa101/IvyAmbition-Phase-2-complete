"use client";

import Link from "next/link";
import { FileEdit, Clock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { EssayStatusBadge } from "./EssayStatusBadge";
import { ROUTES } from "@/lib/constants/routes";
import type { EssayListItem } from "@/types/database";

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface EssayCardProps {
  essay: EssayListItem;
}

export function EssayCard({ essay }: EssayCardProps) {
  const hasUnreadFeedback = essay.essay_feedback?.some(
    (f) => f.status === "open"
  );

  return (
    <Link
      href={ROUTES.essays.detail(essay.id)}
      className="group relative block rounded-2xl border border-navy-700/50 bg-navy-900/80 p-5 transition-all hover:border-navy-600/50 hover:bg-navy-900"
    >
      {/* Unread feedback indicator */}
      {hasUnreadFeedback && (
        <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-gold-400 ring-2 ring-navy-900" />
      )}

      {/* Title */}
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-800/80">
          <FileEdit className="h-4 w-4 text-ivory-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-serif text-heading-sm text-ivory-200 group-hover:text-gold-400 transition-colors">
            {essay.title}
          </h3>
          <p className="mt-0.5 font-sans text-caption text-ivory-700">
            {essay.student_schools?.school_name ?? "General Essay"}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <EssayStatusBadge status={essay.status} />
        <div className="flex items-center gap-3 font-sans text-caption text-ivory-700">
          <span>{essay.word_count.toLocaleString()} words</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeDate(essay.updated_at)}
          </span>
        </div>
      </div>
    </Link>
  );
}
