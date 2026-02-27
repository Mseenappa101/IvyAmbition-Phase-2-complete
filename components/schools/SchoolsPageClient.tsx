"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui";
import { useSchoolsStore } from "@/hooks/use-schools-store";
import { fetchStudentSchools } from "@/lib/actions/schools";
import { createClient } from "@/lib/supabase/client";
import { KanbanBoard } from "./KanbanBoard";
import { SchoolsTable } from "./SchoolsTable";
import { AddSchoolModal } from "./AddSchoolModal";
import { cn } from "@/lib/utils/cn";
import type { ApplicationType } from "@/types";

export function SchoolsPageClient() {
  const {
    schools,
    viewMode,
    isLoading,
    isAddModalOpen,
    setSchools,
    setViewMode,
    setAddModalOpen,
    setError,
  } = useSchoolsStore();

  const [applicationType, setApplicationType] =
    useState<ApplicationType>("undergraduate");

  useEffect(() => {
    async function load() {
      // Fetch schools
      const { data, error } = await fetchStudentSchools();
      if (error) {
        setError(error);
        return;
      }
      setSchools(data ?? []);

      // Fetch student's application_type
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const { data: sp } = await supabase
          .from("student_profiles")
          .select("application_type")
          .eq("user_id", session.user.id)
          .single();
        if (sp?.application_type) {
          setApplicationType(sp.application_type as ApplicationType);
        }
      }
    }
    load();
  }, [setSchools, setError]);

  const existingSlugs = useMemo(
    () => new Set(schools.map((s) => s.school_slug)),
    [schools]
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-10 w-48 animate-pulse rounded-lg bg-navy-800/60" />
          <div className="mt-2 h-5 w-72 animate-pulse rounded-lg bg-navy-800/40" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="min-w-[260px] rounded-2xl border border-navy-700/50 bg-navy-900/40 p-4"
            >
              <div className="h-4 w-24 animate-pulse rounded bg-navy-800/60" />
              <div className="mt-4 space-y-3">
                <div className="h-20 animate-pulse rounded-xl bg-navy-800/40" />
                <div className="h-20 animate-pulse rounded-xl bg-navy-800/40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-display text-ivory-200">My Schools</h1>
          <p className="mt-1 font-sans text-body-lg text-ivory-600">
            Track your applications and requirements for each school.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setAddModalOpen(true)}
          className="shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add School
        </Button>
      </div>

      {/* View Toggle + Content */}
      {schools.length > 0 && (
        <>
          <div className="flex items-center gap-1 rounded-xl bg-navy-900/60 p-1 w-fit">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-2 font-sans text-caption font-medium transition-all",
                viewMode === "kanban"
                  ? "bg-gold-500/15 text-gold-400"
                  : "text-ivory-600 hover:text-ivory-400"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Board
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-2 font-sans text-caption font-medium transition-all",
                viewMode === "table"
                  ? "bg-gold-500/15 text-gold-400"
                  : "text-ivory-600 hover:text-ivory-400"
              )}
            >
              <List className="h-3.5 w-3.5" />
              Table
            </button>
          </div>

          {viewMode === "kanban" ? (
            <KanbanBoard />
          ) : (
            <SchoolsTable schools={schools} />
          )}
        </>
      )}

      {/* Empty State */}
      {schools.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-navy-700/50 bg-navy-900/40 px-6 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/10">
            <Plus className="h-7 w-7 text-gold-400" />
          </div>
          <h3 className="font-serif text-heading text-ivory-200">
            No schools added yet
          </h3>
          <p className="mt-1.5 max-w-sm font-sans text-body-sm text-ivory-600">
            Start building your application list by adding schools you&apos;re
            interested in.
          </p>
          <Button
            variant="primary"
            onClick={() => setAddModalOpen(true)}
            className="mt-6"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Your First School
          </Button>
        </div>
      )}

      {/* Add School Modal */}
      <AddSchoolModal
        open={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        applicationType={applicationType}
        existingSlugs={existingSlugs}
      />
    </div>
  );
}
