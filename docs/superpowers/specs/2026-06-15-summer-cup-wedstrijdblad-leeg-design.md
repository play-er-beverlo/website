# 6 Reds SummER Cup — Leeg wedstrijdblad (printable blank match sheet)

**Date:** 2026-06-15
**Status:** Approved (design)

## Goal

Naast het ingevulde wedstrijdblad (dat de ingeschreven spelers van een speeldag
toont) ook een **leeg** wedstrijdblad kunnen afdrukken voor een vrij te kiezen
aantal spelers (4, 5, 6, 7 of 8). Het toernooi-nummer en de datum moeten op het
lege blad kunnen komen — ofwel op scherm ingevuld en mee afgedrukt, ofwel als
blanco lijntjes om met de hand in te vullen.

Bereikbaar via één pagina met keuze:
`/6-reds-summer-cup/wedstrijdblad/leeg`.

Dit bouwt voort op het bestaande ontwerp in
`2026-06-15-summer-cup-wedstrijdblad-design.md`.

## Achtergrond (huidige situatie)

`app/pages/6-reds-summer-cup/wedstrijdblad/[date].vue` rendert het volledige
blad: een legende (`#` · Speler · Startscore), een n×n round-robin matrix met
zwarte diagonaal en `Totaal`-kolom, en een breaks-tabel. De tabellen worden op
maat gemaakt op basis van het aantal ingeschreven spelers (`count`). De
frames-per-match regel staat inline: `count <= 5 ? 2 : 1`. Alle print-CSS
(`@page A4 landscape`, `print-color-adjust`) staat in deze ene pagina.

## Aanpak

**Aanpak A — gedeelde sheet-component (gekozen).** De blad-markup en print-CSS
worden uit `[date].vue` getrokken in een herbruikbare component. De bestaande
pagina vult die met inschrijvingen; een nieuwe pagina vult ze leeg met de
schermkeuzes. Eén bron van waarheid voor lay-out en print-CSS; beide pagina's
blijven dun.

(Verworpen: B — markup dupliceren in een tweede pagina → twee plekken om gelijk
te houden, lay-out/print-CSS lopen uit elkaar. C — de bestaande `[date]`-pagina
generaliseren met een optionele datum → routing/logica wordt rommelig en de
scherm-UI hoort niet thuis op het ingevulde blad.)

## Architectuur

### 1. Gedeelde component

Nieuw: `app/components/SummerCupWedstrijdbladSheet.vue` (platte map met
`SummerCup`-prefix, conform de bestaande componenten zoals
`SummerCupBreaks.vue`), geëxtraheerd uit de huidige `[date].vue`. De component
bezit het volledige printbare blad én alle print-CSS.

**Props:**

- `count: number` — aantal spelers (4–8); bepaalt het aantal rijen in de
  legende/breaks-tabel en de grootte van de n×n matrix.
- `playerNames?: string[]` — optioneel. Wanneer aanwezig wordt per rij de naam
  getoond; ontbreekt de prop of is een element leeg, dan blijft de naamcel
  blanco (handgeschreven). Voor het lege blad wordt de prop weggelaten → alle
  naamcellen blanco.

**Slots:**

- `#header` — de titelregel(s) binnen het blad, naast/onder het logo. Per pagina
  anders ingevuld.
- `#controls` — scherm-only toolbar (`print:hidden`) boven het blad. Standaard
  (fallback) inhoud: de hint "Afdrukken als liggend A4." + een Afdrukken-knop die
  `window.print()` aanroept. De lege pagina vervangt dit slot met de
  aantal-keuze + invulvelden + Afdrukken-knop.

**Inhoud:** legende (`#` · Speler · Startscore met de bestaande caption
"Ere & 1ste: 0, 2de & 3de: 5, 4de & 5de: 10"), de n×n matrix met zwarte
diagonaal en `Totaal`-kolom, en de breaks-tabel (`#` · "Breaks (30+)") — exact
zoals nu. De caption "Telkens N frame(s)" gebruikt `framesPerMatch(count)`.

**Empty-state:** wanneer `count === 0` toont de component "Nog geen
inschrijvingen." in plaats van de tabellen (alleen relevant voor het ingevulde
blad; het lege blad heeft altijd `count >= 4`).

