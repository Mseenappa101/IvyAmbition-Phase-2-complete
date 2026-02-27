"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  LayoutDashboard,
  Users,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { useOnboardingStore } from "@/hooks/use-onboarding-store";
import { cn } from "@/lib/utils/cn";

const tourItems = [
  {
    icon: LayoutDashboard,
    title: "Your Dashboard",
    description: "Track your progress, deadlines, and action items at a glance",
  },
  {
    icon: Users,
    title: "Connect with Your Coach",
    description: "Get matched with an expert who specializes in your goals",
  },
  {
    icon: ClipboardList,
    title: "Track Applications",
    description: "Manage essays, deadlines, and submissions in one place",
  },
];

interface WelcomeStepProps {
  onComplete: () => void;
}

export function WelcomeStep({ onComplete }: WelcomeStepProps) {
  const { studentData, isSubmitting } = useOnboardingStore();

  const appTypeLabel =
    studentData.applicationType === "undergraduate"
      ? "Undergraduate"
      : studentData.applicationType === "law_school"
        ? "Law School"
        : "Law School Transfer";

  return (
    <div className="space-y-8">
      {/* Celebration */}
      <motion.div
        className="flex flex-col items-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 ring-8 ring-emerald-50/50">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="font-serif text-heading-xl text-navy-900">
          Welcome to IvyAmbition
          {studentData.preferredName
            ? `, ${studentData.preferredName}`
            : ""}
          !
        </h2>
        <p className="mt-2 font-sans text-body text-charcoal-400">
          Your profile is all set. Here&apos;s what&apos;s next.
        </p>
      </motion.div>

      {/* Summary */}
      <div className="rounded-xl border border-ivory-400 bg-white p-5">
        <p className="mb-3 font-sans text-body-sm font-medium text-charcoal-700">
          Your journey
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="premium">{appTypeLabel}</Badge>
          {studentData.targetCycle && (
            <Badge variant="info">{studentData.targetCycle}</Badge>
          )}
          {studentData.currentSchool && (
            <Badge variant="neutral">{studentData.currentSchool}</Badge>
          )}
        </div>
      </div>

      {/* Tour Preview */}
      <div className="space-y-3">
        <p className="font-sans text-body-sm font-medium text-charcoal-700">
          What you&apos;ll find inside
        </p>
        {tourItems.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
            className={cn(
              "flex items-start gap-4 rounded-xl border border-ivory-400 bg-white p-4",
              "transition-colors hover:bg-cream-50"
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-900">
              <item.icon className="h-5 w-5 text-gold-400" />
            </div>
            <div>
              <p className="font-sans text-body-sm font-semibold text-navy-900">
                {item.title}
              </p>
              <p className="mt-0.5 font-sans text-caption text-charcoal-400">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={onComplete}
          loading={isSubmitting}
          size="lg"
          icon={<ArrowRight className="h-4 w-4" />}
          iconPosition="right"
        >
          Enter Your Dashboard
        </Button>
      </div>
    </div>
  );
}
