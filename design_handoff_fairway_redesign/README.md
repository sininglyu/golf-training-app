# Handoff: Fairway — Athletic Redesign (Progress Dashboard + Weekly Planner)

## Overview
Fairway is a personal golf-training tracker (desktop-first web app). This handoff covers a full visual redesign toward an **athletic, high-contrast, sports-app aesthetic** (think Nike Training / premium fitness tracker, not a country club). It includes the four-page fixed shell plus fully designed **Progress/Dashboard** and **Weekly Planner** pages, and lighter passes on **Session Logger** and **Settings**. The design ships in **dark mode by default**, with a **light mode** also provided.

Two complete visual directions are included behind an in-prototype toggle, each available in dark and light:
- **Look A** — refined charcoal. Rounded cards (13px), subtle borders, left edge-bar active nav.
- **Look B** — brutalist graphite. Squared corners (4px), heavier borders, full lime-block active nav, and a **neutral (monochrome) accent stripe** on metric cards (NOT per-stat colors).

Pick one look to ship (or let the user decide); support both color modes. All measurements below are given for **Look A / dark** with Look B and light-mode deltas called out.

## About the Design Files
The files in this bundle are **design references created in HTML** — a prototype showing intended look and behavior, **not production code to copy directly**. `Fairway.dc.html` is a self-contained custom component format (it uses a small runtime, `support.js`, to render); do not import it into the app.

**Your task:** recreate these designs in the existing Fairway codebase using its established patterns:
- **Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui (New York style, zinc base)**.
- **No new libraries.** Output updated Tailwind classes and shadcn/ui token overrides only.
- Use shadcn primitives where they fit: `Card`, `Dialog`, `Tabs` (Week/Month), `Button`, `Input`, `Textarea`, `Table`, `Badge`, `Avatar`.

To view the prototype: open `Fairway.dc.html` in a browser. Use the **DARK / LIGHT** and **LOOK A / LOOK B** toggles (top-right) and the sidebar nav to move between pages. The Week-Focus banner, SG table rows, and Add-Session/Add-Round dialogs are all interactive.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, and interactions are all specified. Recreate the UI pixel-perfectly using shadcn/ui + Tailwind, mapping the values below onto the existing design-token system.

---

## Design Tokens

### Color — neutrals (dark mode)
These map cleanly onto Tailwind `zinc` + a couple of custom near-blacks. Recommend setting them as CSS variables / shadcn tokens.

| Role | Look A | Look B | Tailwind-ish |
| --- | --- | --- | --- |
| App background | `#0a0a0a` | `#101012` | ~`zinc-950` |
| Surface (card) | `#121212` | `#1a1a1e` | between `zinc-950/900` |
| Surface-2 (chips, icon btns) | `#1f1f1f` | `#26262c` | ~`zinc-800` |
| Sidebar bg | `#0a0a0a` | `#0b0b0d` | |
| Border | `#1f1f1f` | `#2c2c34` | ~`zinc-800` |
| Border (hover/strong) | `#333333` | `#3a3a44` | ~`zinc-700` |
| Row hover | `#161616` | `#202026` | |
| Table head bg | `#0e0e0e` | `#16161a` | |
| Header bar bg | `rgba(10,10,10,.85)` + `backdrop-blur(10px)` | `rgba(16,16,18,.85)` | |
| Text (primary) | `#fafafa` | `#f4f4f5` | `zinc-50` |
| Text (dim / labels) | `#71717a` | `#8b8b96` | `zinc-500` |
| Text (dimmer / captions) | `#52525b` | `#5c5c66` | `zinc-600` |

### Color — brand accent
- **Lime accent:** `#a3e635` (Tailwind `lime-400`). Used for: CTAs (lime bg + `#0a0a0a` text), active nav, logo mark, positive deltas, SG positive values, Total column, focus highlights, "today" markers. Glow used on logo/swatches: `box-shadow: 0 0 16px rgba(163,230,53,.7)`.
- **Accent text-on-lime:** `#0a0a0a`.
- **Positive (gain):** `#a3e635`. **Negative (loss):** `#fb7185` (rose-400).
- **Light-mode accent text:** lime `#a3e635` is too low-contrast on white, so accent *text/values* (eyebrows, Total, positive SG, "6-Round Average" label, focus label, "Linked" badge) use **`#4d7c0f`** (lime-700); negative SG/delta uses **`#be123c`** (rose-700). Lime stays `#a3e635` for solid fills (button backgrounds, active-nav block, logo mark) where dark text sits on top. Positive delta-chip bg in light = `rgba(163,230,53,.22)`, negative = `rgba(251,113,133,.18)`.

