import { NavLink } from 'react-router-dom';
import { Icon, type IconName } from './Icon';

const TABS: { to: string; icon: IconName; label: string }[] = [
  { to: '/', icon: 'home', label: 'Heute' },
  { to: '/verlauf', icon: 'cal', label: 'Verlauf' },
  { to: '/statistiken', icon: 'chart', label: 'Statistiken' },
  { to: '/eindosierung', icon: 'clip', label: 'Eindosierung' },
];

export function BottomNav() {
  return (
    <nav
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-card)',
        paddingBottom: 'calc(4px + var(--safe-bottom))',
        zIndex: 10,
        maxWidth: 480,
        margin: '0 auto',
      }}
    >
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.to === '/'}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            padding: '9px 0',
            textDecoration: 'none',
            color: isActive ? 'var(--color-accent)' : 'var(--color-subtle)',
          })}
        >
          {({ isActive }) => (
            <>
              <Icon
                name={t.icon}
                size={20}
                color={isActive ? 'var(--color-accent)' : 'var(--color-subtle)'}
              />
              <span style={{ fontSize: 9, fontWeight: 500 }}>{t.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
