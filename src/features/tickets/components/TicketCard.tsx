'use client';

import React, { useState, useEffect } from 'react';
import { Ticket } from '@/types';
import { formatTicketNumber, parseTicketPaymentInfo } from '@/lib/utils';
import { getOperatingHoursInfo, OperatingHoursInfo } from '@/lib/operatingHours';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { generateWhatsAppLink } from '@/lib/whatsapp/generateLink';
import { Tv, MessageCircle, Clock, Sparkles, CreditCard, Coins, Edit3, Pencil, Globe, Lock } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  queuePosition?: number;
  onEditPlan?: () => void;
  whatsappThreshold?: number;
}

export function TicketCard({
  ticket,
  queuePosition,
  onEditPlan,
  whatsappThreshold = 5,
}: TicketCardProps) {
  const paymentInfo = parseTicketPaymentInfo(ticket);
  const [hoursInfo, setHoursInfo] = useState<OperatingHoursInfo>(() => getOperatingHoursInfo());

  useEffect(() => {
    setHoursInfo(getOperatingHoursInfo());
  }, []);

  const handleOpenWhatsApp = () => {
    const link = generateWhatsAppLink(ticket);
    window.open(link, '_blank');
  };

  const isBeingServed = ticket.status === 'in_progress';
  const isCompleted = ticket.status === 'completed';
  const isCancelled = ticket.status === 'cancelled';
  const hasQueuePosition = queuePosition !== undefined && queuePosition > 0;
  const isWithinThreshold = hasQueuePosition ? queuePosition <= whatsappThreshold : true;
  const isWhatsAppUnlocked = !isCancelled && (isBeingServed || isCompleted || isWithinThreshold);

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
          <div className="flex items-center gap-2">
            <span className="font-semibold text-cyan-300">{ticket.service_name}</span>
            {onEditPlan && (
              <button
                type="button"
                onClick={onEditPlan}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                title="Modificar plan"
              >
                <Edit3 className="w-3 h-3" />
                <span>Modificar</span>
              </button>
            )}
          </div>
        </div>
        {ticket.has_magic_apps && (
          <div className="flex items-center justify-between text-fuchsia-300">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Apps Mágicas:
            </span>
            <span className="font-semibold">
              {paymentInfo.isCrypto ? 'Incluidas (+7 USDT)' : 'Incluidas (+20k)'}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Método de Pago:</span>
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            {paymentInfo.isCrypto ? (
              <>
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Binance (USDT TRC20)</span>
              </>
            ) : (
              <>
                <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                <span>Llave Bre-B (COP)</span>
              </>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-slate-400 font-medium">Total a pagar:</span>
          <span className="text-base font-black text-cyan-400">
            {paymentInfo.formattedPrice}
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Horario de Atención:</span>
          </span>
          <div className="text-right">
            <span className="font-semibold text-white">6:00 AM - 9:00 PM COL</span>
            {!hoursInfo.isSameAsColombia && (
              <span className="block text-[11px] text-fuchsia-300 font-medium">
                {hoursInfo.localHours} ({hoursInfo.userCity})
              </span>
            )}
          </div>
        </div>

        {/* 5 min response tolerance policy */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-200/95 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Tolerancia de atención: 5 minutos</span>
          </div>
          <p className="text-[10.5px] leading-relaxed text-slate-300">
            Al llegar tu turno (o al reanudarse la atención a las 6:00 AM COL), tienes <strong className="text-white">5 minutos</strong> para responder por WhatsApp y enviar los documentos/fotos de tu TV. Si no hay respuesta en ese lapso, el ticket se cancelará automáticamente para atender al siguiente turno.
          </p>
        </div>

        {!hoursInfo.isOpen && (
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-amber-300 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>Fuera de horario. {hoursInfo.nextOpeningText}. Tu turno está reservado.</span>
          </div>
        )}
      </div>

      {/* Action CTA */}
      <div className="mt-6 space-y-2.5">
        {isWhatsAppUnlocked ? (
          <Button
            variant="whatsapp"
            size="lg"
            onClick={handleOpenWhatsApp}
            className="w-full font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>
              {isBeingServed
                ? '¡Tu Turno está en Atención! Abrir WhatsApp'
                : hasQueuePosition
                ? `Enviar Ticket por WhatsApp (Top ${whatsappThreshold} en Fila)`
                : 'Enviar Ticket por WhatsApp para Iniciar'}
            </span>
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="w-full py-3.5 px-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-slate-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed select-none">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>WhatsApp disponible en el Top {whatsappThreshold} de la fila</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/25 text-xs text-slate-300 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tu posición actual: #{queuePosition} en fila</span>
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  Top {whatsappThreshold} requerido
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                Para garantizar atención 1 a 1 de calidad, el botón de WhatsApp se desbloquea de forma automática cuando estés entre los <strong className="text-white">{whatsappThreshold} primeros</strong> de la fila. Mientras tanto, completa los 3 pasos en tu TV.
              </p>
            </div>
          </div>
        )}

        {onEditPlan && (
          <button
            type="button"
            onClick={onEditPlan}
            className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-cyan-400" />
            <span>Modificar Plan o Método de Pago</span>
          </button>
        )}

        <a
          href="#pago"
          className="w-full py-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-emerald-300 hover:text-white hover:bg-emerald-500/20 text-xs font-bold flex items-center justify-center gap-2 transition-colors text-center"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            {paymentInfo.isCrypto
              ? 'Ver Datos de Binance USDT (Pagas tras conectar tu TV)'
              : 'Ver Llave Bre-B (Pagas tras conectar tu TV)'}
          </span>
        </a>

        <p className="text-[11px] text-center text-slate-400 pt-1">
          Atendemos en orden estricto de llegada. Ten a mano las fotos de tu TV.
        </p>
      </div>
    </div>
  );
}
