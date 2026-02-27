import { create } from "zustand";
import type { MessageWithSender, Profile } from "@/types/database";

export interface ConversationListItem {
  id: string;
  student_id: string;
  coach_id: string;
  created_at: string;
  other_user: Pick<Profile, "id" | "first_name" | "last_name" | "avatar_url">;
  last_message: MessageWithSender | null;
  unread_count: number;
}

interface MessagesState {
  conversations: ConversationListItem[];
  activeConversationId: string | null;
  isLoadingConversations: boolean;

  messages: MessageWithSender[];
  isLoadingMessages: boolean;

  isSending: boolean;
  totalUnreadCount: number;
  error: string | null;

  setConversations: (conversations: ConversationListItem[]) => void;
  setActiveConversationId: (id: string | null) => void;
  setLoadingConversations: (loading: boolean) => void;

  setMessages: (messages: MessageWithSender[]) => void;
  setLoadingMessages: (loading: boolean) => void;

  setSending: (sending: boolean) => void;
  setTotalUnreadCount: (count: number) => void;
  setError: (error: string | null) => void;

  addMessage: (message: MessageWithSender) => void;
  updateLastMessage: (
    conversationId: string,
    message: MessageWithSender
  ) => void;

  incrementUnread: (conversationId: string) => void;
  decrementUnread: (conversationId: string, count: number) => void;
}

export const useMessagesStore = create<MessagesState>((set) => ({
  conversations: [],
  activeConversationId: null,
  isLoadingConversations: true,

  messages: [],
  isLoadingMessages: false,

  isSending: false,
  totalUnreadCount: 0,
  error: null,

  setConversations: (conversations) =>
    set({ conversations, isLoadingConversations: false }),
  setActiveConversationId: (activeConversationId) =>
    set({ activeConversationId }),
  setLoadingConversations: (isLoadingConversations) =>
    set({ isLoadingConversations }),

  setMessages: (messages) => set({ messages, isLoadingMessages: false }),
  setLoadingMessages: (isLoadingMessages) => set({ isLoadingMessages }),

  setSending: (isSending) => set({ isSending }),
  setTotalUnreadCount: (totalUnreadCount) => set({ totalUnreadCount }),
  setError: (error) => set({ error }),

  addMessage: (message) =>
    set((s) => ({ messages: [...s.messages, message] })),

  updateLastMessage: (conversationId, message) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId ? { ...c, last_message: message } : c
      ),
    })),

  incrementUnread: (conversationId) =>
    set((s) => ({
      totalUnreadCount: s.totalUnreadCount + 1,
      conversations: s.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, unread_count: c.unread_count + 1 }
          : c
      ),
    })),

  decrementUnread: (conversationId, count) =>
    set((s) => ({
      totalUnreadCount: Math.max(0, s.totalUnreadCount - count),
      conversations: s.conversations.map((c) =>
        c.id === conversationId ? { ...c, unread_count: 0 } : c
      ),
    })),
}));
