-- ============================================================================
-- Migration 00006: Essay Management System
-- Creates essays, essay_versions, and essay_feedback tables for the
-- distraction-free essay writing and coaching feedback workflow.
-- ============================================================================

-- ─── Custom Enum Types ──────────────────────────────────────────────────────

CREATE TYPE essay_status AS ENUM (
  'brainstorming',
  'outline',
  'first_draft',
  'revision',
  'coach_review',
  'final'
);

CREATE TYPE feedback_type AS ENUM (
  'general',
  'inline'
);

CREATE TYPE feedback_status AS ENUM (
  'open',
  'resolved'
);

-- ─── Essays Table ───────────────────────────────────────────────────────────

CREATE TABLE essays (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  student_school_id UUID REFERENCES student_schools(id) ON DELETE SET NULL,
  title             TEXT NOT NULL,
  prompt            TEXT NOT NULL DEFAULT '',
  content           TEXT NOT NULL DEFAULT '',
  word_count        INTEGER NOT NULL DEFAULT 0,
  status            essay_status NOT NULL DEFAULT 'brainstorming',
  version_number    INTEGER NOT NULL DEFAULT 1,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE essays ENABLE ROW LEVEL SECURITY;

-- ─── Essay Versions Table ───────────────────────────────────────────────────

CREATE TABLE essay_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  essay_id        UUID NOT NULL REFERENCES essays(id) ON DELETE CASCADE,
  version_number  INTEGER NOT NULL,
  content         TEXT NOT NULL DEFAULT '',
  word_count      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE essay_versions ENABLE ROW LEVEL SECURITY;

-- ─── Essay Feedback Table ───────────────────────────────────────────────────

CREATE TABLE essay_feedback (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  essay_id        UUID NOT NULL REFERENCES essays(id) ON DELETE CASCADE,
  coach_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feedback_type   feedback_type NOT NULL DEFAULT 'general',
  content         TEXT NOT NULL,
  selection_start INTEGER,
  selection_end   INTEGER,
  status          feedback_status NOT NULL DEFAULT 'open',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE essay_feedback ENABLE ROW LEVEL SECURITY;

-- ─── Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX idx_essays_student_id        ON essays (student_id);
CREATE INDEX idx_essays_student_school_id ON essays (student_school_id);
CREATE INDEX idx_essays_status            ON essays (status);
CREATE INDEX idx_essays_updated_at        ON essays (updated_at);
CREATE INDEX idx_essay_versions_essay_id  ON essay_versions (essay_id);
CREATE INDEX idx_essay_feedback_essay_id  ON essay_feedback (essay_id);
CREATE INDEX idx_essay_feedback_coach_id  ON essay_feedback (coach_id);

-- ─── Updated-at Trigger ────────────────────────────────────────────────────
-- Reuses the update_updated_at() function from 00001_initial_schema.sql

CREATE TRIGGER set_essays_updated_at
  BEFORE UPDATE ON essays
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- ─── Essays RLS ─────────────────────────────────────────────────────────────
-- Students own essays via student_profiles.user_id = auth.uid()

CREATE POLICY "essays_select_own"
  ON essays FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = essays.student_id
        AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "essays_insert_own"
  ON essays FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = essays.student_id
        AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "essays_update_own"
  ON essays FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = essays.student_id
        AND sp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = essays.student_id
        AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "essays_delete_own"
  ON essays FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = essays.student_id
        AND sp.user_id = auth.uid()
    )
  );

-- Coach can SELECT essays of assigned students
CREATE POLICY "essays_select_coach"
  ON essays FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = essays.student_id
        AND sp.assigned_coach_id = auth.uid()
    )
  );

-- ─── Essay Versions RLS ────────────────────────────────────────────────────

CREATE POLICY "essay_versions_select_own"
  ON essay_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM essays e
      JOIN student_profiles sp ON sp.id = e.student_id
      WHERE e.id = essay_versions.essay_id
        AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "essay_versions_insert_own"
  ON essay_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM essays e
      JOIN student_profiles sp ON sp.id = e.student_id
      WHERE e.id = essay_versions.essay_id
        AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "essay_versions_select_coach"
  ON essay_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM essays e
      JOIN student_profiles sp ON sp.id = e.student_id
      WHERE e.id = essay_versions.essay_id
        AND sp.assigned_coach_id = auth.uid()
    )
  );

-- ─── Essay Feedback RLS ────────────────────────────────────────────────────

-- Students can read feedback on their essays
CREATE POLICY "essay_feedback_select_student"
  ON essay_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM essays e
      JOIN student_profiles sp ON sp.id = e.student_id
      WHERE e.id = essay_feedback.essay_id
        AND sp.user_id = auth.uid()
    )
  );

-- Students can update feedback status (mark resolved)
CREATE POLICY "essay_feedback_update_student"
  ON essay_feedback FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM essays e
      JOIN student_profiles sp ON sp.id = e.student_id
      WHERE e.id = essay_feedback.essay_id
        AND sp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM essays e
      JOIN student_profiles sp ON sp.id = e.student_id
      WHERE e.id = essay_feedback.essay_id
        AND sp.user_id = auth.uid()
    )
  );

-- Coaches can read their own feedback
CREATE POLICY "essay_feedback_select_coach"
  ON essay_feedback FOR SELECT
  USING (auth.uid() = coach_id);

-- Coaches can insert feedback on assigned students' essays
CREATE POLICY "essay_feedback_insert_coach"
  ON essay_feedback FOR INSERT
  WITH CHECK (
    auth.uid() = coach_id
    AND EXISTS (
      SELECT 1 FROM essays e
      JOIN student_profiles sp ON sp.id = e.student_id
      WHERE e.id = essay_feedback.essay_id
        AND sp.assigned_coach_id = auth.uid()
    )
  );
