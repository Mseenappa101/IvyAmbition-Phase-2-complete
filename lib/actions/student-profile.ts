"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export interface StudentProfileForAI {
  application_type: string;
  current_gpa: number | null;
  sat_score: number | null;
  act_score: number | null;
  lsat_score: number | null;
  intended_major: string | null;
  current_school: string | null;
  work_experience_years: number | null;
  class_rank: string | null;
}

export async function fetchStudentProfileForAI() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("student_profiles")
    .select(
      "application_type, current_gpa, sat_score, act_score, lsat_score, intended_major, current_school, work_experience_years, class_rank"
    )
    .eq("user_id", user.id)
    .single();

  if (error || !data) return { data: null, error: "Student profile not found" };
  return { data: data as StudentProfileForAI, error: null };
}
