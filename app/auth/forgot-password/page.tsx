"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    setError("");
    return true;
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!validate()) return;

    setLoading(true);

    const supabase = createClient();
    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

    if (resetError) {
      toast.error(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  // ── Success State ──────────────────────────────────────────────────────
  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 ring-8 ring-emerald-50/50">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>

        <h1 className="font-serif text-display text-navy-900">
          Check your email
        </h1>
        <p className="mt-3 font-sans text-body text-charcoal-400">
          We&apos;ve sent a password reset link to
        </p>
        <p className="mt-1 font-sans text-body font-semibold text-navy-900">
          {email}
        </p>

        <div className="mt-8 rounded-xl border border-ivory-400 bg-cream-50 p-4">
          <p className="font-sans text-body-sm text-charcoal-500">
            Didn&apos;t receive the email? Check your spam folder, or{" "}
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="font-medium text-gold-600 hover:text-gold-500"
            >
              try a different email
            </button>
          </p>
        </div>

        <Link
          href={ROUTES.auth.login}
          className="mt-8 inline-flex items-center gap-2 font-sans text-body-sm font-medium text-gold-600 transition-colors hover:text-gold-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    );
  }

  // ── Form State ─────────────────────────────────────────────────────────
  return (
    <div>
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900">
        <Mail className="h-6 w-6 text-gold-400" />
      </div>

      <h1 className="font-serif text-display text-navy-900">
        Reset password
      </h1>
      <p className="mt-2 font-sans text-body text-charcoal-400">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>

      <form onSubmit={handleReset} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="reset-email"
            className="mb-1.5 block font-sans text-body-sm font-medium text-charcoal-700"
          >
            Email address
          </label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => {
              setTouched(true);
              validate();
            }}
            placeholder="you@example.com"
            autoComplete="email"
            className={cn(
              "w-full rounded-lg border bg-white px-4 py-3 font-sans text-body text-charcoal-900 shadow-inner-soft transition-all duration-200 placeholder:text-charcoal-300 focus:outline-none focus:ring-2 focus:ring-gold-400/20",
              touched && error
                ? "border-burgundy-500 focus:border-burgundy-500"
                : "border-ivory-400 focus:border-gold-400"
            )}
          />
          {touched && error && (
            <p className="mt-1.5 flex items-center gap-1 font-sans text-caption text-burgundy-500">
              <AlertCircle className="h-3 w-3" />
              {error}
            </p>
          )}
        </div>

        <Button type="submit" loading={loading} fullWidth size="lg">
          Send Reset Link
        </Button>
      </form>

      <p className="mt-8 text-center">
        <Link
          href={ROUTES.auth.login}
          className="inline-flex items-center gap-2 font-sans text-body-sm font-medium text-gold-600 transition-colors hover:text-gold-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
