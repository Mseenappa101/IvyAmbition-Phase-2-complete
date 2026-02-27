"use client";

import { useState } from "react";
import { FileText, Image as ImageIcon, Trash2, Download } from "lucide-react";
import { format } from "date-fns";
import { brandToast } from "@/components/ui";
import { deleteDocument } from "@/lib/actions/documents";
import { useDocumentsStore } from "@/hooks/use-documents-store";
import type { DocumentWithUploader } from "@/types/database";

interface DocumentCardProps {
  document: DocumentWithUploader;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) {
    return <ImageIcon className="h-8 w-8 text-emerald-400" />;
  }
  return <FileText className="h-8 w-8 text-gold-400" />;
}

export function DocumentCard({ document: doc }: DocumentCardProps) {
  const { removeDocument, setPreviewDocument } = useDocumentsStore();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    removeDocument(doc.id);

    const { error } = await deleteDocument(doc.id);
    if (error) {
      brandToast.error("Error", "Could not delete document.");
    }
    setDeleting(false);
    setConfirmDelete(false);
  };

  const uploaderName =
    doc.profiles?.first_name && doc.profiles?.last_name
      ? `${doc.profiles.first_name} ${doc.profiles.last_name}`
      : "Unknown";

  return (
    <div className="group rounded-2xl border border-navy-700/50 bg-navy-900/80 p-4 transition-colors hover:border-navy-600/50">
      {/* Click to preview */}
      <button
        onClick={() => setPreviewDocument(doc)}
        className="flex w-full items-start gap-3 text-left"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-800/80">
          {getFileIcon(doc.file_type)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-sans text-body-sm font-medium text-ivory-200">
            {doc.file_name}
          </h3>
          <p className="mt-0.5 font-sans text-caption text-ivory-600">
            {formatFileSize(doc.file_size)} · {format(new Date(doc.created_at), "MMM d, yyyy")}
          </p>
          <p className="mt-0.5 font-sans text-caption text-ivory-700">
            Uploaded by {uploaderName}
          </p>
        </div>
      </button>

      {/* Notes */}
      {doc.notes && (
        <p className="mt-2 truncate font-sans text-caption italic text-ivory-600">
          {doc.notes}
        </p>
      )}

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2 border-t border-navy-700/30 pt-3 opacity-0 transition-opacity group-hover:opacity-100">
        <a
          href={doc.file_url}
          download={doc.file_name}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-lg px-2 py-1 font-sans text-caption text-ivory-500 transition-colors hover:bg-navy-800 hover:text-ivory-300"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </a>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className={`ml-auto flex items-center gap-1 rounded-lg px-2 py-1 font-sans text-caption transition-colors ${
            confirmDelete
              ? "text-burgundy-400 hover:bg-burgundy-500/10"
              : "text-ivory-600 hover:bg-navy-800 hover:text-ivory-400"
          }`}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {confirmDelete ? "Confirm?" : "Delete"}
        </button>
      </div>
    </div>
  );
}
