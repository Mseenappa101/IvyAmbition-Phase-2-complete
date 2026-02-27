"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Lightbulb,
  Send,
  Sparkles,
  Save,
  X,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAIChat } from "@/hooks/use-ai-chat";
import type { TopicIdea } from "@/hooks/use-ai-chat";
import { createEssay } from "@/lib/actions/essays";
import { fetchStudentSchools } from "@/lib/actions/schools";
import { Modal, brandToast } from "@/components/ui";

export function BrainstormClient() {
  const {
    messages,
    topicIdeas,
    isStreaming,
    error,
    remainingRequests,
    sendMessage,
    removeTopicIdea,
  } = useAIChat("brainstorm");

  const [input, setInput] = useState("");
  const [savingTopic, setSavingTopic] = useState<TopicIdea | null>(null);
  const [schools, setSchools] = useState<
    { id: string; school_name: string }[]
  >([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [essayPrompt, setEssayPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load schools for the save modal
  useEffect(() => {
    async function loadSchools() {
      const { data } = await fetchStudentSchools();
      if (data) {
        setSchools(
          data.map((s: { id: string; school_name: string }) => ({
            id: s.id,
            school_name: s.school_name,
          }))
        );
      }
    }
    loadSchools();
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveEssay = async () => {
    if (!savingTopic) return;
    setIsSaving(true);

    const { error } = await createEssay({
      title: savingTopic.title,
      prompt: essayPrompt || savingTopic.description,
      studentSchoolId: selectedSchoolId || null,
    });

    if (error) {
      brandToast.error("Error", error);
    } else {
      brandToast.success(
        "Essay Created",
        `"${savingTopic.title}" saved as a new essay in brainstorming status.`
      );
      removeTopicIdea(savingTopic.id);
    }

    setIsSaving(false);
    setSavingTopic(null);
    setSelectedSchoolId("");
    setEssayPrompt("");
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-navy-700/30 px-6 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/student/ai-tools"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-sans text-caption text-ivory-600 transition-colors hover:bg-navy-800/60 hover:text-ivory-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            AI Tools
          </Link>
          <div className="h-4 w-px bg-navy-700/30" />
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold-500/10">
              <Lightbulb className="h-3.5 w-3.5 text-gold-400" />
            </div>
            <h1 className="font-serif text-heading-sm text-ivory-200">
              Essay Brainstormer
            </h1>
          </div>
        </div>
        {remainingRequests !== null && (
          <span className="rounded-full bg-navy-800/80 px-3 py-1 font-sans text-caption text-ivory-600">
            {remainingRequests} / 50 remaining today
          </span>
        )}
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Chat Panel */}
        <div className="flex flex-1 flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {messages.length === 0 && !isStreaming ? (
              <div className="flex h-full items-center justify-center">
                <div className="max-w-md text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/10">
                    <Sparkles className="h-7 w-7 text-gold-400" />
                  </div>
                  <h2 className="mt-4 font-serif text-heading-sm text-ivory-300">
                    Let&apos;s find your story
                  </h2>
                  <p className="mt-2 font-sans text-body-sm leading-relaxed text-ivory-600">
                    I&apos;ll ask you thoughtful questions to help uncover
                    compelling, authentic essay topics that only you could write.
                    Type anything to begin.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3 font-sans text-body-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-gold-500/15 text-ivory-200"
                          : "bg-navy-800/60 text-ivory-300"
                      )}
                    >
                      {msg.role === "assistant" && (
                        <div className="mb-1 flex items-center gap-1.5">
                          <Sparkles className="h-3 w-3 text-gold-400" />
                          <span className="font-sans text-[0.625rem] font-medium uppercase tracking-wider text-gold-400">
                            AI Counselor
                          </span>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                ))}
                {isStreaming &&
                  messages.length > 0 &&
                  messages[messages.length - 1].role === "user" && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl bg-navy-800/60 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-gold-400 [animation-delay:0ms]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-gold-400 [animation-delay:150ms]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-gold-400 [animation-delay:300ms]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Error banner */}
          {error && (
            <div className="mx-6 mb-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 font-sans text-caption text-red-400">
              {error}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-navy-700/30 px-6 py-3">
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  messages.length === 0
                    ? "Tell me about a meaningful experience..."
                    : "Type your response..."
                }
                rows={1}
                className="flex-1 resize-none rounded-xl border border-navy-700/50 bg-navy-900/60 px-4 py-3 font-sans text-body-sm text-ivory-300 placeholder:text-ivory-800 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                style={{ maxHeight: "120px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height =
                    Math.min(target.scrollHeight, 120) + "px";
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-500 text-navy-950 transition-all hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Topic Ideas Panel */}
        <div className="flex w-96 shrink-0 flex-col border-l border-navy-700/30">
          <div className="border-b border-navy-700/30 px-4 py-3">
            <h2 className="font-serif text-heading-sm text-ivory-300">
              Topic Ideas
            </h2>
            <p className="mt-0.5 font-sans text-caption text-ivory-700">
              {topicIdeas.length === 0
                ? "Ideas will appear here as you brainstorm"
                : `${topicIdeas.length} topic${topicIdeas.length !== 1 ? "s" : ""} discovered`}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {topicIdeas.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-800/60">
                    <Lightbulb className="h-6 w-6 text-ivory-800" />
                  </div>
                  <p className="mt-3 max-w-[14rem] font-sans text-caption leading-relaxed text-ivory-700">
                    As you chat, the AI will identify promising essay topics and
                    add them here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {topicIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className="rounded-xl border border-navy-700/30 bg-navy-900/60 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif text-body-sm font-medium text-ivory-200">
                        {idea.title}
                      </h3>
                      <button
                        onClick={() => removeTopicIdea(idea.id)}
                        className="shrink-0 rounded p-0.5 text-ivory-800 transition-colors hover:text-ivory-500"
                        title="Dismiss"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="mt-1.5 font-sans text-caption leading-relaxed text-ivory-600">
                      {idea.description}
                    </p>
                    <button
                      onClick={() => setSavingTopic(idea)}
                      className="mt-3 flex items-center gap-1.5 rounded-lg bg-gold-500/10 px-3 py-1.5 font-sans text-caption font-medium text-gold-400 transition-colors hover:bg-gold-500/20"
                    >
                      <Save className="h-3 w-3" />
                      Save as Essay
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Essay Modal */}
      <Modal
        open={!!savingTopic}
        onClose={() => {
          setSavingTopic(null);
          setSelectedSchoolId("");
          setEssayPrompt("");
        }}
        title="Save as Essay"
        size="sm"
      >
        {savingTopic && (
          <div className="space-y-4">
            <div>
              <p className="font-serif text-body-sm font-medium text-ivory-200">
                {savingTopic.title}
              </p>
              <p className="mt-1 font-sans text-caption text-ivory-600">
                {savingTopic.description}
              </p>
            </div>

            {/* School selector */}
            {schools.length > 0 && (
              <div>
                <label className="mb-1.5 block font-sans text-caption font-medium text-ivory-400">
                  <GraduationCap className="mb-0.5 mr-1 inline h-3.5 w-3.5" />
                  Link to School (optional)
                </label>
                <select
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                  className="w-full rounded-lg border border-navy-700/50 bg-navy-900/60 px-3 py-2 font-sans text-caption text-ivory-300 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                >
                  <option value="">No school selected</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.school_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Essay prompt field */}
            <div>
              <label className="mb-1.5 block font-sans text-caption font-medium text-ivory-400">
                Essay Prompt (optional)
              </label>
              <textarea
                value={essayPrompt}
                onChange={(e) => setEssayPrompt(e.target.value)}
                placeholder="e.g., Describe a challenge you've overcome..."
                rows={3}
                className="w-full resize-none rounded-lg border border-navy-700/50 bg-navy-900/60 px-3 py-2 font-sans text-caption text-ivory-300 placeholder:text-ivory-800 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setSavingTopic(null);
                  setSelectedSchoolId("");
                  setEssayPrompt("");
                }}
                className="rounded-lg px-4 py-2 font-sans text-caption font-medium text-ivory-500 transition-colors hover:text-ivory-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEssay}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2 font-sans text-caption font-medium text-navy-950 transition-colors hover:bg-gold-400 disabled:opacity-50"
              >
                {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save Essay
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
