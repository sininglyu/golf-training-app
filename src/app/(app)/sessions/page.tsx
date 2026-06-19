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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const TYPE_ICON: Partial<
  Record<SessionType, React.ComponentType<{ className?: string }>>
> = {
  golf: Target,
  round: Flag,
  workout: Dumbbell,
  recovery: HeartPulse,
};

const TYPE_ACCENT: Partial<Record<SessionType, string>> = {
  golf: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  round: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  workout: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  recovery: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

const FALLBACK_ICON = CircleDot;
const FALLBACK_ACCENT = "bg-muted text-muted-foreground";

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
        <li key={`${e.name}-${i}`} className="flex items-baseline justify-between">
          <span className="font-medium">{e.name || "Unnamed"}</span>
          <span className="text-muted-foreground">
            {e.sets} × {e.reps}
            {typeof e.weight === "number" && e.weight > 0 ? ` @ ${e.weight}` : ""}
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
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Session Logger
          </h1>
          <p className="text-sm text-muted-foreground">
            Every session you&apos;ve marked complete, newest first.
          </p>
        </div>
        <Button asChild>
          <Link href="/planner">Open planner</Link>
        </Button>
      </div>

      {isError ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          <div className="font-medium">Could not load your sessions.</div>
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

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Recent sessions</CardTitle>
            <CardDescription>
              Completed sessions pulled from your planner log.
            </CardDescription>
          </div>
          {collapsibleIds.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleAll}
            >
              {allCollapsed ? "Expand all" : "Collapse all"}
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading || !data ? (
            <>
              <div className="h-20 animate-pulse rounded-md bg-muted" />
              <div className="h-20 animate-pulse rounded-md bg-muted" />
              <div className="h-20 animate-pulse rounded-md bg-muted" />
            </>
          ) : data.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              No sessions logged yet. Plan some sessions and mark them complete
              to see them here.
            </div>
          ) : (
            data.map((s) => {
              const Icon = TYPE_ICON[s.type] ?? FALLBACK_ICON;
              const accent = TYPE_ACCENT[s.type] ?? FALLBACK_ACCENT;
              const typeLabel = SESSION_TYPE_LABELS[s.type] ?? s.type;
              const title = s.title || s.focus || typeLabel;
              const summary = summaryFor(s);
              const duration = s.log?.actualDuration ?? s.plannedDuration;
              const collapsible = hasDetails(s);
              const expanded = expandedIds.has(s.id);
              const showDetails = collapsible && expanded;
              const headerId = `session-header-${s.id}`;
              const detailsId = `session-details-${s.id}`;

              return (
                <div
                  key={s.id}
                  className="rounded-lg border transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-start justify-between gap-3 p-4">
                    <button
                      type="button"
                      id={headerId}
                      onClick={() =>
                        collapsible ? toggleExpanded(s.id) : undefined
                      }
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
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                          accent,
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="truncate text-sm font-medium">
                            {title}
                          </div>
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {typeLabel} · {formatDate(s.date)} · {duration}m
                          {s.log?.rating ? ` · ${s.log.rating}/5` : ""}
                        </div>
                        {summary ? (
                          <div className="mt-1.5 text-sm">{summary}</div>
                        ) : null}
                      </div>
                      {collapsible ? (
                        <ChevronDown
                          className={cn(
                            "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                            expanded ? "rotate-180" : "",
                          )}
                          aria-hidden
                        />
                      ) : null}
                    </button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditSession(s);
                      }}
                    >
                      Edit
                    </Button>
                  </div>

                  {showDetails ? (
                    <div
                      id={detailsId}
                      role="region"
                      aria-labelledby={headerId}
                      className="space-y-2 border-t px-4 pb-4 pt-3"
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
            })
          )}
        </CardContent>
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
