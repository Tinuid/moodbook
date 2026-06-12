interface DoseStepperProps {
  /** Dose in mg (multiple of 10). */
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
}

/** −/value/+ stepper for medication dose, stepping in 10 mg increments. */
export function DoseStepper({ value, onChange, step = 10, min = 10 }: DoseStepperProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        borderRadius: 10,
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg)',
        overflow: 'hidden',
      }}
    >
      <button
        aria-label="Dosis verringern"
        onClick={() => onChange(Math.max(min, value - step))}
        style={{
          width: 34,
          height: 38,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        <span style={{ fontSize: 18, color: 'var(--color-muted)', lineHeight: 1 }}>−</span>
      </button>
      <div
        style={{
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 60,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-accent)' }}>
          {value} mg
        </span>
      </div>
      <button
        aria-label="Dosis erhöhen"
        onClick={() => onChange(value + step)}
        style={{
          width: 34,
          height: 38,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderLeft: '1px solid var(--color-border)',
          background: 'var(--color-accent-bg)',
        }}
      >
        <span style={{ fontSize: 18, color: 'var(--color-accent)', lineHeight: 1 }}>+</span>
      </button>
    </div>
  );
}
