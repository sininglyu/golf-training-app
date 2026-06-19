"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PlannerSession } from "@/types";
import { SessionCard } from "./session-card";

interface DayColumnProps {
  /** Full weekday name, e.g. "Monday". */
  label: string;
  date: Date;
  isToday: boolean;
  sessions: PlannerSession[];
  draggingId: string | null;
  onDragStart: (session: PlannerSession) => void;
  onDragEnd: () => void;
  onDropSession: (sessionId: string, targetDate: Date) => void;
  onAddClick: (date: Date) => void;
  onCompleteClick: (session: PlannerSession) => void;
  onUndoComplete: (session: PlannerSession) => void;
  onEditLog: (session: PlannerSession) => void;
  onDelete: (session: PlannerSession) => void;
}

export const DayColumn = React.memo(function DayColumn({
  label,
  date,
  isToday,
  sessions,
  draggingId,
  onDragStart,
  onDragEnd,
  onDropSession,
  onAddClick,
  onCompleteClick,
  onUndoComplete,
  onEditLog,
  onDelete,
}: DayColumnProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const shortLabel = label.slice(0, 3).toUpperCase();
  const dayNumber = date.getDate();

  return (
    <div
      className={cn(
        "flex min-h-[272px] min-w-0 flex-col overflow-hidden rounded-xl border-2 border-border bg-card shadow-sm",
        "transition-[border-color,background-color,box-shadow] duration-150",
        // Green hover highlight (explicit emerald so it reads clearly vs. muted accent)
        "hover:border-emerald-600/55 hover:bg-emerald-500/15 hover:shadow-md dark:hover:border-emerald-400/50 dark:hover:bg-emerald-500/18",
        "hover:ring-2 hover:ring-inset hover:ring-emerald-600/35 dark:hover:ring-emerald-400/35",
        isToday && "ring-2 ring-primary/40 ring-offset-2 ring-offset-background",
        isDragOver &&
          "border-emerald-600 bg-emerald-500/22 shadow-md ring-2 ring-inset ring-emerald-600/45 dark:border-emerald-400 dark:bg-emerald-500/28 dark:ring-emerald-400/50",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (!isDragOver) setIsDragOver(true);
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
        setIsDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const id = e.dataTransfer.getData("text/plain");
        if (id) onDropSession(id, date);
      }}
    >
      <div className="flex flex-col gap-0.5 px-4 pb-3 pt-4">
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.1em]",
            isToday ? "text-primary" : "text-muted-foreground",
          )}
        >
          {shortLabel}
        </span>
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "text-3xl font-bold tabular-nums leading-none",
              isToday && "text-primary",
            )}
          >
            {dayNumber}
          </span>
          {isToday ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              Today
            </span>
          ) : null}
        </div>
      </div>

      <div className="h-px w-full bg-border" aria-hidden />

      <div className="flex flex-1 flex-col gap-2 px-3 pb-3 pt-3">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            isDragging={draggingId === session.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onCompleteClick={onCompleteClick}
            onUndoComplete={onUndoComplete}
            onEditLog={onEditLog}
            onDelete={onDelete}
          />
        ))}

        <button
          type="button"
          onClick={() => onAddClick(date)}
          className={cn(
            "mt-auto flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors",
            "hover:border-emerald-600/45 hover:bg-emerald-500/15 hover:text-emerald-900 dark:hover:border-emerald-400/45 dark:hover:bg-emerald-500/18 dark:hover:text-emerald-100",
            sessions.length === 0 && "min-h-[92px] flex-1",
            isDragOver && "text-foreground",
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          {isDragOver ? "Drop here" : "Add"}
        </button>
      </div>
    </div>
  );
});
