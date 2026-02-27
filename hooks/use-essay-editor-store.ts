import { create } from "zustand";
import type {
  EssayWithRelations,
  EssayVersion,
  EssayStatus,
} from "@/types/database";

interface EssayEditorState {
  essay: EssayWithRelations | null;
  isLoading: boolean;
  error: string | null;

  // Editor state
  content: string;
  wordCount: number;
  isSaving: boolean;
  lastSavedAt: Date | null;
  lastSavedContent: string;
  lastVersionContent: string;

  // Sidebar state
  sidebarOpen: boolean;
  sidebarTab: "versions" | "feedback" | "status";

  // Feedback state
  activeFeedbackId: string | null;

  // Setters
  setEssay: (essay: EssayWithRelations) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setContent: (content: string) => void;
  setWordCount: (wordCount: number) => void;
  setSaving: (saving: boolean) => void;
  setLastSavedAt: (date: Date) => void;
  setLastSavedContent: (content: string) => void;
  setLastVersionContent: (content: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarTab: (tab: "versions" | "feedback" | "status") => void;
  setActiveFeedbackId: (id: string | null) => void;

  // Optimistic updaters
  updateStatus: (status: EssayStatus) => void;
  updateTitle: (title: string) => void;
  addVersion: (version: EssayVersion) => void;
  resolveFeedbackItem: (feedbackId: string) => void;
}

export const useEssayEditorStore = create<EssayEditorState>((set) => ({
  essay: null,
  isLoading: true,
  error: null,

  content: "",
  wordCount: 0,
  isSaving: false,
  lastSavedAt: null,
  lastSavedContent: "",
  lastVersionContent: "",

  sidebarOpen: true,
  sidebarTab: "versions",

  activeFeedbackId: null,

  setEssay: (essay) =>
    set({
      essay,
      content: essay.content,
      wordCount: essay.word_count,
      lastSavedContent: essay.content,
      lastVersionContent: essay.content,
      isLoading: false,
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setContent: (content) => {
    const wordCount = content.trim()
      ? content.trim().split(/\s+/).length
      : 0;
    set({ content, wordCount });
  },
  setWordCount: (wordCount) => set({ wordCount }),
  setSaving: (isSaving) => set({ isSaving }),
  setLastSavedAt: (lastSavedAt) => set({ lastSavedAt }),
  setLastSavedContent: (lastSavedContent) => set({ lastSavedContent }),
  setLastVersionContent: (lastVersionContent) => set({ lastVersionContent }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSidebarTab: (sidebarTab) => set({ sidebarTab }),
  setActiveFeedbackId: (activeFeedbackId) => set({ activeFeedbackId }),

  updateStatus: (status) =>
    set((s) =>
      s.essay ? { essay: { ...s.essay, status } } : {}
    ),

  updateTitle: (title) =>
    set((s) =>
      s.essay ? { essay: { ...s.essay, title } } : {}
    ),

  addVersion: (version) =>
    set((s) =>
      s.essay
        ? {
            essay: {
              ...s.essay,
              essay_versions: [version, ...s.essay.essay_versions],
              version_number: version.version_number,
            },
          }
        : {}
    ),

  resolveFeedbackItem: (feedbackId) =>
    set((s) =>
      s.essay
        ? {
            essay: {
              ...s.essay,
              essay_feedback: s.essay.essay_feedback.map((f) =>
                f.id === feedbackId ? { ...f, status: "resolved" as const } : f
              ),
            },
          }
        : {}
    ),
}));
