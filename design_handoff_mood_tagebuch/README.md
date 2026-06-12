# Handoff: Mood Tagebuch PWA

## Overview

**Mood Tagebuch** is a Progressive Web App (PWA) for daily self-tracking, designed primarily for people managing a health condition that requires medication titration (e.g. ADHD). The app combines:

- **Daily journal** — free-text diary entry per day
- **Mood & wellness tracking** — mood, energy, sleep, weight, sport, stress, water intake, period
- **Medication logging** — time-stamped entries with dosage in 10 mg steps
- **Titration monitoring** — daily symptom & side-effect rating (0–10) during medication titration phases, with weekly averages

The app is designed to work **completely offline** with all data stored locally on the device. No server or account is required.

---

## About the Design Files

The files included in this bundle (`Mood Tagebuch Mockup v2.html`) are **high-fidelity HTML design prototypes** created in this conversation. They are **not production code** — they are browser-renderable design references showing the intended look, feel, and information hierarchy.

Your task is to **recreate these designs as a real PWA** from scratch. Since no codebase exists yet, you are free to choose the most appropriate framework and toolchain. The recommended stack is detailed below.

---

## Fidelity

**High-fidelity.** The mockup shows:
- Final color palette, typography, spacing, and border radii
- Final copy (German language throughout)
- Realistic dummy data in all screens
- Final navigation structure (bottom tab bar, 4 tabs)
- Final component layout for all 6 screens

Recreate the UI **pixel-accurately** from the reference file.

---

## Recommended Tech Stack

Since this is a new project, use the following:

| Layer | Choice | Reason |
|---|---|---|
| Framework | **React 18 + Vite** | Fast dev setup, excellent PWA support |
| Language | **TypeScript** | Type-safe data models for health data |
| Routing | **React Router v6** | Tab-based navigation |
| Local storage | **Dexie.js** (IndexedDB wrapper) | Reliable, indexed, offline-first |
| PWA | **vite-plugin-pwa** | Auto service worker + manifest |
| Charts | **Recharts** | React-native, lightweight |
| Styling | **CSS Modules** or plain inline styles | No extra dep; follows the design token system |
| Fonts | Google Fonts: **DM Sans** + **Newsreader** | Used in the design |

```
npm create vite@latest mood-tagebuch -- --template react-ts
cd mood-tagebuch
npm install react-router-dom dexie recharts
npm install -D vite-plugin-pwa
```

---

## Design Tokens

All values used consistently throughout the app:

### Colors
```css
--color-bg:         oklch(97% 0.012 55);   /* warm paper background */
--color-card:       oklch(99% 0.006 55);   /* card / sheet surface */
--color-accent:     oklch(60% 0.14 345);   /* mauve/rose — primary action */
--color-accent-bg:  oklch(95% 0.055 345);  /* accent tint for highlights */
--color-text:       oklch(22% 0.025 55);   /* primary text */
--color-muted:      oklch(55% 0.02 55);    /* secondary/label text */
--color-subtle:     oklch(78% 0.015 55);   /* inactive icons */
--color-border:     oklch(91% 0.01 55);    /* card borders, dividers */
--color-green:      #4A9070;               /* success / medication taken */
--color-green-bg:   #E6F4EE;
```

### Mood Color Scale
| Index | Label | Dot Color | Background |
|---|---|---|---|
| 0 | Mies | `#B85C5C` | `#FAEAEA` |
| 1 | Schlecht | `#C47A40` | `#FAF0E4` |
| 2 | Ok | `#B89A30` | `#F8F5DC` |
| 3 | Gut | `#4A8AB0` | `#E6F0F8` |
| 4 | Super | `#4A9070` | `#E6F4EE` |

### Period Colors
```
Intensity chip (selected): color #C04060, background #FAEAEA, border 1.5px solid #C04060
Calendar dot: background #C04060, 5×5 px, border-radius 3px
```

### Eindosierung Colors
```
Hauptsymptome selected cell: var(--color-accent) — mauve
Nebenwirkungen selected cell: #C47A40 — amber
```

### Typography
```css
--font-sans:  "DM Sans", system-ui, sans-serif;
--font-serif: "Newsreader", Georgia, serif;
```

