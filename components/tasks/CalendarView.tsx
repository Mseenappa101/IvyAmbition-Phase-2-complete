"use client";

import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isBefore,
  startOfDay,
  format,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip } from "@/components/ui";
import { TASK_PRIORITY_COLORS } from "@/lib/constants/activities";
import type { TaskWithSchool } from "@/types/database";

interface CalendarViewProps {
  tasks: TaskWithSchool[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView({
  tasks,
  currentMonth,
  onMonthChange,
}: CalendarViewProps) {
  // Generate all days to display in the calendar grid
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  // Index tasks by date string for fast lookup
  const tasksByDate = useMemo(() => {
    const map = new Map<string, TaskWithSchool[]>();
    tasks.forEach((task) => {
      const key = task.due_date; // already YYYY-MM-DD
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(task);
    });
    return map;
  }, [tasks]);

  const today = startOfDay(new Date());

  return (
    <div>
      {/* Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ivory-500 transition-colors hover:bg-navy-800 hover:text-ivory-300"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="font-serif text-heading text-ivory-200">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <button
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ivory-500 transition-colors hover:bg-navy-800 hover:text-ivory-300"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="mb-1 grid grid-cols-7">
        {DAY_NAMES.map((day) => (
          <div
            key={day}
            className="py-2 text-center font-sans text-caption font-medium text-ivory-600"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px rounded-xl border border-navy-700/30 bg-navy-700/20 overflow-hidden">
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayTasks = tasksByDate.get(dateKey) ?? [];
          const inCurrentMonth = isSameMonth(day, currentMonth);
          const isCurrentDay = isToday(day);

          // Limit dots to 3, show overflow
          const visibleTasks = dayTasks.slice(0, 3);
          const overflow = dayTasks.length - 3;

          // Build tooltip content
          const tooltipContent = dayTasks.length > 0
            ? dayTasks.map((t) => t.title).join("\n")
            : "";

          const cell = (
            <div
              key={dateKey}
              className={`min-h-[80px] bg-navy-900/60 p-1.5 transition-colors ${
                !inCurrentMonth ? "opacity-40" : ""
              } ${isCurrentDay ? "ring-1 ring-inset ring-gold-500/30" : ""}`}
            >
              {/* Day number */}
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-sans text-caption ${
                  isCurrentDay
                    ? "bg-gold-500 font-bold text-navy-900"
                    : "text-ivory-400"
                }`}
              >
                {format(day, "d")}
              </span>

              {/* Task dots */}
              {visibleTasks.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {visibleTasks.map((task) => {
                    const isOverdue =
                      task.status !== "completed" &&
                      isBefore(parseISO(task.due_date), today);

                    return (
                      <div
                        key={task.id}
                        className={`h-2 w-2 rounded-full ${
                          task.status === "completed"
                            ? "bg-ivory-700"
                            : isOverdue
                              ? "ring-1 ring-burgundy-400 " + TASK_PRIORITY_COLORS[task.priority]
                              : TASK_PRIORITY_COLORS[task.priority]
                        }`}
                      />
                    );
                  })}
                  {overflow > 0 && (
                    <span className="font-sans text-[10px] text-ivory-600">
                      +{overflow}
                    </span>
                  )}
                </div>
              )}
            </div>
          );

          // Wrap in tooltip if tasks exist
          if (dayTasks.length > 0) {
            return (
              <Tooltip key={dateKey} content={tooltipContent} position="top">
                {cell}
              </Tooltip>
            );
          }

          return cell;
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="font-sans text-caption text-ivory-600">Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-gold-500" />
          <span className="font-sans text-caption text-ivory-600">Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="font-sans text-caption text-ivory-600">High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-burgundy-500" />
          <span className="font-sans text-caption text-ivory-600">Urgent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-ivory-700" />
          <span className="font-sans text-caption text-ivory-600">Completed</span>
        </div>
      </div>
    </div>
  );
}
