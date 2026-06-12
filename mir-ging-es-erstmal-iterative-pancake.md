# Mood Tagebuch — Projekt-Setup & Anforderungen

> **Status (2026-06-12):** Anforderungen & Stack geklärt, Plan freigegeben.
> Umsetzung bewusst auf eine frische Session vertagt (Session-Budget nahezu
> aufgebraucht). Kopie dieses Plans liegt versioniert im Repo unter `PLAN.md`.
> Zum Start in neuer Session genügt: „Setze den Plan um".

## Context

Neues Greenfield-Projekt: **Mood Tagebuch**, eine offline-first PWA zum täglichen
Selbst-Tracking (Stimmung, Wellness, Medikamente, ADHS-Eindosierung). Ein
hochdetailliertes Design-Handoff existiert bereits unter
`design_handoff_mood_tagebuch/` (README.md mit vollständiger Spec + HTML-Mockups
aller 6 Screens). Es gibt noch **keinen Code**.

Dieser Plan dokumentiert die im Gespräch geklärten Produkt-, Technik- und
Prinzipien-Entscheidungen und legt die Umsetzungsreihenfolge fest. Er dient als
Fundament-Dokument, bevor die Implementierung beginnt. Ziel: eine pixelgenaue,
voll funktionsfähige Umsetzung aller 6 Screens.

## Geklärte Entscheidungen

| Thema | Entscheidung | Begründung |
|---|---|---|
| Framework | **React 18 + Vite** | Größtes Ökosystem, bekannt, README-Datenmodelle passen |
| Sprache | **TypeScript** | Typsicherheit für Gesundheitsdaten; Modelle liegen fertig vor |
| Styling | **CSS Modules + globale Token-Variablen** | 1:1 zum Token-System, keine Kollisionen, keine Extra-Dependency |
| Storage | **Dexie.js (IndexedDB)**, offline-only | Wie im README; zuverlässig, indexiert |
| Tests | **Vitest** für Berechnungslogik & Datenlayer | Sichert die fehleranfälligen Stellen, UI manuell |
| PWA | **vite-plugin-pwa** (autoUpdate) | Auto Service Worker + Manifest |
| Charts | **Recharts** | Für Screen 04 Statistiken |
| Backup | **JSON-Export/Import** + `navigator.storage.persist()` | Schutz gegen iOS-Datenverlust; kein Server |
| Umfang V1 | **Alle 6 Screens** | Vollständige Umsetzung in einem Rutsch |
| Zielplattform | **iPhone / Safari** (primär) | Mockups zeigen iPhone-Frame 402×874 |
| Hosting | **Statisches Hosting** (Netlify/Vercel/GitHub Pages) | HTTPS → Installierbarkeit + Persistent Storage; konkrete Wahl beim Deploy |
| Dark Mode | **Nein** in V1 | Nur helles Design; Tokens aber theming-fähig anlegen |
| Code-Sprache | **Englisch** (Kommentare + Commits) | App-UI bleibt deutsch |

## Feste Rahmenbedingungen

- **Single-User, kein Login/Account** — alles gerätelokal.
- **Deutsch-only UI**, keine i18n-Schicht; Texte exakt wie in den Mockups.
- **Komplett offline** funktionsfähig, kein Backend.
- **Portrait**, vertikales Scrollen, kein horizontales Scrollen.
- Design **pixelgenau** aus `Mood Tagebuch Mockup v2.html` ableiten.
- Token-Werte (oklch-Farben, Typo, Spacing) exakt aus README §"Design Tokens".

## Entwicklungsprinzipien

- **Datenlayer zuerst**: Dexie-Schema + typsichere CRUD-Helper + berechnete
  Werte als reine Funktionen, bevor UI gebaut wird.
- **Reine Funktionen für alle berechneten Werte** (Zyklus-Tag, Zyklusphase,
  Ø Wochenschnitt, Tagessumme, Wochensumme, Medikamenten-Streak) → mit Vitest
  getestet (Input → erwartetes Ergebnis).
- **Wiederverwendbare Komponenten früh**: Medikamenten-Stepper und 0–10-NumRow
  werden mehrfach genutzt → einmal sauber bauen.
- **Tokens als `:root`-CSS-Variablen**, so strukturiert, dass ein späteres
  Dark-Mode-Theme nur ein zusätzliches Variablen-Set bräuchte.