### Light mode — neutrals
| Role | Value | Tailwind-ish |
| --- | --- | --- |
| App background | `#f4f4f5` | `zinc-100` |
| Surface (card) / sidebar | `#ffffff` | white |
| Surface-2 (chips, icon btns) | `#e4e4e7` | `zinc-200` |
| Border | `#e4e4e7` | `zinc-200` |
| Border (hover/strong) | `#d4d4d8` | `zinc-300` |
| Row hover | `#f4f4f5` | `zinc-100` |
| Table head bg | `#fafafa` | `zinc-50` |
| Header bar bg | `rgba(255,255,255,.85)` + blur | |
| Text primary / dim / dimmer | `#18181b` / `#71717a` / `#a1a1aa` | zinc-900 / 500 / 400 |
| Summary strip bg / border | `linear-gradient(90deg,#f7fee7,#fff)` / `#d9f99d` | lime-50 / lime-200 |
| Active nav (Look A) | bg `#e4e4e7`, text `#18181b` | |
| "Today" wash (planner) | `rgba(163,230,53,.16)` | |

### Look B metric stripe (updated)
Look B shows a left accent stripe (4px) on each metric card. It is **neutral/monochrome** — `#3a3a44` in dark, `#d4d4d8` in light — the **same** on every card. (Earlier drafts used a different per-stat color per card; that has been removed.) Look A keeps no visible stripe (opacity 0).

### Color — session-type system (vibrant, distinct)
Each type has a solid color; badge/card backgrounds use the same color at **12–16% alpha**.

| Type | Hex | Tailwind |
### Color — session-type system (vibrant, distinct)
Each type has a solid color; badge/card backgrounds use the same color at **12–16% alpha** (16–20% in light mode). In **light mode**, badge/label *text* uses a darker shade of each type color (the "Light text" column) for contrast; the solid color is still used for dots, swatches, and left borders.

| Type | Hex (solid) | Light text | Tailwind |
| --- | --- | --- | --- |
| Driving Range | `#f59e0b` | `#b45309` | amber-500 / 700 |
| Short Game | `#a3e635` | `#4d7c0f` | lime-400 / 700 |
| On-Course Round | `#22d3ee` | `#0e7490` | cyan-400 / 700 |
| Putting Practice | `#c084fc` | `#7e22ce` | purple-400 / 700 |
| Fitness / Gym | `#fb7185` | `#be123c` | rose-400 / 700 |
| Mental Game | `#60a5fa` | `#1d4ed8` | blue-400 / 700 |

Badge bg = `rgba(<color>, 0.12–0.16)` (dark) / `0.16–0.20` (light); badge text = solid color (dark) / Light-text shade (light); border = the solid color. Session cards add `border-left: 3px solid <color>`.

### Typography
Two families:
- **Archivo** (Google Fonts) — UI, headings, labels. Weights used: 400/500/600/700/800/900.
- **JetBrains Mono** (Google Fonts) — all numerals (metric values, SG figures, dates, GHIN number, day numbers). Weights 500/600/700.

Type scale (px):
| Use | Font | Size | Weight | Letter-spacing | Notes |
| --- | --- | --- | --- | --- | --- |
| Page title (header bar) | Archivo | 14 | 800 | .18em | uppercase |
| Page H1 ("Your Progress") | Archivo | 30 | 900 | -.02em | |
| Section eyebrow ("OVERVIEW · LAST 6 ROUNDS") | Archivo | 11 | 800 | .2em | uppercase, lime |
| Metric value | JetBrains Mono | 44 | 600 | -.04em | line-height 1 |
| Metric unit (%, etc.) | JetBrains Mono | 17 | 500 | | dimmer color |
| Metric label | Archivo | 11 | 800 | .13em | uppercase, dim |
| Delta chip | JetBrains Mono | 12 | 700 | | with ▲/▼ glyph |
| Section heading ("Shots Gained") | Archivo | 19 | 900 | -.01em | |
| Table header cells | Archivo | 10 | 800 | .12em | uppercase, dim |
| Table SG value | JetBrains Mono | 14 | 600 | | colored by sign |
| Table Total value | JetBrains Mono | 15 | 700 | | |
| Nav item | Archivo | 14 | 700 | | |
| Logo wordmark | Archivo | 19 | 900 | .16em | "FAIRWAY" |
| Session card type label | Archivo | 9 | 900 | .08em | uppercase, type color |
| Session card title | Archivo | 12.5 | 700 | | |
| Dialog title | Archivo | 17 | 900 | -.01em | |
| Field label | Archivo | 11 | 800 | .08em | uppercase, dim |

