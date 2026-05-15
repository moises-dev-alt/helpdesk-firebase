import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Headphones, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { isDemoMode } from '../services/firebase';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Informe a senha'),
});

type LoginForm = z.infer<typeof schema>;

export function LoginPage() {
  const { signIn, sendReset, profile } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: isDemoMode ? { email: 'admin@helpdesk.com', password: 'admin123' } : { email: '', password: '' },
  });

  if (profile) return <Navigate to="/dashboard" replace />;

  async function submit(values: LoginForm) {
    setLoading(true);
    try {
      await signIn(values.email, values.password);
      showToast('Login realizado com sucesso.');
    } catch {
      showToast('Não foi possível entrar. Verifique as credenciais e o cadastro do usuário.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function recover() {
    const email = watch('email');
    if (!email) {
      showToast('Informe o e-mail para recuperar a senha.', 'error');
      return;
    }
    await sendReset(email);
    showToast('E-mail de recuperação enviado.');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[1fr_520px]">
        <section className="relative hidden overflow-hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=80"
            alt="Equipe de suporte"
            className="h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-slate-950/55" />
          <motion.div className="absolute bottom-14 left-14 max-w-2xl" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur">
              <Headphones size={18} /> Central de atendimento
            </div>
            <h1 className="text-5xl font-bold leading-tight">Helpdesk Firebase</h1>
            <p className="mt-4 max-w-xl text-lg text-slate-200">Chamados, técnicos, relatórios e conhecimento em uma operação conectada ao Firebase em tempo real.</p>
          </motion.div>
        </section>
        <section className="flex items-center justify-center bg-white px-6 text-slate-900 dark:bg-slate-950 dark:text-white">
          <motion.form onSubmit={handleSubmit(submit)} className="w-full max-w-md" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <img src="/logo.svg" className="mb-8 h-14 w-14" alt="Helpdesk" />
            <h2 className="text-3xl font-bold">Entrar no sistema</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Use uma conta criada no Firebase Authentication e com perfil na coleção users.</p>
            {isDemoMode && <p className="mt-2 text-sm font-semibold text-brand-700 dark:text-brand-100">Modo demo ativo: admin@helpdesk.com / admin123</p>}
            <div className="mt-8 space-y-4">
              <label className="block">
                <span className="label">E-mail</span>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input className="input pl-10" {...register('email')} autoComplete="email" />
                </div>
                {errors.email && <span className="text-xs text-rose-500">{errors.email.message}</span>}
              </label>
              <label className="block">
                <span className="label">Senha</span>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input className="input pl-10" type="password" {...register('password')} autoComplete="current-password" />
                </div>
                {errors.password && <span className="text-xs text-rose-500">{errors.password.message}</span>}
              </label>
              <button className="btn-primary w-full" type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
              <button className="w-full text-sm font-semibold text-brand-700 dark:text-brand-100" type="button" onClick={recover}>Recuperar senha</button>
            </div>
          </motion.form>
        </section>
      </div>
    </div>
  );
}
