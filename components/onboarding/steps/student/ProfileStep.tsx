"use client";

import { Input } from "@/components/ui";
import { PhotoUpload } from "@/components/onboarding/shared/PhotoUpload";
import { Button } from "@/components/ui";
import { useOnboardingStore } from "@/hooks/use-onboarding-store";
import { validateStudentStep1 } from "@/lib/validations/onboarding";

export function ProfileStep() {
  const { studentData, errors, setStudentField, setErrors, nextStep } =
    useOnboardingStore();

  const handleContinue = () => {
    const stepErrors = validateStudentStep1({
      preferredName: studentData.preferredName,
      phone: studentData.phone,
    });
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    nextStep();
  };

  return (
    <div className="space-y-8">
      {/* Photo Upload */}
      <PhotoUpload
        preview={studentData.avatarPreview}
        name={studentData.preferredName}
        onSelect={(file, preview) => {
          setStudentField("avatarFile", file);
          setStudentField("avatarPreview", preview);
        }}
      />

      {/* Form Fields */}
      <div className="space-y-5">
        <Input
          id="preferredName"
          label="Preferred name"
          placeholder="What should we call you?"
          value={studentData.preferredName}
          onChange={(e) => setStudentField("preferredName", e.target.value)}
          error={errors.preferredName}
          helperText="This is how your coach will address you"
        />

        <Input
          id="phone"
          label="Phone number"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={studentData.phone}
          onChange={(e) => setStudentField("phone", e.target.value)}
          error={errors.phone}
          helperText="Optional — for session reminders"
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleContinue} size="lg">
          Continue
        </Button>
      </div>
    </div>
  );
}
