import { cn } from "@/lib/utils/cn";

// ─── Base Skeleton ──────────────────────────────────────────────────────────

export interface SkeletonProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

const roundedStyles: Record<string, string> = {
  sm: "rounded",
  md: "rounded-lg",
  lg: "rounded-2xl",
  full: "rounded-full",
};

export function Skeleton({ className, rounded = "md" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gradient-to-r from-ivory-300 via-ivory-200 to-ivory-300 bg-[length:200%_100%]",
        roundedStyles[rounded],
        className
      )}
    />
  );
}

// ─── Preset: Text Block ─────────────────────────────────────────────────────

export interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

// ─── Preset: Card ───────────────────────────────────────────────────────────

export interface SkeletonCardProps {
  className?: string;
  hasImage?: boolean;
}

export function SkeletonCard({ className, hasImage = false }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-ivory-400 bg-white",
        className
      )}
    >
      {hasImage && <Skeleton className="h-40 w-full rounded-none" />}
      <div className="space-y-4 p-6">
        <Skeleton className="h-5 w-3/4" />
        <SkeletonText lines={2} />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-16" rounded="full" />
          <Skeleton className="h-6 w-20" rounded="full" />
        </div>
      </div>
    </div>
  );
}

// ─── Preset: Table Row ──────────────────────────────────────────────────────

export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
}: SkeletonTableProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-ivory-400 bg-white",
        className
      )}
    >
      {/* Header */}
      <div className="flex gap-4 border-b border-ivory-400 bg-ivory-200/60 px-5 py-4">
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton
            key={i}
            className={cn("h-3", i === 0 ? "w-32" : "w-24")}
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }, (_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex items-center gap-4 border-b border-ivory-400 px-5 py-4 last:border-0"
        >
          {Array.from({ length: columns }, (_, colIdx) => (
            <Skeleton
              key={colIdx}
              className={cn(
                "h-4",
                colIdx === 0 ? "w-36" : colIdx === columns - 1 ? "w-16" : "w-24"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
