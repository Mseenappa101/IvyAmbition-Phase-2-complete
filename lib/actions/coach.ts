"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { fetchUnreadCount } from "@/lib/actions/messages";
import { createNotification } from "@/lib/actions/notifications";
import type { EssayStatus, DocumentCategory, TaskPriority } from "@/types/database";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CoachMetrics {
  activeStudents: number;
  essaysAwaitingReview: number;
  upcomingDeadlines: number;
  unreadMessages: number;
}

export interface AttentionStudent {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  reason: string;
  urgency: "high" | "medium" | "low";
}

export interface ActivityFeedItem {
  id: string;
  type: "essay" | "task" | "document";
  studentName: string;
  description: string;
  timestamp: string;
}

export interface RosterStudent {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  applicationType: string;
  targetCycle: string;
  status: string;
  schoolCount: number;
  essayCount: number;
  taskCompletionPct: number;
}

// ─── Helper: Get authenticated coach ID ─────────────────────────────────────

async function getAuthCoachId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { userId: null, error: "Not authenticated" };
  return { userId: user.id, error: null };
}

// ─── Fetch Coach Dashboard ──────────────────────────────────────────────────

export async function fetchCoachDashboard(): Promise<{
  data: {
    metrics: CoachMetrics;
    attentionStudents: AttentionStudent[];
    recentActivity: ActivityFeedItem[];
  } | null;
  error: string | null;
}> {
  const { userId, error: authError } = await getAuthCoachId();
  if (authError || !userId) return { data: null, error: authError };

  const admin = createServiceRoleClient();

  // Get all assigned student profile IDs
  const { data: studentProfiles, error: spError } = await admin
    .from("student_profiles")
    .select("id, user_id, status, profiles(id, first_name, last_name, avatar_url)")
    .eq("assigned_coach_id", userId);

  if (spError) return { data: null, error: spError.message };

  const students = studentProfiles ?? [];
  const studentIds = students.map((s) => s.id);
  const activeCount = students.filter((s) => s.status === "active").length;

  // ── Metrics (parallel queries) ──
  const now = new Date().toISOString();
  const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const [essayResult, taskResult, unreadResult] = await Promise.all([
    // Essays awaiting review
    studentIds.length > 0
      ? admin
          .from("essays")
          .select("id", { count: "exact", head: true })
          .in("student_id", studentIds)
          .eq("status", "coach_review")
      : Promise.resolve({ count: 0 }),

    // Upcoming deadlines (tasks due within 7 days, not completed)
    studentIds.length > 0
      ? admin
          .from("tasks")
          .select("id", { count: "exact", head: true })
          .in("student_id", studentIds)
          .neq("status", "completed")
          .gte("due_date", now)
          .lte("due_date", weekFromNow)
      : Promise.resolve({ count: 0 }),

    // Unread messages
    fetchUnreadCount(),
  ]);

  const metrics: CoachMetrics = {
    activeStudents: activeCount,
    essaysAwaitingReview: essayResult.count ?? 0,
    upcomingDeadlines: taskResult.count ?? 0,
    unreadMessages: unreadResult.data ?? 0,
  };

  // ── Attention Students ──
  const attentionStudents: AttentionStudent[] = [];

  if (studentIds.length > 0) {
    // Fetch essays awaiting review per student
    const { data: reviewEssays } = await admin
      .from("essays")
      .select("student_id")
      .in("student_id", studentIds)
      .eq("status", "coach_review");

    // Fetch overdue tasks per student
    const { data: overdueTasks } = await admin
      .from("tasks")
      .select("student_id")
      .in("student_id", studentIds)
      .neq("status", "completed")
      .lt("due_date", now);

    // Count per student
    const reviewCounts: Record<string, number> = {};
    (reviewEssays ?? []).forEach((e) => {
      reviewCounts[e.student_id] = (reviewCounts[e.student_id] ?? 0) + 1;
    });

    const overdueCounts: Record<string, number> = {};
    (overdueTasks ?? []).forEach((t) => {
      overdueCounts[t.student_id] = (overdueCounts[t.student_id] ?? 0) + 1;
    });

    for (const student of students) {
      const reviewCount = reviewCounts[student.id] ?? 0;
      const overdueCount = overdueCounts[student.id] ?? 0;

      if (reviewCount === 0 && overdueCount === 0) continue;

      const profile = student.profiles as unknown as {
        id: string;
        first_name: string;
        last_name: string;
        avatar_url: string | null;
      };

      const reasons: string[] = [];
      if (overdueCount > 0)
        reasons.push(`${overdueCount} overdue task${overdueCount > 1 ? "s" : ""}`);
      if (reviewCount > 0)
        reasons.push(`${reviewCount} essay${reviewCount > 1 ? "s" : ""} awaiting review`);

      attentionStudents.push({
        id: student.id,
        userId: student.user_id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        avatarUrl: profile.avatar_url,
        reason: reasons.join(", "),
        urgency: overdueCount > 0 ? "high" : "medium",
      });
    }

    // Sort: high urgency first
    attentionStudents.sort((a, b) => {
      if (a.urgency === "high" && b.urgency !== "high") return -1;
      if (a.urgency !== "high" && b.urgency === "high") return 1;
      return 0;
    });

    // Limit to 5
    attentionStudents.splice(5);
  }

  // ── Recent Activity ──
  const recentActivity: ActivityFeedItem[] = [];

  if (studentIds.length > 0) {
    // Build student name map
    const nameMap: Record<string, string> = {};
    for (const student of students) {
      const profile = student.profiles as unknown as {
        first_name: string;
        last_name: string;
      };
      nameMap[student.id] = `${profile.first_name} ${profile.last_name}`;
    }

    const [essaysData, tasksData, docsData] = await Promise.all([
      admin
        .from("essays")
        .select("id, student_id, title, updated_at")
        .in("student_id", studentIds)
        .order("updated_at", { ascending: false })
        .limit(10),

      admin
        .from("tasks")
        .select("id, student_id, title, updated_at")
        .in("student_id", studentIds)
        .order("updated_at", { ascending: false })
        .limit(10),

      admin
        .from("documents")
        .select("id, student_id, file_name, created_at")
        .in("student_id", studentIds)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    for (const essay of essaysData.data ?? []) {
      recentActivity.push({
        id: `essay-${essay.id}`,
        type: "essay",
        studentName: nameMap[essay.student_id] ?? "Student",
        description: `Updated essay "${essay.title}"`,
        timestamp: essay.updated_at,
      });
    }

    for (const task of tasksData.data ?? []) {
      recentActivity.push({
        id: `task-${task.id}`,
        type: "task",
        studentName: nameMap[task.student_id] ?? "Student",
        description: `Updated task "${task.title}"`,
        timestamp: task.updated_at,
      });
    }

    for (const doc of docsData.data ?? []) {
      recentActivity.push({
        id: `doc-${doc.id}`,
        type: "document",
        studentName: nameMap[doc.student_id] ?? "Student",
        description: `Uploaded "${doc.file_name}"`,
        timestamp: doc.created_at,
      });
    }

    // Sort by timestamp descending, limit 10
    recentActivity.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    recentActivity.splice(10);
  }

  return {
    data: { metrics, attentionStudents, recentActivity },
    error: null,
  };
}

// ─── Fetch Student Roster ───────────────────────────────────────────────────

export async function fetchStudentRoster(): Promise<{
  data: RosterStudent[] | null;
  error: string | null;
}> {
  const { userId, error: authError } = await getAuthCoachId();
  if (authError || !userId) return { data: null, error: authError };

  const admin = createServiceRoleClient();

  // Get all assigned students with profiles
  const { data: studentProfiles, error: spError } = await admin
    .from("student_profiles")
    .select("id, user_id, application_type, target_cycle, status, profiles(id, first_name, last_name, avatar_url)")
    .eq("assigned_coach_id", userId);

  if (spError) return { data: null, error: spError.message };

  const students = studentProfiles ?? [];
  if (students.length === 0) return { data: [], error: null };

  const studentIds = students.map((s) => s.id);
  const userIds = students.map((s) => s.user_id);

  // Parallel queries for aggregated stats
  const [schoolsData, essaysData, tasksData] = await Promise.all([
    // School counts per user_id (student_schools uses user_id, not student_id)
    admin
      .from("student_schools")
      .select("user_id")
      .in("user_id", userIds),

    // Essay counts per student_id
    admin
      .from("essays")
      .select("student_id")
      .in("student_id", studentIds),

    // Tasks per student_id (need completed + total for %)
    admin
      .from("tasks")
      .select("student_id, status")
      .in("student_id", studentIds),
  ]);

  // Aggregate counts
  const schoolCounts: Record<string, number> = {};
  (schoolsData.data ?? []).forEach((s) => {
    schoolCounts[s.user_id] = (schoolCounts[s.user_id] ?? 0) + 1;
  });

  const essayCounts: Record<string, number> = {};
  (essaysData.data ?? []).forEach((e) => {
    essayCounts[e.student_id] = (essayCounts[e.student_id] ?? 0) + 1;
  });

  const taskStats: Record<string, { total: number; completed: number }> = {};
  (tasksData.data ?? []).forEach((t) => {
    if (!taskStats[t.student_id]) {
      taskStats[t.student_id] = { total: 0, completed: 0 };
    }
    taskStats[t.student_id].total++;
    if (t.status === "completed") taskStats[t.student_id].completed++;
  });

  const roster: RosterStudent[] = students.map((student) => {
    const profile = student.profiles as unknown as {
      id: string;
      first_name: string;
      last_name: string;
      avatar_url: string | null;
    };

    const ts = taskStats[student.id];
    const taskPct = ts && ts.total > 0 ? Math.round((ts.completed / ts.total) * 100) : 0;

    return {
      id: student.id,
      userId: student.user_id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      avatarUrl: profile.avatar_url,
      applicationType: student.application_type,
      targetCycle: student.target_cycle,
      status: student.status,
      schoolCount: schoolCounts[student.user_id] ?? 0,
      essayCount: essayCounts[student.id] ?? 0,
      taskCompletionPct: taskPct,
    };
  });

  return { data: roster, error: null };
}

// ─── Types for Student Detail ───────────────────────────────────────────────

export interface StudentDetailData {
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    email: string;
  };
  studentProfile: {
    id: string;
    userId: string;
    applicationType: string;
    targetCycle: string;
    status: string;
    currentSchool: string | null;
    currentGpa: number | null;
    satScore: number | null;
    actScore: number | null;
    lsatScore: number | null;
    intendedMajor: string | null;
  };
  schoolSummary: {
    id: string;
    schoolName: string;
    status: string;
    deadline: string | null;
  }[];
  essayStats: { total: number; byStatus: Record<string, number> };
  taskStats: { total: number; completed: number; overdue: number };
  recentActivity: ActivityFeedItem[];
}

// ─── Helper: Verify coach has access to student ─────────────────────────────

async function verifyCoachStudent(
  coachUserId: string,
  studentProfileId: string
) {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("student_profiles")
    .select("id, user_id")
    .eq("id", studentProfileId)
    .eq("assigned_coach_id", coachUserId)
    .single();

  if (error || !data) return { studentProfile: null, error: "Access denied" };
  return { studentProfile: data as { id: string; user_id: string }, error: null };
}

// ─── Fetch Student Detail (Overview) ────────────────────────────────────────

export async function fetchStudentDetail(
  studentProfileId: string
): Promise<{ data: StudentDetailData | null; error: string | null }> {
  const { userId, error: authError } = await getAuthCoachId();
  if (authError || !userId) return { data: null, error: authError };

  const { studentProfile: sp, error: accessError } = await verifyCoachStudent(
    userId,
    studentProfileId
  );
  if (accessError || !sp) return { data: null, error: accessError };

  const admin = createServiceRoleClient();

  // Parallel queries
  const [profileRes, spRes, schoolsRes, essaysRes, tasksRes] =
    await Promise.all([
      admin
        .from("profiles")
        .select("id, first_name, last_name, avatar_url, email")
        .eq("id", sp.user_id)
        .single(),

      admin
        .from("student_profiles")
        .select(
          "id, user_id, application_type, target_cycle, status, current_school, current_gpa, sat_score, act_score, lsat_score, intended_major"
        )
        .eq("id", studentProfileId)
        .single(),

      admin
        .from("student_schools")
        .select("id, school_name, status, deadline")
        .eq("user_id", sp.user_id)
        .order("created_at", { ascending: false }),

      admin
        .from("essays")
        .select("id, status")
        .eq("student_id", studentProfileId),

      admin
        .from("tasks")
        .select("id, status, due_date")
        .eq("student_id", studentProfileId),
    ]);

  if (profileRes.error || !profileRes.data)
    return { data: null, error: "Student profile not found" };
  if (spRes.error || !spRes.data)
    return { data: null, error: "Student profile not found" };

  const p = profileRes.data;
  const s = spRes.data;

  // Essay stats by status
  const byStatus: Record<string, number> = {};
  (essaysRes.data ?? []).forEach((e) => {
    byStatus[e.status] = (byStatus[e.status] ?? 0) + 1;
  });

  // Task stats
  const now = new Date().toISOString();
  const allTasks = tasksRes.data ?? [];
  const taskCompleted = allTasks.filter((t) => t.status === "completed").length;
  const taskOverdue = allTasks.filter(
    (t) => t.status !== "completed" && t.due_date < now
  ).length;

  // Recent activity for this student
  const [essayActivity, taskActivity, docActivity] = await Promise.all([
    admin
      .from("essays")
      .select("id, title, updated_at")
      .eq("student_id", studentProfileId)
      .order("updated_at", { ascending: false })
      .limit(5),
    admin
      .from("tasks")
      .select("id, title, updated_at")
      .eq("student_id", studentProfileId)
      .order("updated_at", { ascending: false })
      .limit(5),
    admin
      .from("documents")
      .select("id, file_name, created_at")
      .eq("student_id", studentProfileId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const studentName = `${p.first_name} ${p.last_name}`;
  const activity: ActivityFeedItem[] = [];
  for (const e of essayActivity.data ?? []) {
    activity.push({
      id: `essay-${e.id}`,
      type: "essay",
      studentName,
      description: `Updated essay "${e.title}"`,
      timestamp: e.updated_at,
    });
  }
  for (const t of taskActivity.data ?? []) {
    activity.push({
      id: `task-${t.id}`,
      type: "task",
      studentName,
      description: `Updated task "${t.title}"`,
      timestamp: t.updated_at,
    });
  }
  for (const d of docActivity.data ?? []) {
    activity.push({
      id: `doc-${d.id}`,
      type: "document",
      studentName,
      description: `Uploaded "${d.file_name}"`,
      timestamp: d.created_at,
    });
  }
  activity.sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  activity.splice(5);

  return {
    data: {
      profile: {
        id: p.id,
        firstName: p.first_name,
        lastName: p.last_name,
        avatarUrl: p.avatar_url,
        email: p.email,
      },
      studentProfile: {
        id: s.id,
        userId: s.user_id,
        applicationType: s.application_type,
        targetCycle: s.target_cycle,
        status: s.status,
        currentSchool: s.current_school,
        currentGpa: s.current_gpa,
        satScore: s.sat_score,
        actScore: s.act_score,
        lsatScore: s.lsat_score,
        intendedMajor: s.intended_major,
      },
      schoolSummary: (schoolsRes.data ?? []).map((sc) => ({
        id: sc.id,
        schoolName: sc.school_name,
        status: sc.status,
        deadline: sc.deadline,
      })),
      essayStats: {
        total: (essaysRes.data ?? []).length,
        byStatus,
      },
      taskStats: {
        total: allTasks.length,
        completed: taskCompleted,
        overdue: taskOverdue,
      },
      recentActivity: activity,
    },
    error: null,
  };
}

// ─── Schools Tab ────────────────────────────────────────────────────────────

export async function fetchStudentSchoolsForCoach(studentProfileId: string) {
  const { userId, error: authError } = await getAuthCoachId();
  if (authError || !userId) return { data: null, error: authError };

  const { studentProfile: sp, error: accessError } = await verifyCoachStudent(
    userId,
    studentProfileId
  );
  if (accessError || !sp) return { data: null, error: accessError };

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("student_schools")
    .select("*, school_requirements(*)")
    .eq("user_id", sp.user_id)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}

export async function updateRequirementForCoach(
  requirementId: string,
  updates: { is_completed?: boolean; notes?: string }
) {
  const { userId, error: authError } = await getAuthCoachId();
  if (authError || !userId) return { error: authError };

  const admin = createServiceRoleClient();

  // Verify requirement belongs to coach's student
  const { data: req } = await admin
    .from("school_requirements")
    .select("student_school_id")
    .eq("id", requirementId)
    .single();

  if (!req) return { error: "Requirement not found" };

  const { data: school } = await admin
    .from("student_schools")
    .select("user_id")
    .eq("id", req.student_school_id)
    .single();

  if (!school) return { error: "School not found" };

  // Verify student belongs to this coach
  const { data: sp } = await admin
    .from("student_profiles")
    .select("id")
    .eq("user_id", school.user_id)
    .eq("assigned_coach_id", userId)
    .single();

  if (!sp) return { error: "Access denied" };

  const { error } = await admin
    .from("school_requirements")
    .update(updates)
    .eq("id", requirementId);

  if (error) return { error: error.message };
  return { error: null };
}

// ─── Essays Tab ─────────────────────────────────────────────────────────────

export async function fetchStudentEssaysForCoach(studentProfileId: string) {
  const { userId, error: authError } = await getAuthCoachId();
  if (authError || !userId) return { data: null, error: authError };

  const { error: accessError } = await verifyCoachStudent(userId, studentProfileId);
  if (accessError) return { data: null, error: accessError };

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("essays")
    .select("*, student_schools(school_name), essay_feedback(id, status)")
    .eq("student_id", studentProfileId)
    .order("updated_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}

export async function fetchEssayForCoach(
  essayId: string,
  studentProfileId: string
) {
  const { userId, error: authError } = await getAuthCoachId();
  if (authError || !userId) return { data: null, error: authError };

  const { error: accessError } = await verifyCoachStudent(userId, studentProfileId);
  if (accessError) return { data: null, error: accessError };

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("essays")
    .select(
      "*, student_schools(school_name), essay_versions(*), essay_feedback(*, profiles:coach_id(first_name, last_name))"
    )
    .eq("id", essayId)
    .eq("student_id", studentProfileId)
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function createEssayFeedback(params: {
  essayId: string;
  feedbackType: "general" | "inline";
  content: string;
  selectionStart?: number | null;
  selectionEnd?: number | null;
}) {
  const { userId, error: authError } = await getAuthCoachId();
  if (authError || !userId) return { data: null, error: authError };

  const admin = createServiceRoleClient();

  // Verify essay belongs to coach's student
  const { data: essay } = await admin
    .from("essays")
    .select("student_id")
    .eq("id", params.essayId)
    .single();

  if (!essay) return { data: null, error: "Essay not found" };

  const { error: accessError } = await verifyCoachStudent(
    userId,
    essay.student_id
  );
  if (accessError) return { data: null, error: accessError };

  const { data, error } = await admin
    .from("essay_feedback")
    .insert({
      essay_id: params.essayId,
      coach_id: userId,
      feedback_type: params.feedbackType,
      content: params.content,
      selection_start: params.selectionStart ?? null,
      selection_end: params.selectionEnd ?? null,
      status: "open",
    })
    .select("*")
    .single();

  if (error) return { data: null, error: error.message };

  // ── Notification trigger: notify student of coach feedback ──
  try {
    const admin2 = createServiceRoleClient();
    const { data: sp } = await admin2
      .from("student_profiles")
      .select("user_id")
      .eq("id", essay.student_id)
      .single();

    const { data: essayData } = await admin2
      .from("essays")
      .select("title")
      .eq("id", params.essayId)
      .single();

    if (sp?.user_id) {
      await createNotification(
        sp.user_id,
        "feedback",
        `Coach feedback on "${essayData?.title ?? "your essay"}"`,
        params.content.length > 100
          ? params.content.slice(0, 100) + "..."
          : params.content,
        `/student/essays/${params.essayId}`
      );
    }
  } catch {
    // Notification failure should not block feedback creation
  }

  return { data, error: null };
}

export async function updateEssayStatusForCoach(
  essayId: string,
  status: EssayStatus
) {
  const { userId, error: authError } = await getAuthCoachId();
  if (authError || !userId) return { error: authError };

  const admin = createServiceRoleClient();

  const { data: essay } = await admin
    .from("essays")
    .select("student_id")
    .eq("id", essayId)
    .single();

  if (!essay) return { error: "Essay not found" };

  const { error: accessError } = await verifyCoachStudent(
    userId,
    essay.student_id
  );
  if (accessError) return { error: accessError };

  const { error } = await admin
    .from("essays")
    .update({ status })
    .eq("id", essayId);

  if (error) return { error: error.message };
  return { error: null };
}

// ─── Activities Tab ─────────────────────────────────────────────────────────

export async function fetchStudentActivitiesForCoach(
  studentProfileId: string
) {
  const { userId, error: authError } = await getAuthCoachId();
  if (authError || !userId) return { data: null, error: authError };

  const { error: accessError } = await verifyCoachStudent(userId, studentProfileId);
  if (accessError) return { data: null, error: accessError };

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("activities")
    .select("*")
    .eq("student_id", studentProfileId)
    .order("ranking", { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}

export async function updateActivityFeedback(
  activityId: string,
  feedback: string
) {
  const { userId, error: authError } = await getAuthCoachId();
  if (authError || !userId) return { error: authError };

  const admin = createServiceRoleClient();

  const { data: activity } = await admin
    .from("activities")
    .select("student_id")
    .eq("id", activityId)
    .single();

  if (!activity) return { error: "Activity not found" };

  const { error: accessError } = await verifyCoachStudent(
    userId,
    activity.student_id
  );
  if (accessError) return { error: accessError };

  const { error } = await admin
    .from("activities")
    .update({ coach_feedback: feedback })
    .eq("id", activityId);

  if (error) return { error: error.message };
  return { error: null };
}

// ─── Documents Tab ──────────────────────────────────────────────────────────

export async function fetchStudentDocumentsForCoach(
  studentProfileId: string
) {
  const { userId, error: authError } = await getAuthCoachId();
  if (authError || !userId) return { data: null, error: authError };

  const { error: accessError } = await verifyCoachStudent(userId, studentProfileId);
  if (accessError) return { data: null, error: accessError };

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("documents")
    .select("*, profiles!uploaded_by(first_name, last_name)")
    .eq("student_id", studentProfileId)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}

export async function uploadDocumentForStudent(
  studentProfileId: string,
  formData: FormData
) {
  const { userId, error: authError } = await getAuthCoachId();
  if (authError || !userId) return { data: null, error: authError };

  const { error: accessError } = await verifyCoachStudent(userId, studentProfileId);
  if (accessError) return { data: null, error: accessError };

  const file = formData.get("file") as File | null;
  const category = ((formData.get("category") as string) || "other") as DocumentCategory;
  const notes = (formData.get("notes") as string) || null;

  if (!file) return { data: null, error: "No file provided" };

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) return { data: null, error: "File too large (max 10MB)" };

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
  ];
  if (!allowedTypes.includes(file.type))
    return { data: null, error: "Invalid file type" };

  const admin = createServiceRoleClient();
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${studentProfileId}/${crypto.randomUUID()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await admin.storage
    .from("student-documents")
    .upload(path, buffer, { contentType: file.type });

  if (uploadError) return { data: null, error: uploadError.message };

  const {
    data: { publicUrl },
  } = admin.storage.from("student-documents").getPublicUrl(path);

  const { data, error } = await admin
    .from("documents")
    .insert({
      student_id: studentProfileId,
      file_name: file.name,
      file_type: file.type,
      file_url: publicUrl,
      file_size: file.size,
      category,
      uploaded_by: userId,
      notes,
    })
    .select("*, profiles!uploaded_by(first_name, last_name)")
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function updateDocumentNotesForCoach(
  documentId: string,
  notes: string
) {
  const { userId, error: authError } = await getAuthCoachId();
  if (authError || !userId) return { error: authError };

  const admin = createServiceRoleClient();

  const { data: doc } = await admin
    .from("documents")
    .select("student_id")
    .eq("id", documentId)
    .single();

  if (!doc) return { error: "Document not found" };

  const { error: accessError } = await verifyCoachStudent(
    userId,
    doc.student_id
  );
  if (accessError) return { error: accessError };

  const { error } = await admin
    .from("documents")
    .update({ notes })
    .eq("id", documentId);

  if (error) return { error: error.message };
  return { error: null };
}

// ─── Tasks Tab ──────────────────────────────────────────────────────────────

export async function fetchStudentTasksForCoach(studentProfileId: string) {
  const { userId, error: authError } = await getAuthCoachId();
  if (authError || !userId) return { data: null, error: authError };

  const { error: accessError } = await verifyCoachStudent(userId, studentProfileId);
  if (accessError) return { data: null, error: accessError };

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("tasks")
    .select("*, student_schools(school_name)")
    .eq("student_id", studentProfileId)
    .order("due_date", { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}

export async function createTaskForStudent(
  studentProfileId: string,
  payload: {
    title: string;
    description?: string;
    dueDate: string;
    priority: TaskPriority;
    studentSchoolId?: string;
  }
) {
  const { userId, error: authError } = await getAuthCoachId();
  if (authError || !userId) return { data: null, error: authError };

  const { error: accessError } = await verifyCoachStudent(userId, studentProfileId);
  if (accessError) return { data: null, error: accessError };

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("tasks")
    .insert({
      student_id: studentProfileId,
      title: payload.title,
      description: payload.description ?? null,
      due_date: payload.dueDate,
      priority: payload.priority,
      student_school_id: payload.studentSchoolId ?? null,
      created_by: userId,
    })
    .select("*, student_schools(school_name)")
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function fetchStudentSchoolsForTaskForm(
  studentProfileId: string
) {
  const { userId, error: authError } = await getAuthCoachId();
  if (authError || !userId) return { data: null, error: authError };

  const { studentProfile: sp, error: accessError } = await verifyCoachStudent(
    userId,
    studentProfileId
  );
  if (accessError || !sp) return { data: null, error: accessError };

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("student_schools")
    .select("id, school_name")
    .eq("user_id", sp.user_id)
    .order("school_name");

  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}

// ─── Messages Tab ───────────────────────────────────────────────────────────

export async function getOrCreateConversationForCoach(
  studentProfileId: string
) {
  const { userId, error: authError } = await getAuthCoachId();
  if (authError || !userId) return { data: null, error: authError };

  const { studentProfile: sp, error: accessError } = await verifyCoachStudent(
    userId,
    studentProfileId
  );
  if (accessError || !sp) return { data: null, error: accessError };

  const admin = createServiceRoleClient();

  // Check existing conversation
  const { data: existing } = await admin
    .from("conversations")
    .select("id")
    .eq("student_id", studentProfileId)
    .eq("coach_id", userId)
    .single();

  let conversationId: string;

  if (existing) {
    conversationId = existing.id;
  } else {
    const { data: created, error: createError } = await admin
      .from("conversations")
      .insert({ student_id: studentProfileId, coach_id: userId })
      .select("id")
      .single();

    if (createError || !created) return { data: null, error: createError?.message ?? "Failed to create conversation" };
    conversationId = created.id;
  }

  // Get student profile info for display
  const { data: profile } = await admin
    .from("profiles")
    .select("id, first_name, last_name, avatar_url")
    .eq("id", sp.user_id)
    .single();

  return {
    data: {
      conversationId,
      otherUser: profile ?? { id: sp.user_id, first_name: "Student", last_name: "", avatar_url: null },
    },
    error: null,
  };
}
