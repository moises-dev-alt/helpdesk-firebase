import {
  browserLocalPersistence,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isDemoMode } from './firebase';
import { getDemoProfile, getDemoProfileByUid } from './demoData';
import type { UserProfile } from '../types';

const demoSessionKey = 'helpdesk-demo-user';

function toDemoUser(profile: UserProfile) {
  return { uid: profile.uid, email: profile.email, displayName: profile.name } as User;
}

export function watchAuth(callback: (user: User | null) => void) {
  if (isDemoMode) {
    const uid = localStorage.getItem(demoSessionKey);
    const profile = uid ? getDemoProfileByUid(uid) : null;
    callback(profile ? toDemoUser(profile) : null);
    return () => undefined;
  }
  return onAuthStateChanged(auth, callback);
}

export async function login(email: string, password: string) {
  if (isDemoMode) {
    const profile = getDemoProfile(email, password);
    if (!profile) throw new Error('Credenciais demo invalidas');
    localStorage.setItem(demoSessionKey, profile.uid);
    return { user: toDemoUser(profile) };
  }
  await setPersistence(auth, browserLocalPersistence);
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  if (isDemoMode) {
    localStorage.removeItem(demoSessionKey);
    return Promise.resolve();
  }
  return signOut(auth);
}

export function resetPassword(email: string) {
  if (isDemoMode) {
    void email;
    return Promise.resolve();
  }
  return sendPasswordResetEmail(auth, email);
}

export async function getCurrentProfile(uid: string): Promise<UserProfile | null> {
  if (isDemoMode) return getDemoProfileByUid(uid);
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}
