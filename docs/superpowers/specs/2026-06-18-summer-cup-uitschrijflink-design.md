# Summer Cup — uitschrijflink in de bevestigingsmail

## Problem

The 6 Reds SummER Cup confirmation email gives a participant no way to cancel
their registration themselves. Spots are scarce (8 per play day, 16 unique
players per edition), so a participant who can no longer come should be able to
free their spot without mailing the organiser. We add a self-service cancel link
("uitschrijflink") to the confirmation email.

Cancelling means: the registration for **that one play day** is removed and the
spot is freed again. It is not an email opt-out.

## Security — why not the registration id

The registration `id` is a sequential integer (`autoIncrement`), so a link built
on it would be trivially guessable — anyone could cancel another participant's
spot. Instead each registration gets a random, unguessable `cancelToken`
(`crypto.randomUUID()`), and every cancel route works by token, never by id.

## Data model

Add one column to `summer_cup_registrations` (`server/db/schema.ts`):

- `cancelToken text NOT NULL` with a unique index — random UUID set at insert
  time (`crypto.randomUUID()` in the app on every insert).

Generate the migration with drizzle-kit so it matches the existing files in
`server/db/migrations/sqlite/`. **The edition is already running** (tournament 1
was 17 June 2026), so the table has live rows. Adding a `NOT NULL` column to a
populated SQLite table needs a value for those rows, and the unique index then
needs each to differ, so the migration must **backfill existing rows with
generated tokens** (e.g. `lower(hex(randomblob(16)))`) before/while creating the
unique index — a bare `NOT NULL UNIQUE` add would fail. Backfilled rows for
already-past play days are harmless: those days aren't cancellable anyway.

## Delete strategy — hard delete

On cancellation the row is **deleted**. This:

- frees the spot automatically (capacity in `shared/summerCup/capacity.ts`
  counts rows, so a removed row no longer fills a day or the 16-unique cap);
- cleanly allows re-registration (the `(playDayId, email)` unique index no
  longer blocks a participant who changed their mind);
- matches the existing rollback pattern in `registrations.post.ts`.

The cancellation email (BCC to `snooker@play-er.be`) is the record of what
happened. A soft-delete `canceledAt` was rejected: it would force a partial
unique index plus cancelled-row filtering in capacity and availability — more
risk than this small club tournament needs.

## Deadline — until the play day starts

Cancellation is allowed while the play day is **not past**, reusing the exact
rule registration already applies (`playDay.id >= todayKey`, ISO date compare in
`capacity.ts`). Date-level granularity, consistent with the existing `past`
check. Extract this into a small shared helper so the cancel routes and the
capacity check share one source of truth, e.g.:

```ts
// shared/summerCup/capacity.ts
export function isPlayDayPast(playDayId: string, now: Date): boolean {
  return playDayId < now.toISOString().slice(0, 10);
}
```

`checkRegistrationAllowed` uses it for its `past` reason; the cancel routes use
`!isPlayDayPast(...)` to decide whether cancelling is still allowed.

## Email (`shared/summerCup/email.ts`)

- Refactor the shared HTML chrome (the `<html>`/`<body>`/logo/card wrapper) into
  one helper, e.g. `renderEmailShell({ bodyHtml })`, so both emails stay
  visually identical without duplicating markup.
- `buildConfirmationEmail` gains a `cancelUrl: string` param and renders a cancel
  line in the footer, e.g.:
  > "Kan je toch niet komen? [Schrijf je hier uit](cancelUrl)."
  Keep it muted/secondary so it doesn't compete with the payment info.
- New `buildCancellationEmail({ name, playDayLabel, logoUrl })` →
  `{ subject, htmlContent }`, same style. Subject e.g.
  `Uitschrijving 6 Reds SummER Cup 2026 – <playDayLabel>`. Body confirms the
  participant is uitgeschreven for that play day, that the spot is freed, and how
  to re-register or contact the organiser.

## Registration flow (`server/api/.../registrations.post.ts`)

Within the existing insert → email → rollback-on-failure flow:

1. Generate `cancelToken = crypto.randomUUID()` and store it on the inserted row.
2. Build `cancelUrl = ${origin}/6-reds-summer-cup/uitschrijven/${cancelToken}`
   (origin from `getRequestURL(event)`, same as `qrImageUrl`).
3. Pass `cancelUrl` into `buildConfirmationEmail`.

No change to the rollback semantics: if the confirmation email fails to send, the
registration is still deleted as today.

## Cancel API endpoints

Two token routes under `server/api/6-reds-summer-cup/cancellations/[token]`:

- **`[token].get.ts`** — look up the registration by `cancelToken`. Returns a
  small summary for the page: `{ found, name, playDayLabel, cancellable }`,
  where `cancellable = !isPlayDayPast(playDayId, now)`. Never returns the
  email/QR or anything sensitive. Unknown token → `{ found: false }`.
- **`[token].post.ts`** — re-check the deadline server-side, then delete the row
  by token and send the cancellation email (to the participant, BCC
  `snooker@play-er.be`, replyTo `snooker@play-er.be`, sender "Snooker Play-ER"
  — same envelope as the confirmation mail). Responses:
  - deleted → `{ success: true }`;
  - token not found (already cancelled / invalid) → `{ success: true, alreadyGone: true }` (idempotent: a second submit or an email-scanner prefetch is harmless);
  - play day past → `409 { success: false, reason: "past" }`.
  If the cancellation email fails to send, the row stays deleted (spot freed);
  log the error and still return success — do **not** resurrect the registration.

## Page (`app/pages/6-reds-summer-cup/uitschrijven/[token].vue`)

Nuxt UI styling consistent with `SummerCupRegistration.vue`. On load it fetches
the GET endpoint and renders one of:

- **Confirm** (`found && cancellable`): show name + play day and a
  "Uitschrijving bevestigen" button → POST → success state.
- **Success**: `u-alert` "Je bent uitgeschreven", note that the spot is freed and
  a bevestigingsmail is sent, link back to the inschrijvingspagina.
- **Deadline passed** (`found && !cancellable`): explain the play day has
  started/passed and to contact `snooker@play-er.be`.
- **Not found** (`!found`, also the post-cancel reload state): friendly "Deze
  inschrijving bestaat niet (meer)."

## Error handling summary

| Situation | Behaviour |
|-----------|-----------|
| Unknown / already-used token | Friendly "bestaat niet (meer)"; POST is idempotent |
| Play day already started | 409 `past`; page explains, points to organiser |
| Double POST / scanner prefetch of POST | Idempotent (`alreadyGone`) — GET is read-only, only the button POSTs |
| Cancellation email fails | Row stays deleted (spot freed), error logged, success returned |

## Testing (TDD, `shared/` unit tests — the repo pattern)

- `summerCup-email.test.ts`: `buildConfirmationEmail` output contains the
  `cancelUrl`; `buildCancellationEmail` contains the name, the play day, and the
  logo, and a sensible subject.
- `summerCup-capacity.test.ts`: `isPlayDayPast` true for past dates, false for
  today/future; `checkRegistrationAllowed` still returns `past` via the helper.
