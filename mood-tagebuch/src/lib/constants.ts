import type { SymptomGroup } from '../types';

export interface MoodDef {
  label: string;
  emoji: string;
  color: string;
  bg: string;
}

// Index 0..4 — order matters (maps to DailyEntry.mood).
export const MOODS: MoodDef[] = [
  { label: 'Mies', emoji: '😞', color: '#B85C5C', bg: '#FAEAEA' },
  { label: 'Schlecht', emoji: '😕', color: '#C47A40', bg: '#FAF0E4' },
  { label: 'Ok', emoji: '😐', color: '#B89A30', bg: '#F8F5DC' },
  { label: 'Gut', emoji: '🙂', color: '#4A8AB0', bg: '#E6F0F8' },
  { label: 'Super', emoji: '😊', color: '#4A9070', bg: '#E6F4EE' },
];

export const PERIOD_INTENSITIES = ['keine', 'leicht', 'mittel', 'stark'] as const;
export const PERIOD_LABELS: Record<string, string> = {
  keine: 'Keine',
  leicht: 'Leicht',
  mittel: 'Mittel',
  stark: 'Stark',
};

export const SLEEP_QUALITIES = ['schlecht', 'mittel', 'gut'] as const;

// Fixed symptom order — drives both daily entry and weekly average screens.
export const HAUPT_SYMPTOME: string[] = [
  'Aufmerksamkeitsstörung',
  'Impulsivität',
  'Unorganisiertes Verhalten',
  'Prokrastination',
];

export const NEBEN_SYMPTOME: string[] = [
  'Innere Unruhe',
  'Stimmungswechsel',
  'Reizbarkeit / Wutausbrüche',
  'Müdigkeit',
  'Schlafstörungen',
  'Übelkeit',
  'Schwindel',
  'Appetitlosigkeit',
];

export interface SymptomDef {
  name: string;
  group: SymptomGroup;
}

export const ALL_SYMPTOMS: SymptomDef[] = [
  ...HAUPT_SYMPTOME.map((name) => ({ name, group: 'haupt' as const })),
  ...NEBEN_SYMPTOME.map((name) => ({ name, group: 'neben' as const })),
];

export const WEEKDAYS_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export const WEEKDAYS_LONG = [
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
  'Sonntag',
];

export const MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

// Group accent colors (used by the 0–10 number rows & average squares).
export const HAUPT_COLOR = 'var(--color-accent)';
export const NEBEN_COLOR = 'var(--color-amber)';
