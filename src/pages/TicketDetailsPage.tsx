import { Paperclip, Save, Send, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { TicketForm, type TicketFormValues } from '../components/forms/TicketForm';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useUsers } from '../hooks/useUsers';
import { appendAttachments, addComment, subscribeComments, subscribeTicket, updateTicket } from '../services/ticketService';
import { uploadTicketAttachments } from '../services/storageService';
import { formatDate, priorityLabels, statusLabels } from '../utils/format';
import type { Comment, Ticket } from '../types';

export function TicketDetailsPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const { showToast } = useToast();
  const { users } = useUsers();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const technicians = users.filter((user) => user.role === 'TECHNICIAN' && user.active);
  const canManage = profile?.role === 'ADMIN' || profile?.role === 'TECHNICIAN';

  useEffect(() => {
    if (!id) return undefined;
    return subscribeTicket(id, setTicket);
  }, [id]);

  useEffect(() => {
    if (!id) return undefined;
    return subscribeComments(id, setComments);
  }, [id]);

  async function submit(values: TicketFormValues) {
    if (!profile || !ticket) return;
    const assignee = technicians.find((user) => user.uid === values.assigneeId);
    await updateTicket(ticket.id, { ...values, assigneeId: values.assigneeId ?? '', assigneeName: assignee?.name ?? '' }, profile, 'Chamado editado');
    showToast('Chamado atualizado.');
  }

  async function sendComment() {
    if (!id || !profile || !message.trim()) return;
    await addComment(id, profile, message.trim());
    setMessage('');
    showToast('Comentário enviado.');
  }

  async function uploadFiles() {
    if (!id || !profile || !files || files.length === 0) return;
    const attachments = await uploadTicketAttachments(id, Array.from(files));
    await appendAttachments(id, attachments, profile);
    setFiles(null);
    showToast('Anexos enviados.');
  }

  if (!ticket) return <EmptyState title="Chamado não encontrado">Verifique se o registro existe e se você possui acesso.</EmptyState>;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <Link to="/tickets" className="text-sm font-semibold text-brand-700 dark:text-brand-100">Voltar para chamados</Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{ticket.title}</h1>
          <p className="text-sm text-slate-500">Criado por {ticket.customerName} em {formatDate(ticket.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <Badge tone={ticket.priority === 'CRITICAL' ? 'rose' : 'amber'}>{priorityLabels[ticket.priority]}</Badge>
          <Badge tone={ticket.status === 'RESOLVED' ? 'green' : 'blue'}>{statusLabels[ticket.status]}</Badge>
        </div>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <div className="panel rounded-xl p-5">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Dados do chamado</h2>
            <TicketForm ticket={ticket} technicians={technicians} canManage={Boolean(canManage)} onSubmit={submit} />
          </div>
          <div className="panel rounded-xl p-5">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Comentários</h2>
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-sm text-slate-900 dark:text-white">{comment.authorName}</strong>
                    <span className="text-xs text-slate-500">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{comment.message}</p>
                </div>
              ))}
              {comments.length === 0 && <EmptyState title="Sem comentários" />}
            </div>
            <div className="mt-4 flex gap-2">
              <input className="input" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Escreva um comentário" />
              <button className="btn-primary" type="button" onClick={sendComment}><Send size={17} /></button>
            </div>
          </div>
        </div>
        <aside className="space-y-5">
          <div className="panel rounded-xl p-5">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Anexos</h2>
            <div className="space-y-2">
              {ticket.attachments?.map((file) => (
                <a key={file.path} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-brand-700 dark:border-slate-700 dark:text-brand-100" href={file.url} target="_blank" rel="noreferrer">
                  <Paperclip size={16} /> {file.name}
                </a>
              ))}
              {ticket.attachments?.length === 0 && <p className="text-sm text-slate-500">Nenhum anexo enviado.</p>}
            </div>
            <label className="mt-4 block">
              <span className="label">Enviar arquivos</span>
              <input className="input mt-1" type="file" multiple onChange={(event) => setFiles(event.target.files)} />
            </label>
            <button className="btn-secondary mt-3 w-full" type="button" onClick={uploadFiles}><Upload size={17} /> Enviar anexos</button>
          </div>
          <div className="panel rounded-xl p-5">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Histórico</h2>
            <div className="space-y-3">
              {ticket.history?.map((item, index) => (
                <div key={`${item.action}-${index}`} className="border-l-2 border-brand-500 pl-3">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.action}</p>
                  <p className="text-xs text-slate-500">{item.actorName} · {formatDate(item.at)}</p>
                </div>
              ))}
            </div>
          </div>
          <button className="btn-secondary hidden w-full" type="button"><Save size={17} /> Salvo automaticamente</button>
        </aside>
      </div>
    </div>
  );
}
