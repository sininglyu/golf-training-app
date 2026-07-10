"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Dumbbell,
  Flag,
  HeartPulse,
  Target,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogSessionDialog } from "@/features/planner/components/log-session-dialog";
import {
  useCreateRound,
  useSaveSessionLog,
} from "@/features/planner/hooks/use-week-plan";
import { useSessions } from "@/features/sessions/hooks/use-sessions";
import { cn } from "@/lib/utils";
import { queryKeys } from "@/lib/query-keys";
import { formatISODate, startOfWeek } from "@/lib/week";
import {
  SESSION_TYPE_LABELS,
  type ExerciseSet,
  type PlannerSession,
  type SessionType,
} from "@/types";

// Per-type color config matching the session card palette
const TYPE_COLOR: Record<SessionType, string> = {
  golf: "#f59e0b",
  round: "#22d3ee",
  workout: "#fb7185",
  recovery: "#60a5fa",
};

const TYPE_ICON: Partial<
  Record<SessionType, React.ComponentType<{ className?: string }>>
> = {
  golf: Target,
  round: Flag,
  workout: Dumbbell,
  recovery: HeartPulse,
};

const FALLBACK_ICON = CircleDot;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function summaryFor(session: PlannerSession): string | null {
  const log = session.log;
  if (!log) return null;
  switch (session.type) {
    case "golf": {
      const bits: string[] = [];
      if (log.practiced) bits.push(log.practiced);
      if (typeof log.ballsHit === "number") bits.push(`${log.ballsHit} balls`);
      return bits.length ? bits.join(" · ") : null;
    }
    case "round": {
      const bits: string[] = [];
      if (log.course) bits.push(log.course);
      if (typeof log.score === "number") bits.push(`Score ${log.score}`);
      if (log.shotsGainedId) bits.push("SG linked");
      return bits.length ? bits.join(" · ") : null;
    }
    case "workout": {
      if (!log.exercises?.length) return null;
      return `${log.exercises.length} exercise${log.exercises.length === 1 ? "" : "s"}`;
    }
    case "recovery":
      return null;
  }
}