| Usage | Font | Size | Weight |
|---|---|---|---|
| Screen title (Heute screen) | DM Sans | 20px | 600 |
| Section labels (UPPERCASE) | DM Sans | 9–11px | 600, letter-spacing 0.06–0.09em |
| Metric value | DM Sans | 20–22px | 600 |
| Body text | DM Sans | 13–14px | 400 |
| Journal screen headers | Newsreader | 22–26px | 300 (light) |
| Journal pull quote | Newsreader | 16px | 400 italic |
| Journal body text | Newsreader | 15px | 400, line-height 1.9 |

### Spacing
- Screen horizontal padding: `20px` (A-style) / `24px` (B-style)
- Card border-radius: `16px` (full cards) / `12–14px` (smaller cards) / `10px` (inline items)
- Card padding: `12–14px` vertical, `14–15px` horizontal
- Gap between metric grid cells: `8px`
- Section gap: `12–13px`

### Border
All cards: `1px solid var(--color-border)`
Active/highlighted card: `1.5px solid <accent-color>`

### Shadows (iOS device frame only — not needed in the actual app)
Not used in app UI itself.

---

## Navigation

**Bottom tab bar** — 4 tabs, always visible:

| Index | Label | Icon (Feather) | Route |
|---|---|---|---|
| 0 | Heute | `home` | `/` |
| 1 | Verlauf | `calendar` | `/verlauf` |
| 2 | Statistiken | `bar-chart-2` | `/statistiken` |
| 3 | Eindosierung | `clipboard` | `/eindosierung` |

Tab bar height: `~60px` + bottom safe area padding  
Active tab: `var(--color-accent)` icon + label  
Inactive tab: `var(--color-subtle)` icon + label  
Background: `var(--color-card)` with `border-top: 1px solid var(--color-border)`

---

## Data Models

```typescript
// One entry per calendar day
interface DailyEntry {
  id?: number;                    // auto-increment (Dexie)
  date: string;                   // ISO 8601: "2026-06-12"
  mood: 0 | 1 | 2 | 3 | 4;       // 0=Mies … 4=Super
  energy: number;                 // 0–10
  sleepHours: number;             // e.g. 7.5
  sleepQuality: 'schlecht' | 'mittel' | 'gut';
  weight?: number;                // kg, e.g. 73.2
  sportMinutes?: number;
  water?: number;                 // litres, e.g. 1.8
  stress: number;                 // 0–10
  diaryText?: string;
  medications: MedicationDose[];
  period?: PeriodEntry;
}

interface MedicationDose {
  time: string;     // "HH:MM", e.g. "08:00"
  doseMg: number;   // multiples of 10: 10, 20, 30 …
}

interface PeriodEntry {
  intensity: 'keine' | 'leicht' | 'mittel' | 'stark';
  cycleDay?: number;  // calculated from last period start
}

// One record per day during titration phase
interface EindosierungEntry {
  id?: number;
  date: string;       // ISO 8601
  week: number;       // titration week number (1, 2, 3 …)
  symptoms: EindosierungSymptom[];
}

interface EindosierungSymptom {
  name: string;   // exact German label (see list below)
  value: number;  // 0–10
  group: 'haupt' | 'neben';
}
```

### Symptom lists (fixed order)

**Hauptsymptome (group: 'haupt'):**
1. Aufmerksamkeitsstörung
2. Impulsivität
3. Unorganisiertes Verhalten
4. Prokrastination

**Nebenwirkungen (group: 'neben'):**
1. Innere Unruhe
2. Stimmungswechsel
3. Reizbarkeit / Wutausbrüche
4. Müdigkeit
5. Schlafstörungen
6. Übelkeit
7. Schwindel
8. Appetitlosigkeit

### Dexie Schema
```typescript
class MoodDB extends Dexie {
  dailyEntries!: Table<DailyEntry>;
  eindosierungEntries!: Table<EindosierungEntry>;

  constructor() {
    super('MoodTagebuch');
    this.version(1).stores({
      dailyEntries: '++id, date',
      eindosierungEntries: '++id, date, week',
    });
  }
}
```

---

## Screens

