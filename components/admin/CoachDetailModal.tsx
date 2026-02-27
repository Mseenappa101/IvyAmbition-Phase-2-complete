"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Modal, Badge, Avatar, ProgressBar } from "@/components/ui";
import { fetchCoachStudents } from "@/lib/actions/admin";
import type { AdminCoach } from "@/lib/actions/admin";

interface CoachDetailModalProps {
  coach: AdminCoach | null;
  onClose: () => void;
}

interface CoachStudent {
  id: string;
  firstName: string;
  lastName: string;
  applicationType: string;
  status: string;
}

const statusVariant: Record<string, "success" | "warning" | "neutral" | "info"> = {
  active: "success",
  paused: "warning",
  onboarding: "info",
  completed: "neutral",
};

export function CoachDetailModal({ coach, onClose }: CoachDetailModalProps) {
  const [students, setStudents] = useState<CoachStudent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (coach) {
      setLoading(true);
      fetchCoachStudents(coach.userId).then((res) => {
        if (res.data) setStudents(res.data);
        setLoading(false);
      });
    } else {
      setStudents([]);
    }
  }, [coach]);

  if (!coach) return null;

  return (
    <Modal
      open={!!coach}
      onClose={onClose}
      title={`${coach.firstName} ${coach.lastName}`}
      description={coach.email}
      size="lg"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Avatar
            name={`${coach.firstName} ${coach.lastName}`}
            src={coach.avatarUrl}
            size="lg"
          />
          <div className="flex-1">
            {coach.utilization >= 100 && (
              <Badge variant="warning" size="sm">
                At capacity
              </Badge>
            )}
          </div>
        </div>

        {/* Bio */}
        {coach.bio && (
          <div>
            <h3 className="mb-2 font-serif text-heading-sm text-navy-900">
              Bio
            </h3>
            <p className="font-sans text-body-sm text-charcoal-600">
              {coach.bio}
            </p>
          </div>
        )}

        {/* Specializations */}
        {coach.specializations.length > 0 && (
          <div>
            <h3 className="mb-2 font-serif text-heading-sm text-navy-900">
              Specializations
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {coach.specializations.map((s) => (
                <Badge key={s} variant="premium" size="sm">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Capacity */}
        <div>
          <h3 className="mb-2 font-serif text-heading-sm text-navy-900">
            Student Capacity
          </h3>
          <ProgressBar
            value={coach.activeStudentCount}
            max={coach.maxStudents}
            label={`${coach.activeStudentCount} / ${coach.maxStudents} students`}
          />
        </div>

        {/* Assigned Students */}
        <div>
          <h3 className="mb-2 font-serif text-heading-sm text-navy-900">
            Assigned Students
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-charcoal-400" />
            </div>
          ) : students.length === 0 ? (
            <p className="font-sans text-body-sm text-charcoal-400">
              No students assigned yet.
            </p>
          ) : (
            <div className="space-y-2">
              {students.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-ivory-400 px-3 py-2"
                >
                  <span className="font-sans text-body-sm font-medium text-navy-900">
                    {s.firstName} {s.lastName}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="premium" size="sm">
                      {s.applicationType === "law_school"
                        ? "Law"
                        : s.applicationType === "transfer"
                          ? "Transfer"
                          : "Undergrad"}
                    </Badge>
                    <Badge
                      variant={statusVariant[s.status] ?? "neutral"}
                      size="sm"
                      dot
                    >
                      {s.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
