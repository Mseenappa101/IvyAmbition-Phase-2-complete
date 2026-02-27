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
  ActivityCategory,
  DocumentCategory,
  TaskPriority,
  TaskStatus,
  Activity,
  ActivityInsert,
  ActivityUpdate,
  StudentDocument,
  StudentDocumentInsert,
  DocumentWithUploader,
  StudentTask,
  StudentTaskInsert,
  StudentTaskUpdate,
  TaskWithSchool,
  MessageType,
  Conversation,
  ConversationInsert,
  ChatMessage,
  ChatMessageInsert,
  ChatMessageUpdate,
  MessageWithSender,
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
// MessageType, ChatMessage, Conversation, MessageWithSender now come from database.ts

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
// TaskPriority, TaskStatus, StudentTask, TaskWithSchool now come from database.ts

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
