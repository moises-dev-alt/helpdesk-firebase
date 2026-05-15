import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, isDemoMode } from './firebase';
import {
  addDemoComment,
  createDemoTicket,
  deleteDemoTicket,
  subscribeDemoComments,
  subscribeDemoTicket,
  subscribeDemoTickets,
  updateDemoTicket,
} from './demoData';
import type { Attachment, Comment, Ticket, TicketHistory, TicketPriority, TicketStatus, UserProfile } from '../types';

const ticketsRef = collection(db, 'tickets');
const commentsRef = collection(db, 'comments');
const notificationsRef = collection(db, 'notifications');

export function subscribeTickets(profile: UserProfile, callback: (tickets: Ticket[]) => void) {
  if (isDemoMode) return subscribeDemoTickets(profile, callback);
  const constraints = profile.role === 'CUSTOMER'
    ? [where('customerId', '==', profile.uid), orderBy('createdAt', 'desc')]
    : [orderBy('createdAt', 'desc')];
  return onSnapshot(query(ticketsRef, ...constraints), (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Ticket));
  });
}

export function subscribeTicket(ticketId: string, callback: (ticket: Ticket | null) => void) {
  if (isDemoMode) return subscribeDemoTicket(ticketId, callback);
  return onSnapshot(doc(db, 'tickets', ticketId), (snapshot) => {
    callback(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Ticket) : null);
  });
}

export async function getTicket(ticketId: string) {
  if (isDemoMode) {
    let found: Ticket | null = null;
    const unsubscribe = subscribeDemoTicket(ticketId, (ticket) => {
      found = ticket;
    });
    unsubscribe();
    return found;
  }
  const snapshot = await getDoc(doc(db, 'tickets', ticketId));
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Ticket) : null;
}

export async function createTicket(data: {
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  customer: UserProfile;
}) {
  if (isDemoMode) return createDemoTicket(data);
  const ref = await addDoc(ticketsRef, {
    title: data.title,
    description: data.description,
    category: data.category,
    priority: data.priority,
    status: 'OPEN' satisfies TicketStatus,
    customerId: data.customer.uid,
    customerName: data.customer.name,
    attachments: [],
    history: [
      {
        at: new Date().toISOString(),
        actorId: data.customer.uid,
        actorName: data.customer.name,
        action: 'Chamado criado',
      },
    ] satisfies TicketHistory[],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await createNotification(data.customer.uid, 'Chamado criado', `Seu chamado "${data.title}" foi aberto.`);
  return ref.id;
}

export async function updateTicket(
  ticketId: string,
  data: Partial<Pick<Ticket, 'title' | 'description' | 'category' | 'priority' | 'status' | 'assigneeId' | 'assigneeName' | 'attachments'>>,
  actor: UserProfile,
  action = 'Chamado atualizado',
) {
  if (isDemoMode) return updateDemoTicket(ticketId, data as Partial<Ticket>, actor, action);
  const current = await getTicket(ticketId);
  const history = [
    ...(current?.history ?? []),
    { at: new Date().toISOString(), actorId: actor.uid, actorName: actor.name, action },
  ];
  await updateDoc(doc(db, 'tickets', ticketId), {
    ...data,
    history,
    updatedAt: serverTimestamp(),
    resolvedAt: data.status === 'RESOLVED' ? serverTimestamp() : current?.resolvedAt ?? null,
  });
  const target = data.assigneeId ?? current?.assigneeId ?? current?.customerId;
  if (target) await createNotification(target, 'Chamado atualizado', action);
}

export function deleteTicket(ticketId: string) {
  if (isDemoMode) return deleteDemoTicket(ticketId);
  return deleteDoc(doc(db, 'tickets', ticketId));
}

export function subscribeComments(ticketId: string, callback: (comments: Comment[]) => void) {
  if (isDemoMode) return subscribeDemoComments(ticketId, callback);
  return onSnapshot(query(commentsRef, where('ticketId', '==', ticketId), orderBy('createdAt', 'asc')), (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Comment));
  });
}

export async function addComment(ticketId: string, author: UserProfile, message: string) {
  if (isDemoMode) return addDemoComment(ticketId, author, message);
  await addDoc(commentsRef, {
    ticketId,
    authorId: author.uid,
    authorName: author.name,
    message,
    createdAt: serverTimestamp(),
  });
  await updateTicket(ticketId, {}, author, 'Comentário adicionado');
}

export async function appendAttachments(ticketId: string, attachments: Attachment[], actor: UserProfile) {
  if (isDemoMode) return updateDemoTicket(ticketId, { attachments }, actor, 'Anexo enviado');
  const ticket = await getTicket(ticketId);
  await updateTicket(ticketId, { attachments: [...(ticket?.attachments ?? []), ...attachments] }, actor, 'Anexo enviado');
}

export async function createNotification(userId: string, title: string, message: string) {
  if (isDemoMode) return Promise.resolve({ userId, title, message });
  await addDoc(notificationsRef, { userId, title, message, read: false, createdAt: serverTimestamp() });
}
