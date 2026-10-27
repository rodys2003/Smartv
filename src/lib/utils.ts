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
 * Parsea la información de pago del ticket para determinar
 * si el cobro es en COP (Bre-B) o en USDT (Binance).
 */
export function parseTicketPaymentInfo(ticket?: {
  total_price?: number;
  notes?: string | null;
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
      if (ticket.notes.startsWith('{')) {
        const parsed = JSON.parse(ticket.notes);
        if (parsed.payment_method === 'binance') {
          const usdt = parsed.usdt_price ?? ticket.total_price;
          return {
            method: 'binance',
            formattedPrice: `${usdt} USDT`,
            isCrypto: true,
          };
        }
      } else if (ticket.notes.includes('binance') || ticket.notes.includes('USDT')) {
        return {
          method: 'binance',
          formattedPrice: `${ticket.total_price} USDT`,
          isCrypto: true,
        };
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
    formattedPrice: formatCOP(ticket.total_price || 0),
    isCrypto: false,
  };
}
