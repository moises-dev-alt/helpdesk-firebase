import { Moon, ShieldCheck, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { roleLabels } from '../utils/format';

export function SettingsPage() {
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Configurações</h1><p className="text-sm text-slate-500">Preferências da conta e informações de acesso.</p></div>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="panel rounded-xl p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white"><ShieldCheck size={20} /> Perfil</h2>
          <div className="space-y-3 text-sm">
            <Info label="Nome" value={profile?.name ?? ''} />
            <Info label="E-mail" value={profile?.email ?? ''} />
            <Info label="Empresa" value={profile?.company ?? ''} />
            <Info label="Perfil" value={profile?.role ? roleLabels[profile.role] : ''} />
          </div>
        </section>
        <section className="panel rounded-xl p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Tema</h2>
          <button className="btn-secondary" type="button" onClick={toggleTheme}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />} Alternar para {theme === 'dark' ? 'light' : 'dark'}</button>
        </section>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between border-b border-slate-100 py-2 dark:border-slate-800"><span className="text-slate-500">{label}</span><strong className="text-slate-900 dark:text-white">{value}</strong></div>;
}
