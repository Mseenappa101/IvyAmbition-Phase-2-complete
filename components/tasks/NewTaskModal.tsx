"use client";

import { useState, useEffect } from "react";
import { Button, Modal, brandToast } from "@/components/ui";
import { createTask, updateTask as updateTaskAction, deleteTask } from "@/lib/actions/tasks";
import { fetchStudentSchools } from "@/lib/actions/schools";
import { useTasksStore } from "@/hooks/use-tasks-store";
import { TASK_PRIORITY_OPTIONS } from "@/lib/constants/activities";
import type { StudentSchool, TaskPriority, TaskWithSchool } from "@/types/database";

interface NewTaskModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewTaskModal({ open, onClose }: NewTaskModalProps) {
  const { addTask, updateTask, removeTask, editingTask, setEditingTask } =
    useTasksStore();

  const isEditing = !!editingTask;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [schoolId, setSchoolId] = useState("");
  const [schools, setSchools] = useState<StudentSchool[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load schools when modal opens
  useEffect(() => {
    if (open) {
      fetchStudentSchools().then(({ data }) => {
        if (data) setSchools(data);
      });
    }
  }, [open]);

  // Populate form when editing
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description ?? "");
      setDueDate(editingTask.due_date);
      setPriority(editingTask.priority);
      setSchoolId(editingTask.student_school_id ?? "");
    } else {
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("medium");
      setSchoolId("");
    }
  }, [editingTask]);

  const handleClose = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("medium");
    setSchoolId("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim() || !dueDate) return;
    setSubmitting(true);

    if (isEditing) {
      // Update existing task
      const updates: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || null,
        dueDate,
        priority,
        studentSchoolId: schoolId || null,
      };

      updateTask(editingTask.id, {
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate,
        priority,
        student_school_id: schoolId || null,
      });

      const { error } = await updateTaskAction(editingTask.id, updates);
      if (error) {
        brandToast.error("Error", error);
      } else {
        brandToast.success("Updated", "Task has been updated.");
      }
    } else {
      // Create new task
      const { data, error } = await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate,
        priority,
        studentSchoolId: schoolId || null,
      });

      if (error) {
        brandToast.error("Error", error);
        setSubmitting(false);
        return;
      }

      if (data) {
        addTask(data as TaskWithSchool);
        brandToast.success("Task created", `"${title}" has been added.`);
      }
    }

    setSubmitting(false);
    handleClose();
  };

  const handleDelete = async () => {
    if (!editingTask) return;
    setDeleting(true);
    removeTask(editingTask.id);

    const { error } = await deleteTask(editingTask.id);
    if (error) {
      brandToast.error("Error", "Could not delete task.");
    }

    setDeleting(false);
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditing ? "Edit Task" : "New Task"}
      description={
        isEditing
          ? "Update task details."
          : "Add a task or deadline to track."
      }
      size="md"
      className="border-navy-700/50 bg-charcoal-900 [&_h2]:text-ivory-100 [&>div:first-child]:border-navy-700/50 [&>div:last-child]:border-navy-700/50 [&_p.text-charcoal-400]:text-ivory-500 [&_button.text-charcoal-400]:text-ivory-500 [&_button.text-charcoal-400:hover]:bg-navy-800 [&_button.text-charcoal-400:hover]:text-ivory-200"
      footer={
        <div className="flex w-full items-center justify-between">
          {isEditing ? (
            <Button
              variant="ghost"
              onClick={handleDelete}
              loading={deleting}
              className="text-burgundy-400 hover:text-burgundy-300"
            >
              Delete
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || !dueDate || submitting}
              loading={submitting}
            >
              {isEditing ? "Save Changes" : "Create Task"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="mb-1.5 block font-sans text-body-sm font-medium text-ivory-100">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Submit Common App, Request transcript"
            autoFocus
            className="w-full rounded-lg border border-navy-700/50 bg-navy-900 px-4 py-2.5 font-sans text-body-sm text-ivory-100 placeholder:text-ivory-500 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block font-sans text-body-sm font-medium text-ivory-100">
            Description{" "}
            <span className="font-normal text-ivory-500">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any details or notes..."
            rows={2}
            className="w-full resize-none rounded-lg border border-navy-700/50 bg-navy-900 px-4 py-2.5 font-sans text-body-sm text-ivory-100 placeholder:text-ivory-500 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
          />
        </div>

        {/* Due Date + Priority */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block font-sans text-body-sm font-medium text-ivory-100">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-navy-700/50 bg-navy-900 px-4 py-2.5 font-sans text-body-sm text-ivory-100 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-sans text-body-sm font-medium text-ivory-100">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full rounded-lg border border-navy-700/50 bg-navy-900 px-4 py-2.5 font-sans text-body-sm text-ivory-100 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            >
              {TASK_PRIORITY_OPTIONS.map((p) => (
                <option
                  key={p.value}
                  value={p.value}
                  className="bg-navy-900 text-ivory-100"
                >
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Linked School */}
        <div>
          <label className="mb-1.5 block font-sans text-body-sm font-medium text-ivory-100">
            Linked School{" "}
            <span className="font-normal text-ivory-500">(optional)</span>
          </label>
          <select
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            className="w-full rounded-lg border border-navy-700/50 bg-navy-900 px-4 py-2.5 font-sans text-body-sm text-ivory-100 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
          >
            <option value="" className="bg-navy-900 text-ivory-100">
              None (General Task)
            </option>
            {schools.map((s) => (
              <option
                key={s.id}
                value={s.id}
                className="bg-navy-900 text-ivory-100"
              >
                {s.school_name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
}
