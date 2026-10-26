'use client';

import React from 'react';
import { Ticket } from '@/types';
import { formatCOP, formatTicketNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { generateWhatsAppLink } from '@/lib/whatsapp/generateLink';
import { Tv, MessageCircle, Clock, Sparkles } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  queuePosition?: number;
}

export function TicketCard({ ticket, queuePosition }: TicketCardProps) {
  const handleOpenWhatsApp = () => {
    const link = generateWhatsAppLink(ticket);
    window.open(link, '_blank');
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/40 rounded-3xl p-6 md:p-8 shadow-[0_0_40px_rgba(6,182,212,0.2)] overflow-hidden">
      {/* Decorative neon glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Ticket Header */}
      <div className="flex items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">
              Pase Digital Oficial
            </span>
            <span className="text-sm font-bold text-white">Smart TV Like a Pro</span>
          </div>
        </div>

        <Badge status={ticket.status} />
      </div>

      {/* Ticket Number & Queue Position */}
      <div className="my-6 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 block font-semibold">
            Tu Número de Turno
          </span>
          <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 tracking-tight">
            {formatTicketNumber(ticket.ticket_number)}
          </span>
        </div>

        {queuePosition !== undefined && queuePosition > 0 && (
          <div className="text-right bg-slate-800/60 border border-slate-700/60 px-4 py-2 rounded-2xl">
            <span className="text-[10px] uppercase text-slate-400 font-bold block">
              Posición en cola
            </span>
            <span className="text-lg font-bold text-amber-300">
              #{queuePosition} en fila
            </span>
          </div>
        )}
      </div>

      {/* Ticket Details */}
      <div className="space-y-3 py-4 border-t border-b border-slate-800 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Cliente:</span>
          <span className="font-semibold text-white">{ticket.user_name || 'Cliente'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Marca / TV:</span>
          <span className="font-semibold text-white">
            {ticket.tv_brand} {ticket.tv_model ? `(${ticket.tv_model})` : ''}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Plan:</span>
          <span className="font-semibold text-cyan-300">{ticket.service_name}</span>
        </div>
        {ticket.has_magic_apps && (
          <div className="flex items-center justify-between text-fuchsia-300">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Apps Mágicas:
            </span>
            <span className="font-semibold">Incluidas</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-1">
          <span className="text-slate-400 font-medium">Total:</span>
          <span className="text-base font-bold text-white">
            {formatCOP(ticket.total_price)}
          </span>
        </div>
      </div>

      {/* Action CTA */}
      <div className="mt-6 space-y-2.5">
        <Button
          variant="whatsapp"
          size="lg"
          onClick={handleOpenWhatsApp}
          className="w-full font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Enviar Ticket por WhatsApp para Iniciar</span>
        </Button>

        <a
          href="#pago"
          className="w-full py-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-emerald-300 hover:text-white hover:bg-emerald-500/20 text-xs font-bold flex items-center justify-center gap-2 transition-colors text-center"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Ver Medio de Pago Bre-B (Pagas tras conectar tu TV)</span>
        </a>

        <p className="text-[11px] text-center text-slate-400 pt-1">
          Atendemos en orden estricto de llegada. Ten a mano las fotos de tu TV.
        </p>
      </div>
    </div>
  );
}
