'use client';

import { useState, useEffect, useCallback } from 'react';
import { Ticket } from '@/types';
import { supabase } from '@/lib/supabase/client';
import { getActiveQueue } from '../services/ticketService';
import { getQueueSettings, QueueSettings } from '@/features/settings/services/settingsService';
import { formatWaitTime } from '@/lib/utils';

export function useQueue() {
  const [servingTicket, setServingTicket] = useState<Ticket | null>(null);
  const [waitingTickets, setWaitingTickets] = useState<Ticket[]>([]);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [settings, setSettings] = useState<QueueSettings>({
    max_tickets: 100,
    tickets_enabled: true,
    whatsapp_queue_threshold: 5,
  });
  const [loading, setLoading] = useState<boolean>(true);

  const refreshQueue = useCallback(async () => {
    try {
      const [queueData, settingsData] = await Promise.all([
        getActiveQueue(),
        getQueueSettings(),
      ]);

      setServingTicket(queueData.servingTicket);
      setWaitingTickets(queueData.waitingTickets);
      setCompletedCount(queueData.completedCount);
      setTotalCount(
        (queueData.servingTicket ? 1 : 0) +
          queueData.waitingTickets.length +
          queueData.completedCount
      );
      setSettings(settingsData);
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
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings',
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

  const waitingCount = waitingTickets.length;
  const waitTimeFormatted = formatWaitTime(waitingCount);
  const isLimitReached = totalCount >= settings.max_tickets;
  const canIssueTicket = settings.tickets_enabled && !isLimitReached;
  const whatsappThreshold = settings.whatsapp_queue_threshold ?? 5;

  return {
    servingTicket,
    waitingTickets,
    completedCount,
    totalCount,
    waitingCount,
    waitTimeFormatted,
    settings,
    maxTickets: settings.max_tickets,
    ticketsEnabled: settings.tickets_enabled,
    whatsappThreshold,
    isLimitReached,
    canIssueTicket,
    loading,
    refreshQueue,
  };
}
