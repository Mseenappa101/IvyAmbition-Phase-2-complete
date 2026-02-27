"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/actions/notifications";
import type { StudentStatus } from "@/types/database";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AdminMetrics {
  totalStudents: number;
  totalCoaches: number;
  unassignedStudents: number;
  activeApplications: number;
  revenue: string;
}

export interface SignupMonth {
  month: string;
  count: number;
}

export interface AppTypeCount {
  type: string;
  count: number;
}

export interface AdminStudent {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  applicationType: string;
  targetCycle: string;
  status: string;
  assignedCoachId: string | null;
  coachName: string | null;
  schoolCount: number;
  essayCount: number;
  signupDate: string;
  currentGpa: number | null;
  satScore: number | null;
  actScore: number | null;
  lsatScore: number | null;
  intendedMajor: string | null;
}

export interface AdminCoach {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  specializations: string[];
  maxStudents: number;
  activeStudentCount: number;
  utilization: number;
  createdAt: string;
}

export interface UnassignedStudent {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  applicationType: string;
  signupDate: string;
}

export interface AvailableCoach {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  specializations: string[];
  maxStudents: number;
  activeStudentCount: number;
}

// ─── Helper: Verify admin role ──────────────────────────────────────────────

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { userId: null, error: "Not authenticated" };

  const admin = createServiceRoleClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin")
    return { userId: null, error: "Not authorized" };

  return { userId: user.id, error: null };
}

// ─── Fetch Admin Metrics ────────────────────────────────────────────────────

export async function fetchAdminMetrics(): Promise<{
  data: AdminMetrics | null;
  error: string | null;
}> {
  const { error: authError } = await verifyAdmin();
  if (authError) return { data: null, error: authError };

  const admin = createServiceRoleClient();

  const [studentsRes, coachesRes, unassignedRes, applicationsRes] =
    await Promise.all([
      admin.from("student_profiles").select("id", { count: "exact", head: true }),
      admin.from("coach_profiles").select("id", { count: "exact", head: true }),
      admin
        .from("student_profiles")
        .select("id", { count: "exact", head: true })
        .is("assigned_coach_id", null),
      admin
        .from("student_schools")
        .select("id", { count: "exact", head: true })
        .in("status", ["applying", "submitted"]),
    ]);

  return {
    data: {
      totalStudents: studentsRes.count ?? 0,
      totalCoaches: coachesRes.count ?? 0,
      unassignedStudents: unassignedRes.count ?? 0,
      activeApplications: applicationsRes.count ?? 0,
      revenue: "$0",
    },
    error: null,
  };
}

// ─── Fetch Signups By Month ─────────────────────────────────────────────────

export async function fetchSignupsByMonth(): Promise<{
  data: SignupMonth[];
  error: string | null;
}> {
  const { error: authError } = await verifyAdmin();
  if (authError) return { data: [], error: authError };

  const admin = createServiceRoleClient();

  // Get student profiles from last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data: profiles, error } = await admin
    .from("profiles")
    .select("created_at")
    .eq("role", "student")
    .gte("created_at", sixMonthsAgo.toISOString())
    .order("created_at", { ascending: true });

  if (error) return { data: [], error: error.message };

  // Group by month
  const monthMap = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    monthMap.set(key, 0);
  }

  (profiles ?? []).forEach((p) => {
    const d = new Date(p.created_at);
    const key = d.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    if (monthMap.has(key)) {
      monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
    }
  });

  return {
    data: Array.from(monthMap.entries()).map(([month, count]) => ({
      month,
      count,
    })),
    error: null,
  };
}

// ─── Fetch Applications By Type ─────────────────────────────────────────────

export async function fetchApplicationsByType(): Promise<{
  data: AppTypeCount[];
  error: string | null;
}> {
  const { error: authError } = await verifyAdmin();
  if (authError) return { data: [], error: authError };

  const admin = createServiceRoleClient();

  const { data, error } = await admin
    .from("student_profiles")
    .select("application_type");

  if (error) return { data: [], error: error.message };

  const countMap: Record<string, number> = {};
  (data ?? []).forEach((p) => {
    const t = p.application_type || "undergraduate";
    countMap[t] = (countMap[t] ?? 0) + 1;
  });

  return {
    data: Object.entries(countMap).map(([type, count]) => ({ type, count })),
    error: null,
  };
}

