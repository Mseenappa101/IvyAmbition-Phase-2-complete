"use client";

import { useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";
import { Avatar } from "@/components/ui";
import { useMessagesStore } from "@/hooks/use-messages-store";
import { useAppStore } from "@/hooks/use-store";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import type { MessageWithSender } from "@/types/database";

export function MessageThread() {
  const { messages, isLoadingMessages, activeConversationId, conversations } =
    useMessagesStore();
  const { profile } = useAppStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Find the active conversation's other user
  const activeConv = conversations.find(
    (c) => c.id === activeConversationId
  );

  if (!activeConversationId || !activeConv) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-800/80">
            <MessageSquare className="h-7 w-7 text-ivory-700" />
          </div>
          <h3 className="mt-4 font-serif text-heading-sm text-ivory-400">
            Select a conversation
          </h3>
          <p className="mt-1 font-sans text-body-sm text-ivory-700">
            Choose a conversation from the left to start messaging.
          </p>
        </div>
      </div>
    );
  }

  const otherUserName = `${activeConv.other_user.first_name} ${activeConv.other_user.last_name}`;

  return (
    <div className="flex flex-1 flex-col">
      {/* Thread header */}
      <div className="flex items-center gap-3 border-b border-navy-700/30 px-4 py-3">
        <Avatar
          name={otherUserName}
          src={activeConv.other_user.avatar_url}
          size="md"
        />
        <div>
          <p className="font-sans text-body-sm font-medium text-ivory-200">
            {otherUserName}
          </p>
          <p className="font-sans text-caption text-ivory-700">
            Coach
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isLoadingMessages ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex gap-3 ${i % 2 === 0 ? "flex-row-reverse" : "flex-row"}`}
              >
                {i % 2 !== 0 && (
                  <div className="h-8 w-8 animate-pulse rounded-full bg-navy-800/60" />
                )}
                <div
                  className={`h-14 animate-pulse rounded-2xl ${i % 2 === 0 ? "w-44 bg-gold-500/10" : "w-52 bg-navy-800/60"}`}
                />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="font-sans text-body-sm text-ivory-600">
                No messages yet
              </p>
              <p className="mt-1 font-sans text-caption text-ivory-800">
                Send a message to start the conversation.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg: MessageWithSender) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwnMessage={msg.sender_id === profile?.id}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Message input */}
      <MessageInput />
    </div>
  );
}
