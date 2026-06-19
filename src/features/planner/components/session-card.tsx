"use client";

import * as React from "react";
import { Check, Circle, GripVertical, Square, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatMinutes } from "@/lib/week";
import {
  SESSION_TYPE_LABELS,
  SESSION_TYPE_SHORT_LABELS,
  type PlannerSession,
} from "@/types";

const TYPE_STYLES: Partial<
  Record<
    PlannerSession["type"],
    { badge: string; panel: string; panelHover: string; ring: string }
  >
> = {
  golf: {
    badge:
      "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
    panel:
      "bg-emerald-50/80 border-emerald-200/50 dark:bg-emerald-950/35 dark:border-emerald-400/20",
    panelHover: "hover:bg-emerald-50/95 dark:hover:bg-emerald-950/45",
    ring: "ring-emerald-500/40",
  },
  round: {
    badge:
      "bg-indigo-500/10 text-indigo-700 border-indigo-500/20 dark:text-indigo-400",
    panel:
      "bg-indigo-50/80 border-indigo-200/50 dark:bg-indigo-950/35 dark:border-indigo-400/20",
    panelHover: "hover:bg-indigo-50/95 dark:hover:bg-indigo-950/45",
    ring: "ring-indigo-500/40",
  },
  workout: {
    badge:
      "bg-violet-500/10 text-violet-700 border-violet-500/20 dark:text-violet-400",
    panel:
      "bg-violet-50/80 border-violet-200/50 dark:bg-violet-950/35 dark:border-violet-400/20",
    panelHover: "hover:bg-violet-50/95 dark:hover:bg-violet-950/45",
    ring: "ring-violet-500/40",
  },
  recovery: {
    badge:
      "bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-400",
    panel:
      "bg-sky-50/80 border-sky-200/50 dark:bg-sky-950/35 dark:border-sky-400/20",
    panelHover: "hover:bg-sky-50/95 dark:hover:bg-sky-950/45",
    ring: "ring-sky-500/40",
  },
};

const FALLBACK_TYPE_STYLE = {
  badge: "bg-muted text-muted-foreground border-border",
  panel: "bg-card border-border",
  panelHover: "hover:bg-accent/20",
  ring: "ring-muted-foreground/40",
};

interface SessionCardProps {
  session: PlannerSession;
  isDragging: boolean;
  onDragStart: (session: PlannerSession) => void;
  onDragEnd: () => void;
  onCompleteClick: (session: PlannerSession) => void;
  onUndoComplete: (session: PlannerSession) => void;
  onEditLog: (session: PlannerSession) => void;
  onDelete: (session: PlannerSession) => void;
}

export const SessionCard = React.memo(function SessionCard({
  session,
  isDragging,
  onDragStart,
  onDragEnd,
  onCompleteClick,
  onUndoComplete,
  onEditLog,
  onDelete,
}: SessionCardProps) {
  const style = TYPE_STYLES[session.type] ?? FALLBACK_TYPE_STYLE;
  const fullLabel = SESSION_TYPE_LABELS[session.type] ?? session.type;
  const shortLabel = SESSION_TYPE_SHORT_LABELS[session.type] ?? session.type;

  // Click on the body opens the dialog (in "edit log" mode for completed
  // sessions, "fill log + complete" mode otherwise) — matches what the
  // checkbox does for unfinished sessions, and what the planner expects.
  const handleBodyClick = () => {
    if (session.completed) onEditLog(session);
    else onCompleteClick(session);
  };

  // The checkbox toggles completion: ticking opens the log dialog so the user
  // can fill in details before finalizing; un-ticking just undoes.
  const handleCheckbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (session.completed) onUndoComplete(session);
    else onCompleteClick(session);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(session);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleBodyClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleBodyClick();
        }
      }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", session.id);
        onDragStart(session);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative flex w-full min-w-0 cursor-pointer flex-col gap-2 overflow-hidden rounded-xl border p-3 text-left shadow-[0_12px_32px_-22px_rgba(16,24,40,0.20)] transition-all",
        style.panel,
        style.panelHover,
        "hover:shadow-[0_14px_34px_-20px_rgba(16,24,40,0.24)] hover:-translate-y-[1px]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        isDragging && "opacity-40",
        session.completed && "opacity-90",
      )}
    >
      {/* Top row: type badge + duration */}
      <div className="flex min-w-0 items-center gap-1.5">
        <span
          className={cn(
            "inline-flex shrink-0 items-center whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            style.badge,
          )}
          title={fullLabel}
        >
          {shortLabel}
        </span>
        <span className="ml-auto shrink-0 rounded-md bg-background/70 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-foreground/70 shadow-sm">
          {formatMinutes(session.plannedDuration)}
        </span>
      </div>

      {/* Title row (with drag handle visible on hover) */}
      <div className="flex min-w-0 items-start gap-1">
        <GripVertical
          className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground/60 opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              "truncate text-sm font-semibold leading-tight text-foreground",
              session.completed && "text-muted-foreground line-through",
            )}
            title={session.title ?? undefined}
          >
            {session.title ?? fullLabel}
          </div>
          {session.focus ? (
            <div
              className="mt-0.5 truncate text-[11px] text-muted-foreground"
              title={session.focus}
            >
              <span className="inline-flex items-center gap-1.5">
                <Circle className="h-3 w-3 text-muted-foreground/60" />
                <span className="truncate">{session.focus}</span>
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Footer: Mark-complete checkbox + (hover) delete */}
      <div className="mt-0.5 flex min-w-0 items-center gap-1">
        <button
          type="button"
          onClick={handleCheckbox}
          className={cn(
            "-mx-0.5 flex min-w-0 flex-1 items-center gap-1.5 rounded px-1 py-0.5 text-[11px] transition-colors",
            "hover:bg-accent/50",
            session.completed
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-muted-foreground",
          )}
        >
          <span
            className={cn(
              "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
              session.completed
                ? "border-emerald-500/40 bg-emerald-500/10"
                : "border-border bg-background",
            )}
            aria-hidden
          >
            {session.completed ? (
              <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Square className="h-2.5 w-2.5 text-transparent" />
            )}
          </span>
          <span className="truncate font-medium">
            {session.completed ? "Completed" : "Mark complete"}
          </span>
        </button>

        <button
          type="button"
          onClick={handleDelete}
          aria-label="Delete session"
          title="Delete session"
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground/70 opacity-0 transition-opacity",
            "hover:bg-destructive/10 hover:text-destructive",
            "group-hover:opacity-100 focus:opacity-100",
          )}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
});
