import { supabase } from '@/lib/supabase/client';

export interface QueueSettings {
  max_tickets: number;
  tickets_enabled: boolean;
  announcement?: string | null;
}

const DEFAULT_SETTINGS: QueueSettings = {
  max_tickets: 100,
  tickets_enabled: true,
  announcement: null,
};

export async function getQueueSettings(): Promise<QueueSettings> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'queue_settings')
      .maybeSingle();

    if (error || !data?.value) {
      return DEFAULT_SETTINGS;
    }

    return {
      max_tickets: data.value.max_tickets ?? 100,
      tickets_enabled: data.value.tickets_enabled ?? true,
      announcement: data.value.announcement ?? null,
    };
  } catch (err) {
    console.error('Error fetching queue settings:', err);
    return DEFAULT_SETTINGS;
  }
}

export async function updateQueueSettings(
  partialSettings: Partial<QueueSettings>
): Promise<QueueSettings | null> {
  try {
    const current = await getQueueSettings();
    const updated: QueueSettings = {
      ...current,
      ...partialSettings,
    };

    const { error } = await supabase
      .from('system_settings')
      .upsert({
        key: 'queue_settings',
        value: updated,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error updating queue settings:', error);
      return null;
    }

    return updated;
  } catch (err) {
    console.error('Error updating queue settings:', err);
    return null;
  }
}

export interface TicketAvailability {
  available: boolean;
  reason?: 'limit_reached' | 'tickets_paused';
  currentCount: number;
  maxTickets: number;
  ticketsEnabled: boolean;
}

export async function checkTicketAvailability(): Promise<TicketAvailability> {
  try {
    const settings = await getQueueSettings();

    // Count tickets (only active + waiting, or total non-cancelled)
    const { count, error } = await supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .neq('status', 'cancelled');

    const currentCount = error || count === null ? 0 : count;

    if (!settings.tickets_enabled) {
      return {
        available: false,
        reason: 'tickets_paused',
        currentCount,
        maxTickets: settings.max_tickets,
        ticketsEnabled: false,
      };
    }

    if (currentCount >= settings.max_tickets) {
      return {
        available: false,
        reason: 'limit_reached',
        currentCount,
        maxTickets: settings.max_tickets,
        ticketsEnabled: true,
      };
    }

    return {
      available: true,
      currentCount,
      maxTickets: settings.max_tickets,
      ticketsEnabled: true,
    };
  } catch (err) {
    console.error('Error checking ticket availability:', err);
    return {
      available: true,
      currentCount: 0,
      maxTickets: 100,
      ticketsEnabled: true,
    };
  }
}
