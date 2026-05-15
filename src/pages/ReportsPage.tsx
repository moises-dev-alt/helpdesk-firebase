import { Download } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useMemo } from 'react';
import { useTickets } from '../hooks/useTickets';
import { downloadCsv, priorityLabels, statusLabels, toDate } from '../utils/format';

export function ReportsPage() {
  const { tickets } = useTickets();
  const byStatus = Object.entries(statusLabels).map(([key, name]) => ({ name, total: tickets.filter((ticket) => ticket.status === key).length }));
  const byPriority = Object.entries(priorityLabels).map(([key, name]) => ({ name, total: tickets.filter((ticket) => ticket.priority === key).length }));
  const monthly = useMemo(() => {
    const map = new Map<string, number>();
    tickets.forEach((ticket) => {
      const date = toDate(ticket.createdAt);
      if (!date) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, total]) => ({ month, total }));
  }, [tickets]);

  function exportCsv() {
    downloadCsv('relatorio-chamados.csv', tickets.map((ticket) => ({
      titulo: ticket.title,
      cliente: ticket.customerName,
      tecnico: ticket.assigneeName,
      status: statusLabels[ticket.status],
      prioridade: priorityLabels[ticket.priority],
      categoria: ticket.category,
    })));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Relatórios</h1>
          <p className="text-sm text-slate-500">KPIs e gráficos operacionais exportáveis.</p>
        </div>
        <button className="btn-primary" type="button" onClick={exportCsv}><Download size={18} /> Exportar CSV</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <Kpi label="Total" value={tickets.length} />
        <Kpi label="Críticos" value={tickets.filter((item) => item.priority === 'CRITICAL').length} />
        <Kpi label="Resolvidos" value={tickets.filter((item) => item.status === 'RESOLVED').length} />
        <Kpi label="Fechados" value={tickets.filter((item) => item.status === 'CLOSED').length} />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Chart title="Status"><BarChart data={byStatus}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="total" fill="#1787d5" radius={[6, 6, 0, 0]} /></BarChart></Chart>
        <Chart title="Prioridade"><BarChart data={byPriority}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="total" fill="#14b8a6" radius={[6, 6, 0, 0]} /></BarChart></Chart>
      </div>
      <Chart title="Chamados por mês"><LineChart data={monthly}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis allowDecimals={false} /><Tooltip /><Line dataKey="total" stroke="#0f6db5" strokeWidth={3} /></LineChart></Chart>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return <div className="panel rounded-xl p-4"><p className="text-sm text-slate-500">{label}</p><strong className="mt-2 block text-3xl text-slate-900 dark:text-white">{value}</strong></div>;
}

function Chart({ title, children }: { title: string; children: React.ReactElement }) {
  return <div className="panel rounded-xl p-5"><h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">{title}</h2><div className="h-80"><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div></div>;
}
