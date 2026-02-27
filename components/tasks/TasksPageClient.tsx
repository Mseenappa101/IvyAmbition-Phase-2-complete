"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, CalendarDays, List } from "lucide-react";
import { Button, brandToast } from "@/components/ui";
import { fetchStudentTasks } from "@/lib/actions/tasks";
import { fetchStudentSchools } from "@/lib/actions/schools";
import { useTasksStore } from "@/hooks/use-tasks-store";
import {
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
} from "@/lib/constants/activities";
import { CalendarView } from "./CalendarView";
import { TaskListView } from "./TaskListView";
import { NewTaskModal } from "./NewTaskModal";
import type { TaskWithSchool, StudentSchool } from "@/types/database";

export function TasksPageClient() {
  const {
    tasks,
    isLoading,
    isNewModalOpen,
    viewMode,
    currentMonth,
    filters,
    error,
    setTasks,
    setError,
    setNewModalOpen,
    setViewMode,
    setCurrentMonth,
    setFilters,
  } = useTasksStore();

  const [schools, setSchools] = useState<StudentSchool[]>([]);

  // Load data
  useEffect(() => {
    const load = async () => {
      const [tasksRes, schoolsRes] = await Promise.all([
        fetchStudentTasks(),
        fetchStudentSchools(),
      ]);

      if (tasksRes.error) {
        setError(tasksRes.error);
        return;
      }
      setTasks((tasksRes.data as TaskWithSchool[]) ?? []);

      if (schoolsRes.data) {
        setSchools(schoolsRes.data as StudentSchool[]);
      }
    };
    load();
  }, [setTasks, setError]);

  // Apply filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.schoolId && task.student_school_id !== filters.schoolId)
        return false;
      if (filters.priority && task.priority !== filters.priority)
        return false;
      if (filters.status && task.status !== filters.status) return false;
      return true;
    });
  }, [tasks, filters]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-52 animate-pulse rounded-lg bg-navy-800/60" />
            <div className="mt-2 h-4 w-72 animate-pulse rounded bg-navy-800/40" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded-lg bg-navy-800/60" />
        </div>
        <div className="h-96 animate-pulse rounded-2xl border border-navy-700/30 bg-navy-900/40" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="font-sans text-body text-burgundy-500">
          Failed to load tasks: {error}
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
            Tasks & Deadlines
          </h1>
          <p className="mt-1 font-sans text-body-sm text-ivory-600">
            Track your application tasks, deadlines, and milestones.
          </p>
        </div>
        <Button
          onClick={() => setNewModalOpen(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          Add Task
        </Button>
      </div>

      {/* View Toggle + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* View toggle */}
        <div className="flex rounded-lg border border-navy-700/50 bg-navy-900/60">
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-1.5 rounded-l-lg px-3 py-1.5 font-sans text-caption transition-colors ${
              viewMode === "calendar"
                ? "bg-gold-500/10 text-gold-400"
                : "text-ivory-600 hover:text-ivory-400"
            }`}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Calendar
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 rounded-r-lg px-3 py-1.5 font-sans text-caption transition-colors ${
              viewMode === "list"
                ? "bg-gold-500/10 text-gold-400"
                : "text-ivory-600 hover:text-ivory-400"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            List
          </button>
        </div>

        {/* Filters */}
        <select
          value={filters.schoolId ?? ""}
          onChange={(e) =>
            setFilters({ schoolId: e.target.value || null })
          }
          className="rounded-lg border border-navy-700/50 bg-navy-900/60 px-3 py-1.5 font-sans text-caption text-ivory-300 focus:border-gold-500/50 focus:outline-none"
        >
          <option value="" className="bg-navy-900">
            All Schools
          </option>
          {schools.map((s) => (
            <option key={s.id} value={s.id} className="bg-navy-900">
              {s.school_name}
            </option>
          ))}
        </select>

        <select
          value={filters.priority ?? ""}
          onChange={(e) =>
            setFilters({
              priority: (e.target.value || null) as typeof filters.priority,
            })
          }
          className="rounded-lg border border-navy-700/50 bg-navy-900/60 px-3 py-1.5 font-sans text-caption text-ivory-300 focus:border-gold-500/50 focus:outline-none"
        >
          <option value="" className="bg-navy-900">
            All Priorities
          </option>
          {TASK_PRIORITY_OPTIONS.map((p) => (
            <option key={p.value} value={p.value} className="bg-navy-900">
              {p.label}
            </option>
          ))}
        </select>

        <select
          value={filters.status ?? ""}
          onChange={(e) =>
            setFilters({
              status: (e.target.value || null) as typeof filters.status,
            })
          }
          className="rounded-lg border border-navy-700/50 bg-navy-900/60 px-3 py-1.5 font-sans text-caption text-ivory-300 focus:border-gold-500/50 focus:outline-none"
        >
          <option value="" className="bg-navy-900">
            All Statuses
          </option>
          {TASK_STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value} className="bg-navy-900">
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy-700/50 bg-navy-900/30 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-800/80">
            <CalendarDays className="h-7 w-7 text-ivory-700" />
          </div>
          <h3 className="mt-4 font-serif text-heading-sm text-ivory-300">
            No tasks yet
          </h3>
          <p className="mt-1 max-w-sm font-sans text-body-sm text-ivory-700">
            Add tasks and deadlines to stay on top of your applications.
            Track everything from transcript requests to submission
            deadlines.
          </p>
          <Button
            className="mt-6"
            onClick={() => setNewModalOpen(true)}
            icon={<Plus className="h-4 w-4" />}
          >
            Add Your First Task
          </Button>
        </div>
      )}

      {/* Calendar View */}
      {tasks.length > 0 && viewMode === "calendar" && (
        <CalendarView
          tasks={filteredTasks}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
        />
      )}

      {/* List View */}
      {tasks.length > 0 && viewMode === "list" && (
        <TaskListView tasks={filteredTasks} />
      )}

      {/* Modal */}
      <NewTaskModal
        open={isNewModalOpen}
        onClose={() => setNewModalOpen(false)}
      />
    </div>
  );
}
