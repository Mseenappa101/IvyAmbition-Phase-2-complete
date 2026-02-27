"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { MessageType } from "@/types/database";

// ─── Helper: Get authenticated user ID ──────────────────────────────────────

async function getAuthUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { userId: null, error: "Not authenticated" };
  return { userId: user.id, error: null };
}

// ─── Helper: Get student profile for a user ─────────────────────────────────

async function getStudentProfileForUser(userId: string) {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("student_profiles")
    .select("id, assigned_coach_id")
    .eq("user_id", userId)
    .single();

  if (error || !data)
    return { profile: null, error: "Student profile not found" };
  return {
    profile: data as { id: string; assigned_coach_id: string | null },
    error: null,
  };
}

// ─── Get or create conversation ─────────────────────────────────────────────

export async function getOrCreateConversation(studentProfileId?: string) {
  const { userId, error: authError } = await getAuthUserId();
  if (authError || !userId) return { data: null, error: authError };

  const admin = createServiceRoleClient();

  // Determine caller role
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (!profile) return { data: null, error: "Profile not found" };

  if (profile.role === "student") {
    const { profile: sp, error: spError } =
      await getStudentProfileForUser(userId);
    if (spError || !sp) return { data: null, error: spError };
    if (!sp.assigned_coach_id)
      return { data: null, error: "No coach assigned yet" };

    // Check for existing
    const { data: existing } = await admin
      .from("conversations")
      .select("*")
      .eq("student_id", sp.id)
      .eq("coach_id", sp.assigned_coach_id)
      .single();

    if (existing) return { data: existing, error: null };

    // Create new
    const { data: newConv, error: insertError } = await admin
      .from("conversations")
      .insert({
        student_id: sp.id,
        coach_id: sp.assigned_coach_id,
      })
      .select()
      .single();

    if (insertError) return { data: null, error: insertError.message };
    return { data: newConv, error: null };
  }

  if (profile.role === "coach" && studentProfileId) {
    const { data: existing } = await admin
      .from("conversations")
      .select("*")
      .eq("student_id", studentProfileId)
      .eq("coach_id", userId)
      .single();

    if (existing) return { data: existing, error: null };

    const { data: newConv, error: insertError } = await admin
      .from("conversations")
      .insert({
        student_id: studentProfileId,
        coach_id: userId,
      })
      .select()
      .single();

    if (insertError) return { data: null, error: insertError.message };
    return { data: newConv, error: null };
  }

  return { data: null, error: "Invalid request" };
}

// ─── Fetch conversations list ───────────────────────────────────────────────

