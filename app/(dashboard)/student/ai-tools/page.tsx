"use client";

import Link from "next/link";
import {
  Sparkles,
  Lightbulb,
  FileSearch,
  PenLine,
  MessageCircle,
  GraduationCap,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const tools = [
  {
    name: "Essay Brainstormer",
    description:
      "Discover compelling, authentic essay topics through guided conversation with an AI admissions expert.",
    icon: Lightbulb,
    href: "/student/ai-tools/brainstorm",
    active: true,
  },
  {
    name: "Essay Reviewer",
    description:
      "Get detailed feedback on your essay drafts — structure, tone, admissions impact, and line-level suggestions.",
    icon: FileSearch,
    href: "/student/ai-tools/essay-review",
    active: true,
  },
  {
    name: "Activity Optimizer",
    description:
      "Transform your extracurricular activities into powerful, concise descriptions that fit the 150-character Common App limit.",
    icon: PenLine,
    href: "/student/ai-tools/activity-optimizer",
    active: true,
  },
  {
    name: "School List Builder",
    description:
      "Get personalized reach, target, and safety school recommendations based on your profile and preferences.",
    icon: GraduationCap,
    href: "/student/ai-tools/school-list",
    active: true,
  },
  {
    name: "Interview Prep",
    description:
      "Practice answering common admissions interview questions with real-time AI coaching and feedback.",
    icon: MessageCircle,
    href: "/student/ai-tools/interview-prep",
    active: true,
  },
  {
    name: "Why This School",
    description:
      "Generate a structured outline for your \"Why Us\" supplemental essay through guided discovery questions.",
    icon: BookOpen,
    href: "/student/ai-tools/why-school",
    active: true,
  },
];

export default function AIToolsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10">
            <Sparkles className="h-5 w-5 text-gold-400" />
          </div>
          <div>
            <h1 className="font-serif text-heading-lg text-ivory-200">
              AI Tools
            </h1>
            <p className="font-sans text-body-sm text-ivory-600">
              AI-powered tools to strengthen your college application
            </p>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const Wrapper = tool.active ? Link : "div";

          return (
            <Wrapper
              key={tool.name}
              href={tool.active ? tool.href : "#"}
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-6 transition-all",
                tool.active
                  ? "border-navy-700/30 bg-navy-900/60 hover:border-gold-500/30 hover:bg-navy-900/80"
                  : "cursor-default border-navy-700/20 bg-navy-900/30 opacity-60"
              )}
            >
              <div className="flex items-start justify-between">
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl",
                    tool.active ? "bg-gold-500/10" : "bg-navy-800/60"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      tool.active ? "text-gold-400" : "text-ivory-700"
                    )}
                  />
                </div>
                {!tool.active && (
                  <span className="rounded-full bg-navy-800/80 px-2.5 py-1 font-sans text-[0.625rem] font-medium uppercase tracking-wider text-ivory-600">
                    Coming Soon
                  </span>
                )}
                {tool.active && (
                  <ArrowRight className="h-4 w-4 text-ivory-700 transition-transform group-hover:translate-x-1 group-hover:text-gold-400" />
                )}
              </div>

              <h3
                className={cn(
                  "mt-4 font-serif text-heading-sm",
                  tool.active ? "text-ivory-200" : "text-ivory-500"
                )}
              >
                {tool.name}
              </h3>
              <p
                className={cn(
                  "mt-1.5 font-sans text-body-sm leading-relaxed",
                  tool.active ? "text-ivory-600" : "text-ivory-700"
                )}
              >
                {tool.description}
              </p>
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}
