# Graph Report - play-er-website  (2026-06-18)

## Corpus Check
- 106 files · ~136,305 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 751 nodes · 853 edges · 80 communities (64 shown, 16 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `809c79b8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Summer Cup Registration System|Summer Cup Registration System]]
- [[_COMMUNITY_Summer Cup API Endpoints|Summer Cup API Endpoints]]
- [[_COMMUNITY_Bookings API Endpoints|Bookings API Endpoints]]
- [[_COMMUNITY_Summer Cup Results Logic|Summer Cup Results Logic]]
- [[_COMMUNITY_Summer Cup UI Components|Summer Cup UI Components]]
- [[_COMMUNITY_Dev Dependencies Config|Dev Dependencies Config]]
- [[_COMMUNITY_Project Dependencies|Project Dependencies]]
- [[_COMMUNITY_Nuxt UI Component Library|Nuxt UI Component Library]]
- [[_COMMUNITY_Package Configuration|Package Configuration]]
- [[_COMMUNITY_Billiards Game Types|Billiards Game Types]]
- [[_COMMUNITY_Web App Icons|Web App Icons]]
- [[_COMMUNITY_Play-ER Logo Assets|Play-ER Logo Assets]]
- [[_COMMUNITY_Brevo Email Integration|Brevo Email Integration]]
- [[_COMMUNITY_Tournament Page|Tournament Page]]
- [[_COMMUNITY_Play-ER Venue Assets|Play-ER Venue Assets]]
- [[_COMMUNITY_Table Football Game|Table Football Game]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Play-ER Dark Logo|Play-ER Dark Logo]]
- [[_COMMUNITY_Play-ER Light Logo|Play-ER Light Logo]]
- [[_COMMUNITY_TypeScript References|TypeScript References]]
- [[_COMMUNITY_Date Route Page|Date Route Page]]
- [[_COMMUNITY_Bingo Game Image|Bingo Game Image]]
- [[_COMMUNITY_Golf Billiards Image|Golf Billiards Image]]
- [[_COMMUNITY_Facebook Social Icon|Facebook Social Icon]]
- [[_COMMUNITY_Instagram Social Icon|Instagram Social Icon]]
- [[_COMMUNITY_PNPM Workspace Config|PNPM Workspace Config]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]

## God Nodes (most connected - your core abstractions)
1. `6 Reds SummER Cup 2026 Registration Implementation Plan` - 26 edges
2. `Components` - 17 edges
3. `6 Reds SummER Cup 2026 — Implementation Plan` - 17 edges
4. `Nuxt UI Skill` - 16 edges
5. `6 Reds SummER Cup 2026 — registration page` - 13 edges
6. `Conventions` - 12 edges
7. `Summer Cup Results & Ranking Implementation Plan` - 12 edges
8. `Summer Cup — uitschrijflink in de bevestigingsmail` - 12 edges
9. `app/pages/6-reds-summer-cup/index.vue` - 12 edges
10. `/graphify` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Darts Game Image PNG` --conceptually_related_to--> `6 Reds SummER Cup Registration Page Design`  [INFERRED]
  public/images/games/darts.png → docs/superpowers/specs/2026-06-11-6-reds-summer-cup-design.md
- `Play-ER Store Front Photo` --conceptually_related_to--> `6 Reds SummER Cup Registration Page Design`  [INFERRED]
  public/images/play-er-store-front.jpg → docs/superpowers/specs/2026-06-11-6-reds-summer-cup-design.md
- `6 Reds SummER Cup Logo Dark SVG` --references--> `6 Reds SummER Cup Registration Page Design`  [INFERRED]
  public/images/6-reds-summer-cup-logo-dark.svg → docs/superpowers/specs/2026-06-11-6-reds-summer-cup-design.md
- `6 Reds SummER Cup Logo SVG` --references--> `6 Reds SummER Cup Registration Page Design`  [INFERRED]
  public/images/6-reds-summer-cup-logo.svg → docs/superpowers/specs/2026-06-11-6-reds-summer-cup-design.md
- `6 Reds SummER Cup 2026 Registration Implementation Plan` --references--> `server/api/6-reds-summer-cup/registrations/[id]/qr.png.get.ts`  [EXTRACTED]
  docs/superpowers/plans/2026-06-11-6-reds-summer-cup.md → server/api/6-reds-summer-cup/registrations/[id]/qr.png.get.ts

## Import Cycles
- None detected.

## Communities (80 total, 16 thin omitted)

### Community 0 - "Summer Cup Registration System"
Cohesion: 0.06
Nodes (52): app/components/SummerCupRegistration.vue, app/components/SummerCupResultsGrid.vue, app/components/SummerCupStandings.vue, app/components/SummerCupRegistration.vue, Brevo Transactional Email API, Cloudflare D1 / NuxtHub DB, EPC069-12 SEPA Credit Transfer QR Standard, Nuxt 4 Framework (+44 more)

### Community 1 - "Summer Cup API Endpoints"
Cohesion: 0.11
Nodes (24): bodySchema, denyMessages, finaleDay, getPlayDay(), payment, PlayDay, playDays, summerCupRegistrations (+16 more)

### Community 2 - "Bookings API Endpoints"
Cohesion: 0.07
Nodes (23): bodySchema, paramsSchema, querySchema, durations, gameLocationDisplayNames, gameLocationEventTypeIdMapping, gameLocationPostfix, gameLocations (+15 more)

### Community 3 - "Summer Cup Results Logic"
Cohesion: 0.13
Nodes (24): Break, DayPlayer, Match, PlayDayResults, buildRows(), computeBreaksRanking(), computeDayBreaks(), PlayerBreaks (+16 more)

### Community 4 - "Summer Cup UI Components"
Cohesion: 0.18
Nodes (30): app/components/SummerCupBreaks.vue, app/components/SummerCupBreaksRanking.vue, app/components/SummerCupResultsGrid.vue, app/components/SummerCupStandings.vue, app/components/SummerCupWedstrijdbladSheet.vue, Best-3-Results Points Cap Rule, Break Interface (player, value), DayStanding Interface (+22 more)

### Community 5 - "Dev Dependencies Config"
Cohesion: 0.09
Nodes (23): devDependencies, drizzle-kit, @types/qrcode, vitest, wrangler, assets, binding, directory (+15 more)

### Community 6 - "Project Dependencies"
Cohesion: 0.05
Nodes (38): author, email, name, url, dependencies, date-fns, drizzle-orm, eslint (+30 more)

### Community 7 - "Nuxt UI Component Library"
Cohesion: 0.07
Nodes (29): Adding custom brand colors, Backgrounds, Black/white as primary, Borders, Breakpoints, Choosing colors for components, `class` prop, Color shade overrides (+21 more)

### Community 8 - "Package Configuration"
Cohesion: 0.08
Nodes (25): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+17 more)

