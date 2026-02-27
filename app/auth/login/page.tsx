"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui";
import type { UserRole } from "@/types";

function getDashboardRoute(role: UserRole): string {
  switch (role) {
    case "admin":
      return ROUTES.dashboard.admin;
    case "coach":
      return ROUTES.dashboard.coach;
    default:
      return ROUTES.dashboard.student;
  }
}

export default function LoginPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // If already logged in, redirect to dashboard
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const role = (user.user_metadata?.role as string) || "student";
        window.location.href = getDashboardRoute(role as UserRole);
        return;
      }
      setCheckingSession(false);
    };
    checkSession();
  }, []);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Please enter a valid email";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!validate()) return;

    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(
        error.message === "Invalid login credentials"
          ? "Incorrect email or password. Please try again."
          : error.message
      );
      setLoading(false);
      return;
    }

    // Fetch user role from profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const role = (profile?.role as UserRole) || "student";

    // Check onboarding status before redirecting.
    // Use window.location.href for post-auth redirects to avoid a race
    // where router.refresh() on /auth/login triggers a middleware redirect
    // to the dashboard before router.push() completes.
    if (role === "student") {
      const { data: sp } = await supabase
        .from("student_profiles")
        .select("onboarding_completed")
        .eq("user_id", data.user.id)
        .single();
      if (!sp?.onboarding_completed) {
        toast.success("Let's finish setting up your profile!");
        window.location.href = "/student-onboarding";
        return;
      }
    }

    if (role === "coach") {
      const { data: cp } = await supabase
        .from("coach_profiles")
        .select("onboarding_completed")
        .eq("user_id", data.user.id)
        .single();
      if (!cp?.onboarding_completed) {
        toast.success("Let's finish setting up your profile!");
        window.location.href = "/coach-onboarding";
        return;
      }
    }

    const destination = getDashboardRoute(role);
    toast.success("Welcome back!");
    window.location.href = destination;
  };

  if (checkingSession) {
    return null;
  }

  return (
    <div>
      <h1 className="font-serif text-display text-navy-900">Welcome back</h1>
      <p className="mt-2 font-sans text-body text-charcoal-400">
        Sign in to continue your admissions journey.
      </p>

      <form onSubmit={handleLogin} className="mt-8 space-y-5">
        {/* Email */}
        <div>
          <label
            htmlFor="login-email"
            className="mb-1.5 block font-sans text-body-sm font-medium text-charcoal-700"
          >
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => {
              setTouched((prev) => ({ ...prev, email: true }));
              validate();
            }}
            placeholder="you@example.com"
            autoComplete="email"
            className={cn(
              "w-full rounded-lg border bg-white px-4 py-3 font-sans text-body text-charcoal-900 shadow-inner-soft transition-all duration-200 placeholder:text-charcoal-300 focus:outline-none focus:ring-2 focus:ring-gold-400/20",
              touched.email && errors.email
                ? "border-burgundy-500 focus:border-burgundy-500"
                : "border-ivory-400 focus:border-gold-400"
            )}
          />
          {touched.email && errors.email && (
            <p className="mt-1.5 flex items-center gap-1 font-sans text-caption text-burgundy-500">
              <AlertCircle className="h-3 w-3" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="block font-sans text-body-sm font-medium text-charcoal-700"
            >
              Password
            </label>
            <Link
              href={ROUTES.auth.forgotPassword}
              className="font-sans text-caption font-medium text-gold-600 transition-colors hover:text-gold-500"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, password: true }));
                validate();
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
              className={cn(
                "w-full rounded-lg border bg-white px-4 py-3 pr-12 font-sans text-body text-charcoal-900 shadow-inner-soft transition-all duration-200 placeholder:text-charcoal-300 focus:outline-none focus:ring-2 focus:ring-gold-400/20",
                touched.password && errors.password
                  ? "border-burgundy-500 focus:border-burgundy-500"
                  : "border-ivory-400 focus:border-gold-400"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 transition-colors hover:text-charcoal-600"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {touched.password && errors.password && (
            <p className="mt-1.5 flex items-center gap-1 font-sans text-caption text-burgundy-500">
              <AlertCircle className="h-3 w-3" />
              {errors.password}
            </p>
          )}
        </div>

        {/* Remember Me */}
        <label className="flex cursor-pointer items-center gap-2.5">
          <button
            type="button"
            role="checkbox"
            aria-checked={rememberMe}
            onClick={() => setRememberMe(!rememberMe)}
            className={cn(
              "flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-colors",
              "h-[18px] w-[18px]",
              rememberMe
                ? "border-gold-500 bg-gold-500"
                : "border-charcoal-300 bg-white hover:border-gold-400"
            )}
          >
            {rememberMe && <Check className="h-3 w-3 text-white" />}
          </button>
          <span className="font-sans text-body-sm text-charcoal-600">
            Remember me for 30 days
          </span>
        </label>

        {/* Submit */}
        <Button
          type="submit"
          loading={loading}
          fullWidth
          icon={<LogIn className="h-4 w-4" />}
          size="lg"
        >
          Sign In
        </Button>
      </form>

      <p className="mt-8 text-center font-sans text-body-sm text-charcoal-400">
        Don&apos;t have an account?{" "}
        <Link
          href={ROUTES.auth.register}
          className="font-medium text-gold-600 transition-colors hover:text-gold-500"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 3L4.5 8.5L2 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
