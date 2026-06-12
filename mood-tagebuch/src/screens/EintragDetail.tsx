import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Screen } from '../components/Screen';
import { Icon, type IconName } from '../components/Icon';
import { MOODS, PERIOD_LABELS } from '../lib/constants';
import { formatDayMonthYear, todayISO, weekdayLong } from '../lib/date';
import { cycleDay, periodDatesOf, totalDose } from '../lib/compute';
import { getAllEntries, getEntry } from '../db/entries';
import type { DailyEntry } from '../types';

interface StripItem {
  icon: IconName;
  v: string;
}

function buildStrip(entry: DailyEntry): StripItem[] {
  const items: StripItem[] = [
    { icon: 'moon', v: `${entry.sleepHours} h` },
    { icon: 'zap', v: `${entry.energy}/10` },
  ];
  if (entry.sportMinutes != null) items.push({ icon: 'run', v: `${entry.sportMinutes} Min` });
  items.push({ icon: 'pulse', v: `${entry.stress}/10` });
  if (entry.weight != null) items.push({ icon: 'weight', v: `${entry.weight}` });
  if (entry.medications.length > 0) items.push({ icon: 'pill', v: `${totalDose(entry)} mg` });
  return items;
}

function pullQuote(text: string): string {
  const match = text.match(/^.*?[.!?](?=\s|$)/);
  const first = (match ? match[0] : text).trim();
  return first.length > 140 ? first.slice(0, 140).trimEnd() + '…' : first;
}

export function EintragDetail() {
  const { date = '' } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<DailyEntry | null | undefined>(undefined);
  const [cycle, setCycle] = useState<number | undefined>();

  useEffect(() => {
    let alive = true;
    (async () => {
      const [e, all] = await Promise.all([getEntry(date), getAllEntries()]);
      if (!alive) return;
      if (!e && date === todayISO()) {
        navigate('/', { replace: true });
        return;
      }
      setEntry(e ?? null);
      if (e?.period && e.period.intensity !== 'keine') {
        setCycle(cycleDay(periodDatesOf(all), date));
      }
    })();
    return () => {
      alive = false;
    };
  }, [date, navigate]);

  if (entry === undefined) return <Screen variant="b">{null}</Screen>;

  const paragraphs = (entry?.diaryText ?? '').split(/\n{1,}/).filter((p) => p.trim());

  return (
    <Screen variant="b">
      {/* Nav header */}
      <div
        style={{
          padding: '12px 24px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <button aria-label="Zurück" onClick={() => navigate(-1)} style={{ display: 'flex' }}>
          <Icon name="back" size={18} color="var(--color-muted)" />
        </button>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 12,
              color: 'var(--color-muted)',
            }}
          >
            {weekdayLong(date)}
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 400 }}>
            {formatDayMonthYear(date)}
          </div>
        </div>
        {entry && <span style={{ fontSize: 24 }}>{MOODS[entry.mood].emoji}</span>}
      </div>

      {!entry ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
            textAlign: 'center',
            color: 'var(--color-muted)',
            fontSize: 14,
          }}
        >
          Für diesen Tag gibt es noch keinen Eintrag.
        </div>
      ) : (
        <>
          {entry.diaryText && (
            <div
              style={{
                margin: '20px 24px 18px',
                paddingLeft: 16,
                borderLeft: '3px solid var(--color-accent)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: 16,
                  lineHeight: 1.65,
                }}
              >
                „{pullQuote(entry.diaryText)}"
              </div>
            </div>
          )}

          {/* Metric strip */}
          <div
            style={{
              padding: entry.diaryText ? '0 24px 18px' : '20px 24px 18px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              gap: 18,
              flexWrap: 'wrap',
            }}
          >
            {buildStrip(entry).map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name={m.icon} size={14} color="var(--color-accent)" />
                <span style={{ fontSize: 12, fontWeight: 500 }}>{m.v}</span>
              </div>
            ))}
            {entry.period && entry.period.intensity !== 'keine' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13 }}>🩸</span>
                <span style={{ fontSize: 12, fontWeight: 500 }}>
                  {PERIOD_LABELS[entry.period.intensity]}
                  {cycle != null ? ` · Tag ${cycle}` : ''}
                </span>
              </div>
            )}
          </div>

          {/* Diary body */}
          <div style={{ padding: '18px 24px', flex: 1 }}>
            {paragraphs.length > 0 ? (
              paragraphs.map((p, i) => (
                <div
                  key={i}
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 15,
                    lineHeight: 1.9,
                    marginTop: i === 0 ? 0 : 16,
                  }}
                >
                  {p}
                </div>
              ))
            ) : (
              <div style={{ fontSize: 13, color: 'var(--color-muted)', fontStyle: 'italic' }}>
                Kein Tagebuchtext für diesen Tag.
              </div>
            )}
          </div>
        </>
      )}
    </Screen>
  );
}
