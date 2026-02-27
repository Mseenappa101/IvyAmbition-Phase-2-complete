"use client";

import { MessageSquare } from "lucide-react";
import { useMessagesStore } from "@/hooks/use-messages-store";
import { ConversationListItem } from "./ConversationListItem";

export function ConversationList() {
  const { conversations, activeConversationId, setActiveConversationId } =
    useMessagesStore();

  return (
    <div className="flex w-80 shrink-0 flex-col border-r border-navy-700/30">
      {/* Header */}
      <div className="border-b border-navy-700/30 px-4 py-4">
        <h2 className="font-serif text-heading-sm text-ivory-200">Messages</h2>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-800/80">
              <MessageSquare className="h-6 w-6 text-ivory-700" />
            </div>
            <p className="mt-3 font-sans text-body-sm text-ivory-600">
              No conversations yet
            </p>
            <p className="mt-1 max-w-[12rem] font-sans text-caption text-ivory-800">
              Your conversation with your coach will appear here.
            </p>
          </div>
        ) : (
          conversations.map((conv) => (
            <ConversationListItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeConversationId}
              onClick={() => setActiveConversationId(conv.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
