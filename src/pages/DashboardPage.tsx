import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Clock, LifeBuoy, PauseCircle, Ticket } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useMemo } from 'react';
import { Badge } from '../components/ui/Badge';
import { SkeletonRows } from '../components/ui/Skeleton';
import { useTickets } from '../hooks/useTickets';
import { formatDate, priorityLabels, statusLabels } from '../utils/format';
import type { TicketStatus } from '../types';

const statusColors: Record<TicketStatus, string> = {
  OPEN: '#1787d5',
  IN_PROGRESS: '#f59e0b',
  WAITING_CUSTOMER: '#8b5cf6',
  RESOLVED: '#10b981',
  CLOSED: '#64748b',
};

export function DashboardPage() {
  const { tickets, loading } = useTickets();
  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((item) => item.status === 'OPEN').length,
    progress: tickets.filter((item) => item.status === 'IN_PROGRESS').length,
    waiting: tickets.filter((item) => item.status === 'WAITING_CUSTOMER').length,
    resolved: tickets.filter((item) => item.status === 'RESOLVED').length,
    critical: tickets.filter((item) => item.priority === 'CRITICAL').length,
  }), [tickets]);

  const statusData = Object.entries(statusLabels).map(([key, label]) => ({
    name: label,
    value: tickets.filter((ticket) => ticket.status === key).length,
    key,
  }));
  const priorityData = Object.entries(priorityLabels).map(([key, label]) => ({
    name: label,
    chamados: tickets.filter((ticket) => ticket.priority === key).length,
  }));

  if (loading) return <SkeletonRows />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {([
          ['Total', stats.total, Ticket, 'text-brand-600'],
          ['Abertos', stats.open, LifeBuoy, 'text-sky-600'],
          ['Em andamento', stats.progress, Clock, 'text-amber-600'],
          ['Aguardando', stats.waiting, PauseCircle, 'text-violet-600'],
          ['Resolvidos', stats.resolved, CheckCircle2, 'text-emerald-600'],
          ['Críticos', stats.critical, AlertTriangle, 'text-rose-600'],
        ] satisfies Array<[string, number, LucideIcon, string]>).map(([label, value, Icon, color]) => (
          <motion.div key={String(label)} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
              <Icon className={color} size={20} />
            </div>
            <strong className="mt-4 block text-3xl text-slate-900 dark:text-white">{value}</strong>
          </motion.div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="panel rounded-xl p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Chamados por status</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={110} label>
                  {statusData.map((entry) => <Cell key={entry.key} fill={statusColors[entry.key as TicketStatus]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel rounded-xl p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Prioridades</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="chamados" fill="#14b8a6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="panel rounded-xl p-5">
        <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Chamados recentes</h2>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {tickets.slice(0, 6).map((ticket) => (
            <div key={ticket.id} className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{ticket.title}</p>
                <p className="text-sm text-slate-500">{ticket.customerName} · {formatDate(ticket.createdAt)}</p>
              </div>
              <Badge tone={ticket.priority === 'CRITICAL' ? 'rose' : 'blue'}>{statusLabels[ticket.status]}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
