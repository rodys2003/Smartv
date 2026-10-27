import {
  SERVICE_PLANS,
  PLAN_USDT_PRICES,
  MAGIC_APPS_PRICE_COP,
  MAGIC_APPS_PRICE_USDT,
} from '@/features/services-catalog/constants/plans';

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const BASE_TICKET_OFFSET = 72; // Start ticket numbering at # A073

/**
 * Nomenclatura oficial de turnos:
 * Inicia de manera fija en # A073 y va aumentando con los turnos reales.
 * Al llegar a # A999 pasa a # B001 en adelante.
 */
export function formatTicketNumber(num: number): string {
  if (!num || num < 1) return '# A073';
  const effectiveNum = num < 73 ? num + BASE_TICKET_OFFSET : num;
  const zeroIndexed = effectiveNum - 1;
  const letterIndex = Math.floor(zeroIndexed / 999);
  const numberPart = (zeroIndexed % 999) + 1;
  const letterCode = String.fromCharCode(65 + (letterIndex % 26));
  const prefix =
    letterIndex >= 26
      ? `${String.fromCharCode(64 + Math.floor(letterIndex / 26))}${letterCode}`
      : letterCode;
  return `# ${prefix}${numberPart.toString().padStart(3, '0')}`;
}

/**
 * Tiempo de espera acumulado:
 * Suma de 15 en 15 minutos según usuarios con turnos pendientes.
 * Al pasar a horas cambia a: + 1h, + 2h, + 3h...
 */
export function formatWaitTime(pendingCount: number): string {
  if (pendingCount <= 0) return 'Inmediato (~15 min)';
  const totalMinutes = pendingCount * 15;
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  return `+ ${hours}h`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Calcula de forma consistente el precio en Pesos Colombianos (COP) para un ticket
 * tomando en cuenta el plan seleccionado, el add-on de Apps Mágicas o el campo cop_price guardado.
 */
export function getTicketCopPrice(ticket?: {
  total_price?: number;
  notes?: string | null;
  service_tier?: string;
  has_magic_apps?: boolean;
} | null): number {
  if (!ticket) return 50000;
  if (ticket.notes) {
    try {
      const trimmed = ticket.notes.trim();
      if (trimmed.startsWith('{')) {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed.cop_price === 'number' && parsed.cop_price > 0) {
          return parsed.cop_price;
        }
      }
    } catch {
      // ignore JSON parse error
    }
  }

  const plan = SERVICE_PLANS.find((p) => p.id === ticket.service_tier);
  const base =
    plan?.price ??
    (ticket.total_price && ticket.total_price > 100 ? ticket.total_price : 50000);
  return base + (ticket.has_magic_apps ? MAGIC_APPS_PRICE_COP : 0);
}

/**
 * Calcula de forma consistente el precio en USDT (Binance) para un ticket
 * tomando en cuenta el plan seleccionado, el add-on de Apps Mágicas o el campo usdt_price guardado.
 */
export function getTicketUsdtPrice(ticket?: {
  total_price?: number;
  notes?: string | null;
  service_tier?: string;
  has_magic_apps?: boolean;
} | null): number {
  if (!ticket) return 17;
  if (ticket.notes) {
    try {
      const trimmed = ticket.notes.trim();
      if (trimmed.startsWith('{')) {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed.usdt_price === 'number' && parsed.usdt_price > 0) {
          return parsed.usdt_price;
        }
      }
    } catch {
      // ignore JSON parse error
    }
  }

  const planPrice = ticket.service_tier ? PLAN_USDT_PRICES[ticket.service_tier] : undefined;
  const base: number =
    planPrice ??
    (ticket.total_price && ticket.total_price <= 100 ? ticket.total_price : 17);
  return base + (ticket.has_magic_apps ? MAGIC_APPS_PRICE_USDT : 0);
}

/**
 * Parsea la información de pago del ticket para determinar
 * si el cobro es en COP (Bre-B) o en USDT (Binance).
 */
export function parseTicketPaymentInfo(ticket?: {
  total_price?: number;
  notes?: string | null;
  service_tier?: string;
  has_magic_apps?: boolean;
} | null): {
  method: 'bre_b' | 'binance';
  formattedPrice: string;
  isCrypto: boolean;
} {
  if (!ticket) {
    return { method: 'bre_b', formattedPrice: '$0 COP', isCrypto: false };
  }

  try {
    if (ticket.notes) {
      const trimmed = ticket.notes.trim();
      if (trimmed.startsWith('{')) {
        const parsed = JSON.parse(trimmed);

        if (parsed.payment_method === 'bre_b') {
          const cop = getTicketCopPrice(ticket);
          return {
            method: 'bre_b',
            formattedPrice: formatCOP(cop),
            isCrypto: false,
          };
        }

        if (parsed.payment_method === 'binance') {
          const usdt = getTicketUsdtPrice(ticket);
          return {
            method: 'binance',
            formattedPrice: `${usdt} USDT`,
            isCrypto: true,
          };
        }
      } else {
        const lower = trimmed.toLowerCase();
        if (
          lower.includes('bre_b') ||
          lower.includes('bre-b') ||
          lower.includes('cop') ||
          lower.includes('pesos')
        ) {
          const cop = getTicketCopPrice(ticket);
          return {
            method: 'bre_b',
            formattedPrice: formatCOP(cop),
            isCrypto: false,
          };
        }

        if (
          lower.includes('binance') ||
          lower.includes('usdt') ||
          lower.includes('trc20')
        ) {
          const usdt = getTicketUsdtPrice(ticket);
          return {
            method: 'binance',
            formattedPrice: `${usdt} USDT`,
            isCrypto: true,
          };
        }
      }
    }
  } catch {
    // ignore JSON parsing fallback
  }

  if (ticket.total_price !== undefined && ticket.total_price > 0 && ticket.total_price <= 100) {
    return {
      method: 'binance',
      formattedPrice: `${ticket.total_price} USDT`,
      isCrypto: true,
    };
  }

  return {
    method: 'bre_b',
    formattedPrice: formatCOP(getTicketCopPrice(ticket)),
    isCrypto: false,
  };
}