### Spacing / radius / shadow
- Content padding (main): `32px`. Sidebar nav padding: `18px 14px`. Card padding: `18px` (metrics), `22px` (settings/dialog body).
- Grid gaps: metric grid `14px`; week grid `10px`; summary strip cells flexible.
- Radius — **Look A:** card 13px, button 10px, nav item 9px, session card 9px, small chip/icon-btn 6–7px, avatar 50% (circle). **Look B:** card/button/nav/session all `4px`, avatar `4px`, logo dot `1px`.
- Metric card accent stripe (left): width 3px (A, opacity 0 — hidden) / 4px (B, opacity 1, colored per metric).
- Dialog shadow: `0 30px 80px rgba(0,0,0,.6)`; overlay `rgba(0,0,0,.7)` + `backdrop-blur(3px)`.
- Toggle/floating shadow: `0 8px 30px rgba(0,0,0,.6)`.

---

## Shell (all pages)

**Fixed layout, desktop-first.** Flex row, `min-height:100vh`.

- **Sidebar** — `264px` fixed, `position:sticky; top:0; height:100vh`, right border `1px`.
  - Logo zone: `88px` tall, bottom border. Lime square mark (14px, radius 3px A / 1px B, lime glow) + "FAIRWAY" wordmark.
  - Nav: 4 items in order — **Weekly Planner, Session Logger, Progress, Settings** — each a left-aligned button, `12px 15px` padding, icon (18px stroke) + label, `gap:13px`.
    - **Active state (Look A):** bg `#1a1a1a`, text `#fafafa`, plus a 3px lime bar on the left inner edge.
    - **Active state (Look B):** bg lime `#a3e635`, text `#0a0a0a`, no bar.
    - **Inactive:** transparent bg, text = dim; hover `filter:brightness(1.25)`.
  - Footer user card: avatar (lime circle "JM"), "Jordan Mills", mono caption "HCP 8.4 · GHIN".
- **Header bar** — `64px`, bottom border, sticky, translucent + blur. Left: page title (uppercase, .18em). Right: lime dot + today's date in mono (`new Date()` → e.g. "Sat, Jun 21").
- **Main** — `flex:1`, `padding:32px`, `overflow-y:auto`. Content max-widths: dashboard `1200px`, planner `1280px`, sessions `880px`, settings `680px`.

---

## Screens / Views

### 1. Progress / Dashboard (`/dashboard`)
**Purpose:** at-a-glance performance across the last 6 rounds + editable Shots-Gained log.

**Layout (top → bottom):**
1. **Header row** — left: eyebrow ("OVERVIEW · LAST 6 ROUNDS", lime) + H1 "Your Progress"; right: lime **Add Round** button (icon + label, `11px 18px`).
2. **Metric grid** — `grid-template-columns: repeat(4, 1fr); gap:14px`. **8 cards**, `min-height:138px`, column-flex: label (top) → value+unit (pushed to bottom via `margin-top:auto`) → delta row.
   - Delta chip: pill, mono, `▲` on positive (lime, bg `rgba(163,230,53,.14)`) / `▼` on negative (rose, bg `rgba(251,113,133,.14)`), followed by a dim sub-caption.
   - Cards (label / value / unit / delta / sub): Sessions `24` / +5 / "this month" · Rounds `6` / +2 / "last 30 days" · Handicap `8.4` / −0.6 / "trending down" · Avg SG `+3.6` / +1.2 / "per round" · Fairways `62%` / +4 / "hit / round" · GIR `51%` / −3 / "greens reg" · Putts `30.2` / −1.1 / "per round" · Scoring `78.6` / −0.8 / "avg score".
   - Look B only: each card shows a 4px **neutral** left stripe (`#3a3a44` dark / `#d4d4d8` light) — the same on every card, not per-stat colors. Look A shows no stripe.
