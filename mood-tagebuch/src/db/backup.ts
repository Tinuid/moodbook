import { db } from './schema';
import type { DailyEntry, EindosierungEntry, Setting } from '../types';

interface BackupFile {
  app: 'mood-tagebuch';
  version: number;
  exportedAt: string;
  dailyEntries: DailyEntry[];
  eindosierungEntries: EindosierungEntry[];
  settings: Setting[];
}

/** Serialize the whole database to a JSON string. */
export async function exportData(): Promise<string> {
  const [dailyEntries, eindosierungEntries, settings] = await Promise.all([
    db.dailyEntries.toArray(),
    db.eindosierungEntries.toArray(),
    db.settings.toArray(),
  ]);
  const payload: BackupFile = {
    app: 'mood-tagebuch',
    version: 1,
    exportedAt: new Date().toISOString(),
    dailyEntries,
    eindosierungEntries,
    settings,
  };
  return JSON.stringify(payload, null, 2);
}

/** Trigger a browser download of the current data as a .json file. */
export async function downloadBackup(): Promise<void> {
  const json = await exportData();
  const stamp = new Date().toISOString().slice(0, 10);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mood-tagebuch-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Replace all data with the contents of a backup file.
 * Throws if the file is not a recognised Mood Tagebuch backup.
 */
export async function importData(json: string): Promise<void> {
  const parsed = JSON.parse(json) as Partial<BackupFile>;
  if (parsed.app !== 'mood-tagebuch' || !Array.isArray(parsed.dailyEntries)) {
    throw new Error('Keine gültige Mood-Tagebuch-Sicherung.');
  }
  await db.transaction('rw', db.dailyEntries, db.eindosierungEntries, db.settings, async () => {
    await Promise.all([db.dailyEntries.clear(), db.eindosierungEntries.clear(), db.settings.clear()]);
    // strip ids so auto-increment stays consistent
    await db.dailyEntries.bulkAdd((parsed.dailyEntries ?? []).map(stripId));
    await db.eindosierungEntries.bulkAdd((parsed.eindosierungEntries ?? []).map(stripId));
    if (parsed.settings?.length) await db.settings.bulkPut(parsed.settings);
  });
}

function stripId<T extends { id?: number }>(row: T): T {
  const { id: _omit, ...rest } = row;
  void _omit;
  return rest as T;
}
