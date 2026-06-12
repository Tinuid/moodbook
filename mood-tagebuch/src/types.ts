// Shared data models — mirror the README spec exactly.

export type Mood = 0 | 1 | 2 | 3 | 4; // 0=Mies … 4=Super
export type SleepQuality = 'schlecht' | 'mittel' | 'gut';
export type PeriodIntensity = 'keine' | 'leicht' | 'mittel' | 'stark';
export type SymptomGroup = 'haupt' | 'neben';

export interface MedicationDose {
  time: string; // "HH:MM", e.g. "08:00"
  doseMg: number; // multiples of 10
}

export interface PeriodEntry {
  intensity: PeriodIntensity;
  cycleDay?: number; // computed at render time, not persisted
}

/** One entry per calendar day. */
export interface DailyEntry {
  id?: number; // auto-increment (Dexie)
  date: string; // ISO 8601: "2026-06-12"
  mood: Mood;
  energy: number; // 0–10
  sleepHours: number; // e.g. 7.5
  sleepQuality: SleepQuality;
  weight?: number; // kg
  sportMinutes?: number;
  water?: number; // litres
  stress: number; // 0–10
  diaryText?: string;
  medications: MedicationDose[];
  period?: PeriodEntry;
}

export interface EindosierungSymptom {
  name: string; // exact German label
  value: number | null; // 0–10, null = not rated
  group: SymptomGroup;
}

/** One record per day during the titration phase. */
export interface EindosierungEntry {
  id?: number;
  date: string; // ISO 8601
  week: number; // titration week number (1, 2, 3 …)
  symptoms: EindosierungSymptom[];
}

/** Simple key-value settings store. */
export interface Setting {
  key: string;
  value: string;
}
