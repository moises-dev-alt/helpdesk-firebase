import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { isDemoMode, storage } from './firebase';
import type { Attachment } from '../types';

export async function uploadTicketAttachments(ticketId: string, files: File[]): Promise<Attachment[]> {
  if (isDemoMode) {
    return files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      path: `demo/${ticketId}/${crypto.randomUUID()}-${file.name}`,
      size: file.size,
    }));
  }
  const uploaded = await Promise.all(
    files.map(async (file) => {
      const path = `tickets/${ticketId}/${crypto.randomUUID()}-${file.name}`;
      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      return { name: file.name, url, path, size: file.size };
    }),
  );
  return uploaded;
}
