# Handoff: RHAMS — Radiated Hazard Assessment & Measurement Suite

## Overview

A six-screen desktop workflow for RF engineers taking radiated-field measurements around a
device under test (DUT). A mobile probe traverses a set of waypoints on a chamber floor plan;
a subset of those waypoints are measurement stops where an E-field reading is captured. The
engineer plans the path, marks which points get measured, runs the survey, reviews past runs,
analyses readings against a hazard limit, and exports/imports the whole dataset.

The six screens are steps in one linear workflow, presented in a single shell with a numbered
left rail.

## About the design files

**The files in this bundle are design references created in HTML.** They are prototypes that
show intended look and behaviour — not production code to copy directly.

The task is to **recreate these designs in the target codebase's existing environment** (React,
Vue, Svelte, native, etc.) using its established component library, routing, state, and styling
patterns. If no environment exists yet, choose the framework that best fits the project and
implement the designs there.

Two things in particular should **not** be carried over literally:

- The prototype is built on a bespoke HTML template runtime (`support.js`). Ignore it entirely.
- All layout styling is written as inline `style` attributes, because the prototype tool
  requires it. In a real codebase these belong in whatever the project already uses (CSS
  modules, Tailwind, styled-components, etc.). Only `styles.css` is meant to survive as CSS.

## Fidelity

**High-fidelity.** Colours, type, spacing, and the two data visualisations are final and
measured. Recreate the UI closely, but source primitives (button, input, select, table, tag)
from the codebase's existing component library rather than reimplementing them — the classes in
`styles.css` map onto conventional primitives.

Not covered by the prototype, and needing product decisions before build: real-time survey
progress, robot connectivity/error states, authentication, and probe-calibration management.

## What's in this bundle

```
design_handoff_rhams/
  README.md                        this file
  prototype/
    RHAMS-prototype.html           self-contained, offline. Open in a browser and
                                   click the left rail to walk all six screens.
  source/
    RHAMS.dc.html                  the design source: markup + view logic
    styles.css                     THE DESIGN TOKENS AND COMPONENT CSS — port this
    support.js                     prototype runtime. Ignore; not part of the design.
```

Read `styles.css` first: its `:root` block is the token contract. In `RHAMS.dc.html`, the markup
is the top half and the view logic (`class Component`) is the bottom half; the SVG generation
lives in the logic.

---

## Design tokens

All values below are the literal contents of `styles.css`. Port the token block as-is; it is the
single source of truth and every screen reads from it.

### Colour — roles

| Token | Value | Used for |
| --- | --- | --- |
| `--color-bg` | `#f2f2f3` | App ground |
| `--color-surface` | `#e9e9ea` | Header bar, figure interiors |
| `--color-text` | `#1d1f20` | All body text |
| `--color-accent` | `#4f80d9` | Primary actions, path, in-limit readings |
| `--color-danger` | `#9b4a4a` | Over-limit readings, destructive actions |
| `--color-divider` | `color-mix(in srgb, #1d1f20 16%, transparent)` | All hairline rules |

### Colour — accent ramp

`100` `#eef3ff` · `200` `#d8e5ff` · `300` `#b6ccfb` · `400` `#90aef2` · `500` `#6b90e2`
· `600` `#4f74c4` · `700` `#3a5896` · `800` `#283c68` · `900` `#1a2643`

### Colour — neutral ramp

`100` `#f5f5f8` · `200` `#e7e7ea` · `300` `#d4d4d7` · `400` `#b7b7ba` · `500` `#98989b`
· `600` `#7a7a7d` · `700` `#5d5d60` · `800` `#424244` · `900` `#2b2b2d`

Ramps are generated in OKLCH on one shared lightness scale, so the same step of any role carries
the same visual weight. Prefer a ramp step over an ad-hoc `color-mix()`.

There is also a `--color-accent-2-*` ramp in the file. This is a **mono** scheme — accent-2 is a
machine-derived stand-in that reads the same as accent, kept only so both variable sets resolve.
Treat them as one role; do not introduce it as a second colour.

### Two contrast rules that must survive the port

1. **Accent is not a body-text colour.** The accent-to-ground pair is tuned to ~3:1 — fine for
   chrome, icons, and large text, not for paragraph copy. For accent-coloured text at body size
   use `--color-accent-700`. The chart's limit label does exactly this.
