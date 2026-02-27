"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/actions/notifications";
import type { SchoolApplicationStatus, RequirementType } from "@/types/database";

// ─── Fetch all schools for the current user ──────────────────────────────────

export async function fetchStudentSchools() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("student_schools")
    .select("*, school_requirements(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ─── Fetch single school with requirements ───────────────────────────────────

export async function fetchStudentSchool(schoolId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("student_schools")
    .select("*, school_requirements(*)")
    .eq("id", schoolId)
    .eq("user_id", user.id)
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ─── Add a school ────────────────────────────────────────────────────────────

interface AddSchoolPayload {
  schoolName: string;
  schoolSlug: string;
  applicationType: string;
  deadline: string | null;
}

export async function addStudentSchool(payload: AddSchoolPayload) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("student_schools")
    .insert({
      user_id: user.id,
      school_name: payload.schoolName,
      school_slug: payload.schoolSlug,
      application_type: payload.applicationType as "undergraduate" | "law_school" | "transfer",
      deadline: payload.deadline,
    })
    .select("*, school_requirements(*)")
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ─── Update school status (used by drag-and-drop) ────────────────────────────

export async function updateSchoolStatus(
  schoolId: string,
  status: SchoolApplicationStatus
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("student_schools")
    .update({ status })
    .eq("id", schoolId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  // ── Notification trigger: notify student of school status change ──
  try {
    const { data: school } = await admin
      .from("student_schools")
      .select("school_name")
      .eq("id", schoolId)
      .single();

    if (school) {
      const statusLabel = status.replace(/_/g, " ");
      await createNotification(
        user.id,
        "system",
        `${school.school_name} updated to ${statusLabel}`,
        `Your application status for ${school.school_name} is now "${statusLabel}".`,
        "/student/schools"
      );
    }
  } catch {
    // Notification failure should not block status update
  }

  return { error: null };
}

// ─── Update school details ───────────────────────────────────────────────────

export async function updateStudentSchool(
  schoolId: string,
  updates: {
    deadline?: string | null;
    notes?: string | null;
    status?: SchoolApplicationStatus;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("student_schools")
    .update(updates)
    .eq("id", schoolId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { error: null };
}

// ─── Delete a school ─────────────────────────────────────────────────────────

export async function deleteStudentSchool(schoolId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("student_schools")
    .delete()
    .eq("id", schoolId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { error: null };
}

// ─── Toggle requirement completion ───────────────────────────────────────────

export async function toggleRequirementCompletion(
  requirementId: string,
  isCompleted: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("school_requirements")
    .update({ is_completed: isCompleted })
    .eq("id", requirementId);

  if (error) return { error: error.message };
  return { error: null };
}

// ─── Add a requirement ───────────────────────────────────────────────────────

interface AddRequirementPayload {
  studentSchoolId: string;
  label: string;
  requirementType: RequirementType;
  dueDate: string | null;
}

export async function addSchoolRequirement(payload: AddRequirementPayload) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const admin = createServiceRoleClient();

  // Verify ownership
  const { data: school } = await admin
    .from("student_schools")
    .select("id")
    .eq("id", payload.studentSchoolId)
    .eq("user_id", user.id)
    .single();

  if (!school) return { data: null, error: "School not found" };

  const { data, error } = await admin
    .from("school_requirements")
    .insert({
      student_school_id: payload.studentSchoolId,
      label: payload.label,
      requirement_type: payload.requirementType,
      due_date: payload.dueDate,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ─── Delete requirement ──────────────────────────────────────────────────────

export async function deleteSchoolRequirement(requirementId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("school_requirements")
    .delete()
    .eq("id", requirementId);

  if (error) return { error: error.message };
  return { error: null };
}

// ─── Seed default requirements for a school based on application type ────────

export async function seedDefaultRequirements(
  studentSchoolId: string,
  applicationType: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const templates = getRequirementTemplates(applicationType);
  const admin = createServiceRoleClient();

  const { data, error } = await admin
    .from("school_requirements")
    .insert(
      templates.map((t, i) => ({
        student_school_id: studentSchoolId,
        requirement_type: t.type,
        label: t.label,
        sort_order: i,
      }))
    )
    .select();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

function getRequirementTemplates(applicationType: string) {
  const common: { type: RequirementType; label: string }[] = [
    { type: "application_form", label: "Complete application form" },
    { type: "transcript", label: "Submit official transcripts" },
    { type: "fee", label: "Pay application fee" },
  ];

  if (applicationType === "undergraduate") {
    return [
      ...common,
      { type: "test_score" as RequirementType, label: "Submit SAT/ACT scores" },
      { type: "essay" as RequirementType, label: "Personal statement / Common App essay" },
      { type: "recommendation" as RequirementType, label: "Counselor recommendation" },
      { type: "recommendation" as RequirementType, label: "Teacher recommendation #1" },
      { type: "recommendation" as RequirementType, label: "Teacher recommendation #2" },
      { type: "supplement" as RequirementType, label: "School-specific supplemental essays" },
      { type: "resume" as RequirementType, label: "Activities list / Resume" },
    ];
  }

  if (applicationType === "law_school") {
    return [
      ...common,
      { type: "test_score" as RequirementType, label: "Submit LSAT score" },
      { type: "essay" as RequirementType, label: "Personal statement" },
      { type: "essay" as RequirementType, label: "Diversity statement (optional)" },
      { type: "essay" as RequirementType, label: "Why X Law School essay" },
      { type: "recommendation" as RequirementType, label: "Letter of recommendation #1" },
      { type: "recommendation" as RequirementType, label: "Letter of recommendation #2" },
      { type: "resume" as RequirementType, label: "Resume / CV" },
    ];
  }

  // transfer
  return [
    ...common,
    { type: "test_score" as RequirementType, label: "Submit LSAT score (if required)" },
    { type: "essay" as RequirementType, label: "Transfer personal statement" },
    { type: "essay" as RequirementType, label: "Why transfer essay" },
    { type: "recommendation" as RequirementType, label: "Dean's certification / good standing letter" },
    { type: "recommendation" as RequirementType, label: "Professor recommendation" },
    { type: "resume" as RequirementType, label: "Resume / CV" },
  ];
}