### Screen 01 — Heute (`/`)

**Purpose:** Create or edit today's daily entry.

**Layout** (scrollable, padding-top 62px for status bar area):

1. **Header row** — `padding: 14px 20px 12px`, flex row space-between
   - Left: date string (12px muted) + greeting with moon emoji (20px bold)
   - Right: avatar circle 38×38px, `border-radius: 19px`, accent background, user initial

2. **Mood selector card** — `margin: 0 20px 12px`, full card
   - Label "Wie war dein Tag?" (11px 600)
   - 5 emoji chips in a row, equal flex, `border-radius: 10px`
   - Selected chip: colored background + colored border + bold label
   - Unselected: transparent

3. **Metrics grid** — `padding: 0 20px`, `display: grid`, `grid-template-columns: 1fr 1fr`, `gap: 8px`, `margin-bottom: 12px`
   - 6 MetricCards: Schlaf, Energie, Gewicht, Sport, Stress, Wasser
   - Each MetricCard: icon (12px) + label (9px uppercase) + value (20px bold) + unit (11px muted) + optional note (10px muted)

4. **Periode card** — `margin: 0 20px 12px`, full card
   - Header: 🩸 icon + "PERIODE" label + right side shows "Zyklus-Tag N" + phase pill
   - 4 intensity chips: Keine / Leicht / Mittel / Stark
   - Selected intensity: `#C04060` accent, background `#FAEAEA`
   - Phase pill colors: Menstruation = `#B85C5C` on `#FAEAEA`

5. **Medikamente card** — `margin: 0 20px 12px`, full card
   - Header: pill icon + "MEDIKAMENTE" + circular "+" button (22×22, accent bg)
   - List of existing dose entries:
     - Each row: `border-radius: 10px`, green left-border strip (6px wide, `#4A9070`)
     - Clock icon + time (13px bold) + "Uhr" label + spacer + **dose (14px bold accent)** + × button
   - "Neue Einnahme" section (below border-top divider):
     - Time picker (flex:1) + Dose stepper (−, value, +) in a row
     - Stepper: left button (34×38, border-right), center label (14px bold accent), right + button (34×38, accent bg)
     - "Hinzufügen" button below, full width, `border-radius: 10px`, accent background

6. **Diary preview card** — `margin: 0 20px 12px`
   - Label "Mein Tag" + placeholder text (italic, muted), `min-height: 48px`
   - Tapping opens a text editor (full-screen modal or expanded view)

7. **"Eintrag speichern" button** — `padding: 0 20px 14px`, full width, accent background, `border-radius: 14px`

---

### Screen 02 — Kalender (`/verlauf`)

**Purpose:** Monthly overview of all entries, with mood color and period indicators.

**Layout** (B-style, background `#FEFCFA`):

1. **Header** — `padding: 16px 24px`, serif italic subtitle + serif h1 "Juni 2026" (26px, weight 300) + `‹` `›` nav arrows (22px)

2. **Weekday header row** — `padding: 10px 16px 6px`, 7-column grid, `font-size: 11px`, muted

3. **Calendar grid** — `padding: 0 16px`, flex column, `gap: 4px`
   - 5 week rows, each a 7-column CSS grid with `gap: 4px`
   - Each day cell: `height: 56px`, `border-radius: 8px`
   - Background: mood color (`MOODS[mood].bg`) if entry exists, else `oklch(97% 0.008 55)` tint; transparent if no day
   - Today: `border: 1.5px solid var(--color-accent)`, date in accent color
   - Day number: serif font, 13px, weight 300 (or 600 for today)
   - Mood emoji: 10px (visible only if entry exists)
   - **Period indicator**: `position: absolute`, top-right corner, 5×5px circle, `#C04060`, shown on period days

4. **Legend** — `padding: 12px 24px 8px`, border-top, flex row with emoji + label per mood level. Add period dot + "Periode" to legend.

---

### Screen 03 — Eintrag Detail (`/verlauf/:date`)

**Purpose:** View a specific day's full entry. Read-only with edit button.

**Layout** (B-style, background `#FEFCFA`):