2. **Text alpha bottoms out at 72%.** De-emphasised text is
   `color-mix(in srgb, var(--color-text) 72%, transparent)` or lighter-weight, never below —
   72% is where 4.5:1 holds on this ground. Hairline *strokes* may go to 45%, but no text may.
   These two were conflated at one point in design and it produced a real accessibility failure.

### Typography

| Token | Value |
| --- | --- |
| `--font-heading` | `"Barlow Condensed", system-ui, sans-serif` |
| `--font-heading-weight` | `600` |
| `--font-body` | `"Barlow", system-ui, sans-serif` |

Applied scale:

| Role | Family | Size | Weight | Notes |
| --- | --- | --- | --- | --- |
| Wordmark | heading | 19px | 600 | `letter-spacing: 0.01em` |
| Screen title (`h4`) | heading | system default | 600 | Right panel head |
| Section label (`.k`) | heading | 11px | — | uppercase, `letter-spacing: 0.1em`, text at 55% |
| Meta strip key | heading | 10px | — | uppercase, `letter-spacing: 0.1em`, text at 50% |
| Body / control | body | 14px | 400 | |
| Secondary / list | body | 13px | 400 | |
| Caption / table unit | body | 12px / 10px | 400 | |

**Every numeric value uses `font-variant-numeric: tabular-nums`** (the `.num` class), so columns
of readings align. This is not optional in an instrument UI — carry it over.

### Spacing, radius, elevation

Spacing scale (0.85× density is already baked in): `--space-1` 3.4px · `-2` 6.8px ·
`-3` 10.2px · `-4` 13.6px · `-6` 20.4px · `-8` 27.2px.

Radius: `--radius-sm` 2px · `--radius-md` 4px · `--radius-lg` 7px.

**Radius is deliberately overridden to 0.** `styles.css` resets
`.card, .btn, .input, .tag, .seg, .dialog` to `border-radius: 0` after the base rules. Square
corners are the design system's premise, not an oversight — every framed object is a blueprint
object. Keep it. (The prototype exposes a corner-radius switch for evaluation only; ship square.)

Elevation: `--shadow-sm` `0 1px 2px` / 14% ink · `--shadow-md` `0 3px 10px` / 16% ·
`--shadow-lg` `0 12px 32px` / 22%. Used sparingly; this design is line-drawn, not layered.

### The blueprint frame

Cards and figures are transparent, hairline-bordered, square, and carry `+` registration marks
at all four corners:

```html
<div class="blueprint">
  <i class="corner tl"></i><i class="corner tr"></i>
  <i class="corner bl"></i><i class="corner br"></i>
  …
</div>
```

Rules: never round a framed element, never give a card or figure a surface fill, never drop the
corner marks. The solid accent primary button is the one deliberate exception to the no-fill rule.

### Interaction states

Themed, never browser defaults. Hover and pressed states come from the accent ramp — one step
past base (`--color-accent-600` on this light ground), or a `color-mix()` tint for outlined and
ghost variants. Keyboard focus is
`:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }`. Disabled
controls drop to 45% opacity. `::selection` is an accent tint. All of this is already in
`styles.css`; don't restyle per component.

### Icons

