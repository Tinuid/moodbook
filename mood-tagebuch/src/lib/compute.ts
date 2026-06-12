import type { DailyEntry, EindosierungEntry, EindosierungSymptom } from '../types';
import { addDays, parseISO, toISO } from './date';

// --- Small numeric helpers ---------------------------------------------------

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Average of the defined numbers; null if the list is empty. */
export function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** Whole days from `aISO` to `bISO` (b − a). */
export function daysBetween(aISO: string, bISO: string): number {
  const ms = parseISO(bISO).getTime() - parseISO(aISO).getTime();
  return Math.round(ms / 86_400_000);
}

// --- Cycle ------------------------------------------------------------------

/**
 * Cycle day for `targetISO`, counted from the most recent period start
 * on or before the target. A period start is a day with bleeding whose
 * previous day had none ("after a gap"). Returns undefined if no period
 * data precedes the target.
 */
export function cycleDay(periodDates: string[], targetISO: string): number | undefined {
  const set = new Set(periodDates);
  const cursor = parseISO(targetISO);
  let latestStart: string | null = null;
  for (let i = 0; i < 400; i++) {
    const iso = toISO(cursor);
    if (set.has(iso) && !set.has(addDays(iso, -1))) {
      latestStart = iso;
      break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  if (!latestStart) return undefined;
  return daysBetween(latestStart, targetISO) + 1;
}

export interface PhaseInfo {
  label: string;
  color: string;
  bg: string;
}

/** Map a cycle day to its menstrual phase + pill colours. */
export function cyclePhase(day: number): PhaseInfo {
  if (day <= 5) return { label: 'Menstruation', color: '#B85C5C', bg: '#FAEAEA' };
  if (day <= 13) return { label: 'Follikelphase', color: '#4A8AB0', bg: '#E6F0F8' };
  if (day <= 15) return { label: 'Eisprung', color: '#4A9070', bg: '#E6F4EE' };
  return { label: 'Lutealphase', color: '#C47A40', bg: '#FAF0E4' };
}

/** Collect ISO dates that have a bleeding period (intensity ≠ 'keine'). */
export function periodDatesOf(entries: DailyEntry[]): string[] {
  return entries
    .filter((e) => e.period && e.period.intensity !== 'keine')
    .map((e) => e.date);
}

// --- Medication --------------------------------------------------------------

/**
 * Consecutive days with at least one medication entry, ending at `todayISO`.
 * Returns 0 if today itself has no medication.
 */
export function medicationStreak(entries: DailyEntry[], todayISO: string): number {
  const withMeds = new Set(
    entries.filter((e) => e.medications && e.medications.length > 0).map((e) => e.date),
  );
  let streak = 0;
  let day = todayISO;
  while (withMeds.has(day)) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

/** Total mg taken on a given entry. */
export function totalDose(entry: DailyEntry): number {
  return entry.medications.reduce((a, m) => a + m.doseMg, 0);
}

// --- Eindosierung ------------------------------------------------------------

/** Day sum of all symptom values (null counts as 0). */
export function daySum(symptoms: EindosierungSymptom[]): number {
  return symptoms.reduce((a, s) => a + (s.value ?? 0), 0);
}

export interface SymptomAverage {
  name: string;
  /** Per-day values in entry order; null for days not rated. */
  values: (number | null)[];
  /** Average over rated days, or null if none rated. */
  avg: number | null;
}

/**
 * Per-symptom weekly averages. For each symptom name (in `order`), gathers
 * its value across the week's entries and averages over the days that rated
 * it. Days without a value are excluded from the average.
 */
export function symptomAverages(
  entries: EindosierungEntry[],
  order: string[],
): SymptomAverage[] {
  return order.map((name) => {
    const values = entries.map(
      (e) => e.symptoms.find((s) => s.name === name)?.value ?? null,
    );
    const rated = values.filter((v): v is number => v != null);
    return { name, values, avg: average(rated) };
  });
}

/** Sum of the per-symptom averages (the "Ø Wochensumme"). */
export function weekSumAverage(avgs: SymptomAverage[]): number {
  return avgs.reduce((a, s) => a + (s.avg ?? 0), 0);
}

/** Number of distinct days that have a saved eindosierung entry. */
export function daysFilled(entries: EindosierungEntry[]): number {
  return new Set(entries.map((e) => e.date)).size;
}

/** Titration week number for a date (1-based), given the phase start. */
export function titrationWeek(startISO: string, targetISO: string): number {
  const diff = daysBetween(startISO, targetISO);
  if (diff < 0) return 1;
  return Math.floor(diff / 7) + 1;
}