### Community 9 - "Billiards Game Types"
Cohesion: 0.40
Nodes (6): Golf Billiards Game, Pool Billiards Game, Snooker Game, Photo depicting golf billiards balls and equipment on green felt table, Photo depicting pool billiards balls, rack and cue on blue felt table, Photo depicting snooker cue striking white ball toward colored balls on green felt table

### Community 10 - "Web App Icons"
Cohesion: 0.40
Nodes (5): Apple Touch Icon PNG, Favicon 96x96 PNG, Play-ER Favicon SVG, Web App Manifest Icon 192x192 PNG, Web App Manifest Icon 512x512 PNG

### Community 11 - "Play-ER Logo Assets"
Cohesion: 0.50
Nodes (4): Play-ER P Logo (Dark), Play-ER P Logo (Light), Play-ER Full Logo (Dark), Play-ER Full Logo (Light)

### Community 13 - "Tournament Page"
Cohesion: 0.50
Nodes (3): count, date, tournament

### Community 14 - "Play-ER Venue Assets"
Cohesion: 1.00
Nodes (3): Play-ER Venue — Beverlo, Belgium (snooker, darts), Google Maps screenshot showing Play-ER location in Beverlo, Belgium, Home banner photo showing snooker tables and dart boards at Play-ER venue

### Community 15 - "Table Football Game"
Cohesion: 1.00
Nodes (3): Table Football (Tafelvoetbal) Game, Photo depicting players playing foosball on a Jupiter branded table football table, Photo depicting close-up of foosball table with red and white player figurines

### Community 42 - "Community 42"
Cohesion: 0.09
Nodes (22): Auto-registered modules, Color mode, Composables, Content module integration, Conventions, Custom locale from scratch, Default icon overrides, defineShortcuts (+14 more)

### Community 43 - "Community 43"
Cohesion: 0.11
Nodes (18): Basic pattern, Checkbox, Common field patterns, Date, Field layout patterns, File upload, Form in a modal, Forms (+10 more)

