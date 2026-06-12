import type { ReactNode } from 'react';

interface ScreenProps {
  /** 'a' = warm paper background (Heute), 'b' = #FEFCFA (the other screens). */
  variant?: 'a' | 'b';
  children: ReactNode;
}

/**
 * Common screen shell: sets the background, the iOS status-bar top padding,
 * and reserves space at the bottom for the fixed tab bar.
 */
export function Screen({ variant = 'a', children }: ScreenProps) {
  return (
    <div
      style={{
        background: variant === 'a' ? 'var(--color-bg)' : 'var(--color-bg-b)',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-sans)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        paddingTop: 'var(--status-pad)',
        paddingBottom: 'calc(var(--tabbar-height) + var(--safe-bottom))',
        maxWidth: 480,
        margin: '0 auto',
      }}
    >
      {children}
    </div>
  );
}
