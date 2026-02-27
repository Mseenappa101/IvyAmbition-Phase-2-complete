import type { ApplicationType } from "@/types";

type Errors = Record<string, string>;

// ─── Student Validations ────────────────────────────────────────────────────

export function validateStudentStep1(data: {
  preferredName: string;
  phone: string;
}): Errors {
  const errors: Errors = {};
  if (!data.preferredName.trim())
    errors.preferredName = "Please enter your preferred name";
  if (data.phone && !/^\+?[\d\s\-()]{7,15}$/.test(data.phone))
    errors.phone = "Please enter a valid phone number";
  return errors;
}

export function validateStudentStep2(data: {
  applicationType: ApplicationType | null;
  targetCycle: string;
}): Errors {
  const errors: Errors = {};
  if (!data.applicationType)
    errors.applicationType = "Please select an application type";
  if (!data.targetCycle) errors.targetCycle = "Please select a target cycle";
  return errors;
}

export function validateStudentStep3(
  data: Record<string, string>,
  applicationType: ApplicationType
): Errors {
  const errors: Errors = {};

  if (applicationType === "undergraduate") {
    if (!data.currentSchool?.trim())
      errors.currentSchool = "High school name is required";
    if (
      data.gpa &&
      (isNaN(+data.gpa) || +data.gpa < 0 || +data.gpa > 5.0)
    )
      errors.gpa = "GPA must be between 0 and 5.0";
    if (
      data.satScore &&
      (isNaN(+data.satScore) || +data.satScore < 400 || +data.satScore > 1600)
    )
      errors.satScore = "SAT score must be between 400 and 1600";
    if (
      data.actScore &&
      (isNaN(+data.actScore) || +data.actScore < 1 || +data.actScore > 36)
    )
      errors.actScore = "ACT score must be between 1 and 36";
  }

  if (applicationType === "law_school") {
    if (!data.currentSchool?.trim())
      errors.currentSchool = "Undergraduate institution is required";
    if (
      data.gpa &&
      (isNaN(+data.gpa) || +data.gpa < 0 || +data.gpa > 4.0)
    )
      errors.gpa = "GPA must be between 0 and 4.0";
    if (
      data.lsatScore &&
      (isNaN(+data.lsatScore) ||
        +data.lsatScore < 120 ||
        +data.lsatScore > 180)
    )
      errors.lsatScore = "LSAT score must be between 120 and 180";
    if (
      data.workExperienceYears &&
      (isNaN(+data.workExperienceYears) || +data.workExperienceYears < 0)
    )
      errors.workExperienceYears = "Please enter a valid number";
  }

  if (applicationType === "transfer") {
    if (!data.currentSchool?.trim())
      errors.currentSchool = "Current law school is required";
    if (
      data.firstYearGpa &&
      (isNaN(+data.firstYearGpa) ||
        +data.firstYearGpa < 0 ||
        +data.firstYearGpa > 4.0)
    )
      errors.firstYearGpa = "1L GPA must be between 0 and 4.0";
    if (
      data.originalLsatScore &&
      (isNaN(+data.originalLsatScore) ||
        +data.originalLsatScore < 120 ||
        +data.originalLsatScore > 180)
    )
      errors.originalLsatScore = "LSAT score must be between 120 and 180";
  }

  return errors;
}

// ─── Coach Validations ──────────────────────────────────────────────────────

export function validateCoachStep1(data: {
  bio: string;
  phone: string;
}): Errors {
  const errors: Errors = {};
  if (!data.bio.trim()) errors.bio = "Please write a short bio";
  if (data.phone && !/^\+?[\d\s\-()]{7,15}$/.test(data.phone))
    errors.phone = "Please enter a valid phone number";
  return errors;
}

export function validateCoachStep2(data: {
  specializations: string[];
  maxStudents: string;
}): Errors {
  const errors: Errors = {};
  if (data.specializations.length === 0)
    errors.specializations = "Please select at least one specialization";
  if (!data.maxStudents || isNaN(+data.maxStudents) || +data.maxStudents < 1)
    errors.maxStudents = "Please enter a valid capacity (minimum 1)";
  if (+data.maxStudents > 50)
    errors.maxStudents = "Maximum capacity is 50 students";
  return errors;
}
