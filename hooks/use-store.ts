import { create } from "zustand";
import type { Profile } from "@/types";

interface AppState {
  profile: Profile | null;
  sidebarOpen: boolean;
  setProfile: (profile: Profile | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  profile: null,
  sidebarOpen: true,
  setProfile: (profile) => set({ profile }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
