"use client";

import { useState, useEffect, useCallback } from "react";

export interface QuickReplyTemplate {
  id: string;
  label: string;
  content: string;
}

const STORAGE_KEY = "ivyambition:quick-replies";

const DEFAULT_TEMPLATES: QuickReplyTemplate[] = [
  {
    id: "default-1",
    label: "Great draft",
    content:
      "Great draft! Here are a few notes I'd like you to consider for the next revision.",
  },
  {
    id: "default-2",
    label: "Review feedback",
    content:
      "Please review my inline feedback on your essay. Let me know if you have questions about any of my comments.",
  },
  {
    id: "default-3",
    label: "Schedule call",
    content:
      "Let's schedule a call to discuss your progress. What times work best for you this week?",
  },
  {
    id: "default-4",
    label: "Deadline reminder",
    content:
      "Just a reminder — your deadline is coming up soon. Let me know if you need any help wrapping things up.",
  },
];

function loadTemplates(): QuickReplyTemplate[] {
  if (typeof window === "undefined") return DEFAULT_TEMPLATES;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_TEMPLATES;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : DEFAULT_TEMPLATES;
  } catch {
    return DEFAULT_TEMPLATES;
  }
}

function saveTemplates(templates: QuickReplyTemplate[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function useQuickReplies() {
  const [templates, setTemplates] = useState<QuickReplyTemplate[]>(
    DEFAULT_TEMPLATES
  );

  useEffect(() => {
    setTemplates(loadTemplates());
  }, []);

  const addTemplate = useCallback(
    (label: string, content: string) => {
      const newTemplate: QuickReplyTemplate = {
        id: crypto.randomUUID(),
        label,
        content,
      };
      const updated = [...templates, newTemplate];
      setTemplates(updated);
      saveTemplates(updated);
    },
    [templates]
  );

  const updateTemplate = useCallback(
    (id: string, label: string, content: string) => {
      const updated = templates.map((t) =>
        t.id === id ? { ...t, label, content } : t
      );
      setTemplates(updated);
      saveTemplates(updated);
    },
    [templates]
  );

  const removeTemplate = useCallback(
    (id: string) => {
      const updated = templates.filter((t) => t.id !== id);
      setTemplates(updated);
      saveTemplates(updated);
    },
    [templates]
  );

  return { templates, addTemplate, updateTemplate, removeTemplate };
}
