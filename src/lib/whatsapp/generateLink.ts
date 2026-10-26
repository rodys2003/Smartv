import { Ticket } from '@/types';
import { formatTicketNumber, parseTicketPaymentInfo } from '@/lib/utils';

export function getWhatsAppNumber(): string {
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573105555555';
}

export function generateWhatsAppLink(ticket: Partial<Ticket>): string {
  const phone = getWhatsAppNumber().replace(/\D/g, '');
  const ticketStr = ticket.ticket_number ? formatTicketNumber(ticket.ticket_number) : 'Sin asignar';
  const planName = ticket.service_name || 'Optimización';
  const paymentInfo = parseTicketPaymentInfo(ticket);
  const priceStr = paymentInfo.formattedPrice;
  const methodLabel = paymentInfo.isCrypto ? 'Binance (USDT TRC20)' : 'Llave Bre-B (COP)';
  const magicAppsStr = ticket.has_magic_apps
    ? paymentInfo.isCrypto
      ? 'Sí (+7 USDT)'
      : 'Sí (+$20.000 COP)'
    : 'No';
  const brand = ticket.tv_brand || 'Smart TV';
  const userName = ticket.user_name ? ` (Cliente: ${ticket.user_name})` : '';

  const message = `¡Hola *Smart TV Like a Pro*! 🚀${userName}

Acabo de separar mi turno en la plataforma:
🎫 *Turno / Ticket:* ${ticketStr}
📺 *Dispositivo:* ${brand} ${ticket.tv_model ? `(${ticket.tv_model})` : ''}
📦 *Servicio elegido:* ${planName}
🪄 *Apps Mágicas:* ${magicAppsStr}
💳 *Medio de pago:* ${methodLabel}
💰 *Total a pagar:* ${priceStr}

Ya tengo listas las fotos solicitadas en la guía paso a paso para que me atiendas. Entiendo que una vez llegue mi turno dispongo de 5 minutos para responder y enviar los soportes. ¿Me confirmas mi turno, por favor?`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
