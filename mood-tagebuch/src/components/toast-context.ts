import { createContext, useContext } from 'react';

export interface ToastCtxValue {
  show: (message: string) => void;
}

export const ToastContext = createContext<ToastCtxValue | null>(null);

export function useToast(): ToastCtxValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
