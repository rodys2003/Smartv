export type ServiceTier = 'basic_20k' | 'ultra_light_50k' | 'custom_pro_70k';

export interface ServicePlan {
  id: ServiceTier;
  name: string;
  price: number;
  badge?: string;
  popular?: boolean;
  tagline: string;
  description: string;
  previewImage?: string;
  features: string[];
}

export type TicketStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled';

export interface Ticket {
  id: string;
  ticket_number: number;
  user_id?: string | null;
  user_email?: string | null;
  user_name?: string | null;
  user_avatar?: string | null;
  tv_brand: string;
  tv_model?: string | null;
  service_tier: ServiceTier;
  service_name: string;
  has_magic_apps: boolean;
  total_price: number;
  status: TicketStatus;
  client_whatsapp?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  embedUrl: string;
  category: 'usb-debugging' | 'tailscale' | 'general';
}

export interface TVBrandGuide {
  id: string;
  name: string;
  logo: string;
  tag: string;
  steps: {
    step: number;
    title: string;
    description: string;
    actionable: string;
    details?: string[];
  }[];
  whatsappChecklist: string[];
  videos?: VideoTutorial[];
}
