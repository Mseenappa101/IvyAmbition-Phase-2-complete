-- ============================================================================
-- Migration 00009: Messaging System
-- Creates conversations and messages tables for student-coach communication,
-- a message-attachments storage bucket, and enables Realtime on messages.
-- ============================================================================

-- ─── Custom Enum Types ──────────────────────────────────────────────────────

CREATE TYPE message_type AS ENUM ('text', 'feedback', 'file', 'system');

-- ─── Conversations Table ────────────────────────────────────────────────────

CREATE TABLE conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  coach_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_student_coach UNIQUE (student_id, coach_id)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- ─── Messages Table ─────────────────────────────────────────────────────────

CREATE TABLE messages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content           TEXT NOT NULL,
  message_type      message_type NOT NULL DEFAULT 'text',
  related_essay_id  UUID REFERENCES essays(id) ON DELETE SET NULL,
  related_school_id UUID REFERENCES student_schools(id) ON DELETE SET NULL,
  read_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ─── Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX idx_conversations_student_id ON conversations (student_id);
CREATE INDEX idx_conversations_coach_id   ON conversations (coach_id);

CREATE INDEX idx_messages_conversation_id ON messages (conversation_id);
CREATE INDEX idx_messages_sender_id       ON messages (sender_id);
CREATE INDEX idx_messages_created_at      ON messages (created_at);
CREATE INDEX idx_messages_unread          ON messages (read_at) WHERE read_at IS NULL;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- ─── Conversations RLS ──────────────────────────────────────────────────────

CREATE POLICY "conversations_select_student"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = conversations.student_id
        AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "conversations_select_coach"
  ON conversations FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "conversations_insert_student"
  ON conversations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = conversations.student_id
        AND sp.user_id = auth.uid()
    )
  );

-- ─── Messages RLS ───────────────────────────────────────────────────────────

CREATE POLICY "messages_select_student"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN student_profiles sp ON sp.id = c.student_id
      WHERE c.id = messages.conversation_id
        AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "messages_select_coach"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.coach_id = auth.uid()
    )
  );

CREATE POLICY "messages_insert_student"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      JOIN student_profiles sp ON sp.id = c.student_id
      WHERE c.id = messages.conversation_id
        AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "messages_insert_coach"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.coach_id = auth.uid()
    )
  );

CREATE POLICY "messages_update_student"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN student_profiles sp ON sp.id = c.student_id
      WHERE c.id = messages.conversation_id
        AND sp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN student_profiles sp ON sp.id = c.student_id
      WHERE c.id = messages.conversation_id
        AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "messages_update_coach"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.coach_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.coach_id = auth.uid()
    )
  );

-- ─── Enable Realtime ────────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ─── Storage Bucket ─────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "message_attachments_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'message-attachments');

CREATE POLICY "message_attachments_read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'message-attachments');

CREATE POLICY "message_attachments_public_read"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'message-attachments');

CREATE POLICY "message_attachments_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'message-attachments');
