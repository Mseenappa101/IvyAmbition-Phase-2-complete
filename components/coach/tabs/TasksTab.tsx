"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { brandToast, Modal } from "@/components/ui";
import { formatDate } from "@/lib/utils/format";
import {
  fetchStudentTasksForCoach,
  createTaskForStudent,
  fetchStudentSchoolsForTaskForm,
} from "@/lib/actions/coach";
import type { TaskPriority } from "@/types/database";

interface Props {
  studentId: string;
  userId: string;
}

interface TaskData {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  priority: string;
  status: string;
  created_by: string;
  student_schools: { school_name: string } | null;
}

const priorityColors: Record<string, string> = {
  low: "bg-ivory-700/15 text-ivory-500",
  medium: "bg-blue-500/15 text-blue-400",
  high: "bg-amber-500/15 text-amber-400",
  urgent: "bg-burgundy-500/15 text-burgundy-400",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-ivory-600" />,
  in_progress: <AlertCircle className="h-4 w-4 text-gold-400" />,
  completed: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
};

export function TasksTab({ studentId, userId }: Props) {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [schools, setSchools] = useState<
    { id: string; school_name: string }[]
  >([]);
  const [creating, setCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [schoolId, setSchoolId] = useState("");

  useEffect(() => {
    async function load() {
      const { data, error } = await fetchStudentTasksForCoach(studentId);
      if (error) {
        brandToast.error(error);
      } else if (data) {
        setTasks(data as unknown as TaskData[]);
      }
      setLoading(false);
    }
    load();
  }, [studentId]);

  const openModal = async () => {
    setShowModal(true);
    // Load schools for form
    const { data } = await fetchStudentSchoolsForTaskForm(studentId);
    if (data) setSchools(data);
  };

  const handleCreate = async () => {
    if (!title.trim() || !dueDate) return;
    setCreating(true);

    const { data, error } = await createTaskForStudent(studentId, {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      priority: priority as TaskPriority,
      studentSchoolId: schoolId || undefined,
    });

    if (error) {
      brandToast.error(error);
    } else if (data) {
      brandToast.success("Task created");
      setTasks((prev) => [...prev, data as unknown as TaskData]);
      setShowModal(false);
      resetForm();
    }
    setCreating(false);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("medium");
    setSchoolId("");
  };

  const now = new Date().toISOString().split("T")[0];

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-xl border border-navy-700/50 bg-navy-900/80"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <p className="font-sans text-body-sm text-ivory-600">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={openModal}
          className="flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2 font-sans text-body-sm font-medium text-navy-950 transition-colors hover:bg-gold-400"
        >
          <Plus className="h-4 w-4" />
          New Task
        </button>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl border border-navy-700/50 bg-navy-900/80 py-16">
          <div className="text-center">
            <CalendarCheck className="mx-auto h-8 w-8 text-ivory-800" />
            <p className="mt-2 font-sans text-body-sm text-ivory-600">
              No tasks yet
            </p>
            <p className="mt-1 font-sans text-caption text-ivory-700">
              Create a task to help this student stay on track.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const isOverdue =
              task.status !== "completed" && task.due_date < now;

            return (
              <div
                key={task.id}
                className="flex items-center gap-4 rounded-xl border border-navy-700/30 bg-navy-800/50 px-4 py-3 transition-colors hover:bg-navy-800/80"
              >
                <div className="shrink-0">
                  {statusIcons[task.status] ?? statusIcons.pending}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "font-sans text-body-sm font-medium",
                      task.status === "completed"
                        ? "text-ivory-600 line-through"
                        : "text-ivory-200"
                    )}
                  >
                    {task.title}
                  </p>
                  <p className="font-sans text-[0.6875rem] text-ivory-700">
                    {isOverdue ? (
                      <span className="text-burgundy-400">
                        Overdue: {formatDate(task.due_date)}
                      </span>
                    ) : (
                      `Due: ${formatDate(task.due_date)}`
                    )}
                    {task.student_schools && (
                      <span>
                        {" "}
                        &middot; {task.student_schools.school_name}
                      </span>
                    )}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 font-sans text-[0.625rem] font-medium capitalize",
                    priorityColors[task.priority] ?? priorityColors.medium
                  )}
                >
                  {task.priority}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title="Create Task for Student"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="rounded-lg px-4 py-2 font-sans text-body-sm font-medium text-ivory-600 transition-colors hover:text-ivory-300"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !title.trim() || !dueDate}
              className="flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2 font-sans text-body-sm font-medium text-navy-950 transition-colors hover:bg-gold-400 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Task"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block font-sans text-caption font-medium text-ivory-600">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Submit Harvard supplemental essays"
              className="w-full rounded-lg border border-navy-700/50 bg-navy-900/60 px-4 py-2.5 font-sans text-body-sm text-ivory-300 placeholder:text-ivory-800 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block font-sans text-caption font-medium text-ivory-600">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details..."
              rows={3}
              className="w-full rounded-lg border border-navy-700/50 bg-navy-900/60 px-4 py-2.5 font-sans text-body-sm text-ivory-300 placeholder:text-ivory-800 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-sans text-caption font-medium text-ivory-600">
                Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-navy-700/50 bg-navy-900/60 px-4 py-2.5 font-sans text-body-sm text-ivory-300 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block font-sans text-caption font-medium text-ivory-600">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-lg border border-navy-700/50 bg-navy-900/60 px-4 py-2.5 font-sans text-body-sm text-ivory-300 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {schools.length > 0 && (
            <div>
              <label className="mb-1 block font-sans text-caption font-medium text-ivory-600">
                Linked School (optional)
              </label>
              <select
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                className="w-full rounded-lg border border-navy-700/50 bg-navy-900/60 px-4 py-2.5 font-sans text-body-sm text-ivory-300 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
              >
                <option value="">None</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.school_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
