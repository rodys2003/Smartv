'use client';

import React from 'react';
import { useQueue } from '../hooks/useQueue';
import { formatTicketNumber, formatWaitTime } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Clock, Users, Tv, RefreshCw, Zap, Lock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Ticket } from '@/types';
import { TicketCard } from './TicketCard';

interface QueueTrackerProps {
  isAuthenticated: boolean;
  userTicket?: Ticket | null;
  onOpenAuthModal: () => void;
  onOpenTicketModal: () => void;
}

export function QueueTracker({
  isAuthenticated,
  userTicket,
  onOpenAuthModal,
  onOpenTicketModal,
}: QueueTrackerProps) {
  const {
    servingTicket,
    waitingTickets,
    waitingCount,
    completedCount,
    totalCount,
    maxTickets,
    ticketsEnabled,
    canIssueTicket,
    loading,
    refreshQueue,
  } = useQueue();

  const waitTimeDisplay = formatWaitTime(waitingCount);

  return (
    <section id="cola" className="py-8 md:py-12 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
          <div>
            <Badge variant="cyan" className="mb-2">
              Atención 1 a 1 en Tiempo Real
            </Badge>
            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight">
              Cola de Turnos Digitales
            </h2>
            <p className="text-slate-400 text-xs md:text-sm mt-1">
              Atendemos en estricto orden de turno. Nomenclatura oficial # A001 en adelante.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refreshQueue()}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
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
              <span className="text-xs uppercase font-extrabold tracking-wider text-cyan-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Tu Turno Activo Asignado
              </span>
              <span className="text-xs text-slate-400">
                Mostrando estado de atención para tu televisor
              </span>
            </div>
            <TicketCard
              ticket={userTicket}
              queuePosition={
                waitingTickets.findIndex((t) => t.id === userTicket.id) !== -1
                  ? waitingTickets.findIndex((t) => t.id === userTicket.id) + 1
                  : undefined
              }
            />
          </div>
        )}

        {/* Dashboard 3 Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8">
          {/* Card 1: Currently Serving */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/40 rounded-3xl p-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-cyan-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                En Atención Ahora
              </span>
              <Tv className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-black text-white tracking-tight">
                {servingTicket
                  ? formatTicketNumber(servingTicket.ticket_number)
                  : 'Libre'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-2">
              {servingTicket
                ? 'Turno en proceso de atención técnica.'
                : 'Cola despejada. Tu turno será atendido inmediatamente.'}
            </p>
          </div>

          {/* Card 2: Waiting in Line */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                En Espera
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Tope: {totalCount}/{maxTickets}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-black text-amber-300 tracking-tight">
                {waitingCount}
              </span>
              <span className="text-xs text-slate-400 font-medium">turnos pendientes</span>
            </div>

            <p className="text-[11px] text-slate-400 mt-2">
              {waitingCount === 0
                ? '¡Sin espera! Toma tu turno y te atendemos al instante.'
                : `${waitingCount} turnos esperando optimización remota.`}
            </p>
          </div>

          {/* Card 3: Estimated Cumulative Wait Time */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-fuchsia-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Tiempo de Espera Acumulado
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-black text-fuchsia-400 tracking-tight">
                {waitTimeDisplay}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-2">
              Calculado a razón de 15 min por turno pendiente.
            </p>
          </div>
        </div>

        {/* Waiting tickets live list */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Próximos 5 Turnos en Fila</span>
            </h3>
            <span className="text-xs text-slate-400">
              Total atendidos: <strong className="text-emerald-400">{completedCount}</strong> / {maxTickets}
            </span>
          </div>

          {waitingTickets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-slate-400">
                No hay turnos en espera en este momento. ¡Sé el primero de la fila!
              </p>
              {canIssueTicket && !userTicket && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenTicketModal}
                  className="mt-3 text-xs"
                >
                  Tomar Turno # A001
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {waitingTickets.slice(0, 5).map((ticket) => (
                <div
                  key={ticket.id}
                  className="py-3 flex items-center justify-between gap-4 text-xs"
                >
                  <span className="font-mono font-bold text-cyan-300 text-sm">
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
