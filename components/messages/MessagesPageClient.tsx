"use client";

import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useMessagesStore } from "@/hooks/use-messages-store";
import type { ConversationListItem } from "@/hooks/use-messages-store";
import { useAppStore } from "@/hooks/use-store";
import {
  fetchConversations,
  fetchMessages,
  getOrCreateConversation,
  markMessagesAsRead,
  fetchUnreadCount,
} from "@/lib/actions/messages";
import { ConversationList } from "./ConversationList";
import { MessageThread } from "./MessageThread";
import { MessagesSkeleton } from "./MessagesSkeleton";
import type { MessageWithSender, Profile } from "@/types/database";

export function MessagesPageClient() {
  const { profile } = useAppStore();
  const {
    activeConversationId,
    isLoadingConversations,
    conversations,
    error,
    setConversations,
    setActiveConversationId,
    setMessages,
    setLoadingMessages,
    setTotalUnreadCount,
    setError,
    decrementUnread,
  } = useMessagesStore();

  // Build conversation list items from raw server data
  const buildConversationItems = useCallback(
    (rawConvs: Record<string, unknown>[], role: string): ConversationListItem[] => {
      return rawConvs.map((conv) => {
        let otherUser: Pick<
          Profile,
          "id" | "first_name" | "last_name" | "avatar_url"
        >;

        if (role === "student") {
          // Coach info is in conv.profiles (from the join)
          otherUser = conv.profiles as Pick<
            Profile,
            "id" | "first_name" | "last_name" | "avatar_url"
          >;
        } else {
          // Student info is nested: conv.student_profiles.profiles
          const sp = conv.student_profiles as Record<string, unknown> | null;
          otherUser = (sp?.profiles as Pick<
            Profile,
            "id" | "first_name" | "last_name" | "avatar_url"
          >) ?? {
            id: "",
            first_name: "Student",
            last_name: "",
            avatar_url: null,
          };
        }

        return {
          id: conv.id as string,
          student_id: conv.student_id as string,
          coach_id: conv.coach_id as string,
          created_at: conv.created_at as string,
          other_user: otherUser,
          last_message: null,
          unread_count: 0,
        };
      });
    },
    []
  );

  // 1. On mount: ensure conversation exists (for students), fetch conversation list
  useEffect(() => {
    async function init() {
      if (!profile) return;

      // For students, auto-create conversation with assigned coach
      if (profile.role === "student") {
        const { error: createError } = await getOrCreateConversation();
        if (createError && createError !== "No coach assigned yet") {
          setError(createError);
        }
      }

      const { data, error: fetchError } = await fetchConversations();
      if (fetchError) {
        setError(fetchError);
        return;
      }

      const items = buildConversationItems(data ?? [], profile.role);
      setConversations(items);

      // Auto-select first conversation
      if (items.length > 0 && !activeConversationId) {
        setActiveConversationId(items[0].id);
      }
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  // 2. When activeConversationId changes: fetch messages + mark as read
  useEffect(() => {
    if (!activeConversationId || !profile) return;

    async function loadMessages() {
      setLoadingMessages(true);
      const { data } = await fetchMessages(activeConversationId!);
      setMessages((data as MessageWithSender[]) ?? []);

      // Mark unread messages as read
      await markMessagesAsRead(activeConversationId!);

      // Find conversation to get unread count before clearing
      const conv = conversations.find(
        (c) => c.id === activeConversationId
      );
      if (conv && conv.unread_count > 0) {
        decrementUnread(activeConversationId!, conv.unread_count);
      }
    }

    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  // 3. Realtime subscription for new messages
  useEffect(() => {
    if (!activeConversationId || !profile) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${activeConversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        async (payload) => {
          // Only process messages from the other user (our own messages are already added optimistically)
          if (payload.new.sender_id === profile.id) return;

          // Re-fetch full messages to get joined data
          const { data } = await fetchMessages(activeConversationId!);
          if (data) {
            setMessages(data as MessageWithSender[]);
          }

          // Auto-mark read since conversation is active
          await markMessagesAsRead(activeConversationId!);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId, profile?.id]);

  // 4. Fetch unread count on mount for badge updates
  useEffect(() => {
    async function loadUnread() {
      const { data } = await fetchUnreadCount();
      setTotalUnreadCount(data ?? 0);
    }
    loadUnread();
  }, [setTotalUnreadCount]);

  if (isLoadingConversations) {
    return <MessagesSkeleton />;
  }

  if (error && conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="font-sans text-body text-burgundy-500">
          {error === "No coach assigned yet"
            ? "You don't have a coach assigned yet. Your coach will appear here once assigned."
            : `Failed to load messages: ${error}`}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-2xl border border-navy-700/30 bg-navy-900/40">
      <ConversationList />
      <MessageThread />
    </div>
  );
}
