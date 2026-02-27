"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { useAppStore } from "@/hooks/use-store";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const { setProfile } = useAppStore();

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/auth/login";
        return;
      }

      const role = (user.user_metadata?.role as string) || "student";

      if (role !== "admin") {
        window.location.href =
          role === "coach" ? "/coach" : "/student";
        return;
      }

      // Set profile in store for header display
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setProfile(profile);
      }

      setReady(true);
    };

    check();
  }, [setProfile]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-charcoal-900">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
          <p className="mt-4 font-sans text-body-sm text-ivory-600">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return <DashboardShell role="admin">{children}</DashboardShell>;
}
