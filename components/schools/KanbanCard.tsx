"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarCheck, GripVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { StudentSchoolWithRequirements } from "@/types/database";

interface KanbanCardProps {
  school: StudentSchoolWithRequirements;
  isDragOverlay?: boolean;
}

export function KanbanCard({ school, isDragOverlay }: KanbanCardProps) {
  const router = useRouter();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: school.id,
    data: { status: school.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const completed = school.school_requirements.filter(
    (r) => r.is_completed
  ).length;
  const total = school.school_requirements.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const deadlineStr = school.deadline
    ? new Date(school.deadline + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const handleClick = () => {
    if (!isDragging && !isDragOverlay) {
      router.push(`/student/schools/${school.id}`);
    }
  };

  return (
    <div
      ref={!isDragOverlay ? setNodeRef : undefined}
      style={!isDragOverlay ? style : undefined}
      className={cn(
        "group cursor-pointer rounded-xl border border-navy-700/30 bg-navy-800/60 p-3.5 transition-all",
        !isDragOverlay && "hover:border-navy-600 hover:shadow-elevated",
        isDragOverlay && "shadow-lg shadow-navy-950/40 ring-1 ring-gold-500/30"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          className="mt-0.5 flex-shrink-0 cursor-grab text-ivory-800 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
          {...(isDragOverlay ? {} : { ...attributes, ...listeners })}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          {/* School name */}
          <h3 className="truncate font-serif text-body-sm font-semibold text-ivory-200">
            {school.school_name}
          </h3>

          {/* Deadline */}
          {deadlineStr && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <CalendarCheck className="h-3 w-3 flex-shrink-0 text-ivory-700" />
              <span className="font-sans text-caption text-ivory-700">
                {deadlineStr}
              </span>
            </div>
          )}

          {/* Progress bar */}
          {total > 0 && (
            <div className="mt-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="font-sans text-[0.625rem] text-ivory-700">
                  {completed}/{total} complete
                </span>
                <span className="font-sans text-[0.625rem] font-medium text-gold-400">
                  {progress}%
                </span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-navy-900/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
