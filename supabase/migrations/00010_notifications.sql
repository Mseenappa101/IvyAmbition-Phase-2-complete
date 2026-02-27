-- ============================================================================
-- Migration 00010: Notifications System
-- Creates notifications table for in-app notifications across all user roles,
-- with RLS policies and Realtime enabled.
-- ============================================================================

-- ─── Custom Enum Type ─────────────────────────────────────────────────────

CREATE TYPE notification_type AS ENUM (
  'message',
  'feedback',
  'deadline',
  'assignment',
  'system'
);

-- ─── Notifications Table ──────────────────────────────────────────────────

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        notification_type NOT NULL DEFAULT 'system',
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  related_url TEXT,
  read        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ─── Indexes ──────────────────────────────────────────────────────────────

CREATE INDEX idx_notifications_user_id    ON notifications (user_id);
CREATE INDEX idx_notifications_unread     ON notifications (user_id, read) WHERE read = false;
CREATE INDEX idx_notifications_created_at ON notifications (created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Users can only read their own notifications
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only update their own notifications (mark as read)
CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "notifications_delete_own"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Insert is handled via service role client (server actions) — no RLS insert policy needed

-- ─── Enable Realtime ──────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
