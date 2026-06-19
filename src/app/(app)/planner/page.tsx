"use client";

import * as React from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Dumbbell,
  Flag,
  HeartPulse,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { queryKeys } from "@/lib/query-keys";
import {
  WEEKDAYS,
  WEEKDAY_LABELS,
  MONTH_GRID_DAYS,
  addDays,
  addMonths,
  formatDateRange,
  formatISODate,
  formatMinutes,
  isoWeekNumber,
  monthGridStart,
  startOfMonth,
  startOfWeek,
} from "@/lib/week";
import {
  useCreateRound,
  useCreateSession,
  useDeleteSession,
  useSaveSessionLog,
  useSessionsRange,
  useUpdateSession,
  useWeekPlan,
} from "@/features/planner/hooks/use-week-plan";
import { AddSessionDialog } from "@/features/planner/components/add-session-dialog";
import { DayColumn } from "@/features/planner/components/day-column";
import { LogSessionDialog } from "@/features/planner/components/log-session-dialog";
import { MonthGrid } from "@/features/planner/components/month-grid";
import type { PlannerSession, SessionType } from "@/types";

type PlannerView = "week" | "month";

/** Stable reference for "no sessions today" so memoized children skip re-render. */
const EMPTY_SESSIONS: readonly PlannerSession[] = Object.freeze([]);

