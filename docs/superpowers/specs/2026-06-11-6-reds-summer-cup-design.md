# 6 Reds SummER Cup 2026 — registration page

**Date:** 2026-06-11
**Status:** Approved design, ready for implementation plan

## Goal

Add a new, standalone page to the Play-ER website for the first edition (2026) of the
"6 Reds SummER Cup". The page must:

1. Present the tournament explanation and rules in a clear, structured way.
2. Let participants register for a single play day, **as long as there is space**.
3. Send a confirmation email (via the Brevo API) to the participant, with
   `snooker@play-er.be` in BCC (this is how the organiser receives the registration).
4. Show payment details + an EPC (SEPA) QR code on the form and in the email.

Ranking/standings are explicitly **out of scope** (built later).

## Context (existing codebase)

- **Stack:** Nuxt 4, Nuxt UI 4, Tailwind 4, `@nuxtjs/seo`, `@nuxt/image`, `@nuxt/fonts`
  (Roboto). Dutch locale, `primary` = blue.
- **Hosting/DB:** Cloudflare (`cloudflare_module` preset) via NuxtHub; SQLite/D1 with
  Drizzle ORM. Schema in `server/db/schema.ts`, migrations in
  `server/db/migrations/sqlite/`.
- **Patterns to follow:**
  - Pages live in `app/pages/`. The site is currently a single `index.vue` with anchored
    sections (dark sectioned layout, white text, blue accent, uppercase `<h1>`).
  - Server routes use `defineEventHandler` + `readValidatedBody` with **valibot**
    (`server/api/bookings.post.ts`).
  - External HTTP calls use `$fetch` with bearer/api-key headers (`server/utils/cal.ts`).
  - Secrets via `runtimeConfig` placeholders + `NUXT_*` env vars (`nuxt.config.ts`,
    `.env` is gitignored).
  - Shared, non-secret data in `shared/data/` (e.g. `booking.ts`).
- **No Brevo integration exists yet** — it will be added.

## 1. Page & routing

- New page: `app/pages/6-reds-summer-cup.vue` → route `/6-reds-summer-cup`.
- **No** homepage or nav link (shared via direct link).
- SEO via `useSeoMeta` (Dutch title + description).
- Visual style matches the homepage (dark sectioned layout, white text, blue `primary`,
  uppercase headings), reusing the default layout (`AppFooter` included).
- **Hero is shorter than the homepage hero** (homepage hero is `h-[400px] md:h-[656px]`;
  use a clearly smaller height, e.g. `h-[220px] md:h-[320px]`).
- A clearly labelled "ranking — binnenkort" placeholder section is shown (no logic).

## 2. Content — explanation & rules

Reformatted from the source document (`6RSTPlayer.docx`) into clear sections using Nuxt UI
components (cards / table / accordion as appropriate):

- **Intro** — what the cup is, period (June–August 2026), members-only.
- **Kalender** — overview table: 4 tournaments × (Wed/Fri) + finale day, all at 18:30.
- **Inschrijvingen & plaatsen** — min 4 / max 8 per play day; max 16 unique players for the
  2026 edition; one play day per edition OR both if space (priority handled manually).
- **Inschrijvingsgeld** — €15 per play evening, bank transfer before start confirms the spot.
- **Wedstrijdformat** — 1 poule, round-robin; 2 frames at 4–5 players, 1 frame at >5.
- **Puntensysteem & ranking** — participation points + ranking points + top-2 bonus (with
  the 7-player example).
- **Rangschikking tijdens een speeldag** — tiebreaker order (frames → matches → head-to-head
  → black ball game BO3 → up-and-down over one cushion).
- **Finaledag** — top 8 of the Summer Ranking; format announced later.
- **(Gedrags)regels & handicap** — sportsmanship; >3 snookers ends a frame; division-based
  handicap (1st+ = 0, 2nd/3rd = 5, 4th/5th = 10, reserve determined beforehand).
- **Organisatie** — organiser may adjust planning/format; registering = agreeing to the rules.

All copy in Dutch, faithful to the source document.

## 3. Registration form & flow

"Inschrijven" section at the bottom of the page:

1. **Pick a play day** — list of the 8 play days with live availability ("nog X/8 plaatsen";
   full days disabled + "Volzet"). The finale day is **not** a registration option.
