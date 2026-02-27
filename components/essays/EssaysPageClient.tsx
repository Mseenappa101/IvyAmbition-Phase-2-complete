"use client";

import { useEffect, useMemo } from "react";
import { Plus, FileEdit } from "lucide-react";
import { Button } from "@/components/ui";
import { fetchStudentEssays } from "@/lib/actions/essays";
import { useEssaysStore } from "@/hooks/use-essays-store";
import { EssayCard } from "./EssayCard";
import { NewEssayModal } from "./NewEssayModal";
import type { EssayListItem } from "@/types/database";

export function EssaysPageClient() {
  const {
    essays,
    isLoading,
    isNewModalOpen,
    error,
    setEssays,
    setError,
    setNewModalOpen,
  } = useEssaysStore();

  useEffect(() => {
    const load = async () => {
      const { data, error: fetchError } = await fetchStudentEssays();
      if (fetchError) {
        setError(fetchError);
        return;
      }
      setEssays((data as EssayListItem[]) ?? []);
    };
    load();
  }, [setEssays, setError]);

  const grouped = useMemo(() => {
    const general = essays.filter((e) => !e.student_school_id);
    const bySchool = new Map<string, EssayListItem[]>();

    essays
      .filter((e) => e.student_school_id)
      .forEach((e) => {
        const name = e.student_schools?.school_name ?? "Unknown School";
        if (!bySchool.has(name)) bySchool.set(name, []);
        bySchool.get(name)!.push(e);
      });

    return { general, bySchool };
  }, [essays]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 animate-pulse rounded-lg bg-navy-800/60" />
            <div className="mt-2 h-4 w-72 animate-pulse rounded bg-navy-800/40" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded-lg bg-navy-800/60" />
        </div>
        {/* Card skeletons */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-navy-700/30 bg-navy-900/40"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="font-sans text-body text-burgundy-500">
          Failed to load essays: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-display text-ivory-200">My Essays</h1>
          <p className="mt-1 font-sans text-body-sm text-ivory-600">
            Draft, organize, and track all your application essays.
          </p>
        </div>
        <Button
          onClick={() => setNewModalOpen(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          New Essay
        </Button>
      </div>

      {/* Empty State */}
      {essays.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy-700/50 bg-navy-900/30 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-800/80">
            <FileEdit className="h-7 w-7 text-ivory-700" />
          </div>
          <h3 className="mt-4 font-serif text-heading-sm text-ivory-300">
            No essays yet
          </h3>
          <p className="mt-1 max-w-sm font-sans text-body-sm text-ivory-700">
            Start writing your first essay. Personal statements, supplementals,
            diversity essays — organize them all in one place.
          </p>
          <Button
            className="mt-6"
            onClick={() => setNewModalOpen(true)}
            icon={<Plus className="h-4 w-4" />}
          >
            Create Your First Essay
          </Button>
        </div>
      )}

      {/* General Essays */}
      {grouped.general.length > 0 && (
        <section>
          <h2 className="mb-4 font-serif text-heading text-ivory-300">
            General Essays
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {grouped.general.map((essay) => (
              <EssayCard key={essay.id} essay={essay} />
            ))}
          </div>
        </section>
      )}

      {/* By School */}
      {Array.from(grouped.bySchool.entries()).map(([schoolName, schoolEssays]) => (
        <section key={schoolName}>
          <h2 className="mb-4 font-serif text-heading text-ivory-300">
            {schoolName}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {schoolEssays.map((essay) => (
              <EssayCard key={essay.id} essay={essay} />
            ))}
          </div>
        </section>
      ))}

      {/* Modal */}
      <NewEssayModal
        open={isNewModalOpen}
        onClose={() => setNewModalOpen(false)}
      />
    </div>
  );
}
