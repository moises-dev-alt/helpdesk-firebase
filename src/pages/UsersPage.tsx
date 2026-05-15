import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Power, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Badge } from '../components/ui/Badge';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { SkeletonRows } from '../components/ui/Skeleton';
import { useToast } from '../contexts/ToastContext';
import { useUsers } from '../hooks/useUsers';
import { createPendingUser, deleteUser, updateUser } from '../services/userService';
import { formatDate, roleLabels } from '../utils/format';
import type { UserProfile } from '../types';

const schema = z.object({
  uid: z.string().optional(),
  name: z.string().min(3),
  email: z.string().email(),
  company: z.string().min(2),
  role: z.enum(['ADMIN', 'TECHNICIAN', 'CUSTOMER']),
  active: z.boolean(),
});

type UserForm = z.infer<typeof schema>;

export function UsersPage() {
  const { users, loading } = useUsers();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserProfile | null>(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<UserForm>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'CUSTOMER', active: true },
  });

  const columns: Column<UserProfile>[] = [
    { key: 'name', header: 'Nome', sortable: true, render: (user) => <button className="font-semibold text-brand-700 dark:text-brand-100" type="button" onClick={() => edit(user)}>{user.name}</button> },
    { key: 'email', header: 'E-mail', sortable: true },
    { key: 'role', header: 'Perfil', sortable: true, render: (user) => roleLabels[user.role] },
    { key: 'company', header: 'Empresa', sortable: true },
    { key: 'active', header: 'Status', render: (user) => <Badge tone={user.active ? 'green' : 'rose'}>{user.active ? 'Ativo' : 'Inativo'}</Badge> },
    { key: 'createdAt', header: 'Criado em', render: (user) => formatDate(user.createdAt) },
    { key: 'actions', header: 'Ações', render: (user) => (
      <div className="flex gap-2">
        <button className="btn-secondary h-9 w-9 p-0" type="button" onClick={() => toggle(user)} aria-label="Ativar ou desativar"><Power size={16} /></button>
        <button className="btn-danger h-9 w-9 p-0" type="button" onClick={() => remove(user)} aria-label="Excluir"><Trash2 size={16} /></button>
      </div>
    ) },
  ];

  function add() {
    setEditing(null);
    reset({ uid: '', name: '', email: '', company: '', role: 'CUSTOMER', active: true });
    setOpen(true);
  }

  function edit(user: UserProfile) {
    setEditing(user);
    reset({ uid: user.uid, name: user.name, email: user.email, company: user.company, role: user.role, active: user.active });
    setOpen(true);
  }

  async function submit(values: UserForm) {
    if (editing) await updateUser(editing.uid, values);
    else await createPendingUser(values);
    setOpen(false);
    showToast('Usuário salvo.');
  }

  async function toggle(user: UserProfile) {
    await updateUser(user.uid, { active: !user.active });
    showToast('Status atualizado.');
  }

  async function remove(user: UserProfile) {
    if (!confirm(`Excluir o perfil de ${user.name}?`)) return;
    await deleteUser(user.uid);
    showToast('Usuário excluído.');
  }

  if (loading) return <SkeletonRows />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Usuários</h1>
          <p className="text-sm text-slate-500">Gerencie perfis, papéis e ativação de contas.</p>
        </div>
        <button className="btn-primary" type="button" onClick={add}><Plus size={18} /> Novo usuário</button>
      </div>
      <DataTable data={users as unknown as Record<string, unknown>[]} columns={columns as unknown as Column<Record<string, unknown>>[]} searchKeys={['name', 'email', 'company']} empty="Nenhum usuário encontrado" />
      <Modal open={open} title={editing ? 'Editar usuário' : 'Novo usuário'} onClose={() => setOpen(false)}>
        <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
          <label><span className="label">UID do Firebase Auth</span><input className="input mt-1" {...register('uid')} disabled={Boolean(editing)} /></label>
          <div className="grid gap-4 md:grid-cols-2">
            <label><span className="label">Nome</span><input className="input mt-1" {...register('name')} /></label>
            <label><span className="label">E-mail</span><input className="input mt-1" type="email" {...register('email')} /></label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label><span className="label">Empresa</span><input className="input mt-1" {...register('company')} /></label>
            <label><span className="label">Perfil</span><select className="input mt-1" {...register('role')}><option value="ADMIN">ADMIN</option><option value="TECHNICIAN">TECHNICIAN</option><option value="CUSTOMER">CUSTOMER</option></select></label>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"><input type="checkbox" {...register('active')} /> Usuário ativo</label>
          <button className="btn-primary justify-self-end" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar usuário'}</button>
        </form>
      </Modal>
    </div>
  );
}
