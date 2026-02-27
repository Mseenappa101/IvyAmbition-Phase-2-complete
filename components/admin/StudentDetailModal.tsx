"use client";

import { Modal, Badge, Avatar } from "@/components/ui";
import type { AdminStudent } from "@/lib/actions/admin";

interface StudentDetailModalProps {
  student: AdminStudent | null;
  onClose: () => void;
}

const statusVariant: Record<string, "success" | "warning" | "neutral" | "info"> = {
  active: "success",
  paused: "warning",
  onboarding: "info",
  completed: "neutral",
};

const typeLabel: Record<string, string> = {
  undergraduate: "Undergraduate",
  law_school: "Law School",
  transfer: "Transfer",
};

export function StudentDetailModal({
  student,
  onClose,
}: StudentDetailModalProps) {
  if (!student) return null;

  return (
    <Modal
      open={!!student}
      onClose={onClose}
      title={`${student.firstName} ${student.lastName}`}
      description={student.email}
      size="lg"
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-center gap-4">
          <Avatar
            name={`${student.firstName} ${student.lastName}`}
            src={student.avatarUrl}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant[student.status] ?? "neutral"} dot>
                {student.status}
              </Badge>
              <Badge variant="premium">
                {typeLabel[student.applicationType] ?? student.applicationType}
              </Badge>
            </div>
            <p className="mt-1 font-sans text-caption text-charcoal-400">
              Joined {new Date(student.signupDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Academic Info */}
        <div>
          <h3 className="mb-3 font-serif text-heading-sm text-navy-900">
            Academic Profile
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {student.currentGpa && (
              <div className="rounded-lg bg-ivory-200/60 px-3 py-2">
                <p className="font-sans text-caption text-charcoal-400">GPA</p>
                <p className="font-sans text-body-sm font-semibold text-navy-900">
                  {student.currentGpa}
                </p>
              </div>
            )}
            {student.satScore && (
              <div className="rounded-lg bg-ivory-200/60 px-3 py-2">
                <p className="font-sans text-caption text-charcoal-400">SAT</p>
                <p className="font-sans text-body-sm font-semibold text-navy-900">
                  {student.satScore}
                </p>
              </div>
            )}
            {student.actScore && (
              <div className="rounded-lg bg-ivory-200/60 px-3 py-2">
                <p className="font-sans text-caption text-charcoal-400">ACT</p>
                <p className="font-sans text-body-sm font-semibold text-navy-900">
                  {student.actScore}
                </p>
              </div>
            )}
            {student.lsatScore && (
              <div className="rounded-lg bg-ivory-200/60 px-3 py-2">
                <p className="font-sans text-caption text-charcoal-400">LSAT</p>
                <p className="font-sans text-body-sm font-semibold text-navy-900">
                  {student.lsatScore}
                </p>
              </div>
            )}
            {student.intendedMajor && (
              <div className="col-span-2 rounded-lg bg-ivory-200/60 px-3 py-2">
                <p className="font-sans text-caption text-charcoal-400">
                  Intended Major
                </p>
                <p className="font-sans text-body-sm font-semibold text-navy-900">
                  {student.intendedMajor}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Application Info */}
        <div>
          <h3 className="mb-3 font-serif text-heading-sm text-navy-900">
            Application Details
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-ivory-200/60 px-3 py-2">
              <p className="font-sans text-caption text-charcoal-400">
                Target Cycle
              </p>
              <p className="font-sans text-body-sm font-semibold text-navy-900">
                {student.targetCycle}
              </p>
            </div>
            <div className="rounded-lg bg-ivory-200/60 px-3 py-2">
              <p className="font-sans text-caption text-charcoal-400">
                Assigned Coach
              </p>
              <p className="font-sans text-body-sm font-semibold text-navy-900">
                {student.coachName ?? "Unassigned"}
              </p>
            </div>
            <div className="rounded-lg bg-ivory-200/60 px-3 py-2">
              <p className="font-sans text-caption text-charcoal-400">
                Schools
              </p>
              <p className="font-sans text-body-sm font-semibold text-navy-900">
                {student.schoolCount}
              </p>
            </div>
            <div className="rounded-lg bg-ivory-200/60 px-3 py-2">
              <p className="font-sans text-caption text-charcoal-400">
                Essays
              </p>
              <p className="font-sans text-body-sm font-semibold text-navy-900">
                {student.essayCount}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