// ─── Fetch All Students ─────────────────────────────────────────────────────

export async function fetchAllStudents(): Promise<{
  data: AdminStudent[];
  error: string | null;
}> {
  const { error: authError } = await verifyAdmin();
  if (authError) return { data: [], error: authError };

  const admin = createServiceRoleClient();

  const { data: students, error } = await admin
    .from("student_profiles")
    .select(
      `
      id,
      user_id,
      application_type,
      target_cycle,
      status,
      assigned_coach_id,
      current_gpa,
      sat_score,
      act_score,
      lsat_score,
      intended_major,
      created_at,
      profiles!student_profiles_user_id_fkey(id, first_name, last_name, email, avatar_url)
    `
    )
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };

  // Fetch coach names for assigned students
  const coachIds = Array.from(
    new Set(
      (students ?? [])
        .map((s) => s.assigned_coach_id)
        .filter((id): id is string => id !== null)
    )
  );

  let coachMap: Record<string, string> = {};
  if (coachIds.length > 0) {
    const { data: coaches } = await admin
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", coachIds);

    (coaches ?? []).forEach((c) => {
      coachMap[c.id] = `${c.first_name} ${c.last_name}`;
    });
  }

  // Fetch school and essay counts
  const userIds = (students ?? []).map((s) => s.user_id);
  const studentProfileIds = (students ?? []).map((s) => s.id);

  const [schoolsRes, essaysRes] = await Promise.all([
    admin.from("student_schools").select("user_id").in("user_id", userIds),
    admin.from("essays").select("student_id").in("student_id", studentProfileIds),
  ]);

  const schoolCounts: Record<string, number> = {};
  (schoolsRes.data ?? []).forEach((s) => {
    schoolCounts[s.user_id] = (schoolCounts[s.user_id] ?? 0) + 1;
  });

  // Essays use student_id (FK to student_profiles.id), so map by profile ID
  const essayCountsByProfileId: Record<string, number> = {};
  (essaysRes.data ?? []).forEach((e) => {
    essayCountsByProfileId[e.student_id] = (essayCountsByProfileId[e.student_id] ?? 0) + 1;
  });

  const result: AdminStudent[] = (students ?? []).map((s) => {
    const profile = s.profiles as unknown as {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      avatar_url: string | null;
    };

    return {
      id: s.id,
      userId: s.user_id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email,
      avatarUrl: profile.avatar_url,
      applicationType: s.application_type,
      targetCycle: s.target_cycle,
      status: s.status,
      assignedCoachId: s.assigned_coach_id,
      coachName: s.assigned_coach_id ? coachMap[s.assigned_coach_id] ?? null : null,
      schoolCount: schoolCounts[s.user_id] ?? 0,
      essayCount: essayCountsByProfileId[s.id] ?? 0,
      signupDate: s.created_at,
      currentGpa: s.current_gpa,
      satScore: s.sat_score,
      actScore: s.act_score,
      lsatScore: s.lsat_score,
      intendedMajor: s.intended_major,
    };
  });

  return { data: result, error: null };
}

// ─── Fetch All Coaches ──────────────────────────────────────────────────────

export async function fetchAllCoaches(): Promise<{
  data: AdminCoach[];
  error: string | null;
}> {
  const { error: authError } = await verifyAdmin();
  if (authError) return { data: [], error: authError };

  const admin = createServiceRoleClient();

  const { data: coaches, error } = await admin
    .from("coach_profiles")
    .select(
      `
      id,
      user_id,
      bio,
      specializations,
      max_students,
      active_student_count,
      created_at,
      profiles!coach_profiles_user_id_fkey(id, first_name, last_name, email, avatar_url)
    `
    )
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };

  return {
    data: (coaches ?? []).map((c) => {
      const profile = c.profiles as unknown as {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        avatar_url: string | null;
      };

      return {
        id: c.id,
        userId: c.user_id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        avatarUrl: profile.avatar_url,
        bio: c.bio,
        specializations: c.specializations ?? [],
        maxStudents: c.max_students,
        activeStudentCount: c.active_student_count,
        utilization:
          c.max_students > 0
            ? Math.round((c.active_student_count / c.max_students) * 100)
            : 0,
        createdAt: c.created_at,
      };
    }),
    error: null,
  };
}

