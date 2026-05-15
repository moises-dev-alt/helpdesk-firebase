import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, isDemoMode } from './firebase';
import { createDemoUser, deleteDemoUser, subscribeDemoUsers, updateDemoUser, upsertDemoUser } from './demoData';
import type { UserProfile } from '../types';

const usersRef = collection(db, 'users');

export function subscribeUsers(callback: (users: UserProfile[]) => void) {
  if (isDemoMode) return subscribeDemoUsers(callback);
  return onSnapshot(query(usersRef, orderBy('createdAt', 'desc')), (snapshot) => {
    callback(snapshot.docs.map((item) => item.data() as UserProfile));
  });
}

export async function upsertUserProfile(user: Omit<UserProfile, 'createdAt'> & { createdAt?: UserProfile['createdAt'] }) {
  if (isDemoMode) return upsertDemoUser(user);
  await setDoc(
    doc(db, 'users', user.uid),
    {
      ...user,
      createdAt: user.createdAt ?? serverTimestamp(),
    },
    { merge: true },
  );
}

export async function createPendingUser(user: Omit<UserProfile, 'uid' | 'createdAt'> & { uid?: string }) {
  if (isDemoMode) return createDemoUser(user);
  const payload = { ...user, createdAt: serverTimestamp() };
  if (user.uid) {
    await setDoc(doc(db, 'users', user.uid), payload);
    return user.uid;
  }
  const ref = await addDoc(usersRef, payload);
  await updateDoc(ref, { uid: ref.id });
  return ref.id;
}

export function updateUser(uid: string, data: Partial<UserProfile>) {
  if (isDemoMode) return updateDemoUser(uid, data);
  return updateDoc(doc(db, 'users', uid), data);
}

export function deleteUser(uid: string) {
  if (isDemoMode) return deleteDemoUser(uid);
  return deleteDoc(doc(db, 'users', uid));
}