1. **Navigation header** — back arrow + serif date (italic weekday + date) + mood emoji (24px), right-aligned
2. **Pull quote** — `margin: 20px 24px 18px`, `padding-left: 16px`, `border-left: 3px solid var(--color-accent)`, serif italic 16px
3. **Metric strip** — `padding: 0 24px 18px`, flex row wrap, `gap: 18px`, `border-bottom`
   - Pairs: icon (14px accent) + value text (12px bold)
   - Metrics shown: Schlaf, Energie, Sport, Stress, Gewicht, Medikament-Dosis
   - Period: 🩸 emoji + "Intensität · Tag N"
4. **Diary text** — `padding: 18px 24px`, serif 15px, `line-height: 1.9`, broken into paragraphs

---

### Screen 04 — Statistiken (`/statistiken`)

**Purpose:** Weekly/monthly overview of all tracked metrics.

**Layout** (B-style, background `#FEFCFA`):

1. **Header** — serif italic "Einblicke" + serif "Diese Woche" (26px weight 300)
2. **Period tabs** — 3 tabs: "7 Tage" / "30 Tage" / "3 Monate". Active: accent underline
3. **Stimmung card** — accent-tinted background, mood emojis for each weekday (Mo–Fr), grey circles for Sa/So if no entry
4. **Metric rows** — icon + label + sub-label (muted, 11px) + value (right-aligned, 15–16px bold)
   - Durchschn. Schlaf
   - Energie-Schnitt (with delta vs. last period)
   - Gewicht (with delta)
   - Medikamenten-Dosis
   - Eindosierung Woche + next assessment date

---

### Screen 05 — Eindosierung Tageseintrag (`/eindosierung`)

**Purpose:** Rate today's ADHD symptoms and side effects on a 0–10 scale.

**Layout** (B-style, background `#FEFCFA`):

1. **Header** — serif italic "Woche N der Eindosierungsphase" + serif date (22px weight 300)

2. **Week progress row** — `padding: 11px 16px`, 7 equal columns (Mo–So)
   - Each: day label (9px muted) + 28×28 circle
   - Done: `#4A9070` (green) with white checkmark icon
   - Today: `var(--color-accent)` with "H" label
   - Future: `var(--color-border)` grey, empty

3. **Tab bar** — "Tageseintrag" | "Wochenschnitt", accent underline on active tab

4. **Scale hint bar** — small row: "0 = nicht vorhanden" ←→ "10 = sehr stark", `background: var(--color-bg)`

5. **Hauptsymptome section**:
   - Section label: 10px bold accent uppercase "HAUPTSYMPTOME (ADHS)"
   - Card container: `border-radius: 12px`, border, `background: var(--color-card)`, overflow hidden
   - Each symptom row: `padding: 11px 14px 12px`, name (13px 600 text) + number row below

6. **Nebenwirkungen section**:
   - Section label: 10px bold `#C47A40` uppercase "NEBENWIRKUNGEN"
   - Same card structure, but selected cell color is `#C47A40`

7. **Number row** (0–10 selector):
   - `display: flex`, `border-radius: 8px`, `overflow: hidden`, `border: 1px solid var(--color-border)`
   - 11 equal flex cells, `height: 28px`
   - Each cell: `border-right: 1px solid var(--color-border)` (except last)
   - Selected: filled with group color (accent or `#C47A40`), white bold text
   - Unselected: transparent, muted text (11px)

8. **Tagessumme card** — accent-tinted, large sum number (32px bold accent) right-aligned

9. **"Heute speichern" button** — full width, accent background

---

### Screen 06 — Eindosierung Wochenschnitt (tab within `/eindosierung`)

**Purpose:** View weekly averages for each symptom after all days are filled in.

**Layout** (same header + week progress + tabs as Screen 05, Wochenschnitt tab active):

1. **Legend bar** — colored square = "eingetragen" / grey = "noch offen" + "N / 7 Tage" right

2. **Avg rows** per symptom:
   - Left: symptom name (12px, bold for Haupt) + row of 7 small squares (20×20px, `border-radius: 5px`)
     - Filled days: group color with opacity proportional to value (0.4 + value/10 * 0.6)
     - Filled days show the value number (9px white bold) inside
     - Unfilled days: `var(--color-border)` with opacity 0.25
   - Right: `Ø X.X` (18px bold group color) + "Ø / Tag" label (9px muted)

