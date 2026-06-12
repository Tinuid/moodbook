import { describe, it, expect } from 'vitest';
import {
  average,
  cycleDay,
  cyclePhase,
  daySum,
  daysBetween,
  daysFilled,
  medicationStreak,
  periodDatesOf,
  round1,
  symptomAverages,
  titrationWeek,
  totalDose,
  weekSumAverage,
} from './compute';
import type { DailyEntry, EindosierungEntry } from '../types';

function day(date: string, over: Partial<DailyEntry> = {}): DailyEntry {
  return {
    date,
    mood: 2,
    energy: 5,
    sleepHours: 7,
    sleepQuality: 'mittel',
    stress: 3,
    medications: [],
    ...over,
  };
}

describe('numeric helpers', () => {
  it('round1 rounds to one decimal', () => {
    expect(round1(2.666)).toBe(2.7);
    expect(round1(2)).toBe(2);
  });

  it('average returns null on empty', () => {
    expect(average([])).toBeNull();
    expect(average([2, 4])).toBe(3);
  });

  it('daysBetween counts whole days', () => {
    expect(daysBetween('2026-06-01', '2026-06-12')).toBe(11);
    expect(daysBetween('2026-06-12', '2026-06-01')).toBe(-11);
    expect(daysBetween('2026-06-12', '2026-06-12')).toBe(0);
  });
});

describe('cycleDay', () => {
  it('returns undefined without period data', () => {
    expect(cycleDay([], '2026-06-12')).toBeUndefined();
  });

  it('counts from the most recent start (target inside the period)', () => {
    const period = ['2026-06-09', '2026-06-10', '2026-06-11', '2026-06-12', '2026-06-13'];
    expect(cycleDay(period, '2026-06-09')).toBe(1);
    expect(cycleDay(period, '2026-06-11')).toBe(3);
  });

  it('keeps counting after the bleeding stops', () => {
    const period = ['2026-06-09', '2026-06-10', '2026-06-11', '2026-06-12', '2026-06-13'];
    // 28th day of the cycle, no bleeding that day
    expect(cycleDay(period, '2026-07-06')).toBe(28);
  });

  it('uses the latest start when several periods exist', () => {
    const period = ['2026-05-01', '2026-05-02', '2026-06-09', '2026-06-10'];
    expect(cycleDay(period, '2026-06-10')).toBe(2);
    // a date between the two periods counts from the May start
    expect(cycleDay(period, '2026-05-10')).toBe(10);
  });
});

describe('cyclePhase', () => {
  it('maps days to phases', () => {
    expect(cyclePhase(1).label).toBe('Menstruation');
    expect(cyclePhase(5).label).toBe('Menstruation');
    expect(cyclePhase(6).label).toBe('Follikelphase');
    expect(cyclePhase(13).label).toBe('Follikelphase');
    expect(cyclePhase(14).label).toBe('Eisprung');
    expect(cyclePhase(15).label).toBe('Eisprung');
    expect(cyclePhase(16).label).toBe('Lutealphase');
    expect(cyclePhase(28).label).toBe('Lutealphase');
  });
});

describe('periodDatesOf', () => {
  it('only includes days with bleeding', () => {
    const entries = [
      day('2026-06-09', { period: { intensity: 'leicht' } }),
      day('2026-06-10', { period: { intensity: 'keine' } }),
      day('2026-06-11'),
    ];
    expect(periodDatesOf(entries)).toEqual(['2026-06-09']);
  });
});

describe('medicationStreak', () => {
  const meds = [{ time: '08:00', doseMg: 20 }];
  it('counts consecutive days ending today', () => {
    const entries = [
      day('2026-06-10', { medications: meds }),
      day('2026-06-11', { medications: meds }),
      day('2026-06-12', { medications: meds }),
    ];
    expect(medicationStreak(entries, '2026-06-12')).toBe(3);
  });

  it('is 0 when today has no medication', () => {
    const entries = [day('2026-06-11', { medications: meds })];
    expect(medicationStreak(entries, '2026-06-12')).toBe(0);
  });

  it('stops at a gap', () => {
    const entries = [
      day('2026-06-09', { medications: meds }),
      // 10th missing
      day('2026-06-11', { medications: meds }),
      day('2026-06-12', { medications: meds }),
    ];
    expect(medicationStreak(entries, '2026-06-12')).toBe(2);
  });
});

describe('totalDose', () => {
  it('sums all doses of the day', () => {
    expect(
      totalDose(day('x', { medications: [
        { time: '08:00', doseMg: 20 },
        { time: '12:00', doseMg: 10 },
      ] })),
    ).toBe(30);
  });
});

describe('eindosierung', () => {
  const order = ['A', 'B', 'C'];
  const entries: EindosierungEntry[] = [
    {
      date: '2026-06-08',
      week: 3,
      symptoms: [
        { name: 'A', value: 3, group: 'haupt' },
        { name: 'B', value: 1, group: 'haupt' },
        { name: 'C', value: null, group: 'neben' },
      ],
    },
    {
      date: '2026-06-09',
      week: 3,
      symptoms: [
        { name: 'A', value: 2, group: 'haupt' },
        { name: 'B', value: 1, group: 'haupt' },
        { name: 'C', value: 4, group: 'neben' },
      ],
    },
  ];

  it('daySum treats null as 0', () => {
    expect(daySum(entries[0].symptoms)).toBe(4);
    expect(daySum(entries[1].symptoms)).toBe(7);
  });

  it('symptomAverages averages only rated days', () => {
    const avgs = symptomAverages(entries, order);
    expect(avgs[0]).toMatchObject({ name: 'A', values: [3, 2], avg: 2.5 });
    expect(avgs[1]).toMatchObject({ name: 'B', avg: 1 });
    // C rated on only one day → average of that single value
    expect(avgs[2]).toMatchObject({ name: 'C', values: [null, 4], avg: 4 });
  });

  it('weekSumAverage sums the per-symptom averages', () => {
    const avgs = symptomAverages(entries, order);
    expect(round1(weekSumAverage(avgs))).toBe(7.5);
  });

  it('daysFilled counts distinct days', () => {
    expect(daysFilled(entries)).toBe(2);
  });
});

describe('titrationWeek', () => {
  it('is 1-based and 7-day wide', () => {
    expect(titrationWeek('2026-06-01', '2026-06-01')).toBe(1);
    expect(titrationWeek('2026-06-01', '2026-06-07')).toBe(1);
    expect(titrationWeek('2026-06-01', '2026-06-08')).toBe(2);
    expect(titrationWeek('2026-06-01', '2026-06-15')).toBe(3);
  });

  it('clamps dates before the start to week 1', () => {
    expect(titrationWeek('2026-06-10', '2026-06-01')).toBe(1);
  });
});
