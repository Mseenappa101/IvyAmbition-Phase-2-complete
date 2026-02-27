-- ============================================================================
-- Migration: School Management System
-- Description: Creates student_schools and school_requirements tables
--              for tracking school applications and their requirements.
-- ============================================================================

-- ─── Custom Enum Types ──────────────────────────────────────────────────────

CREATE TYPE application_status AS ENUM (
  'researching',
  'applying',
  'submitted',
  'accepted',
  'waitlisted',
  'rejected',
  'enrolled'
);

CREATE TYPE requirement_type AS ENUM (
  'transcript',
  'test_score',
  'essay',
  'recommendation',
  'resume',
  'application_form',
  'fee',
  'interview',
  'supplement',
  'other'
);

-- ─── Student Schools Table ──────────────────────────────────────────────────
-- Links a student to schools they are applying to, with status tracking.

CREATE TABLE student_schools (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  school_name       TEXT NOT NULL,
  school_slug       TEXT NOT NULL,
  application_type  application_type NOT NULL DEFAULT 'undergraduate',
  status            application_status NOT NULL DEFAULT 'researching',
  deadline          DATE,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_student_school UNIQUE (user_id, school_slug)
);

ALTER TABLE student_schools ENABLE ROW LEVEL SECURITY;

-- ─── School Requirements Table ──────────────────────────────────────────────
-- Checklist items for each school application.

CREATE TABLE school_requirements (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_school_id   UUID NOT NULL REFERENCES student_schools(id) ON DELETE CASCADE,
  requirement_type    requirement_type NOT NULL DEFAULT 'other',
  label               TEXT NOT NULL,
  is_completed        BOOLEAN NOT NULL DEFAULT false,
  file_url            TEXT,
  notes               TEXT,
  due_date            DATE,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE school_requirements ENABLE ROW LEVEL SECURITY;

-- ─── Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX idx_student_schools_user_id    ON student_schools (user_id);
CREATE INDEX idx_student_schools_status     ON student_schools (status);
CREATE INDEX idx_student_schools_deadline   ON student_schools (deadline);
CREATE INDEX idx_school_requirements_school ON school_requirements (student_school_id);
CREATE INDEX idx_school_requirements_type   ON school_requirements (requirement_type);

-- ─── Updated-at Triggers ────────────────────────────────────────────────────
-- Reuses the update_updated_at() function from 00001_initial_schema.sql

CREATE TRIGGER set_student_schools_updated_at
  BEFORE UPDATE ON student_schools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_school_requirements_updated_at
  BEFORE UPDATE ON school_requirements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- ─── Student Schools RLS ────────────────────────────────────────────────────

CREATE POLICY "student_schools_select_own"
  ON student_schools FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "student_schools_insert_own"
  ON student_schools FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "student_schools_update_own"
  ON student_schools FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "student_schools_delete_own"
  ON student_schools FOR DELETE
  USING (auth.uid() = user_id);

-- ─── School Requirements RLS ────────────────────────────────────────────────
-- Access via join to student_schools to verify ownership

CREATE POLICY "school_requirements_select_own"
  ON school_requirements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_schools ss
      WHERE ss.id = school_requirements.student_school_id
        AND ss.user_id = auth.uid()
    )
  );

CREATE POLICY "school_requirements_insert_own"
  ON school_requirements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_schools ss
      WHERE ss.id = school_requirements.student_school_id
        AND ss.user_id = auth.uid()
    )
  );

CREATE POLICY "school_requirements_update_own"
  ON school_requirements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_schools ss
      WHERE ss.id = school_requirements.student_school_id
        AND ss.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_schools ss
      WHERE ss.id = school_requirements.student_school_id
        AND ss.user_id = auth.uid()
    )
  );

CREATE POLICY "school_requirements_delete_own"
  ON school_requirements FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM student_schools ss
      WHERE ss.id = school_requirements.student_school_id
        AND ss.user_id = auth.uid()
    )
  );
