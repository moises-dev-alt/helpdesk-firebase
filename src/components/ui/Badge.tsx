import type { ReactNode } from 'react';
import { cn } from '../../utils/format';

export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'green' | 'amber' | 'rose' | 'blue' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200',
    blue: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200',
  };
  return <span className={cn('inline-flex rounded-full px-2 py-1 text-xs font-semibold', tones[tone])}>{children}</span>;
}
