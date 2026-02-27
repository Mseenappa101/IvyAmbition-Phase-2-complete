"use client";

import { Input, Textarea } from "@/components/ui";
import { Button } from "@/components/ui";
import { PhotoUpload } from "@/components/onboarding/shared/PhotoUpload";
import { useOnboardingStore } from "@/hooks/use-onboarding-store";
import { validateCoachStep1 } from "@/lib/validations/onboarding";

export function CoachProfileStep() {
  const { coachData, errors, setCoachField, setErrors, nextStep } =
    useOnboardingStore();

  const handleContinue = () => {
    const stepErrors = validateCoachStep1({
      bio: coachData.bio,
      phone: coachData.phone,
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
        preview={coachData.avatarPreview}
        name="Coach"
        onSelect={(file, preview) => {
          setCoachField("avatarFile", file);
          setCoachField("avatarPreview", preview);
        }}
      />

      {/* Form Fields */}
      <div className="space-y-5">
        <Textarea
          id="bio"
          label="Bio"
          placeholder="Tell students about your background, experience, and coaching philosophy..."
          value={coachData.bio}
          onChange={(e) => setCoachField("bio", e.target.value)}
          error={errors.bio}
          helperText="This will be visible to students when browsing coaches"
          maxCharacters={500}
          rows={4}
        />

        <Input
          id="phone"
          label="Phone number"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={coachData.phone}
          onChange={(e) => setCoachField("phone", e.target.value)}
          error={errors.phone}
          helperText="Optional — for scheduling coordination"
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
