import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { createArticle, deleteArticle, subscribeArticles, updateArticle } from '../services/knowledgeService';
import { formatDate } from '../utils/format';
import type { KnowledgeArticle } from '../types';

const schema = z.object({ title: z.string().min(4), category: z.string().min(2), content: z.string().min(20) });
type ArticleForm = z.infer<typeof schema>;

export function KnowledgeBasePage() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<KnowledgeArticle | null>(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ArticleForm>({ resolver: zodResolver(schema) });
  const canManage = profile?.role === 'ADMIN' || profile?.role === 'TECHNICIAN';
  const visible = articles.filter((article) => `${article.title} ${article.category} ${article.content}`.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => subscribeArticles(setArticles), []);

  function add() {
    setEditing(null);
    reset({ title: '', category: '', content: '' });
    setOpen(true);
  }

  function edit(article: KnowledgeArticle) {
    setEditing(article);
    reset({ title: article.title, category: article.category, content: article.content });
    setOpen(true);
  }

  async function submit(values: ArticleForm) {
    if (editing) await updateArticle(editing.id, values);
    else await createArticle(values);
    setOpen(false);
    showToast('Artigo salvo.');
  }

  async function remove(article: KnowledgeArticle) {
    if (!confirm(`Excluir o artigo "${article.title}"?`)) return;
    await deleteArticle(article.id);
    showToast('Artigo excluído.');
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Base de conhecimento</h1><p className="text-sm text-slate-500">Artigos e FAQ pesquisáveis para atendimento e autoatendimento.</p></div>
        {canManage && <button className="btn-primary" type="button" onClick={add}><Plus size={18} /> Novo artigo</button>}
      </div>
      <input className="input max-w-xl" placeholder="Buscar por título, categoria ou conteúdo" value={search} onChange={(event) => setSearch(event.target.value)} />
      {visible.length === 0 ? <EmptyState title="Nenhum artigo encontrado" /> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((article) => (
            <article key={article.id} className="panel rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-xs font-bold uppercase text-brand-700 dark:text-brand-100">{article.category}</p><h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{article.title}</h2></div>
                {canManage && <div className="flex gap-2"><button className="btn-secondary h-9 w-9 p-0" type="button" onClick={() => edit(article)}><Edit size={16} /></button><button className="btn-danger h-9 w-9 p-0" type="button" onClick={() => remove(article)}><Trash2 size={16} /></button></div>}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">{article.content}</p>
              <p className="mt-4 text-xs text-slate-400">Atualizado em {formatDate(article.updatedAt)}</p>
            </article>
          ))}
        </div>
      )}
      <Modal open={open} title={editing ? 'Editar artigo' : 'Novo artigo'} onClose={() => setOpen(false)}>
        <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
          <label><span className="label">Título</span><input className="input mt-1" {...register('title')} /></label>
          <label><span className="label">Categoria</span><input className="input mt-1" {...register('category')} /></label>
          <label><span className="label">Conteúdo</span><textarea className="input mt-1 min-h-56" {...register('content')} /></label>
          <button className="btn-primary justify-self-end" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar artigo'}</button>
        </form>
      </Modal>
    </div>
  );
}