// ─── Fetch Coach's Students ─────────────────────────────────────────────────

export async function fetchCoachStudents(coachUserId: string): Promise<{
  data: { id: string; firstName: string; lastName: string; applicationType: string; status: string }[];
  error: string | null;
}> {
  const { error: authError } = await verifyAdmin();
  if (authError) return { data: [], error: authError };

  const admin = createServiceRoleClient();

  const { data, error } = await admin
    .from("student_profiles")
    .select(
      `
      id,
      application_type,
      status,
      profiles!student_profiles_user_id_fkey(first_name, last_name)
    `
    )
    .eq("assigned_coach_id", coachUserId);

  if (error) return { data: [], error: error.message };

  return {
    data: (data ?? []).map((s) => {
      const profile = s.profiles as unknown as {
        first_name: string;
        last_name: string;
      };
      return {
        id: s.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        applicationType: s.application_type,
        status: s.status,
      };
    }),
    error: null,
  };
}

// ─── Fetch Unassigned Students ──────────────────────────────────────────────

export async function fetchUnassignedStudents(): Promise<{
  data: UnassignedStudent[];
  error: string | null;
}> {
  const { error: authError } = await verifyAdmin();
  if (authError) return { data: [], error: authError };

  const admin = createServiceRoleClient();

  const { data, error } = await admin
    .from("student_profiles")
    .select(
      `
      id,
      user_id,
      application_type,
      created_at,
      profiles!student_profiles_user_id_fkey(first_name, last_name, email, avatar_url)
    `
    )
    .is("assigned_coach_id", null)
    .order("created_at", { ascending: true });

  if (error) return { data: [], error: error.message };

  return {
    data: (data ?? []).map((s) => {
      const profile = s.profiles as unknown as {
        first_name: string;
        last_name: string;
        email: string;
        avatar_url: string | null;
      };
      return {
        id: s.id,
        userId: s.user_id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        avatarUrl: profile.avatar_url,
        applicationType: s.application_type,
        signupDate: s.created_at,
      };
    }),
    error: null,
  };
}

// ─── Fetch Available Coaches ────────────────────────────────────────────────

export async function fetchAvailableCoaches(): Promise<{
  data: AvailableCoach[];
  error: string | null;
}> {
  const { error: authError } = await verifyAdmin();
  if (authError) return { data: [], error: authError };

  const admin = createServiceRoleClient();

  const { data, error } = await admin
    .from("coach_profiles")
    .select(
      `
      id,
      user_id,
      specializations,
      max_students,
      active_student_count,
      profiles!coach_profiles_user_id_fkey(first_name, last_name, email, avatar_url)
    `
    )
    .order("active_student_count", { ascending: true });

  if (error) return { data: [], error: error.message };

  return {
    data: (data ?? []).map((c) => {
      const profile = c.profiles as unknown as {
        first_name: string;
        last_name: string;
        email: string;
        avatar_url: string | null;
      };
      return {
        id: c.id,
        userId: c.user_id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        avatarUrl: profile.avatar_url,
        specializations: c.specializations ?? [],
        maxStudents: c.max_students,
        activeStudentCount: c.active_student_count,
      };
    }),
    error: null,
  };
}

// ─── Assign Coach to Student ────────────────────────────────────────────────

