import { cn } from "@/lib/utils/cn";
import type { SchoolApplicationStatus } from "@/types/database";

interface StatusBadgeProps {
  status: SchoolApplicationStatus;
  size?: "sm" | "md";
  className?: string;
}

const statusConfig: Record<
  SchoolApplicationStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  researching: {
    label: "Researching",
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    dot: "bg-blue-400",
  },
  applying: {
    label: "Applying",
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
  submitted: {
    label: "Submitted",
    bg: "bg-gold-500/15",
    text: "text-gold-400",
    dot: "bg-gold-400",
  },
  accepted: {
    label: "Accepted",
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  waitlisted: {
    label: "Waitlisted",
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-rose-500/15",
    text: "text-rose-400",
    dot: "bg-rose-400",
  },
  enrolled: {
    label: "Enrolled",
    bg: "bg-emerald-500/15",
    text: "text-emerald-300",
    dot: "bg-emerald-300",
  },
};

export function StatusBadge({ status, size = "md", className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-sans font-medium",
        config.bg,
        config.text,
        size === "sm" ? "px-2 py-0.5 text-[0.6875rem]" : "px-2.5 py-1 text-caption",
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}

export function getStatusLabel(status: SchoolApplicationStatus): string {
  return statusConfig[status].label;
}

export const ALL_STATUSES: SchoolApplicationStatus[] = [
  "researching",
  "applying",
  "submitted",
  "accepted",
  "waitlisted",
  "rejected",
  "enrolled",
];

export const statusColumnColors: Record<SchoolApplicationStatus, string> = {
  researching: "border-t-blue-500",
  applying: "border-t-amber-500",
  submitted: "border-t-gold-500",
  accepted: "border-t-emerald-500",
  waitlisted: "border-t-amber-500",
  rejected: "border-t-rose-500",
  enrolled: "border-t-emerald-400",
};
