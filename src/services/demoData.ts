import type { Comment, KnowledgeArticle, NotificationItem, Ticket, UserProfile } from '../types';

type Listener<T> = (items: T[]) => void;

const now = new Date().toISOString();

export const demoUsers: UserProfile[] = [
  { uid: 'demo-admin', name: 'Administrador', email: 'admin@helpdesk.com', role: 'ADMIN', company: 'Helpdesk Demo', active: true, createdAt: now },
  { uid: 'demo-tecnico', name: 'Tecnico Suporte', email: 'tecnico@helpdesk.com', role: 'TECHNICIAN', company: 'Helpdesk Demo', active: true, createdAt: now },
  { uid: 'demo-usuario', name: 'Usuario Cliente', email: 'usuario@helpdesk.com', role: 'CUSTOMER', company: 'Cliente Demo', active: true, createdAt: now },
];

export const demoPasswords: Record<string, string> = {
  'admin@helpdesk.com': 'admin123',
  'tecnico@helpdesk.com': 'tecnico123',
  'usuario@helpdesk.com': 'usuario123',
};

let tickets: Ticket[] = [
  {
    id: 'demo-ticket-1',
    title: 'Computador sem acesso ao sistema',
    description: 'Usuario informa que nao consegue abrir o sistema de chamados desde esta manha.',
    category: 'Acesso',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    customerId: 'demo-usuario',
    customerName: 'Usuario Cliente',
    assigneeId: 'demo-tecnico',
    assigneeName: 'Tecnico Suporte',
    attachments: [],
    history: [{ at: now, actorId: 'demo-usuario', actorName: 'Usuario Cliente', action: 'Chamado criado' }],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-ticket-2',
    title: 'Solicitar instalacao de impressora',
    description: 'Instalar impressora compartilhada no setor financeiro.',
    category: 'Hardware',
    priority: 'MEDIUM',
    status: 'OPEN',
    customerId: 'demo-usuario',
    customerName: 'Usuario Cliente',
    attachments: [],
    history: [{ at: now, actorId: 'demo-usuario', actorName: 'Usuario Cliente', action: 'Chamado criado' }],
    createdAt: now,
    updatedAt: now,
  },
];

let comments: Comment[] = [
  { id: 'demo-comment-1', ticketId: 'demo-ticket-1', authorId: 'demo-tecnico', authorName: 'Tecnico Suporte', message: 'Estou verificando as permissoes do usuario.', createdAt: now },
];

let notifications: NotificationItem[] = [
  { id: 'demo-notification-1', userId: 'demo-admin', title: 'Modo demo ativo', message: 'Configure o Firebase para usar dados reais.', read: false, createdAt: now },
];

let articles: KnowledgeArticle[] = [
  {
    id: 'demo-article-1',
    title: 'Como recuperar senha',
    category: 'Acesso',
    content: 'Na tela de login, informe seu e-mail e clique em Recuperar senha. Voce recebera um link para definir uma nova senha.',
    createdAt: now,
    updatedAt: now,
  },
];

const ticketListeners = new Set<Listener<Ticket>>();
const userListeners = new Set<Listener<UserProfile>>();
const commentListeners = new Map<string, Set<Listener<Comment>>>();
const notificationListeners = new Map<string, Set<Listener<NotificationItem>>>();
const articleListeners = new Set<Listener<KnowledgeArticle>>();

function emitTickets() {
  ticketListeners.forEach((listener) => listener([...tickets]));
}

function emitUsers() {
  userListeners.forEach((listener) => listener([...demoUsers]));
}

function emitComments(ticketId: string) {
  commentListeners.get(ticketId)?.forEach((listener) => listener(comments.filter((item) => item.ticketId === ticketId)));
}

function emitNotifications(userId: string) {
  notificationListeners.get(userId)?.forEach((listener) => listener(notifications.filter((item) => item.userId === userId)));
}

function emitArticles() {
  articleListeners.forEach((listener) => listener([...articles]));
}

export function getDemoProfile(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim();
  if (demoPasswords[normalizedEmail] !== password) return null;
  return demoUsers.find((user) => user.email === normalizedEmail) ?? null;
}

export function getDemoProfileByUid(uid: string) {
  return demoUsers.find((user) => user.uid === uid) ?? null;
}

export function subscribeDemoTickets(profile: UserProfile, callback: Listener<Ticket>) {
  const listener = (items: Ticket[]) => callback(profile.role === 'CUSTOMER' ? items.filter((item) => item.customerId === profile.uid) : items);
  ticketListeners.add(listener);
  listener([...tickets]);
  return () => ticketListeners.delete(listener);
}

export function subscribeDemoTicket(ticketId: string, callback: (ticket: Ticket | null) => void) {
  const listener = (items: Ticket[]) => callback(items.find((item) => item.id === ticketId) ?? null);
  ticketListeners.add(listener);
  listener([...tickets]);
  return () => ticketListeners.delete(listener);
}

