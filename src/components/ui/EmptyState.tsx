import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-6 py-14 text-center dark:border-slate-700">
      <Inbox className="mb-3 text-slate-400" size={34} />
      <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
      {children && <p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">{children}</p>}
    </div>
  );
}
