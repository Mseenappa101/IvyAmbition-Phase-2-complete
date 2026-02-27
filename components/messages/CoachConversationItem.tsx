"use client";

import { Avatar } from "@/components/ui";
import { formatRelativeDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { CoachConversationEnriched } from "@/lib/actions/messages";

interface Props {
  conversation: CoachConversationEnriched;
  isActive: boolean;
  onClick: () => void;
}

export function CoachConversationItem({
  conversation,
  isActive,
  onClick,
}: Props) {
  const { student, last_message, unread_count } = conversation;
  const name = `${student.first_name} ${student.last_name}`;

  let preview = "No messages yet";
  if (last_message) {
    preview =
      last_message.message_type === "file"
        ? "Sent a file"
        : last_message.content;
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
        isActive ? "bg-gold-500/10" : "hover:bg-navy-800/60"
      )}
    >
      <Avatar name={name} src={student.avatar_url} size="md" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "truncate font-sans text-body-sm font-medium",
              unread_count > 0 ? "text-ivory-200" : "text-ivory-400"
            )}
          >
            {name}
          </span>
          {last_message && (
            <span className="shrink-0 font-sans text-[0.625rem] text-ivory-800">
              {formatRelativeDate(last_message.created_at)}
            </span>
          )}
        </div>

        {/* Application type badge */}
        <span className="inline-flex rounded-full bg-gold-500/10 px-1.5 py-0.5 font-sans text-[0.5625rem] font-medium uppercase tracking-wider text-gold-400">
          {student.application_type.replace("_", " ")}
        </span>

        <div className="mt-0.5 flex items-center justify-between">
          <p
            className={cn(
              "truncate font-sans text-caption",
              unread_count > 0 ? "text-ivory-400" : "text-ivory-700"
            )}
          >
            {preview}
          </p>
          {unread_count > 0 && (
            <span className="ml-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-gold-500 px-1.5 font-sans text-[0.625rem] font-bold text-navy-950">
              {unread_count > 99 ? "99+" : unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
