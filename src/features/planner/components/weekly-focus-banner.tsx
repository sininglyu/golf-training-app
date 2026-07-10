"use client";

import * as React from "react";
import { Pencil } from "lucide-react";

import {
  useSetWeeklyFocus,
  useWeeklyFocus,
} from "@/features/planner/hooks/use-weekly-focus";

interface WeeklyFocusBannerProps {
  weekOf: string;
}

export function WeeklyFocusBanner({ weekOf }: WeeklyFocusBannerProps) {
  const { data, isLoading, isError, refetch } = useWeeklyFocus(weekOf);
  const setFocus = useSetWeeklyFocus(weekOf);

  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const enterEdit = React.useCallback(() => {
    setDraft(data?.text ?? "");
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [data?.text]);

  const cancelEdit = React.useCallback(() => setEditing(false), []);

  const handleCommit = React.useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === data?.text) {
      cancelEdit();
      return;
    }
    setFocus.mutate(trimmed);
    setEditing(false);
  }, [draft, data?.text, setFocus, cancelEdit]);

  if (isLoading) {
    return (
      <div className="h-[50px] rounded-[9px] border-l-[3px] border-primary bg-card px-[18px] py-[13px]">
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-[9px] border-l-[3px] border-primary bg-card px-[18px] py-[13px] text-sm text-muted-foreground">
        Could not load week focus.{" "}
        <button
          type="button"
          onClick={() => void refetch()}
          className="underline hover:text-foreground"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-3 rounded-[9px] border border-border border-l-[3px] border-l-primary bg-card px-[18px] py-[13px]">
      <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-[.12em] text-primary">
        WEEK FOCUS
      </span>

      {editing ? (
        <>
          <input
            ref={inputRef}
            className="flex-1 border-b border-primary bg-transparent text-[15px] font-semibold outline-none placeholder:text-muted-foreground/50 disabled:opacity-50"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); handleCommit(); }
              if (e.key === "Escape") { e.preventDefault(); cancelEdit(); }
            }}
            placeholder="e.g. Shorten backswing"
            maxLength={280}
            disabled={setFocus.isPending}
            aria-label="Weekly focus"
          />
          <button
            type="button"
            onClick={handleCommit}
            disabled={setFocus.isPending}
            className="shrink-0 rounded-[6px] bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Save
          </button>
        </>
      ) : data?.text ? (
        <button
          type="button"
          onClick={enterEdit}
          className="flex-1 truncate text-left text-[15px] font-semibold text-foreground transition-colors hover:text-primary"
          title="Click to edit"
        >
          {data.text}
        </button>
      ) : (
        <button
          type="button"
          onClick={enterEdit}
          className="flex-1 text-left text-[15px] italic text-muted-foreground/50 transition-colors hover:text-muted-foreground"
        >
          Set a focus for this week…
        </button>
      )}

      {!editing ? (
        <button
          type="button"
          onClick={enterEdit}
          aria-label="Edit weekly focus"
          className="ml-auto shrink-0 rounded-[6px] p-1.5 text-muted-foreground/40 opacity-0 transition-all hover:bg-accent hover:text-foreground focus:opacity-100 group-hover:opacity-100"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      ) : null}

      {setFocus.isError && !editing ? (
        <p className="text-xs text-destructive" role="alert">Failed to save</p>
      ) : null}
    </div>
  );
}
