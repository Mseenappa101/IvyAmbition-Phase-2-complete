"use client";

import { useEffect, useState, useRef } from "react";
import {
  FolderOpen,
  Upload,
  Download,
  FileText,
  Image,
  Save,
} from "lucide-react";
import { brandToast } from "@/components/ui";
import { formatDate } from "@/lib/utils/format";
import {
  fetchStudentDocumentsForCoach,
  uploadDocumentForStudent,
  updateDocumentNotesForCoach,
} from "@/lib/actions/coach";

interface Props {
  studentId: string;
}

interface DocumentData {
  id: string;
  file_name: string;
  file_type: string;
  file_url: string;
  file_size: number;
  category: string;
  notes: string | null;
  created_at: string;
  profiles: { first_name: string; last_name: string };
}

const CATEGORY_ORDER = [
  "transcript",
  "test_scores",
  "resume",
  "letter_of_rec",
  "financial",
  "essay_draft",
  "other",
];

const categoryLabels: Record<string, string> = {
  transcript: "Transcripts",
  test_scores: "Test Scores",
  resume: "Resumes",
  letter_of_rec: "Letters of Recommendation",
  financial: "Financial Documents",
  essay_draft: "Essay Drafts",
  other: "Other",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsTab({ studentId }: Props) {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("other");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await fetchStudentDocumentsForCoach(studentId);
      if (error) {
        brandToast.error(error);
      } else if (data) {
        setDocuments(data as unknown as DocumentData[]);
      }
      setLoading(false);
    }
    load();
  }, [studentId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", uploadCategory);

    const { data, error } = await uploadDocumentForStudent(
      studentId,
      formData
    );

    if (error) {
      brandToast.error(error);
    } else if (data) {
      brandToast.success("Document uploaded");
      setDocuments((prev) => [data as unknown as DocumentData, ...prev]);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const saveNotes = async (docId: string) => {
    const notes = editingNotes[docId] ?? "";
    setSavingNoteId(docId);

    const { error } = await updateDocumentNotesForCoach(docId, notes);
    if (error) {
      brandToast.error(error);
    } else {
      brandToast.success("Notes saved");
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, notes } : d))
      );
      setEditingNotes((prev) => {
        const next = { ...prev };
        delete next[docId];
        return next;
      });
    }
    setSavingNoteId(null);
  };

  // Group by category
  const grouped: Record<string, DocumentData[]> = {};
  for (const doc of documents) {
    const cat = doc.category || "other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(doc);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-24 animate-pulse rounded-2xl border border-navy-700/50 bg-navy-900/80" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-navy-700/50 bg-navy-900/80"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div className="rounded-2xl border border-dashed border-navy-700/50 bg-navy-900/80 p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10">
            <Upload className="h-6 w-6 text-gold-400" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="font-sans text-body-sm font-medium text-ivory-200">
              Upload Document for Student
            </p>
            <p className="mt-0.5 font-sans text-caption text-ivory-700">
              PDF, DOC, DOCX, PNG, JPG (max 10MB)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="rounded-lg border border-navy-700/50 bg-navy-900/60 px-3 py-2 font-sans text-body-sm text-ivory-300 focus:border-gold-500/50 focus:outline-none"
            >
              {CATEGORY_ORDER.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryLabels[cat]}
                </option>
              ))}
            </select>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2 font-sans text-body-sm font-medium text-navy-950 transition-colors hover:bg-gold-400 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Choose File"}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUpload}
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            className="hidden"
          />
        </div>
      </div>

      {/* Documents by Category */}
      {documents.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl border border-navy-700/50 bg-navy-900/80 py-16">
          <div className="text-center">
            <FolderOpen className="mx-auto h-8 w-8 text-ivory-800" />
            <p className="mt-2 font-sans text-body-sm text-ivory-600">
              No documents yet
            </p>
          </div>
        </div>
      ) : (
        CATEGORY_ORDER.filter((cat) => grouped[cat]?.length > 0).map(
          (cat) => (
            <div key={cat}>
              <h3 className="mb-3 font-sans text-body-sm font-medium text-ivory-400">
                {categoryLabels[cat]}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {grouped[cat].map((doc) => {
                  const isImage = doc.file_type.startsWith("image/");
                  const isEditing = editingNotes[doc.id] !== undefined;
                  const hasUnsavedNotes =
                    isEditing && editingNotes[doc.id] !== (doc.notes ?? "");

                  return (
                    <div
                      key={doc.id}
                      className="rounded-xl border border-navy-700/30 bg-navy-800/50 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-900/60">
                          {isImage ? (
                            <Image className="h-4 w-4 text-ivory-600" />
                          ) : (
                            <FileText className="h-4 w-4 text-ivory-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-sans text-body-sm font-medium text-ivory-200">
                            {doc.file_name}
                          </p>
                          <p className="font-sans text-[0.6875rem] text-ivory-700">
                            {formatFileSize(doc.file_size)} &middot;{" "}
                            {formatDate(doc.created_at)} &middot;{" "}
                            {doc.profiles.first_name} {doc.profiles.last_name}
                          </p>
                        </div>
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded-lg p-1.5 text-ivory-600 transition-colors hover:bg-navy-700/50 hover:text-ivory-300"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                      {/* Notes */}
                      <div className="mt-3">
                        {isEditing ? (
                          <div>
                            <input
                              type="text"
                              value={editingNotes[doc.id]}
                              onChange={(e) =>
                                setEditingNotes((prev) => ({
                                  ...prev,
                                  [doc.id]: e.target.value,
                                }))
                              }
                              placeholder="Add notes..."
                              className="w-full rounded border border-navy-700/50 bg-navy-900/60 px-2 py-1 font-sans text-caption text-ivory-300 placeholder:text-ivory-800 focus:border-gold-500/50 focus:outline-none"
                            />
                            {hasUnsavedNotes && (
                              <button
                                onClick={() => saveNotes(doc.id)}
                                disabled={savingNoteId === doc.id}
                                className="mt-1 flex items-center gap-1 rounded px-2 py-0.5 font-sans text-[0.6875rem] font-medium text-gold-400 hover:bg-gold-500/10"
                              >
                                <Save className="h-2.5 w-2.5" />
                                Save
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              setEditingNotes((prev) => ({
                                ...prev,
                                [doc.id]: doc.notes ?? "",
                              }))
                            }
                            className="font-sans text-caption text-ivory-600 transition-colors hover:text-ivory-400"
                          >
                            {doc.notes ? (
                              <span className="italic">{doc.notes}</span>
                            ) : (
                              "Add notes..."
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )
      )}
    </div>
  );
}
