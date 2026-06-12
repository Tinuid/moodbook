interface NumRowProps {
  /** Currently selected value 0–10, or null when unrated. */
  selected: number | null;
  /** Fill colour for the selected cell. */
  color: string;
  /** Tap a number to select; tap the selected one again to clear. */
  onSelect: (value: number | null) => void;
}

/** 0–10 selector row used across the Eindosierung screens. */
export function NumRow({ selected, color, onSelect }: NumRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        marginTop: 7,
      }}
    >
      {Array.from({ length: 11 }, (_, n) => {
        const active = n === selected;
        return (
          <button
            key={n}
            onClick={() => onSelect(active ? null : n)}
            style={{
              flex: 1,
              height: 28,
              background: active ? color : 'transparent',
              borderRight: n < 10 ? '1px solid var(--color-border)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: active ? 700 : 400,
              color: active ? 'white' : 'var(--color-muted)',
            }}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
