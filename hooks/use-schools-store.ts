import { create } from "zustand";
import type {
  StudentSchool,
  SchoolRequirement,
  StudentSchoolWithRequirements,
  SchoolApplicationStatus,
} from "@/types/database";

type ViewMode = "kanban" | "table";

interface SchoolsState {
  schools: StudentSchoolWithRequirements[];
  selectedSchool: StudentSchoolWithRequirements | null;
  viewMode: ViewMode;
  isLoading: boolean;
  isAddModalOpen: boolean;
  error: string | null;

  setSchools: (schools: StudentSchoolWithRequirements[]) => void;
  setSelectedSchool: (school: StudentSchoolWithRequirements | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setLoading: (loading: boolean) => void;
  setAddModalOpen: (open: boolean) => void;
  setError: (error: string | null) => void;

  addSchool: (school: StudentSchoolWithRequirements) => void;
  removeSchool: (id: string) => void;
  updateSchoolStatus: (id: string, status: SchoolApplicationStatus) => void;
  updateSchool: (id: string, updates: Partial<StudentSchool>) => void;
  toggleRequirement: (schoolId: string, requirementId: string) => void;
  addRequirement: (schoolId: string, requirement: SchoolRequirement) => void;
  removeRequirement: (schoolId: string, requirementId: string) => void;
}

export const useSchoolsStore = create<SchoolsState>((set) => ({
  schools: [],
  selectedSchool: null,
  viewMode: "kanban",
  isLoading: true,
  isAddModalOpen: false,
  error: null,

  setSchools: (schools) => set({ schools, isLoading: false }),
  setSelectedSchool: (selectedSchool) => set({ selectedSchool }),
  setViewMode: (viewMode) => set({ viewMode }),
  setLoading: (isLoading) => set({ isLoading }),
  setAddModalOpen: (isAddModalOpen) => set({ isAddModalOpen }),
  setError: (error) => set({ error }),

  addSchool: (school) =>
    set((s) => ({ schools: [...s.schools, school] })),

  removeSchool: (id) =>
    set((s) => ({ schools: s.schools.filter((sc) => sc.id !== id) })),

  updateSchoolStatus: (id, status) =>
    set((s) => ({
      schools: s.schools.map((sc) =>
        sc.id === id ? { ...sc, status } : sc
      ),
    })),

  updateSchool: (id, updates) =>
    set((s) => ({
      schools: s.schools.map((sc) =>
        sc.id === id ? { ...sc, ...updates } : sc
      ),
    })),

  toggleRequirement: (schoolId, requirementId) =>
    set((s) => ({
      schools: s.schools.map((sc) =>
        sc.id === schoolId
          ? {
              ...sc,
              school_requirements: sc.school_requirements.map((req) =>
                req.id === requirementId
                  ? { ...req, is_completed: !req.is_completed }
                  : req
              ),
            }
          : sc
      ),
    })),

  addRequirement: (schoolId, requirement) =>
    set((s) => ({
      schools: s.schools.map((sc) =>
        sc.id === schoolId
          ? {
              ...sc,
              school_requirements: [...sc.school_requirements, requirement],
            }
          : sc
      ),
    })),

  removeRequirement: (schoolId, requirementId) =>
    set((s) => ({
      schools: s.schools.map((sc) =>
        sc.id === schoolId
          ? {
              ...sc,
              school_requirements: sc.school_requirements.filter(
                (req) => req.id !== requirementId
              ),
            }
          : sc
      ),
    })),
}));
