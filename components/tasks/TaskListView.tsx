"use client";

import { useMemo, useState } from "react";
import {
  parseISO,
  isBefore,
  isToday,
  isThisWeek,
  startOfDay,
} from "date-fns";
import { ChevronDown, ChevronRight } from "lucide-react";
import { TaskCard } from "./TaskCard";
import type { TaskWithSchool } from "@/types/database";

interface TaskListViewProps {
  tasks: TaskWithSchool[];
}

interface TaskGroup {
  label: string;
  tasks: TaskWithSchool[];
  color: string;
}

export function TaskListView({ tasks }: TaskListViewProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const groups = useMemo(() => {
    const today = startOfDay(new Date());
    const result: TaskGroup[] = [];

    const overdue: TaskWithSchool[] = [];
    const todayTasks: TaskWithSchool[] = [];
    const thisWeek: TaskWithSchool[] = [];
    const later: TaskWithSchool[] = [];
    const completed: TaskWithSchool[] = [];

    tasks.forEach((task) => {
      if (task.status === "completed") {
        completed.push(task);
        return;
      }

      const dueDate = parseISO(task.due_date);

      if (isBefore(dueDate, today) && !isToday(dueDate)) {
        overdue.push(task);
      } else if (isToday(dueDate)) {
        todayTasks.push(task);
      } else if (isThisWeek(dueDate, { weekStartsOn: 0 })) {
        thisWeek.push(task);
      } else {
        later.push(task);
      }
    });

    if (overdue.length > 0)
      result.push({
        label: "Overdue",
        tasks: overdue,
        color: "text-burgundy-400",
      });
    if (todayTasks.length > 0)
      result.push({
        label: "Today",
        tasks: todayTasks,
        color: "text-gold-400",
      });
    if (thisWeek.length > 0)
      result.push({
        label: "This Week",
        tasks: thisWeek,
        color: "text-ivory-300",
      });
    if (later.length > 0)
      result.push({
        label: "Later",
        tasks: later,
        color: "text-ivory-400",
      });
    if (completed.length > 0)
      result.push({
        label: "Completed",
        tasks: completed,
        color: "text-ivory-600",
      });

    return result;
  }, [tasks]);

  const toggleCollapse = (label: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => {
        const isCollapsed = collapsed.has(group.label);

        return (
          <section key={group.label}>
            <button
              onClick={() => toggleCollapse(group.label)}
              className="mb-3 flex items-center gap-2"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-ivory-600" />
              ) : (
                <ChevronDown className="h-4 w-4 text-ivory-600" />
              )}
              <h3
                className={`font-serif text-heading-sm ${group.color}`}
              >
                {group.label}
              </h3>
              <span className="rounded-full bg-navy-800 px-2 py-0.5 font-sans text-caption text-ivory-600">
                {group.tasks.length}
              </span>
            </button>

            {!isCollapsed && (
              <div className="space-y-2">
                {group.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
