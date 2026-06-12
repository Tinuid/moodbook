import { useEffect, useMemo, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { Screen } from '../components/Screen';
import { Icon } from '../components/Icon';
import { NumRow } from '../components/NumRow';
import { useToast } from '../components/toast-context';
import {
  ALL_SYMPTOMS,
  HAUPT_SYMPTOME,
  NEBEN_SYMPTOME,
  WEEKDAYS_SHORT,
} from '../lib/constants';
import { formatDayMonth, formatShort, todayISO, weekDates } from '../lib/date';
import {
  daySum,
  symptomAverages,
  titrationWeek,
  weekSumAverage,
  type SymptomAverage,
} from '../lib/compute';
import { getEindoEntry, saveEindoEntry } from '../db/eindosierung';
import { db } from '../db/schema';
import { getTitrationStart, setTitrationStart } from '../db/settings';
import type { EindosierungEntry } from '../types';

const ACCENT = 'var(--color-accent)';
const AMBER = 'var(--color-amber)';

export function Eindosierung() {
  const today = todayISO();
  const toast = useToast();
  const [tab, setTab] = useState(0);
  const [start, setStart] = useState<string | undefined>();
  const [values, setValues] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(ALL_SYMPTOMS.map((s) => [s.name, null])),
  );
  const [weekEntries, setWeekEntries] = useState<EindosierungEntry[]>([]);

  const week = start ? titrationWeek(start, today) : 1;
  const weekIsoDates = useMemo(() => weekDates(today), [today]);

  async function reload() {
    const todayEntry = await getEindoEntry(today);
    if (todayEntry) {
      const map: Record<string, number | null> = Object.fromEntries(
        ALL_SYMPTOMS.map((s) => [s.name, null]),
      );
      for (const sym of todayEntry.symptoms) map[sym.name] = sym.value;
      setValues(map);
    }
    const all = await db.eindosierungEntries
      .where('date')
      .between(weekIsoDates[0], weekIsoDates[6], true, true)
      .sortBy('date');
    setWeekEntries(all);
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      let s = await getTitrationStart();
      if (!s) {
        // Begin titration numbering on first visit.
        await setTitrationStart(today);
        s = today;
      }
      if (alive) setStart(s);
      if (alive) await reload();
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);

  async function save() {
    const entry: EindosierungEntry = {
      date: today,
      week,
      symptoms: ALL_SYMPTOMS.map((s) => ({
        name: s.name,
        group: s.group,
        value: values[s.name],
      })),
    };
    await saveEindoEntry(entry);
    await reload();
    toast.show('Eindosierung gespeichert ✓');
  }

  return (
    <Screen variant="b">
      {/* Header */}
      <div style={{ padding: '13px 24px 12px', borderBottom: '1px solid var(--color-border)' }}>
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 12,
            color: 'var(--color-muted)',
            fontStyle: 'italic',
          }}
        >
          Woche {week} der Eindosierungsphase
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 300, marginTop: 3 }}>
          {tab === 0 ? formatShort(today) : 'Wochenschnitt'}
        </div>
      </div>

      <WeekDots dates={weekIsoDates} today={today} entryDates={new Set(weekEntries.map((e) => e.date))} />
      <EindoTabs active={tab} onChange={setTab} />

      {tab === 0 ? (
        <Tageseintrag values={values} setValues={setValues} today={today} onSave={save} />
      ) : (
        <Wochenschnitt entries={weekEntries} />
      )}
    </Screen>
  );
}

// --- Week progress dots ------------------------------------------------------

