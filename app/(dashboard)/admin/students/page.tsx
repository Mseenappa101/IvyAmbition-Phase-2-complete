"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Download,
  UserPlus,
  Loader2,
} from "lucide-react";
import {
  Table,
  Avatar,
  Badge,
  Modal,
  Button,
} from "@/components/ui";
import { StudentDetailModal } from "@/components/admin/StudentDetailModal";
import {
  fetchAllStudents,
  fetchAllCoaches,
  bulkAssignCoach,
  exportStudentsCSV,
} from "@/lib/actions/admin";
import type { AdminStudent, AdminCoach } from "@/lib/actions/admin";
import type { TableColumn } from "@/components/ui";
import { toast } from "react-hot-toast";

const statusVariant: Record<string, "success" | "warning" | "neutral" | "info"> = {
  active: "success",
  paused: "warning",
  onboarding: "info",
  completed: "neutral",
};

const typeLabel: Record<string, string> = {
  undergraduate: "Undergrad",
  law_school: "Law",
  transfer: "Transfer",
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [coaches, setCoaches] = useState<AdminCoach[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailStudent, setDetailStudent] = useState<AdminStudent | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignCoachId, setAssignCoachId] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [studentsRes, coachesRes] = await Promise.all([
      fetchAllStudents(),
      fetchAllCoaches(),
    ]);
    if (studentsRes.data) setStudents(studentsRes.data);
    if (coachesRes.data) setCoaches(coachesRes.data);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    );
  }, [students, search]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((s) => s.id)));
    }
  };

  const handleBulkAssign = async () => {
    if (!assignCoachId || selected.size === 0) return;
    setAssigning(true);
    const result = await bulkAssignCoach(Array.from(selected), assignCoachId);
    if (result.success) {
      toast.success(`Assigned ${selected.size} student(s) successfully`);
      setSelected(new Set());
      setAssignModalOpen(false);
      setAssignCoachId("");
      await loadData();
    } else {
      toast.error(result.error ?? "Failed to assign");
    }
    setAssigning(false);
  };

  const handleExportCSV = async () => {
    const result = await exportStudentsCSV();
    if (result.data) {
      const blob = new Blob([result.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `students-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported");
    } else {
      toast.error("Export failed");
    }
  };

  const columns: TableColumn<AdminStudent & Record<string, unknown>>[] = [
    {
      key: "select",
      header: "",
      width: "40px",
      render: (row) => (
        <input
          type="checkbox"
          checked={selected.has(row.id)}
          onChange={(e) => {
            e.stopPropagation();
            toggleSelect(row.id);
          }}
          className="h-4 w-4 rounded border-charcoal-300 text-gold-500 focus:ring-gold-500"
        />
      ),
    },
    {
      key: "name",
      header: "Student",
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
      key: "applicationType",
      header: "Type",
      sortable: true,
      render: (row) => (
        <Badge variant="premium" size="sm">
          {typeLabel[row.applicationType] ?? row.applicationType}
        </Badge>
      ),
    },
    {
      key: "coachName",
      header: "Coach",
      sortable: true,
      render: (row) =>
        row.coachName ? (
          <span className="font-sans text-body-sm text-charcoal-700">
            {row.coachName}
          </span>
        ) : (
          <Badge variant="warning" size="sm">
            Unassigned
          </Badge>
        ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => (
        <Badge variant={statusVariant[row.status] ?? "neutral"} size="sm" dot>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "schoolCount",
      header: "Schools",
      sortable: true,
    },
    {
      key: "essayCount",
      header: "Essays",
      sortable: true,
    },
    {
      key: "signupDate",
      header: "Joined",
      sortable: true,
      render: (row) => (
        <span className="font-sans text-caption text-charcoal-500">
          {new Date(row.signupDate).toLocaleDateString()}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-display text-navy-900">
            Student Management
          </h1>
          <p className="mt-1 font-sans text-body-sm text-charcoal-400">
            {students.length} total students
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selected.size > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setAssignModalOpen(true)}
            >
              <UserPlus className="mr-1.5 h-4 w-4" />
              Assign Coach ({selected.size})
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download className="mr-1.5 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search + Select All */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-ivory-400 bg-white py-2.5 pl-10 pr-4 font-sans text-body-sm text-navy-900 placeholder:text-charcoal-300 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
          />
        </div>
        <button
          onClick={toggleAll}
          className="shrink-0 font-sans text-caption font-medium text-charcoal-500 hover:text-navy-900"
        >
          {selected.size === filtered.length ? "Deselect All" : "Select All"}
        </button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filtered as (AdminStudent & Record<string, unknown>)[]}
        pageSize={15}
        emptyTitle="No students found"
        emptyDescription="Students will appear here when they sign up."
        onRowClick={(row) => setDetailStudent(row)}
        getRowKey={(row) => row.id}
      />

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={detailStudent}
        onClose={() => setDetailStudent(null)}
      />

      {/* Bulk Assign Modal */}
      <Modal
        open={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setAssignCoachId("");
        }}
        title="Assign Coach"
        description={`Assign ${selected.size} selected student(s) to a coach`}
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setAssignModalOpen(false);
                setAssignCoachId("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleBulkAssign}
              disabled={!assignCoachId || assigning}
            >
              {assigning ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-1.5 h-4 w-4" />
              )}
              Assign
            </Button>
          </>
        }
      >
        <select
          value={assignCoachId}
          onChange={(e) => setAssignCoachId(e.target.value)}
          className="w-full rounded-xl border border-ivory-400 bg-white px-4 py-3 font-sans text-body-sm text-navy-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        >
          <option value="">Select a coach...</option>
          {coaches.map((c) => (
            <option key={c.userId} value={c.userId}>
              {c.firstName} {c.lastName} ({c.activeStudentCount}/{c.maxStudents}{" "}
              students)
            </option>
          ))}
        </select>
      </Modal>
    </div>
  );
}
