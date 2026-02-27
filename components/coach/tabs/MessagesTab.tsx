"use client";

import { useEffect, useState, useCallback } from "react";
import { MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useMessagesStore } from "@/hooks/use-messages-store";
import { useAppStore } from "@/hooks/use-store";
import {
  fetchMessages,
  markMessagesAsRead,
} from "@/lib/actions/messages";
import { getOrCreateConversationForCoach } from "@/lib/actions/coach";
import { MessageBubble } from "@/components/messages/MessageBubble";
import { MessageInput } from "@/components/messages/MessageInput";
import type { MessageWithSender } from "@/types/database";
import { useRef } from "react";

interface Props {
  studentId: string;
}

export function MessagesTab({ studentId }: Props) {
  const { profile } = useAppStore();
  const {
    messages,
    setMessages,
    setActiveConversationId,
    setLoadingMessages,
    activeConversationId,
  } = useMessagesStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [otherUserName, setOtherUserName] = useState("Student");
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(
    async (convId: string) => {
      setLoadingMessages(true);
      const { data } = await fetchMessages(convId);
      setMessages((data as MessageWithSender[]) ?? []);
      await markMessagesAsRead(convId);
    },
    [setMessages, setLoadingMessages]
  );

  // Initialize conversation
  useEffect(() => {
    async function init() {
      const { data, error: initError } =
        await getOrCreateConversationForCoach(studentId);

      if (initError || !data) {
        setError(initError ?? "Failed to load conversation");
        setLoading(false);
        return;
      }

      setConversationId(data.conversationId);
      setActiveConversationId(data.conversationId);
      setOtherUserName(
        `${data.otherUser.first_name} ${data.otherUser.last_name}`
      );

      await loadMessages(data.conversationId);
      setLoading(false);
    }

    init();

    return () => {
      // Clear active conversation when leaving tab
      setActiveConversationId(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime subscription
  useEffect(() => {
    if (!conversationId || !profile) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`coach-messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          if (payload.new.sender_id === profile.id) return;
          await loadMessages(conversationId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, profile, loadMessages]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-navy-700/50 bg-navy-900/80">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
          <p className="mt-3 font-sans text-body-sm text-ivory-600">
            Loading conversation...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-navy-700/50 bg-navy-900/80">
        <div className="text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-ivory-800" />
          <p className="mt-2 font-sans text-body-sm text-burgundy-400">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[500px] flex-col rounded-2xl border border-navy-700/50 bg-navy-900/80">
      {/* Thread Header */}
      <div className="flex items-center gap-3 border-b border-navy-700/30 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500/15 font-sans text-caption font-semibold text-gold-400">
          {otherUserName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </div>
        <p className="font-sans text-body-sm font-medium text-ivory-200">
          {otherUserName}
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
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

      {/* Message Input */}
      <MessageInput />
    </div>
  );
}
