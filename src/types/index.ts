import type { Timestamp } from 'firebase/firestore';

export type Role = 'ADMIN' | 'TECHNICIAN' | 'CUSTOMER';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type FireDate = Timestamp | Date | string | null;

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: Role;
  company: string;
  active: boolean;
  createdAt: FireDate;
}

export interface Attachment {
  name: string;
  url: string;
  path: string;
  size: number;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  customerId: string;
  customerName: string;
  assigneeId?: string;
  assigneeName?: string;
  attachments: Attachment[];
  history: TicketHistory[];
  createdAt: FireDate;
  updatedAt: FireDate;
  resolvedAt?: FireDate;
}

export interface TicketHistory {
  at: FireDate;
  actorId: string;
  actorName: string;
  action: string;
}

export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  message: string;
  createdAt: FireDate;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: FireDate;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: FireDate;
  updatedAt: FireDate;
}
