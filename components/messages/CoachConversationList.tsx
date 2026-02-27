"use client";

import { MessageSquare, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { CoachConversationItem } from "./CoachConversationItem";
import type { CoachConversationEnriched } from "@/lib/actions/messages";

interface Props {
  conversations: CoachConversationEnriched[];
  allConversationsCount: number;
  activeId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showUnreadOnly: boolean;
  onToggleUnread: () => void;
}

export function CoachConversationList({
  conversations,
  allConversationsCount,
  activeId,
  onSelect,
  searchQuery,
  onSearchChange,
  showUnreadOnly,
  onToggleUnread,
}: Props) {
  return (
    <div className="flex w-80 shrink-0 flex-col border-r border-navy-700/30">
      {/* Header */}
      <div className="border-b border-navy-700/30 px-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-heading-sm text-ivory-200">
            Messages
          </h2>
          <button
            onClick={onToggleUnread}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-sans text-caption font-medium transition-colors",
              showUnreadOnly
                ? "bg-gold-500/15 text-gold-400"
                : "text-ivory-600 hover:bg-navy-800/60 hover:text-ivory-400"
            )}
            title={showUnreadOnly ? "Show all" : "Show unread only"}
          >
            <Filter className="h-3.5 w-3.5" />
            Unread
          </button>
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ivory-700" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-navy-700/50 bg-navy-900/60 py-2 pl-9 pr-3 font-sans text-caption text-ivory-300 placeholder:text-ivory-800 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-800/80">
              <MessageSquare className="h-6 w-6 text-ivory-700" />
            </div>
            <p className="mt-3 font-sans text-body-sm text-ivory-600">
              {allConversationsCount === 0
                ? "No conversations yet"
                : "No matching conversations"}
            </p>
            <p className="mt-1 max-w-[12rem] font-sans text-caption text-ivory-800">
              {allConversationsCount === 0
                ? "Conversations with your students will appear here."
                : "Try adjusting your search or filters."}
            </p>
          </div>
        ) : (
          conversations.map((conv) => (
            <CoachConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeId}
              onClick={() => onSelect(conv.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
