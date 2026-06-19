"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  MONTH_GRID_DAYS,
  WEEKDAYS,
  WEEKDAY_LABELS,
  addDays,
  formatISODate,
  monthGridStart,
} from "@/lib/week";
import type { PlannerSession } from "@/types";
import { MonthDayCell } from "./month-day-cell";

interface MonthGridProps {
  /** Any date inside the month to display (typically the 1st). */
  monthAnchor: Date;
  today: Date;
  sessions: PlannerSession[];
  draggingId: string | null;
  onDragStart: (session: PlannerSession) => void;
  onDragEnd: () => void;
  onDropSession: (sessionId: string, targetDate: Date) => void;
  onAddClick: (date: Date) => void;
  onSessionClick: (session: PlannerSession) => void;
}

function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export const MonthGrid = React.memo(function MonthGrid({
  monthAnchor,
  today,
  sessions,
  draggingId,
  onDragStart,
  onDragEnd,
  onDropSession,
  onAddClick,
  onSessionClick,
}: MonthGridProps) {
  const gridStart = React.useMemo(
    () => monthGridStart(monthAnchor),
    [monthAnchor],
  );
  const days = React.useMemo(
    () =>
      Array.from({ length: MONTH_GRID_DAYS }, (_, i) => addDays(gridStart, i)),
    [gridStart],
  );

  // Group sessions by their local YYYY-MM-DD so cells can look up O(1).
  const byDate = React.useMemo(() => {
    const map = new Map<string, PlannerSession[]>();
    for (const s of sessions) {
      const key = formatISODate(new Date(s.date));
      const list = map.get(key);
      if (list) list.push(s);
      else map.set(key, [s]);
    }
    for (const list of map.values()) {
      list.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    }
    return map;
  }, [sessions]);

  const activeMonth = monthAnchor.getMonth();

  return (
    <div className="overflow-hidden rounded-xl border-2 border-border bg-card shadow-sm">
      <div className="grid grid-cols-7 border-b-2 border-border bg-muted/40">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className={cn(
              "border-r border-border px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground last:border-r-0",
            )}
          >
            <span className="hidden sm:inline">{WEEKDAY_LABELS[d]}</span>
            <span className="sm:hidden">{WEEKDAY_LABELS[d].slice(0, 3)}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 border-l border-border">
        {days.map((date) => {
          const key = formatISODate(date);
          const list = byDate.get(key) ?? [];
          return (
            <MonthDayCell
              key={key}
              date={date}
              inMonth={date.getMonth() === activeMonth}
              isToday={isSameLocalDay(date, today)}
              sessions={list}
              draggingId={draggingId}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDropSession={onDropSession}
              onAddClick={onAddClick}
              onSessionClick={onSessionClick}
            />
          );
        })}
      </div>
    </div>
  );
});
