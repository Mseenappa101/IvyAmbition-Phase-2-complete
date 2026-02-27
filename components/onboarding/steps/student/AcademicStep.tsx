"use client";

import { Input } from "@/components/ui";
import { Button } from "@/components/ui";
import { useOnboardingStore } from "@/hooks/use-onboarding-store";
import { validateStudentStep3 } from "@/lib/validations/onboarding";

export function AcademicStep() {
  const {
    studentData,
    errors,
    setStudentField,
    setErrors,
    nextStep,
    prevStep,
  } = useOnboardingStore();

  const appType = studentData.applicationType!;

  const handleContinue = () => {
    const stepErrors = validateStudentStep3(
      {
        currentSchool: studentData.currentSchool,
        gpa: studentData.gpa,
        satScore: studentData.satScore,
        actScore: studentData.actScore,
        lsatScore: studentData.lsatScore,
        workExperienceYears: studentData.workExperienceYears,
        firstYearGpa: studentData.firstYearGpa,
        originalLsatScore: studentData.originalLsatScore,
      },
      appType
    );
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    nextStep();
  };

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        {/* ── Undergraduate Fields ─────────────────────────────────────────── */}
        {appType === "undergraduate" && (
          <>
            <Input
              id="currentSchool"
              label="High school name"
              placeholder="e.g., Phillips Academy Andover"
              value={studentData.currentSchool}
              onChange={(e) =>
                setStudentField("currentSchool", e.target.value)
              }
              error={errors.currentSchool}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="gpa"
                label="GPA"
                placeholder="e.g., 3.95"
                value={studentData.gpa}
                onChange={(e) => setStudentField("gpa", e.target.value)}
                error={errors.gpa}
                helperText="Unweighted 4.0 or 5.0 scale"
              />
              <Input
                id="intendedMajor"
                label="Intended major"
                placeholder="e.g., Computer Science"
                value={studentData.intendedMajor}
                onChange={(e) =>
                  setStudentField("intendedMajor", e.target.value)
                }
                error={errors.intendedMajor}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="satScore"
                label="SAT score"
                placeholder="400–1600"
                value={studentData.satScore}
                onChange={(e) => setStudentField("satScore", e.target.value)}
                error={errors.satScore}
              />
              <Input
                id="actScore"
                label="ACT score"
                placeholder="1–36"
                value={studentData.actScore}
                onChange={(e) => setStudentField("actScore", e.target.value)}
                error={errors.actScore}
                helperText="Optional"
              />
            </div>
          </>
        )}

        {/* ── Law School Fields ────────────────────────────────────────────── */}
        {appType === "law_school" && (
          <>
            <Input
              id="currentSchool"
              label="Undergraduate institution"
              placeholder="e.g., University of Michigan"
              value={studentData.currentSchool}
              onChange={(e) =>
                setStudentField("currentSchool", e.target.value)
              }
              error={errors.currentSchool}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="gpa"
                label="Undergraduate GPA"
                placeholder="e.g., 3.78"
                value={studentData.gpa}
                onChange={(e) => setStudentField("gpa", e.target.value)}
                error={errors.gpa}
                helperText="4.0 scale"
              />
              <Input
                id="lsatScore"
                label="LSAT score"
                placeholder="120–180"
                value={studentData.lsatScore}
                onChange={(e) => setStudentField("lsatScore", e.target.value)}
                error={errors.lsatScore}
              />
            </div>
            <Input
              id="workExperienceYears"
              label="Years of work experience"
              type="number"
              placeholder="e.g., 3"
              value={studentData.workExperienceYears}
              onChange={(e) =>
                setStudentField("workExperienceYears", e.target.value)
              }
              error={errors.workExperienceYears}
              helperText="Optional"
            />
          </>
        )}

        {/* ── Transfer Fields ──────────────────────────────────────────────── */}
        {appType === "transfer" && (
          <>
            <Input
              id="currentSchool"
              label="Current law school"
              placeholder="e.g., Georgetown Law"
              value={studentData.currentSchool}
              onChange={(e) =>
                setStudentField("currentSchool", e.target.value)
              }
              error={errors.currentSchool}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="firstYearGpa"
                label="1L GPA"
                placeholder="e.g., 3.60"
                value={studentData.firstYearGpa}
                onChange={(e) =>
                  setStudentField("firstYearGpa", e.target.value)
                }
                error={errors.firstYearGpa}
                helperText="4.0 scale"
              />
              <Input
                id="classRank"
                label="Class rank"
                placeholder="e.g., Top 10%"
                value={studentData.classRank}
                onChange={(e) => setStudentField("classRank", e.target.value)}
                error={errors.classRank}
                helperText="If known"
              />
            </div>
            <Input
              id="originalLsatScore"
              label="Original LSAT score"
              placeholder="120–180"
              value={studentData.originalLsatScore}
              onChange={(e) =>
                setStudentField("originalLsatScore", e.target.value)
              }
              error={errors.originalLsatScore}
            />
          </>
        )}
      </div>

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
