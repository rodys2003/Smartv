'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Ticket, TicketStatus } from '@/types';
import { getTickets, updateTicketStatus } from '@/features/tickets/services/ticketService';
import { formatCOP, formatTicketNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { generateWhatsAppLink } from '@/lib/whatsapp/generateLink';
import {
  Tv,
  MessageCircle,
  RefreshCw,
  ArrowLeft,
  CheckCircle,
  Clock,
  PlayCircle,
  XCircle,
  Sparkles
} from 'lucide-react';

export default function AdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'waiting' | 'in_progress' | 'completed'>('all');

  const fetchTickets = async () => {
    setLoading(true);
    const data = await getTickets(100);
    setTickets(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (id: string, newStatus: TicketStatus) => {
    const ok = await updateTicketStatus(id, newStatus);
    if (ok) {
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const waitingCount = tickets.filter((t) => t.status === 'waiting').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const completedCount = tickets.filter((t) => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 p-4 sm:p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">Panel de Administración</h1>
                <Badge variant="cyan">Control de Turnos</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Smart TV Like a Pro · Gestión de atención 1 a 1 en tiempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchTickets}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-cyan-400 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
            <Link href="/">
              <Button variant="outline" size="sm" className="text-xs">
                Ver Sitio Público
              </Button>
            </Link>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-800/80 border-cyan-400 shadow-md'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
              Total Tickets
            </span>
            <span className="text-2xl font-black text-white mt-1 block">
              {tickets.length}
            </span>
          </button>

          <button
            onClick={() => setFilter('in_progress')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              filter === 'in_progress'
                ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-bold block flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              En Atención
            </span>
            <span className="text-2xl font-black text-cyan-300 mt-1 block">
              {inProgressCount}
            </span>
          </button>

          <button
            onClick={() => setFilter('waiting')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              filter === 'waiting'
                ? 'bg-amber-950/40 border-amber-400 shadow-md'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold block">
              En Espera
            </span>
            <span className="text-2xl font-black text-amber-300 mt-1 block">
              {waitingCount}
            </span>
          </button>

          <button
            onClick={() => setFilter('completed')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              filter === 'completed'
                ? 'bg-emerald-950/40 border-emerald-400 shadow-md'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold block">
              Completados
            </span>
            <span className="text-2xl font-black text-emerald-300 mt-1 block">
              {completedCount}
            </span>
          </button>
        </div>

        {/* Tickets Table / List */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Tv className="w-4 h-4 text-cyan-400" />
              <span>Cola de Clientes ({filteredTickets.length})</span>
            </h2>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm">
              No hay tickets en este filtro.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {filteredTickets.map((t) => (
                <div
                  key={t.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
                >
                  {/* Left: ticket and customer */}
                  <div className="flex items-start gap-4">
                    <span className="text-lg font-mono font-black text-cyan-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
                      {formatTicketNumber(t.ticket_number)}
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">
                          {t.user_name || 'Cliente'}
                        </span>
                        {t.user_email && (
                          <span className="text-xs text-slate-400">({t.user_email})</span>
                        )}
                        <Badge status={t.status} />
                      </div>
                      <p className="text-xs text-slate-300">
                        <strong className="text-slate-400">TV: </strong>
                        {t.tv_brand} {t.tv_model ? `(${t.tv_model})` : ''} ·{' '}
                        <strong className="text-cyan-300">{t.service_name}</strong>
                        {t.has_magic_apps && (
                          <span className="text-fuchsia-400 font-semibold ml-1">
                            + Apps Mágicas
                          </span>
                        )}
                      </p>
                      <span className="text-[11px] text-slate-500 block">
                        Registrado: {new Date(t.created_at).toLocaleString('es-CO')}
                      </span>
                    </div>
                  </div>

                  {/* Right: Price & Quick Action buttons */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <span className="text-base font-black text-white mr-2">
                      {formatCOP(t.total_price)}
                    </span>

                    {/* WhatsApp button */}
                    <button
                      type="button"
                      onClick={() => {
                        const link = generateWhatsAppLink(t);
                        window.open(link, '_blank');
                      }}
                      className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors cursor-pointer"
                      title="Contactar en WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>

                    {/* Status actions */}
                    {t.status === 'waiting' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleStatusChange(t.id, 'in_progress')}
                        className="text-xs font-bold"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Atender</span>
                      </Button>
                    )}

                    {t.status === 'in_progress' && (
                      <Button
                        size="sm"
                        variant="whatsapp"
                        onClick={() => handleStatusChange(t.id, 'completed')}
                        className="text-xs font-bold"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Completar</span>
                      </Button>
                    )}

                    {t.status !== 'cancelled' && t.status !== 'completed' && (
                      <button
                        onClick={() => handleStatusChange(t.id, 'cancelled')}
                        className="p-2 text-slate-500 hover:text-rose-400 text-xs transition-colors cursor-pointer"
                        title="Cancelar ticket"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