export async function createDemoTicket(data: Pick<Ticket, 'title' | 'description' | 'category' | 'priority'> & { customer: UserProfile }) {
  const id = crypto.randomUUID();
  tickets = [{
    id,
    title: data.title,
    description: data.description,
    category: data.category,
    priority: data.priority,
    status: 'OPEN',
    customerId: data.customer.uid,
    customerName: data.customer.name,
    attachments: [],
    history: [{ at: new Date().toISOString(), actorId: data.customer.uid, actorName: data.customer.name, action: 'Chamado criado' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }, ...tickets];
  emitTickets();
  return id;
}

export async function updateDemoTicket(ticketId: string, data: Partial<Ticket>, actor: UserProfile, action = 'Chamado atualizado') {
  tickets = tickets.map((ticket) => ticket.id === ticketId ? {
    ...ticket,
    ...data,
    history: [...(ticket.history ?? []), { at: new Date().toISOString(), actorId: actor.uid, actorName: actor.name, action }],
    updatedAt: new Date().toISOString(),
    resolvedAt: data.status === 'RESOLVED' ? new Date().toISOString() : ticket.resolvedAt,
  } : ticket);
  emitTickets();
}

export async function deleteDemoTicket(ticketId: string) {
  tickets = tickets.filter((ticket) => ticket.id !== ticketId);
  emitTickets();
}

export function subscribeDemoComments(ticketId: string, callback: Listener<Comment>) {
  const listeners = commentListeners.get(ticketId) ?? new Set<Listener<Comment>>();
  listeners.add(callback);
  commentListeners.set(ticketId, listeners);
  callback(comments.filter((item) => item.ticketId === ticketId));
  return () => listeners.delete(callback);
}

export async function addDemoComment(ticketId: string, author: UserProfile, message: string) {
  comments = [...comments, { id: crypto.randomUUID(), ticketId, authorId: author.uid, authorName: author.name, message, createdAt: new Date().toISOString() }];
  await updateDemoTicket(ticketId, {}, author, 'Comentario adicionado');
  emitComments(ticketId);
}

export function subscribeDemoUsers(callback: Listener<UserProfile>) {
  userListeners.add(callback);
  callback([...demoUsers]);
  return () => userListeners.delete(callback);
}

export async function upsertDemoUser(user: Omit<UserProfile, 'createdAt'> & { createdAt?: UserProfile['createdAt'] }) {
  const index = demoUsers.findIndex((item) => item.uid === user.uid);
  const next = { ...user, createdAt: user.createdAt ?? new Date().toISOString() };
  if (index >= 0) demoUsers[index] = next;
  else demoUsers.push(next);
  emitUsers();
}

export async function createDemoUser(user: Omit<UserProfile, 'uid' | 'createdAt'> & { uid?: string }) {
  const uid = user.uid || crypto.randomUUID();
  demoUsers.push({ ...user, uid, createdAt: new Date().toISOString() });
  emitUsers();
  return uid;
}

export async function updateDemoUser(uid: string, data: Partial<UserProfile>) {
  const index = demoUsers.findIndex((user) => user.uid === uid);
  if (index >= 0) demoUsers[index] = { ...demoUsers[index], ...data };
  emitUsers();
}

export async function deleteDemoUser(uid: string) {
  const index = demoUsers.findIndex((user) => user.uid === uid);
  if (index >= 0) demoUsers.splice(index, 1);
  emitUsers();
}

export function subscribeDemoNotifications(userId: string, callback: Listener<NotificationItem>) {
  const listeners = notificationListeners.get(userId) ?? new Set<Listener<NotificationItem>>();
  listeners.add(callback);
  notificationListeners.set(userId, listeners);
  callback(notifications.filter((item) => item.userId === userId));
  return () => listeners.delete(callback);
}

export async function markDemoNotificationRead(id: string) {
  notifications = notifications.map((item) => item.id === id ? { ...item, read: true } : item);
  notifications.forEach((item) => emitNotifications(item.userId));
}

export function subscribeDemoArticles(callback: Listener<KnowledgeArticle>) {
  articleListeners.add(callback);
  callback([...articles]);
  return () => articleListeners.delete(callback);
}

export async function createDemoArticle(data: Pick<KnowledgeArticle, 'title' | 'content' | 'category'>) {
  articles = [{ id: crypto.randomUUID(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...articles];
  emitArticles();
}

export async function updateDemoArticle(id: string, data: Partial<Pick<KnowledgeArticle, 'title' | 'content' | 'category'>>) {
  articles = articles.map((article) => article.id === id ? { ...article, ...data, updatedAt: new Date().toISOString() } : article);
  emitArticles();
}

export async function deleteDemoArticle(id: string) {
  articles = articles.filter((article) => article.id !== id);
  emitArticles();
}
