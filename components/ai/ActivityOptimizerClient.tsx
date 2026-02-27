"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  PenLine,
  Send,
  Sparkles,
  Save,
  X,
  Check,
  Copy,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAIChat } from "@/hooks/use-ai-chat";
import {
  fetchStudentActivities,
  updateActivity,
} from "@/lib/actions/activities";
import { brandToast } from "@/components/ui";

interface Activity {
  id: string;
  activity_name: string;
  category: string;
  organization: string;
  position_title: string;
  description: string;
  character_count: number;
  hours_per_week: number;
  weeks_per_year: number;
}

interface OptimizedDesc {
  id: string;
  text: string;
  charCount: number;
}

function extractOptimizedDescriptions(text: string): string[] {
  const descs: string[] = [];
  const regex =
    /<optimized_description>([\s\S]*?)<\/optimized_description>/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    descs.push(match[1].trim());
  }
  return descs;
}

export function ActivityOptimizerClient() {
  const {
    messages,
    isStreaming,
    error,
    remainingRequests,
    sendMessage,
  } = useAIChat("activity_optimizer");

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [phase, setPhase] = useState<"setup" | "chat">("setup");
  const [input, setInput] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function load() {
      const { data } = await fetchStudentActivities();
      if (data) setActivities(data as Activity[]);
      setLoadingActivities(false);
    }
    load();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Extract optimized descriptions from all assistant messages
  const optimizedDescriptions = useMemo<OptimizedDesc[]>(() => {
    const descs: OptimizedDesc[] = [];
    const seen = new Set<string>();
    for (const msg of messages) {
      if (msg.role !== "assistant") continue;
      for (const text of extractOptimizedDescriptions(msg.content)) {
        if (!seen.has(text)) {
          seen.add(text);
          descs.push({
            id: crypto.randomUUID(),
            text,
            charCount: text.length,
          });
        }
      }
    }
    return descs;
  }, [messages]);

  const handleSelectActivity = async (activity: Activity) => {
    setSelectedActivity(activity);
    setPhase("chat");

    const msg = `Please optimize the following activity description for the Common App (150 character limit):

Activity: ${activity.activity_name}
Position: ${activity.position_title}
Organization: ${activity.organization}
Current Description (${activity.description.length}/150 chars): ${activity.description}
Hours/Week: ${activity.hours_per_week}, Weeks/Year: ${activity.weeks_per_year}

Please provide an optimized version within 150 characters.`;

    await sendMessage(msg);
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

  const handleSaveDescription = async (desc: OptimizedDesc) => {
    if (!selectedActivity) return;
    setSavingId(desc.id);

    const { error: err } = await updateActivity(selectedActivity.id, {
      description: desc.text,
    });

    if (err) {
      brandToast.error("Error", err);
    } else {
      brandToast.success(
        "Description Updated",
        `Activity description updated to ${desc.charCount} characters.`
      );
      setSavedIds((prev) => new Set(prev).add(desc.id));
    }
    setSavingId(null);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    brandToast.success("Copied", "Description copied to clipboard.");
  };

  // Strip XML tags from displayed messages
  const cleanMessage = (content: string) =>
    content
      .replace(/<optimized_description>[\s\S]*?<\/optimized_description>/g, "")
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
              <PenLine className="h-3.5 w-3.5 text-gold-400" />
            </div>
            <h1 className="font-serif text-heading-sm text-ivory-200">
              Activity Optimizer
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
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/10">
                <PenLine className="h-7 w-7 text-gold-400" />
              </div>
              <h2 className="mt-4 font-serif text-heading-sm text-ivory-300">
                Optimize your activity descriptions
              </h2>
              <p className="mt-2 font-sans text-body-sm text-ivory-600">
                Select an activity to get an AI-optimized description within the
                150-character Common App limit.
              </p>
            </div>

            {loadingActivities ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-ivory-700" />
              </div>
            ) : activities.length === 0 ? (
              <div className="rounded-xl border border-navy-700/30 bg-navy-900/60 p-6 text-center">
                <p className="font-sans text-body-sm text-ivory-600">
                  No activities found.
                </p>
                <p className="mt-1 font-sans text-caption text-ivory-700">
                  Add activities to your profile first.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((act) => (
                  <button
                    key={act.id}
                    onClick={() => handleSelectActivity(act)}
                    className="w-full rounded-xl border border-navy-700/30 bg-navy-900/60 p-4 text-left transition-colors hover:border-gold-500/30 hover:bg-navy-900/80"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-serif text-body-sm font-medium text-ivory-200">
                          {act.activity_name}
                        </p>
                        <p className="mt-0.5 font-sans text-caption text-ivory-600">
                          {act.position_title}
                          {act.organization ? ` at ${act.organization}` : ""}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 font-sans text-[0.625rem] font-medium",
                          act.description.length <= 150
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        )}
                      >
                        {act.description.length}/150
                      </span>
                    </div>
                    {act.description && (
                      <p className="mt-2 font-sans text-caption text-ivory-700">
                        {act.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
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
                            AI Optimizer
                          </span>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">
                        {msg.role === "user" && i === 0
                          ? `📋 Optimizing: ${selectedActivity?.activity_name}`
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
                  placeholder="Ask for alternatives or adjustments..."
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

          {/* Right: Optimized Descriptions */}
          <div className="flex w-96 shrink-0 flex-col border-l border-navy-700/30">
            <div className="border-b border-navy-700/30 px-4 py-3">
              <h2 className="font-serif text-heading-sm text-ivory-300">
                Optimized Versions
              </h2>
              <p className="mt-0.5 font-sans text-caption text-ivory-700">
                {optimizedDescriptions.length === 0
                  ? "Optimized descriptions will appear here"
                  : `${optimizedDescriptions.length} version${optimizedDescriptions.length !== 1 ? "s" : ""} generated`}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Original description */}
              {selectedActivity && (
                <div className="mb-4 rounded-xl border border-navy-700/20 bg-navy-900/40 p-3">
                  <p className="font-sans text-[0.625rem] font-medium uppercase tracking-wider text-ivory-700">
                    Original
                  </p>
                  <p className="mt-1 font-sans text-caption text-ivory-500">
                    {selectedActivity.description || "No description"}
                  </p>
                  <p
                    className={cn(
                      "mt-1 font-sans text-[0.625rem]",
                      selectedActivity.description.length <= 150
                        ? "text-emerald-400"
                        : "text-red-400"
                    )}
                  >
                    {selectedActivity.description.length}/150 characters
                  </p>
                </div>
              )}

              {optimizedDescriptions.length === 0 ? (
                <div className="flex h-48 items-center justify-center">
                  <div className="text-center">
                    <PenLine className="mx-auto h-6 w-6 text-ivory-800" />
                    <p className="mt-2 max-w-[14rem] font-sans text-caption text-ivory-700">
                      The AI will generate optimized descriptions here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {optimizedDescriptions.map((desc) => (
                    <div
                      key={desc.id}
                      className="rounded-xl border border-navy-700/30 bg-navy-900/60 p-4"
                    >
                      <p className="font-sans text-body-sm text-ivory-200">
                        {desc.text}
                      </p>
                      <p
                        className={cn(
                          "mt-1.5 font-sans text-[0.625rem] font-medium",
                          desc.charCount <= 150
                            ? "text-emerald-400"
                            : "text-red-400"
                        )}
                      >
                        {desc.charCount}/150 characters
                      </p>
                      <div className="mt-3 flex gap-2">
                        {savedIds.has(desc.id) ? (
                          <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 font-sans text-caption font-medium text-emerald-400">
                            <Check className="h-3 w-3" />
                            Saved
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSaveDescription(desc)}
                            disabled={savingId === desc.id}
                            className="flex items-center gap-1.5 rounded-lg bg-gold-500/10 px-3 py-1.5 font-sans text-caption font-medium text-gold-400 transition-colors hover:bg-gold-500/20 disabled:opacity-50"
                          >
                            {savingId === desc.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Save className="h-3 w-3" />
                            )}
                            Save to Activity
                          </button>
                        )}
                        <button
                          onClick={() => handleCopy(desc.text)}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-caption font-medium text-ivory-600 transition-colors hover:bg-navy-800/60 hover:text-ivory-400"
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
