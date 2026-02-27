"use client";

import {
  GraduationCap,
  Scale,
  ArrowRightLeft,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button, Select } from "@/components/ui";
import { useOnboardingStore } from "@/hooks/use-onboarding-store";
import { validateStudentStep2 } from "@/lib/validations/onboarding";
import { cn } from "@/lib/utils/cn";
import type { ApplicationType } from "@/types";

const applicationTypes: {
  type: ApplicationType;
  icon: typeof GraduationCap;
  title: string;
  description: string;
}[] = [
  {
    type: "undergraduate",
    icon: GraduationCap,
    title: "Undergraduate",
    description:
      "First-time college applications to top universities and liberal arts colleges",
  },
  {
    type: "law_school",
    icon: Scale,
    title: "Law School",
    description:
      "JD program applications to T14 and top-tier law schools nationwide",
  },
  {
    type: "transfer",
    icon: ArrowRightLeft,
    title: "Law School Transfer",
    description:
      "Transfer applications from your current law school to a higher-ranked program",
  },
];

const cycleOptions = [
  { value: "Fall 2025", label: "Fall 2025" },
  { value: "Spring 2026", label: "Spring 2026" },
  { value: "Fall 2026", label: "Fall 2026" },
  { value: "Spring 2027", label: "Spring 2027" },
  { value: "Fall 2027", label: "Fall 2027" },
];

export function JourneyStep() {
  const {
    studentData,
    errors,
    setStudentField,
    setErrors,
    nextStep,
    prevStep,
  } = useOnboardingStore();

  const handleContinue = () => {
    const stepErrors = validateStudentStep2({
      applicationType: studentData.applicationType,
      targetCycle: studentData.targetCycle,
    });
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    nextStep();
  };

  return (
    <div className="space-y-8">
      {/* Application Type Cards */}
      <div>
        <p className="mb-4 font-sans text-body-sm font-medium text-charcoal-700">
          What type of application are you preparing?
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {applicationTypes.map((card) => {
            const isSelected = studentData.applicationType === card.type;
            return (
              <button
                key={card.type}
                type="button"
                onClick={() => setStudentField("applicationType", card.type)}
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
        {errors.applicationType && (
          <p className="mt-2 flex items-center gap-1 font-sans text-caption text-burgundy-500">
            <AlertCircle className="h-3 w-3" />
            {errors.applicationType}
          </p>
        )}
      </div>

      {/* Target Cycle */}
      <Select
        label="Target application cycle"
        placeholder="Select a cycle"
        options={cycleOptions}
        value={studentData.targetCycle}
        onChange={(val) => setStudentField("targetCycle", val)}
        error={errors.targetCycle}
        helperText="When do you plan to submit your applications?"
      />

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={prevStep} size="lg">
          Back
        </Button>
        <Button onClick={handleContinue} size="lg">
          Continue
        </Button>
      </div>
    </div>
  );
}
