"use client";

import * as React from "react";

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
import { Select } from "@/components/ui/select";
import {
  SESSION_TYPES,
  SESSION_TYPE_LABELS,
  type SessionType,
} from "@/types";
import type { CreateSessionInput } from "@/features/planner/api/planner";
import {
  WEEKDAYS,
  WEEKDAY_LABELS,
  addDays,
  formatISODate,
  startOfWeek,
} from "@/lib/week";

interface AddSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Monday of the page-level active week. Used when no `initialDate` is set. */
  weekStart: Date;
  /**
   * Date initially selected when the dialog opens. If provided, the dialog's
   * day-of-week selector is anchored to *this* date's week so users opening
   * the dialog from the month view can land on a specific day directly.
   */
  initialDate: Date | null;
  onSubmit: (input: CreateSessionInput) => Promise<void> | void;
  isSubmitting?: boolean;
}

const DEFAULT_DURATION_BY_TYPE: Record<SessionType, number> = {
  golf: 60,
  round: 240,
  workout: 60,
  recovery: 30,
};

export function AddSessionDialog({
  open,
  onOpenChange,
  weekStart,
  initialDate,
  onSubmit,
  isSubmitting,
}: AddSessionDialogProps) {
  const [type, setType] = React.useState<SessionType>("golf");
  const [title, setTitle] = React.useState("");
  const [duration, setDuration] = React.useState<string>("");
  const [dayOffset, setDayOffset] = React.useState<number>(0);
  const [focus, setFocus] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const defaultDuration = DEFAULT_DURATION_BY_TYPE[type];

  // Anchor the day-picker to the week containing `initialDate` (when provided)
  // so opening the dialog from any view — including the month grid — lets the
  // user pick the day they actually clicked without having to scrub weeks.
  const effectiveWeekStart = React.useMemo(
    () => startOfWeek(initialDate ?? weekStart),
    [initialDate, weekStart],
  );

  React.useEffect(() => {
    if (!open) return;
    const starting = initialDate ?? effectiveWeekStart;
    const offset = Math.max(
      0,
      Math.min(
        6,
        Math.round(
          (new Date(starting).setHours(0, 0, 0, 0) -
            new Date(effectiveWeekStart).setHours(0, 0, 0, 0)) /
            (24 * 60 * 60 * 1000),
        ),
      ),
    );
    setDayOffset(offset);
    setType("golf");
    setTitle("");
    setDuration("");
    setFocus("");
    setError(null);
  }, [open, initialDate, effectiveWeekStart]);

  const handleTypeChange = (next: SessionType) => {
    setType(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Please enter a title.");
      return;
    }
    const effectiveDuration =
      duration.trim() === "" ? defaultDuration : Number(duration);
    if (!Number.isFinite(effectiveDuration) || effectiveDuration <= 0) {
      setError("Duration must be a positive number of minutes.");
      return;
    }
    const target = addDays(effectiveWeekStart, dayOffset);
    target.setHours(9, 0, 0, 0);

    try {
      await onSubmit({
        type,
        date: target.toISOString(),
        plannedDuration: Math.round(effectiveDuration),
        title: trimmed,
        focus: focus.trim() || undefined,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Add session</DialogTitle>
          <DialogDescription>
            Plan a block of practice, a round, a workout, or recovery for this
            week.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="session-type">Type</Label>
            <Select
              id="session-type"
              value={type}
              onChange={(e) =>
                handleTypeChange(e.target.value as SessionType)
              }
            >
              {SESSION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {SESSION_TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="session-title">Title</Label>
            <Input
              id="session-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Putting block — 6 to 15 ft"
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="session-day">Day</Label>
              <Select
                id="session-day"
                value={String(dayOffset)}
                onChange={(e) => setDayOffset(Number(e.target.value))}
              >
                {WEEKDAYS.map((d, i) => {
                  const dayDate = addDays(effectiveWeekStart, i);
                  return (
                    <option key={d} value={i}>
                      {WEEKDAY_LABELS[d]} · {formatISODate(dayDate)}
                    </option>
                  );
                })}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="session-duration">Duration (min)</Label>
              <Input
                id="session-duration"
                type="number"
                inputMode="numeric"
                min={1}
                value={duration}
                placeholder={String(defaultDuration)}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="session-focus">Focus (optional)</Label>
            <Input
              id="session-focus"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="e.g. Start line control"
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
              {isSubmitting ? "Saving…" : "Add session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