function WeekDots({
  dates,
  today,
  entryDates,
}: {
  dates: string[];
  today: string;
  entryDates: Set<string>;
}) {
  return (
    <div
      style={{
        padding: '11px 16px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        gap: 4,
      }}
    >
      {dates.map((iso, i) => {
        const done = entryDates.has(iso);
        const isToday = iso === today;
        const bg = done ? 'var(--color-green)' : isToday ? ACCENT : 'var(--color-border)';
        return (
          <div
            key={iso}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}
          >
            <span style={{ fontSize: 9, color: 'var(--color-muted)', fontWeight: 500 }}>
              {WEEKDAYS_SHORT[i]}
            </span>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                background: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {done && <Icon name="check" size={12} color="white" />}
              {!done && isToday && (
                <span style={{ fontSize: 9, color: 'white', fontWeight: 700 }}>H</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EindoTabs({ active, onChange }: { active: number; onChange: (i: number) => void }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
      {['Tageseintrag', 'Wochenschnitt'].map((lbl, i) => (
        <button
          key={lbl}
          onClick={() => onChange(i)}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '11px 0',
            borderBottom: i === active ? `2px solid ${ACCENT}` : '2px solid transparent',
            color: i === active ? ACCENT : 'var(--color-muted)',
            fontSize: 13,
            fontWeight: i === active ? 600 : 400,
          }}
        >
          {lbl}
        </button>
      ))}
    </div>
  );
}

// --- Tab: Tageseintrag -------------------------------------------------------

function SectionLabel({ text, color }: { text: string; color: string }) {
  return (
    <div style={{ padding: '10px 20px 0' }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 4,
        }}
      >
        {text}
      </div>
    </div>
  );
}

function SymptomCard({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        margin: '0 20px',
        borderRadius: 12,
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        background: 'var(--color-card)',
      }}
    >
      {children}
    </div>
  );
}

function Tageseintrag({
  values,
  setValues,
  today,
  onSave,
}: {
  values: Record<string, number | null>;
  setValues: Dispatch<SetStateAction<Record<string, number | null>>>;
  today: string;
  onSave: () => void;
}) {
  const sum = daySum(
    ALL_SYMPTOMS.map((s) => ({ name: s.name, group: s.group, value: values[s.name] })),
  );

  function set(name: string, v: number | null) {
    setValues((prev) => ({ ...prev, [name]: v }));
  }

  return (
    <>
      {/* Scale hint */}
      <div
        style={{
          padding: '7px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          background: 'var(--color-bg)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <span style={{ fontSize: 10, color: 'var(--color-muted)' }}>0 = nicht vorhanden</span>
        <span style={{ fontSize: 10, color: 'var(--color-muted)' }}>10 = sehr stark</span>
      </div>

      <SectionLabel text="Hauptsymptome (ADHS)" color={ACCENT} />
      <SymptomCard>
        {HAUPT_SYMPTOME.map((name) => (
          <div key={name} style={{ padding: '11px 14px 12px', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{name}</div>
            <NumRow selected={values[name]} color={ACCENT} onSelect={(v) => set(name, v)} />
          </div>
        ))}
      </SymptomCard>

      <SectionLabel text="Nebenwirkungen" color={AMBER} />
      <SymptomCard>
        {NEBEN_SYMPTOME.map((name) => (
          <div key={name} style={{ padding: '11px 14px 12px', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 13, fontWeight: 400 }}>{name}</div>
            <NumRow selected={values[name]} color={AMBER} onSelect={(v) => set(name, v)} />
          </div>
        ))}
      </SymptomCard>

      {/* Tagessumme */}
      <div
        style={{
          margin: '13px 20px',
          padding: '13px 18px',
          borderRadius: 14,
          background: 'var(--color-accent-bg)',
          border: '1px solid color-mix(in oklch, var(--color-accent) 30%, transparent)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: ACCENT,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Tagessumme
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 2 }}>
            {formatShort(today).replace(/,.*$/, '')}, {formatDayMonth(today)}
          </div>
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, color: ACCENT }}>{sum}</div>
      </div>

      <div style={{ padding: '0 20px 14px' }}>
        <button
          onClick={onSave}
          style={{
            width: '100%',
            background: ACCENT,
            borderRadius: 14,
            padding: '13px',
            textAlign: 'center',
            color: 'white',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Heute speichern
        </button>
      </div>
    </>
  );
}

// --- Tab: Wochenschnitt ------------------------------------------------------

function Wochenschnitt({ entries }: { entries: EindosierungEntry[] }) {
  const hauptAvgs = symptomAverages(entries, HAUPT_SYMPTOME);
  const nebenAvgs = symptomAverages(entries, NEBEN_SYMPTOME);
  const gesamt = (weekSumAverage(hauptAvgs) + weekSumAverage(nebenAvgs)).toFixed(1);
  const filled = entries.length;

  return (
    <>
      {/* Legend */}
      <div
        style={{
          padding: '8px 20px 7px',
          background: 'var(--color-bg)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: ACCENT, opacity: 0.8 }} />
          <span style={{ fontSize: 10, color: 'var(--color-muted)' }}>eingetragen</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--color-border)' }} />
          <span style={{ fontSize: 10, color: 'var(--color-muted)' }}>noch offen</span>
        </div>
        <span style={{ fontSize: 10, color: 'var(--color-muted)', marginLeft: 'auto' }}>
          {filled} / 7 Tage
        </span>
      </div>

      <SectionLabel text="Hauptsymptome (ADHS)" color={ACCENT} />
      <SymptomCard>
        {hauptAvgs.map((s) => (
          <AvgRow key={s.name} data={s} color={ACCENT} isHaupt />
        ))}
      </SymptomCard>

      <SectionLabel text="Nebenwirkungen" color={AMBER} />
      <SymptomCard>
        {nebenAvgs.map((s) => (
          <AvgRow key={s.name} data={s} color={AMBER} isHaupt={false} />
        ))}
      </SymptomCard>

      {/* Ø Wochensumme */}
      <div
        style={{
          margin: '13px 20px',
          padding: '13px 18px',
          borderRadius: 14,
          background: 'var(--color-accent-bg)',
          border: '1px solid color-mix(in oklch, var(--color-accent) 30%, transparent)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: ACCENT,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Ø Wochensumme
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 2 }}>
            Bisher {filled} {filled === 1 ? 'Tag' : 'Tage'} eingetragen
          </div>
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, color: ACCENT }}>{gesamt}</div>
      </div>
    </>
  );
}

function AvgRow({
  data,
  color,
  isHaupt,
}: {
  data: SymptomAverage;
  color: string;
  isHaupt: boolean;
}) {
  const filledValues = data.values; // one slot per saved day, left-aligned
  return (
    <div
      style={{
        padding: '11px 14px 12px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: isHaupt ? 600 : 400, marginBottom: 6 }}>
          {data.name}
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          {Array.from({ length: 7 }).map((_, i) => {
            const v = i < filledValues.length ? filledValues[i] : undefined;
            const has = v != null;
            return (
              <div
                key={i}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 5,
                  background: has ? color : 'var(--color-border)',
                  opacity: has ? 0.4 + (v as number) / 10 * 0.6 : 0.25,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {has && <span style={{ fontSize: 9, color: 'white', fontWeight: 700 }}>{v}</span>}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color }}>
          {data.avg != null ? data.avg.toFixed(1) : '–'}
        </div>
        <div style={{ fontSize: 9, color: 'var(--color-muted)' }}>Ø / Tag</div>
      </div>
    </div>
  );
}
