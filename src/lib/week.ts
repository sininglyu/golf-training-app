import type { Weekday } from "@/types";

export const WEEKDAYS: readonly Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

/** Returns the Monday (local time) at 00:00:00 for the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  // Shift so Monday = 0.
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

/** Formats a date as YYYY-MM-DD in local time. */
export function formatISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parses a YYYY-MM-DD local-date string back into a Date at local midnight. */
export function parseISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);
}

export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function weekdayOf(date: Date): Weekday {
  return WEEKDAYS[(date.getDay() + 6) % 7];
}

/** Start (inclusive) and end (exclusive) of the week containing `weekOf`. */
export function weekBounds(weekOfISO: string): { start: Date; end: Date } {
  const start = parseISODate(weekOfISO);
  const end = addDays(start, 7);
  return { start, end };
}

/** Local-time first-of-month at 00:00. */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

/** First-of-next-month at 00:00. Useful as an exclusive upper bound. */
export function startOfNextMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, 0);
}

/** Add `n` whole months while preserving the day-of-month when possible. */
export function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

/** First (Monday) day shown in a 6-row Monday-start grid for `monthAnchor`'s month. */
export function monthGridStart(monthAnchor: Date): Date {
  return startOfWeek(startOfMonth(monthAnchor));
}

/** A 6-week Monday-start grid is always 42 days. */
export const MONTH_GRID_DAYS = 42;

/**
 * ISO 8601 week number of the year (Monday as first day of week, week 1 is
 * the week containing the first Thursday of the year).
 */
export function isoWeekNumber(date: Date): number {
  const target = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  // Shift to the Thursday of the same ISO week (Mon=0…Sun=6).
  const dayNr = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstThursdayDayNr = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstThursdayDayNr + 3);
  const diffMs = target.getTime() - firstThursday.getTime();
  return 1 + Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
}

/** Render a duration in minutes as e.g. "45m", "1h", "1h 30m". */
export function formatMinutes(totalMinutes: number): string {
  const m = Math.max(0, Math.round(totalMinutes));
  if (m < 60) return `${m}m`;
  const hours = Math.floor(m / 60);
  const rem = m % 60;
  return rem === 0 ? `${hours}h` : `${hours}h ${rem}m`;
}

/**
 * Format a closed date range, eliding repeated month/year:
 *   May 4 – 10, 2026
 *   Apr 27 – May 3, 2026
 *   Dec 30, 2025 – Jan 5, 2026
 */
export function formatDateRange(start: Date, end: Date): string {
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  const startFmt: Intl.DateTimeFormatOptions = sameYear
    ? { month: "short", day: "numeric" }
    : { month: "short", day: "numeric", year: "numeric" };
  const endFmt: Intl.DateTimeFormatOptions = sameMonth
    ? { day: "numeric", year: "numeric" }
    : { month: "short", day: "numeric", year: "numeric" };

  return `${start.toLocaleDateString(undefined, startFmt)} – ${end.toLocaleDateString(undefined, endFmt)}`;
}
