"use client";

import { Download, FileText } from "lucide-react";
import { Avatar } from "@/components/ui";
import { formatRelativeDate } from "@/lib/utils/format";
import { MessageContextBadge } from "./MessageContextBadge";
import type { MessageWithSender } from "@/types/database";

interface MessageBubbleProps {
  message: MessageWithSender;
  isOwnMessage: boolean;
}

function parseFileContent(content: string) {
  const lastPipe = content.lastIndexOf("|");
  if (lastPipe === -1) return { fileName: content, url: "" };
  return {
    fileName: content.slice(0, lastPipe),
    url: content.slice(lastPipe + 1),
  };
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const senderName = `${message.profiles.first_name} ${message.profiles.last_name}`;
  const essayTitle = message.essays?.title ?? null;
  const schoolName = message.student_schools?.school_name ?? null;
  const isFile = message.message_type === "file";

  return (
    <div
      className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar (only for other user's messages) */}
      {!isOwnMessage && (
        <Avatar
          name={senderName}
          src={message.profiles.avatar_url}
          size="sm"
          className="mt-1 shrink-0"
        />
      )}

      <div
        className={`max-w-[70%] ${isOwnMessage ? "items-end" : "items-start"} flex flex-col`}
      >
        {/* Context badge */}
        <MessageContextBadge
          essayTitle={essayTitle}
          schoolName={schoolName}
        />

        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isOwnMessage
              ? "rounded-br-md bg-gold-500/15 text-ivory-200"
              : "rounded-bl-md border border-navy-700/50 bg-navy-800 text-ivory-300"
          }`}
        >
          {isFile ? (
            <FileMessageContent content={message.content} />
          ) : (
            <p className="whitespace-pre-wrap font-sans text-body-sm">
              {message.content}
            </p>
          )}
        </div>

        {/* Timestamp */}
        <span
          className={`mt-1 font-sans text-[0.625rem] text-ivory-800 ${isOwnMessage ? "text-right" : "text-left"}`}
        >
          {formatRelativeDate(message.created_at)}
        </span>
      </div>
    </div>
  );
}

function FileMessageContent({ content }: { content: string }) {
  const { fileName, url } = parseFileContent(content);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-900/60">
        <FileText className="h-4 w-4 text-gold-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-sans text-body-sm font-medium">
          {fileName}
        </p>
        <p className="font-sans text-[0.625rem] text-ivory-600">
          Click to download
        </p>
      </div>
      <Download className="h-4 w-4 shrink-0 text-ivory-600" />
    </a>
  );
}
