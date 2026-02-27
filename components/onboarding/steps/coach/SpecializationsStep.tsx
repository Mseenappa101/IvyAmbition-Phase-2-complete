"use client";

import {
  GraduationCap,
  Scale,
  ArrowRightLeft,
  Check,
  AlertCircle,
} from "lucide-react";
import { Input, Button } from "@/components/ui";
import { useOnboardingStore } from "@/hooks/use-onboarding-store";
import { validateCoachStep2 } from "@/lib/validations/onboarding";
import { cn } from "@/lib/utils/cn";

const specializations = [
  {
    value: "Undergraduate Admissions",
    icon: GraduationCap,
    description: "Guide students through college applications",
  },
  {
    value: "Law School Admissions",
    icon: Scale,
    description: "Help applicants get into top law programs",
  },
  {
    value: "Law School Transfer",
    icon: ArrowRightLeft,
    description: "Assist students transferring between law schools",
  },
];

export function SpecializationsStep() {
  const { coachData, errors, setCoachField, setErrors, nextStep, prevStep } =
    useOnboardingStore();

  const toggleSpecialization = (value: string) => {
    const current = coachData.specializations;
    const updated = current.includes(value)
      ? current.filter((s) => s !== value)
      : [...current, value];
    setCoachField("specializations", updated);
  };

  const handleContinue = () => {
    const stepErrors = validateCoachStep2({
      specializations: coachData.specializations,
      maxStudents: coachData.maxStudents,
    });
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    nextStep();
  };

  return (
    <div className="space-y-8">
      {/* Specialization Cards */}
      <div>
        <p className="mb-4 font-sans text-body-sm font-medium text-charcoal-700">
          Select your areas of expertise
        </p>
        <div className="space-y-3">
          {specializations.map((spec) => {
            const isSelected = coachData.specializations.includes(spec.value);
            return (
              <button
                key={spec.value}
                type="button"
                onClick={() => toggleSpecialization(spec.value)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2",
                  isSelected
                    ? "border-gold-500 bg-gold-50 shadow-gold-glow"
                    : "border-ivory-400 bg-white hover:border-gold-300 hover:bg-cream-50"
                )}
              >
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                    isSelected
                      ? "bg-gold-500 text-navy-950"
                      : "bg-navy-900 text-gold-400"
                  )}
                >
                  <spec.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p
                    className={cn(
                      "font-sans text-body-sm font-semibold",
                      isSelected ? "text-gold-800" : "text-navy-900"
                    )}
                  >
                    {spec.value}
                  </p>
                  <p className="mt-0.5 font-sans text-caption text-charcoal-400">
                    {spec.description}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    isSelected
                      ? "border-gold-500 bg-gold-500"
                      : "border-charcoal-300 bg-white"
                  )}
                >
                  {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                </div>
              </button>
            );
          })}
        </div>
        {errors.specializations && (
          <p className="mt-2 flex items-center gap-1 font-sans text-caption text-burgundy-500">
            <AlertCircle className="h-3 w-3" />
            {errors.specializations}
          </p>
        )}
      </div>

      {/* Max Students */}
      <Input
        id="maxStudents"
        label="Maximum student capacity"
        type="number"
        placeholder="e.g., 10"
        value={coachData.maxStudents}
        onChange={(e) => setCoachField("maxStudents", e.target.value)}
        error={errors.maxStudents}
        helperText="How many students can you coach at once?"
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
