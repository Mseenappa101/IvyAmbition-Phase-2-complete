import { create } from "zustand";
import type { Activity } from "@/types/database";

interface ActivitiesState {
  activities: Activity[];
  isLoading: boolean;
  isNewModalOpen: boolean;
  expandedId: string | null;
  error: string | null;

  setActivities: (activities: Activity[]) => void;
  setLoading: (loading: boolean) => void;
  setNewModalOpen: (open: boolean) => void;
  setExpandedId: (id: string | null) => void;
  setError: (error: string | null) => void;

  addActivity: (activity: Activity) => void;
  removeActivity: (id: string) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  reorderActivities: (activities: Activity[]) => void;
}

export const useActivitiesStore = create<ActivitiesState>((set) => ({
  activities: [],
  isLoading: true,
  isNewModalOpen: false,
  expandedId: null,
  error: null,

  setActivities: (activities) => set({ activities, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setNewModalOpen: (isNewModalOpen) => set({ isNewModalOpen }),
  setExpandedId: (expandedId) => set({ expandedId }),
  setError: (error) => set({ error }),

  addActivity: (activity) =>
    set((s) => ({ activities: [...s.activities, activity] })),

  removeActivity: (id) =>
    set((s) => ({ activities: s.activities.filter((a) => a.id !== id) })),

  updateActivity: (id, updates) =>
    set((s) => ({
      activities: s.activities.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    })),

  reorderActivities: (activities) => set({ activities }),
}));
