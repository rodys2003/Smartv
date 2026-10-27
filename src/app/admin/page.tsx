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
import { formatCOP, formatTicketNumber, parseTicketPaymentInfo } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { EditPlanModal } from '@/features/tickets/components/EditPlanModal';
import { generateWhatsAppLink } from '@/lib/whatsapp/generateLink';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { isUserAdmin } from '@/lib/admin';
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
  Pencil,
  Lock,
  LogOut,
} from 'lucide-react';

export default function AdminPage() {
  const { user, isAuthenticated, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const isAdmin = isUserAdmin(user?.email);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [settings, setSettings] = useState<QueueSettings>({
    max_tickets: 100,
    tickets_enabled: true,
    whatsapp_queue_threshold: 5,
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
    if (isAdmin) {
      fetchData();
      const interval = setInterval(fetchData, 15000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, fetchData]);

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

  const handleUpdateWhatsAppThreshold = async (threshold: number) => {
    if (threshold < 1) return;
    setUpdatingSettings(true);
    const updated = await updateQueueSettings({
      whatsapp_queue_threshold: threshold,
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060913] dark:text-slate-400 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-500 dark:text-cyan-400" />
          <p className="text-sm">Verificando permisos de administrador...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060913] dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
        <header className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <span className="font-black text-slate-900 dark:text-white text-base">Smart TV Like a Pro</span>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-xs">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  <span>Volver al Inicio</span>
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400 mx-auto flex items-center justify-center shadow-sm dark:shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <Badge variant="cyan" className="mb-2">
              Panel Administrativo Privado
            </Badge>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Inicio de Sesión Requerido
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Esta sección es exclusiva para la gestión técnica de turnos. Debes autenticarte con la cuenta de Google autorizada.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => signInWithGoogle()}
              className="w-full py-4 bg-white text-slate-950 hover:bg-slate-100 font-black text-sm shadow-md flex items-center justify-center gap-3 cursor-pointer border border-slate-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continuar con Google</span>
            </Button>
          </div>
        </main>

        <footer className="p-6 text-center text-xs text-slate-500 dark:text-slate-600 border-t border-slate-200 dark:border-slate-900">
          Smart TV Like a Pro · Acceso Administrativo
        </footer>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060913] dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
        <header className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <span className="font-black text-slate-900 dark:text-white text-base">Smart TV Like a Pro</span>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-xs">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  <span>Volver al Inicio</span>
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center shadow-sm dark:shadow-[0_0_30px_rgba(244,63,94,0.3)]">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <Badge variant="amber" className="mb-2">
              Acceso Restringido
            </Badge>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Sin Permisos de Administrador
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              La cuenta <strong className="text-cyan-700 dark:text-cyan-300">{user.email}</strong> no tiene permisos de administrador. El administrador autorizado es <strong className="text-slate-900 dark:text-white">developer01012003@gmail.com</strong>.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => signOut()}
              className="w-full text-xs font-bold"
            >
              Cerrar Sesión y Cambiar de Cuenta
            </Button>
            <Link href="/dashboard">
              <Button variant="ghost" size="md" className="w-full text-xs">
                Ir a mi Panel de Cliente
              </Button>
            </Link>
          </div>
        </main>

        <footer className="p-6 text-center text-xs text-slate-500 dark:text-slate-600 border-t border-slate-200 dark:border-slate-900">
          Smart TV Like a Pro · Seguridad y Control de Acceso
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060913] dark:text-slate-100 p-4 sm:p-6 lg:p-10 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Panel de Administración</h1>
                <Badge variant="cyan">Control de Turnos</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Smart TV Like a Pro · Gestión de atención 1 a 1 en tiempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-2 cursor-pointer shadow-sm"
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
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-md dark:shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Control de Capacidad & Emisión de Turnos</span>
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  settings.tickets_enabled && !isLimitReached
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30'
                    : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30'
                }`}
              >
                {settings.tickets_enabled && !isLimitReached
                  ? 'Turnos Habilitados'
                  : isLimitReached
                  ? 'Tope de 100 Alcanzado'
                  : 'Turnos Pausados'}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
              Capacidad configurada: <strong>{nonCancelledCount}</strong> tickets registrados de{' '}
              <strong>{settings.max_tickets}</strong> permitidos. Cuando se alcanza el límite de{' '}
              {settings.max_tickets} clientes, el sistema bloquea automáticamente la creación de turnos hasta que el administrador vuelva a habilitarlos.
            </p>

            {/* Progress Bar of Capacity */}
            <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2.5 border border-slate-200 dark:border-slate-800 overflow-hidden mt-2">
              <div
                className={`h-full transition-all duration-500 ${
                  isLimitReached
                    ? 'bg-rose-500'
                    : nonCancelledCount >= 80
                    ? 'bg-amber-400'
                    : 'bg-cyan-500 dark:bg-cyan-400'
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
                  <ToggleRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
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
              className="text-xs font-bold flex items-center gap-2 shadow-sm dark:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Habilitar Más Cupos (+50)</span>
            </Button>
          </div>
        </div>

        {/* WHATSAPP QUEUE THRESHOLD SETTING */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Filtro de Activación de WhatsApp para Clientes
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                Top {settings.whatsapp_queue_threshold ?? 5} Activo
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
              El botón de WhatsApp para clientes solo se habilita cuando su posición en la fila esté dentro de este número. Quienes estén más atrás verán el botón bloqueado para evitar saturación de chats.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Habilitar en Top:</span>
            {[1, 3, 5, 10, 15].map((num) => (
              <button
                key={num}
                type="button"
                disabled={updatingSettings}
                onClick={() => handleUpdateWhatsAppThreshold(num)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  (settings.whatsapp_queue_threshold ?? 5) === num
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-white'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-100 dark:bg-slate-800/80 border-cyan-500 dark:border-cyan-400 shadow-md'
                : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold block">
              Total Registrados
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
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
                ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 dark:border-cyan-400 shadow-md'
                : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <span className="text-[11px] uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-bold block flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-ping" />
              En Atención
            </span>
            <span className="text-2xl font-black text-cyan-700 dark:text-cyan-300 mt-1 block">
              {inProgressCount}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Atendiendo ahora</span>
          </button>

          <button
            onClick={() => setFilter('waiting')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              filter === 'waiting'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 dark:border-amber-400 shadow-md'
                : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <span className="text-[11px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold block">
              En Espera
            </span>
            <span className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1 block">
              {waitingCount}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">En fila</span>
          </button>

          <button
            onClick={() => setFilter('completed')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              filter === 'completed'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-400 shadow-md'
                : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <span className="text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold block">
              Completados
            </span>
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1 block">
              {completedCount}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Finalizados con éxito</span>
          </button>

          <button
            onClick={() => setFilter('cancelled')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer col-span-2 sm:col-span-1 ${
              filter === 'cancelled'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 dark:border-rose-400 shadow-md'
                : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <span className="text-[11px] uppercase tracking-wider text-rose-600 dark:text-rose-400 font-bold block">
              Cancelados
            </span>
            <span className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1 block">
              {cancelledCount}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Descartados</span>
          </button>
        </div>

        {/* Tickets Table / List */}
        <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tv className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Cola de Clientes Oficial ({filteredTickets.length})</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Nomenclatura: <strong># A073</strong> a <strong># A999</strong>, luego <strong># B001</strong>...
            </span>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-sm">
              No hay tickets en este filtro.
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {filteredTickets.map((t) => (
                <div
                  key={t.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Left: ticket and customer */}
                  <div className="flex items-start gap-4">
                    <span className="text-base sm:text-lg font-mono font-black text-cyan-700 dark:text-cyan-400 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
                      {formatTicketNumber(t.ticket_number)}
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {t.user_name || 'Cliente'}
                        </span>
                        {t.user_email && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">({t.user_email})</span>
                        )}
                        <Badge status={t.status} />
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300">
                        <strong className="text-slate-500 dark:text-slate-400">TV: </strong>
                        {t.tv_brand} {t.tv_model ? `(${t.tv_model})` : ''} ·{' '}
                        <strong className="text-cyan-700 dark:text-cyan-300">{t.service_name}</strong>
                        {t.has_magic_apps && (
                          <span className="text-fuchsia-600 dark:text-fuchsia-400 font-semibold ml-1">
                            + Apps Mágicas
                          </span>
                        )}
                      </p>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                        Registrado: {new Date(t.created_at).toLocaleString('es-CO')}
                      </span>
                    </div>
                  </div>

                  {/* Right: Price & Quick Action buttons */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center flex-wrap">
                    <div className="text-right mr-2">
                      <span
                        className={`text-base font-black block ${
                          parseTicketPaymentInfo(t).isCrypto
                            ? 'text-amber-500 dark:text-amber-400 font-mono'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {parseTicketPaymentInfo(t).formattedPrice}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">
                        {parseTicketPaymentInfo(t).isCrypto ? 'Binance TRC20' : 'Bre-B (COP)'}
                      </span>
                    </div>

                    {/* Direct WhatsApp link with prefilled ticket */}
                    <button
                      type="button"
                      onClick={() => {
                        const link = generateWhatsAppLink(t);
                        window.open(link, '_blank');
                      }}
                      className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/30 transition-colors cursor-pointer"
                      title="Contactar al cliente por WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>

                    {/* Edit plan button */}
                    <button
                      type="button"
                      onClick={() => setEditingTicket(t)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-200 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      title="Modificar plan y método de pago"
                    >
                      <Pencil className="w-4 h-4" />
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
                        className="p-2 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 text-xs transition-colors cursor-pointer"
                        title="Reabrir a Espera"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {t.status !== 'cancelled' && t.status !== 'completed' && (
                      <button
                        onClick={() => handleStatusChange(t.id, 'cancelled')}
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs transition-colors cursor-pointer"
                        title="Cancelar ticket (ej. sin respuesta en 5 min)"
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

      {/* Edit Plan Modal for Admin */}
      {editingTicket && (
        <EditPlanModal
          isOpen={!!editingTicket}
          onClose={() => setEditingTicket(null)}
          ticket={editingTicket}
          onPlanUpdated={(updated) => {
            setTickets((prev) =>
              prev.map((t) => (t.id === updated.id ? updated : t))
            );
            setEditingTicket(null);
          }}
        />
      )}
    </div>
  );
}
