"use client";

import { useState, useEffect } from "react";
import {
  UserPlus,
  Loader2,
  Users,
  GraduationCap,
  Check,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Badge,
  Button,
  Modal,
  ProgressBar,
  EmptyState,
} from "@/components/ui";
import {
  fetchUnassignedStudents,
  fetchAvailableCoaches,
  assignCoachToStudent,
} from "@/lib/actions/admin";
import type { UnassignedStudent, AvailableCoach } from "@/lib/actions/admin";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils/cn";

const typeLabel: Record<string, string> = {
  undergraduate: "Undergrad",
  law_school: "Law",
  transfer: "Transfer",
};

export default function AdminAssignmentsPage() {
  const [students, setStudents] = useState<UnassignedStudent[]>([]);
  const [coaches, setCoaches] = useState<AvailableCoach[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    student: UnassignedStudent;
    coach: AvailableCoach;
  } | null>(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [studentsRes, coachesRes] = await Promise.all([
      fetchUnassignedStudents(),
      fetchAvailableCoaches(),
    ]);
    if (studentsRes.data) setStudents(studentsRes.data);
    if (coachesRes.data) setCoaches(coachesRes.data);
    setLoading(false);
  }

  const handleAssign = async () => {
    if (!confirmModal) return;
    setAssigning(true);

    const result = await assignCoachToStudent(
      confirmModal.student.id,
      confirmModal.coach.userId
    );

    if (result.success) {
      toast.success(
        `${confirmModal.student.firstName} assigned to ${confirmModal.coach.firstName} ${confirmModal.coach.lastName}`
      );
      setConfirmModal(null);
      setSelectedStudent(null);
      await loadData();
    } else {
      toast.error(result.error ?? "Assignment failed");
    }
    setAssigning(false);
  };

  const selectedStudentObj = students.find((s) => s.id === selectedStudent);

  // Separate available vs at-capacity coaches
  const availableCoaches = coaches.filter(
    (c) => c.activeStudentCount < c.maxStudents
  );
  const fullCoaches = coaches.filter(
    (c) => c.activeStudentCount >= c.maxStudents
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-charcoal-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-display text-navy-900">
          Coach Assignments
        </h1>
        <p className="mt-1 font-sans text-body-sm text-charcoal-400">
          Assign unassigned students to available coaches
        </p>
      </div>

      {/* Two-Panel Layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: Unassigned Students (60%) */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-charcoal-500" />
                <h2 className="font-serif text-heading text-navy-900">
                  Unassigned Students
                </h2>
                <Badge variant="warning" size="sm">
                  {students.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <EmptyState
                  icon={<Check className="h-9 w-9 text-emerald-500" />}
                  title="All students assigned"
                  description="Every student has been matched with a coach."
                />
              ) : (
                <div className="space-y-2">
                  {students.map((s) => (
                    <button
                      key={s.id}
                      onClick={() =>
                        setSelectedStudent(
                          selectedStudent === s.id ? null : s.id
                        )
                      }
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                        selectedStudent === s.id
                          ? "border-gold-500 bg-gold-50/50 shadow-sm"
                          : "border-ivory-400 bg-white hover:border-charcoal-300 hover:bg-ivory-200/40"
                      )}
                    >
                      <Avatar
                        name={`${s.firstName} ${s.lastName}`}
                        src={s.avatarUrl}
                        size="sm"
                      />
                      <div className="flex-1">
                        <p className="font-sans text-body-sm font-medium text-navy-900">
                          {s.firstName} {s.lastName}
                        </p>
                        <p className="font-sans text-caption text-charcoal-400">
                          {s.email}
                        </p>
                      </div>
                      <Badge variant="premium" size="sm">
                        {typeLabel[s.applicationType] ?? s.applicationType}
                      </Badge>
                      <span className="font-sans text-caption text-charcoal-400">
                        {new Date(s.signupDate).toLocaleDateString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Available Coaches (40%) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-charcoal-500" />
                <h2 className="font-serif text-heading text-navy-900">
                  Available Coaches
                </h2>
                <Badge variant="success" size="sm">
                  {availableCoaches.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {availableCoaches.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-ivory-400 bg-white p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar
                        name={`${c.firstName} ${c.lastName}`}
                        src={c.avatarUrl}
                        size="sm"
                      />
                      <div className="flex-1">
                        <p className="font-sans text-body-sm font-medium text-navy-900">
                          {c.firstName} {c.lastName}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {c.specializations.map((s) => (
                            <Badge key={s} variant="premium" size="sm">
                              {s}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-2">
                          <ProgressBar
                            value={c.activeStudentCount}
                            max={c.maxStudents}
                            size="sm"
                            label={`${c.activeStudentCount} / ${c.maxStudents}`}
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="mt-3 w-full"
                      disabled={!selectedStudent}
                      onClick={() => {
                        if (selectedStudentObj) {
                          setConfirmModal({
                            student: selectedStudentObj,
                            coach: c,
                          });
                        }
                      }}
                    >
                      <UserPlus className="mr-1.5 h-4 w-4" />
                      {selectedStudent ? "Assign Selected Student" : "Select a Student First"}
                    </Button>
                  </div>
                ))}

                {/* At-capacity coaches */}
                {fullCoaches.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 pt-2">
                      <div className="h-px flex-1 bg-ivory-400" />
                      <span className="font-sans text-caption text-charcoal-400">
                        At Capacity
                      </span>
                      <div className="h-px flex-1 bg-ivory-400" />
                    </div>
                    {fullCoaches.map((c) => (
                      <div
                        key={c.id}
                        className="rounded-xl border border-ivory-400 bg-ivory-200/40 p-4 opacity-60"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar
                            name={`${c.firstName} ${c.lastName}`}
                            src={c.avatarUrl}
                            size="sm"
                          />
                          <div className="flex-1">
                            <p className="font-sans text-body-sm font-medium text-charcoal-600">
                              {c.firstName} {c.lastName}
                            </p>
                            <div className="mt-2">
                              <ProgressBar
                                value={c.activeStudentCount}
                                max={c.maxStudents}
                                size="sm"
                                label={`${c.activeStudentCount} / ${c.maxStudents}`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {coaches.length === 0 && (
                  <p className="py-6 text-center font-sans text-body-sm text-charcoal-400">
                    No coaches registered yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        open={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        title="Confirm Assignment"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmModal(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAssign}
              disabled={assigning}
            >
              {assigning ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-1.5 h-4 w-4" />
              )}
              Confirm Assignment
            </Button>
          </>
        }
      >
        {confirmModal && (
          <div className="space-y-4">
            <p className="font-sans text-body-sm text-charcoal-600">
              Are you sure you want to assign{" "}
              <strong className="text-navy-900">
                {confirmModal.student.firstName} {confirmModal.student.lastName}
              </strong>{" "}
              to{" "}
              <strong className="text-navy-900">
                {confirmModal.coach.firstName} {confirmModal.coach.lastName}
              </strong>
              ?
            </p>
            <div className="rounded-lg bg-ivory-200/60 px-4 py-3">
              <p className="font-sans text-caption text-charcoal-500">
                This will:
              </p>
              <ul className="mt-1 list-inside list-disc font-sans text-caption text-charcoal-600">
                <li>Assign the student to this coach</li>
                <li>Create a messaging conversation between them</li>
                <li>
                  Send an automated welcome message: &ldquo;You&rsquo;ve been
                  matched with your IvyAmbition counselor!&rdquo;
                </li>
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
