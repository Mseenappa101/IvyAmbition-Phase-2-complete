"use client";

import { useState, useRef, useCallback } from "react";
import {
  Send,
  Paperclip,
  Loader2,
  Link2,
  X,
  Zap,
  FileEdit,
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { brandToast, Modal } from "@/components/ui";
import { sendMessage, sendFileMessage } from "@/lib/actions/messages";
import { useMessagesStore } from "@/hooks/use-messages-store";
import { useQuickReplies } from "@/hooks/use-quick-replies";
import type { MessageWithSender } from "@/types/database";

interface Props {
  essays: { id: string; title: string }[];
  schools: { id: string; school_name: string }[];
}

export function CoachMessageInput({ essays, schools }: Props) {
  const {
    activeConversationId,
    isSending,
    setSending,
    addMessage,
    updateLastMessage,
  } = useMessagesStore();
  const { templates, addTemplate, updateTemplate, removeTemplate } =
    useQuickReplies();

  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Context selector state
  const [showContext, setShowContext] = useState(false);
  const [selectedEssayId, setSelectedEssayId] = useState<string>("");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");

  // Quick reply popover state
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<{
    id: string;
    label: string;
    content: string;
  } | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newContent, setNewContent] = useState("");

  const handleSend = useCallback(async () => {
    if (!text.trim() || !activeConversationId || isSending) return;

    setSending(true);
    const { data, error } = await sendMessage({
      conversationId: activeConversationId,
      content: text.trim(),
      relatedEssayId: selectedEssayId || null,
      relatedSchoolId: selectedSchoolId || null,
    });

    if (error) {
      brandToast.error("Failed to send", error);
    } else if (data) {
      addMessage(data as MessageWithSender);
      updateLastMessage(activeConversationId, data as MessageWithSender);
      setText("");
      // Clear context after sending
      setSelectedEssayId("");
      setSelectedSchoolId("");
      setShowContext(false);
    }
    setSending(false);
  }, [
    text,
    activeConversationId,
    isSending,
    selectedEssayId,
    selectedSchoolId,
    setSending,
    addMessage,
    updateLastMessage,
  ]);

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

  const handleEssayChange = (value: string) => {
    setSelectedEssayId(value);
    if (value) setSelectedSchoolId(""); // Only one context at a time
  };

  const handleSchoolChange = (value: string) => {
    setSelectedSchoolId(value);
    if (value) setSelectedEssayId(""); // Only one context at a time
  };

  const clearContext = () => {
    setSelectedEssayId("");
    setSelectedSchoolId("");
    setShowContext(false);
  };

  const insertQuickReply = (content: string) => {
    setText((prev) => (prev ? prev + "\n" + content : content));
    setShowQuickReplies(false);
  };

  const handleSaveTemplate = () => {
    if (!newLabel.trim() || !newContent.trim()) return;
    if (editingTemplate) {
      updateTemplate(editingTemplate.id, newLabel.trim(), newContent.trim());
    } else {
      addTemplate(newLabel.trim(), newContent.trim());
    }
    setNewLabel("");
    setNewContent("");
    setEditingTemplate(null);
  };

  const startEditTemplate = (t: {
    id: string;
    label: string;
    content: string;
  }) => {
    setEditingTemplate(t);
    setNewLabel(t.label);
    setNewContent(t.content);
  };

  if (!activeConversationId) return null;

  const selectedEssay = essays.find((e) => e.id === selectedEssayId);
  const selectedSchool = schools.find((s) => s.id === selectedSchoolId);
  const hasContext = !!selectedEssay || !!selectedSchool;

  return (
    <div className="border-t border-navy-700/30">
      {/* Context badge (when selected) */}
      {hasContext && (
        <div className="flex items-center gap-2 px-4 pt-3">
          <div className="flex items-center gap-1.5 rounded-full bg-gold-500/10 px-3 py-1 font-sans text-caption text-gold-400">
            {selectedEssay ? (
              <>
                <FileEdit className="h-3 w-3" />
                <span className="max-w-[200px] truncate">
                  Re: {selectedEssay.title}
                </span>
              </>
            ) : (
              <>
                <GraduationCap className="h-3 w-3" />
                <span className="max-w-[200px] truncate">
                  Re: {selectedSchool?.school_name}
                </span>
              </>
            )}
            <button
              onClick={clearContext}
              className="ml-1 rounded-full p-0.5 transition-colors hover:bg-gold-500/20"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>
      )}

      {/* Context selector dropdowns */}
      {showContext && !hasContext && (essays.length > 0 || schools.length > 0) && (
        <div className="flex items-center gap-2 px-4 pt-3">
          {essays.length > 0 && (
            <select
              value={selectedEssayId}
              onChange={(e) => handleEssayChange(e.target.value)}
              className="flex-1 rounded-lg border border-navy-700/50 bg-navy-900/60 px-2 py-1.5 font-sans text-caption text-ivory-300 focus:border-gold-500/50 focus:outline-none"
            >
              <option value="">Link to essay...</option>
              {essays.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          )}
          {schools.length > 0 && (
            <select
              value={selectedSchoolId}
              onChange={(e) => handleSchoolChange(e.target.value)}
              className="flex-1 rounded-lg border border-navy-700/50 bg-navy-900/60 px-2 py-1.5 font-sans text-caption text-ivory-300 focus:border-gold-500/50 focus:outline-none"
            >
              <option value="">Link to school...</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.school_name}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => setShowContext(false)}
            className="rounded-lg p-1.5 text-ivory-600 transition-colors hover:bg-navy-800 hover:text-ivory-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main input row */}
      <div className="p-4">
        <div className="flex items-end gap-2">
          {/* Context link button */}
          <button
            onClick={() => setShowContext(!showContext)}
            disabled={isSending}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors disabled:opacity-40 ${
              showContext || hasContext
                ? "bg-gold-500/15 text-gold-400"
                : "text-ivory-600 hover:bg-navy-800 hover:text-ivory-300"
            }`}
            title="Link to essay or school"
          >
            <Link2 className="h-5 w-5" />
          </button>

          {/* Quick reply button */}
          <div className="relative">
            <button
              onClick={() => setShowQuickReplies(!showQuickReplies)}
              disabled={isSending}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors disabled:opacity-40 ${
                showQuickReplies
                  ? "bg-gold-500/15 text-gold-400"
                  : "text-ivory-600 hover:bg-navy-800 hover:text-ivory-300"
              }`}
              title="Quick replies"
            >
              <Zap className="h-5 w-5" />
            </button>

            {/* Quick reply popover */}
            {showQuickReplies && (
              <div className="absolute bottom-12 left-0 z-10 w-72 rounded-xl border border-navy-700/50 bg-navy-900 shadow-elevated">
                <div className="border-b border-navy-700/30 px-3 py-2">
                  <p className="font-sans text-caption font-medium text-ivory-400">
                    Quick Replies
                  </p>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {templates.length === 0 ? (
                    <p className="px-3 py-4 text-center font-sans text-caption text-ivory-700">
                      No templates saved
                    </p>
                  ) : (
                    templates.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => insertQuickReply(t.content)}
                        className="block w-full px-3 py-2 text-left transition-colors hover:bg-navy-800/60"
                      >
                        <p className="font-sans text-caption font-medium text-ivory-300">
                          {t.label}
                        </p>
                        <p className="mt-0.5 truncate font-sans text-[0.6875rem] text-ivory-700">
                          {t.content}
                        </p>
                      </button>
                    ))
                  )}
                </div>
                <div className="border-t border-navy-700/30 px-3 py-2">
                  <button
                    onClick={() => {
                      setShowQuickReplies(false);
                      setShowTemplateModal(true);
                    }}
                    className="font-sans text-caption font-medium text-gold-400 transition-colors hover:text-gold-300"
                  >
                    Manage Templates
                  </button>
                </div>
              </div>
            )}
          </div>

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
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Template Management Modal */}
      <Modal
        open={showTemplateModal}
        onClose={() => {
          setShowTemplateModal(false);
          setEditingTemplate(null);
          setNewLabel("");
          setNewContent("");
        }}
        title="Manage Quick Reply Templates"
        size="md"
      >
        <div className="space-y-4">
          {/* Existing templates */}
          {templates.length > 0 && (
            <div className="space-y-2">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="flex items-start gap-3 rounded-xl border border-navy-700/30 bg-navy-800/50 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-body-sm font-medium text-ivory-200">
                      {t.label}
                    </p>
                    <p className="mt-0.5 font-sans text-caption text-ivory-600">
                      {t.content}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => startEditTemplate(t)}
                      className="rounded-lg p-1.5 text-ivory-600 transition-colors hover:bg-navy-700 hover:text-ivory-300"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => removeTemplate(t.id)}
                      className="rounded-lg p-1.5 text-ivory-600 transition-colors hover:bg-burgundy-500/15 hover:text-burgundy-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add / Edit form */}
          <div className="rounded-xl border border-navy-700/30 bg-navy-800/50 p-4">
            <p className="mb-3 font-sans text-caption font-medium uppercase tracking-wider text-ivory-700">
              {editingTemplate ? "Edit Template" : "Add New Template"}
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Template name (e.g., 'Great draft')"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full rounded-lg border border-navy-700/50 bg-navy-900/60 px-3 py-2 font-sans text-body-sm text-ivory-300 placeholder:text-ivory-800 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
              />
              <textarea
                placeholder="Template content..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-navy-700/50 bg-navy-900/60 px-3 py-2 font-sans text-body-sm text-ivory-300 placeholder:text-ivory-800 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveTemplate}
                  disabled={!newLabel.trim() || !newContent.trim()}
                  className="flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2 font-sans text-body-sm font-medium text-navy-950 transition-colors hover:bg-gold-400 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  {editingTemplate ? "Update" : "Add"} Template
                </button>
                {editingTemplate && (
                  <button
                    onClick={() => {
                      setEditingTemplate(null);
                      setNewLabel("");
                      setNewContent("");
                    }}
                    className="rounded-lg px-4 py-2 font-sans text-body-sm text-ivory-600 transition-colors hover:text-ivory-300"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
