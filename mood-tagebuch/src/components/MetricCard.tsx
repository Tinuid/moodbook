import { useEffect, useRef, useState } from 'react';
import { Icon, type IconName } from './Icon';

interface MetricCardProps {
  icon: IconName;
  label: string;
  value: number | undefined;
  unit?: string;
  /** Optional secondary line; clickable when `onNoteClick` is given. */
  note?: string;
  onNoteClick?: () => void;
  /** Inline number editor config. */
  step?: number;
  min?: number;
  max?: number;
  placeholder?: string;
  onChange: (value: number | undefined) => void;
}

export function MetricCard({
  icon,
  label,
  value,
  unit,
  note,
  onNoteClick,
  step = 1,
  min,
  max,
  placeholder = '–',
  onChange,
}: MetricCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function startEdit() {
    setDraft(value != null ? String(value) : '');
    setEditing(true);
  }

  function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed === '') {
      onChange(undefined);
      return;
    }
    const n = Number(trimmed.replace(',', '.'));
    if (Number.isNaN(n)) return;
    let clamped = n;
    if (min != null) clamped = Math.max(min, clamped);
    if (max != null) clamped = Math.min(max, clamped);
    onChange(clamped);
  }

  return (
    <div
      style={{
        background: 'var(--color-card)',
        borderRadius: 14,
        padding: '11px 13px',
        border: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 1 }}>
        <Icon name={icon} size={12} color="var(--color-muted)" />
        <span
          style={{
            fontSize: 9,
            fontWeight: 600,
            color: 'var(--color-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        {editing ? (
          <input
            ref={inputRef}
            type="number"
            inputMode="decimal"
            step={step}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') setEditing(false);
            }}
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: 'var(--color-text)',
              width: 64,
              border: 'none',
              borderBottom: '1.5px solid var(--color-accent)',
              background: 'transparent',
              outline: 'none',
              padding: 0,
              fontFamily: 'var(--font-sans)',
            }}
          />
        ) : (
          <button
            onClick={startEdit}
            style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.1 }}
          >
            {value != null ? value : placeholder}
          </button>
        )}
        {unit && <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>{unit}</span>}
      </div>
      {note != null &&
        (onNoteClick ? (
          <button
            onClick={onNoteClick}
            style={{ fontSize: 10, color: 'var(--color-muted)', textAlign: 'left' }}
          >
            {note}
          </button>
        ) : (
          <span style={{ fontSize: 10, color: 'var(--color-muted)' }}>{note}</span>
        ))}
    </div>
  );
}
