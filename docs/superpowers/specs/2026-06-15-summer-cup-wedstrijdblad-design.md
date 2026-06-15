# 6 Reds SummER Cup — Wedstrijdblad (printable match sheet)

**Date:** 2026-06-15
**Status:** Approved (design)

## Goal

Provide a printable, landscape-A4 web page that lists the registered players
for a single play day, with a blank round-robin matrix so the organiser can
note the frame results by hand during the play day.

Reachable at `/6-reds-summer-cup/wedstrijdblad/<DD-MM-YYYY>`, e.g.
`/6-reds-summer-cup/wedstrijdblad/17-06-2026`.

This replaces the earlier idea of a server-generated PDF endpoint: a plain web
page printed via the browser ("Afdrukken" → landscape A4) avoids a PDF library,
which matters because the app runs on the Cloudflare Workers runtime.

## Sheet content

- **Title:** the play day `label`, e.g. `Toernooi 1 — woensdag 17 juni 2026`.
- **Player legend (left):** one row per registered player — `#` · blank `HC`
  (handicap start-score) box · player name. The HC box is empty; division /
  handicap is not stored, so it is written in by hand.
- **Results matrix (right):** an n×n grid (n = number of registered players),
  with column headers `1..n` and row headers `1..n`, the diagonal blacked out,
  empty hand-writable cells, and a blank `Totaal` column. Cells are sized
  generously for pen entry.
- Rows are sized to **exactly the registered players** (4–8), ordered by
  registration time (`createdAt`).
- **Empty state:** if there are no registrations for the day, show the title and
  a "Nog geen inschrijvingen." note instead of an empty grid.

## Visibility

Unlisted but public — no authentication, not linked from any nav. Player names
already appear publicly in the on-page results, so exposing the registered names
for a play day to anyone who knows the URL is acceptable. (Confirmed with user.)

## Architecture

### 1. Routing

The existing single-file page `app/pages/6-reds-summer-cup.vue` is moved to
`app/pages/6-reds-summer-cup/index.vue` so the `6-reds-summer-cup` namespace can
hold child routes. Both remain plain leaf routes (no `<NuxtPage>` nesting):

- `app/pages/6-reds-summer-cup/index.vue` → `/6-reds-summer-cup` (unchanged URL)
- `app/pages/6-reds-summer-cup/wedstrijdblad/[date].vue` →
  `/6-reds-summer-cup/wedstrijdblad/:date`

When moving `index.vue`, the scoped-style reference
`@reference "./../assets/css/main.css"` must become
`@reference "./../../assets/css/main.css"` (one level deeper). The `~/assets/...`
alias references and all in-page `/6-reds-summer-cup` links are unaffected.

### 2. Date ↔ play-day mapping (pure, in `shared/`)

Add helpers to `shared/summerCup/` (pure functions, unit-tested):

- `playDayFromDateParam(param: string): PlayDay | undefined` — parses a
  `DD-MM-YYYY` string, converts to the ISO `YYYY-MM-DD` id, and resolves it via
  the existing `getPlayDay`. Returns `undefined` for malformed input or an
  unknown play day.
- `dateParamFromPlayDayId(id: string): string` — inverse (`YYYY-MM-DD` →
  `DD-MM-YYYY`), useful for building links.

### 3. Data endpoint

`GET /api/6-reds-summer-cup/play-days/[id]/players` (id = ISO `YYYY-MM-DD`):

- Validates the id via `getPlayDay`; `404` if unknown.
- Reads `summer_cup_registrations` where `playDayId = id`, ordered by
  `createdAt`.
- Returns `{ playDayId, label, players: [{ name }] }`.

Follows the existing `server/api/6-reds-summer-cup/...` + drizzle/`hub:db`
pattern.

### 4. Page

`app/pages/6-reds-summer-cup/wedstrijdblad/[date].vue`:

- `definePageMeta({ layout: false })` — no nav/footer; the page renders its own
  white sheet.
- Reads the `date` route param, resolves it with `playDayFromDateParam`; on
  `undefined` throws `createError({ statusCode: 404 })`.
- Fetches players via `useFetch('/api/6-reds-summer-cup/play-days/<isoId>/players')`.
- Renders title, legend, and matrix as described above; container is
  `bg-white text-black` to override the site's dark sections.
- A small "Afdrukken" button calls `window.print()`; hidden in print with
  `print:hidden`.

### 5. Print CSS

```css
@media print {
  @page { size: A4 landscape; margin: 12mm; }
}
```

Apply `print-color-adjust: exact` (and `-webkit-print-color-adjust: exact`) to
the matrix so the blacked-out diagonal and cell borders actually print.

## Testing

- Vitest unit tests for `playDayFromDateParam` / `dateParamFromPlayDayId`
  (valid date, malformed input, unknown play day, round-trip), in the style of
  `test/summerCup-data.test.ts`.

## Out of scope

- No ranking/standings columns (Gew./Plaats) on the sheet.
- No pre-filled handicap values (HC column is blank).
- No authentication / access control.
- No PDF generation.