export async function assignCoachToStudent(
  studentProfileId: string,
  coachUserId: string
): Promise<{ success: boolean; error: string | null }> {
  const { error: authError } = await verifyAdmin();
  if (authError) return { success: false, error: authError };

  const admin = createServiceRoleClient();

  // 1. Update student's assigned coach
  const { error: updateError } = await admin
    .from("student_profiles")
    .update({ assigned_coach_id: coachUserId })
    .eq("id", studentProfileId);

  if (updateError) return { success: false, error: updateError.message };

  // 2. Increment coach's active student count
  const { data: coachProfile } = await admin
    .from("coach_profiles")
    .select("active_student_count")
    .eq("user_id", coachUserId)
    .single();

  if (coachProfile) {
    await admin
      .from("coach_profiles")
      .update({
        active_student_count: coachProfile.active_student_count + 1,
      })
      .eq("user_id", coachUserId);
  }

  // 3. Create conversation
  const { data: conversation, error: convError } = await admin
    .from("conversations")
    .insert({
      student_id: studentProfileId,
      coach_id: coachUserId,
    })
    .select()
    .single();

  if (convError) return { success: false, error: convError.message };

  // 4. Send system welcome message
  await admin.from("messages").insert({
    conversation_id: conversation.id,
    sender_id: coachUserId,
    content: "You've been matched with your IvyAmbition counselor!",
    message_type: "system",
  });

  // 5. Notification triggers — notify both student and coach
  try {
    // Get student's user_id and names
    const { data: sp } = await admin
      .from("student_profiles")
      .select("user_id, profiles!student_profiles_user_id_fkey(first_name, last_name)")
      .eq("id", studentProfileId)
      .single();

    const { data: coachProfile } = await admin
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", coachUserId)
      .single();

    if (sp?.user_id) {
      const coachName = coachProfile
        ? `${coachProfile.first_name} ${coachProfile.last_name}`
        : "your coach";
      await createNotification(
        sp.user_id,
        "assignment",
        "New coach assigned!",
        `You've been matched with ${coachName}. Say hello in Messages!`,
        "/student/messages"
      );
    }

    if (coachProfile) {
      const studentProfile = sp?.profiles as unknown as {
        first_name: string;
        last_name: string;
      } | null;
      const studentName = studentProfile
        ? `${studentProfile.first_name} ${studentProfile.last_name}`
        : "a new student";
      await createNotification(
        coachUserId,
        "assignment",
        "New student assigned!",
        `${studentName} has been added to your roster.`,
        "/coach/students"
      );
    }
  } catch {
    // Notification failure should not block assignment
  }

  return { success: true, error: null };
}

// ─── Bulk Assign Coach ──────────────────────────────────────────────────────

export async function bulkAssignCoach(
  studentProfileIds: string[],
  coachUserId: string
): Promise<{ success: boolean; error: string | null }> {
  for (const id of studentProfileIds) {
    const result = await assignCoachToStudent(id, coachUserId);
    if (!result.success) return result;
  }
  return { success: true, error: null };
}

// ─── Update Student Status ──────────────────────────────────────────────────

export async function updateStudentStatus(
  studentProfileId: string,
  status: StudentStatus
): Promise<{ success: boolean; error: string | null }> {
  const { error: authError } = await verifyAdmin();
  if (authError) return { success: false, error: authError };

  const admin = createServiceRoleClient();

  const { error } = await admin
    .from("student_profiles")
    .update({ status })
    .eq("id", studentProfileId);

  if (error) return { success: false, error: error.message };
  return { success: true, error: null };
}

// ─── Export Students CSV ────────────────────────────────────────────────────

export async function exportStudentsCSV(): Promise<{
  data: string | null;
  error: string | null;
}> {
  const { data: students, error } = await fetchAllStudents();
  if (error) return { data: null, error };

  const headers = [
    "Name",
    "Email",
    "Application Type",
    "Status",
    "Coach",
    "Schools",
    "Essays",
    "GPA",
    "SAT",
    "ACT",
    "LSAT",
    "Intended Major",
    "Signup Date",
  ];

  const rows = students.map((s) => [
    `${s.firstName} ${s.lastName}`,
    s.email,
    s.applicationType,
    s.status,
    s.coachName ?? "Unassigned",
    s.schoolCount.toString(),
    s.essayCount.toString(),
    s.currentGpa?.toString() ?? "",
    s.satScore?.toString() ?? "",
    s.actScore?.toString() ?? "",
    s.lsatScore?.toString() ?? "",
    s.intendedMajor ?? "",
    new Date(s.signupDate).toLocaleDateString(),
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  return { data: csv, error: null };
}
