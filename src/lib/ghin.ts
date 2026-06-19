import "server-only";

const GHIN_LOGIN_URL = "https://api2.ghin.com/api/v1/golfer_login.json";

/**
 * NOTE: This integration uses GHIN's undocumented mobile-app endpoint
 * (api2.ghin.com). It is not officially supported by the USGA, may stop
 * working without notice, and may violate GHIN's Terms of Use. Intended for
 * personal use only.
 */

export class GhinAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GhinAuthError";
  }
}

export class GhinNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GhinNetworkError";
  }
}

export interface GhinGolfer {
  ghinNumber: string;
  playerName: string;
  clubName: string | null;
  golfAssociationName: string | null;
  /** Current handicap index, e.g. 12.4. May be `null` if establishing. */
  handicapIndex: number | null;
  /** What the GHIN app shows in the index display field, e.g. "12.4". */
  display: string | null;
  lowHandicapIndex: number | null;
  lowHandicapDisplay: string | null;
  softCap: number | null;
  hardCap: number | null;
  /** Raw payload, retained for debugging / future score sync. */
  raw: unknown;
}

export interface GhinLoginResult {
  /** Bearer token for subsequent api2.ghin.com requests. */
  token: string;
  /** All golfers attached to the login (most users have one). */
  golfers: GhinGolfer[];
  /** Convenience pointer at golfers[0]. */
  primary: GhinGolfer;
}

interface GhinLoginRawGolfer {
  ghin_number?: string;
  player_name?: string;
  club_name?: string | null;
  golf_association_name?: string | null;
  handicap_index?: number | string | null;
  display?: string | null;
  low_hi?: number | string | null;
  low_hi_display?: string | null;
  soft_cap?: number | string | null;
  hard_cap?: number | string | null;
  [key: string]: unknown;
}

interface GhinLoginRawResponse {
  golfer_user?: {
    golfer_user_token?: string;
    golfers?: GhinLoginRawGolfer[];
  };
  message?: string;
  error?: string;
}

function toNumber(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Parse GHIN's display string into a signed numeric index.
 *
 * GHIN convention:
 *   - "12.4"  →  12.4
 *   - "+2.4"  → -2.4   (plus handicaps are stored as negative numbers)
 *   - "NH"    → null   (no handicap established)
 *   - ""/null → null
 */
function parseDisplay(s: string | null | undefined): number | null {
  if (!s) return null;
  const trimmed = String(s).trim();
  if (!trimmed || trimmed.toUpperCase() === "NH") return null;
  if (trimmed.startsWith("+")) {
    const n = Number(trimmed.slice(1));
    return Number.isFinite(n) ? -n : null;
  }
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function normalizeGolfer(raw: GhinLoginRawGolfer): GhinGolfer {
  const display = (raw.display as string | null | undefined) ?? null;
  const lowDisplay =
    (raw.low_hi_display as string | null | undefined) ?? null;

  // Prefer the numeric field when present, but fall back to parsing the
  // display string. Some GHIN responses omit `handicap_index` / `low_hi`
  // entirely and only ship the formatted string.
  const handicapIndex = toNumber(raw.handicap_index) ?? parseDisplay(display);
  const lowHandicapIndex =
    toNumber(raw.low_hi) ?? parseDisplay(lowDisplay);

  return {
    ghinNumber: String(raw.ghin_number ?? ""),
    playerName: String(raw.player_name ?? ""),
    clubName: (raw.club_name as string | null | undefined) ?? null,
    golfAssociationName:
      (raw.golf_association_name as string | null | undefined) ?? null,
    handicapIndex,
    display,
    lowHandicapIndex,
    lowHandicapDisplay: lowDisplay,
    softCap: toNumber(raw.soft_cap),
    hardCap: toNumber(raw.hard_cap),
    raw,
  };
}

/**
 * Authenticate against GHIN with email-or-ghin + password and return the
 * golfer profile(s) along with a bearer token usable for subsequent calls.
 */
export async function loginGhin(
  emailOrGhin: string,
  password: string,
): Promise<GhinLoginResult> {
  let res: Response;
  try {
    res = await fetch(GHIN_LOGIN_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: {
          email_or_ghin: emailOrGhin,
          password,
          remember_me: "true",
        },
        token: "123",
      }),
      cache: "no-store",
    });
  } catch (err) {
    throw new GhinNetworkError(
      `Could not reach GHIN: ${err instanceof Error ? err.message : "unknown error"}`,
    );
  }

  let body: GhinLoginRawResponse;
  try {
    body = (await res.json()) as GhinLoginRawResponse;
  } catch {
    throw new GhinNetworkError(
      `GHIN returned a non-JSON response (HTTP ${res.status}).`,
    );
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new GhinAuthError(
        body.message ?? body.error ?? "Invalid GHIN email or password.",
      );
    }
    throw new GhinNetworkError(
      `GHIN login failed (HTTP ${res.status}): ${body.message ?? body.error ?? "unknown error"}`,
    );
  }

  const token = body.golfer_user?.golfer_user_token;
  const rawGolfers = body.golfer_user?.golfers ?? [];
  if (!token || rawGolfers.length === 0) {
    throw new GhinAuthError(
      "GHIN response did not include a golfer or token. Double-check your credentials.",
    );
  }

  const golfers = rawGolfers.map(normalizeGolfer);
  return { token, golfers, primary: golfers[0] };
}
