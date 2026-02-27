"use client";

import { useState, useEffect } from "react";
import { Button, Modal } from "@/components/ui";
import { createEssay } from "@/lib/actions/essays";
import { fetchStudentSchools } from "@/lib/actions/schools";
import { useEssaysStore } from "@/hooks/use-essays-store";
import { brandToast } from "@/components/ui";
import type { StudentSchool } from "@/types/database";

interface NewEssayModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewEssayModal({ open, onClose }: NewEssayModalProps) {
  const { addEssay } = useEssaysStore();
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [schoolId, setSchoolId] = useState<string>("");
  const [schools, setSchools] = useState<StudentSchool[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchStudentSchools().then(({ data }) => {
        if (data) setSchools(data);
      });
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);

    const { data, error } = await createEssay({
      title: title.trim(),
      prompt: prompt.trim(),
      studentSchoolId: schoolId || null,
    });

    if (error) {
      brandToast.error("Error", error);
      setSubmitting(false);
      return;
    }

    if (data) {
      addEssay(data);
      brandToast.success("Essay created", `"${title}" is ready to write.`);
    }

    setTitle("");
    setPrompt("");
    setSchoolId("");
    setSubmitting(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Essay"
      description="Create a new essay to start writing."
      size="lg"
      className="border-navy-700/50 bg-charcoal-900 [&_h2]:text-ivory-100 [&>div:first-child]:border-navy-700/50 [&>div:last-child]:border-navy-700/50 [&_p.text-charcoal-400]:text-ivory-500 [&_button.text-charcoal-400]:text-ivory-500 [&_button.text-charcoal-400:hover]:bg-navy-800 [&_button.text-charcoal-400:hover]:text-ivory-200"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || submitting}
            loading={submitting}
          >
            {submitting ? "Creating..." : "Create Essay"}
          </Button>
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
            placeholder="e.g. Personal Statement, Why Columbia"
            className="w-full rounded-lg border border-navy-700/50 bg-navy-900 px-4 py-2.5 font-sans text-body-sm text-ivory-100 placeholder:text-ivory-500 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
          />
        </div>

        {/* Prompt */}
        <div>
          <label className="mb-1.5 block font-sans text-body-sm font-medium text-ivory-100">
            Essay Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Paste the essay prompt here..."
            rows={4}
            className="w-full rounded-lg border border-navy-700/50 bg-navy-900 px-4 py-2.5 font-sans text-body-sm text-ivory-100 placeholder:text-ivory-500 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20 resize-none"
          />
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
              None (General Essay)
            </option>
            {schools.map((s) => (
              <option key={s.id} value={s.id} className="bg-navy-900 text-ivory-100">
                {s.school_name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
}
