# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

The actual application lives in the **`mood-tagebuch/`** subdirectory — run all npm
commands from there, not from the repo root. The root also holds the source-of-truth
spec and design references:

- `design_handoff_mood_tagebuch/README.md` — the full implementation spec (data models,
  design tokens, per-screen layout, computed-value formulas, PWA config). When pixel
  details, colors, copy, or behavior are in question, this is authoritative.
- `design_handoff_mood_tagebuch/*.html` — high-fidelity HTML mockups of all 6 screens.
- `PLAN.md` — the original setup/decision record.

## Commands (run inside `mood-tagebuch/`)

```bash
npm run dev          # Vite dev server (base "/")
npm test             # Vitest once (CI uses this)
npm run test:watch   # Vitest watch mode
npm run build        # tsc -b && vite build (base "/moodbook/" for GitHub Pages)
npm run lint         # ESLint
npm run preview      # serve the production build locally
```

Run a single test file: `npx vitest run src/lib/compute.test.ts`
(vitest config only collects `src/**/*.test.ts`, `environment: node`).

## What this is

**Mood Tagebuch** — an offline-first, single-user PWA (German UI, no login, no backend)
for daily self-tracking: mood/wellness metrics, medication doses, menstrual cycle, and an
ADHD medication-titration ("Eindosierung") symptom tracker. Primary target is iPhone /
Safari in portrait; all data is device-local in IndexedDB.

## Architecture

The codebase follows a strict **data-layer-first, pure-functions** discipline (see
`PLAN.md` §Entwicklungsprinzipien):

- **`src/db/`** — Dexie/IndexedDB layer. `schema.ts` defines `MoodDB` (tables
  `dailyEntries`, `eindosierungEntries`, and a key-value `settings` table). `entries.ts`,
  `eindosierung.ts`, `settings.ts` are typed CRUD helpers; `backup.ts` does JSON
  export/import (full DB replace, validated by an `app: 'mood-tagebuch'` marker).
  `saveEntry` enforces **one entry per calendar day** (upsert keyed on `date`).
- **`src/lib/compute.ts`** — all derived values as **pure functions** (cycle day & phase,
  medication streak, day/week symptom sums, weekly averages, titration week). These are
  the fragile bits and are unit-tested in `compute.test.ts`. Computed values (e.g.
  `cycleDay`) are **never persisted** — recomputed at render time.
- **`src/lib/date.ts`** — all date math. Always uses **local** dates (`toISO`/`parseISO`
  construct local midnight) to avoid UTC off-by-one bugs. Weeks are **Monday-based**
  (`weekdayIndex`: Mo=0…So=6).
- **`src/lib/constants.ts`** — the canonical ordered lists (`MOODS`, `HAUPT_SYMPTOME`,
  `NEBEN_SYMPTOME`, weekday/month names) and color constants. **Symptom order is fixed**
  and drives both the daily-entry and weekly-average screens — keep order in sync with the
  README spec.
- **`src/types.ts`** — shared data models mirroring the README exactly.
- **`src/components/`** — reusable UI: `DoseStepper` (10 mg steps) and the 0–10 `NumRow`
  are used in multiple screens; plus `BottomNav`, `Screen`, `MetricCard`, `Icon`, `Toast`
  (+ `toast-context.ts`), `BackupSheet`.
- **`src/screens/`** — one file per screen: `Heute` (`/`, most complex), `Kalender`
  (`/verlauf`), `EintragDetail` (`/verlauf/:date`), `Statistiken` (`/statistiken`),
  `Eindosierung` (`/eindosierung`, two tabs = mockup screens 05+06).

### Conventions that matter

- **Routing uses `HashRouter`** (`App.tsx`), deliberately — deep links keep working on
  static hosts (GitHub Pages) and when the installed PWA launches offline.
- **Styling is inline styles + CSS custom properties** defined in `src/styles/tokens.css`
  (despite `PLAN.md` mentioning CSS Modules, none are used). Tokens are themable `:root`
  variables; there is no dark mode in V1.
- **Code (comments + commits) is English; the app UI is German.** No i18n layer — German
  strings are inline, matching the mockups.
- React 19 + Vite 8 + TypeScript 6.

## Deployment

Push to `main` triggers `.github/workflows/deploy.yml` → builds `mood-tagebuch/` and
deploys to GitHub Pages at `https://tinuid.github.io/moodbook/`. The production `base` is
`/moodbook/` (set in `vite.config.ts`). CI runs `npm install` (not `npm ci`) intentionally
to tolerate cross-platform lockfile drift with Vite 8 / rolldown native binaries.
