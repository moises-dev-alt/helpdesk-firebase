import { useEffect, useState } from 'react';
import { subscribeUsers } from '../services/userService';
import type { UserProfile } from '../types';

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => subscribeUsers((items) => {
    setUsers(items);
    setLoading(false);
  }), []);

  return { users, loading };
}
