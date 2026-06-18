# Summer Cup Uitschrijflink Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a self-service cancel link to the 6 Reds SummER Cup confirmation email so a participant can free their own spot before the play day starts.

**Architecture:** Each registration gets a random, unguessable `cancelToken`. The confirmation email links to a new Nuxt page `/6-reds-summer-cup/uitschrijven/[token]`, which reads a small summary via a GET endpoint and, on confirmation, calls a POST endpoint that hard-deletes the row (freeing the spot) and emails a cancellation confirmation (participant TO, organiser BCC). The cancel deadline reuses the existing "play day is past" rule.

**Tech Stack:** Nuxt 4, Nitro server routes, Drizzle ORM over NuxtHub SQLite (`hub:db`), Nuxt UI v4, Brevo transactional email, Vitest.

**Spec:** `docs/superpowers/specs/2026-06-18-summer-cup-uitschrijflink-design.md`

---

## File Structure

- `shared/summerCup/capacity.ts` — **modify**: add `isPlayDayPast(playDayId, now)`, reuse it in `checkRegistrationAllowed`. Single source of truth for the deadline rule.
- `test/summerCup-capacity.test.ts` — **modify**: tests for `isPlayDayPast`.
- `shared/summerCup/email.ts` — **modify**: extract `renderEmailShell`, add `cancelUrl` to `buildConfirmationEmail`, add `buildCancellationEmail`.
- `test/summerCup-email.test.ts` — **modify**: cover the cancel URL and the new cancellation email.
- `server/db/schema.ts` — **modify**: add `cancelToken` column + unique index.
- `server/db/migrations/sqlite/0003_add_cancel_token.sql` — **create** (via drizzle-kit, body hand-corrected for backfill).
- `server/api/6-reds-summer-cup/registrations.post.ts` — **modify**: generate token, store it, build `cancelUrl`, pass to email.
- `server/api/6-reds-summer-cup/cancellations/[token].get.ts` — **create**: token → registration summary.
- `server/api/6-reds-summer-cup/cancellations/[token].post.ts` — **create**: re-check deadline, delete row, send cancellation email.
- `app/pages/6-reds-summer-cup/uitschrijven/[token].vue` — **create**: confirm/cancelled/deadline/not-found states.

**Note on testing convention:** this repo unit-tests pure logic under `shared/` only (see `test/`). Server endpoints and pages have no unit-test harness here, so Tasks 4–7 are verified by typecheck/build and a running dev server, not Vitest. Tasks 1–2 are full TDD.

---

## Task 1: `isPlayDayPast` deadline helper

**Files:**
- Modify: `shared/summerCup/capacity.ts`
- Test: `test/summerCup-capacity.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `test/summerCup-capacity.test.ts` (top-level, alongside the existing `describe` blocks; add the import to the existing import line from `../shared/summerCup/capacity`):

```ts
import { checkRegistrationAllowed, isPlayDayPast } from "../shared/summerCup/capacity";

