import { BookOpen, ChartColumn, Gauge, Settings, Ticket, Users, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/format';
import type { Role } from '../../types';

const links: Array<{ to: string; label: string; icon: typeof Gauge; roles: Role[] }> = [
  { to: '/dashboard', label: 'Dashboard', icon: Gauge, roles: ['ADMIN', 'TECHNICIAN', 'CUSTOMER'] },
  { to: '/tickets', label: 'Chamados', icon: Ticket, roles: ['ADMIN', 'TECHNICIAN', 'CUSTOMER'] },
  { to: '/users', label: 'Usuários', icon: Users, roles: ['ADMIN'] },
  { to: '/reports', label: 'Relatórios', icon: ChartColumn, roles: ['ADMIN', 'TECHNICIAN'] },
  { to: '/knowledge-base', label: 'Base de conhecimento', icon: BookOpen, roles: ['ADMIN', 'TECHNICIAN', 'CUSTOMER'] },
  { to: '/settings', label: 'Configurações', icon: Settings, roles: ['ADMIN', 'TECHNICIAN', 'CUSTOMER'] },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile } = useAuth();
  const visibleLinks = links.filter((link) => profile && link.roles.includes(profile.role));

  return (
    <>
      <div className={cn('fixed inset-0 z-40 bg-slate-950/40 lg:hidden', open ? 'block' : 'hidden')} onClick={onClose} />
      <aside className={cn('fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-950 lg:static lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" className="h-10 w-10" alt="Helpdesk" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Helpdesk Firebase</p>
              <p className="text-xs text-slate-500">Suporte profissional</p>
            </div>
          </div>
          <button className="btn-secondary h-9 w-9 p-0 lg:hidden" type="button" onClick={onClose} aria-label="Fechar menu">
            <X size={17} />
          </button>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {visibleLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition', isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-100' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800')}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
