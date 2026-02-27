"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/actions/notifications";
import type { EssayStatus } from "@/types/database";

// ─── Helper: Get student profile ID from auth ──────────────────────────────

async function getStudentProfileId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { profileId: null, error: "Not authenticated" };

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (error || !data) return { profileId: null, error: "Student profile not found" };
  return { profileId: data.id as string, error: null };
}

// ─── Fetch all essays for the current student ──────────────────────────────

export async function fetchStudentEssays() {
  const { profileId, error: authError } = await getStudentProfileId();
  if (authError || !profileId) return { data: null, error: authError };

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("essays")
    .select("*, student_schools(school_name), essay_feedback(id, status)")
    .eq("student_id", profileId)
    .order("updated_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ─── Fetch single essay with all relations ─────────────────────────────────

export async function fetchEssay(essayId: string) {
  const { profileId, error: authError } = await getStudentProfileId();
  if (authError || !profileId) return { data: null, error: authError };

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("essays")
    .select(
      "*, student_schools(school_name), essay_versions(*), essay_feedback(*)"
    )
    .eq("id", essayId)
    .eq("student_id", profileId)
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ─── Create a new essay ────────────────────────────────────────────────────

interface CreateEssayPayload {
  title: string;
  prompt: string;
  studentSchoolId: string | null;
}

export async function createEssay(payload: CreateEssayPayload) {
  const { profileId, error: authError } = await getStudentProfileId();
  if (authError || !profileId) return { data: null, error: authError };

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("essays")
    .insert({
      student_id: profileId,
      student_school_id: payload.studentSchoolId,
      title: payload.title,
      prompt: payload.prompt,
    })
    .select("*, student_schools(school_name), essay_feedback(id, status)")
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ─── Save essay content (auto-save) ────────────────────────────────────────

export async function saveEssayContent(
  essayId: string,
  payload: { content: string; wordCount: number }
) {
  const { profileId, error: authError } = await getStudentProfileId();
  if (authError || !profileId) return { error: authError };

  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("essays")
    .update({
      content: payload.content,
      word_count: payload.wordCount,
    })
    .eq("id", essayId)
    .eq("student_id", profileId);

  if (error) return { error: error.message };
  return { error: null };
}

// ─── Create a new version snapshot ─────────────────────────────────────────

export async function createEssayVersion(
  essayId: string,
  content: string,
  wordCount: number
) {
  const { profileId, error: authError } = await getStudentProfileId();
  if (authError || !profileId) return { data: null, error: authError };

  const admin = createServiceRoleClient();

  // Get current version number
  const { data: essay } = await admin
    .from("essays")
    .select("version_number")
    .eq("id", essayId)
    .eq("student_id", profileId)
    .single();

  if (!essay) return { data: null, error: "Essay not found" };

  const newVersion = essay.version_number + 1;

  // Insert version snapshot
  const { data, error } = await admin
    .from("essay_versions")
    .insert({
      essay_id: essayId,
      version_number: newVersion,
      content,
      word_count: wordCount,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  // Update essay version number
  await admin
    .from("essays")
    .update({ version_number: newVersion })
    .eq("id", essayId);

  return { data, error: null };
}

// ─── Update essay status ───────────────────────────────────────────────────

export async function updateEssayStatus(
  essayId: string,
  status: EssayStatus
) {
  const { profileId, error: authError } = await getStudentProfileId();
  if (authError || !profileId) return { error: authError };

  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("essays")
    .update({ status })
    .eq("id", essayId)
    .eq("student_id", profileId);

  if (error) return { error: error.message };

  // ── Notification trigger: notify coach when essay submitted for review ──
  if (status === "coach_review") {
    try {
      // Get student's assigned coach
      const { data: sp } = await admin
        .from("student_profiles")
        .select("assigned_coach_id, profiles!student_profiles_user_id_fkey(first_name, last_name)")
        .eq("id", profileId)
        .single();

      const { data: essayData } = await admin
        .from("essays")
        .select("title")
        .eq("id", essayId)
        .single();

      if (sp?.assigned_coach_id) {
        const studentProfile = sp.profiles as unknown as {
          first_name: string;
          last_name: string;
        };
        const studentName = `${studentProfile.first_name} ${studentProfile.last_name}`;
        await createNotification(
          sp.assigned_coach_id,
          "feedback",
          `${studentName} submitted essay for review`,
          `"${essayData?.title ?? "Untitled"}" is ready for your feedback`,
          `/coach/students/${profileId}`
        );
      }
    } catch {
      // Notification failure should not block status update
    }
  }

  return { error: null };
}

// ─── Update essay title ────────────────────────────────────────────────────

export async function updateEssayTitle(essayId: string, title: string) {
  const { profileId, error: authError } = await getStudentProfileId();
  if (authError || !profileId) return { error: authError };

  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("essays")
    .update({ title })
    .eq("id", essayId)
    .eq("student_id", profileId);

  if (error) return { error: error.message };
  return { error: null };
}

// ─── Delete an essay ───────────────────────────────────────────────────────

export async function deleteEssay(essayId: string) {
  const { profileId, error: authError } = await getStudentProfileId();
  if (authError || !profileId) return { error: authError };

  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("essays")
    .delete()
    .eq("id", essayId)
    .eq("student_id", profileId);

  if (error) return { error: error.message };
  return { error: null };
}

// ─── Resolve feedback ──────────────────────────────────────────────────────

export async function resolveFeedback(feedbackId: string) {
  const { profileId, error: authError } = await getStudentProfileId();
  if (authError || !profileId) return { error: authError };

  const admin = createServiceRoleClient();

  // Verify this feedback belongs to one of the student's essays
  const { data: feedback } = await admin
    .from("essay_feedback")
    .select("essay_id")
    .eq("id", feedbackId)
    .single();

  if (!feedback) return { error: "Feedback not found" };

  const { data: essay } = await admin
    .from("essays")
    .select("id")
    .eq("id", feedback.essay_id)
    .eq("student_id", profileId)
    .single();

  if (!essay) return { error: "Not authorized" };

  const { error } = await admin
    .from("essay_feedback")
    .update({ status: "resolved" as const })
    .eq("id", feedbackId);

  if (error) return { error: error.message };
  return { error: null };
}
