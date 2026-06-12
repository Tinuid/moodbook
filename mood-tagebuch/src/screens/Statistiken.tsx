import { useEffect, useMemo, useState } from 'react';
import { Screen } from '../components/Screen';
import { Icon, type IconName } from '../components/Icon';
import { MOODS, WEEKDAYS_SHORT } from '../lib/constants';
import { addDays, formatDayMonth, todayISO, weekDates } from '../lib/date';
import { average, round1, titrationWeek, totalDose } from '../lib/compute';
import { getAllEntries } from '../db/entries';
import { getTitrationStart } from '../db/settings';
import type { DailyEntry } from '../types';

const TABS = [
  { label: '7 Tage', days: 7 },
  { label: '30 Tage', days: 30 },
  { label: '3 Monate', days: 90 },
];

function inRange(entries: DailyEntry[], fromISO: string, toISOExclusiveEnd: string): DailyEntry[] {
  return entries.filter((e) => e.date >= fromISO && e.date <= toISOExclusiveEnd);
}

function fmtDelta(delta: number | null, unit: string): string {
  if (delta == null) return '';
  const sign = delta > 0 ? '+' : delta < 0 ? '−' : '±';
  return `${sign}${Math.abs(round1(delta))} ${unit}`;
}

export function Statistiken() {
  const today = todayISO();
  const [tab, setTab] = useState(0);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [titrationStart, setTitrationStart] = useState<string | undefined>();

  useEffect(() => {
    getAllEntries().then(setEntries);
    getTitrationStart().then(setTitrationStart);
  }, []);

  const days = TABS[tab].days;

  const stats = useMemo(() => {
    const from = addDays(today, -(days - 1));
    const cur = inRange(entries, from, today);
    const prevFrom = addDays(today, -(2 * days - 1));
    const prev = inRange(entries, prevFrom, addDays(from, -1));

    const avgSleep = average(cur.map((e) => e.sleepHours));
    const avgEnergy = average(cur.map((e) => e.energy));
    const prevEnergy = average(prev.map((e) => e.energy));

    const weights = cur.filter((e) => e.weight != null).map((e) => e.weight!);
    const curWeight = weights.length ? weights[weights.length - 1] : null;
    const weightDelta = weights.length >= 2 ? weights[weights.length - 1] - weights[0] : null;

    const medDays = cur.filter((e) => e.medications.length > 0);
    const avgDose = medDays.length
      ? average(medDays.map((e) => totalDose(e)))
      : null;
    const avgDosesPerDay = medDays.length
      ? average(medDays.map((e) => e.medications.length))
      : null;

    return {
      avgSleep,
      avgEnergy,
      energyDelta: avgEnergy != null && prevEnergy != null ? avgEnergy - prevEnergy : null,
      curWeight,
      weightDelta,
      avgDose,
      avgDosesPerDay,
    };
  }, [entries, days, today]);

  // Current-week mood row (Mo–So).
  const weekMoods = useMemo(() => {
    const byDate = new Map(entries.map((e) => [e.date, e]));
    return weekDates(today).map((iso) => byDate.get(iso));
  }, [entries, today]);

  const titrationLabel = titrationStart ? `Woche ${titrationWeek(titrationStart, today)}` : '—';
  const nextAssessment = titrationStart
    ? formatDayMonth(addDays(titrationStart, titrationWeek(titrationStart, today) * 7))
    : 'Nicht gestartet';

  const rows: { icon: IconName; label: string; value: string; sub: string }[] = [
    {
      icon: 'moon',
      label: 'Durchschn. Schlaf',
      value: stats.avgSleep != null ? `${round1(stats.avgSleep)} h` : '–',
      sub: 'Ziel: 8h',
    },
    {
      icon: 'zap',
      label: 'Energie-Schnitt',
      value: stats.avgEnergy != null ? `${round1(stats.avgEnergy)} / 10` : '–',
      sub: stats.energyDelta != null ? `${fmtDelta(stats.energyDelta, 'vs. Vorperiode')}` : 'Keine Vergleichsdaten',
    },
    {
      icon: 'weight',
      label: 'Gewicht',
      value: stats.curWeight != null ? `${round1(stats.curWeight)} kg` : '–',
      sub: stats.weightDelta != null ? fmtDelta(stats.weightDelta, 'kg im Zeitraum') : 'Keine Daten',
    },
    {
      icon: 'pill',
      label: 'Medikamenten-Dosis',
      value: stats.avgDose != null ? `${Math.round(stats.avgDose)} mg/Tag` : '–',
      sub:
        stats.avgDosesPerDay != null
          ? `${round1(stats.avgDosesPerDay)}× täglich`
          : 'Keine Einnahmen',
    },
    {
      icon: 'clip',
      label: 'Eindosierung Woche',
      value: titrationLabel,
      sub: titrationStart ? `Nächste Bewertung: ${nextAssessment}` : nextAssessment,
    },
  ];

  return (
    <Screen variant="b">
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)' }}>
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 12,
            color: 'var(--color-muted)',
            fontStyle: 'italic',
          }}
        >
          Einblicke
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 300, marginTop: 4 }}>
          Diese Woche
        </div>
      </div>

      {/* Period tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
        {TABS.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setTab(i)}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '11px 0',
              borderBottom: i === tab ? '2px solid var(--color-accent)' : '2px solid transparent',
              color: i === tab ? 'var(--color-accent)' : 'var(--color-muted)',
              fontSize: 13,
              fontWeight: i === tab ? 600 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Stimmung card */}
      <div
        style={{
          margin: '16px 24px',
          padding: '14px 16px',
          borderRadius: 16,
          background: 'var(--color-accent-bg)',
          border: '1px solid color-mix(in oklch, var(--color-accent) 25%, transparent)',
        }}
      >
        <div
          style={{
            fontSize: 9,
            color: 'var(--color-accent)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.09em',
            marginBottom: 10,
          }}
        >
          Stimmung
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {weekMoods.map((entry, i) => (
            <div
              key={i}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}
            >
              {entry ? (
                <span style={{ fontSize: 22 }}>{MOODS[entry.mood].emoji}</span>
              ) : (
                <div style={{ width: 22, height: 22, borderRadius: 11, background: 'var(--color-border)' }} />
              )}
              <span
                style={{
                  fontSize: 10,
                  color: entry ? 'var(--color-muted)' : 'var(--color-subtle)',
                }}
              >
                {WEEKDAYS_SHORT[i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Metric rows */}
      {rows.map((s, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '13px 24px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <Icon name={s.icon} size={17} color="var(--color-subtle)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13 }}>{s.label}</div>
            {s.sub && (
              <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 1 }}>{s.sub}</div>
            )}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{s.value}</div>
        </div>
      ))}
    </Screen>
  );
}
