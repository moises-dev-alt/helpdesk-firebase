import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';

const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!credentialPath) {
  throw new Error('Defina GOOGLE_APPLICATION_CREDENTIALS apontando para o JSON da service account.');
}

if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(readFileSync(credentialPath, 'utf8'))),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const auth = getAuth();
const db = getFirestore();

const users = [
  { email: 'admin@helpdesk.com', password: 'admin123', name: 'Administrador', role: 'ADMIN', company: 'Helpdesk' },
  { email: 'tecnico@helpdesk.com', password: 'tecnico123', name: 'Técnico Suporte', role: 'TECHNICIAN', company: 'Helpdesk' },
  { email: 'usuario@helpdesk.com', password: 'usuario123', name: 'Usuário Cliente', role: 'CUSTOMER', company: 'Cliente' },
] as const;

for (const user of users) {
  let record;
  try {
    record = await auth.getUserByEmail(user.email);
  } catch {
    record = await auth.createUser({ email: user.email, password: user.password, displayName: user.name, emailVerified: true });
  }

  await db.collection('users').doc(record.uid).set({
    uid: record.uid,
    name: user.name,
    email: user.email,
    role: user.role,
    company: user.company,
    active: true,
    createdAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  console.log(`Usuário pronto: ${user.email} (${user.role})`);
}
