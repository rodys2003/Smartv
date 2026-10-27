'use client';

import React, { useState, useEffect } from 'react';
import { useQueue } from '../hooks/useQueue';
import { formatTicketNumber, formatWaitTime } from '@/lib/utils';
import { getOperatingHoursInfo, OperatingHoursInfo } from '@/lib/operatingHours';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Clock, Users, Tv, RefreshCw, Zap, Lock, AlertTriangle, ShieldCheck, Globe } from 'lucide-react';
import { Ticket } from '@/types';
import { TicketCard } from './TicketCard';

interface QueueTrackerProps {
  isAuthenticated: boolean;
  userTicket?: Ticket | null;
  onOpenAuthModal: () => void;
  onOpenTicketModal: () => void;
  onEditPlan?: () => void;
}

export function QueueTracker({
  isAuthenticated,
  userTicket,
  onOpenAuthModal,
  onOpenTicketModal,
  onEditPlan,
}: QueueTrackerProps) {
  const {
    servingTicket,
    waitingTickets,
    waitingCount,
    completedCount,
    totalCount,
    maxTickets,
    ticketsEnabled,
    whatsappThreshold,
    canIssueTicket,
    loading,
    refreshQueue,
  } = useQueue();

  const waitTimeDisplay = formatWaitTime(waitingCount);
  const [hoursInfo, setHoursInfo] = useState<OperatingHoursInfo>(() => getOperatingHoursInfo());

  useEffect(() => {
    setHoursInfo(getOperatingHoursInfo());
    const interval = setInterval(() => {
      setHoursInfo(getOperatingHoursInfo());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="cola" className="py-8 md:py-12 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
          <div>
            <Badge variant="cyan" className="mb-2">
              Atención 1 a 1 en Tiempo Real
            </Badge>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Cola de Turnos Digitales
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm mt-1">
              Atendemos en estricto orden de turno. Nomenclatura oficial # A073 en adelante.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refreshQueue()}
              disabled={loading}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 shadow-sm transition-colors cursor-pointer"
              title="Actualizar cola"
              aria-label="Actualizar cola"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {isAuthenticated && !userTicket && (
              <Button
                variant="primary"
                size="md"
                onClick={onOpenTicketModal}
                disabled={!canIssueTicket}
                className="text-xs font-bold"
              >
                {canIssueTicket ? 'Tomar mi Turno' : 'Cupos Agotados'}
              </Button>
            )}
          </div>
        </div>

        {/* STATUS BANNER IF LIMIT REACHED OR TICKETS PAUSED */}
        {!canIssueTicket && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300 text-sm">
                {!ticketsEnabled
                  ? 'Asignación de turnos pausada temporalmente'
                  : `Límite de atención alcanzado (${totalCount}/${maxTickets} clientes)`}
              </p>
              <p className="mt-0.5 text-amber-200/90 leading-relaxed">
                {!ticketsEnabled
                  ? 'El administrador ha pausado la recepción de nuevos turnos para atender a los clientes en fila. Espera unos momentos.'
                  : `Hemos alcanzado el tope de ${maxTickets} clientes por sesión para garantizar la máxima calidad. Espera a que el administrador vuelva a habilitar turnos.`}
              </p>
            </div>
          </div>
        )}

        {/* USER'S ACTIVE TICKET BANNER (IF HAS TICKET) */}
        {userTicket && (
          <div className="mb-10">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Tu Turno Activo Asignado
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Mostrando estado de atención para tu televisor
              </span>
            </div>
            <TicketCard
              ticket={userTicket}
              onEditPlan={onEditPlan}
              whatsappThreshold={whatsappThreshold}
              queuePosition={
                waitingTickets.findIndex((t) => t.id === userTicket.id) !== -1
                  ? waitingTickets.findIndex((t) => t.id === userTicket.id) + 1
                  : undefined
              }
            />
          </div>
        )}

        {/* OPERATING HOURS & TIMEZONE BANNER */}
        <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-slate-900/90 dark:via-slate-900/70 dark:to-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm dark:shadow-lg">
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`p-2 rounded-xl shrink-0 mt-0.5 sm:mt-0 ${
                hoursInfo.isOpen
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                  : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
              }`}
            >
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 dark:text-white">Horario de Atención:</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{hoursInfo.colombiaHours} (Hora Colombia)</span>
                {!hoursInfo.isSameAsColombia && (
                  <span className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1">
                    <Globe className="w-3 h-3 text-fuchsia-500 dark:text-fuchsia-400 inline" />
                    <span>En tu país ({hoursInfo.userCity}):</span>
                    <strong className="text-fuchsia-600 dark:text-fuchsia-300 font-bold">{hoursInfo.localHours}</strong>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {hoursInfo.isOpen
                  ? 'Técnicos conectados atendiendo turnos en tiempo real.'
                  : `${hoursInfo.nextOpeningText}. Turnos en modo reserva anticipada.`}
              </p>
              <p className="text-[10.5px] text-amber-700 dark:text-amber-300/90 mt-1">
                ⏱️ <strong>Tolerancia por turno:</strong> Al llegar tu turno o reanudarse la jornada, dispones de <strong>5 min</strong> para responder por WhatsApp y enviar tus fotos/documentos, o el ticket se cancelará.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                hoursInfo.isOpen
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30'
                  : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  hoursInfo.isOpen ? 'bg-emerald-500 dark:bg-emerald-400 animate-pulse' : 'bg-amber-500 dark:bg-amber-400'
                }`}
              />
              <span>{hoursInfo.isOpen ? 'Atendiendo Ahora' : 'Fuera de Horario'}</span>
            </span>
          </div>
        </div>

        {/* EMPTY QUEUE MOTIVATION BANNER */}
        {!servingTicket && waitingCount === 0 && (
          <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-50 via-cyan-50 to-slate-50 dark:from-emerald-500/15 dark:via-cyan-500/10 dark:to-slate-900 border border-emerald-300 dark:border-emerald-500/40 shadow-sm dark:shadow-[0_0_35px_rgba(16,185,129,0.15)] flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm dark:shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30">
                    ¡Cola Totalmente Despejada!
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Técnicos disponibles ahora</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  ¿Querés optimizar tu Smart TV hoy? ¡Cero tiempo de espera!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
                  No hay nadie en fila en este momento. Tomá tu turno ahora mismo y nuestro equipo técnico iniciará la optimización de tu televisor de inmediato.
                </p>
              </div>
            </div>

            {canIssueTicket && !userTicket && (
              <Button
                variant="whatsapp"
                size="lg"
                onClick={onOpenTicketModal}
                className="shrink-0 font-black text-xs shadow-md dark:shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Tomar Turno Inmediato ({formatTicketNumber(1)})</span>
              </Button>
            )}
          </div>
        )}

        {/* Dashboard 3 Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8">
          {/* Card 1: Currently Serving */}
          <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 border border-cyan-300 dark:border-cyan-500/40 rounded-3xl p-6 shadow-md dark:shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-ping" />
                En Atención Ahora
              </span>
              <Tv className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {servingTicket
                  ? formatTicketNumber(servingTicket.ticket_number)
                  : 'Libre'}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              {servingTicket
                ? 'Turno en proceso de atención técnica.'
                : 'Cola despejada. Tu turno será atendido inmediatamente.'}
            </p>
          </div>

          {/* Card 2: Waiting in Line */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                En Espera
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Tope: {totalCount}/{maxTickets}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-black text-amber-600 dark:text-amber-300 tracking-tight">
                {waitingCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">turnos pendientes</span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              {waitingCount === 0
                ? '¡Sin espera! Toma tu turno y te atendemos al instante.'
                : `${waitingCount} turnos esperando optimización remota.`}
            </p>
          </div>

          {/* Card 3: Estimated Wait Time */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-fuchsia-600 dark:text-fuchsia-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Tiempo de Espera
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-black text-fuchsia-600 dark:text-fuchsia-400 tracking-tight">
                {waitTimeDisplay}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              {waitingCount === 0
                ? '¡Sin espera! Tu turno será atendido al instante.'
                : 'Calculado a razón de 15 min por turno pendiente.'}
            </p>
          </div>
        </div>

        {/* Waiting tickets live list */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Próximos 5 Turnos en Fila</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Total atendidos: <strong className="text-emerald-600 dark:text-emerald-400">{completedCount}</strong> / {maxTickets}
            </span>
          </div>

          {waitingTickets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No hay turnos en espera en este momento. ¡Sé el primero de la fila!
              </p>
              {canIssueTicket && !userTicket && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenTicketModal}
                  className="mt-3 text-xs"
                >
                  Tomar Turno # A073
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {waitingTickets.slice(0, 5).map((ticket) => (
                <div
                  key={ticket.id}
                  className="py-3 flex items-center justify-between gap-4 text-xs"
                >
                  <span className="font-mono font-bold text-cyan-700 dark:text-cyan-300 text-sm">
                    {formatTicketNumber(ticket.ticket_number)}
                  </span>
                  <Badge status={ticket.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
