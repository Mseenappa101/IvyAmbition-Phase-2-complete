-- ============================================================================
-- IvyAmbition — Initial Database Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- ─── Custom Enum Types ──────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('student', 'coach', 'admin');
CREATE TYPE application_type AS ENUM ('undergraduate', 'law_school', 'transfer');
CREATE TYPE student_status AS ENUM ('onboarding', 'active', 'paused', 'completed');

-- ─── Profiles Table ─────────────────────────────────────────────────────────
-- One row per authenticated user. Created automatically via trigger on signup.

CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  first_name  TEXT NOT NULL DEFAULT '',
  last_name   TEXT NOT NULL DEFAULT '',
  role        user_role NOT NULL DEFAULT 'student',
  avatar_url  TEXT,
  phone       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ─── Student Profiles Table ─────────────────────────────────────────────────

CREATE TABLE student_profiles (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_coach_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  application_type      application_type NOT NULL DEFAULT 'undergraduate',
  target_cycle          TEXT NOT NULL DEFAULT '',
  current_school        TEXT,
  current_gpa           DECIMAL(4, 2),
  lsat_score            INTEGER CHECK (lsat_score IS NULL OR (lsat_score >= 120 AND lsat_score <= 180)),
  sat_score             INTEGER CHECK (sat_score IS NULL OR (sat_score >= 400 AND sat_score <= 1600)),
  act_score             INTEGER CHECK (act_score IS NULL OR (act_score >= 1 AND act_score <= 36)),
  status                student_status NOT NULL DEFAULT 'onboarding',
  onboarding_completed  BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_student_user   UNIQUE (user_id),
  CONSTRAINT fk_coach_is_coach CHECK (assigned_coach_id IS NULL OR assigned_coach_id != user_id)
);

ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- ─── Coach Profiles Table ───────────────────────────────────────────────────

CREATE TABLE coach_profiles (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bio                   TEXT,
  specializations       TEXT[] NOT NULL DEFAULT '{}',
  max_students          INTEGER NOT NULL DEFAULT 15,
  active_student_count  INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_coach_user UNIQUE (user_id)
);

ALTER TABLE coach_profiles ENABLE ROW LEVEL SECURITY;

-- ─── Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX idx_profiles_role            ON profiles (role);
CREATE INDEX idx_profiles_email           ON profiles (email);
CREATE INDEX idx_student_profiles_coach   ON student_profiles (assigned_coach_id);
CREATE INDEX idx_student_profiles_status  ON student_profiles (status);
CREATE INDEX idx_coach_profiles_user      ON coach_profiles (user_id);

-- ─── Updated-at Trigger Function ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_student_profiles_updated_at
  BEFORE UPDATE ON student_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_coach_profiles_updated_at
  BEFORE UPDATE ON coach_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- ─── Profiles RLS ───────────────────────────────────────────────────────────

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Coaches can read profiles of their assigned students
CREATE POLICY "Coaches can read assigned student profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS coach
      WHERE coach.id = auth.uid()
        AND coach.role = 'coach'
    )
    AND EXISTS (
      SELECT 1 FROM student_profiles AS sp
      WHERE sp.user_id = profiles.id
        AND sp.assigned_coach_id = auth.uid()
    )
  );

-- Students can read their assigned coach's profile
CREATE POLICY "Students can read assigned coach profile"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles AS sp
      WHERE sp.user_id = auth.uid()
        AND sp.assigned_coach_id = profiles.id
    )
  );

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS admin
      WHERE admin.id = auth.uid()
        AND admin.role = 'admin'
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS admin
      WHERE admin.id = auth.uid()
        AND admin.role = 'admin'
    )
  );

-- ─── Student Profiles RLS ───────────────────────────────────────────────────

-- Students can read their own student profile
CREATE POLICY "Students can read own student profile"
  ON student_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Students can update their own student profile
CREATE POLICY "Students can update own student profile"
  ON student_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Coaches can read student profiles assigned to them
CREATE POLICY "Coaches can read assigned student profiles detail"
  ON student_profiles FOR SELECT
  USING (auth.uid() = assigned_coach_id);

-- Admins can read all student profiles
CREATE POLICY "Admins can read all student profiles"
  ON student_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS admin
      WHERE admin.id = auth.uid()
        AND admin.role = 'admin'
    )
  );

-- Admins can update all student profiles
CREATE POLICY "Admins can update all student profiles"
  ON student_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS admin
      WHERE admin.id = auth.uid()
        AND admin.role = 'admin'
    )
  );

-- ─── Coach Profiles RLS ─────────────────────────────────────────────────────

-- Coaches can read their own coach profile
CREATE POLICY "Coaches can read own coach profile"
  ON coach_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Coaches can update their own coach profile
CREATE POLICY "Coaches can update own coach profile"
  ON coach_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Students can read their assigned coach's coach profile
CREATE POLICY "Students can read assigned coach details"
  ON coach_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles AS sp
      WHERE sp.user_id = auth.uid()
        AND sp.assigned_coach_id = coach_profiles.user_id
    )
  );

-- Admins can read all coach profiles
CREATE POLICY "Admins can read all coach profiles"
  ON coach_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS admin
      WHERE admin.id = auth.uid()
        AND admin.role = 'admin'
    )
  );

-- Admins can update all coach profiles
CREATE POLICY "Admins can update all coach profiles"
  ON coach_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS admin
      WHERE admin.id = auth.uid()
        AND admin.role = 'admin'
    )
  );

-- ============================================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _first_name TEXT;
  _last_name  TEXT;
  _role       public.user_role;
BEGIN
  -- Extract name from metadata (set during signUp options.data)
  _first_name := COALESCE(
    NEW.raw_user_meta_data ->> 'first_name',
    split_part(COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''), ' ', 1),
    ''
  );
  _last_name := COALESCE(
    NEW.raw_user_meta_data ->> 'last_name',
    NULLIF(split_part(COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''), ' ', 2), ''),
    ''
  );

  -- Allow role to be set via metadata, default to 'student'
  _role := COALESCE(
    NULLIF(NEW.raw_user_meta_data ->> 'role', '')::public.user_role,
    'student'
  );

  -- Insert into profiles
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (NEW.id, NEW.email, _first_name, _last_name, _role);

  -- Auto-create the role-specific profile
  IF _role = 'student' THEN
    INSERT INTO public.student_profiles (user_id)
    VALUES (NEW.id);
  ELSIF _role = 'coach' THEN
    INSERT INTO public.coach_profiles (user_id)
    VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

-- Fire after a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- Allow profiles to be inserted by the trigger (runs as SECURITY DEFINER)
-- ============================================================================

CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can insert student profiles"
  ON student_profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can insert coach profiles"
  ON coach_profiles FOR INSERT
  WITH CHECK (true);
