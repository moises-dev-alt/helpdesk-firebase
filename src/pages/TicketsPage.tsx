import { Eye, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { SkeletonRows } from '../components/ui/Skeleton';
import { TicketForm, type TicketFormValues } from '../components/forms/TicketForm';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTickets } from '../hooks/useTickets';
import { useUsers } from '../hooks/useUsers';
import { createTicket, deleteTicket, updateTicket } from '../services/ticketService';
import { formatDate, priorityLabels, statusLabels } from '../utils/format';
import type { Ticket, UserProfile } from '../types';

export function TicketsPage() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const { tickets, loading } = useTickets();
  const { users } = useUsers();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const technicians = users.filter((user) => user.role === 'TECHNICIAN' && user.active);
  const canManage = profile?.role === 'ADMIN' || profile?.role === 'TECHNICIAN';

  const filtered = useMemo(() => statusFilter ? tickets.filter((ticket) => ticket.status === statusFilter) : tickets, [statusFilter, tickets]);

  const columns: Column<Ticket>[] = [
    { key: 'title', header: 'Título', sortable: true, render: (ticket) => <Link className="font-semibold text-brand-700 dark:text-brand-100" to={`/tickets/${ticket.id}`}>{ticket.title}</Link> },
    { key: 'customerName', header: 'Cliente', sortable: true },
    { key: 'priority', header: 'Prioridade', sortable: true, render: (ticket) => <Badge tone={ticket.priority === 'CRITICAL' ? 'rose' : ticket.priority === 'HIGH' ? 'amber' : 'slate'}>{priorityLabels[ticket.priority]}</Badge> },
    { key: 'status', header: 'Status', sortable: true, render: (ticket) => <Badge tone={ticket.status === 'RESOLVED' ? 'green' : ticket.status === 'WAITING_CUSTOMER' ? 'amber' : 'blue'}>{statusLabels[ticket.status]}</Badge> },
    { key: 'assigneeName', header: 'Técnico', render: (ticket) => ticket.assigneeName || '-' },
    { key: 'createdAt', header: 'Criado em', render: (ticket) => formatDate(ticket.createdAt) },
    { key: 'actions', header: 'Ações', render: (ticket) => (
      <div className="flex gap-2">
        <Link className="btn-secondary h-9 w-9 p-0" to={`/tickets/${ticket.id}`} aria-label="Visualizar"><Eye size={16} /></Link>
        {profile?.role === 'ADMIN' && <button className="btn-danger h-9 w-9 p-0" type="button" onClick={() => remove(ticket)} aria-label="Excluir"><Trash2 size={16} /></button>}
      </div>
    ) },
  ];

  async function submit(values: TicketFormValues) {
    if (!profile) return;
    try {
      if (editing) {
        const assignee = technicians.find((user) => user.uid === values.assigneeId);
        await updateTicket(editing.id, { ...values, assigneeName: assignee?.name ?? '', assigneeId: values.assigneeId ?? '' }, profile, 'Dados do chamado atualizados');
      } else {
        await createTicket({ ...values, priority: values.priority, customer: profile });
      }
      setOpen(false);
      setEditing(null);
      showToast('Chamado salvo.');
    } catch {
      showToast('Erro ao salvar chamado.', 'error');
    }
  }

  async function remove(ticket: Ticket) {
    if (!confirm(`Excluir o chamado "${ticket.title}"?`)) return;
    await deleteTicket(ticket.id);
    showToast('Chamado excluído.');
  }

  if (loading) return <SkeletonRows />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Chamados</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Crie, acompanhe, atribua e resolva chamados em tempo real.</p>
        </div>
        <button className="btn-primary" type="button" onClick={() => { setEditing(null); setOpen(true); }}><Plus size={18} /> Novo chamado</button>
      </div>
      <DataTable
        data={filtered as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchKeys={['title', 'customerName', 'category']}
        empty="Nenhum chamado encontrado"
        filters={<select className="input md:w-56" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">Todos os status</option>{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>}
      />
      <Modal open={open} title={editing ? 'Editar chamado' : 'Novo chamado'} onClose={() => setOpen(false)}>
        <TicketForm ticket={editing} technicians={technicians as UserProfile[]} canManage={Boolean(canManage && editing)} onSubmit={submit} />
      </Modal>
    </div>
  );
}
