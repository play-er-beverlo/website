# 6 Reds SummER Cup 2026 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a standalone page `/6-reds-summer-cup` that explains the tournament + rules and lets members register for a play day (capacity-enforced), sending a Brevo confirmation email with an EPC payment QR code.

**Architecture:** Pure, unit-tested logic (calendar data, EPC QR payload, capacity rules, email HTML) lives in `shared/`. Server endpoints under `server/api/6-reds-summer-cup/` validate input, enforce capacity against the D1 table `summer_cup_registrations`, insert the registration, send the Brevo email, and roll back the insert if the email fails. The page + a registration component render the rules and the form; the EPC QR is generated client-side with `qrcode` and posted as base64 to the API.

**Tech Stack:** Nuxt 4, Nuxt UI 4, Tailwind 4, NuxtHub `@nuxthub/db` (drizzle + Cloudflare D1), valibot, Brevo transactional email API, `qrcode`, Vitest.

**Spec:** `docs/superpowers/specs/2026-06-11-6-reds-summer-cup-design.md`

---

## Conventions for this plan

- Package manager is **pnpm**. Run commands from the repo root `D:\steffbeckers\play-er-website`.
- Vue components in templates use kebab-case Nuxt UI tags (`u-button`, `u-form-field`, …), matching the existing `app/components/AppBooking.vue`.
- **Every commit message must end with this trailer** (shown once here; append it to each `git commit` in the steps):
  ```
  Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
  ```
- Intra-`shared/` imports use **relative** paths (e.g. `../data/summerCup`) so Vitest needs no alias config. App/server code imports shared modules via the `#shared/...` alias.

## File structure

**Create (shared, pure, unit-tested):**
- `shared/data/summerCup.ts` — constants, calendar (8 play days + finale), payment data, helpers.
- `shared/summerCup/epc.ts` — `buildCommunication`, `buildEpcQrPayload` (EPC069-12 v2 string).
- `shared/summerCup/capacity.ts` — `checkRegistrationAllowed` (per-day max 8, edition max 16 unique, duplicate, past, unknown).
- `shared/summerCup/email.ts` — `buildConfirmationEmail` → `{ subject, htmlContent }`.

**Create (server):**
- `server/utils/brevo.ts` — `sendTransactionalEmail` (Brevo API).
- `server/api/6-reds-summer-cup/availability.get.ts` — per-play-day availability.
- `server/api/6-reds-summer-cup/registrations.post.ts` — register (validate → capacity → insert → email → rollback-on-fail).
- `server/api/6-reds-summer-cup/registrations/[id]/qr.png.get.ts` — serve stored QR PNG.

**Create (frontend):**
- `app/components/SummerCupRegistration.vue` — form + QR generation + submit flow.
- `app/pages/6-reds-summer-cup.vue` — page: hero (shorter than homepage), rules content, registration component, SEO.

**Create (config/test):**
- `vitest.config.ts`, `test/` unit tests, `.env.example`.

**Modify:**
- `server/db/schema.ts` — add `summerCupRegistrations` table.
- `nuxt.config.ts` — add `runtimeConfig.brevoApiKey`.
- `package.json` — add deps + `test` script (via pnpm).
- `server/db/migrations/sqlite/` — new generated migration (via `npx nuxt db generate`).

---

## Task 1: Test runner (Vitest) setup

**Files:**
- Modify: `package.json` (add devDeps + script)
- Create: `vitest.config.ts`
- Create: `test/sanity.test.ts`

- [ ] **Step 1: Install Vitest**

Run: `pnpm add -D vitest`
Expected: vitest added to devDependencies, lockfile updated.

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    environment: "node",
  },
});
```

- [ ] **Step 3: Add the `test` script to `package.json`**

In the `"scripts"` block add:
```json
    "test": "vitest run",
```

- [ ] **Step 4: Write a sanity test**

`test/sanity.test.ts`:
```ts
import { describe, expect, it } from "vitest";

