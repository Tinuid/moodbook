import { db } from './schema';
import type { DailyEntry } from '../types';

/** Get a single day's entry, or undefined if none exists. */
export function getEntry(date: string): Promise<DailyEntry | undefined> {
  return db.dailyEntries.where('date').equals(date).first();
}

/** Insert or update the entry for its date (one entry per calendar day). */
export async function saveEntry(entry: DailyEntry): Promise<number> {
  const existing = await getEntry(entry.date);
  if (existing?.id != null) {
    await db.dailyEntries.update(existing.id, { ...entry, id: existing.id });
    return existing.id;
  }
  // strip an undefined id so Dexie auto-increments
  const { id: _omit, ...rest } = entry;
  void _omit;
  return db.dailyEntries.add(rest as DailyEntry);
}

/** All entries within an inclusive ISO date range, sorted ascending. */
export function getEntriesInRange(fromISO: string, toISO: string): Promise<DailyEntry[]> {
  return db.dailyEntries.where('date').between(fromISO, toISO, true, true).sortBy('date');
}

export async function getAllEntries(): Promise<DailyEntry[]> {
  return db.dailyEntries.orderBy('date').toArray();
}

export async function deleteEntry(date: string): Promise<void> {
  const existing = await getEntry(date);
  if (existing?.id != null) await db.dailyEntries.delete(existing.id);
}
