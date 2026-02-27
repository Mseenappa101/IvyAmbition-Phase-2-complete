import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();

    // Create Supabase client inline (NOT using the shared createClient from
    // server.ts) so we avoid the try/catch around setAll that silently
    // swallows cookie-write failures in Route Handlers.
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // If redirecting to password reset, go there directly
      if (next === "/auth/reset-password") {
        return NextResponse.redirect(`${origin}${next}`);
      }

      // Fetch role and check onboarding before redirecting
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const role = (profile as { role: string } | null)?.role || "student";

        // Check onboarding status for student/coach
        if (role === "student") {
          const { data: sp } = await supabase
            .from("student_profiles")
            .select("onboarding_completed")
            .eq("user_id", user.id)
            .single();
          if (
            !(sp as { onboarding_completed: boolean } | null)
              ?.onboarding_completed
          ) {
            return NextResponse.redirect(`${origin}/student-onboarding`);
          }
        }

        if (role === "coach") {
          const { data: cp } = await supabase
            .from("coach_profiles")
            .select("onboarding_completed")
            .eq("user_id", user.id)
            .single();
          if (
            !(cp as { onboarding_completed: boolean } | null)
              ?.onboarding_completed
          ) {
            return NextResponse.redirect(`${origin}/coach-onboarding`);
          }
        }

        const dashboard =
          role === "admin"
            ? "/admin"
            : role === "coach"
              ? "/coach"
              : "/student";

        return NextResponse.redirect(`${origin}${dashboard}`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If code exchange failed, redirect to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`);
}
