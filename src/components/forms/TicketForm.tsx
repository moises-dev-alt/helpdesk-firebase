import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect } from 'react';
import type { Ticket, TicketPriority, TicketStatus, UserProfile } from '../../types';

const schema = z.object({
  title: z.string().min(4, 'Informe um título maior'),
  description: z.string().min(10, 'Descreva o problema'),
  category: z.string().min(2, 'Informe a categoria'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED']).optional(),
  assigneeId: z.string().optional(),
});

export type TicketFormValues = z.infer<typeof schema>;

export function TicketForm({
  ticket,
  technicians,
  canManage,
  onSubmit,
}: {
  ticket?: Ticket | null;
  technicians: UserProfile[];
  canManage: boolean;
  onSubmit: (values: TicketFormValues) => Promise<void>;
}) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TicketFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      priority: 'MEDIUM',
      status: 'OPEN',
      assigneeId: '',
    },
  });

  useEffect(() => {
    if (ticket) {
      reset({
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        assigneeId: ticket.assigneeId ?? '',
      });
    }
  }, [reset, ticket]);

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <label>
        <span className="label">Título</span>
        <input className="input mt-1" {...register('title')} />
        {errors.title && <span className="text-xs text-rose-500">{errors.title.message}</span>}
      </label>
      <label>
        <span className="label">Descrição</span>
        <textarea className="input mt-1 min-h-32" {...register('description')} />
        {errors.description && <span className="text-xs text-rose-500">{errors.description.message}</span>}
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="label">Categoria</span>
          <input className="input mt-1" {...register('category')} placeholder="Hardware, acesso, financeiro..." />
          {errors.category && <span className="text-xs text-rose-500">{errors.category.message}</span>}
        </label>
        <label>
          <span className="label">Prioridade</span>
          <select className="input mt-1" {...register('priority')}>
            {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] satisfies TicketPriority[]).map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </div>
      {canManage && (
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="label">Status</span>
            <select className="input mt-1" {...register('status')}>
              {(['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED'] satisfies TicketStatus[]).map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span className="label">Técnico</span>
            <select className="input mt-1" {...register('assigneeId')}>
              <option value="">Sem responsável</option>
              {technicians.map((user) => <option key={user.uid} value={user.uid}>{user.name}</option>)}
            </select>
          </label>
        </div>
      )}
      <div className="flex justify-end gap-2">
        <button className="btn-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar chamado'}</button>
      </div>
    </form>
  );
}