### Community 44 - "Community 44"
Cohesion: 0.11
Nodes (17): 6 Reds SummER Cup 2026 — Implementation Plan, Conventions for this plan, File structure, Self-review notes (author), Task 10: Registration endpoint (`registrations.post.ts`), Task 11: Registration component (`SummerCupRegistration.vue`), Task 12: Tournament page (`6-reds-summer-cup.vue`), Task 13: End-to-end verification (with a real Brevo key) (+9 more)

### Community 45 - "Community 45"
Cohesion: 0.11
Nodes (17): Blog & Changelog, Chat (AI), Color Mode, Components, Content (Nuxt Content), Dashboard, Data, Editor (+9 more)

### Community 46 - "Community 46"
Cohesion: 0.12
Nodes (16): Common mistakes, Component tree, Dashboard Layout, DashboardGroup, DashboardNavbar / DashboardToolbar, DashboardPanel, DashboardSidebar, Key components (+8 more)

### Community 47 - "Community 47"
Cohesion: 0.13
Nodes (14): 1. Page & routing, 2. Content — explanation & rules, 3. Registration form & flow, 4. EPC (SEPA) QR code, 5. Data model & capacity, 6. API endpoints (`server/api/6-reds-summer-cup/`), 6 Reds SummER Cup 2026 — registration page, 7. Brevo confirmation email (+6 more)

### Community 48 - "Community 48"
Cohesion: 0.14
Nodes (13): Component Selection, Feedback, Inputs, Layout containers, Markdown, Navigation, Overlays, Rules (+5 more)

### Community 49 - "Community 49"
Cohesion: 0.14
Nodes (13): Chat in a modal, Chat Layout, Component tree, Conversation sidebar, Dark mode for syntax highlighting, Full page chat, Install dependencies, Key components (+5 more)

### Community 50 - "Community 50"
Cohesion: 0.15
Nodes (12): File Structure, Self-Review, Summer Cup Results & Ranking Implementation Plan, Task 1: Results data model + 2026-06-17 data, Task 2: `resolveMatch` — frame counts and match winner, Task 3: `buildResultsGrid` — derived cross-table matrix, Task 4: `computeDayStandings` — ordering + points, Task 5: `computeSummerRanking` — overall aggregation (+4 more)

### Community 51 - "Community 51"
Cohesion: 0.15
Nodes (12): 2026-06-17 data, 6 Reds SummER Cup — results & ranking, Components, Computation — same module, pure & unit-tested, Data model — `shared/summerCup/results.ts`, Documented rules (source of truth — already on the page), Expected 2026-06-17 standings (test fixtures), Goal (+4 more)

### Community 52 - "Community 52"
Cohesion: 0.15
Nodes (12): 1. Routing, 2. Date ↔ play-day mapping (pure, in `shared/`), 3. Data endpoint, 4. Page, 5. Print CSS, 6 Reds SummER Cup — Wedstrijdblad (printable match sheet), Architecture, Goal (+4 more)

### Community 53 - "Community 53"
Cohesion: 0.15
Nodes (12): Cancel API endpoints, Data model, Deadline — until the play day starts, Delete strategy — hard delete, Email (`shared/summerCup/email.ts`), Error handling summary, Page (`app/pages/6-reds-summer-cup/uitschrijven/[token].vue`), Problem (+4 more)

### Community 54 - "Community 54"
Cohesion: 0.17
Nodes (11): File Structure, Self-Review notes, Summer Cup Uitschrijflink Implementation Plan, Task 1: `isPlayDayPast` deadline helper, Task 2: Email — shared shell, cancel link, cancellation email, Task 3: Schema column + migration, Task 4: Registration endpoint — generate token + cancel URL, Task 5: Cancel GET endpoint (summary) (+3 more)

### Community 55 - "Community 55"
Cohesion: 0.17
Nodes (11): 1. Data model, 2. Pure logic — `shared/summerCup/breaks.ts`, 3. Per-day breaks display — `app/components/SummerCupBreaks.vue`, 4. Tournament breaks ranking — `app/components/SummerCupBreaksRanking.vue`, 5. Wedstrijdblad breaks table, 6 Reds SummER Cup — Breaks (30+) recording & display, Architecture, Decisions (from brainstorming) (+3 more)

### Community 56 - "Community 56"
Cohesion: 0.17
Nodes (11): 1. Gedeelde component, 2. Gedeelde helper, 3. Pagina — ingevuld blad (refactor), 4. Pagina — leeg blad (nieuw), 6 Reds SummER Cup — Leeg wedstrijdblad (printable blank match sheet), Aanpak, Achtergrond (huidige situatie), Architectuur (+3 more)

