"use client";

import * as React from "react";
import { Plus, Sparkles, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  SESSION_TYPE_LABELS,
  type ExerciseSet,
  type PlannerSession,
} from "@/types";
import type {
  CreateRoundInput,
  SaveLogInput,
} from "@/features/planner/api/planner";

interface LogSessionDialogProps {
  session: PlannerSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting?: boolean;
  isSyncingRound?: boolean;
  onSubmit: (input: SaveLogInput) => Promise<void> | void;
  onSyncShotsGained: (input: CreateRoundInput) => Promise<void> | void;
}

interface ExerciseDraft {
  key: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
}

function newExerciseRow(seed?: Partial<ExerciseDraft>): ExerciseDraft {
  return {
    key:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,
    name: seed?.name ?? "",
    sets: seed?.sets ?? "3",
    reps: seed?.reps ?? "8",
    weight: seed?.weight ?? "",
  };
}

function exerciseFromSet(s: ExerciseSet): ExerciseDraft {
  return newExerciseRow({
    name: s.name,
    sets: String(s.sets),
    reps: String(s.reps),
    weight: s.weight == null ? "" : String(s.weight),
  });
}

export function LogSessionDialog({
  session,
  open,
  onOpenChange,
  isSubmitting,
  isSyncingRound,
  onSubmit,
  onSyncShotsGained,
}: LogSessionDialogProps) {
  // Shared
  const [notes, setNotes] = React.useState("");
  const [actualDuration, setActualDuration] = React.useState<string>("");

  // Golf
  const [practiced, setPracticed] = React.useState("");
  const [ballsHit, setBallsHit] = React.useState<string>("");

  // Round
  const [course, setCourse] = React.useState("");
  const [score, setScore] = React.useState<string>("");
  const [syncShotsGained, setSyncShotsGained] = React.useState(false);

  // Workout
  const [exercises, setExercises] = React.useState<ExerciseDraft[]>([]);

  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open || !session) return;
    const log = session.log;
    setNotes(log?.notes ?? "");
    setActualDuration(
      log?.actualDuration != null
        ? String(log.actualDuration)
        : String(session.plannedDuration),
    );
    setPracticed(log?.practiced ?? session.focus ?? "");
    setBallsHit(log?.ballsHit != null ? String(log.ballsHit) : "");
    setCourse(log?.course ?? "");
    setScore(log?.score != null ? String(log.score) : "");
    setSyncShotsGained(false);
    if (session.type === "workout") {
      const seeded =
        log?.exercises && log.exercises.length > 0
          ? log.exercises.map(exerciseFromSet)
          : [newExerciseRow()];
      setExercises(seeded);
    } else {
      setExercises([]);
    }
    setError(null);
  }, [open, session]);

  if (!session) return null;

  const updateExercise = (
    key: string,
    patch: Partial<Omit<ExerciseDraft, "key">>,
  ) => {
    setExercises((rows) =>
      rows.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  };

  const addExercise = () =>
    setExercises((rows) => [...rows, newExerciseRow()]);

  const removeExercise = (key: string) =>
    setExercises((rows) => rows.filter((r) => r.key !== key));

  const buildPayload = (): SaveLogInput => {
    const payload: SaveLogInput = {
      notes: notes.trim() || null,
      actualDuration: actualDuration === "" ? null : Number(actualDuration),
      markComplete: true,
    };

    if (session.type === "golf") {
      payload.practiced = practiced.trim() || null;
      payload.ballsHit = ballsHit === "" ? null : Number(ballsHit);
    } else if (session.type === "round") {
      payload.course = course.trim() || null;
      payload.score = score === "" ? null : Number(score);
    } else if (session.type === "workout") {
      const cleaned: ExerciseSet[] = exercises
        .map((row) => ({
          name: row.name.trim(),
          sets: Number(row.sets),
          reps: Number(row.reps),
          weight: row.weight === "" ? null : Number(row.weight),
        }))
        .filter(
          (e) =>
            e.name.length > 0 &&
            Number.isFinite(e.sets) &&
            Number.isFinite(e.reps),
        );
      payload.exercises = cleaned;
    }

    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (session.type === "round" && !course.trim() && syncShotsGained) {
      setError("Course is required to sync shots gained.");
      return;
    }
    try {
      await onSubmit(buildPayload());
      if (session.type === "round" && syncShotsGained && course.trim()) {
        await onSyncShotsGained({
          date: session.date,
          course: course.trim(),
          sessionId: session.id,
        });
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save log.");
    }
  };

  const isExistingLog = Boolean(session.log);
  const typeLabel = SESSION_TYPE_LABELS[session.type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onClose={() => onOpenChange(false)}
        className="max-w-xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
              {typeLabel}
            </span>
            {session.completed ? (
              <span className="text-xs text-muted-foreground">Completed</span>
            ) : null}
          </div>
          <DialogTitle>
            {isExistingLog ? "Edit log" : "Log session"} ·{" "}
            {session.title ?? typeLabel}
          </DialogTitle>
          <DialogDescription>
            {new Date(session.date).toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}{" "}
            · planned {session.plannedDuration}m
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {session.type === "golf" ? (
            <GolfFields
              practiced={practiced}
              setPracticed={setPracticed}
              ballsHit={ballsHit}
              setBallsHit={setBallsHit}
            />
          ) : null}

          {session.type === "round" ? (
            <RoundFields
              course={course}
              setCourse={setCourse}
              score={score}
              setScore={setScore}
              syncShotsGained={syncShotsGained}
              setSyncShotsGained={setSyncShotsGained}
              alreadySynced={Boolean(session.log?.shotsGainedId)}
              isSyncing={Boolean(isSyncingRound)}
            />
          ) : null}

          {session.type === "workout" ? (
            <WorkoutFields
              exercises={exercises}
              onChange={updateExercise}
              onAdd={addExercise}
              onRemove={removeExercise}
            />
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="log-duration">Actual duration (min)</Label>
              <Input
                id="log-duration"
                type="number"
                min={0}
                value={actualDuration}
                onChange={(e) => setActualDuration(e.target.value)}
                placeholder={String(session.plannedDuration)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="log-notes">Notes (optional)</Label>
            <Textarea
              id="log-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                session.type === "round"
                  ? "Course conditions, mental notes, takeaways…"
                  : "How did it feel? What clicked?"
              }
              rows={3}
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving…"
                : isExistingLog
                  ? "Save log"
                  : "Save & complete"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface GolfFieldsProps {
  practiced: string;
  setPracticed: (v: string) => void;
  ballsHit: string;
  setBallsHit: (v: string) => void;
}

function GolfFields({
  practiced,
  setPracticed,
  ballsHit,
  setBallsHit,
}: GolfFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="log-practiced">What did you practice?</Label>
        <Input
          id="log-practiced"
          value={practiced}
          onChange={(e) => setPracticed(e.target.value)}
          placeholder="e.g. Wedge distance ladder, gate drill on 6ft putts"
          autoFocus
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="log-balls">Balls hit</Label>
        <Input
          id="log-balls"
          type="number"
          min={0}
          step={5}
          value={ballsHit}
          onChange={(e) => setBallsHit(e.target.value)}
          placeholder="e.g. 60"
        />
      </div>
    </div>
  );
}

interface RoundFieldsProps {
  course: string;
  setCourse: (v: string) => void;
  score: string;
  setScore: (v: string) => void;
  syncShotsGained: boolean;
  setSyncShotsGained: (v: boolean) => void;
  alreadySynced: boolean;
  isSyncing: boolean;
}

function RoundFields({
  course,
  setCourse,
  score,
  setScore,
  syncShotsGained,
  setSyncShotsGained,
  alreadySynced,
  isSyncing,
}: RoundFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="log-course">Course</Label>
          <Input
            id="log-course"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="e.g. Harding Park"
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="log-score">Score</Label>
          <Input
            id="log-score"
            type="number"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="e.g. 78"
          />
        </div>
      </div>

      <label
        className={cn(
          "flex items-start gap-3 rounded-md border p-3 text-sm",
          alreadySynced
            ? "border-primary/30 bg-primary/5 text-foreground"
            : "border-input bg-muted/30 hover:bg-muted/50",
        )}
      >
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 accent-primary"
          checked={alreadySynced || syncShotsGained}
          disabled={alreadySynced || isSyncing}
          onChange={(e) => setSyncShotsGained(e.target.checked)}
        />
        <div className="flex-1">
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {alreadySynced
              ? "Shots gained synced for this round"
              : "Sync shots gained for this round"}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {alreadySynced
              ? "A Shots Gained entry already exists. Update detailed numbers from the Progress tab."
              : "Creates a placeholder entry on the Progress dashboard you can fill in with sgOffTee, sgApproach, sgAroundGreen, and sgPutting later."}
          </p>
        </div>
      </label>
    </div>
  );
}

interface WorkoutFieldsProps {
  exercises: ExerciseDraft[];
  onChange: (
    key: string,
    patch: Partial<Omit<ExerciseDraft, "key">>,
  ) => void;
  onAdd: () => void;
  onRemove: (key: string) => void;
}

function WorkoutFields({
  exercises,
  onChange,
  onAdd,
  onRemove,
}: WorkoutFieldsProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Exercises</Label>
        <span className="text-xs text-muted-foreground">
          name · sets · reps · weight
        </span>
      </div>
      <div className="space-y-2">
        {exercises.map((row, i) => (
          <div
            key={row.key}
            className="grid grid-cols-[minmax(0,1fr)_56px_56px_72px_28px] items-center gap-2"
          >
            <Input
              value={row.name}
              onChange={(e) => onChange(row.key, { name: e.target.value })}
              placeholder={i === 0 ? "Trap-bar deadlift" : "Exercise"}
              autoFocus={i === 0 && row.name === ""}
            />
            <Input
              type="number"
              min={0}
              value={row.sets}
              onChange={(e) => onChange(row.key, { sets: e.target.value })}
              aria-label="Sets"
            />
            <Input
              type="number"
              min={0}
              value={row.reps}
              onChange={(e) => onChange(row.key, { reps: e.target.value })}
              aria-label="Reps"
            />
            <Input
              type="number"
              min={0}
              step={2.5}
              value={row.weight}
              onChange={(e) => onChange(row.key, { weight: e.target.value })}
              placeholder="lb"
              aria-label="Weight"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(row.key)}
              aria-label="Remove exercise"
              disabled={exercises.length === 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onAdd}
        className="h-8 text-xs"
      >
        <Plus className="h-3.5 w-3.5" />
        Add exercise
      </Button>
    </div>
  );
}
