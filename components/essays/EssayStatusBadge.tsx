"use client";

import { cn } from "@/lib/utils/cn";
import type { EssayStatus } from "@/types/database";

interface StatusConfig {
  label: string;
  bg: string;
  text: string;
  dot: string;
}

const statusConfig: Record<EssayStatus, StatusConfig> = {
  brainstorming: {
    label: "Brainstorming",
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    dot: "bg-blue-400",
  },
  outline: {
    label: "Outline",
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
  first_draft: {
    label: "First Draft",
    bg: "bg-gold-500/15",
    text: "text-gold-400",
    dot: "bg-gold-400",
  },
  revision: {
    label: "Revision",
    bg: "bg-purple-500/15",
    text: "text-purple-400",
    dot: "bg-purple-400",
  },
  coach_review: {
    label: "Coach Review",
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
  final: {
    label: "Final",
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
};

export const ALL_ESSAY_STATUSES: EssayStatus[] = [
  "brainstorming",
  "outline",
  "first_draft",
  "revision",
  "coach_review",
  "final",
];

export function getEssayStatusLabel(status: EssayStatus): string {
  return statusConfig[status]?.label ?? status;
}

interface EssayStatusBadgeProps {
  status: EssayStatus;
  size?: "sm" | "md";
  className?: string;
}

export function EssayStatusBadge({
  status,
  size = "sm",
  className,
}: EssayStatusBadgeProps) {
  const config = statusConfig[status];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-sans font-medium",
        config.bg,
        config.text,
        size === "sm" ? "px-2.5 py-0.5 text-caption" : "px-3 py-1 text-body-sm",
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
