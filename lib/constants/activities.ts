import type { ApplicationType, ActivityCategory, DocumentCategory, TaskPriority, TaskStatus } from "@/types/database";

// ─── Activity Categories by Application Type ────────────────────────────────

interface CategoryOption {
  value: ActivityCategory;
  label: string;
}

export const UNDERGRADUATE_CATEGORIES: CategoryOption[] = [
  { value: "academic", label: "Academic" },
  { value: "arts", label: "Art" },
  { value: "athletics", label: "Athletics" },
  { value: "career", label: "Career Oriented" },
  { value: "community_service", label: "Community Service / Volunteering" },
  { value: "computer_technology", label: "Computer / Technology" },
  { value: "cultural", label: "Cultural" },
  { value: "family_responsibilities", label: "Family Responsibilities" },
  { value: "government", label: "Government / Politics" },
  { value: "journalism", label: "Journalism / Publication" },
  { value: "lgbtq", label: "LGBTQ+" },
  { value: "music", label: "Music" },
  { value: "religious", label: "Religious" },
  { value: "research", label: "Research" },
  { value: "school_spirit", label: "School Spirit" },
  { value: "social_justice", label: "Social Justice" },
  { value: "other", label: "Other" },
];

export const LAW_TRANSFER_CATEGORIES: CategoryOption[] = [
  { value: "work_experience", label: "Work Experience" },
  { value: "volunteer", label: "Volunteer / Community Service" },
  { value: "research", label: "Research" },
  { value: "leadership", label: "Leadership" },
  { value: "publication", label: "Publication" },
  { value: "extracurricular", label: "Extracurricular" },
  { value: "military", label: "Military" },
  { value: "other", label: "Other" },
];

export function getCategoriesForType(appType: ApplicationType): CategoryOption[] {
  return appType === "undergraduate"
    ? UNDERGRADUATE_CATEGORIES
    : LAW_TRANSFER_CATEGORIES;
}

export function getCategoryLabel(category: ActivityCategory): string {
  const all = [...UNDERGRADUATE_CATEGORIES, ...LAW_TRANSFER_CATEGORIES];
  return all.find((c) => c.value === category)?.label ?? category;
}

// ─── Grade Levels ──────────────────────────────────────────────────────────

export const GRADE_LEVEL_OPTIONS = [
  { value: "9", label: "9th Grade" },
  { value: "10", label: "10th Grade" },
  { value: "11", label: "11th Grade" },
  { value: "12", label: "12th Grade" },
];

// ─── Document Categories ────────────────────────────────────────────────────

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  transcript: "Transcripts",
  test_scores: "Test Scores",
  resume: "Resumes & CVs",
  letter_of_rec: "Letters of Recommendation",
  financial: "Financial Documents",
  essay_draft: "Essay Drafts",
  other: "Other Documents",
};

export const DOCUMENT_CATEGORY_ORDER: DocumentCategory[] = [
  "transcript",
  "test_scores",
  "resume",
  "letter_of_rec",
  "financial",
  "essay_draft",
  "other",
];

// ─── Task Priority & Status ─────────────────────────────────────────────────

export const TASK_PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "bg-emerald-500",
  medium: "bg-gold-500",
  high: "bg-amber-500",
  urgent: "bg-burgundy-500",
};

export const TASK_PRIORITY_TEXT_COLORS: Record<TaskPriority, string> = {
  low: "text-emerald-400",
  medium: "text-gold-400",
  high: "text-amber-400",
  urgent: "text-burgundy-400",
};

// ─── Accepted File Types ────────────────────────────────────────────────────

export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
];

export const ACCEPTED_FILE_EXTENSIONS = ".pdf,.doc,.docx,.png,.jpg,.jpeg";

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