3. **"Shots Gained" section heading** + caption "per round, baseline scratch".
4. **6-Round Average summary strip** — shown only when `rounds.length >= 2`. Horizontal band, lime-tinted gradient bg (`linear-gradient(90deg,#16180f,#121212)`, border `#2a2e1c`). Left label cell "6-ROUND AVERAGE" (lime), then 5 equal cells: Off Tee / Approach / Arnd Green / Putting / Total, each a mono value colored by sign (Total always lime).
5. **Shots Gained table** — surface card, rounded, overflow hidden.
   - Columns: `grid-template-columns: 2.4fr 1fr 1fr 1fr 1fr 1fr 64px` — **Round** (left), Off Tee, Approach, Arnd Green, Putting, **Total** (lime header), actions.
   - Header row `46px`, table-head bg, uppercase labels.
   - Each data row `min-height:56px`, bottom border. Round cell = course name (700) over mono date (dim). SG cells right-aligned mono, colored: positive lime, negative rose, ~0 dim. Total bolder (700).
   - **Hover:** row bg → row-hover color; action buttons (edit + delete) fade in (`opacity 0→1`, .12s) at the right.
   - Footer: ghost "+ Add round" button (full width, dim) — opens Add Round dialog.
   - Seed data (6 rounds, course / date / ott / app / arg / putt): Pebble Beach GL · Jun 14 · 1.8/2.4/−0.6/1.1 — Spyglass Hill · Jun 07 · 0.9/−1.2/0.4/2.3 — Pacific Grove · May 30 · 2.1/1.6/1.2/−0.8 — Poppy Hills · May 22 · −0.4/3.1/0.2/1.4 — Bayonet Black · May 15 · 1.2/0.8/−1.1/0.6 — Pebble Beach GL · May 08 · 0.3/1.9/0.9/1.8.

### 2. Weekly Planner (`/planner`)
**Purpose:** plan training sessions across the week/month; set a one-line weekly focus.

**Layout:**
1. **Header row** — left: Week/Month segmented toggle (shadcn `Tabs`; active tab = lime bg + `#0a0a0a` text, inactive = transparent + dim) and a range label (H2-weight, "Jun 9 – 15" / "June 2025"); right: lime **Add Session** button.
2. **Week Focus banner** — slim bar, `border-left: 3px solid lime`, padding `13px 18px`. Left: "WEEK FOCUS" micro-label (lime). Then either the focus text (15px, 600) with a hover-revealed **Edit** (pencil) button, or — in edit mode — an inline `Input` (lime border) + lime **Save** button. **Enter** saves, **Esc** cancels. Seed text: "Shorten the backswing — feel connected through impact".
3a. **Week view** — `grid-template-columns: repeat(7, 1fr); gap:10px`. Each day = a column card (`min-height:340px`):
   - Header: DOW (uppercase micro) over mono day number; a lime dot top-right marks "today" (Thu/12 in seed).
   - Body: stacked **session cards** (`gap:7px`). Each card: type-color left border (3px), bg `rgba(type,.12)`, type label (9px/900, type color) → title (12.5px/700) → optional notes (11px, dim). Hover lifts `translateY(-2px)`. Click opens the Log/Add Session dialog.
   - "Today" column gets a faint lime wash (`rgba(163,230,53,.05)`) and lime DOW/number.
   - Seed sessions: Mon — Driver tempo ladder (Range) + Mobility/core (Fitness); Tue — Wedge matrix (Short); Wed — Gate drill (Putting) + Visualization (Mental); Thu — empty (today); Fri — Shot shaping (Range); Sat — Pebble Beach (Round); Sun — Bunker session (Short) + Lag putting (Putting).
3b. **Month view** — surface card. DOW header row (Mon–Sun), then `repeat(7,1fr)` grid of day cells (`min-height:96px`, right+bottom borders). Each cell: mono day number (lime if today) → wrapped row of session **dots** (7px squares, radius 2px, in type colors) → bottom-aligned count label ("2 sessions"). Empty leading cells for month offset (seed month starts offset by 2; days 1–30; today = 12).

