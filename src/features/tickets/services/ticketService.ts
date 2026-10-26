import { supabase } from '@/lib/supabase/client';
import { Ticket, TicketStatus } from '@/types';

export interface CreateTicketDTO {
  user_id?: string | null;
  user_email?: string | null;
  user_name?: string | null;
  user_avatar?: string | null;
  tv_brand: string;
  tv_model?: string | null;
  service_tier: string;
  service_name: string;
  has_magic_apps: boolean;
  total_price: number;
  client_whatsapp?: string | null;
  notes?: string | null;
}

export async function createTicket(dto: CreateTicketDTO): Promise<Ticket> {
  const { data, error } = await supabase
    .from('tickets')
    .insert([
      {
        ...dto,
        status: 'waiting',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }

  return data as Ticket;
}

export async function getTickets(limit = 50): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching tickets:', error);
    return [];
  }

  return data as Ticket[];
}

export async function getActiveQueue(): Promise<{
  servingTicket: Ticket | null;
  waitingTickets: Ticket[];
  completedCount: number;
}> {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .order('ticket_number', { ascending: true });

  if (error || !data) {
    console.error('Error fetching active queue:', error);
    return { servingTicket: null, waitingTickets: [], completedCount: 0 };
  }

  const all = data as Ticket[];
  const inProgress = all.find((t) => t.status === 'in_progress');
  const waiting = all.filter((t) => t.status === 'waiting');
  const completed = all.filter((t) => t.status === 'completed');

  return {
    servingTicket: inProgress || waiting[0] || null,
    waitingTickets: waiting,
    completedCount: completed.length,
  };
}

export async function updateTicketStatus(id: string, status: TicketStatus): Promise<boolean> {
  const { error } = await supabase
    .from('tickets')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error updating ticket status:', error);
    return false;
  }
  return true;
}
