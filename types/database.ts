// ─── Database Type Definitions ──────────────────────────────────────────────
// Mirrors the Supabase schema defined in supabase/migrations/00001_initial_schema.sql
// Provides full type safety for all Supabase client queries.
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = "student" | "coach" | "admin";
export type ApplicationType = "undergraduate" | "law_school" | "transfer";
export type StudentStatus = "onboarding" | "active" | "paused" | "completed";

export type SchoolApplicationStatus =
  | "researching"
  | "applying"
  | "submitted"
  | "accepted"
  | "waitlisted"
  | "rejected"
  | "enrolled";

export type RequirementType =
  | "transcript"
  | "test_score"
  | "essay"
  | "recommendation"
  | "resume"
  | "application_form"
  | "fee"
  | "interview"
  | "supplement"
  | "other";

// ─── Activity / Document / Task Enum Types ────────────────────────────────

export type ActivityCategory =
  | "academic"
  | "arts"
  | "athletics"
  | "career"
  | "community_service"
  | "computer_technology"
  | "cultural"
  | "family_responsibilities"
  | "government"
  | "journalism"
  | "lgbtq"
  | "music"
  | "religious"
  | "research"
  | "school_spirit"
  | "social_justice"
  | "work_experience"
  | "volunteer"
  | "leadership"
  | "publication"
  | "extracurricular"
  | "military"
  | "other";

export type DocumentCategory =
  | "transcript"
  | "test_scores"
  | "resume"
  | "letter_of_rec"
  | "financial"
  | "essay_draft"
  | "other";

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "pending" | "in_progress" | "completed";

// ─── Messaging Enum Types ────────────────────────────────────────────────────

export type MessageType = "text" | "feedback" | "file" | "system";

// ─── Notification Enum Types ────────────────────────────────────────────────

export type NotificationType = "message" | "feedback" | "deadline" | "assignment" | "system";

// ─── Essay Enum Types ──────────────────────────────────────────────────────

export type EssayStatus =
  | "brainstorming"
  | "outline"
  | "first_draft"
  | "revision"
  | "coach_review"
  | "final";

