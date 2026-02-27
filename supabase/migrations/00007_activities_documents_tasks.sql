-- ============================================================================
-- Migration 00007: Activities, Documents, and Tasks & Deadlines
-- Creates activities, documents, and tasks tables with supporting enums,
-- indexes, triggers, and RLS policies.
-- ============================================================================

-- ─── Custom Enum Types ──────────────────────────────────────────────────────

-- Single combined enum — UI filters by application_type
CREATE TYPE activity_category AS ENUM (
  -- Undergraduate categories
  'academic',
  'arts',
  'athletics',
  'career',
  'community_service',
  'computer_technology',
  'cultural',
  'family_responsibilities',
  'government',
  'journalism',
  'lgbtq',
  'music',
  'religious',
  'research',
  'school_spirit',
  'social_justice',
  -- Law / Transfer categories (research + other shared)
  'work_experience',
  'volunteer',
  'leadership',
  'publication',
  'extracurricular',
  'military',
  -- Universal
  'other'
);

CREATE TYPE document_category AS ENUM (
  'transcript',
  'test_scores',
  'resume',
  'letter_of_rec',
  'financial',
  'essay_draft',
  'other'
);

CREATE TYPE task_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

CREATE TYPE task_status AS ENUM (
  'pending',
  'in_progress',
  'completed'
);

-- ─── Activities Table ─────────────────────────────────────────────────────────

CREATE TABLE activities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  activity_name   TEXT NOT NULL,
  category        activity_category NOT NULL DEFAULT 'other',
  organization    TEXT NOT NULL DEFAULT '',
  position_title  TEXT NOT NULL DEFAULT '',
  description     TEXT NOT NULL DEFAULT '',
  character_count INTEGER NOT NULL DEFAULT 0,
  start_date      DATE,
  end_date        DATE,
  hours_per_week  INTEGER NOT NULL DEFAULT 0,
  weeks_per_year  INTEGER NOT NULL DEFAULT 0,
  grade_levels    TEXT[] NOT NULL DEFAULT '{}',
  ranking         INTEGER NOT NULL DEFAULT 0,
  coach_feedback  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- ─── Documents Table ──────────────────────────────────────────────────────────

CREATE TABLE documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  file_name   TEXT NOT NULL,
  file_type   TEXT NOT NULL,
  file_url    TEXT NOT NULL,
  file_size   INTEGER NOT NULL,
  category    document_category NOT NULL DEFAULT 'other',
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- ─── Tasks Table ──────────────────────────────────────────────────────────────

CREATE TABLE tasks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  student_school_id UUID REFERENCES student_schools(id) ON DELETE SET NULL,
  title             TEXT NOT NULL,
  description       TEXT,
  due_date          DATE NOT NULL,
  priority          task_priority NOT NULL DEFAULT 'medium',
  status            task_status NOT NULL DEFAULT 'pending',
  created_by        UUID NOT NULL REFERENCES profiles(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- ─── Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX idx_activities_student_id   ON activities (student_id);
CREATE INDEX idx_activities_ranking      ON activities (ranking);
CREATE INDEX idx_activities_category     ON activities (category);

CREATE INDEX idx_documents_student_id    ON documents (student_id);
CREATE INDEX idx_documents_category      ON documents (category);
CREATE INDEX idx_documents_uploaded_by   ON documents (uploaded_by);

CREATE INDEX idx_tasks_student_id        ON tasks (student_id);
CREATE INDEX idx_tasks_student_school_id ON tasks (student_school_id);
CREATE INDEX idx_tasks_due_date          ON tasks (due_date);
CREATE INDEX idx_tasks_status            ON tasks (status);
CREATE INDEX idx_tasks_priority          ON tasks (priority);

-- ─── Updated-at Triggers ────────────────────────────────────────────────────
-- Reuses the update_updated_at() function from 00001_initial_schema.sql

CREATE TRIGGER set_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- ─── Activities RLS ─────────────────────────────────────────────────────────

CREATE POLICY "activities_select_own"
  ON activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = activities.student_id
        AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "activities_insert_own"
  ON activities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = activities.student_id
        AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "activities_update_own"
  ON activities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = activities.student_id
        AND sp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = activities.student_id
        AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "activities_delete_own"
  ON activities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = activities.student_id
        AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "activities_select_coach"
  ON activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = activities.student_id
        AND sp.assigned_coach_id = auth.uid()
    )
  );

CREATE POLICY "activities_update_coach"
  ON activities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = activities.student_id
        AND sp.assigned_coach_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = activities.student_id
        AND sp.assigned_coach_id = auth.uid()
    )
  );

-- ─── Documents RLS ──────────────────────────────────────────────────────────

CREATE POLICY "documents_select_own"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = documents.student_id
        AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "documents_insert_own"
  ON documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = documents.student_id
        AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "documents_update_own"
  ON documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = documents.student_id
        AND sp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = documents.student_id
        AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "documents_delete_own"
  ON documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = documents.student_id
        AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "documents_select_coach"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = documents.student_id
        AND sp.assigned_coach_id = auth.uid()
    )
  );

CREATE POLICY "documents_insert_coach"
  ON documents FOR INSERT
  WITH CHECK (
    auth.uid() = documents.uploaded_by
    AND EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = documents.student_id
        AND sp.assigned_coach_id = auth.uid()
    )
  );

-- ─── Tasks RLS ──────────────────────────────────────────────────────────────

CREATE POLICY "tasks_select_own"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = tasks.student_id
        AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "tasks_insert_own"
  ON tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = tasks.student_id
        AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "tasks_update_own"
  ON tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = tasks.student_id
        AND sp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = tasks.student_id
        AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "tasks_delete_own"
  ON tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = tasks.student_id
        AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "tasks_select_coach"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = tasks.student_id
        AND sp.assigned_coach_id = auth.uid()
    )
  );

CREATE POLICY "tasks_insert_coach"
  ON tasks FOR INSERT
  WITH CHECK (
    auth.uid() = tasks.created_by
    AND EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = tasks.student_id
        AND sp.assigned_coach_id = auth.uid()
    )
  );

CREATE POLICY "tasks_update_coach"
  ON tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = tasks.student_id
        AND sp.assigned_coach_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      WHERE sp.id = tasks.student_id
        AND sp.assigned_coach_id = auth.uid()
    )
  );
