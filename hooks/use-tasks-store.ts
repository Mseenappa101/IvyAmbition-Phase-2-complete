import { create } from "zustand";
import type { TaskWithSchool, TaskPriority, TaskStatus } from "@/types/database";

type TaskViewMode = "calendar" | "list";

interface TaskFilters {
  schoolId: string | null;
  priority: TaskPriority | null;
  status: TaskStatus | null;
}

interface TasksState {
  tasks: TaskWithSchool[];
  isLoading: boolean;
  isNewModalOpen: boolean;
  editingTask: TaskWithSchool | null;
  viewMode: TaskViewMode;
  currentMonth: Date;
  filters: TaskFilters;
  error: string | null;

  setTasks: (tasks: TaskWithSchool[]) => void;
  setLoading: (loading: boolean) => void;
  setNewModalOpen: (open: boolean) => void;
  setEditingTask: (task: TaskWithSchool | null) => void;
  setViewMode: (mode: TaskViewMode) => void;
  setCurrentMonth: (date: Date) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  setError: (error: string | null) => void;

  addTask: (task: TaskWithSchool) => void;
  removeTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<TaskWithSchool>) => void;
}

export const useTasksStore = create<TasksState>((set) => ({
  tasks: [],
  isLoading: true,
  isNewModalOpen: false,
  editingTask: null,
  viewMode: "calendar",
  currentMonth: new Date(),
  filters: { schoolId: null, priority: null, status: null },
  error: null,

  setTasks: (tasks) => set({ tasks, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setNewModalOpen: (isNewModalOpen) => set({ isNewModalOpen }),
  setEditingTask: (editingTask) => set({ editingTask }),
  setViewMode: (viewMode) => set({ viewMode }),
  setCurrentMonth: (currentMonth) => set({ currentMonth }),
  setFilters: (partial) =>
    set((s) => ({ filters: { ...s.filters, ...partial } })),
  setError: (error) => set({ error }),

  addTask: (task) =>
    set((s) => {
      const updated = [...s.tasks, task];
      updated.sort(
        (a, b) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      );
      return { tasks: updated };
    }),

  removeTask: (id) =>
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  updateTask: (id, updates) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
}));
