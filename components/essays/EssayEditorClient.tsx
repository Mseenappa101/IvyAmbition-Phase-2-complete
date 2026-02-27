"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  PanelRightOpen,
  PanelRightClose,
  Send,
  Sparkles,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { Button, brandToast } from "@/components/ui";
import { useEssayEditorStore } from "@/hooks/use-essay-editor-store";
import {
  fetchEssay,
  saveEssayContent,
  createEssayVersion,
  updateEssayStatus,
  updateEssayTitle,
  deleteEssay,
} from "@/lib/actions/essays";
import { ROUTES } from "@/lib/constants/routes";
import { EssayStatusBadge } from "./EssayStatusBadge";
import { EssayWritingArea } from "./EssayWritingArea";
import { EssaySidebar } from "./EssaySidebar";
import type { EssayWithRelations } from "@/types/database";

interface EssayEditorClientProps {
  essayId: string;
}

export function EssayEditorClient({ essayId }: EssayEditorClientProps) {
  const {
    essay,
    isLoading,
    error,
    content,
    wordCount,
    isSaving,
    lastSavedAt,
    lastSavedContent,
    lastVersionContent,
    sidebarOpen,
    setEssay,
    setLoading,
    setError,
    setSaving,
    setLastSavedAt,
    setLastSavedContent,
    setLastVersionContent,
    setSidebarOpen,
    updateStatus,
    updateTitle,
    addVersion,
  } = useEssayEditorStore();

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [deleting, setDeleting] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load essay
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error: fetchError } = await fetchEssay(essayId);
      if (fetchError || !data) {
        setError(fetchError ?? "Essay not found");
        return;
      }
      setEssay(data as EssayWithRelations);
    };
    load();
  }, [essayId, setEssay, setLoading, setError]);

  // Auto-save effect
  useEffect(() => {
    if (!essay || content === lastSavedContent) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      setSaving(true);

      const { error: saveError } = await saveEssayContent(essay.id, {
        content,
        wordCount,
      });

      if (!saveError) {
        setLastSavedAt(new Date());
        setLastSavedContent(content);

        // Check if we should create a version
        const charDiff = Math.abs(content.length - lastVersionContent.length);
        if (charDiff >= 100) {
          const { data: version } = await createEssayVersion(
            essay.id,
            content,
            wordCount
          );
          if (version) {
            addVersion(version);
            setLastVersionContent(content);
          }
        }
      } else {
        brandToast.error("Save failed", "Your changes could not be saved.");
      }

      setSaving(false);
    }, 30_000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [
    content,
    lastSavedContent,
    lastVersionContent,
    wordCount,
    essay,
    setSaving,
    setLastSavedAt,
    setLastSavedContent,
    setLastVersionContent,
    addVersion,
  ]);

  // Warn on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (content !== lastSavedContent) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [content, lastSavedContent]);

  const handleSubmitForReview = useCallback(async () => {
    if (!essay) return;

    // Save first if there are unsaved changes
    if (content !== lastSavedContent) {
      setSaving(true);
      await saveEssayContent(essay.id, { content, wordCount });
      setLastSavedAt(new Date());
      setLastSavedContent(content);
      setSaving(false);
    }

    updateStatus("coach_review");
    const { error: statusError } = await updateEssayStatus(
      essay.id,
      "coach_review"
    );
    if (statusError) {
      brandToast.error("Error", "Could not submit for review.");
      updateStatus(essay.status);
    } else {
      brandToast.success("Submitted", "Your essay has been sent for review.");
    }
  }, [
    essay,
    content,
    lastSavedContent,
    wordCount,
    setSaving,
    setLastSavedAt,
    setLastSavedContent,
    updateStatus,
  ]);

  const handleSaveTitle = useCallback(async () => {
    if (!essay || !titleDraft.trim()) return;
    updateTitle(titleDraft.trim());
    setEditingTitle(false);
    const { error: titleError } = await updateEssayTitle(
      essay.id,
      titleDraft.trim()
    );
    if (titleError) {
      brandToast.error("Error", "Could not update title.");
      updateTitle(essay.title);
    }
  }, [essay, titleDraft, updateTitle]);

  const handleDelete = useCallback(async () => {
    if (!essay) return;
    setDeleting(true);
    const { error: deleteError } = await deleteEssay(essay.id);
    if (deleteError) {
      brandToast.error("Error", "Could not delete essay.");
      setDeleting(false);
    } else {
      window.location.href = ROUTES.essays.list;
    }
  }, [essay]);

  // Save indicator text
  const saveIndicator = (() => {
    if (isSaving) return "Saving...";
    if (content !== lastSavedContent) return "Unsaved changes";
    if (lastSavedAt) {
      return `Saved at ${lastSavedAt.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })}`;
    }
    return "Saved";
  })();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 animate-pulse rounded bg-navy-800/60" />
        <div className="h-10 w-64 animate-pulse rounded-lg bg-navy-800/60" />
        <div className="h-[60vh] animate-pulse rounded-xl bg-navy-900/40" />
      </div>
    );
  }

  if (error || !essay) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="font-sans text-body text-burgundy-500">
          {error ?? "Essay not found"}
        </p>
        <Link
          href={ROUTES.essays.list}
          className="mt-4 font-sans text-body-sm text-gold-400 hover:text-gold-300"
        >
          Back to Essays
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-navy-700/50 px-2 py-3">
        <div className="flex items-center gap-4">
          <Link
            href={ROUTES.essays.list}
            className="flex items-center gap-1.5 font-sans text-body-sm text-ivory-600 transition-colors hover:text-ivory-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Essays
          </Link>

          {/* Title */}
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle();
                  if (e.key === "Escape") setEditingTitle(false);
                }}
                autoFocus
                className="rounded-lg border border-gold-500/50 bg-navy-900/60 px-3 py-1 font-serif text-heading-sm text-ivory-200 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
              />
              <button onClick={handleSaveTitle}>
                <Check className="h-4 w-4 text-emerald-400" />
              </button>
              <button onClick={() => setEditingTitle(false)}>
                <X className="h-4 w-4 text-ivory-600" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setTitleDraft(essay.title);
                setEditingTitle(true);
              }}
              className="font-serif text-heading-sm text-ivory-200 transition-colors hover:text-gold-400"
            >
              {essay.title}
            </button>
          )}

          <EssayStatusBadge status={essay.status} />

          <span className="font-sans text-caption text-ivory-700">
            {saveIndicator}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {}}
            disabled
            icon={<Sparkles className="h-4 w-4" />}
          >
            AI Assistant
          </Button>

          {essay.status !== "coach_review" && essay.status !== "final" && (
            <Button
              size="sm"
              onClick={handleSubmitForReview}
              icon={<Send className="h-4 w-4" />}
            >
              Submit for Review
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            loading={deleting}
            className="text-ivory-700 hover:text-burgundy-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ivory-600 transition-colors hover:bg-navy-800 hover:text-ivory-300"
          >
            {sidebarOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <EssayWritingArea />
        </div>
        <EssaySidebar />
      </div>
    </div>
  );
}
