"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Eye,
  EyeOff,
  UserPlus,
  Check,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui";

type SelectedRole = "student" | "coach";

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
}

function validateForm(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  confirmPassword: string,
  role: SelectedRole | null
): FormErrors {
  const errors: FormErrors = {};

  if (!firstName.trim()) errors.firstName = "First name is required";
  if (!lastName.trim()) errors.lastName = "Last name is required";

  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  } else if (!/[A-Z]/.test(password)) {
    errors.password = "Password must contain at least one uppercase letter";
  } else if (!/[0-9]/.test(password)) {
    errors.password = "Password must contain at least one number";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (!role) errors.role = "Please select a role";

  return errors;
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
  ];

  if (!password) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
      {checks.map((check) => (
        <span
          key={check.label}
          className={cn(
            "inline-flex items-center gap-1 font-sans text-caption",
            check.met ? "text-emerald-600" : "text-charcoal-400"
          )}
        >
          {check.met ? (
            <Check className="h-3 w-3" />
          ) : (
            <span className="h-3 w-3 rounded-full border border-charcoal-300" />
          )}
          {check.label}
        </span>
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<SelectedRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
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
        const dashboard =
          role === "admin" ? "/admin" : role === "coach" ? "/coach" : "/student";
        window.location.href = dashboard;
        return;
      }
      setCheckingSession(false);
    };
    checkSession();
  }, []);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const newErrors = validateForm(
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      selectedRole
    );
    setErrors(newErrors);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const formErrors = validateForm(
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      selectedRole
    );
    setErrors(formErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
      role: true,
    });

    if (Object.keys(formErrors).length > 0) return;

    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          role: selectedRole,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // If a session was returned, email confirmation is disabled —
    // the user is already authenticated, send them to onboarding.
    // Use window.location.href (full navigation) instead of router.push()
    // to avoid a race where router.refresh() on the auth page triggers
    // a middleware redirect to the dashboard before the push completes.
    if (data.session) {
      toast.success("Account created! Let's set up your profile.");
      const dest =
        selectedRole === "coach" ? "/coach-onboarding" : "/student-onboarding";
      window.location.href = dest;
      return;
    }

    // No session means email confirmation is required
    toast.success("Account created! Please check your email to verify.");
    window.location.href = ROUTES.auth.login;
  };

  const roleCards: {
    role: SelectedRole;
    icon: typeof GraduationCap;
    title: string;
    description: string;
  }[] = [
    {
      role: "student",
      icon: GraduationCap,
      title: "I'm a Student",
      description:
        "Get matched with expert coaches to guide your admissions journey",
    },
    {
      role: "coach",
      icon: BookOpen,
      title: "I'm a Counselor",
      description:
        "Join our network and help students achieve their academic goals",
    },
  ];

  if (checkingSession) {
    return null;
  }

  return (
    <div>
      <h1 className="font-serif text-display text-navy-900">
        Begin your journey
      </h1>
      <p className="mt-2 font-sans text-body text-charcoal-400">
        Create your account to get started with expert admissions coaching.
      </p>

      <form onSubmit={handleRegister} className="mt-8 space-y-5">
        {/* Role Selection Cards */}
        <div>
          <p className="mb-3 font-sans text-body-sm font-medium text-charcoal-700">
            I want to join as...
          </p>
          <div className="grid grid-cols-2 gap-3">
            {roleCards.map((card) => {
              const isSelected = selectedRole === card.role;
              return (
                <button
                  key={card.role}
                  type="button"
                  onClick={() => {
                    setSelectedRole(card.role);
                    setTouched((prev) => ({ ...prev, role: true }));
                    setErrors((prev) => ({ ...prev, role: undefined }));
                  }}
                  className={cn(
                    "group relative flex flex-col items-center rounded-xl border-2 p-5 text-center transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2",
                    isSelected
                      ? "border-gold-500 bg-gold-50 shadow-gold-glow"
                      : "border-ivory-400 bg-white hover:border-gold-300 hover:bg-cream-50"
                  )}
                >
                  {isSelected && (
                    <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500">
                      <Check className="h-3 w-3 text-white" />
                    </span>
                  )}
                  <div
                    className={cn(
                      "mb-3 flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
                      isSelected
                        ? "bg-gold-500 text-navy-950"
                        : "bg-navy-900 text-gold-400 group-hover:bg-navy-800"
                    )}
                  >
                    <card.icon className="h-5 w-5" />
                  </div>
                  <p
                    className={cn(
                      "font-sans text-body-sm font-semibold",
                      isSelected ? "text-gold-800" : "text-navy-900"
                    )}
                  >
                    {card.title}
                  </p>
                  <p className="mt-1 font-sans text-caption text-charcoal-400">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
          {touched.role && errors.role && (
            <p className="mt-1.5 flex items-center gap-1 font-sans text-caption text-burgundy-500">
              <AlertCircle className="h-3 w-3" />
              {errors.role}
            </p>
          )}
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="mb-1.5 block font-sans text-body-sm font-medium text-charcoal-700"
            >
              First name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => handleBlur("firstName")}
              placeholder="First name"
              className={cn(
                "w-full rounded-lg border bg-white px-4 py-3 font-sans text-body text-charcoal-900 shadow-inner-soft transition-all duration-200 placeholder:text-charcoal-300 focus:outline-none focus:ring-2 focus:ring-gold-400/20",
                touched.firstName && errors.firstName
                  ? "border-burgundy-500 focus:border-burgundy-500"
                  : "border-ivory-400 focus:border-gold-400"
              )}
            />
            {touched.firstName && errors.firstName && (
              <p className="mt-1.5 flex items-center gap-1 font-sans text-caption text-burgundy-500">
                <AlertCircle className="h-3 w-3" />
                {errors.firstName}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="mb-1.5 block font-sans text-body-sm font-medium text-charcoal-700"
            >
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onBlur={() => handleBlur("lastName")}
              placeholder="Last name"
              className={cn(
                "w-full rounded-lg border bg-white px-4 py-3 font-sans text-body text-charcoal-900 shadow-inner-soft transition-all duration-200 placeholder:text-charcoal-300 focus:outline-none focus:ring-2 focus:ring-gold-400/20",
                touched.lastName && errors.lastName
                  ? "border-burgundy-500 focus:border-burgundy-500"
                  : "border-ivory-400 focus:border-gold-400"
              )}
            />
            {touched.lastName && errors.lastName && (
              <p className="mt-1.5 flex items-center gap-1 font-sans text-caption text-burgundy-500">
                <AlertCircle className="h-3 w-3" />
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block font-sans text-body-sm font-medium text-charcoal-700"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleBlur("email")}
            placeholder="you@example.com"
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
          <label
            htmlFor="password"
            className="mb-1.5 block font-sans text-body-sm font-medium text-charcoal-700"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur("password")}
              placeholder="Create a strong password"
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
          <PasswordStrength password={password} />
          {touched.password && errors.password && (
            <p className="mt-1.5 flex items-center gap-1 font-sans text-caption text-burgundy-500">
              <AlertCircle className="h-3 w-3" />
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block font-sans text-body-sm font-medium text-charcoal-700"
          >
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur("confirmPassword")}
              placeholder="Re-enter your password"
              className={cn(
                "w-full rounded-lg border bg-white px-4 py-3 pr-12 font-sans text-body text-charcoal-900 shadow-inner-soft transition-all duration-200 placeholder:text-charcoal-300 focus:outline-none focus:ring-2 focus:ring-gold-400/20",
                touched.confirmPassword && errors.confirmPassword
                  ? "border-burgundy-500 focus:border-burgundy-500"
                  : "border-ivory-400 focus:border-gold-400"
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 transition-colors hover:text-charcoal-600"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {touched.confirmPassword && errors.confirmPassword && (
            <p className="mt-1.5 flex items-center gap-1 font-sans text-caption text-burgundy-500">
              <AlertCircle className="h-3 w-3" />
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          loading={loading}
          fullWidth
          icon={<UserPlus className="h-4 w-4" />}
          size="lg"
        >
          Create Account
        </Button>
      </form>

      <p className="mt-8 text-center font-sans text-body-sm text-charcoal-400">
        Already have an account?{" "}
        <Link
          href={ROUTES.auth.login}
          className="font-medium text-gold-600 transition-colors hover:text-gold-500"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