### 3. Session Logger (`/sessions`)
**Purpose:** review logged sessions. Max-width 880px. H1 "Logged Sessions", then a vertical list (`gap:10px`) of surface cards. Each card row: a date block (mono day number over uppercase month) · vertical divider · type badge + title + drill summary (dim) · right-aligned mono duration. Seed: Jun 11 Putting block (45 min), Jun 10 Wedge matrix (1h 10m), Jun 09 Driver tempo (55 min), Jun 08 Gym session (45 min), Jun 06 Spyglass Hill (4h 05m). (This page is a lighter pass — extend the expandable drill list if needed.)

### 4. Settings (`/settings`)
**Purpose:** GHIN integration + session-type color legend. Max-width 680px.
- **GHIN card:** title + lime "Linked" badge, helper copy, mono GHIN number input, password input, lime "Sync Handicap" button.
- **Session Types card:** 2-column grid of all 6 types — each a swatch (14px square, radius 4px, type color, soft glow `0 0 10px rgba(type,.5)`) + label.

---

## Interactions & Behavior
- **Look toggle** — floating top-right pill switches the entire theme (Look A ↔ Look B) at runtime. In the real app this is a build/brand decision: ship ONE look. (Don't port the toggle to production.)
- **Dark / Light mode toggle** — second floating pill (DARK ↔ LIGHT). This one SHOULD ship as a real user preference (persist it, respect `prefers-color-scheme`). Works under both looks. Default = dark. See the light-mode token tables above for the palette and the accent-text contrast adjustments.
- **Sidebar nav** — sets active page; active item styled per look (see Shell). Hover brightens.
- **Add Round** (header button OR table footer "+ Add round") — opens **Add Round dialog**: Course text input + 4 SG number inputs (Off Tee / Approach / Around Green / Putting) in a 2×2 grid. Submit prepends a new row dated today; total auto-computed.
- **SG table row edit** — hover reveals Edit (pencil) + Delete (trash, rose) icon buttons. Edit swaps the 4 SG cells for lime-bordered number inputs; Total updates **live** as you type; ✓ saves, ✕ cancels. Delete removes the row.
- **Add Session** (planner header) / **session card click** — opens **Add Session dialog**: Title input, a 3-col grid **type picker** (6 buttons; selected = type-color border + tinted bg + colored text), Notes textarea.
- **Dialogs** — centered modal, overlay click or ✕ closes, body click stops propagation, `Cancel` / lime primary CTA in footer. Enter animation `popIn` (translateY 10px + scale .98 → none, .2s); overlay `fadeIn` .15s.
- **Week Focus** — pencil → inline input; Enter saves, Esc cancels; Save button commits.
- **Week/Month tabs** — switch planner body.
- **Hovers** — session cards lift 2px; table rows tint + reveal actions; nav brightens; metric card border can go to the strong-border color.

## State Management
Component-local state is sufficient (or lift to the route/page):
- `page` — active nav route (handled by Next.js routing in production).
- `plannerView` — `'week' | 'month'`.
- `rounds[]` — `{ id, date, course, ott, app, arg, putt }`; **total is derived** (`ott+app+arg+putt`), never stored. Drives metrics summary + table.
- `editingRowId` + `draft` — inline SG edit buffer; commit parses to numbers (NaN → 0).
- `focus`, `focusEditing`, `focusDraft` — weekly focus banner.
- `dialog` (`'round' | 'session' | null`) + `dlg{}` form buffer.
- Planner week/month session data — static in the prototype; wire to real data source.
- **Summary strip** visibility gates on `rounds.length >= 2`.
- Derived helpers: `sgColor(v)` (sign → lime/rose/dim), `fmtSg(v)` (`+`/`−` prefix, 1 decimal), badge bg = color @ ~12% alpha.

## Assets
- **Fonts:** Archivo + JetBrains Mono (Google Fonts). Add via `next/font/google`.
- **Icons:** all inline SVG (nav grid/list/bars/sliders, plus, pencil, trash, check, x, chevrons). Swap for the codebase's icon set (e.g. `lucide-react`, which ships with shadcn) — equivalents: LayoutGrid, List, BarChart3, SlidersHorizontal, Plus, Pencil, Trash2, Check, X.
- **No raster images / no logos** beyond the lime square mark (a styled div).

## Files
- `Fairway.dc.html` — the full interactive prototype (all 4 pages, both looks, all dialogs & interactions). Open in a browser to explore.
- `support.js` — runtime required to render the prototype. **Reference only — do not ship.**
