import { create } from "zustand";
import type { ApplicationType } from "@/types";

// ─── Student Onboarding Data ────────────────────────────────────────────────

export interface StudentOnboardingData {
  // Step 1 — Profile
  preferredName: string;
  phone: string;
  avatarFile: File | null;
  avatarPreview: string | null;
  // Step 2 — Journey
  applicationType: ApplicationType | null;
  targetCycle: string;
  // Step 3 — Academic (shared)
  currentSchool: string;
  gpa: string;
  // Step 3 — Undergraduate
  satScore: string;
  actScore: string;
  intendedMajor: string;
  // Step 3 — Law School
  lsatScore: string;
  workExperienceYears: string;
  // Step 3 — Transfer
  firstYearGpa: string;
  classRank: string;
  originalLsatScore: string;
}

const initialStudentData: StudentOnboardingData = {
  preferredName: "",
  phone: "",
  avatarFile: null,
  avatarPreview: null,
  applicationType: null,
  targetCycle: "",
  currentSchool: "",
  gpa: "",
  satScore: "",
  actScore: "",
  intendedMajor: "",
  lsatScore: "",
  workExperienceYears: "",
  firstYearGpa: "",
  classRank: "",
  originalLsatScore: "",
};

// ─── Coach Onboarding Data ──────────────────────────────────────────────────

export interface CoachOnboardingData {
  phone: string;
  bio: string;
  avatarFile: File | null;
  avatarPreview: string | null;
  specializations: string[];
  maxStudents: string;
}

const initialCoachData: CoachOnboardingData = {
  phone: "",
  bio: "",
  avatarFile: null,
  avatarPreview: null,
  specializations: [],
  maxStudents: "10",
};

// ─── Store ──────────────────────────────────────────────────────────────────

interface OnboardingState {
  currentStep: number;
  studentData: StudentOnboardingData;
  coachData: CoachOnboardingData;
  errors: Record<string, string>;
  isSubmitting: boolean;

  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  setStudentField: <K extends keyof StudentOnboardingData>(
    field: K,
    value: StudentOnboardingData[K]
  ) => void;
  setCoachField: <K extends keyof CoachOnboardingData>(
    field: K,
    value: CoachOnboardingData[K]
  ) => void;
  setErrors: (errors: Record<string, string>) => void;
  clearErrors: () => void;
  setSubmitting: (submitting: boolean) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: 1,
  studentData: { ...initialStudentData },
  coachData: { ...initialCoachData },
  errors: {},
  isSubmitting: false,

  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1, errors: {} })),
  prevStep: () =>
    set((s) => ({ currentStep: Math.max(1, s.currentStep - 1), errors: {} })),
  goToStep: (step) => set({ currentStep: step, errors: {} }),

  setStudentField: (field, value) =>
    set((s) => {
      const { [field]: _, ...restErrors } = s.errors;
      return {
        studentData: { ...s.studentData, [field]: value },
        errors: restErrors,
      };
    }),

  setCoachField: (field, value) =>
    set((s) => {
      const { [field]: _, ...restErrors } = s.errors;
      return {
        coachData: { ...s.coachData, [field]: value },
        errors: restErrors,
      };
    }),

  setErrors: (errors) => set({ errors }),
  clearErrors: () => set({ errors: {} }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  reset: () =>
    set({
      currentStep: 1,
      studentData: { ...initialStudentData },
      coachData: { ...initialCoachData },
      errors: {},
      isSubmitting: false,
    }),
}));
