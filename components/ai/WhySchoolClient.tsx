"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Send,
  Sparkles,
  Save,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAIChat } from "@/hooks/use-ai-chat";
import { fetchStudentSchools } from "@/lib/actions/schools";
import { createEssay } from "@/lib/actions/essays";
import { brandToast } from "@/components/ui";

interface SchoolOption {
  id: string;
  school_name: string;
}

interface EssayOutline {
  hook: string;
  sections: { title: string; content: string }[];
  conclusion: string;
}

function extractEssayOutline(text: string): EssayOutline | null {
  const outlineMatch = text.match(
    /<essay_outline>([\s\S]*?)<\/essay_outline>/
  );
  if (!outlineMatch) return null;

  const raw = outlineMatch[1];
  const hook =
    raw.match(/<hook>([\s\S]*?)<\/hook>/)?.[1]?.trim() || "";
  const sections: { title: string; content: string }[] = [];
  const sectionRegex =
    /<section title="([^"]*)">([\s\S]*?)<\/section>/g;
  let match;
  while ((match = sectionRegex.exec(raw)) !== null) {
    sections.push({ title: match[1].trim(), content: match[2].trim() });
  }
  const conclusion =
    raw.match(/<conclusion>([\s\S]*?)<\/conclusion>/)?.[1]?.trim() || "";

  if (!hook && sections.length === 0 && !conclusion) return null;
  return { hook, sections, conclusion };
}

