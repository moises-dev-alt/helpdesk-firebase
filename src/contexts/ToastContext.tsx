import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

type ToastType = 'success' | 'error';
interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<{ showToast: (message: string, type?: ToastType) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const value = useMemo(
    () => ({
      showToast: (message: string, type: ToastType = 'success') => {
        const id = crypto.randomUUID();
        setToasts((items) => [...items, { id, message, type }]);
        window.setTimeout(() => setToasts((items) => items.filter((toast) => toast.id !== id)), 4200);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 space-y-3">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = toast.type === 'success' ? CheckCircle2 : XCircle;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 24 }}
                className="panel flex min-w-72 items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-800 dark:text-slate-100"
              >
                <Icon className={toast.type === 'success' ? 'text-emerald-500' : 'text-rose-500'} size={18} />
                {toast.message}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast deve ser usado dentro de ToastProvider');
  return context;
}
