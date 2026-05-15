import { useEffect, useState } from 'react';
import { subscribeTickets } from '../services/ticketService';
import { useAuth } from '../contexts/AuthContext';
import type { Ticket } from '../types';

export function useTickets() {
  const { profile } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return undefined;
    setLoading(true);
    return subscribeTickets(profile, (items) => {
      setTickets(items);
      setLoading(false);
    });
  }, [profile]);

  return { tickets, loading };
}
