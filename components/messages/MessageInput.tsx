"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Paperclip, Loader2 } from "lucide-react";
import { brandToast } from "@/components/ui";
import { sendMessage, sendFileMessage } from "@/lib/actions/messages";
import { useMessagesStore } from "@/hooks/use-messages-store";
import type { MessageWithSender } from "@/types/database";

export function MessageInput() {
  const { activeConversationId, isSending, setSending, addMessage, updateLastMessage } =
    useMessagesStore();
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(async () => {
    if (!text.trim() || !activeConversationId || isSending) return;

    setSending(true);
    const { data, error } = await sendMessage({
      conversationId: activeConversationId,
      content: text.trim(),
    });

    if (error) {
      brandToast.error("Failed to send", error);
    } else if (data) {
      addMessage(data as MessageWithSender);
      updateLastMessage(activeConversationId, data as MessageWithSender);
      setText("");
    }
    setSending(false);
  }, [text, activeConversationId, isSending, setSending, addMessage, updateLastMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || !activeConversationId) return;
      const file = files[0];

      if (file.size > 10 * 1024 * 1024) {
        brandToast.error("File too large", "Maximum file size is 10MB.");
        return;
      }

      setSending(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("conversationId", activeConversationId);

      const { data, error } = await sendFileMessage(formData);

      if (error) {
        brandToast.error("Upload failed", error);
      } else if (data) {
        addMessage(data as MessageWithSender);
        updateLastMessage(activeConversationId, data as MessageWithSender);
      }

      setSending(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [activeConversationId, setSending, addMessage, updateLastMessage]
  );

  if (!activeConversationId) return null;

  return (
    <div className="border-t border-navy-700/30 p-4">
      <div className="flex items-end gap-2">
        {/* File attach button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isSending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ivory-600 transition-colors hover:bg-navy-800 hover:text-ivory-300 disabled:opacity-40"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        {/* Text input */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          disabled={isSending}
          className="max-h-32 min-h-[2.5rem] flex-1 resize-none rounded-lg border border-navy-700/50 bg-navy-900/60 px-4 py-2.5 font-sans text-body-sm text-ivory-200 placeholder:text-ivory-700 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20 disabled:opacity-40"
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!text.trim() || isSending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-500 text-navy-950 transition-colors hover:bg-gold-400 disabled:opacity-40 disabled:hover:bg-gold-500"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
    </div>
  );
}