- Englische Kommentare, knapp und nur wo nötig; Code im Stil der Umgebung.

## Projektstruktur (Vorschlag)

```
mood-tagebuch/                  (neues Vite-Projekt im Repo-Root oder Unterordner)
  public/                       icon-192.png, icon-512.png
  src/
    main.tsx, App.tsx           Router-Setup, BottomNav-Layout
    styles/tokens.css           alle Design-Tokens als :root-Variablen
    db/
      schema.ts                 MoodDB (Dexie), Tabellen + settings key-value
      entries.ts                CRUD dailyEntries
      eindosierung.ts           CRUD eindosierungEntries
      backup.ts                 JSON Export/Import
    lib/
      compute.ts                Zyklus-Tag, Phase, Ø, Summen, Streak (rein)
      compute.test.ts           Vitest
      storage.ts                navigator.storage.persist()
    components/                 BottomNav, MetricCard, DoseStepper, NumRow, ...
    screens/
      Heute.tsx                 Screen 01 (komplexester)
      Kalender.tsx              Screen 02
      EintragDetail.tsx         Screen 03
      Statistiken.tsx           Screen 04
      Eindosierung.tsx          Screen 05+06 (Tabs)
```

## Datenmodell (aus README)

- `DailyEntry` (date, mood 0–4, energy, sleepHours, sleepQuality, weight?,
  sportMinutes?, water?, stress, diaryText?, medications[], period?)
- `MedicationDose` (time "HH:MM", doseMg in 10er-Schritten)
- `PeriodEntry` (intensity, cycleDay? berechnet)
- `EindosierungEntry` (date, week, symptoms[] mit name/value 0–10/group)
- Symptomlisten (4 Haupt + 8 Neben) in fester Reihenfolge — siehe README.
- Dexie: `dailyEntries: '++id, date'`, `eindosierungEntries: '++id, date, week'`,
  plus einfache **settings**-Tabelle (key-value) für Titrations-Startdatum.

## Implementierungsreihenfolge

1. **Scaffold**: Vite React-TS Projekt, Dependencies (react-router-dom, dexie,
   recharts), vite-plugin-pwa, Vitest. Google Fonts (DM Sans + Newsreader).
2. **Tokens & Layout-Shell**: `tokens.css`, App-Routing, fixe BottomNav (4 Tabs).
3. **Datenlayer**: Dexie-Schema, CRUD-Helper, settings-Store, Persistent Storage.
4. **Berechnungslogik** + Vitest-Tests (compute.ts).
5. **Reusable Components**: DoseStepper, NumRow, MetricCard, BottomNav.
6. **Screen 01 — Heute** (deckt die meisten Patterns ab).
7. **Screen 02 — Kalender** + **Screen 03 — Eintrag-Detail**.
8. **Screen 04 — Statistiken** (Recharts, soft colors).
9. **Screen 05/06 — Eindosierung** (Tageseintrag + Wochenschnitt-Tab).
10. **Backup**: JSON-Export (Datei-Download) + Import.
11. **PWA-Feinschliff**: Manifest, Icons (192/512), Service Worker, iOS-Meta-Tags
    (apple-touch-icon, apple-mobile-web-app-capable, theme-color).

## Verifikation

- `npm run test` (Vitest) → Berechnungslogik & Datenlayer grün.
- `npm run dev` + iPhone-Viewport (DevTools 402×874) → jeder Screen visuell
  gegen das Mockup geprüft (Farben, Spacing, Typo, Navigation).
- Manuelle End-to-End-Flows: Eintrag anlegen/speichern/bearbeiten, Medikament
  hinzufügen/entfernen, Eindosierung speichern + Wochenschnitt, Export → Import
  in frischem Profil → Daten wiederhergestellt.
- `npm run build` + Preview → PWA installierbar, offline lauffähig, Manifest ok.
- Nach Deploy auf echtem iPhone: Homescreen-Installation + Persistent-Storage
  prüfen.

## Offene Detailpunkte (während Umsetzung zu klären)

- Konkreter Hosting-Anbieter (Netlify vs. Vercel vs. GitHub Pages) beim Deploy.
- App-Icon-Design (README schlägt stilisierte Tagebuchseite mit Herz vor).
- Inline-Editoren für Metrik-Werte: native Picker vs. eigene Eingabe.