**Print-CSS** (`@page { size: A4 landscape; margin: 12mm }`, de `.diagonal`
zwarte cel, en `print-color-adjust: exact` op het blad) verhuist mee naar de
component, zodat ze op één plek staat.

### 2. Gedeelde helper

De frames-per-match regel verhuist van inline in de pagina naar een pure functie
in `shared/summerCup/wedstrijdblad.ts`:

```ts
/** 4–5 spelers spelen 2 frames per match, 6–8 spelen er 1. */
export function framesPerMatch(count: number): number {
  return count <= 5 ? 2 : 1;
}
```

Gebruikt door de component (caption). Pure functie, dus unit-testbaar.

### 3. Pagina — ingevuld blad (refactor)

`app/pages/6-reds-summer-cup/wedstrijdblad/[date].vue` wordt dun:

- Resolvet de speeldag en haalt de spelers op zoals nu (`playDayFromDateParam` +
  `useFetch('/api/.../play-days/<isoId>/players')`).
- Rendert `<SummerCupWedstrijdbladSheet :count="players.length"
  :player-names="players.map(p => p.name)">` (Nuxt auto-import).
- `#header` = `6 Reds SummER Cup — {{ playDay.label }}`.
- Gebruikt de standaard `#controls` (alleen de Afdrukken-knop).
- Gedrag, URL en uitzicht van het ingevulde blad blijven ongewijzigd.

### 4. Pagina — leeg blad (nieuw)

`app/pages/6-reds-summer-cup/wedstrijdblad/leeg.vue` →
`/6-reds-summer-cup/wedstrijdblad/leeg`.

- `definePageMeta({ layout: false })` en
  `useSeoMeta({ title: "Wedstrijdblad — leeg", robots: "noindex, nofollow" })`,
  net als het ingevulde blad — ongelijst maar publiek, niet gelinkt vanuit nav.
- **Routing:** een statische route (`leeg.vue`) krijgt in Nuxt voorrang op de
  dynamische `[date].vue`, dus `/wedstrijdblad/leeg` matcht de lege pagina. Geen
  conflict.
- **Reactieve state:**
  - `count` (ref, default `8`) — gekozen aantal spelers.
  - `tournament` (ref, "") — vrij tekstveld (bv. "1" of "Toernooi 1").
  - `date` (ref, "") — vrij tekstveld (bv. "woensdag 17 juni 2026"); een vrij
    tekstveld i.p.v. datumkiezer zodat de afgedrukte tekst exact vrij te kiezen
    is.
- **`#controls`** (scherm-only): aantal-spelers-keuze 4–8 (geïtereerd uit
  `MIN_PER_PLAY_DAY`..`MAX_PER_PLAY_DAY`), tekstveld Toernooi, tekstveld Datum,
  Afdrukken-knop (`window.print()`).
- **`#header`** ("allebei mogelijk"): titel `6 Reds SummER Cup`, daaronder twee
  regels `Toernooi: …` en `Datum: …`. Per regel:
  - is het veld ingevuld → toon de getypte tekst;
  - is het veld leeg → toon een blanco onderlijn (`border-b border-black` span
    met voldoende min-breedte) om met de pen in te vullen.
- `<SummerCupWedstrijdbladSheet :count="count">` zonder `player-names` → alle
  naamcellen blanco.

## Testing

- Vitest-test voor `framesPerMatch(count)` toegevoegd aan de bestaande
  `test/summerCup-wedstrijdblad.test.ts`: o.a. `4 → 2`, `5 → 2`, `6 → 1`,
  `8 → 1`.
- De bestaande tests voor `playDayFromDateParam` / `dateParamFromPlayDayId`
  blijven ongewijzigd en moeten blijven slagen.

## Buiten scope

- Geen opslaan/persistentie van de getypte toernooi- en datumwaarden (puur
  scherm → print).
- Geen PDF-generatie.
- Geen authenticatie / toegangscontrole.
- Geen wijziging aan inschrijvingen, de players-API of het databasemodel.
- Geen wijziging aan het uitzicht of gedrag van het ingevulde blad (enkel
  refactor naar de gedeelde component).
