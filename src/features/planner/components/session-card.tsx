"use client";

import * as React from "react";
import { Check, GripVertical, Square, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatMinutes } from "@/lib/week";
import { SESSION_TYPE_LABELS, type PlannerSession, type SessionType } from "@/types";

const TYPE_CONFIG: Record<
  SessionType,
  { color: string; bg: string }
> = {
  golf: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
  },
  round: {
    color: "#22d3ee",
    bg: "rgba(34,211,238,0.12)",
  },
  workout: {
    color: "#fb7185",
    bg: "rgba(251,113,133,0.12)",
  },
  recovery: {
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.12)",
  },
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
  const cfg = TYPE_CONFIG[session.type];
  const typeLabel = SESSION_TYPE_LABELS[session.type] ?? session.type;
  const duration = formatMinutes(session.plannedDuration);

  const handleBodyClick = () => {
    if (session.completed) onEditLog(session);
    else onCompleteClick(session);
  };

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
      style={{ borderLeft: `3px solid ${cfg.color}`, background: cfg.bg }}
      className={cn(
        "group relative flex w-full min-w-0 cursor-pointer flex-col gap-1.5 overflow-hidden rounded-[9px] p-3 text-left transition-all",
        "hover:-translate-y-[2px]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        isDragging && "opacity-40",
        session.completed && "opacity-60",
      )}
    >
      {/* Type label + duration */}
      <div className="flex items-center justify-between gap-1.5">
        <span
          style={{ color: cfg.color }}
          className="text-[9px] font-black uppercase tracking-[.08em]"
        >
          {typeLabel}
        </span>
        <span className="font-mono text-[10px] font-semibold text-muted-foreground">
          {duration}
        </span>
      </div>

      {/* Title */}
      <div className="flex min-w-0 items-start gap-1">
        <GripVertical
          className="mt-0.5 h-3 w-3 shrink-0 cursor-grab text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden
        />
        <div
          className={cn(
            "min-w-0 flex-1 text-[12.5px] font-bold leading-snug text-foreground",
            session.completed && "text-muted-foreground line-through",
          )}
          title={session.title ?? undefined}
        >
          {session.title ?? typeLabel}
        </div>
      </div>

      {/* Focus/notes */}
      {session.focus ? (
        <div className="truncate text-[11px] text-muted-foreground">
          {session.focus}
        </div>
      ) : null}

      {/* Footer: complete + delete */}
      <div className="mt-0.5 flex min-w-0 items-center gap-1">
        <button
          type="button"
          onClick={handleCheckbox}
          className={cn(
            "-mx-0.5 flex min-w-0 flex-1 items-center gap-1.5 rounded px-1 py-0.5 text-[11px] font-semibold transition-colors",
            "hover:bg-black/10 dark:hover:bg-white/10",
            session.completed ? "text-positive" : "text-muted-foreground",
          )}
        >
          <span
            className={cn(
              "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors",
              session.completed
                ? "border-positive/40 bg-positive/10"
                : "border-border bg-background",
            )}
            aria-hidden
          >
            {session.completed ? (
              <Check className="h-2.5 w-2.5 text-positive" />
            ) : (
              <Square className="h-2 w-2 text-transparent" />
            )}
          </span>
          <span className="truncate">
            {session.completed ? "Completed" : "Mark complete"}
          </span>
        </button>

        <button
          type="button"
          onClick={handleDelete}
          aria-label="Delete session"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity",
            "hover:bg-destructive/15 hover:text-destructive",
            "group-hover:opacity-100 focus:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
});
