"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { useSchoolsStore } from "@/hooks/use-schools-store";
import { updateSchoolStatus as updateSchoolStatusAction } from "@/lib/actions/schools";
import { brandToast } from "@/components/ui";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { ALL_STATUSES } from "./StatusBadge";
import type {
  SchoolApplicationStatus,
  StudentSchoolWithRequirements,
} from "@/types/database";

export function KanbanBoard() {
  const { schools, updateSchoolStatus } = useSchoolsStore();
  const [activeCard, setActiveCard] =
    useState<StudentSchoolWithRequirements | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  const schoolsByStatus = useCallback(
    (status: SchoolApplicationStatus) =>
      schools.filter((s) => s.status === status),
    [schools]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const card = schools.find((s) => s.id === event.active.id);
      if (card) setActiveCard(card);
    },
    [schools]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Check if we're over a column (status) or another card
      const isOverColumn = ALL_STATUSES.includes(
        overId as SchoolApplicationStatus
      );
      const newStatus = isOverColumn
        ? (overId as SchoolApplicationStatus)
        : (over.data.current?.status as SchoolApplicationStatus | undefined);

      if (!newStatus) return;

      const activeSchool = schools.find((s) => s.id === activeId);
      if (activeSchool && activeSchool.status !== newStatus) {
        updateSchoolStatus(activeId, newStatus);
      }
    },
    [schools, updateSchoolStatus]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveCard(null);

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      const isOverColumn = ALL_STATUSES.includes(
        overId as SchoolApplicationStatus
      );
      const newStatus = isOverColumn
        ? (overId as SchoolApplicationStatus)
        : (over.data.current?.status as SchoolApplicationStatus | undefined);

      if (!newStatus) return;

      // Persist to database
      const { error } = await updateSchoolStatusAction(activeId, newStatus);
      if (error) {
        brandToast.error("Update failed", "Could not update school status.");
      }
    },
    []
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {ALL_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            schools={schoolsByStatus(status)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeCard ? (
          <div className="w-[260px]">
            <KanbanCard school={activeCard} isDragOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
