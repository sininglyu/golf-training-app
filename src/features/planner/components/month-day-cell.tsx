"use client";

import * as React from "react";
import { GripVertical } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  SESSION_TYPE_LABELS,
  SESSION_TYPE_SHORT_LABELS,
  type PlannerSession,
} from "@/types";

const TYPE_DOT: Partial<Record<PlannerSession["type"], string>> = {
  golf: "bg-emerald-500",
  round: "bg-indigo-500",
  workout: "bg-violet-500",
  recovery: "bg-sky-500",
};

const FALLBACK_DOT = "bg-muted-foreground/40";

interface MonthDayCellProps {
  date: Date;
  /** Whether this day belongs to the active month (vs. leading/trailing). */
  inMonth: boolean;
  isToday: boolean;
  sessions: PlannerSession[];
  draggingId: string | null;
  onDragStart: (session: PlannerSession) => void;
  onDragEnd: () => void;
  onDropSession: (sessionId: string, targetDate: Date) => void;
  onAddClick: (date: Date) => void;
  onSessionClick: (session: PlannerSession) => void;
}

const MAX_VISIBLE = 3;

export const MonthDayCell = React.memo(function MonthDayCell({
  date,
  inMonth,
  isToday,
  sessions,
  draggingId,
  onDragStart,
  onDragEnd,
  onDropSession,
  onAddClick,
  onSessionClick,
}: MonthDayCellProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const visible = sessions.slice(0, MAX_VISIBLE);
  const overflow = Math.max(0, sessions.length - MAX_VISIBLE);
  const dayLabel = date.getDate();

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Add session on ${date.toDateString()}`}
      onClick={() => onAddClick(date)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onAddClick(date);
        }
      }}
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
      className={cn(
        "group relative z-0 flex min-h-[112px] min-w-0 cursor-pointer flex-col gap-1.5 overflow-hidden border-r border-b border-border p-2 text-left outline-none transition-[background-color,box-shadow,border-color] duration-150",
        "hover:z-[1] hover:border-emerald-600/25 hover:bg-emerald-500/15 hover:ring-2 hover:ring-inset hover:ring-emerald-600/40 dark:hover:border-emerald-400/30 dark:hover:bg-emerald-500/20 dark:hover:ring-emerald-400/45",
        "focus-visible:z-[1] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600/50 focus-visible:ring-offset-0 dark:focus-visible:ring-emerald-400/55",
        !inMonth && "bg-muted/25",
        isDragOver &&
          "z-[1] border-emerald-600/40 bg-emerald-500/22 ring-2 ring-inset ring-emerald-600/50 dark:border-emerald-400/40 dark:bg-emerald-500/28 dark:ring-emerald-400/55",
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums",
            isToday && "bg-primary text-primary-foreground",
            !isToday && inMonth && "text-foreground",
            !isToday && !inMonth && "text-muted-foreground/70",
          )}
        >
          {dayLabel}
        </span>
        {sessions.length > 0 ? (
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {sessions.length}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-hidden">
        {visible.map((s) => (
          <SessionPill
            key={s.id}
            session={s}
            faded={!inMonth}
            isDragging={draggingId === s.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onClick={() => onSessionClick(s)}
          />
        ))}
        {overflow > 0 ? (
          <span className="px-1 text-[11px] text-muted-foreground">
            +{overflow} more
          </span>
        ) : null}
      </div>
    </div>
  );
});

interface SessionPillProps {
  session: PlannerSession;
  faded: boolean;
  isDragging: boolean;
  onDragStart: (session: PlannerSession) => void;
  onDragEnd: () => void;
  onClick: () => void;
}

function SessionPill({
  session,
  faded,
  isDragging,
  onDragStart,
  onDragEnd,
  onClick,
}: SessionPillProps) {
  const dotClass = TYPE_DOT[session.type] ?? FALLBACK_DOT;
  const typeLabel = SESSION_TYPE_LABELS[session.type] ?? session.type;
  const shortLabel =
    SESSION_TYPE_SHORT_LABELS[session.type] ?? session.type;
  const display = session.title ?? shortLabel;

  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", session.id);
        onDragStart(session);
        e.stopPropagation();
      }}
      onDragEnd={(e) => {
        e.stopPropagation();
        onDragEnd();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={`${typeLabel} · ${display} · ${session.plannedDuration}m`}
      className={cn(
        "group/pill flex w-full min-w-0 items-center gap-1.5 rounded border bg-background px-1.5 py-1 text-left text-[11px] leading-tight",
        "hover:border-primary/40 hover:shadow-sm",
        session.completed && "line-through opacity-60",
        faded && !session.completed && "opacity-80",
        isDragging && "opacity-40",
      )}
    >
      <GripVertical
        className="h-3 w-3 shrink-0 text-muted-foreground/60 opacity-0 transition-opacity group-hover/pill:opacity-100"
        aria-hidden
      />
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotClass)} />
      <span className="min-w-0 flex-1 truncate font-medium">{display}</span>
    </button>
  );
}