export type FeedbackType = "general" | "inline";
export type FeedbackStatus = "open" | "resolved";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role: UserRole;
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string;
          last_name?: string;
          role?: UserRole;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          role?: UserRole;
          avatar_url?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      student_profiles: {
        Row: {
          id: string;
          user_id: string;
          assigned_coach_id: string | null;
          application_type: ApplicationType;
          target_cycle: string;
          current_school: string | null;
          current_gpa: number | null;
          lsat_score: number | null;
          sat_score: number | null;
          act_score: number | null;
          status: StudentStatus;
          onboarding_completed: boolean;
          intended_major: string | null;
          work_experience_years: number | null;
          class_rank: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          assigned_coach_id?: string | null;
          application_type?: ApplicationType;
          target_cycle?: string;
          current_school?: string | null;
          current_gpa?: number | null;
          lsat_score?: number | null;
          sat_score?: number | null;
          act_score?: number | null;
          status?: StudentStatus;
          onboarding_completed?: boolean;
          intended_major?: string | null;
          work_experience_years?: number | null;
          class_rank?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          assigned_coach_id?: string | null;
          application_type?: ApplicationType;
          target_cycle?: string;
          current_school?: string | null;
          current_gpa?: number | null;
          lsat_score?: number | null;
          sat_score?: number | null;
          act_score?: number | null;
          status?: StudentStatus;
          onboarding_completed?: boolean;
          intended_major?: string | null;
          work_experience_years?: number | null;
          class_rank?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_profiles_assigned_coach_id_fkey";
            columns: ["assigned_coach_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      coach_profiles: {
        Row: {
          id: string;
          user_id: string;
          bio: string | null;
          specializations: string[];
          max_students: number;
          active_student_count: number;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bio?: string | null;
          specializations?: string[];
          max_students?: number;
          active_student_count?: number;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          bio?: string | null;
          specializations?: string[];
          max_students?: number;
          active_student_count?: number;
          onboarding_completed?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "coach_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      student_schools: {
        Row: {
          id: string;
          user_id: string;
          school_name: string;
          school_slug: string;
          application_type: ApplicationType;
          status: SchoolApplicationStatus;
          deadline: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          school_name: string;
          school_slug: string;
          application_type?: ApplicationType;
          status?: SchoolApplicationStatus;
          deadline?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          school_name?: string;
          school_slug?: string;
          application_type?: ApplicationType;
          status?: SchoolApplicationStatus;
          deadline?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_schools_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      school_requirements: {
        Row: {
          id: string;
          student_school_id: string;
          requirement_type: RequirementType;
          label: string;
          is_completed: boolean;
          file_url: string | null;
          notes: string | null;
          due_date: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_school_id: string;
          requirement_type?: RequirementType;
          label: string;
          is_completed?: boolean;
          file_url?: string | null;
          notes?: string | null;
          due_date?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          requirement_type?: RequirementType;
          label?: string;
          is_completed?: boolean;
          file_url?: string | null;
          notes?: string | null;
          due_date?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "school_requirements_student_school_id_fkey";
            columns: ["student_school_id"];
            isOneToOne: false;
            referencedRelation: "student_schools";
            referencedColumns: ["id"];
          },
        ];
      };
      essays: {
        Row: {
          id: string;
          student_id: string;
          student_school_id: string | null;
          title: string;
          prompt: string;
          content: string;
          word_count: number;
          status: EssayStatus;
          version_number: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          student_school_id?: string | null;
          title: string;
          prompt?: string;
          content?: string;
          word_count?: number;
          status?: EssayStatus;
          version_number?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          student_school_id?: string | null;
          title?: string;
          prompt?: string;
          content?: string;
          word_count?: number;
          status?: EssayStatus;
          version_number?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "essays_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "essays_student_school_id_fkey";
            columns: ["student_school_id"];
            isOneToOne: false;
            referencedRelation: "student_schools";
            referencedColumns: ["id"];
          },
        ];
      };
      essay_versions: {
        Row: {
          id: string;
          essay_id: string;
          version_number: number;
          content: string;
          word_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          essay_id: string;
          version_number: number;
          content: string;
          word_count?: number;
          created_at?: string;
        };
        Update: {
          content?: string;
          word_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "essay_versions_essay_id_fkey";
            columns: ["essay_id"];
            isOneToOne: false;
            referencedRelation: "essays";
            referencedColumns: ["id"];
          },
        ];
      };
      essay_feedback: {
        Row: {
          id: string;
          essay_id: string;
          coach_id: string;
          feedback_type: FeedbackType;
          content: string;
          selection_start: number | null;
          selection_end: number | null;
          status: FeedbackStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          essay_id: string;
          coach_id: string;
          feedback_type?: FeedbackType;
          content: string;
          selection_start?: number | null;
          selection_end?: number | null;
          status?: FeedbackStatus;
          created_at?: string;
        };
        Update: {
          status?: FeedbackStatus;
        };
        Relationships: [
          {
            foreignKeyName: "essay_feedback_essay_id_fkey";
            columns: ["essay_id"];
            isOneToOne: false;
            referencedRelation: "essays";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "essay_feedback_coach_id_fkey";
            columns: ["coach_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      activities: {
        Row: {
          id: string;
          student_id: string;
          activity_name: string;
          category: ActivityCategory;
          organization: string;
          position_title: string;
          description: string;
          character_count: number;
          start_date: string | null;
          end_date: string | null;
          hours_per_week: number;
          weeks_per_year: number;
          grade_levels: string[];
          ranking: number;
          coach_feedback: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          activity_name: string;
          category?: ActivityCategory;
          organization?: string;
          position_title?: string;
          description?: string;
          character_count?: number;
          start_date?: string | null;
          end_date?: string | null;
          hours_per_week?: number;
          weeks_per_year?: number;
          grade_levels?: string[];
          ranking?: number;
          coach_feedback?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          activity_name?: string;
          category?: ActivityCategory;
          organization?: string;
          position_title?: string;
          description?: string;
          character_count?: number;
          start_date?: string | null;
          end_date?: string | null;
          hours_per_week?: number;
          weeks_per_year?: number;
          grade_levels?: string[];
          ranking?: number;
          coach_feedback?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activities_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      documents: {
        Row: {
          id: string;
          student_id: string;
          file_name: string;
          file_type: string;
          file_url: string;
          file_size: number;
          category: DocumentCategory;
          uploaded_by: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          file_name: string;
          file_type: string;
          file_url: string;
          file_size: number;
          category?: DocumentCategory;
          uploaded_by: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          file_name?: string;
          category?: DocumentCategory;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "documents_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      tasks: {
        Row: {
          id: string;
          student_id: string;
          student_school_id: string | null;
          title: string;
          description: string | null;
          due_date: string;
          priority: TaskPriority;
          status: TaskStatus;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          student_school_id?: string | null;
          title: string;
          description?: string | null;
          due_date: string;
          priority?: TaskPriority;
          status?: TaskStatus;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          student_school_id?: string | null;
          title?: string;
          description?: string | null;
          due_date?: string;
          priority?: TaskPriority;
          status?: TaskStatus;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_student_school_id_fkey";
            columns: ["student_school_id"];
            isOneToOne: false;
            referencedRelation: "student_schools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          id: string;
          student_id: string;
          coach_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          coach_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          coach_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_coach_id_fkey";
            columns: ["coach_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          message_type: MessageType;
          related_essay_id: string | null;
          related_school_id: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          message_type?: MessageType;
          related_essay_id?: string | null;
          related_school_id?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          read_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_related_essay_id_fkey";
            columns: ["related_essay_id"];
            isOneToOne: false;
            referencedRelation: "essays";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_related_school_id_fkey";
            columns: ["related_school_id"];
            isOneToOne: false;
            referencedRelation: "student_schools";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body: string;
          related_url: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type?: NotificationType;
          title: string;
          body: string;
          related_url?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          read?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      application_type: ApplicationType;
      student_status: StudentStatus;
      application_status: SchoolApplicationStatus;
      requirement_type: RequirementType;
      essay_status: EssayStatus;
      feedback_type: FeedbackType;
      feedback_status: FeedbackStatus;
      activity_category: ActivityCategory;
      document_category: DocumentCategory;
      task_priority: TaskPriority;
      task_status: TaskStatus;
      message_type: MessageType;
      notification_type: NotificationType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// ─── Convenience Row Types ──────────────────────────────────────────────────

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type StudentProfile = Database["public"]["Tables"]["student_profiles"]["Row"];
export type StudentProfileInsert = Database["public"]["Tables"]["student_profiles"]["Insert"];
export type StudentProfileUpdate = Database["public"]["Tables"]["student_profiles"]["Update"];

export type CoachProfile = Database["public"]["Tables"]["coach_profiles"]["Row"];
export type CoachProfileInsert = Database["public"]["Tables"]["coach_profiles"]["Insert"];
export type CoachProfileUpdate = Database["public"]["Tables"]["coach_profiles"]["Update"];

// ─── Joined Types (for queries with joins) ──────────────────────────────────

export type StudentWithProfile = StudentProfile & {
  profiles: Profile;
};

export type CoachWithProfile = CoachProfile & {
  profiles: Profile;
};

export type StudentWithCoach = StudentProfile & {
  profiles: Profile;
  coach: Profile | null;
};

// ─── School Management Types ────────────────────────────────────────────────

export type StudentSchool = Database["public"]["Tables"]["student_schools"]["Row"];
export type StudentSchoolInsert = Database["public"]["Tables"]["student_schools"]["Insert"];
export type StudentSchoolUpdate = Database["public"]["Tables"]["student_schools"]["Update"];

export type SchoolRequirement = Database["public"]["Tables"]["school_requirements"]["Row"];
export type SchoolRequirementInsert = Database["public"]["Tables"]["school_requirements"]["Insert"];
export type SchoolRequirementUpdate = Database["public"]["Tables"]["school_requirements"]["Update"];

export type StudentSchoolWithRequirements = StudentSchool & {
  school_requirements: SchoolRequirement[];
};

// ─── Essay Management Types ────────────────────────────────────────────────

export type Essay = Database["public"]["Tables"]["essays"]["Row"];
export type EssayInsert = Database["public"]["Tables"]["essays"]["Insert"];
export type EssayUpdate = Database["public"]["Tables"]["essays"]["Update"];

export type EssayVersion = Database["public"]["Tables"]["essay_versions"]["Row"];
export type EssayVersionInsert = Database["public"]["Tables"]["essay_versions"]["Insert"];

export type EssayFeedback = Database["public"]["Tables"]["essay_feedback"]["Row"];
export type EssayFeedbackInsert = Database["public"]["Tables"]["essay_feedback"]["Insert"];

export type EssayWithRelations = Essay & {
  student_schools: { school_name: string } | null;
  essay_versions: EssayVersion[];
  essay_feedback: EssayFeedback[];
};

export type EssayListItem = Essay & {
  student_schools: { school_name: string } | null;
  essay_feedback: { id: string; status: FeedbackStatus }[];
};

// ─── Activity Types ───────────────────────────────────────────────────────

export type Activity = Database["public"]["Tables"]["activities"]["Row"];
export type ActivityInsert = Database["public"]["Tables"]["activities"]["Insert"];
export type ActivityUpdate = Database["public"]["Tables"]["activities"]["Update"];

// ─── Document Types ───────────────────────────────────────────────────────
// Named StudentDocument to avoid collision with DOM Document type

export type StudentDocument = Database["public"]["Tables"]["documents"]["Row"];
export type StudentDocumentInsert = Database["public"]["Tables"]["documents"]["Insert"];

export type DocumentWithUploader = StudentDocument & {
  profiles: { first_name: string; last_name: string };
};

// ─── Task Types ───────────────────────────────────────────────────────────

export type StudentTask = Database["public"]["Tables"]["tasks"]["Row"];
export type StudentTaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
export type StudentTaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

export type TaskWithSchool = StudentTask & {
  student_schools: { school_name: string } | null;
};

// ─── Messaging Types ────────────────────────────────────────────────────────

export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type ConversationInsert = Database["public"]["Tables"]["conversations"]["Insert"];

export type ChatMessage = Database["public"]["Tables"]["messages"]["Row"];
export type ChatMessageInsert = Database["public"]["Tables"]["messages"]["Insert"];
export type ChatMessageUpdate = Database["public"]["Tables"]["messages"]["Update"];

export type MessageWithSender = ChatMessage & {
  profiles: Pick<Profile, "id" | "first_name" | "last_name" | "avatar_url">;
  essays: { id: string; title: string } | null;
  student_schools: { id: string; school_name: string } | null;
};

// ─── Notification Types ────────────────────────────────────────────────────

export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"];
