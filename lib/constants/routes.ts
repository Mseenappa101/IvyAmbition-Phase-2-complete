export const ROUTES = {
  home: "/",
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    forgotPassword: "/auth/forgot-password",
  },
  onboarding: {
    student: "/student-onboarding",
    coach: "/coach-onboarding",
  },
  dashboard: {
    student: "/student",
    coach: "/coach",
    admin: "/admin",
  },
  schools: {
    list: "/student/schools",
    detail: (id: string) => `/student/schools/${id}`,
  },
  essays: {
    list: "/student/essays",
    detail: (id: string) => `/student/essays/${id}`,
  },
  activities: {
    list: "/student/activities",
  },
  documents: {
    list: "/student/documents",
  },
  tasks: {
    list: "/student/tasks",
  },
  messages: {
    list: "/student/messages",
  },
} as const;
