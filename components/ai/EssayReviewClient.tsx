"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileSearch,
  Send,
  Sparkles,
  FileText,
  ClipboardPaste,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAIChat } from "@/hooks/use-ai-chat";
import { fetchStudentEssays, fetchEssay } from "@/lib/actions/essays";

interface EssayListItem {
  id: string;
  title: string;
  content: string;
  prompt: string;
  word_count: number;
  status: string;
  student_schools: { school_name: string } | null;
}

export function EssayReviewClient() {
  const {
    messages,
    isStreaming,
    error,
    remainingRequests,
    sendMessage,
  } = useAIChat("essay_review");

  const [phase, setPhase] = useState<"setup" | "chat">("setup");
  const [essays, setEssays] = useState<EssayListItem[]>([]);
  const [loadingEssays, setLoadingEssays] = useState(true);
  const [selectedEssayId, setSelectedEssayId] = useState("");
  const [inputMode, setInputMode] = useState<"select" | "paste">("select");
  const [pastedText, setPastedText] = useState("");
  const [pastedTitle, setPastedTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function loadEssays() {
      const { data } = await fetchStudentEssays();
      if (data) {
        setEssays(
          (data as EssayListItem[]).filter((e) => e.content && e.word_count > 0)
        );
      }
      setLoadingEssays(false);
    }
    loadEssays();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmitEssay = async () => {
    setSubmitting(true);

    let essayText = "";
    let title = "";
    let school = "";
    let prompt = "";

    if (inputMode === "select" && selectedEssayId) {
      const { data } = await fetchEssay(selectedEssayId);
      if (data) {
        const essay = data as EssayListItem;
        essayText = essay.content;
        title = essay.title;
        school = essay.student_schools?.school_name ?? "";
        prompt = essay.prompt ?? "";
      }
    } else if (inputMode === "paste" && pastedText.trim()) {
      essayText = pastedText;
      title = pastedTitle || "Untitled Essay";
    }

    if (!essayText.trim()) {
      setSubmitting(false);
      return;
    }

    let contextLine = `Please review the following essay titled "${title}"`;
    if (school) contextLine += ` for ${school}`;
    if (prompt) contextLine += `.\n\nEssay prompt: ${prompt}`;
    contextLine += `\n\n---\n\n${essayText}`;

    setPhase("chat");
    setSubmitting(false);
    await sendMessage(contextLine);
  };

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

  const canSubmit =
    (inputMode === "select" && selectedEssayId) ||
    (inputMode === "paste" && pastedText.trim().length > 50);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-charcoal-900">
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
              <FileSearch className="h-3.5 w-3.5 text-gold-400" />
            </div>
            <h1 className="font-serif text-heading-sm text-ivory-200">
              Essay Reviewer
            </h1>
          </div>
        </div>
        {remainingRequests !== null && (
          <span className="rounded-full bg-navy-800/80 px-3 py-1 font-sans text-caption text-ivory-600">
            {remainingRequests} / 50 remaining today
          </span>
        )}
      </div>

      {phase === "setup" ? (
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="w-full max-w-xl space-y-6">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/10">
                <FileSearch className="h-7 w-7 text-gold-400" />
              </div>
              <h2 className="mt-4 font-serif text-heading-sm text-ivory-300">
                Get expert feedback on your essay
              </h2>
              <p className="mt-2 font-sans text-body-sm text-ivory-600">
                Select an essay from your saved essays or paste text directly.
              </p>
            </div>

            {/* Input mode toggle */}
            <div className="flex rounded-lg border border-navy-700/30 p-1">
              <button
                onClick={() => setInputMode("select")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 font-sans text-caption font-medium transition-colors",
                  inputMode === "select"
                    ? "bg-gold-500/15 text-gold-400"
                    : "text-ivory-600 hover:text-ivory-400"
                )}
              >
                <FileText className="h-3.5 w-3.5" />
                Select Essay
              </button>
              <button
                onClick={() => setInputMode("paste")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 font-sans text-caption font-medium transition-colors",
                  inputMode === "paste"
                    ? "bg-gold-500/15 text-gold-400"
                    : "text-ivory-600 hover:text-ivory-400"
                )}
              >
                <ClipboardPaste className="h-3.5 w-3.5" />
                Paste Text
              </button>
            </div>

            {inputMode === "select" ? (
              <div>
                {loadingEssays ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-ivory-700" />
                  </div>
                ) : essays.length === 0 ? (
                  <div className="rounded-xl border border-navy-700/30 bg-navy-900/60 p-6 text-center">
                    <p className="font-sans text-body-sm text-ivory-600">
                      No essays with content found.
                    </p>
                    <p className="mt-1 font-sans text-caption text-ivory-700">
                      Write some content in your essays first, or paste text
                      directly.
                    </p>
                  </div>
                ) : (
                  <select
                    value={selectedEssayId}
                    onChange={(e) => setSelectedEssayId(e.target.value)}
                    className="w-full rounded-xl border border-navy-700/50 bg-navy-900/60 px-4 py-3 font-sans text-body-sm text-ivory-300 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                  >
                    <option value="">Choose an essay...</option>
                    {essays.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title}
                        {e.student_schools
                          ? ` — ${e.student_schools.school_name}`
                          : ""}
                        {" "}({e.word_count} words)
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={pastedTitle}
                  onChange={(e) => setPastedTitle(e.target.value)}
                  placeholder="Essay title (optional)"
                  className="w-full rounded-xl border border-navy-700/50 bg-navy-900/60 px-4 py-3 font-sans text-body-sm text-ivory-300 placeholder:text-ivory-800 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                />
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your essay text here..."
                  rows={10}
                  className="w-full resize-none rounded-xl border border-navy-700/50 bg-navy-900/60 px-4 py-3 font-sans text-body-sm text-ivory-300 placeholder:text-ivory-800 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                />
                {pastedText.trim() && (
                  <p className="font-sans text-caption text-ivory-700">
                    {pastedText.trim().split(/\s+/).length} words
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleSubmitEssay}
              disabled={!canSubmit || submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-500 px-4 py-3 font-sans text-body-sm font-medium text-navy-950 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Review My Essay
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col bg-charcoal-900">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-charcoal-900 px-6 py-4">
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
                      "max-w-[85%] rounded-2xl px-4 py-3 font-sans text-body-sm leading-relaxed",
                      msg.role === "user"
                        ? "border border-gold-500/20 bg-gold-500/10 text-ivory-200"
                        : "border border-navy-700/50 bg-navy-900 text-ivory-300"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="mb-1 flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-gold-400" />
                        <span className="font-sans text-[0.625rem] font-medium uppercase tracking-wider text-gold-400">
                          AI Reviewer
                        </span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">
                      {msg.role === "user" && i === 0
                        ? "📄 Essay submitted for review"
                        : msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isStreaming &&
                messages.length > 0 &&
                messages[messages.length - 1].role === "user" && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl border border-navy-700/50 bg-navy-900 px-4 py-3">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-gold-400 [animation-delay:0ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-gold-400 [animation-delay:150ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-gold-400 [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
              <div ref={bottomRef} />
            </div>
          </div>

          {error && (
            <div className="mx-6 mb-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 font-sans text-caption text-red-400">
              {error}
            </div>
          )}

          {/* Follow-up input */}
          <div className="border-t border-navy-700/30 bg-charcoal-900 px-6 py-3">
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a follow-up question about the review..."
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
      )}
    </div>
  );
}
