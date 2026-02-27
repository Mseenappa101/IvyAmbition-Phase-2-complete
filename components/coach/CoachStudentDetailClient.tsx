"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  LayoutDashboard,
  GraduationCap,
  FileEdit,
  Trophy,
  FolderOpen,
  CalendarCheck,
  MessageSquare,
} from "lucide-react";
import { Avatar, Tabs } from "@/components/ui";
import { fetchStudentDetail } from "@/lib/actions/coach";
import type { StudentDetailData } from "@/lib/actions/coach";
import { OverviewTab } from "./tabs/OverviewTab";
import { SchoolsTab } from "./tabs/SchoolsTab";
import { EssaysTab } from "./tabs/EssaysTab";
import { ActivitiesTab } from "./tabs/ActivitiesTab";
import { DocumentsTab } from "./tabs/DocumentsTab";
import { TasksTab } from "./tabs/TasksTab";
import { MessagesTab } from "./tabs/MessagesTab";

const tabs = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "schools", label: "Schools", icon: <GraduationCap className="h-4 w-4" /> },
  { id: "essays", label: "Essays", icon: <FileEdit className="h-4 w-4" /> },
  { id: "activities", label: "Activities", icon: <Trophy className="h-4 w-4" /> },
  { id: "documents", label: "Documents", icon: <FolderOpen className="h-4 w-4" /> },
  { id: "tasks", label: "Tasks", icon: <CalendarCheck className="h-4 w-4" /> },
  { id: "messages", label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
];

interface Props {
  studentId: string;
}

export function CoachStudentDetailClient({ studentId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<StudentDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function load() {
      const { data, error: fetchError } = await fetchStudentDetail(studentId);
      if (fetchError) {
        setError(fetchError);
      } else {
        setDetail(data);
      }
      setLoading(false);
    }
    load();
  }, [studentId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-32 animate-pulse rounded bg-navy-800/60" />
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-full bg-navy-800/60" />
          <div className="space-y-2">
            <div className="h-7 w-48 animate-pulse rounded bg-navy-800/60" />
            <div className="h-4 w-36 animate-pulse rounded bg-navy-800/40" />
          </div>
        </div>
        <div className="h-10 animate-pulse rounded bg-navy-800/40" />
        <div className="h-64 animate-pulse rounded-2xl border border-navy-700/50 bg-navy-900/80" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push("/coach/students")}
          className="flex items-center gap-2 font-sans text-body-sm text-ivory-600 transition-colors hover:text-ivory-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </button>
        <div className="flex items-center justify-center rounded-2xl border border-navy-700/50 bg-navy-900/80 py-20">
          <p className="font-sans text-body text-burgundy-500">
            {error ?? "Student not found"}
          </p>
        </div>
      </div>
    );
  }

  const { profile, studentProfile } = detail;
  const fullName = `${profile.firstName} ${profile.lastName}`;

  const statusColors: Record<string, string> = {
    active: "bg-emerald-500/15 text-emerald-400",
    onboarding: "bg-gold-500/15 text-gold-400",
    paused: "bg-ivory-700/15 text-ivory-500",
    completed: "bg-blue-500/15 text-blue-400",
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <button
        onClick={() => router.push("/coach/students")}
        className="flex items-center gap-2 font-sans text-body-sm text-ivory-600 transition-colors hover:text-ivory-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Students
      </button>

      {/* Student Header */}
      <div className="flex items-center gap-4">
        <Avatar name={fullName} src={profile.avatarUrl} size="xl" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-display text-ivory-200">
              {fullName}
            </h1>
            <span
              className={`rounded-full px-3 py-1 font-sans text-caption font-medium ${
                statusColors[studentProfile.status] ?? statusColors.active
              }`}
            >
              {studentProfile.status.charAt(0).toUpperCase() +
                studentProfile.status.slice(1)}
            </span>
          </div>
          <p className="mt-0.5 font-sans text-body-sm text-ivory-600">
            {studentProfile.applicationType.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}{" "}
            &middot; {studentProfile.targetCycle}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab}>
        {activeTab === "overview" && (
          <OverviewTab detail={detail} onTabChange={setActiveTab} />
        )}
        {activeTab === "schools" && <SchoolsTab studentId={studentId} />}
        {activeTab === "essays" && <EssaysTab studentId={studentId} />}
        {activeTab === "activities" && <ActivitiesTab studentId={studentId} />}
        {activeTab === "documents" && <DocumentsTab studentId={studentId} />}
        {activeTab === "tasks" && (
          <TasksTab studentId={studentId} userId={studentProfile.userId} />
        )}
        {activeTab === "messages" && <MessagesTab studentId={studentId} />}
      </Tabs>
    </div>
  );
}
