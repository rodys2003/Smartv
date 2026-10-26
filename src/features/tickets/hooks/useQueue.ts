'use client';

import { useState, useEffect, useCallback } from 'react';
import { Ticket } from '@/types';
import { supabase } from '@/lib/supabase/client';
import { getActiveQueue } from '../services/ticketService';

export function useQueue() {
  const [servingTicket, setServingTicket] = useState<Ticket | null>(null);
  const [waitingTickets, setWaitingTickets] = useState<Ticket[]>([]);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshQueue = useCallback(async () => {
    try {
      const data = await getActiveQueue();
      setServingTicket(data.servingTicket);
      setWaitingTickets(data.waitingTickets);
      setCompletedCount(data.completedCount);
    } catch (err) {
      console.error('Failed to load queue:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshQueue();

    // Use a unique channel name per mount to prevent StrictMode re-subscription collisions
    const channelName = `tickets-queue-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
        },
        () => {
          refreshQueue();
        }
      );

    channel.subscribe();

    // Periodic polling fallback
    const interval = setInterval(refreshQueue, 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [refreshQueue]);

  return {
    servingTicket,
    waitingTickets,
    completedCount,
    waitingCount: waitingTickets.length,
    loading,
    refreshQueue,
  };
}
