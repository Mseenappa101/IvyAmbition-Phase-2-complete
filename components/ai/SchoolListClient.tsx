"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  GraduationCap,
  Send,
  Sparkles,
  Plus,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAIChat } from "@/hooks/use-ai-chat";
import {
  fetchStudentProfileForAI,
  type StudentProfileForAI,
} from "@/lib/actions/student-profile";
import {
  fetchStudentSchools,
  addStudentSchool,
} from "@/lib/actions/schools";
import { brandToast } from "@/components/ui";

interface SchoolRec {
  id: string;
  name: string;
  category: "reach" | "target" | "safety";
  explanation: string;
}

function extractSchoolRecommendations(text: string): SchoolRec[] {
  const recs: SchoolRec[] = [];
  const regex =
    /<school_recommendation>\s*<name>([\s\S]*?)<\/name>\s*<category>([\s\S]*?)<\/category>\s*<explanation>([\s\S]*?)<\/explanation>\s*<\/school_recommendation>/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    recs.push({
      id: crypto.randomUUID(),
      name: match[1].trim(),
      category: match[2].trim() as "reach" | "target" | "safety",
      explanation: match[3].trim(),
    });
  }
  return recs;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function SchoolListClient() {
  const {
    messages,
    isStreaming,
    error,
    remainingRequests,
    sendMessage,
  } = useAIChat("school_list");

  const [profile, setProfile] = useState<StudentProfileForAI | null>(null);
  const [existingSchoolNames, setExistingSchoolNames] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<"setup" | "chat">("setup");
  const [locationPref, setLocationPref] = useState("");
  const [sizePref, setSizePref] = useState("");
  const [priorityText, setPriorityText] = useState("");
  const [addedSchools, setAddedSchools] = useState<Set<string>>(new Set());
  const [addingSchool, setAddingSchool] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function load() {
      const [profileRes, schoolsRes] = await Promise.all([
        fetchStudentProfileForAI(),
        fetchStudentSchools(),
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      if (schoolsRes.data) {
        setExistingSchoolNames(
          new Set(
            (schoolsRes.data as { school_name: string }[]).map((s) =>
              s.school_name.toLowerCase()
            )
          )
        );
      }
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Extract recommendations from all assistant messages
  const recommendations = useMemo<SchoolRec[]>(() => {
    const all: SchoolRec[] = [];
    const seen = new Set<string>();
    for (const msg of messages) {
      if (msg.role !== "assistant") continue;
      for (const rec of extractSchoolRecommendations(msg.content)) {
        if (!seen.has(rec.name.toLowerCase())) {
          seen.add(rec.name.toLowerCase());
          all.push(rec);
        }
      }
    }
    return all;
  }, [messages]);

  const reachSchools = recommendations.filter((r) => r.category === "reach");
  const targetSchools = recommendations.filter(
    (r) => r.category === "target"
  );
  const safetySchools = recommendations.filter(
    (r) => r.category === "safety"
  );

  const handleGetRecommendations = async () => {
    if (!profile) return;

    let statsText = `Here is my academic profile:\n- Application Type: ${profile.application_type.replace("_", " ")}`;
    if (profile.current_gpa)
      statsText += `\n- GPA: ${profile.current_gpa}`;
    if (profile.sat_score)
      statsText += `\n- SAT Score: ${profile.sat_score}`;
    if (profile.act_score) statsText += `\n- ACT Score: ${profile.act_score}`;
    if (profile.lsat_score)
      statsText += `\n- LSAT Score: ${profile.lsat_score}`;
    if (profile.intended_major)
      statsText += `\n- Intended Major: ${profile.intended_major}`;
    if (profile.current_school)
      statsText += `\n- Current School: ${profile.current_school}`;
    if (profile.work_experience_years)
      statsText += `\n- Work Experience: ${profile.work_experience_years} years`;
    if (profile.class_rank)
      statsText += `\n- Class Rank: ${profile.class_rank}`;

    if (locationPref || sizePref || priorityText) {
      statsText += "\n\nMy preferences:";
      if (locationPref) statsText += `\n- Location: ${locationPref}`;
      if (sizePref) statsText += `\n- School Size: ${sizePref}`;
      if (priorityText)
        statsText += `\n- What matters most to me: ${priorityText}`;
    }

    statsText +=
      "\n\nPlease help me build a balanced college list with reach, target, and safety schools.";

    setPhase("chat");
    await sendMessage(statsText);
  };

  const handleAddSchool = async (rec: SchoolRec) => {
    if (!profile) return;
    setAddingSchool(rec.name);

    const { error: err } = await addStudentSchool({
      schoolName: rec.name,
      schoolSlug: slugify(rec.name),
      applicationType: profile.application_type,
      deadline: null,
    });

    if (err) {
      brandToast.error("Error", err);
    } else {
      brandToast.success("School Added", `${rec.name} added to your list.`);
      setAddedSchools((prev) => new Set(prev).add(rec.name.toLowerCase()));
    }
    setAddingSchool(null);
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

  const cleanMessage = (content: string) =>
    content
      .replace(
        /<school_recommendation>[\s\S]*?<\/school_recommendation>/g,
        ""
      )
      .replace(/\n{3,}/g, "\n\n")
      .trim();

  const isAlreadyInList = (name: string) =>
    existingSchoolNames.has(name.toLowerCase()) ||
    addedSchools.has(name.toLowerCase());

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
              <GraduationCap className="h-3.5 w-3.5 text-gold-400" />
            </div>
            <h1 className="font-serif text-heading-sm text-ivory-200">
              School List Builder
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
          <div className="mx-auto max-w-xl space-y-6">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/10">
                <GraduationCap className="h-7 w-7 text-gold-400" />
              </div>
              <h2 className="mt-4 font-serif text-heading-sm text-ivory-300">
                Build your school list
              </h2>
              <p className="mt-2 font-sans text-body-sm text-ivory-600">
                Get personalized reach, target, and safety recommendations.
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-ivory-700" />
              </div>
            ) : !profile ? (
              <div className="rounded-xl border border-navy-700/30 bg-navy-900/60 p-6 text-center">
                <p className="font-sans text-body-sm text-ivory-600">
                  Student profile not found. Complete onboarding first.
                </p>
              </div>
            ) : (
              <>
                {/* Auto-populated stats */}
                <div className="rounded-xl border border-navy-700/30 bg-navy-900/60 p-4">
                  <p className="mb-3 font-sans text-[0.625rem] font-medium uppercase tracking-wider text-ivory-700">
                    Your Academic Profile
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="font-sans text-caption text-ivory-600">
                        Application Type
                      </p>
                      <p className="font-sans text-body-sm font-medium text-ivory-300">
                        {profile.application_type.replace("_", " ")}
                      </p>
                    </div>
                    {profile.current_gpa && (
                      <div>
                        <p className="font-sans text-caption text-ivory-600">
                          GPA
                        </p>
                        <p className="font-sans text-body-sm font-medium text-ivory-300">
                          {profile.current_gpa}
                        </p>
                      </div>
                    )}
                    {profile.sat_score && (
                      <div>
                        <p className="font-sans text-caption text-ivory-600">
                          SAT
                        </p>
                        <p className="font-sans text-body-sm font-medium text-ivory-300">
                          {profile.sat_score}
                        </p>
                      </div>
                    )}
                    {profile.act_score && (
                      <div>
                        <p className="font-sans text-caption text-ivory-600">
                          ACT
                        </p>
                        <p className="font-sans text-body-sm font-medium text-ivory-300">
                          {profile.act_score}
                        </p>
                      </div>
                    )}
                    {profile.lsat_score && (
                      <div>
                        <p className="font-sans text-caption text-ivory-600">
                          LSAT
                        </p>
                        <p className="font-sans text-body-sm font-medium text-ivory-300">
                          {profile.lsat_score}
                        </p>
                      </div>
                    )}
                    {profile.intended_major && (
                      <div>
                        <p className="font-sans text-caption text-ivory-600">
                          Intended Major
                        </p>
                        <p className="font-sans text-body-sm font-medium text-ivory-300">
                          {profile.intended_major}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-3">
                  <p className="font-sans text-[0.625rem] font-medium uppercase tracking-wider text-ivory-700">
                    Your Preferences (optional)
                  </p>
                  <input
                    type="text"
                    value={locationPref}
                    onChange={(e) => setLocationPref(e.target.value)}
                    placeholder="Location preference (e.g., Northeast, California, urban)"
                    className="w-full rounded-xl border border-navy-700/50 bg-navy-900/60 px-4 py-3 font-sans text-body-sm text-ivory-300 placeholder:text-ivory-800 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                  />
                  <select
                    value={sizePref}
                    onChange={(e) => setSizePref(e.target.value)}
                    className="w-full rounded-xl border border-navy-700/50 bg-navy-900/60 px-4 py-3 font-sans text-body-sm text-ivory-300 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                  >
                    <option value="">School size (any)</option>
                    <option value="small (under 5,000)">
                      Small (under 5,000 students)
                    </option>
                    <option value="medium (5,000-15,000)">
                      Medium (5,000-15,000 students)
                    </option>
                    <option value="large (over 15,000)">
                      Large (over 15,000 students)
                    </option>
                  </select>
                  <textarea
                    value={priorityText}
                    onChange={(e) => setPriorityText(e.target.value)}
                    placeholder="What matters most to you? (e.g., research opportunities, campus culture, financial aid, specific programs)"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-navy-700/50 bg-navy-900/60 px-4 py-3 font-sans text-body-sm text-ivory-300 placeholder:text-ivory-800 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                  />
                </div>

                <button
                  onClick={handleGetRecommendations}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-500 px-4 py-3 font-sans text-body-sm font-medium text-navy-950 transition-colors hover:bg-gold-400"
                >
                  <Sparkles className="h-4 w-4" />
                  Get Recommendations
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Chat */}
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
                            AI Counselor
                          </span>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">
                        {msg.role === "user" && i === 0
                          ? "📊 Profile and preferences submitted"
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
                  placeholder="Ask about a specific school or adjust preferences..."
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

          {/* Right: Recommendations */}
          <div className="flex w-96 shrink-0 flex-col border-l border-navy-700/30">
            <div className="border-b border-navy-700/30 px-4 py-3">
              <h2 className="font-serif text-heading-sm text-ivory-300">
                Recommendations
              </h2>
              <p className="mt-0.5 font-sans text-caption text-ivory-700">
                {recommendations.length === 0
                  ? "Schools will appear here as the AI recommends them"
                  : `${recommendations.length} school${recommendations.length !== 1 ? "s" : ""} recommended`}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {recommendations.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <GraduationCap className="mx-auto h-6 w-6 text-ivory-800" />
                    <p className="mt-2 max-w-[14rem] font-sans text-caption text-ivory-700">
                      The AI will recommend schools categorized as reach,
                      target, and safety.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {[
                    {
                      label: "Reach",
                      items: reachSchools,
                      color: "text-amber-400",
                      bg: "bg-amber-500/10",
                    },
                    {
                      label: "Target",
                      items: targetSchools,
                      color: "text-blue-400",
                      bg: "bg-blue-500/10",
                    },
                    {
                      label: "Safety",
                      items: safetySchools,
                      color: "text-emerald-400",
                      bg: "bg-emerald-500/10",
                    },
                  ]
                    .filter((g) => g.items.length > 0)
                    .map((group) => (
                      <div key={group.label}>
                        <p
                          className={cn(
                            "mb-2 font-sans text-[0.625rem] font-medium uppercase tracking-wider",
                            group.color
                          )}
                        >
                          {group.label} ({group.items.length})
                        </p>
                        <div className="space-y-2">
                          {group.items.map((rec) => (
                            <div
                              key={rec.id}
                              className="rounded-xl border border-navy-700/30 bg-navy-900/60 p-3"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-serif text-body-sm font-medium text-ivory-200">
                                  {rec.name}
                                </p>
                                <span
                                  className={cn(
                                    "shrink-0 rounded-full px-2 py-0.5 font-sans text-[0.5625rem] font-medium uppercase",
                                    group.bg,
                                    group.color
                                  )}
                                >
                                  {rec.category}
                                </span>
                              </div>
                              <p className="mt-1 font-sans text-caption leading-relaxed text-ivory-600">
                                {rec.explanation}
                              </p>
                              {isAlreadyInList(rec.name) ? (
                                <span className="mt-2 flex items-center gap-1.5 font-sans text-caption text-emerald-400">
                                  <Check className="h-3 w-3" />
                                  Already in your list
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleAddSchool(rec)}
                                  disabled={addingSchool === rec.name}
                                  className="mt-2 flex items-center gap-1.5 rounded-lg bg-gold-500/10 px-3 py-1.5 font-sans text-caption font-medium text-gold-400 transition-colors hover:bg-gold-500/20 disabled:opacity-50"
                                >
                                  {addingSchool === rec.name ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Plus className="h-3 w-3" />
                                  )}
                                  Add to My Schools
                                </button>
                              )}
                            </div>
                          ))}
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
