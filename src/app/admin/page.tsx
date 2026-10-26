'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Ticket, TicketStatus } from '@/types';
import { getTickets, updateTicketStatus } from '@/features/tickets/services/ticketService';
import {
  getQueueSettings,
  updateQueueSettings,
  QueueSettings,
} from '@/features/settings/services/settingsService';
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
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Users,
  LayoutDashboard,
} from 'lucide-react';

export default function AdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [settings, setSettings] = useState<QueueSettings>({
    max_tickets: 100,
    tickets_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [filter, setFilter] = useState<'all' | 'waiting' | 'in_progress' | 'completed' | 'cancelled'>('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ticketsData, settingsData] = await Promise.all([
        getTickets(200),
        getQueueSettings(),
      ]);
      setTickets(ticketsData);
      setSettings(settingsData);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleStatusChange = async (id: string, newStatus: TicketStatus) => {
    const ok = await updateTicketStatus(id, newStatus);
    if (ok) {
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
    }
  };

  const handleToggleTicketsEnabled = async () => {
    setUpdatingSettings(true);
    const updated = await updateQueueSettings({
      tickets_enabled: !settings.tickets_enabled,
    });
    if (updated) {
      setSettings(updated);
    }
    setUpdatingSettings(false);
  };

  const handleResetCapacityLimit = async () => {
    setUpdatingSettings(true);
    // Re-enable tickets and ensure max_tickets is set to 100 or current + 50
    const newMax = Math.max(100, tickets.length + 50);
    const updated = await updateQueueSettings({
      tickets_enabled: true,
      max_tickets: newMax,
    });
    if (updated) {
      setSettings(updated);
    }
    setUpdatingSettings(false);
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const waitingCount = tickets.filter((t) => t.status === 'waiting').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const completedCount = tickets.filter((t) => t.status === 'completed').length;
  const cancelledCount = tickets.filter((t) => t.status === 'cancelled').length;
  const nonCancelledCount = tickets.filter((t) => t.status !== 'cancelled').length;

  const isLimitReached = nonCancelledCount >= settings.max_tickets;

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
              onClick={fetchData}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-cyan-400 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="text-xs">
                <LayoutDashboard className="w-3.5 h-3.5 mr-1" />
                <span>Panel de Usuario</span>
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-xs">
                Ver Sitio Público
              </Button>
            </Link>
          </div>
        </div>

        {/* Queue Settings & Capacity Controller Box */}
        <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Control de Capacidad & Emisión de Turnos</span>
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  settings.tickets_enabled && !isLimitReached
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}
              >
                {settings.tickets_enabled && !isLimitReached
                  ? 'Turnos Habilitados'
                  : isLimitReached
                  ? 'Tope de 100 Alcanzado'
                  : 'Turnos Pausados'}
              </span>
            </div>

            <p className="text-xs text-slate-300 max-w-xl">
              Capacidad configurada: <strong>{nonCancelledCount}</strong> tickets registrados de{' '}
              <strong>{settings.max_tickets}</strong> permitidos. Cuando se alcanza el límite de{' '}
              {settings.max_tickets} clientes, el sistema bloquea automáticamente la creación de turnos hasta que el administrador vuelva a habilitarlos.
            </p>

            {/* Progress Bar of Capacity */}
            <div className="w-full bg-slate-950 rounded-full h-2.5 border border-slate-800 overflow-hidden mt-2">
              <div
                className={`h-full transition-all duration-500 ${
                  isLimitReached
                    ? 'bg-rose-500'
                    : nonCancelledCount >= 80
                    ? 'bg-amber-400'
                    : 'bg-cyan-400'
                }`}
                style={{
                  width: `${Math.min(100, (nonCancelledCount / settings.max_tickets) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Toggle tickets enabled */}
            <Button
              variant={settings.tickets_enabled ? 'outline' : 'primary'}
              size="md"
              disabled={updatingSettings}
              onClick={handleToggleTicketsEnabled}
              className="text-xs font-bold flex items-center gap-2"
            >
              {settings.tickets_enabled ? (
                <>
                  <ToggleRight className="w-4 h-4 text-emerald-400" />
                  <span>Pausar Nuevos Turnos</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4 text-slate-400" />
                  <span>Habilitar Turnos</span>
                </>
              )}
            </Button>

            {/* Re-enable button when limit reached or to expand capacity */}
            <Button
              variant="whatsapp"
              size="md"
              disabled={updatingSettings}
              onClick={handleResetCapacityLimit}
              className="text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Habilitar Más Cupos (+50)</span>
            </Button>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-800/80 border-cyan-400 shadow-md'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
              Total Registrados
            </span>
            <span className="text-2xl font-black text-white mt-1 block">
              {tickets.length}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Tope: {settings.max_tickets}
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
            <span className="text-[10px] text-slate-500 block mt-0.5">Atendiendo ahora</span>
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
            <span className="text-[10px] text-slate-500 block mt-0.5">En fila</span>
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
            <span className="text-[10px] text-slate-500 block mt-0.5">Finalizados con éxito</span>
          </button>

          <button
            onClick={() => setFilter('cancelled')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer col-span-2 sm:col-span-1 ${
              filter === 'cancelled'
                ? 'bg-rose-950/40 border-rose-400 shadow-md'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[11px] uppercase tracking-wider text-rose-400 font-bold block">
              Cancelados
            </span>
            <span className="text-2xl font-black text-rose-300 mt-1 block">
              {cancelledCount}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Descartados</span>
          </button>
        </div>

        {/* Tickets Table / List */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Tv className="w-4 h-4 text-cyan-400" />
              <span>Cola de Clientes Oficial ({filteredTickets.length})</span>
            </h2>
            <span className="text-xs text-slate-400">
              Nomenclatura: <strong># A001</strong> a <strong># A999</strong>, luego <strong># B001</strong>...
            </span>
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
                    <span className="text-base sm:text-lg font-mono font-black text-cyan-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
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
                  <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center flex-wrap">
                    <span className="text-base font-black text-white mr-2">
                      {formatCOP(t.total_price)}
                    </span>

                    {/* Direct WhatsApp link with prefilled ticket */}
                    <button
                      type="button"
                      onClick={() => {
                        const link = generateWhatsAppLink(t);
                        window.open(link, '_blank');
                      }}
                      className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors cursor-pointer"
                      title="Contactar al cliente por WhatsApp"
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
                        <PlayCircle className="w-3.5 h-3.5 mr-1" />
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
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        <span>Completar</span>
                      </Button>
                    )}

                    {t.status === 'completed' && (
                      <button
                        onClick={() => handleStatusChange(t.id, 'waiting')}
                        className="p-2 text-slate-400 hover:text-amber-400 text-xs transition-colors cursor-pointer"
                        title="Reabrir a Espera"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
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
