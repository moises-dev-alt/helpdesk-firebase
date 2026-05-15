import { collection, doc, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { db, isDemoMode } from './firebase';
import { markDemoNotificationRead, subscribeDemoNotifications } from './demoData';
import type { NotificationItem } from '../types';

export function subscribeNotifications(userId: string, callback: (items: NotificationItem[]) => void) {
  if (isDemoMode) return subscribeDemoNotifications(userId, callback);
  return onSnapshot(
    query(collection(db, 'notifications'), where('userId', '==', userId), orderBy('createdAt', 'desc')),
    (snapshot) => callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as NotificationItem)),
  );
}

export function markNotificationRead(id: string) {
  if (isDemoMode) return markDemoNotificationRead(id);
  return updateDoc(doc(db, 'notifications', id), { read: true });
}
