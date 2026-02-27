"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

interface StudentOnboardingPayload {
  preferredName: string;
  phone: string;
  avatarUrl: string | null;
  applicationType: string;
  targetCycle: string;
  currentSchool: string | null;
  gpa: number | null;
  satScore: number | null;
  actScore: number | null;
  intendedMajor: string | null;
  lsatScore: number | null;
  workExperienceYears: number | null;
  firstYearGpa: number | null;
  classRank: string | null;
  originalLsatScore: number | null;
}

export async function completeStudentOnboarding(payload: StudentOnboardingPayload) {
  console.log("[onboarding] completeStudentOnboarding called with:", {
    preferredName: payload.preferredName,
    applicationType: payload.applicationType,
  });

  // Verify the user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("[onboarding] ERROR: user not authenticated");
    return { error: "Not authenticated" };
  }

  console.log("[onboarding] Authenticated user:", user.id);

  // Use service role client to bypass RLS for reliable writes
  const admin = createServiceRoleClient();

  // Update profiles table
  const { data: profileData, error: profileError } = await admin
    .from("profiles")
    .update({
      first_name: payload.preferredName,
      phone: payload.phone || null,
      avatar_url: payload.avatarUrl,
    })
    .eq("id", user.id)
    .select();

  if (profileError) {
    console.log("[onboarding] Profile update error:", profileError.message);
    return { error: profileError.message };
  }

  console.log("[onboarding] Profile update result — rows affected:", profileData?.length ?? 0);

  if (!profileData || profileData.length === 0) {
    console.log("[onboarding] ERROR: profile row not found for user", user.id);
    return { error: "Profile not found. Please contact support." };
  }

  // Build student profile update based on application type
  const studentUpdate: Record<string, unknown> = {
    application_type: payload.applicationType,
    target_cycle: payload.targetCycle,
    onboarding_completed: true,
    status: "active",
  };

  if (payload.applicationType === "undergraduate") {
    studentUpdate.current_school = payload.currentSchool;
    studentUpdate.current_gpa = payload.gpa;
    studentUpdate.sat_score = payload.satScore;
    studentUpdate.act_score = payload.actScore;
    studentUpdate.intended_major = payload.intendedMajor;
  } else if (payload.applicationType === "law_school") {
    studentUpdate.current_school = payload.currentSchool;
    studentUpdate.current_gpa = payload.gpa;
    studentUpdate.lsat_score = payload.lsatScore;
    studentUpdate.work_experience_years = payload.workExperienceYears;
  } else if (payload.applicationType === "transfer") {
    studentUpdate.current_school = payload.currentSchool;
    studentUpdate.current_gpa = payload.firstYearGpa;
    studentUpdate.lsat_score = payload.originalLsatScore;
    studentUpdate.class_rank = payload.classRank;
  }

  console.log("[onboarding] Student profile update payload:", studentUpdate);

  const { data: studentData, error: studentError } = await admin
    .from("student_profiles")
    .update(studentUpdate)
    .eq("user_id", user.id)
    .select();

  if (studentError) {
    console.log("[onboarding] Student profile update error:", studentError.message);
    return { error: studentError.message };
  }

  console.log("[onboarding] Student profile update result — rows affected:", studentData?.length ?? 0);

  if (!studentData || studentData.length === 0) {
    console.log("[onboarding] ERROR: student_profiles row not found for user_id", user.id);
    // Row doesn't exist — create it instead
    const { error: insertError } = await admin
      .from("student_profiles")
      .insert({ user_id: user.id, ...studentUpdate });

    if (insertError) {
      console.log("[onboarding] Student profile insert error:", insertError.message);
      return { error: insertError.message };
    }
    console.log("[onboarding] Created student_profiles row via insert");
  } else {
    console.log("[onboarding] onboarding_completed is now:", studentData[0]?.onboarding_completed);
  }

  return { error: null };
}

interface CoachOnboardingPayload {
  phone: string;
  bio: string;
  avatarUrl: string | null;
  specializations: string[];
  maxStudents: number;
}

export async function completeCoachOnboarding(payload: CoachOnboardingPayload) {
  console.log("[onboarding] completeCoachOnboarding called");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("[onboarding] ERROR: coach not authenticated");
    return { error: "Not authenticated" };
  }

  console.log("[onboarding] Authenticated coach:", user.id);

  const admin = createServiceRoleClient();

  const { data: profileData, error: profileError } = await admin
    .from("profiles")
    .update({
      phone: payload.phone || null,
      avatar_url: payload.avatarUrl,
    })
    .eq("id", user.id)
    .select();

  if (profileError) {
    console.log("[onboarding] Coach profile update error:", profileError.message);
    return { error: profileError.message };
  }

  if (!profileData || profileData.length === 0) {
    console.log("[onboarding] ERROR: coach profile row not found for user", user.id);
    return { error: "Profile not found. Please contact support." };
  }

  const coachUpdate = {
    bio: payload.bio || null,
    specializations: payload.specializations,
    max_students: payload.maxStudents,
    onboarding_completed: true,
  };

  const { data: coachData, error: coachError } = await admin
    .from("coach_profiles")
    .update(coachUpdate)
    .eq("user_id", user.id)
    .select();

  if (coachError) {
    console.log("[onboarding] Coach profiles update error:", coachError.message);
    return { error: coachError.message };
  }

  console.log("[onboarding] Coach profile update — rows affected:", coachData?.length ?? 0);

  if (!coachData || coachData.length === 0) {
    console.log("[onboarding] ERROR: coach_profiles row not found, inserting");
    const { error: insertError } = await admin
      .from("coach_profiles")
      .insert({ user_id: user.id, ...coachUpdate });

    if (insertError) {
      console.log("[onboarding] Coach profile insert error:", insertError.message);
      return { error: insertError.message };
    }
    console.log("[onboarding] Created coach_profiles row via insert");
  } else {
    console.log("[onboarding] onboarding_completed is now:", coachData[0]?.onboarding_completed);
  }

  return { error: null };
}
