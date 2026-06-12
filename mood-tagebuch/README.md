# Mood Tagebuch

Offline-first PWA zum täglichen Selbst-Tracking (Stimmung, Wellness, Medikamente,
ADHS-Eindosierung). Single-User, kein Login, alle Daten gerätelokal in IndexedDB.
Deutsch-only UI, ausgelegt auf iPhone/Safari (Portrait, 402×874).

## Stack

- **React 19 + Vite + TypeScript** (Vite-Template liefert aktuell React 19; voll
  kompatibel zur Plan-Vorgabe „React 18").
- **react-router v7** (HashRouter — robust für statisches Hosting & offline).
- **Dexie.js** (IndexedDB) als Datenlayer.
- **vite-plugin-pwa** (autoUpdate) für Service Worker + Manifest.
- **Vitest** für Berechnungslogik & Datenmodell.
- Styling: globale Design-Tokens als CSS-Variablen (`src/styles/tokens.css`),
  Layout 1:1 aus dem Mockup als Inline-Styles portiert (laut README explizit
  zulässig) — sichert die geforderte Pixel-Treue.

## Entwicklung

```bash
npm install
npm run dev        # Dev-Server (http://localhost:5173)
npm test           # Vitest (Berechnungslogik)
npm run build      # Type-Check + Produktions-Build inkl. PWA
npm run preview    # Build lokal ausliefern
npm run gen:icons  # PWA-Icons neu rendern (erst `npm i -D sharp`; sonst nicht nötig)
```

iPhone-Viewport in den DevTools: 402×874.

## Struktur

```
src/
  main.tsx, App.tsx          Mount + Router/Layout (fixe BottomNav)
  styles/tokens.css          alle Design-Tokens als :root-Variablen (theming-fähig)
  types.ts                   Datenmodelle (DailyEntry, EindosierungEntry, …)
  db/
    schema.ts                MoodDB (Dexie): dailyEntries, eindosierungEntries, settings
    entries.ts               CRUD Tageseinträge
    eindosierung.ts          CRUD Eindosierung
    settings.ts              key-value (Titrations-Startdatum)
    backup.ts                JSON Export/Import
  lib/
    compute.ts               reine Funktionen (Zyklus, Phase, Ø, Summen, Streak)
    compute.test.ts          Vitest
    date.ts                  lokale ISO-Daten, deutsche Formatierung, Monatsgitter
    constants.ts             MOODS, Symptomlisten, Wochentage
    storage.ts               navigator.storage.persist()
  components/                Icon, BottomNav, Screen, MetricCard, DoseStepper,
                             NumRow, Toast, BackupSheet
  screens/                   Heute, Kalender, EintragDetail, Statistiken, Eindosierung
```

## Bewusste Entscheidungen / Abweichungen vom Plan

- **HashRouter statt cleaner Routen**: vermeidet 404 auf beliebigem Statik-Hosting
  (GitHub Pages) und beim Offline-Start vom Homescreen. Logische Pfade bleiben
  identisch (`/`, `/verlauf`, `/verlauf/:date`, `/statistiken`, `/eindosierung`).
- **Inline-Styles statt CSS Modules**: Da das Mockup durchgängig Inline-Styles
  nutzt, wird so die Pixel-Treue garantiert; Tokens bleiben zentral als
  CSS-Variablen.
- **Statistiken ohne Recharts**: Das Mockup von Screen 04 enthält keinen Chart
  (nur Stimmungs-Emoji-Reihe + Metrik-Zeilen). Es wurde pixelgenau nachgebaut;
  Recharts ist installiert, falls später ein Trend-Chart ergänzt werden soll.
- **Backup-Zugang über den Avatar** (Heute, oben rechts): öffnet ein Sheet mit
  Export/Import + „Dauerhaften Speicher aktivieren". Hält die sechs Mockup-Screens
  unverändert.
- **Titrations-Startdatum** wird beim ersten Öffnen der Eindosierung auf „heute"
  gesetzt (Woche 1) und in der settings-Tabelle gespeichert.

## Verifikation

- `npm test` → 19 Tests grün (Zyklus-Tag/-Phase, Ø-Wochenschnitt, Tagessumme,
  Wochensumme, Medikamenten-Streak, Titrationswoche).
- `npm run build` → Type-Check ok, PWA (sw.js + manifest) erzeugt.
- Manuelle End-to-End-Flows im Browser: Eintrag anlegen/speichern/bearbeiten,
  Medikament hinzufügen/entfernen, Eindosierung speichern + Wochenschnitt,
  Export → Import → Daten wiederhergestellt.

## Hosting

Statisches Hosting mit HTTPS (Netlify / Vercel / GitHub Pages). Build-Output: `dist/`.
HTTPS ist Voraussetzung für Installierbarkeit und Persistent Storage. Konkreter
Anbieter beim Deploy zu wählen.
