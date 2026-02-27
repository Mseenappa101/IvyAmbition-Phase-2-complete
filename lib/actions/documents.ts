"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { DocumentCategory } from "@/types/database";

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

// ─── Fetch all documents for the current student ───────────────────────────

export async function fetchStudentDocuments() {
  const { profileId, error: authError } = await getStudentProfileId();
  if (authError || !profileId) return { data: null, error: authError };

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("documents")
    .select("*, profiles!uploaded_by(first_name, last_name)")
    .eq("student_id", profileId)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// ─── Upload a document ─────────────────────────────────────────────────────

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
];

export async function uploadDocument(formData: FormData) {
  const { profileId, userId, error: authError } = await getStudentProfileId();
  if (authError || !profileId || !userId)
    return { data: null, error: authError };

  const file = formData.get("file") as File;
  const category = (formData.get("category") as DocumentCategory) || "other";
  const notes = (formData.get("notes") as string) || null;

  if (!file) return { data: null, error: "No file provided" };

  // Validate size
  if (file.size > MAX_FILE_SIZE) {
    return { data: null, error: "File exceeds 10MB limit" };
  }

  // Validate type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      data: null,
      error: "Invalid file type. Accepted: PDF, DOC, DOCX, PNG, JPG",
    };
  }

  const admin = createServiceRoleClient();

  // Generate unique storage path
  const ext = file.name.split(".").pop() ?? "bin";
  const storagePath = `${profileId}/${crypto.randomUUID()}.${ext}`;

  // Convert File to Buffer — Next.js server actions don't always pass
  // a proper File/Blob to the Supabase Storage SDK on the server side.
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload to Supabase Storage
  const { error: uploadError } = await admin.storage
    .from("student-documents")
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return { data: null, error: `Upload failed: ${uploadError.message}` };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = admin.storage.from("student-documents").getPublicUrl(storagePath);

  // Insert record
  const { data, error } = await admin
    .from("documents")
    .insert({
      student_id: profileId,
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

// ─── Delete a document ─────────────────────────────────────────────────────

export async function deleteDocument(documentId: string) {
  const { profileId, error: authError } = await getStudentProfileId();
  if (authError || !profileId) return { error: authError };

  const admin = createServiceRoleClient();

  // Get file URL to determine storage path
  const { data: doc } = await admin
    .from("documents")
    .select("file_url")
    .eq("id", documentId)
    .eq("student_id", profileId)
    .single();

  if (!doc) return { error: "Document not found" };

  // Extract storage path from URL
  // URL format: .../storage/v1/object/public/student-documents/profileId/uuid.ext
  const urlParts = doc.file_url.split("/student-documents/");
  if (urlParts.length === 2) {
    await admin.storage.from("student-documents").remove([urlParts[1]]);
  }

  // Delete record
  const { error } = await admin
    .from("documents")
    .delete()
    .eq("id", documentId)
    .eq("student_id", profileId);

  if (error) return { error: error.message };
  return { error: null };
}

// ─── Update document notes ─────────────────────────────────────────────────

export async function updateDocumentNotes(
  documentId: string,
  notes: string
) {
  const { profileId, error: authError } = await getStudentProfileId();
  if (authError || !profileId) return { error: authError };

  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("documents")
    .update({ notes })
    .eq("id", documentId)
    .eq("student_id", profileId);

  if (error) return { error: error.message };
  return { error: null };
}
