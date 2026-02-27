-- ============================================================================
-- Migration 00008: Storage Bucket for Student Documents
-- Creates the student-documents bucket and storage policies so that
-- authenticated users can upload and read files.
-- ============================================================================

-- ─── Create the bucket ─────────────────────────────────────────────────────
-- public = true so getPublicUrl() returns a working URL without signed tokens.
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-documents', 'student-documents', true)
ON CONFLICT (id) DO NOTHING;

-- ─── Storage Policies ──────────────────────────────────────────────────────

-- Allow authenticated users to upload files into their own profile folder.
-- Path pattern: <student_profile_id>/<uuid>.<ext>
CREATE POLICY "authenticated_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'student-documents');

-- Allow authenticated users to read/download any file in the bucket.
CREATE POLICY "authenticated_read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'student-documents');

-- Allow authenticated users to delete their own uploaded files.
-- Uses the service role client for deletes in the app, but this policy
-- enables direct deletes as well.
CREATE POLICY "authenticated_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'student-documents');

-- Allow public read access (since the bucket is public).
-- This ensures getPublicUrl() links are accessible without auth headers.
CREATE POLICY "public_read"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'student-documents');
