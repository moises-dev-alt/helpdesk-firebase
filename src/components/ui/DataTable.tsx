import { ArrowDownUp, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchKeys,
  filters,
  empty,
}: {
  data: T[];
  columns: Column<T>[];
  searchKeys: (keyof T)[];
  filters?: ReactNode;
  empty: string;
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string>('');
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc');
  const perPage = 8;

  const filtered = useMemo(() => {
    const needle = search.toLowerCase();
    const rows = data.filter((row) => searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(needle)));
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const left = String(a[sortKey] ?? '');
      const right = String(b[sortKey] ?? '');
      return direction === 'asc' ? left.localeCompare(right) : right.localeCompare(left);
    });
  }, [data, direction, search, searchKeys, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage);

  function sort(column: Column<T>) {
    if (!column.sortable) return;
    const key = String(column.key);
    if (sortKey === key) setDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setDirection('asc');
    }
  }

  return (
    <div className="panel overflow-hidden rounded-xl">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
          <input className="input pl-9" placeholder="Buscar" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        </div>
        {filters}
      </div>
      {pageRows.length === 0 ? (
        <div className="p-6"><EmptyState title={empty}>Ajuste os filtros ou crie um novo registro.</EmptyState></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950/50 dark:text-slate-400">
              <tr>
                {columns.map((column) => (
                  <th key={String(column.key)} className="px-4 py-3">
                    <button type="button" className="inline-flex items-center gap-1 font-bold" onClick={() => sort(column)}>
                      {column.header}
                      {column.sortable && <ArrowDownUp size={13} />}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pageRows.map((row, index) => (
                <tr key={String(row.id ?? index)} className="text-slate-700 dark:text-slate-200">
                  {columns.map((column) => (
                    <td key={String(column.key)} className="px-4 py-3 align-middle">
                      {column.render ? column.render(row) : String(row[column.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-slate-800">
        <span>{filtered.length} registros</span>
        <div className="flex items-center gap-2">
          <button className="btn-secondary h-9 w-9 p-0" type="button" disabled={page === 1} onClick={() => setPage((item) => item - 1)}><ChevronLeft size={16} /></button>
          <span>{page} / {totalPages}</span>
          <button className="btn-secondary h-9 w-9 p-0" type="button" disabled={page === totalPages} onClick={() => setPage((item) => item + 1)}><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}
