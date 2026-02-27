"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface StudentDashboardData {
  firstName: string;
  schoolCount: number;
  essayStats: { total: number; drafted: number };
  taskStats: { total: number; completed: number };
  upcomingDeadlines: {
    id: string;
    schoolName: string;
    deadline: string;
    status: string;
    daysLeft: number;
  }[];
  coachName: string | null;
}

// ─── Fetch Student Dashboard ──────────────────────────────────────────────

export async function fetchStudentDashboard(): Promise<{
  data: StudentDashboardData | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const admin = createServiceRoleClient();

  // Get profile + student profile
  const [profileRes, spRes] = await Promise.all([
    admin
      .from("profiles")
      .select("first_name")
      .eq("id", user.id)
      .single(),
    admin
      .from("student_profiles")
      .select("id, assigned_coach_id")
      .eq("user_id", user.id)
      .single(),
  ]);

  if (!profileRes.data || !spRes.data) {
    return { data: null, error: "Profile not found" };
  }

  const firstName = profileRes.data.first_name;
  const studentProfileId = spRes.data.id;
  const assignedCoachId = spRes.data.assigned_coach_id;

  // Parallel queries for dashboard data
  const now = new Date().toISOString();

  const [schoolsRes, essaysRes, tasksRes, deadlinesRes, coachRes] =
    await Promise.all([
      // School count
      admin
        .from("student_schools")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),

      // Essay stats
      admin
        .from("essays")
        .select("id, status")
        .eq("student_id", studentProfileId),

      // Task stats
      admin
        .from("tasks")
        .select("id, status")
        .eq("student_id", studentProfileId),

      // Upcoming deadlines (schools with a future deadline, sorted)
      admin
        .from("student_schools")
        .select("id, school_name, deadline, status")
        .eq("user_id", user.id)
        .not("deadline", "is", null)
        .gte("deadline", now.slice(0, 10))
        .order("deadline", { ascending: true })
        .limit(5),

      // Coach name
      assignedCoachId
        ? admin
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", assignedCoachId)
            .single()
        : Promise.resolve({ data: null }),
    ]);

  // Essay stats
  const essays = essaysRes.data ?? [];
  const draftedStatuses = ["draft", "coach_review", "revised", "final"];
  const draftedCount = essays.filter((e) =>
    draftedStatuses.includes(e.status)
  ).length;

  // Task stats
  const tasks = tasksRes.data ?? [];
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  // Deadlines with daysLeft
  const upcomingDeadlines = (deadlinesRes.data ?? []).map((d) => {
    const deadlineDate = new Date(d.deadline!);
    const daysLeft = Math.max(
      0,
      Math.ceil(
        (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    );
    return {
      id: d.id,
      schoolName: d.school_name,
      deadline: d.deadline!,
      status: d.status,
      daysLeft,
    };
  });

  // Coach name
  const coachData = coachRes.data as {
    first_name: string;
    last_name: string;
  } | null;
  const coachName = coachData
    ? `${coachData.first_name} ${coachData.last_name}`
    : null;

  return {
    data: {
      firstName,
      schoolCount: schoolsRes.count ?? 0,
      essayStats: { total: essays.length, drafted: draftedCount },
      taskStats: { total: tasks.length, completed: completedCount },
      upcomingDeadlines,
      coachName,
    },
    error: null,
  };
}