export function WhySchoolClient() {
  const {
    messages,
    isStreaming,
    error,
    remainingRequests,
    sendMessage,
  } = useAIChat("why_school");

  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [selectedSchoolName, setSelectedSchoolName] = useState("");
  const [phase, setPhase] = useState<"setup" | "chat">("setup");
  const [input, setInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function load() {
      const { data } = await fetchStudentSchools();
      if (data) {
        setSchools(
          (data as SchoolOption[]).map((s) => ({
            id: s.id,
            school_name: s.school_name,
          }))
        );
      }
      setLoadingSchools(false);
    }
    load();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Extract outline from all assistant messages
  const outline = useMemo<EssayOutline | null>(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") {
        const result = extractEssayOutline(messages[i].content);
        if (result) return result;
      }
    }
    return null;
  }, [messages]);

  const handleStartChat = async () => {
    const school = schools.find((s) => s.id === selectedSchoolId);
    if (!school) return;

    setSelectedSchoolName(school.school_name);
    setPhase("chat");
    await sendMessage(
      `I want to write a "Why ${school.school_name}" essay. Please help me develop a compelling outline by asking me about my specific interests in this school.`
    );
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

  const handleSaveEssay = async () => {
    if (!outline) return;
    setIsSaving(true);

    // Build outline text for the prompt field
    let outlineText = `Hook: ${outline.hook}\n\n`;
    outline.sections.forEach((s, i) => {
      outlineText += `${i + 1}. ${s.title}\n${s.content}\n\n`;
    });
    outlineText += `Conclusion: ${outline.conclusion}`;

    const { error: err } = await createEssay({
      title: `Why ${selectedSchoolName}`,
      prompt: outlineText,
      studentSchoolId: selectedSchoolId || null,
    });

    if (err) {
      brandToast.error("Error", err);
    } else {
      brandToast.success(
        "Essay Created",
        `"Why ${selectedSchoolName}" outline saved as a new essay.`
      );
      setSaved(true);
    }
    setIsSaving(false);
  };

  const cleanMessage = (content: string) =>
    content
      .replace(/<essay_outline>[\s\S]*?<\/essay_outline>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

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
              <BookOpen className="h-3.5 w-3.5 text-gold-400" />
            </div>
            <h1 className="font-serif text-heading-sm text-ivory-200">
              Why This School
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
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/10">
                <BookOpen className="h-7 w-7 text-gold-400" />
              </div>
              <h2 className="mt-4 font-serif text-heading-sm text-ivory-300">
                Why This School essay outline
              </h2>
              <p className="mt-2 font-sans text-body-sm text-ivory-600">
                Generate a structured outline through guided discovery.
                Select a school to get started.
              </p>
            </div>

            {loadingSchools ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-ivory-700" />
              </div>
            ) : schools.length === 0 ? (
              <div className="rounded-xl border border-navy-700/30 bg-navy-900/60 p-6 text-center">
                <p className="font-sans text-body-sm text-ivory-600">
                  No schools in your list yet.
                </p>
                <p className="mt-1 font-sans text-caption text-ivory-700">
                  Add schools to your profile first.
                </p>
              </div>
            ) : (
              <select
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value)}
                className="w-full rounded-xl border border-navy-700/50 bg-navy-900/60 px-4 py-3 font-sans text-body-sm text-ivory-300 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
              >
                <option value="">Select a school...</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.school_name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handleStartChat}
              disabled={!selectedSchoolId}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-500 px-4 py-3 font-sans text-body-sm font-medium text-navy-950 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <BookOpen className="h-4 w-4" />
              Start Building Outline
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Chat */}
          <div className="flex flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-4">
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
                            AI Strategist
                          </span>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">
                        {msg.role === "user" && i === 0
                          ? `📝 Writing "Why ${selectedSchoolName}" outline`
                          : msg.role === "assistant"
                            ? cleanMessage(msg.content)
                            : msg.content}
                      </div>
                    </div>
                  </div>
                ))}
                {isStreaming &&
                  messages.length > 0 &&
                  messages[messages.length - 1].role === "user" && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl bg-navy-800/60 px-4 py-3">
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

            <div className="border-t border-navy-700/30 px-6 py-3">
              <div className="flex items-end gap-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Answer the question or ask for adjustments..."
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

          {/* Right: Outline */}
          <div className="flex w-96 shrink-0 flex-col border-l border-navy-700/30">
            <div className="border-b border-navy-700/30 px-4 py-3">
              <h2 className="font-serif text-heading-sm text-ivory-300">
                Essay Outline
              </h2>
              <p className="mt-0.5 font-sans text-caption text-ivory-700">
                {outline
                  ? `"Why ${selectedSchoolName}" outline ready`
                  : "Your outline will appear here after the guided discovery"}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {!outline ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <BookOpen className="mx-auto h-6 w-6 text-ivory-800" />
                    <p className="mt-2 max-w-[14rem] font-sans text-caption text-ivory-700">
                      Answer the AI&apos;s questions and it will generate a
                      structured essay outline.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Hook */}
                  {outline.hook && (
                    <div className="rounded-xl border border-gold-500/20 bg-gold-500/5 p-3">
                      <p className="font-sans text-[0.625rem] font-medium uppercase tracking-wider text-gold-400">
                        Opening Hook
                      </p>
                      <p className="mt-1 font-sans text-caption leading-relaxed text-ivory-300">
                        {outline.hook}
                      </p>
                    </div>
                  )}

                  {/* Sections */}
                  {outline.sections.map((section, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-navy-700/30 bg-navy-900/60 p-3"
                    >
                      <p className="font-serif text-body-sm font-medium text-ivory-200">
                        {i + 1}. {section.title}
                      </p>
                      <p className="mt-1 font-sans text-caption leading-relaxed text-ivory-600">
                        {section.content}
                      </p>
                    </div>
                  ))}

                  {/* Conclusion */}
                  {outline.conclusion && (
                    <div className="rounded-xl border border-navy-700/30 bg-navy-900/60 p-3">
                      <p className="font-sans text-[0.625rem] font-medium uppercase tracking-wider text-ivory-700">
                        Conclusion
                      </p>
                      <p className="mt-1 font-sans text-caption leading-relaxed text-ivory-600">
                        {outline.conclusion}
                      </p>
                    </div>
                  )}

                  {/* Save button */}
                  <div className="pt-2">
                    {saved ? (
                      <span className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 font-sans text-body-sm font-medium text-emerald-400">
                        <Save className="h-4 w-4" />
                        Saved as Essay
                      </span>
                    ) : (
                      <button
                        onClick={handleSaveEssay}
                        disabled={isSaving}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-500 px-4 py-3 font-sans text-body-sm font-medium text-navy-950 transition-colors hover:bg-gold-400 disabled:opacity-50"
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save as Essay
                      </button>
                    )}
                    <p className="mt-2 text-center font-sans text-[0.625rem] text-ivory-700">
                      This is an outline, not a finished essay. Use it as a
                      starting point.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
