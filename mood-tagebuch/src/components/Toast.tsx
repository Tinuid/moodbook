import { useCallback, useRef, useState, type ReactNode } from 'react';
import { ToastContext } from './toast-context';

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((msg: string) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(msg);
    setVisible(true);
    timer.current = setTimeout(() => setVisible(false), 1800);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {message && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            bottom: 'calc(var(--tabbar-height) + var(--safe-bottom) + 16px)',
            transform: `translateX(-50%) translateY(${visible ? '0' : '8px'})`,
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.22s ease, transform 0.22s ease',
            background: 'var(--color-text)',
            color: 'white',
            fontSize: 13,
            fontWeight: 500,
            padding: '10px 18px',
            borderRadius: 12,
            zIndex: 50,
            pointerEvents: 'none',
            boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
            maxWidth: '80vw',
            textAlign: 'center',
          }}
        >
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}
