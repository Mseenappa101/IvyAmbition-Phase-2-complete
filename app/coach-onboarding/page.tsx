"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CoachOnboarding } from "@/components/onboarding/CoachOnboarding";
import type { Profile, CoachProfile } from "@/types";

export default function CoachOnboardingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [coachProfile, setCoachProfile] = useState<CoachProfile | null>(null);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log("[coach-onboarding] session:", session ? "exists" : "null");

      if (!session) {
        setError("not_authenticated");
        setLoading(false);
        return;
      }

      const user = session.user;
      console.log("[coach-onboarding] User ID:", user.id);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      console.log("[coach-onboarding] Profile query:", {
        data: profileData ? { role: profileData.role } : null,
        error: profileError?.message ?? null,
      });

      if (!profileData) {
        console.log("[coach-onboarding] Profile not found, attempting insert");
        const { data: created, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email!,
            first_name: (user.user_metadata?.first_name as string) || "",
            last_name: (user.user_metadata?.last_name as string) || "",
            role: "coach" as const,
          })
          .select()
          .single();
        console.log("[coach-onboarding] Profile insert:", {
          data: created ? "ok" : "null",
          error: insertError?.message ?? null,
        });

        if (!created) {
          setError("wrong_role");
          setLoading(false);
          return;
        }

        setProfile(created as Profile);
      } else {
        setProfile(profileData as Profile);
      }

      // Fetch coach profile
      const { data: cpData, error: cpError } = await supabase
        .from("coach_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      console.log("[coach-onboarding] Coach profile query:", {
        found: !!cpData,
        error: cpError?.message ?? null,
      });

      let coachProfileData = cpData;
      if (!coachProfileData) {
        const { data: created, error: insertError } = await supabase
          .from("coach_profiles")
          .insert({ user_id: user.id })
          .select()
          .single();
        console.log("[coach-onboarding] Coach profile insert:", {
          data: created ? "ok" : "null",
          error: insertError?.message ?? null,
        });
        coachProfileData = created;
      }

      if (coachProfileData?.onboarding_completed) {
        window.location.href = "/coach";
        return;
      }

      setCoachProfile(coachProfileData as CoachProfile | null);
      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
          <p className="mt-4 font-sans text-body-sm text-charcoal-400">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (error === "not_authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50">
        <div className="text-center">
          <h1 className="font-serif text-heading-lg text-navy-900">
            Session expired
          </h1>
          <p className="mt-2 font-sans text-body text-charcoal-400">
            Please log in to continue setting up your profile.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-block rounded-lg bg-gold-500 px-6 py-3 font-sans text-body-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50">
        <div className="text-center">
          <h1 className="font-serif text-heading-lg text-navy-900">
            Something went wrong
          </h1>
          <p className="mt-2 font-sans text-body text-charcoal-400">
            Could not load your profile. Please try refreshing or contact support.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-block rounded-lg bg-gold-500 px-6 py-3 font-sans text-body-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return <CoachOnboarding profile={profile} coachProfile={coachProfile} />;
}
