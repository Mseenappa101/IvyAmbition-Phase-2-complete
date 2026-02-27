"use client";

import { useCallback } from "react";
import { format, parseISO, isBefore, startOfDay } from "date-fns";
import { Check } from "lucide-react";
import { brandToast } from "@/components/ui";
import { updateTaskStatus } from "@/lib/actions/tasks";
import { useTasksStore } from "@/hooks/use-tasks-store";
import {
  TASK_PRIORITY_TEXT_COLORS,
  TASK_PRIORITY_OPTIONS,
} from "@/lib/constants/activities";
import type { TaskWithSchool } from "@/types/database";

interface TaskCardProps {
  task: TaskWithSchool;
}

export function TaskCard({ task }: TaskCardProps) {
  const { updateTask, setEditingTask, setNewModalOpen } = useTasksStore();

  const isOverdue =
    task.status !== "completed" &&
    isBefore(parseISO(task.due_date), startOfDay(new Date()));

  const isCompleted = task.status === "completed";

  const handleToggleComplete = useCallback(async () => {
    const newStatus = isCompleted ? "pending" : "completed";
    updateTask(task.id, { status: newStatus });

    const { error } = await updateTaskStatus(task.id, newStatus);
    if (error) {
      brandToast.error("Error", "Could not update task status.");
      updateTask(task.id, { status: task.status });
    }
  }, [isCompleted, task.id, task.status, updateTask]);

  const handleEdit = () => {
    setEditingTask(task);
    setNewModalOpen(true);
  };

  const priorityLabel =
    TASK_PRIORITY_OPTIONS.find((p) => p.value === task.priority)?.label ?? task.priority;

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${
        isOverdue
          ? "border-burgundy-500/30 bg-burgundy-500/5"
          : "border-navy-700/50 bg-navy-900/80 hover:border-navy-600/50"
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggleComplete}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
          isCompleted
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-navy-600 hover:border-gold-500/50"
        }`}
      >
        {isCompleted && <Check className="h-3 w-3" />}
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <button
          onClick={handleEdit}
          className={`text-left font-sans text-body-sm font-medium transition-colors hover:text-gold-400 ${
            isCompleted
              ? "text-ivory-600 line-through"
              : "text-ivory-200"
          }`}
        >
          {task.title}
        </button>

        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          {/* Due date */}
          <span
            className={`font-sans text-caption ${
              isOverdue ? "font-medium text-burgundy-400" : "text-ivory-600"
            }`}
          >
            {isOverdue ? "Overdue: " : ""}
            {format(parseISO(task.due_date), "MMM d, yyyy")}
          </span>

          {/* School */}
          {task.student_schools?.school_name && (
            <>
              <span className="text-navy-600">·</span>
              <span className="font-sans text-caption text-ivory-600">
                {task.student_schools.school_name}
              </span>
            </>
          )}

          {/* Priority */}
          <span
            className={`font-sans text-caption font-medium ${
              TASK_PRIORITY_TEXT_COLORS[task.priority]
            }`}
          >
            {priorityLabel}
          </span>
        </div>

        {/* Description preview */}
        {task.description && (
          <p className="mt-1 truncate font-sans text-caption text-ivory-700">
            {task.description}
          </p>
        )}
      </div>
    </div>
  );
}
