"use client";

import { GripVertical, ChevronDown, ChevronUp, Trash2, Sparkles, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui";
import { getCategoryLabel } from "@/lib/constants/activities";
import type { Activity, ApplicationType } from "@/types/database";
import { ActivityForm } from "./ActivityForm";

interface ActivityCardProps {
  activity: Activity;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Record<string, unknown>) => void;
  onDelete: () => void;
  applicationType: ApplicationType;
  isDragOverlay?: boolean;
  dragHandleProps?: Record<string, unknown>;
}

export function ActivityCard({
  activity,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDelete,
  applicationType,
  isDragOverlay,
  dragHandleProps,
}: ActivityCardProps) {
  return (
    <div
      className={`rounded-2xl border bg-navy-900/80 transition-colors ${
        isDragOverlay
          ? "border-gold-500/50 shadow-gold-glow"
          : "border-navy-700/50 hover:border-navy-600/50"
      }`}
    >
      {/* Collapsed header */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Drag handle */}
        <button
          className="flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-lg text-ivory-700 transition-colors hover:bg-navy-800 hover:text-ivory-400 active:cursor-grabbing"
          {...dragHandleProps}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Ranking number */}
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold-500/10 font-sans text-caption font-bold text-gold-400">
          {activity.ranking + 1}
        </span>

        {/* Main info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-serif text-heading-sm text-ivory-200">
              {activity.activity_name}
            </h3>
            <span className="shrink-0 rounded-full bg-navy-800 px-2 py-0.5 font-sans text-caption text-ivory-600">
              {getCategoryLabel(activity.category)}
            </span>
          </div>
          <div className="flex items-center gap-2 font-sans text-caption text-ivory-600">
            {activity.organization && (
              <span>{activity.organization}</span>
            )}
            {activity.organization && activity.position_title && (
              <span className="text-navy-600">·</span>
            )}
            {activity.position_title && (
              <span>{activity.position_title}</span>
            )}
          </div>
        </div>

        {/* Character count */}
        <span className="shrink-0 font-mono text-caption text-ivory-700">
          {activity.character_count} chars
        </span>

        {/* Coach feedback indicator */}
        {activity.coach_feedback && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-500/10">
            <MessageSquare className="h-3 w-3 text-gold-400" />
          </div>
        )}

        {/* Expand toggle */}
        <button
          onClick={onToggleExpand}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ivory-600 transition-colors hover:bg-navy-800 hover:text-ivory-300"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Description preview when collapsed */}
      {!isExpanded && activity.description && (
        <div className="border-t border-navy-700/30 px-4 py-2">
          <p className="truncate font-sans text-caption text-ivory-600">
            {activity.description}
          </p>
        </div>
      )}

      {/* Coach feedback */}
      {!isExpanded && activity.coach_feedback && (
        <div className="border-t border-gold-500/10 bg-gold-500/5 px-4 py-2">
          <p className="font-sans text-caption text-gold-300">
            <span className="font-medium">Coach:</span>{" "}
            {activity.coach_feedback}
          </p>
        </div>
      )}

      {/* Expanded form */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-navy-700/50 px-4 py-4">
              <ActivityForm
                activity={activity}
                applicationType={applicationType}
                onSave={onUpdate}
                onCancel={onToggleExpand}
              />

              {/* Coach feedback in expanded view */}
              {activity.coach_feedback && (
                <div className="mt-4 rounded-xl border border-gold-500/20 bg-gold-500/5 p-4">
                  <h4 className="font-sans text-caption font-medium text-gold-400">
                    Coach Feedback
                  </h4>
                  <p className="mt-1 font-sans text-body-sm text-ivory-300">
                    {activity.coach_feedback}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-4 flex items-center justify-between border-t border-navy-700/30 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="text-ivory-700 hover:text-burgundy-500"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
                <Button variant="ghost" size="sm" disabled>
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Optimize with AI
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