describe("sanity", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run it**

Run: `pnpm test`
Expected: PASS, 1 test passed.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts test/sanity.test.ts
git commit -m "Add Vitest test runner"
```

---

## Task 2: Tournament data (`shared/data/summerCup.ts`)

**Files:**
- Create: `shared/data/summerCup.ts`
- Test: `test/summerCup-data.test.ts`

- [ ] **Step 1: Write the failing test**

`test/summerCup-data.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import {
  playDays,
  finaleDay,
  getPlayDay,
  MAX_PER_PLAY_DAY,
  MAX_UNIQUE_PLAYERS,
  REGISTRATION_FEE,
  payment,
} from "../shared/data/summerCup";

describe("summerCup data", () => {
  it("has 8 registrable play days", () => {
    expect(playDays).toHaveLength(8);
  });

  it("does not include the finale day among play days", () => {
    expect(playDays.find((d) => d.id === finaleDay.id)).toBeUndefined();
  });

  it("resolves a play day by id", () => {
    expect(getPlayDay("2026-06-17")?.tournament).toBe(1);
    expect(getPlayDay("2026-07-31")?.shortLabel).toBe("vr 31 juli 2026");
    expect(getPlayDay("nope")).toBeUndefined();
  });

  it("exposes the agreed constants and payment data", () => {
    expect(MAX_PER_PLAY_DAY).toBe(8);
    expect(MAX_UNIQUE_PLAYERS).toBe(16);
    expect(REGISTRATION_FEE).toBe(15);
    expect(payment.ibanCompact).toBe("BE30063766394611");
    expect(payment.bic).toBe("GKCCBEBB");
    expect(payment.beneficiary).toBe("Beckers Steff");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test`
Expected: FAIL — cannot resolve `../shared/data/summerCup`.

- [ ] **Step 3: Create `shared/data/summerCup.ts`**

```ts
export const EDITION_YEAR = 2026;
export const MIN_PER_PLAY_DAY = 4;
export const MAX_PER_PLAY_DAY = 8;
export const MAX_UNIQUE_PLAYERS = 16;
export const REGISTRATION_FEE = 15;
export const PLAY_TIME = "18:30";

export const payment = {
  iban: "BE30 0637 6639 4611",
  ibanCompact: "BE30063766394611",
  bic: "GKCCBEBB",
  beneficiary: "Beckers Steff",
};

export interface PlayDay {
  /** Stable key + ISO date, e.g. "2026-06-17". */
  id: string;
  tournament: number;
  weekday: "woensdag" | "vrijdag";
  /** Full label, e.g. "Toernooi 1 — woensdag 17 juni 2026". */
  label: string;
  /** Short label used in the payment communication, e.g. "wo 17 juni 2026". */
  shortLabel: string;
}

export const playDays: PlayDay[] = [
  { id: "2026-06-17", tournament: 1, weekday: "woensdag", label: "Toernooi 1 — woensdag 17 juni 2026", shortLabel: "wo 17 juni 2026" },
  { id: "2026-06-19", tournament: 1, weekday: "vrijdag", label: "Toernooi 1 — vrijdag 19 juni 2026", shortLabel: "vr 19 juni 2026" },
  { id: "2026-07-01", tournament: 2, weekday: "woensdag", label: "Toernooi 2 — woensdag 1 juli 2026", shortLabel: "wo 1 juli 2026" },
  { id: "2026-07-03", tournament: 2, weekday: "vrijdag", label: "Toernooi 2 — vrijdag 3 juli 2026", shortLabel: "vr 3 juli 2026" },
  { id: "2026-07-15", tournament: 3, weekday: "woensdag", label: "Toernooi 3 — woensdag 15 juli 2026", shortLabel: "wo 15 juli 2026" },
  { id: "2026-07-17", tournament: 3, weekday: "vrijdag", label: "Toernooi 3 — vrijdag 17 juli 2026", shortLabel: "vr 17 juli 2026" },
  { id: "2026-07-29", tournament: 4, weekday: "woensdag", label: "Toernooi 4 — woensdag 29 juli 2026", shortLabel: "wo 29 juli 2026" },
  { id: "2026-07-31", tournament: 4, weekday: "vrijdag", label: "Toernooi 4 — vrijdag 31 juli 2026", shortLabel: "vr 31 juli 2026" },
];

export const finaleDay = {
  id: "2026-08-14",
  label: "Finaledag — vrijdag 14 augustus 2026",
  shortLabel: "vr 14 augustus 2026",
};

export function getPlayDay(id: string): PlayDay | undefined {
  return playDays.find((d) => d.id === id);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add shared/data/summerCup.ts test/summerCup-data.test.ts
git commit -m "Add 6 Reds SummER Cup tournament data"
```

---

## Task 3: EPC QR payload builders (`shared/summerCup/epc.ts`)

**Files:**
- Create: `shared/summerCup/epc.ts`
- Test: `test/summerCup-epc.test.ts`

- [ ] **Step 1: Write the failing test**

`test/summerCup-epc.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { buildCommunication, buildEpcQrPayload } from "../shared/summerCup/epc";

describe("EPC QR builders", () => {
  it("builds the payment communication", () => {
    expect(buildCommunication("Jan Janssens", "wo 17 juni 2026")).toBe(
      "6RSC Jan Janssens - wo 17 juni 2026"
    );
  });

  it("trims the name in the communication", () => {
    expect(buildCommunication("  Jan  ", "wo 17 juni 2026")).toBe("6RSC Jan - wo 17 juni 2026");
  });

  it("builds an EPC069-12 v2 payload", () => {
    const payload = buildEpcQrPayload({
      name: "Jan Janssens",
      shortLabel: "wo 17 juni 2026",
      amount: 15,
    });
    expect(payload).toBe(
      [
        "BCD",
        "002",
        "1",
        "SCT",
        "GKCCBEBB",
        "Beckers Steff",
        "BE30063766394611",
        "EUR15.00",
        "",
        "",
        "6RSC Jan Janssens - wo 17 juni 2026",
      ].join("\n")
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test`
Expected: FAIL — cannot resolve `../shared/summerCup/epc`.

- [ ] **Step 3: Create `shared/summerCup/epc.ts`**

```ts
import { payment } from "../data/summerCup";

export function buildCommunication(name: string, shortLabel: string): string {
  return `6RSC ${name.trim()} - ${shortLabel}`;
}

/**
 * Builds an EPC069-12 (version 002) SEPA Credit Transfer payload string.
 * Scannable by banking apps to prefill a transfer.
 */
export function buildEpcQrPayload(params: {
  name: string;
  shortLabel: string;
  amount: number;
}): string {
  const communication = buildCommunication(params.name, params.shortLabel);
  return [
    "BCD", // Service Tag
    "002", // Version
    "1", // Character set: UTF-8
    "SCT", // SEPA Credit Transfer
    payment.bic,
    payment.beneficiary,
    payment.ibanCompact,
    `EUR${params.amount.toFixed(2)}`,
    "", // Purpose (optional)
    "", // Structured remittance reference (optional)
    communication, // Unstructured remittance information
  ].join("\n");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add shared/summerCup/epc.ts test/summerCup-epc.test.ts
git commit -m "Add EPC QR payload builders"
```

---

## Task 4: Capacity rules (`shared/summerCup/capacity.ts`)

**Files:**
- Create: `shared/summerCup/capacity.ts`
- Test: `test/summerCup-capacity.test.ts`

- [ ] **Step 1: Write the failing test**

`test/summerCup-capacity.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import {
  checkRegistrationAllowed,
  type ExistingRegistration,
} from "../shared/summerCup/capacity";

const NOW = new Date("2026-06-11T12:00:00Z"); // before the first play day

function make(count: number, playDayId: string, emailPrefix: string): ExistingRegistration[] {
  return Array.from({ length: count }, (_, i) => ({
    playDayId,
    email: `${emailPrefix}${i}@example.com`,
  }));
}

describe("checkRegistrationAllowed", () => {
  it("allows a registration when there is space", () => {
    const r = checkRegistrationAllowed({
      playDayId: "2026-06-17",
      email: "new@example.com",
      existing: [],
      now: NOW,
    });
    expect(r).toEqual({ ok: true });
  });

  it("rejects an unknown play day", () => {
    const r = checkRegistrationAllowed({
      playDayId: "1999-01-01",
      email: "new@example.com",
      existing: [],
      now: NOW,
    });
    expect(r).toEqual({ ok: false, reason: "unknown_play_day" });
  });

  it("rejects a play day in the past", () => {
    const r = checkRegistrationAllowed({
      playDayId: "2026-06-17",
      email: "new@example.com",
      existing: [],
      now: new Date("2026-06-20T12:00:00Z"),
    });
    expect(r).toEqual({ ok: false, reason: "past" });
  });

  it("rejects a duplicate registration for the same day (case-insensitive)", () => {
    const r = checkRegistrationAllowed({
      playDayId: "2026-06-17",
      email: "Jan@Example.com",
      existing: [{ playDayId: "2026-06-17", email: "jan@example.com" }],
      now: NOW,
    });
    expect(r).toEqual({ ok: false, reason: "duplicate" });
  });

  it("rejects when the play day is full (8 registrations)", () => {
    const r = checkRegistrationAllowed({
      playDayId: "2026-06-17",
      email: "new@example.com",
      existing: make(8, "2026-06-17", "p"),
      now: NOW,
    });
    expect(r).toEqual({ ok: false, reason: "full" });
  });

  it("rejects a new unique player when the edition already has 16 unique players", () => {
    const r = checkRegistrationAllowed({
      playDayId: "2026-06-19",
      email: "seventeenth@example.com",
      existing: make(16, "2026-06-17", "u"), // 16 unique emails on a different day
      now: NOW,
    });
    expect(r).toEqual({ ok: false, reason: "edition_full" });
  });

  it("still allows an already-registered player to add another day at the 16-unique cap", () => {
    const existing = make(16, "2026-06-17", "u"); // u0..u15 unique
    const r = checkRegistrationAllowed({
      playDayId: "2026-06-19",
      email: "u3@example.com", // already counted unique
      existing,
      now: NOW,
    });
    expect(r).toEqual({ ok: true });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test`
Expected: FAIL — cannot resolve `../shared/summerCup/capacity`.

- [ ] **Step 3: Create `shared/summerCup/capacity.ts`**

```ts
import { getPlayDay, MAX_PER_PLAY_DAY, MAX_UNIQUE_PLAYERS } from "../data/summerCup";

export type RegistrationDenyReason =
  | "unknown_play_day"
  | "past"
  | "duplicate"
  | "full"
  | "edition_full";

export interface ExistingRegistration {
  playDayId: string;
  email: string;
}

export interface CapacityResult {
  ok: boolean;
  reason?: RegistrationDenyReason;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function checkRegistrationAllowed(params: {
  playDayId: string;
  email: string;
  existing: ExistingRegistration[];
  now: Date;
}): CapacityResult {
  const playDay = getPlayDay(params.playDayId);
  if (!playDay) return { ok: false, reason: "unknown_play_day" };

  // ISO dates sort lexically; play day ids are "YYYY-MM-DD".
  const todayKey = params.now.toISOString().slice(0, 10);
  if (playDay.id < todayKey) return { ok: false, reason: "past" };

  const email = normalizeEmail(params.email);
  const existing = params.existing.map((r) => ({
    playDayId: r.playDayId,
    email: normalizeEmail(r.email),
  }));

  if (existing.some((r) => r.playDayId === params.playDayId && r.email === email)) {
    return { ok: false, reason: "duplicate" };
  }

  const dayCount = existing.filter((r) => r.playDayId === params.playDayId).length;
  if (dayCount >= MAX_PER_PLAY_DAY) return { ok: false, reason: "full" };

  const uniqueEmails = new Set(existing.map((r) => r.email));
  if (!uniqueEmails.has(email) && uniqueEmails.size >= MAX_UNIQUE_PLAYERS) {
    return { ok: false, reason: "edition_full" };
  }

  return { ok: true };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test`
Expected: PASS (all capacity cases).

- [ ] **Step 5: Commit**

```bash
git add shared/summerCup/capacity.ts test/summerCup-capacity.test.ts
git commit -m "Add 6 Reds SummER Cup capacity rules"
```

---

## Task 5: Confirmation email builder (`shared/summerCup/email.ts`)

**Files:**
- Create: `shared/summerCup/email.ts`
- Test: `test/summerCup-email.test.ts`

- [ ] **Step 1: Write the failing test**

`test/summerCup-email.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { buildConfirmationEmail } from "../shared/summerCup/email";

describe("buildConfirmationEmail", () => {
  const email = buildConfirmationEmail({
    name: "Jan Janssens",
    playDayLabel: "Toernooi 1 — woensdag 17 juni 2026",
    communication: "6RSC Jan Janssens - wo 17 juni 2026",
    qrImageUrl: "https://www.play-er.be/api/6-reds-summer-cup/registrations/1/qr.png",
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test`
Expected: FAIL — cannot resolve `../shared/summerCup/email`.

- [ ] **Step 3: Create `shared/summerCup/email.ts`**

```ts
import { payment, PLAY_TIME, REGISTRATION_FEE } from "../data/summerCup";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildConfirmationEmail(params: {
  name: string;
  playDayLabel: string;
  communication: string;
  qrImageUrl: string;
}): { subject: string; htmlContent: string } {
  const name = escapeHtml(params.name);
  const playDayLabel = escapeHtml(params.playDayLabel);
  const communication = escapeHtml(params.communication);
  const qrImageUrl = escapeHtml(params.qrImageUrl);

  const subject = `Bevestiging inschrijving 6 Reds SummER Cup 2026 – ${params.playDayLabel}`;

  const htmlContent = `<!doctype html>
<html lang="nl">
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
            <tr>
              <td style="background:#323031;padding:24px;color:#ffffff;">
                <h1 style="margin:0;font-size:20px;">6 Reds SummER Cup 2026</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 16px;">Beste ${name},</p>
                <p style="margin:0 0 16px;">Bedankt voor je inschrijving voor de <strong>6 Reds SummER Cup 2026</strong>. Hieronder vind je de gegevens van je inschrijving.</p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 16px;">
                  <tr><td style="padding:4px 0;"><strong>Naam:</strong></td><td style="padding:4px 0;">${name}</td></tr>
                  <tr><td style="padding:4px 0;"><strong>Speeldag:</strong></td><td style="padding:4px 0;">${playDayLabel}</td></tr>
                  <tr><td style="padding:4px 0;"><strong>Aanvang:</strong></td><td style="padding:4px 0;">${PLAY_TIME}u</td></tr>
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
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, htmlContent };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add shared/summerCup/email.ts test/summerCup-email.test.ts
git commit -m "Add 6 Reds SummER Cup confirmation email builder"
```

---

## Task 6: Database table + migration

**Files:**
- Modify: `server/db/schema.ts`
- Create (generated): `server/db/migrations/sqlite/0002_*.sql` (+ journal/snapshot updates)

- [ ] **Step 1: Add the table to `server/db/schema.ts`**

At the top, ensure `uniqueIndex` is imported:
```ts
import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
```

Append after the `bookings` table:
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
  },
  (table) => [
    uniqueIndex("summer_cup_registrations_playDayId_email_unique").on(
      table.playDayId,
      table.email
    ),
  ]
);
```

- [ ] **Step 2: Generate the migration**

Run: `npx nuxt db generate`
Expected: a new file `server/db/migrations/sqlite/0002_<random_name>.sql` is created, plus `meta/_journal.json` gets a third entry and a `meta/0002_snapshot.json` is added. (Non-interactive for a brand-new table.)

- [ ] **Step 3: Verify the generated SQL**

Open the new `0002_*.sql` and confirm it matches (table + unique index):
```sql
CREATE TABLE `summer_cup_registrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`playDayId` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`communication` text NOT NULL,
	`qrCodeBase64` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `summer_cup_registrations_playDayId_email_unique` ON `summer_cup_registrations` (`playDayId`,`email`);
```

> **Fallback if `npx nuxt db generate` is unavailable/interactive:** hand-create `server/db/migrations/sqlite/0002_summer_cup_registrations.sql` with exactly the SQL above, then add an entry to `server/db/migrations/sqlite/meta/_journal.json` (`idx: 2`, `tag: "0002_summer_cup_registrations"`, copy the `version`/`breakpoints` shape of entry `0001`, set `when` to `Date.now()`). The migration applier reads the `.sql` file directly; the snapshot is only needed for future `db generate` runs.

- [ ] **Step 4: Apply migration locally & confirm the schema alias regenerated**

Run: `npx nuxt prepare`
Then confirm the table is exported by the generated alias:
Run: `node -e "import('./node_modules/@nuxthub/db/schema.mjs').then(m => console.log(Object.keys(m)))"`
Expected: output includes `summerCupRegistrations` (alongside `bookings`).

- [ ] **Step 5: Commit**

```bash
git add server/db/schema.ts server/db/migrations/sqlite
git commit -m "Add summer_cup_registrations table and migration"
```

---

## Task 7: Brevo email util (`server/utils/brevo.ts`) + runtime config

**Files:**
- Create: `server/utils/brevo.ts`
- Modify: `nuxt.config.ts`
- Create: `.env.example`

- [ ] **Step 1: Add the runtime config key in `nuxt.config.ts`**

Inside `runtimeConfig` (a top-level secret, next to `calWebhookSecret`), add:
```ts
    brevoApiKey: "", // NUXT_BREVO_API_KEY
```

- [ ] **Step 2: Create `.env.example`**

```bash
# Brevo (Sendinblue) transactional email API key — used for 6 Reds SummER Cup confirmation mails
NUXT_BREVO_API_KEY=
```

- [ ] **Step 3: Create `server/utils/brevo.ts`**

```ts
interface BrevoContact {
  email: string;
  name?: string;
}

interface BrevoAttachment {
  /** Base64-encoded file content (no data: prefix). */
  content: string;
  name: string;
}

/**
 * Sends a transactional email through the Brevo API.
 * Throws if the API key is missing or the request fails (so callers can roll back).
 */
export async function sendTransactionalEmail(params: {
  sender: BrevoContact;
  to: BrevoContact[];
  bcc?: BrevoContact[];
  replyTo?: BrevoContact;
  subject: string;
  htmlContent: string;
  attachment?: BrevoAttachment[];
}): Promise<void> {
  const apiKey = useRuntimeConfig().brevoApiKey as string;

  if (!apiKey) {
    throw new Error("Missing NUXT_BREVO_API_KEY");
  }

  await $fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: {
      sender: params.sender,
      to: params.to,
      bcc: params.bcc,
      replyTo: params.replyTo,
      subject: params.subject,
      htmlContent: params.htmlContent,
      attachment: params.attachment,
    },
  });
}
```

- [ ] **Step 4: Type-check**

Run: `npx nuxt prepare && npx vue-tsc --noEmit -p tsconfig.json` (if `vue-tsc` is unavailable, skip — it will be validated during `pnpm build` later).
Expected: no errors referencing `brevo.ts` or `brevoApiKey`.

- [ ] **Step 5: Commit**

```bash
git add server/utils/brevo.ts nuxt.config.ts .env.example
git commit -m "Add Brevo transactional email util and config"
```

---

## Task 8: Availability endpoint (`availability.get.ts`)

**Files:**
- Create: `server/api/6-reds-summer-cup/availability.get.ts`

- [ ] **Step 1: Create the endpoint**

```ts
import { summerCupRegistrations } from "hub:db:schema";
import { db } from "hub:db";
import { playDays, MAX_PER_PLAY_DAY, MAX_UNIQUE_PLAYERS } from "#shared/data/summerCup";

export default defineEventHandler(async () => {
  const rows = await db
    .select({
      playDayId: summerCupRegistrations.playDayId,
      email: summerCupRegistrations.email,
    })
    .from(summerCupRegistrations)
    .all();

  const todayKey = new Date().toISOString().slice(0, 10);
  const uniqueEmails = new Set(rows.map((r) => r.email.trim().toLowerCase()));

  const days = playDays.map((d) => {
    const registered = rows.filter((r) => r.playDayId === d.id).length;
    return {
      id: d.id,
      label: d.label,
      shortLabel: d.shortLabel,
      tournament: d.tournament,
      registered,
      capacity: MAX_PER_PLAY_DAY,
      remaining: Math.max(0, MAX_PER_PLAY_DAY - registered),
      full: registered >= MAX_PER_PLAY_DAY,
      past: d.id < todayKey,
    };
  });

  return {
    playDays: days,
    uniquePlayers: uniqueEmails.size,
    maxUniquePlayers: MAX_UNIQUE_PLAYERS,
    editionUniqueReached: uniqueEmails.size >= MAX_UNIQUE_PLAYERS,
  };
});
```

- [ ] **Step 2: Verify against the dev server**

Start the dev server in the background:
Run: `pnpm dev` (background; wait for "Local: http://localhost:3000")
Then:
Run: `curl -s http://localhost:3000/api/6-reds-summer-cup/availability`
Expected: JSON with a `playDays` array of 8 entries (each `registered: 0`, `remaining: 8`, `full: false`), `uniquePlayers: 0`, `editionUniqueReached: false`.

- [ ] **Step 3: Commit**

```bash
git add server/api/6-reds-summer-cup/availability.get.ts
git commit -m "Add 6 Reds SummER Cup availability endpoint"
```

---

## Task 9: QR-serving endpoint (`registrations/[id]/qr.png.get.ts`)

**Files:**
- Create: `server/api/6-reds-summer-cup/registrations/[id]/qr.png.get.ts`

- [ ] **Step 1: Create the endpoint**

```ts
import { summerCupRegistrations } from "hub:db:schema";
import { db } from "hub:db";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: "Invalid id" });
  }

  const row = await db
    .select({ qr: summerCupRegistrations.qrCodeBase64 })
    .from(summerCupRegistrations)
    .where(eq(summerCupRegistrations.id, id))
    .get();

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }

  setResponseHeader(event, "content-type", "image/png");
  setResponseHeader(event, "cache-control", "public, max-age=31536000, immutable");

  return Buffer.from(row.qr, "base64");
});
```

- [ ] **Step 2: Verify (after Task 10 inserts a row, or returns 404 now)**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/6-reds-summer-cup/registrations/999999/qr.png`
Expected: `404`.

- [ ] **Step 3: Commit**

```bash
git add server/api/6-reds-summer-cup/registrations/[id]/qr.png.get.ts
git commit -m "Add 6 Reds SummER Cup QR image endpoint"
```

---

## Task 10: Registration endpoint (`registrations.post.ts`)

**Files:**
- Create: `server/api/6-reds-summer-cup/registrations.post.ts`

- [ ] **Step 1: Create the endpoint**

```ts
import * as v from "valibot";
import { summerCupRegistrations } from "hub:db:schema";
import { db } from "hub:db";
import { eq } from "drizzle-orm";
import { getPlayDay } from "#shared/data/summerCup";
import { buildCommunication } from "#shared/summerCup/epc";
import {
  checkRegistrationAllowed,
  type RegistrationDenyReason,
} from "#shared/summerCup/capacity";
import { buildConfirmationEmail } from "#shared/summerCup/email";

const bodySchema = v.object({
  playDayId: v.pipe(v.string(), v.nonEmpty()),
  name: v.pipe(v.string(), v.trim(), v.nonEmpty(), v.maxLength(80)),
  email: v.pipe(v.string(), v.trim(), v.toLowerCase(), v.email(), v.maxLength(120)),
  qrCodeBase64: v.pipe(v.string(), v.nonEmpty(), v.maxLength(200000)),
});

const denyMessages: Record<RegistrationDenyReason, string> = {
  unknown_play_day: "Onbekende speeldag.",
  past: "Deze speeldag is al voorbij.",
  duplicate: "Je bent al ingeschreven voor deze speeldag.",
  full: "Deze speeldag is volzet.",
  edition_full: "Het maximum aantal unieke deelnemers (16) voor editie 2026 is bereikt.",
};

/** Validates that the string is base64 of a PNG (checks the PNG signature). */
function isPngBase64(value: string): boolean {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value)) return false;
  return value.startsWith("iVBORw0KGgo"); // base64 of the 8-byte PNG signature
}

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (b) => v.safeParse(bodySchema, b));

  if (!body.success) {
    setResponseStatus(event, 400);
    return { success: false, validationErrors: body.issues };
  }

  const playDay = getPlayDay(body.output.playDayId);
  if (!playDay) {
    setResponseStatus(event, 400);
    return { success: false, error: denyMessages.unknown_play_day };
  }

  if (!isPngBase64(body.output.qrCodeBase64)) {
    setResponseStatus(event, 400);
    return { success: false, error: "Ongeldige QR-code." };
  }

  const existing = await db
    .select({
      playDayId: summerCupRegistrations.playDayId,
      email: summerCupRegistrations.email,
    })
    .from(summerCupRegistrations)
    .all();

  const check = checkRegistrationAllowed({
    playDayId: body.output.playDayId,
    email: body.output.email,
    existing,
    now: new Date(),
  });

  if (!check.ok) {
    setResponseStatus(event, 409);
    return { success: false, reason: check.reason, error: denyMessages[check.reason!] };
  }

  const communication = buildCommunication(body.output.name, playDay.shortLabel);

  // Insert first to claim the spot (and let the unique index guard against races).
  let inserted: { id: number };
  try {
    inserted = await db
      .insert(summerCupRegistrations)
      .values({
        playDayId: body.output.playDayId,
        name: body.output.name,
        email: body.output.email,
        communication,
        qrCodeBase64: body.output.qrCodeBase64,
        createdAt: new Date(),
      })
      .returning({ id: summerCupRegistrations.id })
      .get();
  } catch (error) {
    // Unique index violation => raced duplicate for the same play day.
    setResponseStatus(event, 409);
    return { success: false, reason: "duplicate", error: denyMessages.duplicate };
  }

  const origin = getRequestURL(event).origin;
  const qrImageUrl = `${origin}/api/6-reds-summer-cup/registrations/${inserted.id}/qr.png`;
  const mail = buildConfirmationEmail({
    name: body.output.name,
    playDayLabel: playDay.label,
    communication,
    qrImageUrl,
  });

  try {
    await sendTransactionalEmail({
      sender: { name: "Snooker Play-ER", email: "snooker@play-er.be" },
      to: [{ email: body.output.email, name: body.output.name }],
      bcc: [{ email: "snooker@play-er.be" }],
      replyTo: { email: "snooker@play-er.be" },
      subject: mail.subject,
      htmlContent: mail.htmlContent,
      attachment: [{ content: body.output.qrCodeBase64, name: "betaling-qr.png" }],
    });
  } catch (error) {
    // The email is essential: roll back so no registration persists without a confirmation.
    await db
      .delete(summerCupRegistrations)
      .where(eq(summerCupRegistrations.id, inserted.id))
      .run();
    console.error("Brevo send failed, registration rolled back", error);
    setResponseStatus(event, 502);
    return {
      success: false,
      error: "We konden de bevestigingsmail niet versturen. Probeer het later opnieuw.",
    };
  }

  return {
    success: true,
    id: inserted.id,
    playDayId: playDay.id,
    playDayLabel: playDay.label,
    name: body.output.name,
    email: body.output.email,
    communication,
  };
});
```

> Note: `sendTransactionalEmail` is auto-imported from `server/utils/brevo.ts` (Nitro auto-imports `server/utils`).

- [ ] **Step 2: Verify capacity rejection without a Brevo key**

With the dev server running and **no** `NUXT_BREVO_API_KEY` set, a valid registration should reach the email step and roll back (HTTP 502), leaving no row. Test the *validation/capacity* paths that return before emailing:

Run (unknown play day):
```bash
curl -s -X POST http://localhost:3000/api/6-reds-summer-cup/registrations -H "content-type: application/json" -d '{"playDayId":"1999-01-01","name":"Test","email":"t@example.com","qrCodeBase64":"iVBORw0KGgoAAAA"}'
```
Expected: `{"success":false,"error":"Onbekende speeldag."}` (HTTP 400).

Run (bad QR):
```bash
curl -s -X POST http://localhost:3000/api/6-reds-summer-cup/registrations -H "content-type: application/json" -d '{"playDayId":"2026-06-17","name":"Test","email":"t@example.com","qrCodeBase64":"not-a-png"}'
```
Expected: `{"success":false,"error":"Ongeldige QR-code."}` (HTTP 400).

(The happy path + rollback is verified end-to-end in Task 13 once a real Brevo key is available.)

- [ ] **Step 3: Commit**

```bash
git add server/api/6-reds-summer-cup/registrations.post.ts
git commit -m "Add 6 Reds SummER Cup registration endpoint"
```

---

## Task 11: Registration component (`SummerCupRegistration.vue`)

**Files:**
- Create: `app/components/SummerCupRegistration.vue`
- Run: `pnpm add qrcode` and `pnpm add -D @types/qrcode`

- [ ] **Step 1: Install the QR library**

Run: `pnpm add qrcode && pnpm add -D @types/qrcode`
Expected: `qrcode` in dependencies, `@types/qrcode` in devDependencies. (Vite resolves `qrcode`'s browser build automatically for client code.)

- [ ] **Step 2: Create the component**

```vue
<script lang="ts" setup>
import QRCode from "qrcode";
import type { Toast } from "@nuxt/ui/runtime/composables/useToast.js";
import { REGISTRATION_FEE, payment, PLAY_TIME, getPlayDay } from "#shared/data/summerCup";
import { buildEpcQrPayload } from "#shared/summerCup/epc";

interface AvailabilityDay {
  id: string;
  label: string;
  shortLabel: string;
  tournament: number;
  registered: number;
  capacity: number;
  remaining: number;
  full: boolean;
  past: boolean;
}
interface AvailabilityResponse {
  playDays: AvailabilityDay[];
  uniquePlayers: number;
  maxUniquePlayers: number;
  editionUniqueReached: boolean;
}

const toast = useToast();

const { data: availability, refresh } = await useFetch<AvailabilityResponse>(
  "/api/6-reds-summer-cup/availability"
);

const selectedPlayDayId = ref<string | null>(null);
const name = ref("");
const email = ref("");

const selectedDay = computed(() =>
  availability.value?.playDays.find((d) => d.id === selectedPlayDayId.value)
);

const canSelect = (day: AvailabilityDay) =>
  !day.full && !day.past && !(availability.value?.editionUniqueReached ?? false);

const qrDataUrl = ref<string | null>(null);

watchEffect(async () => {
  const day = selectedPlayDayId.value ? getPlayDay(selectedPlayDayId.value) : null;
  if (day && name.value.trim()) {
    const payload = buildEpcQrPayload({
      name: name.value,
      shortLabel: day.shortLabel,
      amount: REGISTRATION_FEE,
    });
    qrDataUrl.value = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 256,
    });
  } else {
    qrDataUrl.value = null;
  }
});

const communication = computed(() => {
  const day = selectedPlayDayId.value ? getPlayDay(selectedPlayDayId.value) : null;
  if (!day || !name.value.trim()) return "";
  return `6RSC ${name.value.trim()} - ${day.shortLabel}`;
});

const submitting = ref(false);
const confirmation = ref<null | { name: string; playDayLabel: string; communication: string; id: number }>(
  null
);

const canSubmit = computed(
  () => !!selectedPlayDayId.value && !!name.value.trim() && !!email.value.trim() && !!qrDataUrl.value
);

const register = async () => {
  if (submitting.value || !canSubmit.value) return;
  submitting.value = true;

  const qrCodeBase64 = qrDataUrl.value!.replace(/^data:image\/png;base64,/, "");

  try {
    const res = await $fetch("/api/6-reds-summer-cup/registrations", {
      method: "POST",
      body: {
        playDayId: selectedPlayDayId.value,
        name: name.value,
        email: email.value,
        qrCodeBase64,
      },
    });

    confirmation.value = {
      id: res.id,
      name: res.name,
      playDayLabel: res.playDayLabel,
      communication: res.communication,
    };
  } catch (response) {
    const message =
      (response as any)?.data?.error ??
      "Er ging iets mis tijdens het inschrijven. Probeer het later opnieuw.";
    const errorToast: Partial<Toast> = {
      title: "Mislukt!",
      description: message,
      color: "error",
    };
    toast.add(errorToast);
    await refresh();
  } finally {
    submitting.value = false;
  }
};

const resetForm = async () => {
  confirmation.value = null;
  selectedPlayDayId.value = null;
  name.value = "";
  email.value = "";
  await refresh();
};
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- Confirmation -->
    <div v-if="confirmation" class="flex flex-col gap-4">
      <u-alert
        title="Ingeschreven!"
        :description="`Je inschrijving voor ${confirmation.playDayLabel} is geregistreerd. We hebben een bevestigingsmail gestuurd naar ${email}.`"
        color="success"
        variant="subtle"
      />
      <h2>Betaling</h2>
      <p>
        Schrijf <span class="font-semibold">&euro; {{ REGISTRATION_FEE }}</span> over vóór de
        speeldag om je plaats te bevestigen.
      </p>
      <div class="flex flex-col gap-1">
        <p><span class="font-semibold">Begunstigde</span>: {{ payment.beneficiary }}</p>
        <p><span class="font-semibold">IBAN</span>: {{ payment.iban }}</p>
        <p><span class="font-semibold">BIC</span>: {{ payment.bic }}</p>
        <p><span class="font-semibold">Mededeling</span>: {{ confirmation.communication }}</p>
      </div>
      <img
        :src="`/api/6-reds-summer-cup/registrations/${confirmation.id}/qr.png`"
        alt="Betaal-QR-code"
        width="220"
        height="220"
        class="bg-white p-2 rounded"
      />
      <u-button
        class="flex-1"
        label="Nieuwe inschrijving"
        size="xl"
        color="neutral"
        variant="ghost"
        @click="resetForm()"
      />
    </div>

    <!-- Form -->
    <div v-else class="flex flex-col gap-8">
      <u-alert
        v-if="availability?.editionUniqueReached"
        title="Volzet"
        description="Het maximum aantal unieke deelnemers (16) voor editie 2026 is bereikt. Inschrijven is niet meer mogelijk."
        color="warning"
        variant="subtle"
      />

      <div class="flex flex-col gap-4">
        <h2>Kies je speeldag</h2>
        <div class="flex flex-col gap-3">
          <u-button
            v-for="day in availability?.playDays"
            :key="day.id"
            class="justify-between"
            size="xl"
            :color="day.id === selectedPlayDayId ? 'primary' : 'neutral'"
            :variant="day.id === selectedPlayDayId ? 'solid' : 'outline'"
            :disabled="!canSelect(day)"
            @click="selectedPlayDayId = day.id"
          >
            <span>{{ day.label }} — {{ PLAY_TIME }}u</span>
            <span v-if="day.past">Voorbij</span>
            <span v-else-if="day.full">Volzet</span>
            <span v-else>nog {{ day.remaining }}/{{ day.capacity }}</span>
          </u-button>
        </div>
      </div>

      <div v-if="selectedPlayDayId" class="flex flex-col gap-4">
        <h2>Je gegevens</h2>
        <u-form-field class="flex-1" label="Naam" size="xl" :required="true">
          <u-input class="w-full" v-model="name" name="name" placeholder="Voor- en achternaam" />
        </u-form-field>
        <u-form-field class="flex-1" label="E-mailadres" size="xl" :required="true">
          <u-input
            class="w-full"
            v-model="email"
            name="email"
            type="email"
            placeholder="E-mailadres"
          />
        </u-form-field>
      </div>

      <div v-if="selectedPlayDayId && name.trim() && email.trim()" class="flex flex-col gap-4">
        <h2>Overzicht & betaling</h2>
        <p><span class="font-semibold">Speeldag</span>: {{ selectedDay?.label }} — {{ PLAY_TIME }}u</p>
        <p><span class="font-semibold">Naam</span>: {{ name }}</p>
        <p><span class="font-semibold">E-mail</span>: {{ email }}</p>
        <p><span class="font-semibold">Inschrijvingsgeld</span>: &euro; {{ REGISTRATION_FEE }}</p>
        <div class="flex flex-col gap-1">
          <p><span class="font-semibold">Begunstigde</span>: {{ payment.beneficiary }}</p>
          <p><span class="font-semibold">IBAN</span>: {{ payment.iban }}</p>
          <p><span class="font-semibold">BIC</span>: {{ payment.bic }}</p>
          <p><span class="font-semibold">Mededeling</span>: {{ communication }}</p>
        </div>
        <img
          v-if="qrDataUrl"
          :src="qrDataUrl"
          alt="Betaal-QR-code"
          width="220"
          height="220"
          class="bg-white p-2 rounded"
        />
        <p class="text-sm opacity-80">
          Betaling gebeurt vóór de speeldag en bevestigt je inschrijving. Je ontvangt deze
          gegevens ook per e-mail.
        </p>
        <u-button
          :disabled="!canSubmit || submitting"
          :loading="submitting"
          class="flex-1"
          label="Inschrijven"
          size="xl"
          @click="register()"
        />
      </div>
    </div>
  </div>
</template>

<style></style>
```

- [ ] **Step 3: Type-check / build sanity**

Run: `npx nuxt prepare`
Expected: no errors. (Full visual verification happens in the next task.)

- [ ] **Step 4: Commit**

```bash
git add app/components/SummerCupRegistration.vue package.json pnpm-lock.yaml
git commit -m "Add 6 Reds SummER Cup registration component"
```

---

## Task 12: Tournament page (`6-reds-summer-cup.vue`)

**Files:**
- Create: `app/pages/6-reds-summer-cup.vue`

- [ ] **Step 1: Create the page**

```vue
<script setup lang="ts">
import { playDays, finaleDay, MIN_PER_PLAY_DAY, MAX_PER_PLAY_DAY, MAX_UNIQUE_PLAYERS, REGISTRATION_FEE, PLAY_TIME } from "#shared/data/summerCup";

useSeoMeta({
  title: "6 Reds SummER Cup 2026",
  description:
    "Recreatieve zomercompetitie in 6 Reds snookerformaat bij Play-ER in Beverlo. Bekijk het reglement en schrijf je in voor een speeldag.",
});
</script>

<!-- eslint-disable vue/no-multiple-template-root -->
<template>
  <section id="hero" class="w-full shadow-lg">
    <div class="mx-auto max-w-6xl px-8 h-[220px] md:h-[320px] flex flex-col items-center justify-center gap-4 text-center text-white">
      <h1 class="text-shadow-lg">6 REDS SUMMER CUP 2026</h1>
      <p class="text-lg">Recreatieve zomercompetitie 6 Reds snooker · juni – augustus 2026</p>
    </div>
  </section>

  <section id="uitleg" class="w-full shadow-lg">
    <div class="mx-auto max-w-6xl px-8 py-16 flex flex-col gap-12">
      <div class="flex flex-col gap-4">
        <h1>HET TOERNOOI</h1>
        <p>
          De 6 Reds SummER Cup 2026 is een recreatieve zomercompetitie in 6 Reds snookerformaat,
          georganiseerd over meerdere toernooiedities gedurende de zomer van 2026. Het toernooi is
          enkel georganiseerd voor leden van Play-ER.
        </p>
        <p>
          Er wordt gespeeld om de twee weken, telkens op woensdag en vrijdag vanaf {{ PLAY_TIME }}u.
          De eerste speeldag vindt plaats op woensdag 17 juni 2026.
        </p>
      </div>

      <div class="flex flex-col gap-4">
        <h2>Kalender</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-gray-600">
                <th class="py-2 pr-4">Toernooi</th>
                <th class="py-2 pr-4">Woensdag</th>
                <th class="py-2">Vrijdag</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-gray-700"><td class="py-2 pr-4">Toernooi 1</td><td class="py-2 pr-4">woe 17 juni 2026</td><td class="py-2">vrij 19 juni 2026</td></tr>
              <tr class="border-b border-gray-700"><td class="py-2 pr-4">Toernooi 2</td><td class="py-2 pr-4">woe 1 juli 2026</td><td class="py-2">vrij 3 juli 2026</td></tr>
              <tr class="border-b border-gray-700"><td class="py-2 pr-4">Toernooi 3</td><td class="py-2 pr-4">woe 15 juli 2026</td><td class="py-2">vrij 17 juli 2026</td></tr>
              <tr class="border-b border-gray-700"><td class="py-2 pr-4">Toernooi 4</td><td class="py-2 pr-4">woe 29 juli 2026</td><td class="py-2">vrij 31 juli 2026</td></tr>
              <tr><td class="py-2 pr-4 font-semibold">Finaledag</td><td class="py-2 pr-4">—</td><td class="py-2 font-semibold">vrij 14 augustus 2026</td></tr>
            </tbody>
          </table>
        </div>
        <p class="text-sm opacity-80">Alle speeldagen starten om {{ PLAY_TIME }}u.</p>
      </div>

      <div class="flex flex-col gap-4">
        <h2>Inschrijvingen &amp; plaatsen</h2>
        <ul class="list-disc ps-6 flex flex-col gap-2">
          <li>Per toernooi zijn er twee afzonderlijke speeldagen: woensdag en vrijdag.</li>
          <li>Spelers mogen deelnemen aan één speeldag per toernooi OF aan beide indien er nog plaatsen beschikbaar zijn (enkel je beste resultaat telt en spelers die nog niet speelden, krijgen voorrang).</li>
          <li>Minimum {{ MIN_PER_PLAY_DAY }} en maximum {{ MAX_PER_PLAY_DAY }} deelnemers per speeldag.</li>
          <li>Maximum {{ MAX_UNIQUE_PLAYERS }} unieke deelnemers voor de editie 2026.</li>
        </ul>
      </div>

      <div class="flex flex-col gap-4">
        <h2>Inschrijvingsgeld</h2>
        <ul class="list-disc ps-6 flex flex-col gap-2">
          <li>Het inschrijvingsgeld bedraagt &euro; {{ REGISTRATION_FEE }} per speelavond.</li>
          <li>Betaling gebeurt vóór aanvang van de speeldag om je inschrijving te bevestigen, op het rekeningnummer dat je in de bevestigingsmail ontvangt.</li>
          <li>Een deel van het inschrijvingsgeld is voor de huur van de tafels. Met het andere deel worden prijzen voorzien (cash, drankkaarten, …).</li>
        </ul>
      </div>

      <div class="flex flex-col gap-4">
        <h2>Wedstrijdformat</h2>
        <ul class="list-disc ps-6 flex flex-col gap-2">
          <li>Iedere speeldag wordt gespeeld in 1 poule.</li>
          <li>Iedere speler speelt tegen iedere andere speler.</li>
          <li>Bij 4 of 5 deelnemers worden wedstrijden gespeeld over 2 frames.</li>
          <li>Bij meer dan 5 deelnemers worden wedstrijden gespeeld over 1 frame.</li>
        </ul>
      </div>

      <div class="flex flex-col gap-4">
        <h2>Puntensysteem en ranking</h2>
        <ul class="list-disc ps-6 flex flex-col gap-2">
          <li>Iedere deelnemer ontvangt 2 deelnamepunten per speeldag.</li>
          <li>Daarnaast ontvangt iedere speler rankingpunten op basis van zijn eindpositie.</li>
          <li>Het aantal punten voor de winnaar is gelijk aan het aantal deelnemers, telkens één punt minder voor de volgende plaats.</li>
          <li>De top 2 van iedere speeldag ontvangt telkens 1 extra bonuspunt.</li>
        </ul>
        <p class="font-semibold">Voorbeeld bij 7 deelnemers</p>
        <p class="text-sm opacity-90">
          1e plaats: 8 punten · 2e plaats: 7 punten · 3e plaats: 5 punten · 4e plaats: 4 punten ·
          5e plaats: 3 punten · 6e plaats: 2 punten · 7e plaats: 1 punt. Bovenstaande punten komen
          bovenop de 2 deelnamepunten.
        </p>
      </div>

      <div class="flex flex-col gap-4">
        <h2>Rangschikking tijdens een speeldag</h2>
        <p>
          Het aantal gewonnen frames bepaalt je plaats in de rangschikking van de speelavond
          (poule). Bij ex aequo wordt van boven naar beneden afgegaan:
        </p>
        <ol class="list-decimal ps-6 flex flex-col gap-2">
          <li>Aantal gewonnen frames</li>
          <li>Aantal gewonnen wedstrijden</li>
          <li>Onderling resultaat</li>
          <li>Black ball game (BO3)</li>
          <li>Indien na de BBG nog steeds gelijk: op en neer spelen over één band. Wie het dichtst bij de bovenband ligt, eindigt het hoogst.</li>
        </ol>
      </div>

      <div class="flex flex-col gap-4">
        <h2>Finaledag</h2>
        <p>
          De beste 8 spelers uit de algemene Summer Ranking plaatsen zich voor de finaledag op
          {{ finaleDay.shortLabel }}. Het exacte format van de finaledag wordt later bekendgemaakt.
        </p>
      </div>

      <div class="flex flex-col gap-4">
        <h2>(Gedrags)regels en andere</h2>
        <ul class="list-disc ps-6 flex flex-col gap-2">
          <li>Van alle deelnemers wordt sportief en respectvol gedrag verwacht. Onsportief gedrag kan leiden tot waarschuwing, puntenaftrek of uitsluiting.</li>
          <li>Een frame is afgelopen vanaf dat je méér dan 3 snookers nodig hebt nadat de laatste rode bal is gepot. Dit om de avond vlot te laten verlopen en nachtwerk te vermijden.</li>
          <li>Er wordt gewerkt met een aangepast handicapsysteem: spelers uit eerste afdeling en hoger starten op 0 punten, spelers uit 2e en 3e afdeling op 5 punten, spelers uit 4e en 5e afdeling op 10 punten. Voor spelers met een reservestatuut wordt vooraf in eer en geweten bepaald wat de startscore is.</li>
        </ul>
      </div>

      <div class="flex flex-col gap-4">
        <h2>Organisatie</h2>
        <p>
          De organisatie behoudt zich het recht voor om planning of formats aan te passen indien
          nodig. Door deelname aan de 6 Reds SummER Cup 2026 verklaart iedere speler zich akkoord
          met dit reglement.
        </p>
      </div>

      <div class="flex flex-col gap-4">
        <h2>Rangschikking</h2>
        <u-alert
          title="Binnenkort"
          description="De rangschikking van de deelnemers wordt later toegevoegd."
          color="neutral"
          variant="subtle"
        />
      </div>
    </div>
  </section>

  <section id="inschrijven" class="w-full shadow-lg">
    <div class="mx-auto max-w-6xl px-8 py-16 flex flex-col gap-8">
      <h1>INSCHRIJVEN</h1>
      <summer-cup-registration />
    </div>
  </section>
</template>

<style scoped>
@reference "./../assets/css/main.css";

section#hero,
section#uitleg,
section#inschrijven {
  @apply bg-neutral-500 text-white;
}

section#hero {
  background: radial-gradient(circle, rgba(102, 102, 102, 1) 0%, rgba(50, 48, 49, 1) 75%);
}

section#inschrijven {
  background-color: #323031;
}
</style>
```

- [ ] **Step 2: Visually verify the page**

With the dev server running, open `http://localhost:3000/6-reds-summer-cup`.
Expected:
- A short hero (clearly shorter than the homepage hero).
- All rules sections render with the calendar table.
- The "Kies je speeldag" list shows 8 play days each with "nog 8/8".
- Selecting a day + typing a name shows the overview with a rendered QR code and payment block.

(Optional automated check — confirm the route exists:)
Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/6-reds-summer-cup`
Expected: `200`.

- [ ] **Step 3: Commit**

```bash
git add app/pages/6-reds-summer-cup.vue
git commit -m "Add 6 Reds SummER Cup tournament page"
```

---

## Task 13: End-to-end verification (with a real Brevo key)

**Files:** none (verification + docs)

> Requires a valid `NUXT_BREVO_API_KEY` in `.env` (the user adds it). The Brevo sender `snooker@play-er.be` must be a verified sender in Brevo.

- [ ] **Step 1: Add the Brevo key and restart dev**

Add to `.env`: `NUXT_BREVO_API_KEY=<key>`
Restart: `pnpm dev`

- [ ] **Step 2: Register via the UI**

On `/6-reds-summer-cup`: pick a future play day, enter a real name + an inbox you control, submit.
Expected:
- On-page success alert with payment block + QR.
- A confirmation email arrives at the entered address, with the QR visible (inline) and as an attachment; `snooker@play-er.be` receives the BCC copy.

- [ ] **Step 3: Confirm persistence + idempotency**

Run: `curl -s http://localhost:3000/api/6-reds-summer-cup/availability`
Expected: the chosen day now shows `registered: 1`, `remaining: 7`; `uniquePlayers: 1`.

Re-submit the same name/email/day.
Expected: error toast "Je bent al ingeschreven voor deze speeldag." (HTTP 409), and availability unchanged.

- [ ] **Step 4: Confirm rollback on email failure**

Temporarily set `NUXT_BREVO_API_KEY` to an invalid value, restart, and register with a new email.
Expected: error toast about the mail not being sent (HTTP 502), and `availability` does **not** increment (row rolled back). Restore the valid key afterwards.

- [ ] **Step 5: Run the unit suite + build**

Run: `pnpm test`
Expected: all tests pass.
Run: `pnpm build`
Expected: build succeeds (migrations applied, no type errors).

- [ ] **Step 6: Production config reminder (user action)**

The Brevo key is a **secret** — do not put it in `wrangler.json` `vars`. Set it as a Cloudflare secret for the Worker (e.g. `npx wrangler secret put NUXT_BREVO_API_KEY`, and the same for the `preview` env) or via the Cloudflare dashboard. Verify the `snooker@play-er.be` sender in Brevo.

---

## Self-review notes (author)

- **Spec coverage:** page/routing (T12) · shorter hero (T12) · rules content (T12) · register-while-space (T8/T10) · per-day max 8 + edition max 16 unique + duplicate + past (T4/T10) · EPC QR client-side + base64 to API (T11) · QR in email via served URL + attachment (T5/T9/T10) · Brevo to-email + BCC snooker@play-er.be + reply-to + sender (T7/T10) · atomic registration+email with rollback (T10) · `NUXT_BREVO_API_KEY` + `.env.example` (T7) · shared payment/calendar data (T2) · ranking out of scope placeholder (T12). All covered.
- **Placeholder scan:** none — every code/test step contains full content.
- **Type consistency:** `checkRegistrationAllowed`/`RegistrationDenyReason`, `buildCommunication`/`buildEpcQrPayload`, `buildConfirmationEmail`, `sendTransactionalEmail`, `summerCupRegistrations`, and the availability response shape are used consistently across tasks.
