"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { ActivityCategory, ApplicationType } from "@/types/database";

// ─── Helper: Get student profile ID from auth ──────────────────────────────

async function getStudentProfileId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { profileId: null, userId: null, error: "Not authenticated" };

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (error || !data) return { profileId: null, userId: null, error: "Student profile not found" };
  return { profileId: data.id as string, userId: user.id, error: null };
}

// ─── Get student application type ──────────────────────────────────────────

export async function getStudentApplicationType() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { applicationType: null, error: "Not authenticated" };

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("student_profiles")
    .select("application_type")
    .eq("user_id", user.id)
    .single();

  if (error || !data) return { applicationType: null, error: "Profile not found" };
  return { applicationType: data.application_type as ApplicationType, error: null };
}

// ─── Fetch all activities for the current student ──────────────────────────

export async function fetchStudentActivities() {
  const { profileId, error: authError } = await getStudentProfileId();
  if (authError || !profileId) return { data: null, error: authError };

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("activities")
    .select("*")
    .eq("student_id", profileId)
    .order("ranking", { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ─── Create a new activity ─────────────────────────────────────────────────

interface CreateActivityPayload {
  activityName: string;
  category: ActivityCategory;
  organization?: string;
  positionTitle?: string;
  description?: string;
  startDate?: string | null;
  endDate?: string | null;
  hoursPerWeek?: number;
  weeksPerYear?: number;
  gradeLevels?: string[];
}

export async function createActivity(payload: CreateActivityPayload) {
  const { profileId, error: authError } = await getStudentProfileId();
  if (authError || !profileId) return { data: null, error: authError };

  const admin = createServiceRoleClient();

  // Get max ranking to place new activity at end
  const { data: existing } = await admin
    .from("activities")
    .select("ranking")
    .eq("student_id", profileId)
    .order("ranking", { ascending: false })
    .limit(1);

  const nextRanking = existing && existing.length > 0 ? existing[0].ranking + 1 : 0;
  const desc = payload.description ?? "";

  const { data, error } = await admin
    .from("activities")
    .insert({
      student_id: profileId,
      activity_name: payload.activityName,
      category: payload.category,
      organization: payload.organization ?? "",
      position_title: payload.positionTitle ?? "",
      description: desc,
      character_count: desc.length,
      start_date: payload.startDate ?? null,
      end_date: payload.endDate ?? null,
      hours_per_week: payload.hoursPerWeek ?? 0,
      weeks_per_year: payload.weeksPerYear ?? 0,
      grade_levels: payload.gradeLevels ?? [],
      ranking: nextRanking,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ─── Update an activity ────────────────────────────────────────────────────

interface UpdateActivityPayload {
  activityName?: string;
  category?: ActivityCategory;
  organization?: string;
  positionTitle?: string;
  description?: string;
  startDate?: string | null;
  endDate?: string | null;
  hoursPerWeek?: number;
  weeksPerYear?: number;
  gradeLevels?: string[];
}

export async function updateActivity(
  activityId: string,
  payload: UpdateActivityPayload
) {
  const { profileId, error: authError } = await getStudentProfileId();
  if (authError || !profileId) return { error: authError };

  const admin = createServiceRoleClient();

  const updates: Record<string, unknown> = {};
  if (payload.activityName !== undefined) updates.activity_name = payload.activityName;
  if (payload.category !== undefined) updates.category = payload.category;
  if (payload.organization !== undefined) updates.organization = payload.organization;
  if (payload.positionTitle !== undefined) updates.position_title = payload.positionTitle;
  if (payload.description !== undefined) {
    updates.description = payload.description;
    updates.character_count = payload.description.length;
  }
  if (payload.startDate !== undefined) updates.start_date = payload.startDate;
  if (payload.endDate !== undefined) updates.end_date = payload.endDate;
  if (payload.hoursPerWeek !== undefined) updates.hours_per_week = payload.hoursPerWeek;
  if (payload.weeksPerYear !== undefined) updates.weeks_per_year = payload.weeksPerYear;
  if (payload.gradeLevels !== undefined) updates.grade_levels = payload.gradeLevels;

  const { error } = await admin
    .from("activities")
    .update(updates)
    .eq("id", activityId)
    .eq("student_id", profileId);

  if (error) return { error: error.message };
  return { error: null };
}

// ─── Delete an activity ────────────────────────────────────────────────────

export async function deleteActivity(activityId: string) {
  const { profileId, error: authError } = await getStudentProfileId();
  if (authError || !profileId) return { error: authError };

  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("activities")
    .delete()
    .eq("id", activityId)
    .eq("student_id", profileId);

  if (error) return { error: error.message };
  return { error: null };
}

// ─── Reorder activities ────────────────────────────────────────────────────

export async function reorderActivities(orderedIds: string[]) {
  const { profileId, error: authError } = await getStudentProfileId();
  if (authError || !profileId) return { error: authError };

  const admin = createServiceRoleClient();

  const updates = orderedIds.map((id, index) =>
    admin
      .from("activities")
      .update({ ranking: index })
      .eq("id", id)
      .eq("student_id", profileId)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };
  return { error: null };
}
