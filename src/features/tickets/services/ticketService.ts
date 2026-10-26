import { supabase } from '@/lib/supabase/client';
import { Ticket, TicketStatus } from '@/types';
import { checkTicketAvailability } from '@/features/settings/services/settingsService';

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
  // Check ticket capacity and enabled state
  const availability = await checkTicketAvailability();
  if (!availability.available) {
    if (availability.reason === 'limit_reached') {
      throw new Error(
        `Límite de atención alcanzado (${availability.maxTickets} clientes). Espera a que el administrador vuelva a habilitar turnos.`
      );
    }
    throw new Error(
      'La asignación de nuevos turnos se encuentra pausada temporalmente por el administrador.'
    );
  }

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

export async function getUserActiveTicket(
  userId?: string | null,
  userEmail?: string | null
): Promise<Ticket | null> {
  if (!userId && !userEmail) return null;

  try {
    let query = supabase
      .from('tickets')
      .select('*')
      .in('status', ['waiting', 'in_progress'])
      .order('created_at', { ascending: false });

    if (userId && userEmail) {
      query = query.or(`user_id.eq.${userId},user_email.eq.${userEmail}`);
    } else if (userId) {
      query = query.eq('user_id', userId);
    } else if (userEmail) {
      query = query.eq('user_email', userEmail);
    }

    const { data, error } = await query.limit(1).maybeSingle();
    if (error || !data) return null;
    return data as Ticket;
  } catch (err) {
    console.error('Error fetching user active ticket:', err);
    return null;
  }
}

export async function getTickets(limit = 100): Promise<Ticket[]> {
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