describe("isPlayDayPast", () => {
  it("is true when the play day is before today", () => {
    expect(isPlayDayPast("2026-06-17", new Date("2026-06-18T10:00:00Z"))).toBe(true);
  });

  it("is false on the play day itself", () => {
    expect(isPlayDayPast("2026-06-18", new Date("2026-06-18T10:00:00Z"))).toBe(false);
  });

  it("is false when the play day is in the future", () => {
    expect(isPlayDayPast("2026-07-01", new Date("2026-06-18T10:00:00Z"))).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test summerCup-capacity`
Expected: FAIL — `isPlayDayPast is not a function` (or import error).

- [ ] **Step 3: Implement the helper and reuse it**

In `shared/summerCup/capacity.ts`, add the exported helper near the top (after the `normalizeEmail` function) and replace the inline `past` check.

Add:

```ts
/** True when the play day's ISO date is before today's (date-level, like registration). */
export function isPlayDayPast(playDayId: string, now: Date): boolean {
  return playDayId < now.toISOString().slice(0, 10);
}
```

Then in `checkRegistrationAllowed`, replace these two lines:

```ts
  // ISO dates sort lexically; play day ids are "YYYY-MM-DD".
  const todayKey = params.now.toISOString().slice(0, 10);
  if (playDay.id < todayKey) return { ok: false, reason: "past" };
```

with:

```ts
  if (isPlayDayPast(playDay.id, params.now)) return { ok: false, reason: "past" };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test summerCup-capacity`
Expected: PASS (the new `isPlayDayPast` block and all existing capacity tests).

- [ ] **Step 5: Commit**

```bash
git add shared/summerCup/capacity.ts test/summerCup-capacity.test.ts
git commit -m "Add isPlayDayPast helper and reuse in capacity check"
```

---

## Task 2: Email — shared shell, cancel link, cancellation email

**Files:**
- Modify: `shared/summerCup/email.ts`
- Test: `test/summerCup-email.test.ts`

- [ ] **Step 1: Write the failing tests**

Replace the entire contents of `test/summerCup-email.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import { buildConfirmationEmail, buildCancellationEmail } from "../shared/summerCup/email";

describe("buildConfirmationEmail", () => {
  const email = buildConfirmationEmail({
    name: "Jan Janssens",
    playDayLabel: "Toernooi 1 — woensdag 17 juni 2026",
    communication: "6RSC Jan Janssens - wo 17 juni 2026",
    qrImageUrl: "https://www.play-er.be/api/6-reds-summer-cup/registrations/1/qr.png",
    logoUrl: "https://www.play-er.be/images/play-er.png",
    cancelUrl: "https://www.play-er.be/6-reds-summer-cup/uitschrijven/abc-123",
  });

  it("puts the play day in the subject", () => {
    expect(email.subject).toContain("Toernooi 1 — woensdag 17 juni 2026");
    expect(email.subject).toContain("6 Reds SummER Cup 2026");
  });

  it("includes name, communication, IBAN and the QR image url in the body", () => {
    expect(email.htmlContent).toContain("Jan Janssens");
    expect(email.htmlContent).toContain("6RSC Jan Janssens - wo 17 juni 2026");
    expect(email.htmlContent).toContain("BE30 0637 6639 4611");
    expect(email.htmlContent).toContain(
      "https://www.play-er.be/api/6-reds-summer-cup/registrations/1/qr.png"
    );
  });

  it("includes the Play-ER logo in the body", () => {
    expect(email.htmlContent).toContain("https://www.play-er.be/images/play-er.png");
    expect(email.htmlContent).toContain('alt="Play-ER"');
  });

  it("includes the cancel link", () => {
    expect(email.htmlContent).toContain(
      "https://www.play-er.be/6-reds-summer-cup/uitschrijven/abc-123"
    );
  });
});

describe("buildCancellationEmail", () => {
  const email = buildCancellationEmail({
    name: "Jan Janssens",
    playDayLabel: "Toernooi 1 — woensdag 17 juni 2026",
    logoUrl: "https://www.play-er.be/images/play-er.png",
  });

  it("mentions uitschrijving and the play day in the subject", () => {
    expect(email.subject).toContain("Uitschrijving");
    expect(email.subject).toContain("Toernooi 1 — woensdag 17 juni 2026");
  });

  it("confirms the participant is uitgeschreven and shows the logo", () => {
    expect(email.htmlContent).toContain("Jan Janssens");
    expect(email.htmlContent).toContain("uitgeschreven");
    expect(email.htmlContent).toContain("Toernooi 1 — woensdag 17 juni 2026");
    expect(email.htmlContent).toContain("https://www.play-er.be/images/play-er.png");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test summerCup-email`
Expected: FAIL — `buildCancellationEmail` is not exported and the cancel-link assertion fails.

- [ ] **Step 3: Implement the refactor**

Replace the entire contents of `shared/summerCup/email.ts` with:

```ts
import { payment, PLAY_TIME, REGISTRATION_FEE } from "../data/summerCup";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Shared HTML chrome (logo + dark header card) used by every Summer Cup email. */
function renderEmailShell(params: { logoUrl: string; bodyHtml: string }): string {
  const logoUrl = escapeHtml(params.logoUrl);
  return `<!doctype html>
<html lang="nl">
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0;">
      <tr>
        <td align="center">
          <img src="${logoUrl}" alt="Play-ER" width="260" height="81" style="display:block;margin:0 auto 20px;border:0;max-width:100%;height:auto;" />
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
            <tr>
              <td align="center" style="background:#323031;padding:16px 24px;color:#ffffff;">
                <h1 style="margin:0;font-size:20px;">6 Reds SummER Cup 2026</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                ${params.bodyHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildConfirmationEmail(params: {
  name: string;
  playDayLabel: string;
  communication: string;
  qrImageUrl: string;
  logoUrl: string;
  cancelUrl: string;
}): { subject: string; htmlContent: string } {
  const name = escapeHtml(params.name);
  const playDayLabel = escapeHtml(params.playDayLabel);
  const communication = escapeHtml(params.communication);
  const qrImageUrl = escapeHtml(params.qrImageUrl);
  const cancelUrl = escapeHtml(params.cancelUrl);

  const subject = `Bevestiging inschrijving 6 Reds SummER Cup 2026 – ${params.playDayLabel}`;

  const bodyHtml = `<p style="margin:0 0 16px;">Beste ${name},</p>
                <p style="margin:0 0 16px;">Bedankt voor je inschrijving voor de <strong>6 Reds SummER Cup 2026</strong>. Hieronder vind je de gegevens van je inschrijving.</p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 16px;">
                  <tr><td style="padding:4px 0;"><strong>Naam:</strong></td><td style="padding:4px 0;">${name}</td></tr>
                  <tr><td style="padding:4px 0;"><strong>Speeldag:</strong></td><td style="padding:4px 0;">${playDayLabel}</td></tr>
                  <tr><td style="padding:4px 0;"><strong>Aanvang:</strong></td><td style="padding:4px 0;">${PLAY_TIME}</td></tr>
                  <tr><td style="padding:4px 0;"><strong>Inschrijvingsgeld:</strong></td><td style="padding:4px 0;">&euro; ${REGISTRATION_FEE}</td></tr>
                </table>
                <h2 style="font-size:16px;margin:24px 0 8px;">Betaling</h2>
                <p style="margin:0 0 16px;">Schrijf het inschrijvingsgeld vóór de speeldag over om je plaats te bevestigen:</p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f4f4f5;border-radius:8px;padding:16px;margin:0 0 16px;">
                  <tr><td style="padding:4px 16px;"><strong>Begunstigde:</strong></td><td style="padding:4px 16px;">${escapeHtml(payment.beneficiary)}</td></tr>
                  <tr><td style="padding:4px 16px;"><strong>IBAN:</strong></td><td style="padding:4px 16px;">${escapeHtml(payment.iban)}</td></tr>
                  <tr><td style="padding:4px 16px;"><strong>BIC:</strong></td><td style="padding:4px 16px;">${escapeHtml(payment.bic)}</td></tr>
                  <tr><td style="padding:4px 16px;"><strong>Bedrag:</strong></td><td style="padding:4px 16px;">&euro; ${REGISTRATION_FEE}</td></tr>
                  <tr><td style="padding:4px 16px;"><strong>Mededeling:</strong></td><td style="padding:4px 16px;">${communication}</td></tr>
                </table>
                <p style="margin:0 0 8px;">Of scan deze QR-code met je bankapp:</p>
                <p style="margin:0 0 16px;"><img src="${qrImageUrl}" alt="Betaal-QR-code" width="200" height="200" style="display:block;border:0;" /></p>
                <p style="margin:0 0 16px;color:#6b7280;font-size:13px;">Lukt het scannen niet in je e-mail? De QR-code zit ook als bijlage bij deze mail.</p>
                <p style="margin:24px 0 0;">Tot op de speeldag!<br />Team Play-ER</p>
                <p style="margin:24px 0 0;font-size:13px;color:#6b7280;">Kan je toch niet komen? <a href="${cancelUrl}" style="color:#6b7280;text-decoration:underline;">Schrijf je hier uit</a> zodat iemand anders je plaats kan innemen.</p>`;

  return { subject, htmlContent: renderEmailShell({ logoUrl: params.logoUrl, bodyHtml }) };
}

export function buildCancellationEmail(params: {
  name: string;
  playDayLabel: string;
  logoUrl: string;
}): { subject: string; htmlContent: string } {
  const name = escapeHtml(params.name);
  const playDayLabel = escapeHtml(params.playDayLabel);

  const subject = `Uitschrijving 6 Reds SummER Cup 2026 – ${params.playDayLabel}`;

  const bodyHtml = `<p style="margin:0 0 16px;">Beste ${name},</p>
                <p style="margin:0 0 16px;">Je bent uitgeschreven voor de <strong>6 Reds SummER Cup 2026</strong> op <strong>${playDayLabel}</strong>. Je plaats is weer vrijgekomen.</p>
                <p style="margin:0 0 16px;">Van gedacht veranderd? Zolang er plaats is kan je je opnieuw inschrijven via <a href="https://www.play-er.be/6-reds-summer-cup" style="color:#1f2937;">play-er.be/6-reds-summer-cup</a>.</p>
                <p style="margin:0 0 16px;">Vragen? Antwoord gerust op deze e-mail.</p>
                <p style="margin:24px 0 0;">Tot een volgende keer!<br />Team Play-ER</p>`;

  return { subject, htmlContent: renderEmailShell({ logoUrl: params.logoUrl, bodyHtml }) };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test summerCup-email`
Expected: PASS (both describe blocks).

> Do not commit yet: `registrations.post.ts` still calls `buildConfirmationEmail` without `cancelUrl`, so a typecheck/build would fail. Task 4 fixes the caller. Commit Task 2 together with Task 4, or after Step 4 here if you only run `pnpm test` (Vitest does not typecheck the server route). To keep commits green under `pnpm build`, commit after Task 4.

- [ ] **Step 5: Commit**

```bash
git add shared/summerCup/email.ts test/summerCup-email.test.ts
git commit -m "Refactor Summer Cup email shell, add cancel link + cancellation email"
```

---

## Task 3: Schema column + migration

**Files:**
- Modify: `server/db/schema.ts`
- Create: `server/db/migrations/sqlite/0003_add_cancel_token.sql` (+ `meta/` updated by drizzle-kit)

- [ ] **Step 1: Add the column and unique index to the schema**

In `server/db/schema.ts`, in the `summerCupRegistrations` table, add the `cancelToken` column after `createdAt`, and add a second unique index. The table becomes:

```ts
export const summerCupRegistrations = sqliteTable(
  "summer_cup_registrations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playDayId: text("playDayId").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    communication: text("communication").notNull(),
    qrCodeBase64: text("qrCodeBase64").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    cancelToken: text("cancelToken").notNull(),
  },
  (table) => [
    uniqueIndex("summer_cup_registrations_playDayId_email_unique").on(
      table.playDayId,
      table.email
    ),
    uniqueIndex("summer_cup_registrations_cancelToken_unique").on(table.cancelToken),
  ]
);
```

- [ ] **Step 2: Regenerate the NuxtHub drizzle schema, then generate the migration**

Run:

```bash
pnpm nuxt prepare
npx drizzle-kit generate --config .nuxt/hub/db/drizzle.config.ts --name add_cancel_token
```

Expected: a new file `server/db/migrations/sqlite/0003_add_cancel_token.sql` plus an updated `server/db/migrations/sqlite/meta/_journal.json` and a new `meta/0003_snapshot.json`. `pnpm nuxt prepare` regenerates `.nuxt/hub/db/schema.mjs` from the edited `server/db/schema.ts` so drizzle-kit sees the new column.

- [ ] **Step 3: Replace the migration SQL body with a backfilling recreation**

The auto-generated SQL adds a `NOT NULL` column with no value, which fails on the already-populated table (the edition is running). Replace the **entire contents** of `server/db/migrations/sqlite/0003_add_cancel_token.sql` with this table-recreation that backfills existing rows with random tokens:

```sql
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_summer_cup_registrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`playDayId` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`communication` text NOT NULL,
	`qrCodeBase64` text NOT NULL,
	`created_at` integer NOT NULL,
	`cancelToken` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_summer_cup_registrations`("id", "playDayId", "name", "email", "communication", "qrCodeBase64", "created_at", "cancelToken") SELECT "id", "playDayId", "name", "email", "communication", "qrCodeBase64", "created_at", lower(hex(randomblob(16))) FROM `summer_cup_registrations`;--> statement-breakpoint
DROP TABLE `summer_cup_registrations`;--> statement-breakpoint
ALTER TABLE `__new_summer_cup_registrations` RENAME TO `summer_cup_registrations`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `summer_cup_registrations_playDayId_email_unique` ON `summer_cup_registrations` (`playDayId`,`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `summer_cup_registrations_cancelToken_unique` ON `summer_cup_registrations` (`cancelToken`);
```

Leave `meta/_journal.json` and `meta/0003_snapshot.json` as drizzle-kit generated them — they describe the end-state schema, which this SQL produces, and keep future `drizzle-kit generate` runs consistent.

- [ ] **Step 4: Verify the migration applies cleanly**

Start the dev server (NuxtHub applies pending `.sql` migrations on boot, tracked in `_hub_migrations`):

```bash
pnpm dev
```

Expected: server starts with no migration error. Then stop the server. (If you have a registration in the local DB, confirm it now has a non-null `cancelToken`; a fresh local DB simply starts empty.)

- [ ] **Step 5: Commit**

```bash
git add server/db/schema.ts server/db/migrations/sqlite/
git commit -m "Add cancelToken column + backfilling migration"
```

---

## Task 4: Registration endpoint — generate token + cancel URL

**Files:**
- Modify: `server/api/6-reds-summer-cup/registrations.post.ts`

- [ ] **Step 1: Generate and store the token, build the cancel URL, pass it to the email**

In `server/api/6-reds-summer-cup/registrations.post.ts`:

(a) Just before the insert (after `const communication = buildCommunication(...)`), add:

```ts
  const cancelToken = crypto.randomUUID();
```

(b) In the `.values({ ... })` object of the insert, add `cancelToken` (after `qrCodeBase64`):

```ts
      .values({
        playDayId: body.output.playDayId,
        name: body.output.name,
        email: body.output.email,
        communication,
        qrCodeBase64: body.output.qrCodeBase64,
        cancelToken,
        createdAt: new Date(),
      })
```

(c) Where the email URLs are built (after `const origin = getRequestURL(event).origin;`), add the cancel URL and pass it into `buildConfirmationEmail`:

```ts
  const origin = getRequestURL(event).origin;
  const qrImageUrl = `${origin}/api/6-reds-summer-cup/registrations/${inserted.id}/qr.png`;
  const logoUrl = `${origin}/images/play-er.png`;
  const cancelUrl = `${origin}/6-reds-summer-cup/uitschrijven/${cancelToken}`;
  const mail = buildConfirmationEmail({
    name: body.output.name,
    playDayLabel: playDay.label,
    communication,
    qrImageUrl,
    logoUrl,
    cancelUrl,
  });
```

- [ ] **Step 2: Verify it typechecks/builds**

Run: `pnpm build`
Expected: build succeeds with no TypeScript errors (the `buildConfirmationEmail` call now matches the new signature).

- [ ] **Step 3: Commit (folds in Task 2's email change to keep the build green)**

```bash
git add server/api/6-reds-summer-cup/registrations.post.ts
git commit -m "Generate cancelToken on registration and add cancel link to the email"
```

---

## Task 5: Cancel GET endpoint (summary)

**Files:**
- Create: `server/api/6-reds-summer-cup/cancellations/[token].get.ts`

- [ ] **Step 1: Create the endpoint**

Create `server/api/6-reds-summer-cup/cancellations/[token].get.ts` with:

```ts
import { summerCupRegistrations } from "hub:db:schema";
import { db } from "hub:db";
import { eq } from "drizzle-orm";
import { getPlayDay } from "#shared/data/summerCup";
import { isPlayDayPast } from "#shared/summerCup/capacity";

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, "token");

  if (!token) {
    return { found: false };
  }

  const row = await db
    .select({
      name: summerCupRegistrations.name,
      playDayId: summerCupRegistrations.playDayId,
    })
    .from(summerCupRegistrations)
    .where(eq(summerCupRegistrations.cancelToken, token))
    .get();

  if (!row) {
    return { found: false };
  }

  const playDay = getPlayDay(row.playDayId);

  return {
    found: true,
    name: row.name,
    playDayLabel: playDay?.label ?? row.playDayId,
    cancellable: !!playDay && !isPlayDayPast(playDay.id, new Date()),
  };
});
```

- [ ] **Step 2: Verify it builds**

Run: `pnpm build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add server/api/6-reds-summer-cup/cancellations/[token].get.ts
git commit -m "Add cancellation summary GET endpoint"
```

---

## Task 6: Cancel POST endpoint (delete + email)

**Files:**
- Create: `server/api/6-reds-summer-cup/cancellations/[token].post.ts`

- [ ] **Step 1: Create the endpoint**

Create `server/api/6-reds-summer-cup/cancellations/[token].post.ts` with:

```ts
import { summerCupRegistrations } from "hub:db:schema";
import { db } from "hub:db";
import { eq } from "drizzle-orm";
import { getPlayDay } from "#shared/data/summerCup";
import { isPlayDayPast } from "#shared/summerCup/capacity";
import { buildCancellationEmail } from "#shared/summerCup/email";

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, "token");

  if (!token) {
    setResponseStatus(event, 400);
    return { success: false };
  }

  const row = await db
    .select({
      id: summerCupRegistrations.id,
      name: summerCupRegistrations.name,
      email: summerCupRegistrations.email,
      playDayId: summerCupRegistrations.playDayId,
    })
    .from(summerCupRegistrations)
    .where(eq(summerCupRegistrations.cancelToken, token))
    .get();

  // Idempotent: an unknown/already-used token (or an email-scanner replay) is harmless.
  if (!row) {
    return { success: true, alreadyGone: true };
  }

  const playDay = getPlayDay(row.playDayId);
  if (playDay && isPlayDayPast(playDay.id, new Date())) {
    setResponseStatus(event, 409);
    return { success: false, reason: "past" };
  }

  // Hard delete frees the spot (capacity counts rows) and allows re-registration.
  await db
    .delete(summerCupRegistrations)
    .where(eq(summerCupRegistrations.id, row.id))
    .run();

  // The cancellation is done; a failed confirmation email must not resurrect the row.
  try {
    const origin = getRequestURL(event).origin;
    const mail = buildCancellationEmail({
      name: row.name,
      playDayLabel: playDay?.label ?? row.playDayId,
      logoUrl: `${origin}/images/play-er.png`,
    });
    await sendTransactionalEmail({
      sender: { name: "Snooker Play-ER", email: "snooker@play-er.be" },
      to: [{ email: row.email, name: row.name }],
      bcc: [{ email: "snooker@play-er.be" }],
      replyTo: { email: "snooker@play-er.be" },
      subject: mail.subject,
      htmlContent: mail.htmlContent,
    });
  } catch (error) {
    console.error("Brevo cancellation mail failed (registration already removed)", error);
  }

  return { success: true };
});
```

- [ ] **Step 2: Verify it builds**

Run: `pnpm build`
Expected: build succeeds. (`sendTransactionalEmail` is auto-imported from `server/utils/brevo.ts`, same as in `registrations.post.ts`.)

- [ ] **Step 3: Commit**

```bash
git add server/api/6-reds-summer-cup/cancellations/[token].post.ts
git commit -m "Add cancellation POST endpoint (delete + confirmation email)"
```

---

## Task 7: Uitschrijven page

**Files:**
- Create: `app/pages/6-reds-summer-cup/uitschrijven/[token].vue`

- [ ] **Step 1: Create the page**

Create `app/pages/6-reds-summer-cup/uitschrijven/[token].vue` with:

```vue
<script setup lang="ts">
const route = useRoute();
const token = computed(() => String(route.params.token ?? ""));

useSeoMeta({
  title: "Uitschrijven — 6 Reds SummER Cup 2026",
  robots: "noindex, nofollow",
});

interface CancelInfo {
  found: boolean;
  name?: string;
  playDayLabel?: string;
  cancellable?: boolean;
}

const { data: info } = await useFetch<CancelInfo>(
  () => `/api/6-reds-summer-cup/cancellations/${token.value}`
);

const submitting = ref(false);
const done = ref(false);
const failed = ref(false);

const cancel = async () => {
  if (submitting.value) return;
  submitting.value = true;
  failed.value = false;
  try {
    await $fetch(`/api/6-reds-summer-cup/cancellations/${token.value}`, {
      method: "POST",
    });
    done.value = true;
  } catch {
    failed.value = true;
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <section class="w-full">
    <div class="mx-auto max-w-2xl px-8 py-16 flex flex-col gap-6">
      <h1>Uitschrijven</h1>

      <template v-if="done">
        <u-alert
          title="Je bent uitgeschreven"
          description="Je plaats is weer vrijgekomen. We hebben je een bevestigingsmail gestuurd."
          color="success"
          variant="subtle"
        />
        <u-button
          to="/6-reds-summer-cup"
          label="Terug naar de inschrijvingspagina"
          color="neutral"
          variant="ghost"
        />
      </template>

      <template v-else-if="!info?.found">
        <u-alert
          title="Niet gevonden"
          description="Deze inschrijving bestaat niet (meer). Mogelijk ben je al uitgeschreven."
          color="warning"
          variant="subtle"
        />
        <u-button
          to="/6-reds-summer-cup"
          label="Naar de inschrijvingspagina"
          color="neutral"
          variant="ghost"
        />
      </template>

      <template v-else-if="!info.cancellable">
        <u-alert
          title="Uitschrijven niet meer mogelijk"
          :description="`De speeldag (${info.playDayLabel}) is al begonnen of voorbij. Neem contact op via snooker@play-er.be als je nog vragen hebt.`"
          color="warning"
          variant="subtle"
        />
      </template>

      <template v-else>
        <p>
          Wil je je inschrijving voor
          <span class="font-semibold">{{ info.playDayLabel }}</span> annuleren? Je plaats komt
          dan weer vrij voor iemand anders.
        </p>
        <u-alert
          v-if="failed"
          title="Mislukt"
          description="Er ging iets mis. Probeer het later opnieuw."
          color="error"
          variant="subtle"
        />
        <div class="flex flex-wrap gap-3">
          <u-button
            label="Uitschrijving bevestigen"
            color="error"
            size="xl"
            :loading="submitting"
            :disabled="submitting"
            @click="cancel()"
          />
          <u-button
            to="/6-reds-summer-cup"
            label="Toch niet"
            color="neutral"
            variant="ghost"
            size="xl"
          />
        </div>
      </template>
    </div>
  </section>
</template>

<style></style>
```

- [ ] **Step 2: Verify the page renders and the flow works**

Run: `pnpm dev`, then drive the preview:
- Visit `/6-reds-summer-cup/uitschrijven/does-not-exist` → "Niet gevonden" state.
- Create a registration (via the inschrijving form), copy its `cancelToken` from the local DB (or from the cancel link logged/sent), visit `/6-reds-summer-cup/uitschrijven/<token>` → confirm state showing the play day.
- Click "Uitschrijving bevestigen" → success state; confirm the row is gone from `summer_cup_registrations` and the spot count on `/6-reds-summer-cup` went back up. (A missing local Brevo key is fine — the delete still succeeds; the email error is only logged.)

Expected: all four states render correctly, no console/server errors except an optional Brevo warning when no API key is set locally.

- [ ] **Step 3: Commit**

```bash
git add app/pages/6-reds-summer-cup/uitschrijven/[token].vue
git commit -m "Add uitschrijven confirmation page"
```

---

## Task 8: Full verification + graph update

**Files:** none (verification only)

- [ ] **Step 1: Run the whole test suite**

Run: `pnpm test`
Expected: all tests pass (capacity + email included).

- [ ] **Step 2: Production build**

Run: `pnpm build`
Expected: build succeeds with no type errors.

- [ ] **Step 3: Refresh the knowledge graph (project rule in CLAUDE.md)**

Run: `graphify update .`
Expected: completes (AST-only, no API cost).

- [ ] **Step 4: Commit any graph changes**

```bash
git add graphify-out/
git commit -m "Update graphify graph after uitschrijflink"
```

(Skip if `graphify update` produced no changes.)

---

## Self-Review notes

- **Spec coverage:** security/token → Tasks 3–4; data model + backfill → Task 3; hard delete → Task 6; deadline helper → Task 1 (used in 5 & 6); email shell/cancel link/cancellation mail → Task 2; registration flow → Task 4; GET/POST endpoints → Tasks 5–6; page + states → Task 7; error handling (idempotent POST, past 409, email-failure-keeps-deletion) → Task 6; testing → Tasks 1–2 + Task 8. All covered.
- **Type consistency:** `buildConfirmationEmail` gains `cancelUrl` (Task 2) and every caller passes it (Task 4). `buildCancellationEmail({ name, playDayLabel, logoUrl })` defined in Task 2, called identically in Task 6. `isPlayDayPast(playDayId, now)` defined in Task 1, called identically in Tasks 5–6. GET returns `{ found, name?, playDayLabel?, cancellable? }`, matched by the page's `CancelInfo` interface in Task 7. Unique index name `summer_cup_registrations_cancelToken_unique` matches between schema (Task 3) and migration SQL (Task 3).
- **No placeholders:** every code/SQL step contains full content.
