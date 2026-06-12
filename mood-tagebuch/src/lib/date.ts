import { MONTHS, WEEKDAYS_LONG } from './constants';

/** Local ISO date string "YYYY-MM-DD" (never UTC, to avoid off-by-one). */
export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISO(new Date());
}

/** Parse "YYYY-MM-DD" into a local Date (midnight local). */
export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Monday-based weekday index: Mo=0 … So=6. */
export function weekdayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

export function weekdayLong(iso: string): string {
  return WEEKDAYS_LONG[weekdayIndex(parseISO(iso))];
}

/** "Freitag, 12. Juni 2026" */
export function formatLong(iso: string): string {
  const d = parseISO(iso);
  return `${WEEKDAYS_LONG[weekdayIndex(d)]}, ${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "12. Juni 2026" */
export function formatDayMonthYear(iso: string): string {
  const d = parseISO(iso);
  return `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "12. Juni" */
export function formatDayMonth(iso: string): string {
  const d = parseISO(iso);
  return `${d.getDate()}. ${MONTHS[d.getMonth()]}`;
}

/** Short weekday + date: "Mi., 12. Juni 2026" */
export function formatShort(iso: string): string {
  const d = parseISO(iso);
  const wd = WEEKDAYS_LONG[weekdayIndex(d)].slice(0, 2);
  return `${wd}., ${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "Juni 2026" */
export function formatMonthYear(year: number, month: number): string {
  return `${MONTHS[month]} ${year}`;
}

/**
 * Build a calendar grid for the given month as weeks of 7 day-numbers.
 * 0 marks an empty cell. Weeks start on Monday.
 */
export function monthGrid(year: number, month: number): number[][] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = weekdayIndex(new Date(year, month, 1)); // 0=Mo
  const cells: number[] = Array(firstWeekday).fill(0);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(0);
  const weeks: number[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Greeting based on the local hour. */
export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 11) return 'Guten Morgen ☀️';
  if (h < 17) return 'Hallo 👋';
  if (h < 22) return 'Guten Abend 🌙';
  return 'Gute Nacht 🌙';
}

/** ISO date N days before `iso` (or today). */
export function addDays(iso: string, delta: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + delta);
  return toISO(d);
}

/** List of ISO dates for the Monday-based week containing `iso`. */
export function weekDates(iso: string): string[] {
  const d = parseISO(iso);
  const monday = addDays(iso, -weekdayIndex(d));
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}
