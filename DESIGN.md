# Design

Source of truth for tokens: `src/index.css` (`@theme`). This file explains intent.

Style: **accent ladder** (taste-skill app sheet, seed 1786331364, kind `smb-admin`). The direction sheet is saved in `.taste-skill/app/direction.json`; reprint it with `node <taste-skill>/scripts/draw.mjs --show`.

## Visual Theme

Light, flat and quiet. One brand hue, raspberry, appears at full strength only on small marks: the primary button, the active nav icon and the main data series. Its pale tints do all the area work: the active nav row, the in-progress pill, progress tracks and the load cells of the week grid. Surfaces are separated by 1px borders and never by shadows. Only floating things (menus, popovers, dialogs, toasts) cast a shadow.

The app has a face of its own:
- **Tinted ground.** The page ground leans one step toward raspberry's palest tint (`#fbf7f8`), so the page and the tints read as one family.
- **The workspace is named.** "Raman Provisions, Kochi" appears in the top bar, and the business name is the admin dashboard's title.
- **Signature element.** The "Next 7 days by person" grid on the admin dashboard: people down the left, today onward across, tasks due in each cell, the overdue column in red, and a whole-team totals row that always matches the KPI strip.

## Color

| Token | Use |
|---|---|
| `canvas` `#fbf7f8` | Page ground, sidebar and top bar (one ground, divided by 1px rules) |
| `surface` `#ffffff` | Panels, inputs, popovers |
| `sunken` `#f3f4f6` | Hover fills, neutral pills, weekend columns, loading bars |
| `line` `#e5e7eb` / `rule` `#f2f2f2` | Panel edges / row rules inside panels |
| `line-strong` `#d1d5db` | Secondary-button edges |
| `control` `#848993` | Form control edges. Kept at ≥ 3:1 for WCAG 1.4.11 (the sheet's `#d1d5db` is 1.5:1) |
| `ink` / `ink-muted` / `ink-subtle` | Text tiers: 16.7 / 5.4 / 4.6 :1 on the ground |
| `brand-50…800` | 50/100 tints for areas, 600 `#b8336a` for small marks, 800 as text on tints |
| `success` / `warning` / `danger` | Status only. `-soft` pill fill, `-ink` text, `-solid` marks. Danger ink `#c4242a` is the one red |

Rules:
- Color goes on data and status. The chrome stays neutral apart from the active nav row's tint.
- **One red mark per object.** An overdue task shows its due date in red; its status pill stays its own state (To do / In progress / Done).
- Task status: To do is neutral, In progress is the brand tint, Done is green. Overdue is derived and shown on the due date.
- Priority: only "High" gets a pill (pale amber); Medium and Low are plain grey text.
- **Delta colors say good or bad.** Fewer completions is red; a change that is neither good nor bad (tasks created) stays grey.
- **Charts:** the main series is raspberry. The outcome chart uses validated status colors (green on time, amber late, red not done), with a legend, tooltips and a table view.

## Typography

One family: **DM Sans** (Google Fonts, 400/500/600/700), dealt by the style. Tabular figures on every number in tables, KPIs and anything that updates.

- 32px / 700: page title (24px on phones); the one h1 per screen
- 24px / 600: KPI values
- 16px / 600: panel and section headings
- 14px: body, labels, table cells, nav
- 12px: captions, table headers, meta

Sentence case throughout; no tracked capitals.

## Spacing & Shape

- Corner radius: 8px for cards and panels, 6px for controls, full rounding for pills and avatars. Nothing at 12px or more.
- One 24px gap between blocks, horizontally and vertically.
- Controls: 40px with a mouse, 44px on touch screens (`pointer-coarse:`), 36px in the top bar.

## Layout

**Shell: ruled T-frame.** A 230px sidebar and a 64px top bar on the page ground, divided by 1px rules.
- The top bar holds task search (Enter opens the filtered task list), the bell, the workspace name behind a full-height divider, and the account menu.
- The sidebar holds the product mark and the nav on a 40px pitch; the active row takes the brand tint.

**Width bands:**
- **Under 768px:** 56px top bar with a menu button that opens a drawer (the drawer includes search). Tables become two-line lists.
- **768–1023px:** 72px icon rail with tooltips.
- **1024px and up:** 230px labelled sidebar.

**Screens:**
- **Admin overview:** title row (business name, date and the day's finding, primary action), then a `1fr 340px` grid. Main column: KPI strip, the next-7-days grid, Needs attention. Rail: Recent activity and On leave, with headings outside their cards.
- **Staff home:** greeting title and a plain summary line. Overdue, Due today and Coming up sections, plus a rail with This week and Latest updates.
- **Reports:** KPI strip, the completed-over-time chart (daily up to 30 days, weekly for 90), then two charts of equal height, then the team table.

## Components (`src/components/ui`)

| Component | Notes |
|---|---|
| Button | primary (brand fill) / secondary / ghost / danger; sm 36, md 40 (44 on touch); `loading`, `icon`, `to` |
| IconButton | 44px, `label` required |
| Input / Select / Textarea / Checkbox | Label above, hint below, inline error; native select |
| KpiStrip | One container split by 1px dividers, label over value, no icons; `alert`, `delta`, `to`; 2-up on phones |
| Badge, StatusBadge, PriorityBadge, PriorityText, EmployeeStatusBadge | Pale tint with dark text of the same hue |
| Avatar | Initials on a pale per-person tint; decorative unless given a `label` |
| Panel | 1px border, no shadow; optional header |
| RailSection (`layout/`) | Rail block with its heading outside the card |
| Table | 12px grey sentence-case headers, no header band, faint row rules, sortable headers with `aria-sort` |
| Tabs / SegmentedControl | Underline tabs on a full-width rule; segmented track for ranges |
| Popover / Menu / Dialog / Drawer | The only things that cast shadows |
| Skeleton | Flat grey bars at the final size; no pulse or shimmer |
| EmptyState | Plain grey icon, title, next step; `page` makes the title the screen's h1 (404, no access) |
| Toast | Polite live region; optional action (Undo); pauses on hover and focus |

Accessibility conventions (unchanged): every page sets its tab title; navigation moves focus to `<main>`; tabs link to their panels; menus focus their first item; 44px touch targets; no em dashes in copy.

## Motion

- 150–200ms ease-out, for state changes only: hover, the popover and toast entrances, the drawer slide, the dialog fade.
- Nothing performs an entrance on page load. `prefers-reduced-motion` turns all motion off.

## Development aids

- `?demo=admin` or `?demo=staff` on any URL signs in as that demo account. This works only under `npm run dev` (`import.meta.env.DEV`), and the screenshot tools use it.
- Design checks:
  - `node <taste-skill>/scripts/lint.mjs --app src`
  - `node <taste-skill>/scripts/inspect.mjs --app "http://localhost:5180/dashboard?demo=admin"`
  - Screenshots go to `.taste-skill/`, which is git-ignored.