function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function PlannerPage() {
  const [view, setView] = React.useState<PlannerView>("week");
  const [weekStart, setWeekStart] = React.useState<Date>(() =>
    startOfWeek(new Date()),
  );
  const [monthAnchor, setMonthAnchor] = React.useState<Date>(() =>
    startOfMonth(new Date()),
  );
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [addDialogInitialDate, setAddDialogInitialDate] =
    React.useState<Date | null>(null);
  const [logDialogOpen, setLogDialogOpen] = React.useState(false);
  const [logSessionId, setLogSessionId] = React.useState<string | null>(null);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);

  const today = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // ---- Week view data ----
  const weekOf = formatISODate(weekStart);
  const weekEnd = addDays(weekStart, 6);
  const weekKey = React.useMemo(
    () => queryKeys.planner.week(weekOf),
    [weekOf],
  );
  const weekQuery = useWeekPlan(weekOf);

  // ---- Month view data ----
  const monthGridFromDate = React.useMemo(
    () => monthGridStart(monthAnchor),
    [monthAnchor],
  );
  const monthGridToDate = React.useMemo(
    () => addDays(monthGridFromDate, MONTH_GRID_DAYS),
    [monthGridFromDate],
  );
  const monthFromISO = formatISODate(monthGridFromDate);
  const monthToISO = formatISODate(monthGridToDate);
  const monthKey = React.useMemo(
    () => queryKeys.planner.range(monthFromISO, monthToISO),
    [monthFromISO, monthToISO],
  );
  const monthQuery = useSessionsRange(monthFromISO, monthToISO);

  const activeQueryKey = view === "week" ? weekKey : monthKey;
  const activeData = view === "week" ? weekQuery.data : monthQuery.data;
  const isLoading =
    view === "week" ? weekQuery.isLoading : monthQuery.isLoading;
  const isError = view === "week" ? weekQuery.isError : monthQuery.isError;
  const error = view === "week" ? weekQuery.error : monthQuery.error;
  const refetch = view === "week" ? weekQuery.refetch : monthQuery.refetch;

  const createMutation = useCreateSession();
  const updateMutation = useUpdateSession(activeQueryKey);
  const deleteMutation = useDeleteSession(activeQueryKey);
  const logMutation = useSaveSessionLog(activeQueryKey);
  const roundMutation = useCreateRound();

  const logSession = React.useMemo(
    () => activeData?.find((s) => s.id === logSessionId) ?? null,
    [activeData, logSessionId],
  );

  // ---- Week view layout ----
  const sessionsByDay = React.useMemo(() => {
    const map = new Map<string, PlannerSession[]>();
    for (const d of WEEKDAYS) map.set(d, []);
    if (!weekQuery.data) return map;

    for (const s of weekQuery.data) {
      const date = new Date(s.date);
      const idx = Math.floor(
        (new Date(date).setHours(0, 0, 0, 0) - weekStart.getTime()) /
          (24 * 60 * 60 * 1000),
      );
      if (idx < 0 || idx > 6) continue;
      const day = WEEKDAYS[idx];
      const list = map.get(day) ?? [];
      list.push(s);
      map.set(day, list);
    }

    for (const [k, list] of map.entries()) {
      list.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      map.set(k, list);
    }
    return map;
  }, [weekQuery.data, weekStart]);

  // ---- Aggregates (mode-dependent) ----
  const weekSessions = weekQuery.data ?? [];
  const weekTotalMinutes = weekSessions.reduce(
    (a, s) => a + s.plannedDuration,
    0,
  );
  const weekCompletedCount = weekSessions.filter((s) => s.completed).length;

  const monthSessionsInActive = React.useMemo(() => {
    if (!monthQuery.data) return [] as PlannerSession[];
    const m = monthAnchor.getMonth();
    const y = monthAnchor.getFullYear();
    return monthQuery.data.filter((s) => {
      const d = new Date(s.date);
      return d.getMonth() === m && d.getFullYear() === y;
    });
  }, [monthQuery.data, monthAnchor]);
  const monthCompletedCount = monthSessionsInActive.filter(
    (s) => s.completed,
  ).length;
  const monthTotalMinutes = monthSessionsInActive.reduce(
    (a, s) => a + s.plannedDuration,
    0,
  );

  const visibleSessions =
    view === "week" ? weekSessions : monthSessionsInActive;
  const totalCount = visibleSessions.length;
  const doneCount =
    view === "week" ? weekCompletedCount : monthCompletedCount;
  const totalMinutes =
    view === "week" ? weekTotalMinutes : monthTotalMinutes;

  // Type breakdown for the bottom summary cards.
  const typeBreakdown = React.useMemo(() => {
    const counts: Record<SessionType, number> = {
      golf: 0,
      round: 0,
      workout: 0,
      recovery: 0,
    };
    for (const s of visibleSessions) {
      if (s.type in counts) counts[s.type] += 1;
    }
    return counts;
  }, [visibleSessions]);

  // ---- Navigation ----
  const goPrev = () =>
    view === "week"
      ? setWeekStart((d) => addDays(d, -7))
      : setMonthAnchor((d) => addMonths(d, -1));
  const goNext = () =>
    view === "week"
      ? setWeekStart((d) => addDays(d, 7))
      : setMonthAnchor((d) => addMonths(d, 1));
  const goToday = () => {
    const now = new Date();
    setWeekStart(startOfWeek(now));
    setMonthAnchor(startOfMonth(now));
  };

  const openAddDialog = React.useCallback((date?: Date | null) => {
    setAddDialogInitialDate(date ?? null);
    setAddDialogOpen(true);
  }, []);

  const openLogDialog = React.useCallback((session: PlannerSession) => {
    setLogSessionId(session.id);
    setLogDialogOpen(true);
  }, []);

  const handleDragStart = React.useCallback(
    (s: PlannerSession) => setDraggingId(s.id),
    [],
  );
  const handleDragEnd = React.useCallback(() => setDraggingId(null), []);

  const handleDropSession = React.useCallback(
    (sessionId: string, targetDate: Date) => {
      const session = activeData?.find((s) => s.id === sessionId);
      if (!session) return;
      const original = new Date(session.date);
      if (isSameLocalDay(original, targetDate)) return;

      const next = new Date(targetDate);
      next.setHours(original.getHours(), original.getMinutes(), 0, 0);

      updateMutation.mutate({
        id: session.id,
        patch: { date: next.toISOString() },
      });
    },
    [activeData, updateMutation],
  );

  const handleUndoComplete = React.useCallback(
    (session: PlannerSession) => {
      updateMutation.mutate({
        id: session.id,
        patch: { completed: false },
      });
    },
    [updateMutation],
  );

  const handleDelete = React.useCallback(
    (session: PlannerSession) => {
      deleteMutation.mutate(session.id);
    },
    [deleteMutation],
  );

  const handleAddClick = React.useCallback(
    (d: Date) => openAddDialog(d),
    [openAddDialog],
  );

  const dialogWeekStart =
    view === "week" ? weekStart : startOfWeek(new Date());

  // ---- Header / toolbar text ----
  const rangeLabel =
    view === "week"
      ? formatDateRange(weekStart, weekEnd)
      : monthAnchor.toLocaleDateString(undefined, {
          month: "long",
          year: "numeric",
        });
  const weekNumber = view === "week" ? isoWeekNumber(weekStart) : null;
  const todayButtonLabel = view === "week" ? "This week" : "This month";

  return (
    <div className="space-y-7 rounded-3xl bg-gradient-to-b from-accent/30 via-background to-background p-4 sm:p-7">
      {/* Title + primary action */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Planner
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Plan and track your training {view === "week" ? "week" : "month"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ViewToggle value={view} onChange={setView} />
          <Button
            type="button"
            onClick={() => openAddDialog(null)}
            className="shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Session
          </Button>
        </div>
      </div>

      {/* Toolbar: nav + range + at-a-glance stats */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-2xl border border-foreground/5 bg-card px-3 py-2.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-foreground/5 bg-background p-0.5 shadow-sm">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={goPrev}
              aria-label={view === "week" ? "Previous week" : "Previous month"}
              className="h-7 w-7"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={goToday}
              className="h-7 gap-1.5 px-2 text-xs"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              {todayButtonLabel}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={goNext}
              aria-label={view === "week" ? "Next week" : "Next month"}
              className="h-7 w-7"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm font-medium">
            {rangeLabel}
            {weekNumber != null ? (
              <span className="ml-1.5 text-muted-foreground">
                (Wk: {weekNumber})
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-1 text-sm">
          <Stat label="Sessions" value={String(totalCount)} />
          <Stat label="Done" value={`${doneCount}/${totalCount || 0}`} />
          <Stat
            label="Progress"
            value={formatMinutes(totalMinutes)}
            tone={totalMinutes > 0 ? "success" : "default"}
          />
        </div>
      </div>

      {isError ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          <div className="font-medium">
            Could not load this {view === "week" ? "week" : "month"}.
          </div>
          <div className="mt-1">
            {error instanceof Error ? error.message : "Unknown error"}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {view === "week" ? (
        <div className="rounded-xl border-2 border-border bg-muted/50 p-2 shadow-sm sm:p-3">
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4 xl:grid-cols-7">
            {WEEKDAYS.map((day, i) => {
              const date = addDays(weekStart, i);
              const sessions =
                sessionsByDay.get(day) ??
                (EMPTY_SESSIONS as PlannerSession[]);
              return (
                <DayColumn
                  key={day}
                  label={WEEKDAY_LABELS[day]}
                  date={date}
                  isToday={isSameLocalDay(date, today)}
                  sessions={sessions}
                  draggingId={draggingId}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDropSession={handleDropSession}
                  onAddClick={handleAddClick}
                  onCompleteClick={openLogDialog}
                  onUndoComplete={handleUndoComplete}
                  onEditLog={openLogDialog}
                  onDelete={handleDelete}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <MonthGrid
          monthAnchor={monthAnchor}
          today={today}
          sessions={monthQuery.data ?? (EMPTY_SESSIONS as PlannerSession[])}
          draggingId={draggingId}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDropSession={handleDropSession}
          onAddClick={handleAddClick}
          onSessionClick={openLogDialog}
        />
      )}

      {/* Bottom summary: per-type session counts */}
      <SummaryCards counts={typeBreakdown} />

      {isLoading && !activeData ? (
        <div className="text-center text-sm text-muted-foreground">
          Loading your {view === "week" ? "week" : "month"}…
        </div>
      ) : null}

      <AddSessionDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        weekStart={dialogWeekStart}
        initialDate={addDialogInitialDate}
        isSubmitting={createMutation.isPending}
        onSubmit={async (input) => {
          await createMutation.mutateAsync(input);
        }}
      />

      <LogSessionDialog
        session={logSession}
        open={logDialogOpen && Boolean(logSession)}
        onOpenChange={(open) => {
          setLogDialogOpen(open);
          if (!open) setLogSessionId(null);
        }}
        isSubmitting={logMutation.isPending}
        isSyncingRound={roundMutation.isPending}
        onSubmit={async (input) => {
          if (!logSession) return;
          await logMutation.mutateAsync({ id: logSession.id, input });
        }}
        onSyncShotsGained={async (input) => {
          await roundMutation.mutateAsync(input);
        }}
      />
    </div>
  );
}

interface ViewToggleProps {
  value: PlannerView;
  onChange: (next: PlannerView) => void;
}

function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Planner view"
      className="flex items-center rounded-md border bg-card p-0.5"
    >
      {(["week", "month"] as const).map((v) => {
        const active = value === v;
        return (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(v)}
            className={cn(
              "h-8 rounded px-3 text-xs font-medium capitalize transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}

interface StatProps {
  label: string;
  value: string;
  tone?: "default" | "success";
}

function Stat({ label, value, tone = "default" }: StatProps) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-xs font-normal text-muted-foreground/80">
        {label}:
      </span>
      <span
        className={cn(
          "text-sm font-bold tabular-nums",
          tone === "success" && "text-emerald-600 dark:text-emerald-400",
        )}
      >
        {value}
      </span>
    </span>
  );
}

interface SummaryCardsProps {
  counts: Record<SessionType, number>;
}

const SUMMARY_CARDS: ReadonlyArray<{
  type: SessionType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconWrap: string;
  iconColor: string;
}> = [
  {
    type: "golf",
    label: "Practice Sessions",
    icon: CircleDot,
    iconWrap: "bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    type: "workout",
    label: "Workouts",
    icon: Dumbbell,
    iconWrap: "bg-violet-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    type: "round",
    label: "Full Rounds",
    icon: Flag,
    iconWrap: "bg-indigo-500/10",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    type: "recovery",
    label: "Recovery",
    icon: HeartPulse,
    iconWrap: "bg-sky-500/10",
    iconColor: "text-sky-600 dark:text-sky-400",
  },
];

function SummaryCards({ counts }: SummaryCardsProps) {
  // Show only the categories that actually have sessions in the visible window
  // so the layout collapses gracefully on light weeks.
  const visible = SUMMARY_CARDS.filter((c) => counts[c.type] > 0);
  if (visible.length === 0) return null;

  return (
    <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {visible.map(({ type, label, icon: Icon, iconWrap, iconColor }) => (
        <div
          key={type}
          className="flex items-center gap-3 rounded-2xl bg-background/35 p-4 shadow-[0_12px_34px_-20px_rgba(16,24,40,0.28)] backdrop-blur-md supports-[backdrop-filter]:bg-background/30"
        >
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
              iconWrap,
            )}
          >
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-bold leading-none tabular-nums">
              {counts[type]}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
