import { create } from "zustand";
import type { Profile } from "@/types";

interface AppState {
  profile: Profile | null;
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  setProfile: (profile: Profile | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  profile: null,
  sidebarOpen: true,
  mobileSidebarOpen: false,
  setProfile: (profile) => set({ profile }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleMobileSidebar: () =>
    set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
}));
