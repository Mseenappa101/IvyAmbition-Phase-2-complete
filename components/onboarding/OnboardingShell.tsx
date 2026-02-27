"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { ProgressBar } from "@/components/ui";
import { StepTransition } from "./shared/StepTransition";

interface OnboardingShellProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  stepSubtitle: string;
  children: React.ReactNode;
}

export function OnboardingShell({
  currentStep,
  totalSteps,
  stepTitle,
  stepSubtitle,
  children,
}: OnboardingShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      {/* Top Bar */}
      <header className="border-b border-ivory-400 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500">
              <GraduationCap className="h-4 w-4 text-navy-950" />
            </div>
            <span className="font-serif text-heading-sm text-navy-900">
              IvyAmbition
            </span>
          </Link>
          <span className="font-sans text-body-sm text-charcoal-400">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="mx-auto w-full max-w-2xl px-6 pt-6">
        <ProgressBar
          value={currentStep}
          max={totalSteps}
          showValue={false}
          size="sm"
          animated
        />
      </div>

      {/* Step Content */}
      <main className="flex flex-1 flex-col items-center px-6 py-10">
        <div className="w-full max-w-2xl">
          {/* Step Title */}
          <div className="mb-8 text-center">
            <h1 className="font-serif text-display text-navy-900">
              {stepTitle}
            </h1>
            <p className="mt-2 font-sans text-body-lg text-charcoal-400">
              {stepSubtitle}
            </p>
          </div>

          {/* Animated Step Content */}
          <AnimatePresence mode="wait">
            <StepTransition stepKey={currentStep}>{children}</StepTransition>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
