"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MessageCircle,
  Send,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAIChat } from "@/hooks/use-ai-chat";
import { fetchStudentSchools } from "@/lib/actions/schools";

interface SchoolOption {
  id: string;
  school_name: string;
  application_type: string;
}

export function InterviewPrepClient() {
  const {
    messages,
    isStreaming,
    error,
    remainingRequests,
    sendMessage,
  } = useAIChat("interview_prep");

  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [phase, setPhase] = useState<"setup" | "interview">("setup");
  const [input, setInput] = useState("");
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
            application_type: s.application_type,
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

  const handleStartInterview = async () => {
    const school = schools.find((s) => s.id === selectedSchool);
    if (!school) return;

    setPhase("interview");
    await sendMessage(
      `I'm preparing for an admissions interview with ${school.school_name}. The application type is ${school.application_type.replace("_", " ")}. Please generate likely interview questions for this school and let's begin a mock interview.`
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

  // Count questions from AI messages (look for numbered patterns like "1." "2." etc.)
  const questionCount = messages.filter(
    (m) => m.role === "user" && m !== messages[0]
  ).length;

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
              <MessageCircle className="h-3.5 w-3.5 text-gold-400" />
            </div>
            <h1 className="font-serif text-heading-sm text-ivory-200">
              Interview Prep
            </h1>
          </div>
          {phase === "interview" && questionCount > 0 && (
            <>
              <div className="h-4 w-px bg-navy-700/30" />
              <span className="rounded-full bg-gold-500/10 px-2.5 py-1 font-sans text-caption font-medium text-gold-400">
                {questionCount} response{questionCount !== 1 ? "s" : ""}
              </span>
            </>
          )}
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
                <MessageCircle className="h-7 w-7 text-gold-400" />
              </div>
              <h2 className="mt-4 font-serif text-heading-sm text-ivory-300">
                Practice your interview
              </h2>
              <p className="mt-2 font-sans text-body-sm text-ivory-600">
                Select a school to get tailored interview questions and
                real-time coaching feedback.
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
                  Add schools to your profile first, or type a school name
                  below.
                </p>
              </div>
            ) : (
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
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
              onClick={handleStartInterview}
              disabled={!selectedSchool}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-500 px-4 py-3 font-sans text-body-sm font-medium text-navy-950 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <MessageCircle className="h-4 w-4" />
              Start Mock Interview
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col bg-charcoal-900">
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
                      "max-w-[80%] rounded-2xl px-4 py-3 font-sans text-body-sm leading-relaxed",
                      msg.role === "user"
                        ? "border border-gold-500/20 bg-gold-500/10 text-ivory-200"
                        : "border border-navy-700/50 bg-navy-900 text-ivory-300"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="mb-1 flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-gold-400" />
                        <span className="font-sans text-[0.625rem] font-medium uppercase tracking-wider text-gold-400">
                          AI Interviewer
                        </span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">
                      {msg.role === "user" && i === 0
                        ? `🎓 Preparing for ${schools.find((s) => s.id === selectedSchool)?.school_name} interview`
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

          <div className="border-t border-navy-700/30 bg-charcoal-900 px-6 py-3">
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer to the interview question..."
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
