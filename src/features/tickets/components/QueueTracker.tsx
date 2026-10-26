'use client';

import React from 'react';
import { useQueue } from '../hooks/useQueue';
import { formatTicketNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Clock, Users, Tv, RefreshCw, Zap, Lock, ShieldCheck } from 'lucide-react';

interface QueueTrackerProps {
  isAuthenticated: boolean;
  onOpenAuthModal: () => void;
  onOpenTicketModal: () => void;
}

export function QueueTracker({
  isAuthenticated,
  onOpenAuthModal,
  onOpenTicketModal,
}: QueueTrackerProps) {
  const { servingTicket, waitingTickets, waitingCount, completedCount, loading, refreshQueue } =
    useQueue();

  const estWaitMinutes = Math.max(15, waitingCount * 15);

  return (
    <section id="cola" className="py-16 md:py-20 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
          <div>
            <Badge variant="cyan" className="mb-2.5">
              Atención Global
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Cola de Atención en Tiempo Real
            </h2>
            <p className="text-slate-400 text-xs md:text-sm mt-1">
              Atendemos uno a uno a través de WhatsApp en estricto orden de turno.
            </p>
          </div>

          {isAuthenticated && (
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
              <Button
                variant="primary"
                size="md"
                onClick={onOpenTicketModal}
                className="text-xs font-bold"
              >
                Tomar mi Turno
              </Button>
            </div>
          )}
        </div>

        {/* LOCKED STATE FOR NON-LOGGED IN USERS */}
        {!isAuthenticated ? (
          <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
              <Lock className="w-7 h-7" />
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2">
              Ingresa con Google para Acceder a la Cola
            </h3>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-6">
              El sistema de asignación de turnos digitales y seguimiento en vivo está habilitado para clientes verificados con Google.
            </p>

            <Button
              variant="primary"
              size="lg"
              onClick={onOpenAuthModal}
              className="px-8 py-3.5 text-sm font-bold shadow-[0_0_20px_rgba(6,182,212,0.35)]"
            >
              Iniciar Sesión con Google para Tomar Turno
            </Button>
          </div>
        ) : (
          /* AUTHENTICATED STATE: ACTIVE QUEUE DASHBOARD */
          <>
            {/* Status Dashboard Banner */}
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
                  {servingTicket && (
                    <span className="text-xs text-slate-400 font-semibold truncate max-w-[120px]">
                      ({servingTicket.tv_brand})
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 mt-2">
                  {servingTicket
                    ? `Optimizando servicio: ${servingTicket.service_name}`
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
                    : `${waitingCount} personas esperando optimización.`}
                </p>
              </div>

              {/* Card 3: Estimated Wait Time */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs uppercase font-bold tracking-wider text-fuchsia-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Tiempo de Espera Estimado
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-black text-fuchsia-400 tracking-tight">
                    ~{waitingCount === 0 ? 5 : estWaitMinutes}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">minutos aprox.</span>
                </div>

                <p className="text-[11px] text-slate-400 mt-2">
                  Tiempo promedio por televisor: 15 a 20 minutos según el plan.
                </p>
              </div>
            </div>

            {/* Waiting tickets live list */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 md:p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Próximos Turnos en Fila</span>
                </h3>
                <span className="text-xs text-slate-400">
                  Total completados hoy: <strong className="text-emerald-400">{completedCount}</strong>
                </span>
              </div>

              {waitingTickets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400">
                    No hay turnos en espera en este momento. ¡Sé el primero de la fila!
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenTicketModal}
                    className="mt-3 text-xs"
                  >
                    Tomar Turno #001
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80">
                  {waitingTickets.slice(0, 6).map((ticket, index) => (
                    <div
                      key={ticket.id}
                      className="py-3 flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-cyan-300 text-sm w-12">
                          {formatTicketNumber(ticket.ticket_number)}
                        </span>
                        <div>
                          <span className="font-semibold text-white block">
                            {ticket.tv_brand}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            {ticket.service_name} {ticket.has_magic_apps ? '+ Apps Mágicas' : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-500 hidden sm:inline">
                          Turno #{index + 1} en fila
                        </span>
                        <Badge status={ticket.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
