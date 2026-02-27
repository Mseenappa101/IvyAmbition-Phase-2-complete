"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button, brandToast } from "@/components/ui";
import { uploadDocument } from "@/lib/actions/documents";
import { useDocumentsStore } from "@/hooks/use-documents-store";
import {
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_CATEGORY_ORDER,
  ACCEPTED_FILE_EXTENSIONS,
  ACCEPTED_FILE_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/constants/activities";
import type { DocumentCategory, DocumentWithUploader } from "@/types/database";

export function UploadZone() {
  const { addDocument, isUploading, setUploading } = useDocumentsStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [category, setCategory] = useState<DocumentCategory>("other");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];

      // Client-side validation
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        brandToast.error(
          "Invalid file type",
          "Accepted: PDF, DOC, DOCX, PNG, JPG"
        );
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        brandToast.error("File too large", "Maximum file size is 10MB.");
        return;
      }

      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const { data, error } = await uploadDocument(formData);

      if (error) {
        brandToast.error("Upload failed", error);
      } else if (data) {
        addDocument(data as DocumentWithUploader);
        brandToast.success("Uploaded", `"${file.name}" has been uploaded.`);
      }

      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [category, addDocument, setUploading]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
        isDragOver
          ? "border-gold-500 bg-gold-500/5"
          : "border-navy-700/50 bg-navy-900/30 hover:border-navy-600/50"
      }`}
    >
      {isUploading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-gold-400" />
          <p className="font-sans text-body-sm text-ivory-400">Uploading...</p>
        </div>
      ) : (
        <>
          <Upload className="mx-auto h-8 w-8 text-ivory-700" />
          <p className="mt-3 font-sans text-body-sm text-ivory-400">
            Drag and drop a file here, or{" "}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="font-medium text-gold-400 hover:text-gold-300"
            >
              browse
            </button>
          </p>
          <p className="mt-1 font-sans text-caption text-ivory-700">
            PDF, DOC, DOCX, PNG, JPG up to 10MB
          </p>

          <div className="mt-4 flex items-center justify-center gap-3">
            <label className="font-sans text-caption text-ivory-500">
              Category:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DocumentCategory)}
              className="rounded-lg border border-navy-700/50 bg-navy-900 px-3 py-1.5 font-sans text-caption text-ivory-300 focus:border-gold-500/50 focus:outline-none"
            >
              {DOCUMENT_CATEGORY_ORDER.map((cat) => (
                <option key={cat} value={cat} className="bg-navy-900">
                  {DOCUMENT_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose File
            </Button>
          </div>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FILE_EXTENSIONS}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </div>
  );
}