### Community 57 - "Community 57"
Cohesion: 0.18
Nodes (10): Alternating feature sections, App shell, Blog listing, Changelog, Common mistakes, Key components, Landing page, Landing Page Layout (+2 more)

### Community 58 - "Community 58"
Cohesion: 0.18
Nodes (10): File Structure, Self-Review, SummER Cup Breaks (30+) Implementation Plan, Task 1: Data model + sample break data, Task 2: Pure break logic (TDD), Task 3: Per-day breaks component, Task 4: Tournament breaks ranking component, Task 5: Wire breaks into the results page (+2 more)

### Community 59 - "Community 59"
Cohesion: 0.18
Nodes (10): 6 Reds SummER Cup — 19/06 play day + best result per tournament, Data — new `2026-06-19` entry in `shared/data/summerCupResults.ts`, Expected 2026-06-19 day standings (test fixture), Expected Summer Ranking (test fixture), Goal, Logic — `computeSummerRanking` in `shared/summerCup/standings.ts`, Out of scope (unchanged), Rules applied (+2 more)

### Community 60 - "Community 60"
Cohesion: 0.18
Nodes (10): 17/06 (5 players, 2 frames) — redone as a 2-frame example, 19/06 (8 players, 1 frame) — migrate representation only, 6 Reds SummER Cup — frames-won match results, Data changes, Data model — `shared/data/summerCupResults.ts`, Goal, Out of scope, `resolveMatch` — `shared/summerCup/standings.ts` (+2 more)

### Community 61 - "Community 61"
Cohesion: 0.20
Nodes (9): App shell, Common mistakes, Component tree, Docs Layout, How nesting works, Key components, Layout, Page (+1 more)

### Community 62 - "Community 62"
Cohesion: 0.20
Nodes (9): Core rules (always apply), How to use this skill, Installation, MCP Server, Nuxt, Nuxt UI, Reference files, Routing table (+1 more)

### Community 63 - "Community 63"
Cohesion: 0.22
Nodes (8): Basic editor, Component tree, Content types, Editor Layout, Key components, Toolbar modes, When to use, With document sidebar

### Community 64 - "Community 64"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 65 - "Community 65"
Cohesion: 0.22
Nodes (8): Breaks, Interface / UI, Problem, Regulation text (`index.vue`), Scoring rule (`computeSummerRanking`), Summer Cup — best-3-results points cap, Testing (TDD), Worked totals (current test data)

### Community 66 - "Community 66"
Cohesion: 0.25
Nodes (7): Basic table, Data Tables, Tips, With async data (Nuxt), With pagination, With row selection, With search and filters (dashboard)

### Community 67 - "Community 67"
Cohesion: 0.29
Nodes (6): Auth Forms, Custom auth layout, Tips, UAuthForm key props, UAuthForm key slots, UAuthForm (recommended)

### Community 68 - "Community 68"
Cohesion: 0.29
Nodes (6): Command palette, Confirmation dialog, Drawer (bottom sheet), Form in a slideover, Overlays, Programmatic confirmation (useOverlay)

### Community 69 - "Community 69"
Cohesion: 0.33
Nodes (5): Breadcrumbs, Header with mobile menu, Navigation, Sidebar navigation (dashboard), Tab navigation (within a page)

### Community 70 - "Community 70"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 71 - "Community 71"
Cohesion: 0.40
Nodes (4): Development Server, Play-ER, Production, Setup

### Community 72 - "Community 72"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 73 - "Community 73"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 74 - "Community 74"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

## Knowledge Gaps
- **440 isolated node(s):** `names`, `count`, `tournament`, `date`, `name` (+435 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `summerCupRegistrations` connect `Summer Cup API Endpoints` to `Bookings API Endpoints`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `names`, `count`, `tournament` to the rest of the system?**
  _440 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Summer Cup Registration System` be split into smaller, more focused modules?**
  _Cohesion score 0.06219426974143955 - nodes in this community are weakly interconnected._
- **Should `Summer Cup API Endpoints` be split into smaller, more focused modules?**
  _Cohesion score 0.10512820512820513 - nodes in this community are weakly interconnected._
- **Should `Bookings API Endpoints` be split into smaller, more focused modules?**
  _Cohesion score 0.07226890756302522 - nodes in this community are weakly interconnected._
- **Should `Summer Cup Results Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.12903225806451613 - nodes in this community are weakly interconnected._
- **Should `Dev Dependencies Config` be split into smaller, more focused modules?**
  _Cohesion score 0.09057971014492754 - nodes in this community are weakly interconnected._