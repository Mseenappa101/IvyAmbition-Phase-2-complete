import { create } from "zustand";
import type { EssayListItem } from "@/types/database";

interface EssaysState {
  essays: EssayListItem[];
  isLoading: boolean;
  isNewModalOpen: boolean;
  error: string | null;

  setEssays: (essays: EssayListItem[]) => void;
  setLoading: (loading: boolean) => void;
  setNewModalOpen: (open: boolean) => void;
  setError: (error: string | null) => void;

  addEssay: (essay: EssayListItem) => void;
  removeEssay: (id: string) => void;
  updateEssayInList: (id: string, updates: Partial<EssayListItem>) => void;
}

export const useEssaysStore = create<EssaysState>((set) => ({
  essays: [],
  isLoading: true,
  isNewModalOpen: false,
  error: null,

  setEssays: (essays) => set({ essays, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setNewModalOpen: (isNewModalOpen) => set({ isNewModalOpen }),
  setError: (error) => set({ error }),

  addEssay: (essay) =>
    set((s) => ({ essays: [essay, ...s.essays] })),

  removeEssay: (id) =>
    set((s) => ({ essays: s.essays.filter((e) => e.id !== id) })),

  updateEssayInList: (id, updates) =>
    set((s) => ({
      essays: s.essays.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    })),
}));
