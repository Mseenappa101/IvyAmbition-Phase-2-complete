"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Trophy } from "lucide-react";
import { Button, brandToast } from "@/components/ui";
import { useActivitiesStore } from "@/hooks/use-activities-store";
import {
  fetchStudentActivities,
  getStudentApplicationType,
  updateActivity as updateActivityAction,
  deleteActivity as deleteActivityAction,
  reorderActivities as reorderActivitiesAction,
} from "@/lib/actions/activities";
import { ActivityCard } from "./ActivityCard";
import { NewActivityModal } from "./NewActivityModal";
import type { Activity, ApplicationType } from "@/types/database";

// ─── Sortable Wrapper ──────────────────────────────────────────────────────

function SortableItem({
  activity,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDelete,
  applicationType,
}: {
  activity: Activity;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Record<string, unknown>) => void;
  onDelete: () => void;
  applicationType: ApplicationType;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ActivityCard
        activity={activity}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        onUpdate={onUpdate}
        onDelete={onDelete}
        applicationType={applicationType}
        dragHandleProps={listeners}
      />
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export function ActivitiesPageClient() {
  const {
    activities,
    isLoading,
    isNewModalOpen,
    expandedId,
    error,
    setActivities,
    setError,
    setNewModalOpen,
    setExpandedId,
    updateActivity,
    removeActivity,
    reorderActivities,
  } = useActivitiesStore();

  const [applicationType, setApplicationType] =
    useState<ApplicationType>("undergraduate");
  const [activeItem, setActiveItem] = useState<Activity | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  // Load data
  useEffect(() => {
    const load = async () => {
      const [activitiesRes, typeRes] = await Promise.all([
        fetchStudentActivities(),
        getStudentApplicationType(),
      ]);

      if (activitiesRes.error) {
        setError(activitiesRes.error);
        return;
      }
      setActivities((activitiesRes.data as Activity[]) ?? []);

      if (typeRes.applicationType) {
        setApplicationType(typeRes.applicationType);
      }
    };
    load();
  }, [setActivities, setError]);

  const handleUpdate = useCallback(
    async (activityId: string, updates: Record<string, unknown>) => {
      // Optimistic update
      const storeUpdates: Partial<Activity> = {};
      if (updates.activityName !== undefined) storeUpdates.activity_name = updates.activityName as string;
      if (updates.category !== undefined) storeUpdates.category = updates.category as Activity["category"];
      if (updates.organization !== undefined) storeUpdates.organization = updates.organization as string;
      if (updates.positionTitle !== undefined) storeUpdates.position_title = updates.positionTitle as string;
      if (updates.description !== undefined) {
        storeUpdates.description = updates.description as string;
        storeUpdates.character_count = (updates.description as string).length;
      }
      if (updates.startDate !== undefined) storeUpdates.start_date = updates.startDate as string | null;
      if (updates.endDate !== undefined) storeUpdates.end_date = updates.endDate as string | null;
      if (updates.hoursPerWeek !== undefined) storeUpdates.hours_per_week = updates.hoursPerWeek as number;
      if (updates.weeksPerYear !== undefined) storeUpdates.weeks_per_year = updates.weeksPerYear as number;
      if (updates.gradeLevels !== undefined) storeUpdates.grade_levels = updates.gradeLevels as string[];

      updateActivity(activityId, storeUpdates);
      setExpandedId(null);

      const { error: saveError } = await updateActivityAction(activityId, updates);
      if (saveError) {
        brandToast.error("Error", "Could not save changes.");
      } else {
        brandToast.success("Saved", "Activity updated.");
      }
    },
    [updateActivity, setExpandedId]
  );

  const handleDelete = useCallback(
    async (activityId: string) => {
      removeActivity(activityId);
      const { error: deleteError } = await deleteActivityAction(activityId);
      if (deleteError) {
        brandToast.error("Error", "Could not delete activity.");
      }
    },
    [removeActivity]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const item = activities.find((a) => a.id === event.active.id);
      if (item) setActiveItem(item);
    },
    [activities]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveItem(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = activities.findIndex((a) => a.id === active.id);
      const newIndex = activities.findIndex((a) => a.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(activities, oldIndex, newIndex).map(
        (a, i) => ({ ...a, ranking: i })
      );

      reorderActivities(reordered);

      const orderedIds = reordered.map((a) => a.id);
      const { error: reorderError } = await reorderActivitiesAction(orderedIds);
      if (reorderError) {
        brandToast.error("Error", "Could not save new order.");
      }
    },
    [activities, reorderActivities]
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 animate-pulse rounded-lg bg-navy-800/60" />
            <div className="mt-2 h-4 w-72 animate-pulse rounded bg-navy-800/40" />
          </div>
          <div className="h-10 w-36 animate-pulse rounded-lg bg-navy-800/60" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl border border-navy-700/30 bg-navy-900/40"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="font-sans text-body text-burgundy-500">
          Failed to load activities: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-display text-ivory-200">
            My Activities
          </h1>
          <p className="mt-1 font-sans text-body-sm text-ivory-600">
            Manage and rank your extracurricular activities.
          </p>
        </div>
        <Button
          onClick={() => setNewModalOpen(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          Add Activity
        </Button>
      </div>

      {/* Summary bar */}
      {activities.length > 0 && (
        <div className="flex items-center gap-4 rounded-xl border border-navy-700/30 bg-navy-900/40 px-4 py-2.5">
          <span className="font-sans text-body-sm text-ivory-400">
            <span className="font-medium text-ivory-200">
              {activities.length}
            </span>{" "}
            {activities.length === 1 ? "activity" : "activities"}
          </span>
          {applicationType === "undergraduate" && (
            <span className="font-sans text-caption text-ivory-600">
              Common App allows up to 10 activities
            </span>
          )}
          <span className="ml-auto font-sans text-caption text-ivory-600">
            Drag to reorder by importance
          </span>
        </div>
      )}

      {/* Empty State */}
      {activities.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy-700/50 bg-navy-900/30 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-800/80">
            <Trophy className="h-7 w-7 text-ivory-700" />
          </div>
          <h3 className="mt-4 font-serif text-heading-sm text-ivory-300">
            No activities yet
          </h3>
          <p className="mt-1 max-w-sm font-sans text-body-sm text-ivory-700">
            Add your extracurricular activities, work experience, and
            community involvement. Rank them by importance.
          </p>
          <Button
            className="mt-6"
            onClick={() => setNewModalOpen(true)}
            icon={<Plus className="h-4 w-4" />}
          >
            Add Your First Activity
          </Button>
        </div>
      )}

      {/* Activity list with DnD */}
      {activities.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={activities.map((a) => a.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {activities.map((activity) => (
                <SortableItem
                  key={activity.id}
                  activity={activity}
                  isExpanded={expandedId === activity.id}
                  onToggleExpand={() =>
                    setExpandedId(
                      expandedId === activity.id ? null : activity.id
                    )
                  }
                  onUpdate={(updates) => handleUpdate(activity.id, updates)}
                  onDelete={() => handleDelete(activity.id)}
                  applicationType={applicationType}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeItem ? (
              <div className="w-full">
                <ActivityCard
                  activity={activeItem}
                  isExpanded={false}
                  onToggleExpand={() => {}}
                  onUpdate={() => {}}
                  onDelete={() => {}}
                  applicationType={applicationType}
                  isDragOverlay
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Modal */}
      <NewActivityModal
        open={isNewModalOpen}
        onClose={() => setNewModalOpen(false)}
        applicationType={applicationType}
      />
    </div>
  );
}
