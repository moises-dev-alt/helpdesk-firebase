import { Bell, LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDate, roleLabels } from '../../utils/format';
import { markNotificationRead } from '../../services/notificationService';

export function Header({ onMenu }: { onMenu: () => void }) {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unread } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <div className="flex items-center gap-3">
        <button className="btn-secondary h-10 w-10 p-0 lg:hidden" type="button" onClick={onMenu} aria-label="Abrir menu">
          <Menu size={18} />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Help Desk</p>
          <h1 className="text-base font-bold text-slate-900 dark:text-white">Operação em tempo real</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="btn-secondary h-10 w-10 p-0" type="button" onClick={toggleTheme} aria-label="Alternar tema">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="relative">
          <button className="btn-secondary relative h-10 w-10 p-0" type="button" onClick={() => setOpen((value) => !value)} aria-label="Notificações">
            <Bell size={18} />
            {unread > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{unread}</span>}
          </button>
          {open && (
            <div className="panel absolute right-0 mt-2 w-80 overflow-hidden rounded-xl">
              <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                <strong className="text-sm text-slate-900 dark:text-white">Notificações</strong>
              </div>
              <div className="max-h-96 overflow-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-slate-500">Nenhuma notificação.</p>
                ) : notifications.map((item) => (
                  <button key={item.id} className="block w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800" type="button" onClick={() => markNotificationRead(item.id)}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</span>
                      {!item.read && <span className="h-2 w-2 rounded-full bg-brand-600" />}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.message}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{formatDate(item.createdAt)}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="hidden items-center gap-3 pl-2 md:flex">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{profile?.role ? roleLabels[profile.role] : ''}</p>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 font-bold text-brand-700 dark:bg-brand-700 dark:text-white">
            {profile?.name?.slice(0, 1).toUpperCase()}
          </div>
        </div>
        <button className="btn-secondary h-10 w-10 p-0" type="button" onClick={signOut} aria-label="Sair">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
