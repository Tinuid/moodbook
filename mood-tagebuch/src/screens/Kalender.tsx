import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../components/Screen';
import { MOODS } from '../lib/constants';
import { formatMonthYear, monthGrid, toISO, todayISO } from '../lib/date';
import { getEntriesInRange } from '../db/entries';
import type { DailyEntry } from '../types';

const WD = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export function Kalender() {
  const navigate = useNavigate();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-based
  const [entries, setEntries] = useState<Map<number, DailyEntry>>(new Map());

  useEffect(() => {
    let alive = true;
    const from = toISO(new Date(year, month, 1));
    const to = toISO(new Date(year, month + 1, 0));
    getEntriesInRange(from, to).then((rows) => {
      if (!alive) return;
      const map = new Map<number, DailyEntry>();
      for (const e of rows) map.set(new Date(e.date).getDate(), e);
      setEntries(map);
    });
    return () => {
      alive = false;
    };
  }, [year, month]);

  const weeks = useMemo(() => monthGrid(year, month), [year, month]);
  const today = todayISO();

  function changeMonth(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  function openDay(day: number) {
    if (day <= 0) return;
    navigate(`/verlauf/${toISO(new Date(year, month, day))}`);
  }

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
          Monatsübersicht
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 4,
          }}
        >
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 300 }}>
            {formatMonthYear(year, month)}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 18,
              color: 'var(--color-subtle)',
              fontSize: 22,
              lineHeight: 1,
            }}
          >
            <button aria-label="Vorheriger Monat" onClick={() => changeMonth(-1)} style={{ color: 'inherit' }}>
              ‹
            </button>
            <button aria-label="Nächster Monat" onClick={() => changeMonth(1)} style={{ color: 'inherit' }}>
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Weekday header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '10px 16px 6px' }}>
        {WD.map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-subtle)' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
            {week.map((day, di) => {
              const entry = day ? entries.get(day) : undefined;
              const iso = day ? toISO(new Date(year, month, day)) : '';
              const isToday = iso === today;
              const hasPeriod = entry?.period && entry.period.intensity !== 'keine';
              return (
                <button
                  key={di}
                  onClick={() => openDay(day)}
                  disabled={day <= 0}
                  style={{
                    height: 56,
                    borderRadius: 8,
                    background: day
                      ? entry
                        ? MOODS[entry.mood].bg
                        : 'oklch(97% 0.008 55)'
                      : 'transparent',
                    border: isToday ? '1.5px solid var(--color-accent)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    position: 'relative',
                    cursor: day > 0 ? 'pointer' : 'default',
                  }}
                >
                  {day > 0 && (
                    <>
                      <span
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: 13,
                          color: isToday ? 'var(--color-accent)' : 'var(--color-text)',
                          fontWeight: isToday ? 600 : 300,
                        }}
                      >
                        {day}
                      </span>
                      {entry && <span style={{ fontSize: 10 }}>{MOODS[entry.mood].emoji}</span>}
                    </>
                  )}
                  {hasPeriod && day > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 3,
                        right: 4,
                        width: 5,
                        height: 5,
                        borderRadius: 3,
                        background: '#C04060',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div
        style={{
          padding: '12px 24px 8px',
          borderTop: '1px solid var(--color-border)',
          marginTop: 8,
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        {MOODS.map((m, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 12 }}>{m.emoji}</span>
            <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>{m.label}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 5, height: 5, borderRadius: 3, background: '#C04060' }} />
          <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>Periode</span>
        </div>
      </div>
    </Screen>
  );
}
