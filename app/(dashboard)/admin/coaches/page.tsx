"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Loader2 } from "lucide-react";
import { Table, Avatar, Badge, ProgressBar } from "@/components/ui";
import { CoachDetailModal } from "@/components/admin/CoachDetailModal";
import { fetchAllCoaches } from "@/lib/actions/admin";
import type { AdminCoach } from "@/lib/actions/admin";
import type { TableColumn } from "@/components/ui";

export default function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<AdminCoach[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detailCoach, setDetailCoach] = useState<AdminCoach | null>(null);

  useEffect(() => {
    fetchAllCoaches().then((res) => {
      if (res.data) setCoaches(res.data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return coaches;
    const q = search.toLowerCase();
    return coaches.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.specializations.some((s) => s.toLowerCase().includes(q))
    );
  }, [coaches, search]);

  const columns: TableColumn<AdminCoach & Record<string, unknown>>[] = [
    {
      key: "name",
      header: "Coach",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar
            name={`${row.firstName} ${row.lastName}`}
            src={row.avatarUrl}
            size="sm"
          />
          <div>
            <p className="font-sans text-body-sm font-medium text-navy-900">
              {row.firstName} {row.lastName}
            </p>
            <p className="font-sans text-caption text-charcoal-400">
              {row.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "specializations",
      header: "Specializations",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {(row.specializations as string[]).length > 0 ? (
            (row.specializations as string[]).map((s) => (
              <Badge key={s} variant="premium" size="sm">
                {s}
              </Badge>
            ))
          ) : (
            <span className="font-sans text-caption text-charcoal-400">
              None
            </span>
          )}
        </div>
      ),
    },
    {
      key: "activeStudentCount",
      header: "Students",
      sortable: true,
      render: (row) => (
        <span className="font-sans text-body-sm text-charcoal-700">
          {row.activeStudentCount as number} / {row.maxStudents as number}
        </span>
      ),
    },
    {
      key: "utilization",
      header: "Utilization",
      sortable: true,
      width: "180px",
      render: (row) => (
        <ProgressBar
          value={row.activeStudentCount as number}
          max={row.maxStudents as number}
          size="sm"
          showValue
        />
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      sortable: true,
      render: (row) => (
        <span className="font-sans text-caption text-charcoal-500">
          {new Date(row.createdAt as string).toLocaleDateString()}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-charcoal-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-display text-navy-900">
          Coach Management
        </h1>
        <p className="mt-1 font-sans text-body-sm text-charcoal-400">
          {coaches.length} total coaches
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
        <input
          type="text"
          placeholder="Search by name, email, or specialization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-ivory-400 bg-white py-2.5 pl-10 pr-4 font-sans text-body-sm text-navy-900 placeholder:text-charcoal-300 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filtered as (AdminCoach & Record<string, unknown>)[]}
        pageSize={15}
        emptyTitle="No coaches found"
        emptyDescription="Coaches will appear here when they register."
        onRowClick={(row) => setDetailCoach(row)}
        getRowKey={(row) => row.id}
      />

      {/* Coach Detail Modal */}
      <CoachDetailModal
        coach={detailCoach}
        onClose={() => setDetailCoach(null)}
      />
    </div>
  );
}
