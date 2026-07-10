"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PlannerSession } from "@/types";
import { SessionCard } from "./session-card";

interface DayColumnProps {
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
        "flex min-h-[340px] min-w-0 flex-col overflow-hidden rounded-[13px] border border-border bg-card",
        "transition-[border-color,background-color] duration-150",
        isToday && "bg-[rgba(163,230,53,0.05)]",
        isDragOver && "border-primary/50 bg-primary/5",
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
      {/* Day header */}
      <div className="flex flex-col gap-0.5 px-4 pb-3 pt-4">
        <span
          className={cn(
            "text-[10px] font-extrabold uppercase tracking-[.1em]",
            isToday ? "text-primary" : "text-muted-foreground",
          )}
        >
          {shortLabel}
        </span>
        <span
          className={cn(
            "font-mono text-3xl font-bold leading-none",
            isToday ? "text-primary" : "text-foreground",
          )}
        >
          {dayNumber}
        </span>
      </div>

      <div className="h-px w-full bg-border" aria-hidden />

      <div className="flex flex-1 flex-col gap-[7px] px-3 pb-3 pt-3">
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
            "mt-auto flex items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs font-bold text-muted-foreground transition-colors",
            "hover:border-primary/40 hover:bg-primary/5 hover:text-foreground",
            sessions.length === 0 && "min-h-[92px] flex-1",
            isDragOver && "border-primary text-foreground",
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          {isDragOver ? "Drop here" : "Add"}
        </button>
      </div>
    </div>
  );
});
