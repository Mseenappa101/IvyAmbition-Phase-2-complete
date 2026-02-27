"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui";
import { useMessagesStore } from "@/hooks/use-messages-store";
import { useAppStore } from "@/hooks/use-store";
import {
  fetchMessages,
  markMessagesAsRead,
  fetchUnreadCount,
  fetchCoachConversationsEnriched,
  fetchContextForConversation,
} from "@/lib/actions/messages";
import type {
  CoachConversationEnriched,
} from "@/lib/actions/messages";
import { CoachConversationList } from "./CoachConversationList";
import { MessageBubble } from "./MessageBubble";
import { CoachMessageInput } from "./CoachMessageInput";
import { MessagesSkeleton } from "./MessagesSkeleton";
import type { MessageWithSender } from "@/types/database";

export function CoachMessagesPageClient() {
  const { profile } = useAppStore();
  const {
    activeConversationId,
    messages,
    isLoadingMessages,
    setActiveConversationId,
    setMessages,
    setLoadingMessages,
    setTotalUnreadCount,
  } = useMessagesStore();

  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<
    CoachConversationEnriched[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Context data for message input
  const [contextEssays, setContextEssays] = useState<
    { id: string; title: string }[]
  >([]);
  const [contextSchools, setContextSchools] = useState<
    { id: string; school_name: string }[]
  >([]);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Filter conversations
  const filtered = useMemo(() => {
    return conversations.filter((conv) => {
      const name =
        `${conv.student.first_name} ${conv.student.last_name}`.toLowerCase();
      const matchesSearch =
        searchQuery === "" || name.includes(searchQuery.toLowerCase());
      const matchesUnread = !showUnreadOnly || conv.unread_count > 0;
      return matchesSearch && matchesUnread;
    });
  }, [conversations, searchQuery, showUnreadOnly]);

  // 1. On mount: load enriched conversations
  useEffect(() => {
    async function init() {
      const { data, error } = await fetchCoachConversationsEnriched();
      if (error) {
        console.error("Failed to load conversations:", error);
      }
      setConversations(data ?? []);
      setLoading(false);

      // Auto-select first conversation
      if (data && data.length > 0 && !activeConversationId) {
        setActiveConversationId(data[0].id);
      }

      // Fetch total unread for sidebar badge
      const { data: unread } = await fetchUnreadCount();
      setTotalUnreadCount(unread ?? 0);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. When active conversation changes: load messages + context
  useEffect(() => {
    if (!activeConversationId || !profile) return;

    async function load() {
      setLoadingMessages(true);
      const { data } = await fetchMessages(activeConversationId!);
      setMessages((data as MessageWithSender[]) ?? []);

      // Mark as read + update local unread count
      await markMessagesAsRead(activeConversationId!);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId ? { ...c, unread_count: 0 } : c
        )
      );

      // Load context (essays + schools) for message input
      const conv = conversations.find((c) => c.id === activeConversationId);
      if (conv) {
        const { data: ctx } = await fetchContextForConversation(
          conv.student_id
        );
        if (ctx) {
          setContextEssays(ctx.essays);
          setContextSchools(ctx.schools);
        }
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Real-time subscription for all conversations
  useEffect(() => {
    if (!profile || conversations.length === 0) return;

    const supabase = createClient();
    const convIds = conversations.map((c) => c.id);

    // Subscribe to messages for all coach conversations
    const channels = convIds.map((convId) =>
      supabase
        .channel(`coach-msg:${convId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${convId}`,
          },
          async (payload) => {
            // Skip own messages
            if (payload.new.sender_id === profile.id) return;

            const msgConvId = payload.new.conversation_id as string;

            if (msgConvId === activeConversationId) {
              // Active conversation: refetch messages + mark read
              const { data } = await fetchMessages(msgConvId);
              if (data) setMessages(data as MessageWithSender[]);
              await markMessagesAsRead(msgConvId);
            } else {
              // Other conversation: update sidebar
              setConversations((prev) => {
                const updated = prev.map((c) => {
                  if (c.id !== msgConvId) return c;
                  return {
                    ...c,
                    unread_count: c.unread_count + 1,
                    last_message: {
                      content: payload.new.content as string,
                      message_type: payload.new.message_type as string,
                      created_at: payload.new.created_at as string,
                      sender_id: payload.new.sender_id as string,
                    },
                  };
                });
                // Re-sort by most recent message
                updated.sort((a, b) => {
                  const aTime = a.last_message?.created_at ?? a.created_at;
                  const bTime = b.last_message?.created_at ?? b.created_at;
                  return (
                    new Date(bTime).getTime() - new Date(aTime).getTime()
                  );
                });
                return updated;
              });
            }
          }
        )
        .subscribe()
    );

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, conversations.length]);

  // Update conversation list when a message is sent from this client
  const handleMessageSent = useCallback(
    (message: MessageWithSender) => {
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id !== message.conversation_id) return c;
          return {
            ...c,
            last_message: {
              content: message.content,
              message_type: message.message_type,
              created_at: message.created_at,
              sender_id: message.sender_id,
            },
          };
        });
        updated.sort((a, b) => {
          const aTime = a.last_message?.created_at ?? a.created_at;
          const bTime = b.last_message?.created_at ?? b.created_at;
          return new Date(bTime).getTime() - new Date(aTime).getTime();
        });
        return updated;
      });
    },
    []
  );

  // Listen for store message additions to update sidebar
  useEffect(() => {
    const unsub = useMessagesStore.subscribe((state, prevState) => {
      if (state.messages.length > prevState.messages.length) {
        const lastMsg = state.messages[state.messages.length - 1];
        if (lastMsg) handleMessageSent(lastMsg);
      }
    });
    return unsub;
  }, [handleMessageSent]);

  const handleSelectConversation = useCallback(
    (id: string) => {
      setActiveConversationId(id);
    },
    [setActiveConversationId]
  );

  if (loading) {
    return <MessagesSkeleton />;
  }

  // Find active conversation for header
  const activeConv = conversations.find(
    (c) => c.id === activeConversationId
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-2xl border border-navy-700/30 bg-navy-900/40">
      {/* Left Panel */}
      <CoachConversationList
        conversations={filtered}
        allConversationsCount={conversations.length}
        activeId={activeConversationId}
        onSelect={handleSelectConversation}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showUnreadOnly={showUnreadOnly}
        onToggleUnread={() => setShowUnreadOnly((p) => !p)}
      />

      {/* Right Panel */}
      {!activeConversationId || !activeConv ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-800/80">
              <MessageSquare className="h-7 w-7 text-ivory-700" />
            </div>
            <h3 className="mt-4 font-serif text-heading-sm text-ivory-400">
              Select a conversation
            </h3>
            <p className="mt-1 font-sans text-body-sm text-ivory-700">
              Choose a student from the left to start messaging.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col">
          {/* Thread header */}
          <div className="flex items-center gap-3 border-b border-navy-700/30 px-4 py-3">
            <Avatar
              name={`${activeConv.student.first_name} ${activeConv.student.last_name}`}
              src={activeConv.student.avatar_url}
              size="md"
            />
            <div>
              <p className="font-sans text-body-sm font-medium text-ivory-200">
                {activeConv.student.first_name} {activeConv.student.last_name}
              </p>
              <div className="flex items-center gap-2">
                <span className="inline-flex rounded-full bg-gold-500/10 px-2 py-0.5 font-sans text-[0.5625rem] font-medium uppercase tracking-wider text-gold-400">
                  {activeConv.student.application_type.replace("_", " ")}
                </span>
                <span className="font-sans text-caption text-ivory-700">
                  Student
                </span>
              </div>
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

          {/* Enhanced message input */}
          <CoachMessageInput
            essays={contextEssays}
            schools={contextSchools}
          />
        </div>
      )}
    </div>
  );
}
