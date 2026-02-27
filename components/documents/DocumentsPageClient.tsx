"use client";

import { useEffect, useMemo } from "react";
import { FolderOpen } from "lucide-react";
import { fetchStudentDocuments } from "@/lib/actions/documents";
import { useDocumentsStore } from "@/hooks/use-documents-store";
import {
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_CATEGORY_ORDER,
} from "@/lib/constants/activities";
import { UploadZone } from "./UploadZone";
import { DocumentCard } from "./DocumentCard";
import { DocumentPreviewModal } from "./DocumentPreviewModal";
import type { DocumentWithUploader, DocumentCategory } from "@/types/database";

export function DocumentsPageClient() {
  const { documents, isLoading, error, setDocuments, setError } =
    useDocumentsStore();

  useEffect(() => {
    const load = async () => {
      const { data, error: fetchError } = await fetchStudentDocuments();
      if (fetchError) {
        setError(fetchError);
        return;
      }
      setDocuments((data as DocumentWithUploader[]) ?? []);
    };
    load();
  }, [setDocuments, setError]);

  const grouped = useMemo(() => {
    const groups = new Map<DocumentCategory, DocumentWithUploader[]>();
    documents.forEach((doc) => {
      const cat = doc.category;
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(doc);
    });
    return groups;
  }, [documents]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 animate-pulse rounded-lg bg-navy-800/60" />
            <div className="mt-2 h-4 w-72 animate-pulse rounded bg-navy-800/40" />
          </div>
        </div>
        <div className="h-32 animate-pulse rounded-2xl border border-navy-700/30 bg-navy-900/40" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-navy-700/30 bg-navy-900/40"
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
          Failed to load documents: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-display text-ivory-200">
          Document Vault
        </h1>
        <p className="mt-1 font-sans text-body-sm text-ivory-600">
          Upload and organize transcripts, test scores, letters of
          recommendation, and more.
        </p>
      </div>

      {/* Upload Zone */}
      <UploadZone />

      {/* Empty State */}
      {documents.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy-700/50 bg-navy-900/30 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-800/80">
            <FolderOpen className="h-7 w-7 text-ivory-700" />
          </div>
          <h3 className="mt-4 font-serif text-heading-sm text-ivory-300">
            No documents yet
          </h3>
          <p className="mt-1 max-w-sm font-sans text-body-sm text-ivory-700">
            Upload your transcripts, test scores, resumes, and other
            application documents to keep everything in one place.
          </p>
        </div>
      )}

      {/* Documents grouped by category */}
      {DOCUMENT_CATEGORY_ORDER.filter((cat) => grouped.has(cat)).map((cat) => (
        <section key={cat}>
          <h2 className="mb-4 font-serif text-heading text-ivory-300">
            {DOCUMENT_CATEGORY_LABELS[cat]}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {grouped.get(cat)!.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </section>
      ))}

      {/* Preview Modal */}
      <DocumentPreviewModal />
    </div>
  );
}