2. **Name + email** (members-only edition → no phone/division).
3. **Overzicht** — payment block (IBAN, beneficiary, amount €15, communication) + the EPC QR.
4. **Inschrijven** → on success, an on-page confirmation ("Je bent ingeschreven,
   bevestigingsmail verstuurd") with the same payment info + QR.

Availability is loaded via `useFetch('/api/6-reds-summer-cup/availability')` so full play
days are visible before filling the form. If the unique-16 edition cap is reached, new
emails are blocked with a clear message (existing participants can still add another day if
that day has space).

## 4. EPC (SEPA) QR code

- Generated **client-side** with the `qrcode` npm package as a base64 PNG.
- Payload per EPC069-12 (v2), scannable by banking apps:
  ```
  BCD
  002
  1
  SCT
  GKCCBEBB
  Beckers Steff
  BE30063766394611
  EUR15.00
  (empty: purpose)
  (empty: structured ref)
  6RSC <naam> - <speeldag>
  ```
  (`<speeldag>` = human label, e.g. "wo 17 juni 2026"; max 140 chars for remittance info.)
- The QR is shown on the form and sent as a base64 PNG to the registration API.
- **Email rendering caveat:** many mail clients (Gmail) block `data:` images inline. To show
  the QR reliably in the email, the server stores the PNG with the registration and serves it
  via `GET /api/6-reds-summer-cup/registrations/[id]/qr.png`; the email references that URL in
  an `<img>` **and** attaches the PNG as a fallback. The IBAN + communication are always
  present as text too.
- Server validates the received base64 (must be `image/png` data, under a sane size cap).

## 5. Data model & capacity

New Drizzle table `summer_cup_registrations`:

| column         | type                | notes                                  |
|----------------|---------------------|----------------------------------------|
| `id`           | integer PK autoinc  |                                        |
| `playDayId`    | text not null       | stable key, e.g. `"2026-06-17"`        |
| `name`         | text not null       |                                        |
| `email`        | text not null       | stored lowercased/trimmed              |
| `communication`| text not null       | the generated payment reference        |
| `qrCodeBase64` | text not null       | PNG base64 (no data: prefix)           |
| `createdAt`    | integer timestamp   |                                        |

- **Unique index on `(playDayId, email)`** — prevents double registration for the same day.

Server checks on `POST registrations`:
- play day exists in `shared/data/summerCup.ts` and is **not in the past**;
- `< 8` registrations for that play day;
- `<= 16` unique emails across the whole 2026 edition (an already-registered email does not
  add to the unique count);
- no duplicate for that same play day.

On violation → HTTP 409 with a clear Dutch reason. (Check-then-insert is acceptable for the
expected low concurrency; the unique index is the hard backstop for same-day duplicates.)

## 6. API endpoints (`server/api/6-reds-summer-cup/`)

- `GET availability` → per play day: `{ playDayId, registered, capacity, remaining, full }`
  plus `editionUniqueReached: boolean`.
- `POST registrations` → valibot validation (name, email, playDayId, qr base64) → capacity
  checks → insert → send Brevo email → return success (incl. the registration id).
- `GET registrations/[id]/qr.png` → serves the stored QR PNG (used by the email `<img>`).

## 7. Brevo confirmation email

New util `server/utils/brevo.ts` → `sendTransactionalEmail(...)` calling
`POST https://api.brevo.com/v3/smtp/email` with header `api-key: <NUXT_BREVO_API_KEY>`.

- **From:** `Snooker Play-ER <snooker@play-er.be>`
- **Reply-to:** `snooker@play-er.be`
- **To:** the form email
- **BCC:** `snooker@play-er.be` (organiser's receipt of the registration)
- **Subject:** `Bevestiging inschrijving 6 Reds SummER Cup 2026 – <speeldag>`
- **HTML body (Dutch):** confirmation with name, email, chosen play day (date + 18u30),
  registration fee, payment instructions (IBAN/beneficiary/amount/communication), the QR
  (inline `<img>` + attachment), and a note that paying before the play day confirms the spot.
- **Attachment:** `betaling-qr.png` (base64).

If the email send fails, the registration is still saved; the error is logged and the user
still sees a success confirmation with the payment details on-page (so a Brevo outage does
not lose a registration). _(To confirm during planning: acceptable, vs. surfacing a warning.)_

## 8. Config / secrets

- `nuxt.config.ts`: add `runtimeConfig.brevoApiKey: ""` → env `NUXT_BREVO_API_KEY`
  (added by the user to `.env` + production; not committed).
- Add `.env.example` documenting `NUXT_BREVO_API_KEY=`.
- `shared/data/summerCup.ts` holds non-secret data:
  - edition year (2026), capacity constants (`MAX_PER_PLAY_DAY = 8`,
    `MAX_UNIQUE_PLAYERS = 16`), registration fee (`15`);
  - the calendar: 4 tournaments each with a Wed + Fri play day (id + label + ISO date + time)
    and the finale day (non-registrable);
  - payment info: IBAN `BE30063766394611`, BIC `GKCCBEBB`, beneficiary `Beckers Steff`,
    amount `15`.

### Play days (registrable, 8 total)

| id           | label                              |
|--------------|------------------------------------|
| `2026-06-17` | Toernooi 1 — woensdag 17 juni 2026 |
| `2026-06-19` | Toernooi 1 — vrijdag 19 juni 2026  |
| `2026-07-01` | Toernooi 2 — woensdag 1 juli 2026  |
| `2026-07-03` | Toernooi 2 — vrijdag 3 juli 2026   |
| `2026-07-15` | Toernooi 3 — woensdag 15 juli 2026 |
| `2026-07-17` | Toernooi 3 — vrijdag 17 juli 2026  |
| `2026-07-29` | Toernooi 4 — woensdag 29 juli 2026 |
| `2026-07-31` | Toernooi 4 — vrijdag 31 juli 2026  |

Finale (non-registrable): `2026-08-14` — vrijdag 14 augustus 2026.

## 9. Out of scope (v1)

- Ranking / standings (built later) — only a "binnenkort" placeholder.
- Exact finale-day format.
- Online payment (stays bank transfer).
- Admin/management screen.
- "Priority for players who haven't played yet" — manual organiser decision.

## Testing

- Unit-test the capacity logic (per-day max 8, unique-email max 16, past-day guard,
  duplicate guard) against a seedable data set.
- Unit-test the EPC QR payload string builder (correct line order/content).
- Manual verification: register a play day → confirm DB row, on-page confirmation, and that
  the Brevo email arrives with QR + BCC (using a real/test Brevo key).
