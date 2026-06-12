import { db } from './schema';
import type { EindosierungEntry } from '../types';

export function getEindoEntry(date: string): Promise<EindosierungEntry | undefined> {
  return db.eindosierungEntries.where('date').equals(date).first();
}

export async function saveEindoEntry(entry: EindosierungEntry): Promise<number> {
  const existing = await getEindoEntry(entry.date);
  if (existing?.id != null) {
    await db.eindosierungEntries.update(existing.id, { ...entry, id: existing.id });
    return existing.id;
  }
  const { id: _omit, ...rest } = entry;
  void _omit;
  return db.eindosierungEntries.add(rest as EindosierungEntry);
}

/** All entries of a given titration week, sorted by date. */
export function getEindoWeek(week: number): Promise<EindosierungEntry[]> {
  return db.eindosierungEntries.where('week').equals(week).sortBy('date');
}

export function getAllEindoEntries(): Promise<EindosierungEntry[]> {
  return db.eindosierungEntries.orderBy('date').toArray();
}
