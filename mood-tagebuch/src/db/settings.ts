import { db } from './schema';

/** Generic key-value access. */
export async function getSetting(key: string): Promise<string | undefined> {
  const row = await db.settings.get(key);
  return row?.value;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.settings.put({ key, value });
}

// --- Typed helpers -----------------------------------------------------------

export const KEY_TITRATION_START = 'titrationStart';

/** ISO date the titration phase began (used for week numbering). */
export function getTitrationStart(): Promise<string | undefined> {
  return getSetting(KEY_TITRATION_START);
}

export function setTitrationStart(iso: string): Promise<void> {
  return setSetting(KEY_TITRATION_START, iso);
}
