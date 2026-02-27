"use client";

import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { OnboardingShell } from "./OnboardingShell";
import { CoachProfileStep } from "./steps/coach/CoachProfileStep";
import { SpecializationsStep } from "./steps/coach/SpecializationsStep";
import { CoachWelcomeStep } from "./steps/coach/CoachWelcomeStep";
import { useOnboardingStore } from "@/hooks/use-onboarding-store";
import { createClient } from "@/lib/supabase/client";
import { completeCoachOnboarding } from "@/lib/actions/onboarding";
import type { Profile, CoachProfile } from "@/types";

const STEPS = [
  { title: "Set up your profile", subtitle: "Help students get to know you before their first session." },
  { title: "Your expertise", subtitle: "Tell us what you specialize in so we can match you with the right students." },
  { title: "Welcome to IvyAmbition", subtitle: "You\u2019re all set! Here\u2019s what\u2019s ahead." },
];

interface CoachOnboardingProps {
  profile: Profile;
  coachProfile: CoachProfile | null;
}

export function CoachOnboarding({
  profile,
  coachProfile,
}: CoachOnboardingProps) {
  const { currentStep, coachData, setCoachField, setSubmitting, reset } =
    useOnboardingStore();

  // Pre-fill from existing data
  useEffect(() => {
    if (profile.phone) {
      setCoachField("phone", profile.phone);
    }
    if (coachProfile?.bio) {
      setCoachField("bio", coachProfile.bio);
    }
    if (coachProfile?.specializations?.length) {
      setCoachField("specializations", coachProfile.specializations);
    }
    if (coachProfile?.max_students) {
      setCoachField("maxStudents", String(coachProfile.max_students));
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
      if (coachData.avatarFile) {
        const ext = coachData.avatarFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, coachData.avatarFile, { upsert: true });

        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("avatars").getPublicUrl(path);
          avatarUrl = publicUrl;
        }
      }

      // Use server action with service role client for reliable DB writes
      const result = await completeCoachOnboarding({
        phone: coachData.phone.trim(),
        bio: coachData.bio.trim(),
        avatarUrl,
        specializations: coachData.specializations,
        maxStudents: parseInt(coachData.maxStudents, 10),
      });

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("Welcome aboard, Coach!");
      reset();
      // Full-page navigation to avoid router.refresh() race conditions
      window.location.href = "/coach";
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
      {currentStep === 1 && <CoachProfileStep />}
      {currentStep === 2 && <SpecializationsStep />}
      {currentStep === 3 && <CoachWelcomeStep onComplete={handleComplete} />}
    </OnboardingShell>
  );
}
