# Graph Report - D:\steffbeckers\play-er-website  (2026-06-18)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 314 nodes · 455 edges · 42 communities (31 shown, 11 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3bb3861d`
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

## God Nodes (most connected - your core abstractions)
1. `6 Reds SummER Cup 2026 Registration Implementation Plan` - 27 edges
2. `Nuxt UI Skill` - 16 edges
3. `6 Reds SummER Cup Registration Page Design` - 12 edges
4. `app/pages/6-reds-summer-cup/index.vue` - 12 edges
5. `Summer Cup Results and Ranking Implementation Plan` - 11 edges
6. `getPlayDay()` - 10 edges
7. `SummER Cup Breaks Recording and Display Design` - 10 edges
8. `shared/data/summerCupResults.ts` - 9 edges
9. `shared/data/summerCup.ts` - 9 edges
10. `DayPlayer` - 8 edges

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

## Communities (42 total, 11 thin omitted)

### Community 0 - "Summer Cup Registration System"
Cohesion: 0.11
Nodes (37): app/components/SummerCupRegistration.vue, app/components/SummerCupResultsGrid.vue, app/components/SummerCupStandings.vue, app/pages/6-reds-summer-cup.vue, app/components/SummerCupRegistration.vue, Brevo Transactional Email API, Cloudflare D1 / NuxtHub DB, EPC069-12 SEPA Credit Transfer QR Standard (+29 more)

### Community 1 - "Summer Cup API Endpoints"
Cohesion: 0.10
Nodes (21): bodySchema, denyMessages, finaleDay, getPlayDay(), payment, PlayDay, playDays, summerCupRegistrations (+13 more)

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
Cohesion: 0.09
Nodes (22): dependencies, date-fns, drizzle-orm, eslint, @internationalized/date, @libsql/client, nuxt, @nuxt/eslint (+14 more)

### Community 7 - "Nuxt UI Component Library"
Cohesion: 0.12
Nodes (17): Nuxt UI v4 Component Library, Tailwind CSS v4, Nuxt UI Auth Recipe, Nuxt UI Chat Layout Reference, Nuxt UI Component Selection Guidelines, Nuxt UI Components Reference, Nuxt UI Conventions Guidelines, Nuxt UI Dashboard Layout Reference (+9 more)

### Community 8 - "Package Configuration"
Cohesion: 0.12
Nodes (16): author, email, name, url, name, packageManager, private, scripts (+8 more)

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

## Knowledge Gaps
- **122 isolated node(s):** `names`, `count`, `tournament`, `date`, `name` (+117 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `bookings` connect `Bookings API Endpoints` to `Summer Cup API Endpoints`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `6 Reds SummER Cup 2026 Registration Implementation Plan` connect `Summer Cup Registration System` to `Nuxt UI Component Library`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `6 Reds SummER Cup Registration Page Design` (e.g. with `Darts Game Image PNG` and `Play-ER Store Front Photo`) actually correct?**
  _`6 Reds SummER Cup Registration Page Design` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `names`, `count`, `tournament` to the rest of the system?**
  _122 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Summer Cup Registration System` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `Summer Cup API Endpoints` be split into smaller, more focused modules?**
  _Cohesion score 0.10384068278805121 - nodes in this community are weakly interconnected._
- **Should `Bookings API Endpoints` be split into smaller, more focused modules?**
  _Cohesion score 0.0748663101604278 - nodes in this community are weakly interconnected._