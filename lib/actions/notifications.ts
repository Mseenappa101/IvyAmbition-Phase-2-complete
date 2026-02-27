"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { sendNotificationEmail } from "@/lib/email";
import type { NotificationType } from "@/types/database";

// ─── Helper: Get authenticated user ID ──────────────────────────────────────

async function getAuthUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { userId: null, error: "Not authenticated" };
  return { userId: user.id, error: null };
}

// ─── Internal: Create a notification (used by triggers) ─────────────────────

const EMAIL_WORTHY_TYPES: NotificationType[] = ["message", "feedback", "assignment"];

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  relatedUrl?: string
) {
  const admin = createServiceRoleClient();

  await admin.from("notifications").insert({
    user_id: userId,
    type,
    title,
    body,
    related_url: relatedUrl ?? null,
  });

  // Send email for critical notification types
  if (EMAIL_WORTHY_TYPES.includes(type)) {
    const { data: profile } = await admin
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .single();

    if (profile?.email) {
      await sendNotificationEmail(profile.email, title, body);
    }
  }
}

// ─── Fetch Notifications ────────────────────────────────────────────────────

export async function fetchNotifications(): Promise<{
  data: {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    related_url: string | null;
    read: boolean;
    created_at: string;
  }[];
  error: string | null;
}> {
  const { userId, error: authError } = await getAuthUserId();
  if (authError || !userId) return { data: [], error: authError };

  const admin = createServiceRoleClient();

  const { data, error } = await admin
    .from("notifications")
    .select("id, type, title, body, related_url, read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}

// ─── Fetch Unread Count ─────────────────────────────────────────────────────

export async function fetchUnreadNotificationCount(): Promise<{
  count: number;
  error: string | null;
}> {
  const { userId, error: authError } = await getAuthUserId();
  if (authError || !userId) return { count: 0, error: authError };

  const admin = createServiceRoleClient();

  const { count, error } = await admin
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) return { count: 0, error: error.message };
  return { count: count ?? 0, error: null };
}

// ─── Mark Single Notification as Read ───────────────────────────────────────

export async function markNotificationAsRead(
  notificationId: string
): Promise<{ error: string | null }> {
  const { userId, error: authError } = await getAuthUserId();
  if (authError || !userId) return { error: authError };

  const admin = createServiceRoleClient();

  const { error } = await admin
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) return { error: error.message };
  return { error: null };
}

// ─── Mark All Notifications as Read ─────────────────────────────────────────

export async function markAllNotificationsAsRead(): Promise<{
  error: string | null;
}> {
  const { userId, error: authError } = await getAuthUserId();
  if (authError || !userId) return { error: authError };

  const admin = createServiceRoleClient();

  const { error } = await admin
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) return { error: error.message };
  return { error: null };
}
