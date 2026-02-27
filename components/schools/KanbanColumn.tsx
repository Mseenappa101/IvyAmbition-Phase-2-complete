"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils/cn";
import { KanbanCard } from "./KanbanCard";
import {
  getStatusLabel,
  statusColumnColors,
} from "./StatusBadge";
import type { SchoolApplicationStatus, StudentSchoolWithRequirements } from "@/types/database";

interface KanbanColumnProps {
  status: SchoolApplicationStatus;
  schools: StudentSchoolWithRequirements[];
}

export function KanbanColumn({ status, schools }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  const ids = schools.map((s) => s.id);

  return (
    <div
      className={cn(
        "flex min-w-[260px] flex-col rounded-2xl border-t-2 border border-navy-700/50 bg-navy-900/40 transition-colors",
        statusColumnColors[status],
        isOver && "border-gold-500/40 bg-navy-900/60"
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3.5 py-3">
        <h3 className="font-sans text-caption font-semibold uppercase tracking-wider text-ivory-600">
          {getStatusLabel(status)}
        </h3>
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-navy-800 px-1.5 font-sans text-[0.625rem] font-semibold text-ivory-700">
          {schools.length}
        </span>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className="flex flex-1 flex-col gap-2 px-2.5 pb-3 min-h-[80px]"
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {schools.map((school) => (
            <KanbanCard key={school.id} school={school} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