Lucide (https://lucide.dev) at **stroke-width 1.5**. Thicker strokes break the technical
register. The prototype inlines one mark in the header; use the real icon set in the build.

---

## Application shell

Three stacked rows, full viewport height, `overflow: hidden` on the body:

1. **Header** — 56px, `--color-surface`, 1px bottom divider, 20px horizontal padding, flex row
   with 16px gap. Contains: 20px Lucide-style glyph in accent; "RHAMS" wordmark; a tagline
   separated by a left divider and 10px padding; then right-aligned `v2.4.0`
   (`.tag .tag-outline`) and a run-status tag (`.tag .tag-accent`).
2. **Run meta strip** — 38px, 1px bottom divider, `overflow: hidden`. A row of key/value pairs,
   each with a 22px right padding + 22px right margin and a right divider. Keys are the 10px
   uppercase heading style, values are `.num`. Content: Project `RF-2609-114`; DUT
   `Transponder A2`; Chamber `Bay 3 — semi-anechoic`; Probe cal `valid to 12 Mar 2027`;
   Operator `K. Almeida`.
3. **Body** — `grid-template-columns: 224px minmax(0,1fr) 348px`, `min-height: 0`.
   The `minmax(0,1fr)` on the centre column is load-bearing: with a plain `1fr` the analysis
   table forces horizontal overflow.

### Left rail — workflow nav (224px)

Vertical flex, 1px gap, 14px/10px padding, right divider, `overflow-y: auto`.
A `.k` "Workflow" label, then six buttons. Each button: full width, left-aligned, transparent,
9px/10px padding, 14px text, 10px gap, `position: relative`. A zero-padding two-digit index
(`01`–`06`, 11px, text at 45%) sits left of the label.

The **active** item renders an absolutely-positioned overlay spanning the button:
`background: color-mix(in srgb, var(--color-accent) 14%, transparent)` with
`border-left: 2px solid var(--color-accent)`. Label and index sit above it via
`position: relative`.

Pinned to the bottom (`margin-top: auto`), above a 1px top divider: "Local store: 48 KB" and
"Last write 16:42" at 11px, text 55%, line-height 1.5.

### Centre stage

Flex, `align-items: flex-start`, `justify-content: center`, 20px padding, `overflow: auto`,
`min-width: 0`. Holds a fixed-size figure per screen (see below) and scrolls rather than
squeezing when the viewport is narrower than the design width.

### Right panel (348px)

Left divider, 18px padding, vertical flex, 16px gap, `overflow-y: auto`, `min-height: 0`.
Always opens with: a `.k` "Step N of 6" label, the screen title as `h4`, and a 13px blurb at
text-65%, line-height 1.5. Below that, per-screen controls (each block separated by a
1px bottom divider and 16px bottom padding), then per-screen lists.

---

## Screens

### 01 — Path planning

**Purpose:** confirm the traverse the probe will follow around the DUT.
**Title:** "Robot waypoint review."
**Blurb:** "Confirm the traverse the robot will follow around the device under test."

Centre: the floor plan (below), all ten waypoints hollow, no readings.

Right panel controls:
- `.field` with label "Waypoints", `.input.num` `type=number` `min=10 max=25 value=10`, capped at
  120px wide.
- Helper text, 11px, text-55%: "Minimum 10, maximum 25. Click the plan to add a point."
- Two buttons in a flex row, 8px gap, `flex: 1` each: `.btn.btn-primary` "Regenerate path" and
  `.btn.btn-secondary` "Edit again".

Right panel list: `.k` "Waypoints", then ten rows — index (20px, text-50%), coordinates
(`x.x, y.y`, 12px `.num`), and the segment distance from the previous waypoint in metres
(first row `0.0`).

### 02 — Measurement points

**Purpose:** select which waypoints the probe stops at to record a reading.
**Title / blurb:** "Measurement points" / "Select which waypoints the probe stops at and records a reading."

Centre: the floor plan with the five measured waypoints filled, no reading values shown.

Right panel: the ten-row list, `.k` "Waypoints", value column reading `measure` or `transit`;
measured rows carry the selected tint. Plus a 12px text-55% summary: "5 of 10 waypoints flagged
for measurement. The robot passes through the remaining 5 without stopping."

### 03 — Signal survey

**Purpose:** capture along the confirmed path at the configured probe settings.
**Title / blurb:** "Signal strength survey" / "Live capture along the confirmed path at the configured probe settings."

Centre: the floor plan with magnitude rings and reading values (below).

Right panel controls — **all disabled**, because they record the configuration a completed run
used rather than offering live edits:
- Select "Antenna height": `1.8 m`, `0.5 m`.
- Select "Probe type": `Probe B — 300 MHz to 30 GHz`, `Probe A — 30 MHz to 300 MHz`.
- Two-column grid, 8px gap: number "Start (MHz)" `300`; number "End (MHz)" placeholder `optional`.
- `.btn.btn-primary.btn-block` "Replay survey" (enabled).

Right panel list: `.k` "Readings" — measured rows show `N.NN V/m` coloured by pass/fail;
unmeasured rows read `not measured` at text-55%.

### 04 — Survey history

**Purpose:** previously completed runs stored on this workstation.
**Title / blurb:** "Survey history" / "Previously completed runs stored on this workstation."

Centre: the floor plan, same treatment as the survey screen.

Right panel: `.k` "Saved surveys", then one `.blueprint` card per run (10px/12px padding,
vertical flex, 4px gap):
- Row one, space-between: date-time in 15px heading font; point count in `.num` at text-55%.
- Row two: config line, 12px `.num`, text-55%.
- Row three: `Avg` and `Peak` in a 14px-gap `.num` flex row.

Records: `1 Sep 2026, 16:42` / 10 pts / `1.8 m · Probe B` / Avg 5.11 V/m / Peak 8.00 V/m, and
`1 Sep 2026, 16:40` / 10 pts / `1.8 m · Probe B` / Avg 5.52 V/m / Peak 9.20 V/m.

Below: `.btn.btn-secondary.btn-block` "Clear all history".

### 05 — Analysis

**Purpose:** compare recorded field strength against the applicable exposure limit.
**Title / blurb:** "Analysis" / "Compare recorded field strength against the applicable exposure limit."

Centre, 660px wide column, vertical flex, 20px gap:
1. A `.blueprint` figure (16px/18px padding) with `.k` caption "Field strength by measurement
   point — V/m" and the bar chart (below).
2. A `.k` "Readings" label over a `.table`.

**The readings table.** Columns, in this order: `Point`, `Result`, `X` / `m`, `Y` / `m`,
`E-field` / `V/m`, `Power` / `W/m²`. Units sit on a second line inside each `th` — a
`display: block`, 10px, weight 400, 60%-opacity child, no text-transform or letter-spacing.
Cells use 4px horizontal padding with the first cell flush left and the last flush right;
`th` is `vertical-align: bottom`.

Two things here are deliberate and were arrived at by fixing real defects:
- **`Result` is the second column, not the last.** Placed last it was the column that got
  clipped when the table overflowed — the verdict must never be the thing that disappears.
- Units on a second line, and the shortened `Power` header, are what bring the table's minimum
  width inside the centre column. Don't restore long single-line headers.

Result cell renders `.tag.tag-accent` "Pass", or "Exceed" styled with
`color/border: var(--color-danger)` on a `color-mix(in srgb, var(--color-danger) 12%, transparent)`
fill. **All three views — chart bars, plan markers, and this tag — must agree on pass/fail
colour.**

Right panel controls:
- Select "Survey record": `1 Sep 2026, 16:42 — 10 pts`, `1 Sep 2026, 16:40 — 10 pts`.
- Select "Hazard category": `Custom (manual limit)`, `HERP — personnel`, `HERO — ordnance`,
  `HERF — fuel`. **Not yet wired** — selecting a standard category should populate the limit
  from that standard; the prototype only implements the custom path.
- Number "Pass / fail limit (V/m)", `step=0.5 min=0`, bound to the limit state.
- Two `flex: 1` buttons, 8px gap: `.btn.btn-secondary` "Export CSV" and "Copy chart" — both
  unimplemented in the prototype.

### 06 — Export / import

**Purpose:** move plans and survey records between workstations.
**Title / blurb:** "Export & import" / "Move plans and survey records between workstations."

Centre: a `.blueprint` panel, max-width 560px, 26px/28px padding. `.k` "Data management", `h3`
"Export & import", then 14px body copy at text-75%, max-width 46ch:

> Back up every waypoint plan and survey record held in this browser to a single JSON file, or
> restore a previously exported file when moving to another workstation.

Then `.k` "Currently stored" over a two-column `.table`: Current plan `present`; Confirmed plan
history `1 record`; Survey history `2 records`.

Then a two-column grid, 18px gap, 22px top margin. Each cell: a `.k` heading, 13px explanatory
copy at text-65%, and a `.btn.btn-block`:
- **Export** — "One JSON file containing everything above." → `.btn-primary` "Export all data".
- **Import** — "Replaces all data currently stored in this browser." → `.btn-secondary`
  "Import backup".

Both buttons carry `min-height: 44px` and `text-align: center`. This is required, not cosmetic:
the cells are independent grid tracks, so without a shared minimum the longer label wraps and
the two buttons render at different heights. 44px is also the minimum hit target.

Right panel:
- `.k` "Storage" over a two-column `.table`: Waypoint plans `6 KB`; Survey records `34 KB`;
  Probe configuration `2 KB`; Browser quota used `48 KB of 5 MB`.
- `.k` "Recent exports" over a list of filename/timestamp rows separated by 8%-opacity rules:
  `rhams-2026-09-01.json` `16:44`; `rhams-2026-08-28.json` `28 Aug`; `rhams-2026-08-14.json`
  `14 Aug`.
- A `.blueprint` block (12px padding) with a `.k` "Destructive" heading in `--color-danger`,
  12px copy at text-65% ("Clears every plan and survey record held in this browser. Export
  first — this cannot be undone."), and a `.btn.btn-secondary.btn-block` "Reset workspace"
  overridden to danger border and text. **Should be behind a confirmation dialog** — use
  `.dialog-backdrop` + `.dialog`; not built in the prototype.

---

## The two data visualisations

Both are SVG. Read the `renderVals()` method in `source/RHAMS.dc.html` for exact geometry.

### Why both SVGs are fixed-size

`width="784" height="764"` for the plan, `width="660" height="300"` for the chart — and the
centre column scrolls below that width. This is deliberate and was reached after a fluid
`width="100%"` version failed:

`font-size` inside SVG is in **user units**, so a fluid SVG scales its labels along with the
viewBox. At a narrow viewport the plan's labels rendered at roughly 4px. Compensating by dividing
font sizes by a measured scale factor worked but then invalidated every hand-tuned label offset.
Fixing the render size so user units ≈ device pixels solves both at once.

If you make these responsive in the real build, you must handle label sizing and label placement
explicitly — do not simply set `width: 100%`. Verify with `getBoundingClientRect()`, not
`getBBox()`: `getBBox()` returns user units and cannot see this class of bug.

### The floor plan

`viewBox="-40 -30 880 858"`, rendered 784×764 inside a `.blueprint` figure on `--color-surface`.
The negative origin is margin for the axis labels. 20 user units = 1 metre.

Layers, back to front:

1. **Grid** — lines every 100 units (5 m) across a 0–800 field, in `--color-divider`.
2. **Axis labels** — `0`–`40` in metres along the top and left edges, 15px, text at 72%.
3. **Field boundary** — an 800×800 rect at 35% ink.
4. **Range rings** — dashed circles (`2 6`) at 5, 10, and 15 m from the DUT centre, at 22% ink,
   plus a full-width crosshair through the centre at 18%. Distance labels (`5 m`, `10 m`, `15 m`)
   sit on the **east** axis, end-anchored. They were originally on the north axis and collided
   with waypoint 8, which sits due north of the DUT.
5. **DUT** — centred at (400,400): a 150×80 outline rect, an inner 58×60 rect at 45% ink, two
   perspective lines at 25%, an accent centre dot, a `DEVICE UNDER TEST` caption above in 15px
   condensed uppercase at 78% ink, and `20.0, 20.0 m` below at 14px / 72%.
6. **Path** — a closed dashed (`7 5`) accent polyline through all ten waypoints.
7. **Waypoint markers** — per waypoint (details below).

**Waypoint markers.** Three states:

- *Unmeasured* — a 6r circle, `--color-bg` fill, 45%-ink stroke at 1.5.
- *Measured, no reading shown* (screen 02) — a 6r circle filled with the reading colour.
- *Measured with a reading* (screens 03, 04) — as above plus a **magnitude ring** whose radius
  encodes field strength: `r = 12 + (value / 8.0) * 26`. In-limit rings take a 1-wide accent
  stroke on a 12% accent fill; over-limit rings take a 2-wide danger stroke on a 14% danger fill.
  This is the feature that makes hot points readable before you read any numeral.

**Label placement is radial, not vertical.** Both the waypoint number and the reading are placed
along the unit vector from the DUT to the waypoint, stacked outward: the number at `r + 16`, the
reading at `r + 38`, each with a small vertical bias by quadrant
(`+11` below, `-3` above, `+5` at the sides). A fixed vertical offset — the obvious approach —
collides with the DUT caption and with neighbouring markers where the traverse doubles back.
Keep the radial scheme.

### The bar chart

`viewBox="0 0 660 300"`, rendered at native size. Plot area x 56→640, y 28 (top) → 266 (baseline),
y-axis fixed 0–10.5 V/m.

- **Gridlines and ticks** at 0, 2.5, 5, 7.5, 10 — `--color-divider` rules across the plot with
  end-anchored 14px labels at x=46, text 72%.
- **Bars**, one per measured point, 64 wide, evenly distributed across the plot width. In-limit
  bars are `--color-accent`; over-limit are `--color-danger`. Each carries its value to 2dp
  centred 9px above the bar, and its point number centred at y=288 in 72% ink.
- **Limit line** — a 1.5-wide dashed (`6 4`) accent rule at the limit value, labelled
  `Limit N.NN V/m` in `--color-accent-700` at 14px, **start-anchored at x=60** (the left end).
  It is on the left because right-anchored it collided with the tallest bar's value label.
- **Baseline** at y=266, 35% ink.

Below the plan on screens 03/04 there is a legend caption: three 4r swatches (accent filled,
hollow outlined, danger filled) and the text "Ring radius scales with field strength. Red exceeds
the N.N V/m limit."

---

## State

Only two pieces of state exist in the prototype:

| State | Type | Default | Drives |
| --- | --- | --- | --- |
| `screen` | one of `path` `points` `survey` `history` `analysis` `export` | `path` | Which screen renders; nav active item; step number, title, blurb |
| `limit` | number (V/m) | `7.5` | Chart limit line + label, bar colours, plan marker colours, table Result column, legend caption |

`limit` is a single source of truth read by five separate views. Keep it that way — the whole
point is that changing the limit re-evaluates the plan, the chart, and the table together.

Note on the default: it is `7.5` rather than a rounder `10` so that two of the five readings
exceed and the pass/fail treatment is visible in the prototype. **Confirm the real default with
the client** before shipping; it should almost certainly come from the selected hazard category.

There is also a `cornerRadius` prop (`Square (on-system)` / `Soft — 2px` / `Rounded — 4px` /
`Pill`) driving a `data-radius` attribute on the root. This is an **evaluation control, not a
product feature.** Drop it and ship square corners.

Interactions in the prototype: clicking a nav item switches screen; editing the limit field
recomputes everything downstream. Every other button and select is presentational.

## Data model

Reverse-engineered from the prototype constants; treat as the shape the API should return.

```js
// Waypoints — ten [x, y] pairs in metres on a 0–40 m field.
WP = [[14.2,21.6],[15.8,25.4],[19.8,26.0],[23.4,25.0],[26.0,22.2],
      [25.8,18.3],[23.9,15.0],[20.2,14.0],[16.4,14.7],[14.2,17.9]]

// E-field readings, keyed by 1-based waypoint number. Sparse: only
// measurement stops appear. Points 2, 4, 6, 8, 10 are measured.
READ = { 2: 6.08, 4: 1.81, 6: 1.90, 8: 7.78, 10: 8.00 }   // V/m

// Power density, same keys.
PD   = { 2: 0.0981, 4: 0.0087, 6: 0.0096, 8: 0.1606, 10: 0.1698 }  // W/m²
```

The sparseness is the design: a run has more waypoints than readings, and the UI must render a
waypoint that has no reading. Don't model readings as a dense array parallel to waypoints.

Derived, not stored: segment distance between consecutive waypoints (path list), margin
(`limit − reading`), pass/fail (`reading <= limit`), avg and peak per run.

DUT position is hardcoded at the field centre (20.0, 20.0 m). If it can move, the plan's rings,
crosshair, caption, and all radial label placement key off it — parameterise it early.

## Assets

No image assets. The header glyph is an inline SVG placeholder standing in for a Lucide icon; the
real build should pull from the Lucide set at stroke-width 1.5. Barlow and Barlow Condensed are
Google Fonts.

## Content to confirm before shipping

Invented for the prototype and needing real values:

- The tagline "Radiated Hazard Assessment & Measurement Suite" — an expansion of the acronym, not
  supplied by the client.
- The entire run-meta strip: project number, DUT name, chamber, probe calibration date, operator.
- Version string `v2.4.0`, all storage sizes, and the recent-export filenames and timestamps.
- The `7.5 V/m` default limit (see State).
- The hazard category list (HERP / HERO / HERF are real RF safety categories, but the specific
  option set and their limit values were not specified).
- "Import backup" was shortened from "Choose backup file…" to fit the button pair.

## Design system

The visual system is **Industry**: steel-on-light technical wireframe, Barlow Condensed over
Barlow, modular grid, blueprint-framed objects with corner registration marks, duotoned imagery,
thin-stroke icons.

`styles.css` is the complete system stylesheet — token block plus component layer — and is the
only stylesheet the design needs. One project-specific change was made to it: the accent was
repointed from the system's default steel `#5980a6` to `#4f80d9`, with the full 100–900 ramp
regenerated in OKLCH on the same lightness scale, and a `--color-danger` token was added for
pass/fail work. Both changes are in the token block at the top.