export async function fetchConversations() {
  const { userId, error: authError } = await getAuthUserId();
  if (authError || !userId) return { data: null, error: authError };

  const admin = createServiceRoleClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (!profile) return { data: null, error: "Profile not found" };

  if (profile.role === "student") {
    const { profile: sp } = await getStudentProfileForUser(userId);
    if (!sp) return { data: null, error: "Student profile not found" };

    const { data, error } = await admin
      .from("conversations")
      .select(
        "*, profiles!conversations_coach_id_fkey(id, first_name, last_name, avatar_url)"
      )
      .eq("student_id", sp.id)
      .order("created_at", { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  }

  // Coach: all conversations where they are the coach
  const { data, error } = await admin
    .from("conversations")
    .select(
      "*, student_profiles!inner(id, user_id, profiles:profiles!student_profiles_user_id_fkey(id, first_name, last_name, avatar_url))"
    )
    .eq("coach_id", userId)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ─── Fetch messages for a conversation ──────────────────────────────────────

export async function fetchMessages(conversationId: string) {
  const { userId, error: authError } = await getAuthUserId();
  if (authError || !userId) return { data: null, error: authError };

  const admin = createServiceRoleClient();

  const { data, error } = await admin
    .from("messages")
    .select(
      `
      *,
      profiles!messages_sender_id_fkey(id, first_name, last_name, avatar_url),
      essays(id, title),
      student_schools(id, school_name)
    `
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ─── Send a message ─────────────────────────────────────────────────────────

interface SendMessagePayload {
  conversationId: string;
  content: string;
  messageType?: MessageType;
  relatedEssayId?: string | null;
  relatedSchoolId?: string | null;
}

export async function sendMessage(payload: SendMessagePayload) {
  const { userId, error: authError } = await getAuthUserId();
  if (authError || !userId) return { data: null, error: authError };

  const admin = createServiceRoleClient();

  const { data, error } = await admin
    .from("messages")
    .insert({
      conversation_id: payload.conversationId,
      sender_id: userId,
      content: payload.content,
      message_type: payload.messageType ?? "text",
      related_essay_id: payload.relatedEssayId ?? null,
      related_school_id: payload.relatedSchoolId ?? null,
    })
    .select(
      `
      *,
      profiles!messages_sender_id_fkey(id, first_name, last_name, avatar_url),
      essays(id, title),
      student_schools(id, school_name)
    `
    )
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ─── Upload file attachment ─────────────────────────────────────────────────

export async function sendFileMessage(formData: FormData) {
  const { userId, error: authError } = await getAuthUserId();
  if (authError || !userId) return { data: null, error: authError };

  const file = formData.get("file") as File;
  const conversationId = formData.get("conversationId") as string;

  if (!file) return { data: null, error: "No file provided" };
  if (!conversationId)
    return { data: null, error: "No conversation specified" };

  if (file.size > 10 * 1024 * 1024) {
    return { data: null, error: "File exceeds 10MB limit" };
  }

  const admin = createServiceRoleClient();

  const ext = file.name.split(".").pop() ?? "bin";
  const storagePath = `${conversationId}/${crypto.randomUUID()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await admin.storage
    .from("message-attachments")
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError)
    return { data: null, error: `Upload failed: ${uploadError.message}` };

  const {
    data: { publicUrl },
  } = admin.storage.from("message-attachments").getPublicUrl(storagePath);

  // Store as "filename|url" — parsed by MessageBubble component
  const content = `${file.name}|${publicUrl}`;

  return sendMessage({
    conversationId,
    content,
    messageType: "file",
  });
}

// ─── Mark messages as read ──────────────────────────────────────────────────

export async function markMessagesAsRead(conversationId: string) {
  const { userId, error: authError } = await getAuthUserId();
  if (authError || !userId) return { error: authError };

  const admin = createServiceRoleClient();

  const { error } = await admin
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .is("read_at", null);

  if (error) return { error: error.message };
  return { error: null };
}

// ─── Get total unread count ─────────────────────────────────────────────────

export async function fetchUnreadCount() {
  const { userId, error: authError } = await getAuthUserId();
  if (authError || !userId) return { data: 0, error: authError };

  const admin = createServiceRoleClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (!profile) return { data: 0, error: "Profile not found" };

  let conversationIds: string[] = [];

  if (profile.role === "student") {
    const { profile: sp } = await getStudentProfileForUser(userId);
    if (!sp) return { data: 0, error: null };

    const { data: convs } = await admin
      .from("conversations")
      .select("id")
      .eq("student_id", sp.id);

    conversationIds = (convs ?? []).map((c) => c.id);
  } else {
    const { data: convs } = await admin
      .from("conversations")
      .select("id")
      .eq("coach_id", userId);

    conversationIds = (convs ?? []).map((c) => c.id);
  }

  if (conversationIds.length === 0) return { data: 0, error: null };

  const { count, error } = await admin
    .from("messages")
    .select("id", { count: "exact", head: true })
    .in("conversation_id", conversationIds)
    .neq("sender_id", userId)
    .is("read_at", null);

  if (error) return { data: 0, error: error.message };
  return { data: count ?? 0, error: null };
}

// ─── Coach: enriched conversations with last message + unread ───────────────

export interface CoachConversationEnriched {
  id: string;
  student_id: string;
  coach_id: string;
  created_at: string;
  student: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    application_type: string;
  };
  last_message: {
    content: string;
    message_type: string;
    created_at: string;
    sender_id: string;
  } | null;
  unread_count: number;
}

export async function fetchCoachConversationsEnriched() {
  const { userId, error: authError } = await getAuthUserId();
  if (authError || !userId)
    return { data: null as CoachConversationEnriched[] | null, error: authError };

  const admin = createServiceRoleClient();

  // 1. Fetch all conversations with student profile data
  const { data: convs, error } = await admin
    .from("conversations")
    .select(
      "id, student_id, coach_id, created_at, student_profiles!inner(id, user_id, application_type, profiles:profiles!student_profiles_user_id_fkey(id, first_name, last_name, avatar_url))"
    )
    .eq("coach_id", userId);

  if (error) return { data: null, error: error.message };
  if (!convs || convs.length === 0) return { data: [], error: null };

  // 2. For each conversation, fetch last message + unread count
  const enriched: CoachConversationEnriched[] = await Promise.all(
    convs.map(async (conv) => {
      const sp = conv.student_profiles as unknown as {
        id: string;
        user_id: string;
        application_type: string;
        profiles: {
          id: string;
          first_name: string;
          last_name: string;
          avatar_url: string | null;
        };
      };

      // Last message
      const { data: lastMsg } = await admin
        .from("messages")
        .select("content, message_type, created_at, sender_id")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Unread count
      const { count } = await admin
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", conv.id)
        .neq("sender_id", userId)
        .is("read_at", null);

      return {
        id: conv.id,
        student_id: conv.student_id,
        coach_id: conv.coach_id,
        created_at: conv.created_at,
        student: {
          id: sp.profiles.id,
          first_name: sp.profiles.first_name,
          last_name: sp.profiles.last_name,
          avatar_url: sp.profiles.avatar_url,
          application_type: sp.application_type,
        },
        last_message: lastMsg
          ? {
              content: lastMsg.content,
              message_type: lastMsg.message_type,
              created_at: lastMsg.created_at,
              sender_id: lastMsg.sender_id,
            }
          : null,
        unread_count: count ?? 0,
      };
    })
  );

  // 3. Sort by last message timestamp (most recent first), fallback to created_at
  enriched.sort((a, b) => {
    const aTime = a.last_message?.created_at ?? a.created_at;
    const bTime = b.last_message?.created_at ?? b.created_at;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  return { data: enriched, error: null };
}

// ─── Coach: fetch context for message composer ──────────────────────────────

export async function fetchContextForConversation(studentProfileId: string) {
  const { userId, error: authError } = await getAuthUserId();
  if (authError || !userId) return { data: null, error: authError };

  const admin = createServiceRoleClient();

  // Get student's user_id for schools query
  const { data: sp } = await admin
    .from("student_profiles")
    .select("user_id")
    .eq("id", studentProfileId)
    .single();

  if (!sp) return { data: null, error: "Student not found" };

  // Fetch essays and schools in parallel
  const [essaysResult, schoolsResult] = await Promise.all([
    admin
      .from("essays")
      .select("id, title")
      .eq("student_id", studentProfileId)
      .order("created_at", { ascending: false }),
    admin
      .from("student_schools")
      .select("id, school_name")
      .eq("user_id", sp.user_id)
      .order("school_name", { ascending: true }),
  ]);

  return {
    data: {
      essays: (essaysResult.data ?? []) as { id: string; title: string }[],
      schools: (schoolsResult.data ?? []) as {
        id: string;
        school_name: string;
      }[],
    },
    error: null,
  };
}
