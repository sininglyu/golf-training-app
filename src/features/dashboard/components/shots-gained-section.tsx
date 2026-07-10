"use client";

import * as React from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAddRound,
  useDeleteRound,
  useRounds,
  useUpdateRound,
} from "@/features/dashboard/hooks/use-rounds";
import type { ShotsGainedRecord } from "@/features/dashboard/api/rounds";
import { cn } from "@/lib/utils";

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtSg(n: number): string {
  if (Math.abs(n) < 0.05) return "0.0";
  const s = Math.abs(n).toFixed(1);
  return n > 0 ? `+${s}` : `−${s}`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function sgColor(n: number): string {
  if (n > 0.049) return "text-positive";
  if (n < -0.049) return "text-negative";
  return "text-muted-foreground";
}

function avg(rounds: ShotsGainedRecord[], key: keyof ShotsGainedRecord): number {
  return rounds.reduce((a, r) => a + (r[key] as number), 0) / rounds.length;
}

// ── summary strip ─────────────────────────────────────────────────────────────

function SummaryStrip({ rounds }: { rounds: ShotsGainedRecord[] }) {
  const cols: { label: string; key: keyof ShotsGainedRecord; lime?: boolean }[] = [
    { label: "Off Tee", key: "sgOffTee" },
    { label: "Approach", key: "sgApproach" },
    { label: "Arnd Green", key: "sgAroundGreen" },
    { label: "Putting", key: "sgPutting" },
    { label: "Total", key: "total", lime: true },
  ];

  return (
    <div className="mb-1 flex items-stretch overflow-hidden rounded-[9px] border border-border bg-gradient-to-r from-card to-card">
      <div className="flex shrink-0 items-center px-4 py-3">
        <span className="whitespace-nowrap text-[10px] font-extrabold uppercase tracking-[.12em] text-primary">
          6-Round Avg
        </span>
      </div>
      <div className="flex flex-1 items-center divide-x divide-border/50">
        {cols.map(({ label, key, lime }) => {
          const a = avg(rounds, key);
          return (
            <div key={key} className="flex flex-1 flex-col items-center px-3 py-3">
              <span className="text-[10px] font-extrabold uppercase tracking-[.08em] text-muted-foreground">
                {label}
              </span>
              <span
                className={cn(
                  "mt-0.5 font-mono text-[14px] font-semibold",
                  lime ? "text-primary" : sgColor(a),
                )}
              >
                {fmtSg(a)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── row draft ─────────────────────────────────────────────────────────────────

interface RowDraft {
  sgOffTee: string;
  sgApproach: string;
  sgAroundGreen: string;
  sgPutting: string;
}

const SG_FIELD_LABELS: Record<keyof RowDraft, string> = {
  sgOffTee: "Off Tee",
  sgApproach: "Approach",
  sgAroundGreen: "Around Green",
  sgPutting: "Putting",
};

function SgInput({
  field,
  draft,
  onChange,
}: {
  field: keyof RowDraft;
  draft: RowDraft;
  onChange: (f: keyof RowDraft, v: string) => void;
}) {
  return (
    <input
      type="number"
      step="0.1"
      value={draft[field]}
      onChange={(e) => onChange(field, e.target.value)}
      className="w-16 rounded border border-primary/50 bg-transparent px-1.5 py-0.5 text-center font-mono text-sm outline-none focus:border-primary"
      aria-label={SG_FIELD_LABELS[field]}
    />
  );
}

function RoundRow({
  round,
  editingId,
  onEdit,
  onCancel,
  onSave,
  onDelete,
}: {
  round: ShotsGainedRecord;
  editingId: string | null;
  onEdit: (id: string) => void;
  onCancel: () => void;
  onSave: (id: string, draft: RowDraft) => void;
  onDelete: (id: string) => void;
}) {
  const editing = editingId === round.id;
  const [draft, setDraft] = React.useState<RowDraft>({
    sgOffTee: String(round.sgOffTee),
    sgApproach: String(round.sgApproach),
    sgAroundGreen: String(round.sgAroundGreen),
    sgPutting: String(round.sgPutting),
  });

  React.useEffect(() => {
    if (editing) {
      setDraft({
        sgOffTee: String(round.sgOffTee),
        sgApproach: String(round.sgApproach),
        sgAroundGreen: String(round.sgAroundGreen),
        sgPutting: String(round.sgPutting),
      });
    }
  }, [editing, round]);

  const update = (f: keyof RowDraft, v: string) => setDraft((d) => ({ ...d, [f]: v }));

  const liveTotal = editing
    ? (Number(draft.sgOffTee) || 0) +
      (Number(draft.sgApproach) || 0) +
      (Number(draft.sgAroundGreen) || 0) +
      (Number(draft.sgPutting) || 0)
    : round.total;

  const sgPairs: [string, number][] = [
    ["sgOffTee", round.sgOffTee],
    ["sgApproach", round.sgApproach],
    ["sgAroundGreen", round.sgAroundGreen],
    ["sgPutting", round.sgPutting],
  ];

  return (
    <tr className="group border-b border-border last:border-0 transition-colors hover:bg-accent/50">
      <td className="min-h-[56px] py-[14px] pl-4 pr-3 align-middle">
        <div className="text-[14px] font-bold text-foreground">{round.course}</div>
        <div className="font-mono text-[12px] text-muted-foreground">
          {fmtDate(round.date)}
        </div>
      </td>

      {editing ? (
        <>
          {(["sgOffTee", "sgApproach", "sgAroundGreen", "sgPutting"] as (keyof RowDraft)[]).map((f) => (
            <td key={f} className="py-[14px] pr-3 text-center align-middle">
              <SgInput field={f} draft={draft} onChange={update} />
            </td>
          ))}
        </>
      ) : (
        sgPairs.map(([k, v]) => (
          <td key={k} className="py-[14px] pr-3 text-center align-middle">
            <span className={cn("font-mono text-[14px] font-semibold", sgColor(v))}>
              {fmtSg(v)}
            </span>
          </td>
        ))
      )}

      <td className="py-[14px] pr-3 text-center align-middle">
        <span className="font-mono text-[15px] font-bold text-primary">
          {fmtSg(liveTotal)}
        </span>
      </td>

      <td className="py-[14px] pr-4 text-right align-middle">
        {editing ? (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => onSave(round.id, draft)}
              className="flex h-9 w-9 items-center justify-center rounded-[6px] text-positive hover:bg-positive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Save"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex h-9 w-9 items-center justify-center rounded-[6px] text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Cancel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <button
              type="button"
              onClick={() => onEdit(round.id)}
              className="rounded-[6px] p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Edit round"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(round.id)}
              className="rounded-[6px] p-1.5 text-muted-foreground hover:bg-negative/10 hover:text-negative"
              aria-label="Remove round"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

// ── add round dialog ──────────────────────────────────────────────────────────

function AddRoundDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const addRound = useAddRound();
  const [date, setDate] = React.useState("");
  const [course, setCourse] = React.useState("");
  const [sgOffTee, setSgOffTee] = React.useState("");
  const [sgApproach, setSgApproach] = React.useState("");
  const [sgAroundGreen, setSgAroundGreen] = React.useState("");
  const [sgPutting, setSgPutting] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  function reset() {
    setDate("");
    setCourse("");
    setSgOffTee("");
    setSgApproach("");
    setSgAroundGreen("");
    setSgPutting("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!date) { setError("Date is required."); return; }
    if (!course.trim()) { setError("Course is required."); return; }
    try {
      await addRound.mutateAsync({
        date: new Date(date).toISOString(),
        course: course.trim(),
        sgOffTee: Number(sgOffTee) || 0,
        sgApproach: Number(sgApproach) || 0,
        sgAroundGreen: Number(sgAroundGreen) || 0,
        sgPutting: Number(sgPutting) || 0,
      });
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add round.");
    }
  }

  const sgFields: { label: string; value: string; set: (v: string) => void }[] = [
    { label: "Off Tee", value: sgOffTee, set: setSgOffTee },
    { label: "Approach", value: sgApproach, set: setSgApproach },
    { label: "Around Green", value: sgAroundGreen, set: setSgAroundGreen },
    { label: "Putting", value: sgPutting, set: setSgPutting },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-black tracking-[-0.01em]">
            Add Round
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="add-round-date" className="text-[11px] font-extrabold uppercase tracking-[.08em]">
                Date
              </Label>
              <input
                id="add-round-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-card px-3 py-1 font-mono text-sm text-foreground outline-none focus:border-primary dark:[color-scheme:dark]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-round-course" className="text-[11px] font-extrabold uppercase tracking-[.08em]">
                Course
              </Label>
              <Input
                id="add-round-course"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. Harding Park"
              />
            </div>
          </div>

          <div>
            <p className="mb-2.5 text-[11px] font-extrabold uppercase tracking-[.08em] text-muted-foreground">
              Shots Gained
            </p>
            <div className="grid grid-cols-2 gap-3">
              {sgFields.map(({ label, value, set }) => {
                const fieldId = `add-round-sg-${label.toLowerCase().replace(/\s+/g, "-")}`;
                return (
                  <div key={label} className="space-y-1.5">
                    <Label htmlFor={fieldId} className="text-[11px] font-extrabold uppercase tracking-[.08em]">
                      {label}
                    </Label>
                    <Input
                      id={fieldId}
                      type="number"
                      step="0.1"
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      placeholder="0.0"
                      className="font-mono"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {error ? (
            <p className="text-sm text-negative" role="alert">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addRound.isPending}
              className="font-bold"
            >
              {addRound.isPending ? "Saving…" : "Add Round"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── main section ──────────────────────────────────────────────────────────────

export function ShotsGainedSection() {
  const { data: rounds, isLoading, isError } = useRounds();
  const updateRound = useUpdateRound();
  const deleteRound = useDeleteRound();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);

  function handleSave(id: string, draft: RowDraft) {
    updateRound.mutate({
      id,
      patch: {
        sgOffTee: Number(draft.sgOffTee) || 0,
        sgApproach: Number(draft.sgApproach) || 0,
        sgAroundGreen: Number(draft.sgAroundGreen) || 0,
        sgPutting: Number(draft.sgPutting) || 0,
      },
    });
    setEditingId(null);
  }

  return (
    <>
      <div className="space-y-3">
        <div>
          <h2 className="text-[19px] font-black tracking-[-0.01em] text-foreground">
            Shots Gained
          </h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            per round, baseline scratch
          </p>
        </div>

        <Card className="overflow-hidden p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-[9px] bg-muted"
                />
              ))}
            </div>
          ) : isError ? (
            <p className="p-4 text-sm text-muted-foreground">
              Could not load rounds.
            </p>
          ) : !rounds || rounds.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No rounds recorded yet. Log a round from the Planner, or add
                one here.
              </p>
              <Button
                size="sm"
                onClick={() => setAddOpen(true)}
                className="gap-1.5 font-bold"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Round
              </Button>
            </div>
          ) : (
            <>
              {rounds.length >= 2 ? (
                <div className="px-4 pt-4 pb-1">
                  <SummaryStrip rounds={rounds} />
                </div>
              ) : null}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-card">
                      <th className="py-3 pl-4 pr-3 text-left">
                        <span className="text-[10px] font-extrabold uppercase tracking-[.12em] text-muted-foreground">
                          Round
                        </span>
                      </th>
                      {["Off Tee", "Approach", "Arnd Green", "Putting"].map(
                        (h) => (
                          <th key={h} className="py-3 pr-3 text-center">
                            <span className="text-[10px] font-extrabold uppercase tracking-[.12em] text-muted-foreground">
                              {h}
                            </span>
                          </th>
                        ),
                      )}
                      <th className="py-3 pr-3 text-center">
                        <span className="text-[10px] font-extrabold uppercase tracking-[.12em] text-primary">
                          Total
                        </span>
                      </th>
                      <th className="py-3 pr-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {rounds.map((round) => (
                      <RoundRow
                        key={round.id}
                        round={round}
                        editingId={editingId}
                        onEdit={setEditingId}
                        onCancel={() => setEditingId(null)}
                        onSave={handleSave}
                        onDelete={(id) => deleteRound.mutate(id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="flex w-full items-center justify-center gap-2 border-t border-border py-3 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
                Add round
              </button>
            </>
          )}
        </Card>
      </div>

      <AddRoundDialog open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
}