3. **Ø Wochensumme card** — same style as Tagessumme but shows calculated average

---

## Interactions & Behavior

### Today Screen
- Mood chip: tap to select, one at a time; saves immediately
- Metric values: tap to open inline number input (or platform-native picker for time/numbers)
- Periode intensity chips: tap to toggle; if "Keine" selected, hide cycle day info
- Medication dose stepper: "−" decrements by 10mg (min 10mg), "+" increments by 10mg
- Time picker: system time picker (HTML `<input type="time">` or native equivalent)
- "Hinzufügen": appends new dose to the list; time must be unique
- Dose entry "×" button: removes that dose
- "Eintrag speichern": writes to Dexie, shows success feedback (brief toast)
- If today already has an entry, auto-populate all fields on load

### Calendar
- Tap a day cell → navigate to `/verlauf/:date` (detail view)
- `‹` `›` arrows → change displayed month
- Days without entry are still tappable (navigates to empty detail / redirects to Today if today)

### Eindosierung
- Number row: tap a number to select; deselect by tapping the same number again (→ no value)
- "Heute speichern": saves to `eindosierungEntries` table
- Tab switch: shows same header/progress, swaps content between Tageseintrag and Wochenschnitt
- Wochenschnitt: only shows computed averages for days already saved; incomplete days excluded from average

### Navigation
- Bottom tab bar is always visible (position: fixed or sticky at bottom)
- Active tab highlights with accent color; no animation required (instant)
- Back navigation on detail screen: `history.back()` or router navigate(-1)

---

## PWA Configuration

### `vite.config.ts` (vite-plugin-pwa)
```typescript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Mood Tagebuch',
    short_name: 'Mood',
    description: 'Tägliches Tagebuch für Stimmung, Gesundheit & Medikamente',
    theme_color: '#C4A0B0',  // approx oklch(60% 0.14 345) in hex
    background_color: '#F5F0EC',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'de',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
  },
})
```

### Required app icons
- `public/icon-192.png` — 192×192px
- `public/icon-512.png` — 512×512px

Suggested icon: stylized journal page with a small heart/mood indicator. Use the accent color (`oklch(60% 0.14 345)` ≈ `#C4808E`) as background.

---

## Computed Values

These should be computed at render time, not stored:

| Value | How to compute |
|---|---|
| Zyklus-Tag | Count days from the most recent period start date (first day with `intensity ≠ 'keine'` after a gap) |
| Zyklusphase | Days 1–5: "Menstruation", 6–13: "Follikelphase", 14–15: "Eisprung", 16–28+: "Lutealphase" |
| Ø Wochenschnitt | For each symptom: `sum(values) / count(days with value)` for the current titration week |
| Tagessumme | `symptoms.reduce((a, s) => a + s.value, 0)` |
| Wochensumme average | `allSymptoms.reduce((a, s) => a + s.avg, 0)` |
| Medication streak | Count consecutive days with at least one `medications` entry |

---

## Localization

The app is German-only. All copy is in German as shown in the design. No i18n framework needed.

---

## Files in This Package

| File | Description |
|---|---|
| `README.md` | This document — full implementation spec |
| `Mood Tagebuch Mockup v2.html` | Interactive design reference — open in any browser. All 6 screens visible in the design canvas. Click any artboard to open fullscreen. |

---

## Notes for Claude Code

1. **Start with data layer first** — set up Dexie schema and CRUD helpers before building UI
2. **Screen 01 (Heute)** is the most complex screen — implement it first as it covers most UI patterns
3. The medication stepper and the 0–10 number row are custom components used in multiple places — build them as reusable components early
4. All screens scroll vertically; no horizontal scroll anywhere
5. The app has **no authentication** — single-user, device-local only
6. **No dark mode** required in the first version
7. For the period cycle day calculation, store the titration start date in a separate settings table (simple key-value store in Dexie)
8. The statistics charts (mood trend, sleep bars) can use Recharts `BarChart` and `LineChart` — keep them simple, matching the soft colors from the design tokens
