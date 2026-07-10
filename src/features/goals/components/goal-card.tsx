"use client";

import { CheckCheck, Pencil, RotateCcw, Trash2 } from "lucide-react";

import type { Goal, GoalCategory } from "@/types";

export const GOAL_CATEGORY_CONFIG: Record<
  GoalCategory,
  { label: string; color: string; bg: string }
> = {
  general: { label: "General", color: "#a3e635", bg: "rgba(163,230,53,0.12)" },
  ott: { label: "Off the Tee", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  approach: { label: "Approach", color: "#22d3ee", bg: "rgba(34,211,238,0.12)" },
  shortgame: { label: "Short Game", color: "#fb7185", bg: "rgba(251,113,133,0.12)" },
  putting: { label: "Putting", color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
};

interface GoalCardProps {
  goal: Goal;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

export function GoalCard({ goal, onEdit, onDelete, onToggleStatus }: GoalCardProps) {
  const cfg = GOAL_CATEGORY_CONFIG[goal.category];
  const achieved = goal.status === "achieved";

  return (
    <div
      className="flex flex-col rounded-[10px] border border-border bg-card overflow-hidden transition-opacity"
      style={{
        borderLeft: `3px solid ${cfg.color}`,
        opacity: achieved ? 0.7 : 1,
      }}
    >
      <div className="flex flex-col gap-2 p-4 flex-1">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ color: cfg.color, background: cfg.bg }}
          >
            {cfg.label}
          </span>
          {goal.targetDate && (
            <span className="text-[11px] font-semibold text-muted-foreground">
              {goal.targetDate}
            </span>
          )}
        </div>

        {/* Title */}
        <p
          className="text-[13.5px] font-bold text-foreground leading-snug"
          style={{ textDecoration: achieved ? "line-through" : "none" }}
        >
          {goal.title}
        </p>

        {/* Description */}
        {goal.description && (
          <p className="text-[12px] text-muted-foreground line-clamp-2 leading-snug">
            {goal.description}
          </p>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-1 border-t border-border px-3 py-2">
        <button
          type="button"
          onClick={onToggleStatus}
          className="flex items-center gap-1.5 rounded-[6px] px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {achieved ? (
            <>
              <RotateCcw className="h-3.5 w-3.5" />
              Reopen
            </>
          ) : (
            <>
              <CheckCheck className="h-3.5 w-3.5" />
              Mark achieved
            </>
          )}
        </button>
        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit goal"
            className="flex h-7 w-7 items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete goal"
            className="flex h-7 w-7 items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
