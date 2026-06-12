// Inline Feather-style icons, ported 1:1 from the design mockup.
import type { ReactNode } from 'react';

export type IconName =
  | 'home'
  | 'cal'
  | 'chart'
  | 'clip'
  | 'moon'
  | 'zap'
  | 'weight'
  | 'run'
  | 'pill'
  | 'pulse'
  | 'drop'
  | 'clock'
  | 'back'
  | 'plus'
  | 'edit'
  | 'check'
  | 'download'
  | 'upload';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  sw?: number;
}

export function Icon({ name, size = 20, color = 'currentColor', sw = 1.8 }: IconProps) {
  const p = {
    stroke: color,
    fill: 'none',
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const shapes: Record<IconName, ReactNode> = {
    home: (
      <>
        <polygon points="3,9 12,2 21,9 21,22 3,22" {...p} />
        <polyline points="9,22 9,12 15,12 15,22" {...p} />
      </>
    ),
    cal: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" {...p} />
        <line x1="16" y1="2" x2="16" y2="6" {...p} />
        <line x1="8" y1="2" x2="8" y2="6" {...p} />
        <line x1="3" y1="10" x2="21" y2="10" {...p} />
      </>
    ),
    chart: (
      <>
        <line x1="18" y1="20" x2="18" y2="10" {...p} />
        <line x1="12" y1="20" x2="12" y2="4" {...p} />
        <line x1="6" y1="20" x2="6" y2="14" {...p} />
      </>
    ),
    clip: (
      <>
        <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" {...p} />
        <rect x="8" y="2" width="8" height="4" rx="1" {...p} />
        <line x1="9" y1="12" x2="15" y2="12" {...p} />
        <line x1="9" y1="16" x2="13" y2="16" {...p} />
      </>
    ),
    moon: <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" {...p} />,
    zap: <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" {...p} />,
    weight: (
      <>
        <circle cx="12" cy="10" r="5" {...p} />
        <polyline points="5,20 5,18 19,18 19,20" {...p} />
        <line x1="12" y1="15" x2="12" y2="18" {...p} />
      </>
    ),
    run: (
      <>
        <circle cx="16" cy="4" r="2" {...p} />
        <path d="M7 20l4-10 4 4 2-5 3 3" {...p} />
      </>
    ),
    pill: (
      <>
        <rect x="2" y="8" width="20" height="8" rx="4" {...p} />
        <line x1="12" y1="8" x2="12" y2="16" {...p} />
      </>
    ),
    pulse: <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" {...p} />,
    drop: <path d="M12 2L6.5 13.5a6 6 0 1011 0L12 2z" {...p} />,
    clock: (
      <>
        <circle cx="12" cy="12" r="10" {...p} />
        <polyline points="12,6 12,12 16,14" {...p} />
      </>
    ),
    back: <polyline points="15,18 9,12 15,6" {...p} />,
    plus: (
      <>
        <line x1="12" y1="5" x2="12" y2="19" {...p} />
        <line x1="5" y1="12" x2="19" y2="12" {...p} />
      </>
    ),
    edit: (
      <>
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" {...p} />
        <path d="M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4z" {...p} />
      </>
    ),
    check: <polyline points="20,6 9,17 4,12" {...p} />,
    download: (
      <>
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" {...p} />
        <polyline points="7,10 12,15 17,10" {...p} />
        <line x1="12" y1="15" x2="12" y2="3" {...p} />
      </>
    ),
    upload: (
      <>
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" {...p} />
        <polyline points="17,8 12,3 7,8" {...p} />
        <line x1="12" y1="3" x2="12" y2="15" {...p} />
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
      {shapes[name]}
    </svg>
  );
}
