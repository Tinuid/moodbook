import { useEffect, useMemo, useState } from 'react';
import { Screen } from '../components/Screen';
import { MetricCard } from '../components/MetricCard';
import { DoseStepper } from '../components/DoseStepper';
import { Icon } from '../components/Icon';
import { useToast } from '../components/toast-context';
import { BackupSheet } from '../components/BackupSheet';
import { MOODS, PERIOD_INTENSITIES, PERIOD_LABELS } from '../lib/constants';
import { formatLong, greeting, todayISO } from '../lib/date';
import { cycleDay, cyclePhase } from '../lib/compute';
import { getAllEntries, getEntry, saveEntry } from '../db/entries';
import type {
  DailyEntry,
  MedicationDose,
  Mood,
  PeriodIntensity,
  SleepQuality,
} from '../types';

const SLEEP_NOTE: Record<SleepQuality, string> = {
  schlecht: 'Schlecht geschlafen',
  mittel: 'Mittel geschlafen',
  gut: 'Gut geschlafen',
};
const SLEEP_CYCLE: SleepQuality[] = ['schlecht', 'mittel', 'gut'];

function emptyEntry(date: string): DailyEntry {
  return {
    date,
    mood: 2,
    energy: 5,
    sleepHours: 7.5,
    sleepQuality: 'mittel',
    stress: 3,
    medications: [],
    period: { intensity: 'keine' },
  };
}

