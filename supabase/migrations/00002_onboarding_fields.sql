-- ============================================================================
-- Migration: Add onboarding fields
-- Description: Adds onboarding_completed to coach_profiles and additional
--              academic fields to student_profiles for the onboarding flow.
-- ============================================================================

-- Add onboarding_completed flag to coach_profiles (mirrors student_profiles)
ALTER TABLE coach_profiles
  ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- Add additional academic profile fields to student_profiles
-- current_school already exists and will serve as:
--   - high school name (undergraduate)
--   - undergraduate institution (law school)
--   - current law school (transfer)
ALTER TABLE student_profiles ADD COLUMN intended_major TEXT;
ALTER TABLE student_profiles ADD COLUMN work_experience_years INTEGER;
ALTER TABLE student_profiles ADD COLUMN class_rank TEXT;
