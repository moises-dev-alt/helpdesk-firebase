import { useEffect, useMemo, useState } from 'react';
import { subscribeNotifications } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';
import type { NotificationItem } from '../types';

export function useNotifications() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!profile) return undefined;
    return subscribeNotifications(profile.uid, setNotifications);
  }, [profile]);

  const unread = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);
  return { notifications, unread };
}
