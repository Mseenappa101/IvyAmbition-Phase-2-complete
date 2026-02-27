"use client";

import { useState } from "react";
import { History, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useEssayEditorStore } from "@/hooks/use-essay-editor-store";
import type { EssayVersion } from "@/types/database";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function VersionHistoryPanel() {
  const { essay } = useEssayEditorStore();
  const [previewVersion, setPreviewVersion] = useState<EssayVersion | null>(
    null
  );

  const versions = essay?.essay_versions
    ? [...essay.essay_versions].sort(
        (a, b) => b.version_number - a.version_number
      )
    : [];

  if (previewVersion) {
    return (
      <div className="flex h-full flex-col">
        <button
          onClick={() => setPreviewVersion(null)}
          className="mb-3 flex items-center gap-1.5 font-sans text-caption font-medium text-gold-400 transition-colors hover:text-gold-300"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to versions
        </button>
        <div className="mb-2 flex items-center justify-between">
          <span className="font-sans text-body-sm font-medium text-ivory-300">
            Version {previewVersion.version_number}
          </span>
          <span className="font-sans text-caption text-ivory-700">
            {previewVersion.word_count} words
          </span>
        </div>
        <div className="flex-1 overflow-y-auto rounded-lg border border-navy-700/50 bg-navy-900/60 p-4">
          <p className="whitespace-pre-wrap font-serif text-body-sm text-ivory-400 leading-relaxed">
            {previewVersion.content || "(empty)"}
          </p>
        </div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <History className="h-8 w-8 text-ivory-800" />
        <p className="mt-3 font-sans text-body-sm text-ivory-600">
          No versions yet
        </p>
        <p className="mt-1 font-sans text-caption text-ivory-700">
          Versions are created automatically as you write.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {versions.map((v) => (
        <button
          key={v.id}
          onClick={() => setPreviewVersion(v)}
          className={cn(
            "w-full rounded-lg border border-navy-700/50 bg-navy-900/40 p-3 text-left transition-colors hover:border-navy-600/50 hover:bg-navy-900/60"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="font-sans text-body-sm font-medium text-ivory-300">
              v{v.version_number}
            </span>
            <span className="font-sans text-caption text-ivory-700">
              {v.word_count} words
            </span>
          </div>
          <p className="mt-1 font-sans text-caption text-ivory-600">
            {formatDate(v.created_at)}
          </p>
        </button>
      ))}
    </div>
  );
}
