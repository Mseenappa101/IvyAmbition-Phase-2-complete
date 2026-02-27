"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { TaskPriority, TaskStatus } from "@/types/database";

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

  if (error || !data)
    return { profileId: null, userId: null, error: "Student profile not found" };
  return { profileId: data.id as string, userId: user.id, error: null };
}

// ─── Fetch all tasks for the current student ───────────────────────────────

export async function fetchStudentTasks() {
  const { profileId, error: authError } = await getStudentProfileId();
  if (authError || !profileId) return { data: null, error: authError };

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("tasks")
    .select("*, student_schools(school_name)")
    .eq("student_id", profileId)
    .order("due_date", { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ─── Create a new task ─────────────────────────────────────────────────────

interface CreateTaskPayload {
  title: string;
  description?: string;
  dueDate: string;
  priority?: TaskPriority;
  studentSchoolId?: string | null;
}

export async function createTask(payload: CreateTaskPayload) {
  const { profileId, userId, error: authError } = await getStudentProfileId();
  if (authError || !profileId || !userId)
    return { data: null, error: authError };

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("tasks")
    .insert({
      student_id: profileId,
      title: payload.title,
      description: payload.description ?? null,
      due_date: payload.dueDate,
      priority: payload.priority ?? "medium",
      student_school_id: payload.studentSchoolId ?? null,
      created_by: userId,
    })
    .select("*, student_schools(school_name)")
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ─── Update a task ─────────────────────────────────────────────────────────

interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  dueDate?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  studentSchoolId?: string | null;
}

export async function updateTask(taskId: string, payload: UpdateTaskPayload) {
  const { profileId, error: authError } = await getStudentProfileId();
  if (authError || !profileId) return { error: authError };

  const admin = createServiceRoleClient();

  const updates: Record<string, unknown> = {};
  if (payload.title !== undefined) updates.title = payload.title;
  if (payload.description !== undefined) updates.description = payload.description;
  if (payload.dueDate !== undefined) updates.due_date = payload.dueDate;
  if (payload.priority !== undefined) updates.priority = payload.priority;
  if (payload.status !== undefined) updates.status = payload.status;
  if (payload.studentSchoolId !== undefined) updates.student_school_id = payload.studentSchoolId;

  const { error } = await admin
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .eq("student_id", profileId);

  if (error) return { error: error.message };
  return { error: null };
}

// ─── Update task status ────────────────────────────────────────────────────

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const { profileId, error: authError } = await getStudentProfileId();
  if (authError || !profileId) return { error: authError };

  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("tasks")
    .update({ status })
    .eq("id", taskId)
    .eq("student_id", profileId);

  if (error) return { error: error.message };
  return { error: null };
}

// ─── Delete a task ─────────────────────────────────────────────────────────

export async function deleteTask(taskId: string) {
  const { profileId, error: authError } = await getStudentProfileId();
  if (authError || !profileId) return { error: authError };

  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("student_id", profileId);

  if (error) return { error: error.message };
  return { error: null };
}
