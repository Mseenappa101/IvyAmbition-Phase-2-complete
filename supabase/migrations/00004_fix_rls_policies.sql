-- ============================================================================
-- Migration: Fix RLS policies
-- Description: Drop all existing RLS policies and recreate with simple,
--              working policies that allow users to manage their own data.
-- ============================================================================

-- ─── Drop ALL existing policies on profiles ─────────────────────────────────
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Coaches can read assigned student profiles" ON profiles;
DROP POLICY IF EXISTS "Students can read assigned coach profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

-- ─── Drop ALL existing policies on student_profiles ─────────────────────────
DROP POLICY IF EXISTS "Students can read own student profile" ON student_profiles;
DROP POLICY IF EXISTS "Students can update own student profile" ON student_profiles;
DROP POLICY IF EXISTS "Coaches can read assigned student profiles detail" ON student_profiles;
DROP POLICY IF EXISTS "Admins can read all student profiles" ON student_profiles;
DROP POLICY IF EXISTS "Admins can update all student profiles" ON student_profiles;
DROP POLICY IF EXISTS "Service role can insert student profiles" ON student_profiles;

-- ─── Drop ALL existing policies on coach_profiles ───────────────────────────
DROP POLICY IF EXISTS "Coaches can read own coach profile" ON coach_profiles;
DROP POLICY IF EXISTS "Coaches can update own coach profile" ON coach_profiles;
DROP POLICY IF EXISTS "Students can read assigned coach details" ON coach_profiles;
DROP POLICY IF EXISTS "Admins can read all coach profiles" ON coach_profiles;
DROP POLICY IF EXISTS "Admins can update all coach profiles" ON coach_profiles;
DROP POLICY IF EXISTS "Service role can insert coach profiles" ON coach_profiles;

-- ─── Ensure RLS is enabled ──────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES — users manage their own row (id = auth.uid())
-- ============================================================================

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- STUDENT_PROFILES — users manage their own row (user_id = auth.uid())
-- ============================================================================

CREATE POLICY "student_profiles_select_own"
  ON student_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "student_profiles_insert_own"
  ON student_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "student_profiles_update_own"
  ON student_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- COACH_PROFILES — users manage their own row (user_id = auth.uid())
-- ============================================================================

CREATE POLICY "coach_profiles_select_own"
  ON coach_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "coach_profiles_insert_own"
  ON coach_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "coach_profiles_update_own"
  ON coach_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