function ExerciseList({ exercises }: { exercises: ExerciseSet[] }) {
  return (
    <ul className="space-y-1 text-sm">
      {exercises.map((e, i) => (
        <li
          key={`${e.name}-${i}`}
          className="flex items-baseline justify-between"
        >
          <span className="font-semibold">{e.name || "Unnamed"}</span>
          <span className="font-mono text-muted-foreground">
            {e.sets} × {e.reps}
            {typeof e.weight === "number" && e.weight > 0
              ? ` @ ${e.weight}`
              : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}

function hasDetails(session: PlannerSession): boolean {
  const log = session.log;
  if (!log) return false;
  if (log.notes) return true;
  if (session.type === "workout" && log.exercises?.length) return true;
  if (session.type === "golf" && (log.practiced || log.ballsHit != null))
    return true;
  if (
    session.type === "round" &&
    (log.course || log.score != null || log.shotsGainedId)
  )
    return true;
  return false;
}

export default function SessionsPage() {
  const { data, isLoading, isError, error, refetch } = useSessions();

  const [editSession, setEditSession] = React.useState<PlannerSession | null>(
    null,
  );
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(
    () => new Set(),
  );

  const toggleExpanded = React.useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const collapsibleIds = React.useMemo(
    () => (data ?? []).filter(hasDetails).map((s) => s.id),
    [data],
  );

  const allCollapsed =
    collapsibleIds.length > 0 &&
    collapsibleIds.every((id) => !expandedIds.has(id));

  const toggleAll = () => {
    setExpandedIds(allCollapsed ? new Set(collapsibleIds) : new Set());
  };

  const editWeekOf = React.useMemo(() => {
    if (!editSession) return formatISODate(startOfWeek(new Date()));
    return formatISODate(startOfWeek(new Date(editSession.date)));
  }, [editSession]);

  const editQueryKey = React.useMemo(
    () => queryKeys.planner.week(editWeekOf),
    [editWeekOf],
  );
  const logMutation = useSaveSessionLog(editQueryKey);
  const roundMutation = useCreateRound();

  return (
    <div className="mx-auto max-w-[880px] space-y-8">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <h1 className="text-[30px] font-black leading-none tracking-[-0.02em] text-foreground">
          Logged Sessions
        </h1>
        <div className="flex items-center gap-2">
          {collapsibleIds.length > 0 ? (
            <Button type="button" variant="ghost" size="sm" onClick={toggleAll}>
              {allCollapsed ? "Expand all" : "Collapse all"}
            </Button>
          ) : null}
          <Button asChild size="sm" className="font-bold">
            <Link href="/planner">Open Planner</Link>
          </Button>
        </div>
      </div>

      {isError ? (
        <div className="rounded-[9px] border border-negative/30 bg-negative/5 p-4 text-sm text-negative">
          <div className="font-bold">Could not load your sessions.</div>
          <div className="mt-1 text-negative/80">
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

      <Card className="overflow-hidden p-0">
        {isLoading || !data ? (
          <div className="space-y-0 divide-y divide-border">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="h-12 w-12 animate-pulse rounded-[9px] bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-28 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-4 w-12 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No sessions logged yet. Plan some sessions and mark them complete
              to see them here.
            </p>
            <Button asChild size="sm" className="font-bold">
              <Link href="/planner">Go to Planner</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.map((s) => {
              const Icon = TYPE_ICON[s.type] ?? FALLBACK_ICON;
              const typeColor = TYPE_COLOR[s.type];
              const typeLabel = SESSION_TYPE_LABELS[s.type] ?? s.type;
              const title = s.title || s.focus || typeLabel;
              const summary = summaryFor(s);
              const duration = s.log?.actualDuration ?? s.plannedDuration;
              const collapsible = hasDetails(s);
              const expanded = expandedIds.has(s.id);
              const headerId = `session-header-${s.id}`;
              const detailsId = `session-details-${s.id}`;

              return (
                <div key={s.id} className="transition-colors hover:bg-accent/40">
                  <div className="flex items-start gap-4 p-4">
                    {/* Date block */}
                    <div
                      className="flex w-12 shrink-0 flex-col items-center rounded-[9px] py-2"
                      style={{ background: `${typeColor}18` }}
                    >
                      <span
                        className="font-mono text-[22px] font-bold leading-none"
                        style={{ color: typeColor }}
                      >
                        {new Date(s.date).getDate()}
                      </span>
                      <span
                        className="text-[9px] font-extrabold uppercase tracking-wider"
                        style={{ color: typeColor }}
                      >
                        {new Date(s.date).toLocaleDateString(undefined, { month: "short" })}
                      </span>
                    </div>

                    {/* Main content */}
                    <button
                      type="button"
                      id={headerId}
                      onClick={() => collapsible && toggleExpanded(s.id)}
                      aria-expanded={collapsible ? expanded : undefined}
                      aria-controls={collapsible ? detailsId : undefined}
                      disabled={!collapsible}
                      className={cn(
                        "flex min-w-0 flex-1 items-start gap-3 rounded-md text-left",
                        collapsible
                          ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          : "cursor-default",
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[9px] font-black uppercase tracking-[.08em]"
                            style={{ color: typeColor }}
                          >
                            {typeLabel}
                          </span>
                          <CheckCircle2
                            className="h-3 w-3 shrink-0"
                            style={{ color: typeColor }}
                          />
                        </div>
                        <div className="mt-0.5 truncate text-[14px] font-bold text-foreground">
                          {title}
                        </div>
                        {summary ? (
                          <div className="mt-0.5 text-[12px] text-muted-foreground">
                            {summary}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-[12px] font-semibold text-muted-foreground">
                          {duration}m
                          {s.log?.rating ? ` · ${s.log.rating}/5` : ""}
                        </span>
                        {collapsible ? (
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform",
                              expanded ? "rotate-180" : "",
                            )}
                            aria-hidden
                          />
                        ) : null}
                      </div>
                    </button>

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="shrink-0 text-muted-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditSession(s);
                      }}
                    >
                      Edit
                    </Button>
                  </div>

                  {collapsible && expanded ? (
                    <div
                      id={detailsId}
                      role="region"
                      aria-labelledby={headerId}
                      className="space-y-2 border-t border-border px-4 pb-4 pt-3"
                    >
                      {s.type === "workout" && s.log?.exercises?.length ? (
                        <ExerciseList exercises={s.log.exercises} />
                      ) : null}
                      {s.log?.notes ? (
                        <div className="text-sm italic text-muted-foreground">
                          &ldquo;{s.log.notes}&rdquo;
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <LogSessionDialog
        session={editSession}
        open={Boolean(editSession)}
        onOpenChange={(open) => {
          if (!open) setEditSession(null);
        }}
        isSubmitting={logMutation.isPending}
        isSyncingRound={roundMutation.isPending}
        onSubmit={async (input) => {
          if (!editSession) return;
          await logMutation.mutateAsync({ id: editSession.id, input });
          setEditSession(null);
        }}
        onSyncShotsGained={async (input) => {
          await roundMutation.mutateAsync(input);
        }}
      />
    </div>
  );
}
