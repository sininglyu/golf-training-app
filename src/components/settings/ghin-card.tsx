"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RefreshCw, Trash2, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface GhinStatus {
  connected: boolean;
  emailOrGhin: string | null;
  ghinNumber: string | null;
  golferName: string | null;
  currentIndex: number | null;
  lowIndex: number | null;
  lastSyncedAt: string | null;
  lastError: string | null;
}

interface GhinCardProps {
  initialStatus: GhinStatus;
}

interface ConnectResponse {
  ghinNumber: string | null;
  golferName: string | null;
  currentIndex: number | null;
  lowIndex: number | null;
  lastSyncedAt: string;
}

function formatIndex(n: number | null): string {
  if (n == null) return "—";
  // GHIN stores plus handicaps as negative numbers; render with leading "+".
  if (n < 0) return `+${(-n).toFixed(1)}`;
  return n.toFixed(1);
}

function formatRelative(iso: string | null): string {
  if (!iso) return "never";
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  if (!Number.isFinite(diff)) return new Date(iso).toLocaleString();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  if (day < 14) return `${day} day${day === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString();
}

export function GhinCard({ initialStatus }: GhinCardProps) {
  const router = useRouter();
  const [status, setStatus] = React.useState<GhinStatus>(initialStatus);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [busy, setBusy] = React.useState<"sync" | "disconnect" | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const refreshAfter = React.useCallback(() => {
    // Re-render the page so the server component re-reads from the DB.
    router.refresh();
  }, [router]);

  const onConnected = (resp: ConnectResponse, emailOrGhin: string) => {
    setStatus({
      connected: true,
      emailOrGhin,
      ghinNumber: resp.ghinNumber,
      golferName: resp.golferName,
      currentIndex: resp.currentIndex,
      lowIndex: resp.lowIndex,
      lastSyncedAt: resp.lastSyncedAt,
      lastError: null,
    });
    refreshAfter();
  };

  const handleSync = async () => {
    setBusy("sync");
    setActionError(null);
    try {
      const res = await fetch("/api/ghin/sync", { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as Partial<
        ConnectResponse & { error: string }
      >;
      if (!res.ok) {
        throw new Error(body.error ?? `Sync failed (${res.status})`);
      }
      setStatus((s) => ({
        ...s,
        connected: true,
        ghinNumber: body.ghinNumber ?? s.ghinNumber,
        golferName: body.golferName ?? s.golferName,
        currentIndex: body.currentIndex ?? s.currentIndex,
        lowIndex: body.lowIndex ?? s.lowIndex,
        lastSyncedAt: body.lastSyncedAt ?? new Date().toISOString(),
        lastError: null,
      }));
      refreshAfter();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setBusy(null);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect GHIN? Your stored credentials will be deleted.")) {
      return;
    }
    setBusy("disconnect");
    setActionError(null);
    try {
      const res = await fetch("/api/ghin/disconnect", { method: "DELETE" });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Disconnect failed (${res.status})`);
      }
      setStatus({
        connected: false,
        emailOrGhin: null,
        ghinNumber: null,
        golferName: null,
        currentIndex: null,
        lowIndex: null,
        lastSyncedAt: null,
        lastError: null,
      });
      refreshAfter();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Disconnect failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">GHIN Handicap</div>
          <p className="text-xs text-muted-foreground">
            Pulls your USGA handicap index from the GHIN mobile-app endpoint.
            Unofficial integration, personal use only.
          </p>
        </div>
      </div>

      {status.connected ? (
        <ConnectedView
          status={status}
          busy={busy}
          onSync={handleSync}
          onDisconnect={handleDisconnect}
        />
      ) : (
        <DisconnectedView onConnect={() => setDialogOpen(true)} />
      )}

      {actionError ? (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      ) : null}

      {status.lastError ? (
        <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-medium">Last sync error</div>
            <div>{status.lastError}</div>
          </div>
        </div>
      ) : null}

      <ConnectGhinDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConnected={onConnected}
      />
    </div>
  );
}

function DisconnectedView({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="rounded-md border border-dashed p-4">
      <div className="text-sm">No GHIN account linked.</div>
      <p className="mt-1 text-xs text-muted-foreground">
        Connect with your GHIN email/number and password to sync your current
        handicap index.
      </p>
      <Button type="button" className="mt-3" onClick={onConnect}>
        Connect GHIN
      </Button>
    </div>
  );
}

function ConnectedView({
  status,
  busy,
  onSync,
  onDisconnect,
}: {
  status: GhinStatus;
  busy: "sync" | "disconnect" | null;
  onSync: () => void;
  onDisconnect: () => void;
}) {
  return (
    <div className="rounded-md border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            {status.golferName || "Connected"}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {status.ghinNumber ? `GHIN # ${status.ghinNumber} · ` : ""}
            Last synced {formatRelative(status.lastSyncedAt)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSync}
            disabled={busy !== null}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${busy === "sync" ? "animate-spin" : ""}`}
            />
            {busy === "sync" ? "Syncing…" : "Sync now"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDisconnect}
            disabled={busy !== null}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Disconnect
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <Stat label="Handicap Index" value={formatIndex(status.currentIndex)} />
        <Stat label="Low Index" value={formatIndex(status.lowIndex)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/40 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

interface ConnectGhinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: (resp: ConnectResponse, emailOrGhin: string) => void;
}

function ConnectGhinDialog({
  open,
  onOpenChange,
  onConnected,
}: ConnectGhinDialogProps) {
  const [emailOrGhin, setEmailOrGhin] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setEmailOrGhin("");
      setPassword("");
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrGhin.trim() || !password) {
      setError("Both fields are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/ghin/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrGhin: emailOrGhin.trim(),
          password,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as Partial<
        ConnectResponse & { error: string }
      >;
      if (!res.ok) {
        throw new Error(body.error ?? `Connect failed (${res.status})`);
      }
      onConnected(body as ConnectResponse, emailOrGhin.trim());
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connect failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        onClose={() => onOpenChange(false)}
      >
        <DialogHeader>
          <DialogTitle>Connect GHIN</DialogTitle>
          <DialogDescription>
            Enter your GHIN credentials. Your password is encrypted with
            AES-256-GCM and stored only on this server. It is never sent to any
            third party other than GHIN itself.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ghin-email">Email or GHIN Number</Label>
            <Input
              id="ghin-email"
              value={emailOrGhin}
              onChange={(e) => setEmailOrGhin(e.target.value)}
              autoFocus
              autoComplete="username"
              placeholder="you@example.com or 1234567"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ghin-password">Password</Label>
            <Input
              id="ghin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
            <div className="font-medium">Heads up</div>
            <p className="mt-0.5">
              GHIN does not officially support third-party clients. This may
              break if they change their mobile-app endpoint, and using it may
              violate GHIN&apos;s terms of use. Personal use only.
            </p>
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
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Connecting…" : "Connect"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
