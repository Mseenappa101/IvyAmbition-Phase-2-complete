"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { OnboardingShell } from "./OnboardingShell";
import { ProfileStep } from "./steps/student/ProfileStep";
import { JourneyStep } from "./steps/student/JourneyStep";
import { AcademicStep } from "./steps/student/AcademicStep";
import { WelcomeStep } from "./steps/student/WelcomeStep";
import { useOnboardingStore } from "@/hooks/use-onboarding-store";
import { createClient } from "@/lib/supabase/client";
import { completeStudentOnboarding } from "@/lib/actions/onboarding";
import type { Profile, StudentProfile } from "@/types";

const STEPS = [
  { title: "Let\u2019s get to know you", subtitle: "Tell us a bit about yourself so we can personalize your experience." },
  { title: "Your admissions journey", subtitle: "Help us understand your goals so we can match you with the right coach." },
  { title: "Your academic profile", subtitle: "Share your academic background to help your coach prepare." },
  { title: "Welcome to IvyAmbition", subtitle: "You\u2019re all set! Here\u2019s a quick look at what\u2019s ahead." },
];

interface StudentOnboardingProps {
  profile: Profile;
  studentProfile: StudentProfile | null;
}

export function StudentOnboarding({
  profile,
  studentProfile,
}: StudentOnboardingProps) {
  const router = useRouter();
  const { currentStep, studentData, setStudentField, setSubmitting, reset } =
    useOnboardingStore();

  // Pre-fill from existing profile data
  useEffect(() => {
    if (profile.first_name) {
      setStudentField("preferredName", profile.first_name);
    }
    if (profile.phone) {
      setStudentField("phone", profile.phone);
    }
    if (studentProfile?.application_type) {
      setStudentField("applicationType", studentProfile.application_type);
    }
    if (studentProfile?.target_cycle) {
      setStudentField("targetCycle", studentProfile.target_cycle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleComplete = async () => {
    setSubmitting(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/auth/login";
        return;
      }

      // Upload avatar if provided (client-side, needs the File object)
      let avatarUrl: string | null = profile.avatar_url;
      if (studentData.avatarFile) {
        const ext = studentData.avatarFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, studentData.avatarFile, { upsert: true });

        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("avatars").getPublicUrl(path);
          avatarUrl = publicUrl;
        }
      }

      // Use server action with service role client for reliable DB writes
      // (bypasses RLS session issues that can cause silent update failures)
      const appType = studentData.applicationType || "undergraduate";
      const result = await completeStudentOnboarding({
        preferredName: studentData.preferredName.trim(),
        phone: studentData.phone.trim(),
        avatarUrl,
        applicationType: appType,
        targetCycle: studentData.targetCycle,
        currentSchool: studentData.currentSchool.trim() || null,
        gpa: studentData.gpa ? +studentData.gpa : null,
        satScore: studentData.satScore ? +studentData.satScore : null,
        actScore: studentData.actScore ? +studentData.actScore : null,
        intendedMajor: studentData.intendedMajor.trim() || null,
        lsatScore: studentData.lsatScore ? +studentData.lsatScore : null,
        workExperienceYears: studentData.workExperienceYears
          ? +studentData.workExperienceYears
          : null,
        firstYearGpa: studentData.firstYearGpa
          ? +studentData.firstYearGpa
          : null,
        classRank: studentData.classRank.trim() || null,
        originalLsatScore: studentData.originalLsatScore
          ? +studentData.originalLsatScore
          : null,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("Welcome aboard! Let\u2019s get started.");
      reset();
      // Full-page navigation to avoid router.refresh() race conditions
      window.location.href = "/student";
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
      setSubmitting(false);
    }
  };

  const step = STEPS[currentStep - 1];

  return (
    <OnboardingShell
      currentStep={currentStep}
      totalSteps={STEPS.length}
      stepTitle={step.title}
      stepSubtitle={step.subtitle}
    >
      {currentStep === 1 && <ProfileStep />}
      {currentStep === 2 && <JourneyStep />}
      {currentStep === 3 && <AcademicStep />}
      {currentStep === 4 && <WelcomeStep onComplete={handleComplete} />}
    </OnboardingShell>
  );
}
