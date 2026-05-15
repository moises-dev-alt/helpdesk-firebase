import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, isDemoMode } from './firebase';
import { createDemoArticle, deleteDemoArticle, subscribeDemoArticles, updateDemoArticle } from './demoData';
import type { KnowledgeArticle } from '../types';

const articlesRef = collection(db, 'knowledge_articles');

export function subscribeArticles(callback: (articles: KnowledgeArticle[]) => void) {
  if (isDemoMode) return subscribeDemoArticles(callback);
  return onSnapshot(query(articlesRef, orderBy('updatedAt', 'desc')), (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as KnowledgeArticle));
  });
}

export function createArticle(data: Pick<KnowledgeArticle, 'title' | 'content' | 'category'>) {
  if (isDemoMode) return createDemoArticle(data);
  return addDoc(articlesRef, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export function updateArticle(id: string, data: Partial<Pick<KnowledgeArticle, 'title' | 'content' | 'category'>>) {
  if (isDemoMode) return updateDemoArticle(id, data);
  return updateDoc(doc(db, 'knowledge_articles', id), { ...data, updatedAt: serverTimestamp() });
}

export function deleteArticle(id: string) {
  if (isDemoMode) return deleteDemoArticle(id);
  return deleteDoc(doc(db, 'knowledge_articles', id));
}
