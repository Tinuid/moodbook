import Dexie, { type Table } from 'dexie';
import type { DailyEntry, EindosierungEntry, Setting } from '../types';

export class MoodDB extends Dexie {
  dailyEntries!: Table<DailyEntry, number>;
  eindosierungEntries!: Table<EindosierungEntry, number>;
  settings!: Table<Setting, string>;

  constructor() {
    super('MoodTagebuch');
    this.version(1).stores({
      dailyEntries: '++id, date',
      eindosierungEntries: '++id, date, week',
      settings: 'key',
    });
  }
}

export const db = new MoodDB();
