import { create } from "zustand";
import type { DocumentWithUploader } from "@/types/database";

interface DocumentsState {
  documents: DocumentWithUploader[];
  isLoading: boolean;
  isUploading: boolean;
  previewDocument: DocumentWithUploader | null;
  error: string | null;

  setDocuments: (documents: DocumentWithUploader[]) => void;
  setLoading: (loading: boolean) => void;
  setUploading: (uploading: boolean) => void;
  setPreviewDocument: (doc: DocumentWithUploader | null) => void;
  setError: (error: string | null) => void;

  addDocument: (doc: DocumentWithUploader) => void;
  removeDocument: (id: string) => void;
  updateDocumentNotes: (id: string, notes: string) => void;
}

export const useDocumentsStore = create<DocumentsState>((set) => ({
  documents: [],
  isLoading: true,
  isUploading: false,
  previewDocument: null,
  error: null,

  setDocuments: (documents) => set({ documents, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setUploading: (isUploading) => set({ isUploading }),
  setPreviewDocument: (previewDocument) => set({ previewDocument }),
  setError: (error) => set({ error }),

  addDocument: (doc) =>
    set((s) => ({ documents: [doc, ...s.documents] })),

  removeDocument: (id) =>
    set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),

  updateDocumentNotes: (id, notes) =>
    set((s) => ({
      documents: s.documents.map((d) =>
        d.id === id ? { ...d, notes } : d
      ),
    })),
}));
