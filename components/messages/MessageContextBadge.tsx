"use client";

import { FileEdit, GraduationCap } from "lucide-react";

interface MessageContextBadgeProps {
  essayTitle?: string | null;
  schoolName?: string | null;
}

export function MessageContextBadge({
  essayTitle,
  schoolName,
}: MessageContextBadgeProps) {
  if (!essayTitle && !schoolName) return null;

  return (
    <div className="mb-1 flex items-center gap-1.5 rounded-full bg-navy-800/80 px-2.5 py-1 font-sans text-[0.6875rem] text-ivory-500">
      {essayTitle ? (
        <>
          <FileEdit className="h-3 w-3 text-gold-500" />
          <span>Re: {essayTitle}</span>
        </>
      ) : (
        <>
          <GraduationCap className="h-3 w-3 text-gold-500" />
          <span>Re: {schoolName}</span>
        </>
      )}
    </div>
  );
}
