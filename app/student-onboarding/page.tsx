"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { StudentOnboarding } from "@/components/onboarding/StudentOnboarding";
import type { Profile, StudentProfile } from "@/types";

export default function StudentOnboardingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(
    null
  );

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      // Use getSession() to read the session from cookies — this establishes
      // the auth context that RLS queries need. getUser() hits the network
      // and can fail if the token needs refreshing, but getSession() reads
      // directly from the cookie/storage.
      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log("[student-onboarding] session:", session ? "exists" : "null");

      if (!session) {
        console.log("[student-onboarding] No session found");
        setError("not_authenticated");
        setLoading(false);
        return;
      }

      const user = session.user;
      console.log("[student-onboarding] User ID:", user.id);
      console.log("[student-onboarding] User email:", user.email);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      console.log("[student-onboarding] Profile query:", {
        data: profileData ? { role: profileData.role, email: profileData.email } : null,
        error: profileError?.message ?? null,
      });

      // Profile missing or RLS blocked — try to create
      if (!profileData) {
        console.log("[student-onboarding] Profile not found, attempting insert");
        const { data: created, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email!,
            first_name: (user.user_metadata?.first_name as string) || "",
            last_name: (user.user_metadata?.last_name as string) || "",
            role: "student" as const,
          })
          .select()
          .single();
        console.log("[student-onboarding] Profile insert:", {
          data: created ? "ok" : "null",
          error: insertError?.message ?? null,
        });

        if (!created) {
          console.log("[student-onboarding] ERROR: Cannot read or create profile");
          setError("wrong_role");
          setLoading(false);
          return;
        }

        setProfile(created as Profile);
      } else {
        console.log("[student-onboarding] Profile role:", profileData.role);
        setProfile(profileData as Profile);
      }

      // Fetch student profile
      const { data: spData, error: spError } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      console.log("[student-onboarding] Student profile query:", {
        found: !!spData,
        error: spError?.message ?? null,
        onboarding_completed: spData?.onboarding_completed ?? "N/A",
      });

      let studentProfileData = spData;
      if (!studentProfileData) {
        console.log("[student-onboarding] Student profile not found, inserting");
        const { data: created, error: insertError } = await supabase
          .from("student_profiles")
          .insert({ user_id: user.id })
          .select()
          .single();
        console.log("[student-onboarding] Student profile insert:", {
          data: created ? "ok" : "null",
          error: insertError?.message ?? null,
        });
        studentProfileData = created;
      }

      // Already completed — go to dashboard
      if (studentProfileData?.onboarding_completed) {
        console.log("[student-onboarding] Already completed, navigating to /student");
        window.location.href = "/student";
        return;
      }

      setStudentProfile(studentProfileData as StudentProfile | null);
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

  return <StudentOnboarding profile={profile} studentProfile={studentProfile} />;
}