export function Heute() {
  const today = todayISO();
  const toast = useToast();

  const [entry, setEntry] = useState<DailyEntry>(() => emptyEntry(today));
  const [periodDates, setPeriodDates] = useState<string[]>([]);
  const [newTime, setNewTime] = useState('08:00');
  const [newDose, setNewDose] = useState(10);
  const [diaryOpen, setDiaryOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [existing, all] = await Promise.all([getEntry(today), getAllEntries()]);
      if (!alive) return;
      if (existing) setEntry({ period: { intensity: 'keine' }, ...existing });
      setPeriodDates(
        all
          .filter((e) => e.period && e.period.intensity !== 'keine')
          .map((e) => e.date),
      );
    })();
    return () => {
      alive = false;
    };
  }, [today]);

  const intensity: PeriodIntensity = entry.period?.intensity ?? 'keine';

  // Effective period history including today's unsaved selection.
  const cycle = useMemo(() => {
    const others = periodDates.filter((d) => d !== today);
    const effective = intensity !== 'keine' ? [...others, today] : others;
    const day = cycleDay(effective, today);
    return day != null ? { day, phase: cyclePhase(day) } : null;
  }, [periodDates, intensity, today]);

  function patch(p: Partial<DailyEntry>) {
    setEntry((e) => ({ ...e, ...p }));
  }

  function addDose() {
    if (entry.medications.some((m) => m.time === newTime)) {
      toast.show('Diese Uhrzeit existiert bereits');
      return;
    }
    const next: MedicationDose[] = [...entry.medications, { time: newTime, doseMg: newDose }].sort(
      (a, b) => a.time.localeCompare(b.time),
    );
    patch({ medications: next });
  }

  function removeDose(time: string) {
    patch({ medications: entry.medications.filter((m) => m.time !== time) });
  }

  async function save() {
    await saveEntry(entry);
    toast.show('Eintrag gespeichert ✓');
  }

  return (
    <Screen variant="a">
      {/* Header */}
      <div
        style={{
          padding: '14px 20px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{formatLong(today)}</div>
          <div style={{ fontSize: 20, fontWeight: 600, marginTop: 2 }}>{greeting()}</div>
        </div>
        <button
          aria-label="Daten & Sicherung"
          onClick={() => setBackupOpen(true)}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            background: 'var(--color-accent-bg)',
            border: '1.5px solid color-mix(in oklch, var(--color-accent) 30%, transparent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--color-accent)',
          }}
        >
          M
        </button>
      </div>

      {/* Mood selector */}
      <div
        style={{
          margin: '0 20px 12px',
          background: 'var(--color-card)',
          borderRadius: 16,
          padding: '12px 14px',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 9 }}>Wie war dein Tag?</div>
        <div style={{ display: 'flex', gap: 5 }}>
          {MOODS.map((m, i) => {
            const sel = entry.mood === i;
            return (
              <button
                key={i}
                onClick={() => patch({ mood: i as Mood })}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  padding: '7px 2px 6px',
                  borderRadius: 10,
                  background: sel ? m.bg : 'transparent',
                  border: sel
                    ? `1.5px solid ${m.color}55`
                    : '1.5px solid transparent',
                }}
              >
                <span style={{ fontSize: 20 }}>{m.emoji}</span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: sel ? 700 : 400,
                    color: sel ? m.color : 'var(--color-muted)',
                  }}
                >
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Metrics grid */}
      <div
        style={{
          padding: '0 20px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginBottom: 12,
        }}
      >
        <MetricCard
          icon="moon"
          label="Schlaf"
          value={entry.sleepHours}
          unit="h"
          step={0.5}
          min={0}
          max={24}
          note={SLEEP_NOTE[entry.sleepQuality]}
          onNoteClick={() =>
            patch({
              sleepQuality:
                SLEEP_CYCLE[(SLEEP_CYCLE.indexOf(entry.sleepQuality) + 1) % SLEEP_CYCLE.length],
            })
          }
          onChange={(v) => patch({ sleepHours: v ?? 0 })}
        />
        <MetricCard
          icon="zap"
          label="Energie"
          value={entry.energy}
          unit="/ 10"
          min={0}
          max={10}
          onChange={(v) => patch({ energy: v ?? 0 })}
        />
        <MetricCard
          icon="weight"
          label="Gewicht"
          value={entry.weight}
          unit="kg"
          step={0.1}
          min={0}
          onChange={(v) => patch({ weight: v })}
        />
        <MetricCard
          icon="run"
          label="Sport"
          value={entry.sportMinutes}
          unit="min"
          min={0}
          onChange={(v) => patch({ sportMinutes: v })}
        />
        <MetricCard
          icon="pulse"
          label="Stress"
          value={entry.stress}
          unit="/ 10"
          min={0}
          max={10}
          onChange={(v) => patch({ stress: v ?? 0 })}
        />
        <MetricCard
          icon="drop"
          label="Wasser"
          value={entry.water}
          unit="L"
          step={0.1}
          min={0}
          onChange={(v) => patch({ water: v })}
        />
      </div>

      {/* Periode */}
      <div
        style={{
          margin: '0 20px 12px',
          background: 'var(--color-card)',
          borderRadius: 16,
          padding: '12px 15px',
          border: '1px solid var(--color-border)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14 }}>🩸</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Periode
            </span>
          </div>
          {intensity !== 'keine' && cycle && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>
                Zyklus-Tag {cycle.day}
              </span>
              <span
                style={{
                  fontSize: 10,
                  background: cycle.phase.bg,
                  color: cycle.phase.color,
                  padding: '2px 8px',
                  borderRadius: 10,
                  fontWeight: 600,
                }}
              >
                {cycle.phase.label}
              </span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {PERIOD_INTENSITIES.map((key) => {
            const sel = intensity === key;
            return (
              <button
                key={key}
                onClick={() => patch({ period: { intensity: key } })}
                style={{
                  flex: 1,
                  padding: '7px 2px',
                  borderRadius: 10,
                  textAlign: 'center',
                  background: sel ? '#FAEAEA' : 'transparent',
                  border: sel ? '1.5px solid #C04060' : '1px solid var(--color-border)',
                  fontSize: 11,
                  fontWeight: sel ? 700 : 400,
                  color: sel ? '#C04060' : 'var(--color-muted)',
                }}
              >
                {PERIOD_LABELS[key]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Medikamente */}
      <div
        style={{
          margin: '0 20px 12px',
          background: 'var(--color-card)',
          borderRadius: 16,
          padding: '13px 15px',
          border: '1px solid var(--color-border)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="pill" size={13} color="var(--color-muted)" />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Medikamente
            </span>
          </div>
          <button
            aria-label="Einnahme hinzufügen"
            onClick={addDose}
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              background: 'var(--color-accent-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="plus" size={12} color="var(--color-accent)" />
          </button>
        </div>

        {/* Existing doses */}
        {entry.medications.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {entry.medications.map((e) => (
              <div
                key={e.time}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 10,
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  overflow: 'hidden',
                }}
              >
                <div style={{ width: 6, background: 'var(--color-green)', alignSelf: 'stretch' }} />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '9px 12px',
                    flex: 1,
                  }}
                >
                  <Icon name="clock" size={13} color="var(--color-muted)" />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{e.time}</span>
                  <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Uhr</span>
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-accent)' }}>
                    {e.doseMg} mg
                  </span>
                  <button
                    aria-label="Einnahme entfernen"
                    onClick={() => removeDose(e.time)}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      background: 'var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: 10, color: 'var(--color-muted)', lineHeight: 1 }}>
                      ×
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New dose */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 11 }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: 'var(--color-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 8,
            }}
          >
            Neue Einnahme
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <label
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '9px 11px',
                borderRadius: 10,
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
              }}
            >
              <Icon name="clock" size={13} color="var(--color-accent)" />
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-sans)',
                  width: '100%',
                }}
              />
            </label>
            <DoseStepper value={newDose} onChange={setNewDose} />
          </div>
          <button
            onClick={addDose}
            style={{
              width: '100%',
              background: 'var(--color-accent)',
              borderRadius: 10,
              padding: '9px',
              textAlign: 'center',
              color: 'white',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Hinzufügen
          </button>
        </div>
      </div>

      {/* Diary */}
      <button
        onClick={() => setDiaryOpen(true)}
        style={{
          display: 'block',
          textAlign: 'left',
          margin: '0 20px 12px',
          background: 'var(--color-card)',
          borderRadius: 16,
          padding: '12px 15px',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 7 }}>Mein Tag</div>
        <div
          style={{
            fontSize: 13,
            color: entry.diaryText ? 'var(--color-text)' : 'var(--color-muted)',
            lineHeight: 1.6,
            fontStyle: entry.diaryText ? 'normal' : 'italic',
            minHeight: 48,
            whiteSpace: 'pre-wrap',
          }}
        >
          {entry.diaryText || 'Was hat dich heute bewegt?'}
        </div>
      </button>

      {/* Save */}
      <div style={{ padding: '0 20px 14px' }}>
        <button
          onClick={save}
          style={{
            width: '100%',
            background: 'var(--color-accent)',
            borderRadius: 14,
            padding: '13px',
            textAlign: 'center',
            color: 'white',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Eintrag speichern
        </button>
      </div>

      {diaryOpen && (
        <DiaryEditor
          initial={entry.diaryText ?? ''}
          onClose={() => setDiaryOpen(false)}
          onSave={(text) => {
            patch({ diaryText: text || undefined });
            setDiaryOpen(false);
          }}
        />
      )}

      {backupOpen && <BackupSheet onClose={() => setBackupOpen(false)} />}
    </Screen>
  );
}

function DiaryEditor({
  initial,
  onClose,
  onSave,
}: {
  initial: string;
  onClose: () => void;
  onSave: (text: string) => void;
}) {
  const [text, setText] = useState(initial);
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--color-bg)',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 'var(--status-pad)',
        maxWidth: 480,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 20px 12px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <button onClick={onClose} style={{ fontSize: 14, color: 'var(--color-muted)' }}>
          Abbrechen
        </button>
        <span style={{ fontSize: 15, fontWeight: 600 }}>Mein Tag</span>
        <button
          onClick={() => onSave(text.trim())}
          style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-accent)' }}
        >
          Fertig
        </button>
      </div>
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Was hat dich heute bewegt?"
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          resize: 'none',
          padding: '18px 22px',
          fontFamily: 'var(--font-serif)',
          fontSize: 16,
          lineHeight: 1.9,
          color: 'var(--color-text)',
          background: 'transparent',
        }}
      />
    </div>
  );
}
