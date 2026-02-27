"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useEssayEditorStore } from "@/hooks/use-essay-editor-store";
import { updateEssayStatus } from "@/lib/actions/essays";
import { brandToast } from "@/components/ui";
import { VersionHistoryPanel } from "./VersionHistoryPanel";
import { FeedbackPanel } from "./FeedbackPanel";
import {
  ALL_ESSAY_STATUSES,
  getEssayStatusLabel,
  EssayStatusBadge,
} from "./EssayStatusBadge";
import type { EssayStatus } from "@/types/database";

const tabs = [
  { key: "versions" as const, label: "Versions" },
  { key: "feedback" as const, label: "Feedback" },
  { key: "status" as const, label: "Status" },
];

export function EssaySidebar() {
  const { essay, sidebarOpen, sidebarTab, setSidebarTab, updateStatus } =
    useEssayEditorStore();

  const handleStatusChange = async (status: EssayStatus) => {
    if (!essay) return;
    updateStatus(status);
    const { error } = await updateEssayStatus(essay.id, status);
    if (error) {
      brandToast.error("Error", "Could not update status.");
      updateStatus(essay.status); // revert
    }
  };

  const feedbackCount =
    essay?.essay_feedback?.filter((f) => f.status === "open").length ?? 0;

  return (
    <AnimatePresence mode="wait">
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="shrink-0 overflow-hidden border-l border-navy-700/50"
        >
          <div className="flex h-full w-[320px] flex-col p-4">
            {/* Tabs */}
            <div className="mb-4 flex gap-1 rounded-lg bg-navy-900/60 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSidebarTab(tab.key)}
                  className={cn(
                    "relative flex-1 rounded-md px-3 py-1.5 font-sans text-caption font-medium transition-colors",
                    sidebarTab === tab.key
                      ? "bg-navy-800 text-gold-400"
                      : "text-ivory-600 hover:text-ivory-400"
                  )}
                >
                  {tab.label}
                  {tab.key === "feedback" && feedbackCount > 0 && (
                    <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-gold-500/20 font-sans text-[10px] font-bold text-gold-400">
                      {feedbackCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {sidebarTab === "versions" && <VersionHistoryPanel />}
              {sidebarTab === "feedback" && <FeedbackPanel />}
              {sidebarTab === "status" && essay && (
                <div className="space-y-3">
                  <p className="font-sans text-caption font-medium uppercase tracking-wider text-ivory-700">
                    Essay Status
                  </p>
                  <div className="space-y-2">
                    {ALL_ESSAY_STATUSES.map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                          essay.status === status
                            ? "border-gold-500/30 bg-gold-500/10"
                            : "border-navy-700/50 bg-navy-900/40 hover:border-navy-600/50"
                        )}
                      >
                        <EssayStatusBadge status={status} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
