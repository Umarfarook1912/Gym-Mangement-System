import { createContext, useContext, useMemo, useState } from 'react';
import { TIME } from '../constants';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const api = useMemo(() => {
    function push(message, tone = 'success') {
      const id = crypto.randomUUID();
      setToasts((current) => {
        if (current.some((item) => item.message === message && item.tone === tone)) return current;
        return [...current, { id, message, tone }];
      });
      setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, TIME.TOAST_DURATION);
    }

    return {
      push,
      success: (message) => push(message, 'success'),
      error: (message) => push(message, 'error'),
    };
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed right-4 top-4 z-[70] flex w-[min(100%-2rem,22rem)] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-xl border px-4 py-3 text-sm shadow-card ${
              toast.tone === 'error' ? 'border-danger/40 bg-surface text-danger' : 'border-primary/40 bg-surface text-secondary'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
