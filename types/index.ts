// Re-export all database types as the canonical source of truth
export type {
  Database,
  UserRole,
  ApplicationType,
  StudentStatus,
  SchoolApplicationStatus,
  RequirementType,
  Profile,
  ProfileInsert,
  ProfileUpdate,
  StudentProfile,
  StudentProfileInsert,
  StudentProfileUpdate,
  CoachProfile,
  CoachProfileInsert,
  CoachProfileUpdate,
  StudentWithProfile,
  CoachWithProfile,
  StudentWithCoach,
  StudentSchool,
  StudentSchoolInsert,
  StudentSchoolUpdate,
  SchoolRequirement,
  SchoolRequirementInsert,
  SchoolRequirementUpdate,
  StudentSchoolWithRequirements,
  EssayStatus,
  FeedbackType,
  FeedbackStatus,
  Essay,
  EssayInsert,
  EssayUpdate,
  EssayVersion,
  EssayVersionInsert,
  EssayFeedback,
  EssayFeedbackInsert,
  EssayWithRelations,
  EssayListItem,
} from "./database";

// ─── Session / Appointment Types ────────────────────────────────────────────

export type SessionStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export interface CoachingSession {
  id: string;
  student_id: string;
  coach_id: string;
  title: string;
  description: string | null;
  status: SessionStatus;
  scheduled_at: string;
  duration_minutes: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Message Types ──────────────────────────────────────────────────────────

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

// ─── Application Tracker Types ──────────────────────────────────────────────

export type ApplicationStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "accepted"
  | "rejected"
  | "waitlisted"
  | "deferred";

export interface Application {
  id: string;
  student_id: string;
  school_name: string;
  program: string | null;
  deadline: string;
  status: ApplicationStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Task / Milestone Types ─────────────────────────────────────────────────

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  student_id: string;
  assigned_by: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

// ─── Notification Types ─────────────────────────────────────────────────────

export type NotificationType =
  | "session_reminder"
  | "new_message"
  | "task_assigned"
  | "deadline_approaching"
  | "application_update";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  action_url: string | null;
  created_at: string;
}

// ─── API Response Types ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ─── Static School Data Type ───────────────────────────────────────────────

export interface StaticSchool {
  name: string;
  slug: string;
  type: "undergraduate" | "law_school" | "transfer";
  location: string;
  ranking: number;
  deadlines: Record<string, string>;
}
