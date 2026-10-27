'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useQueue } from '@/features/tickets/hooks/useQueue';
import { getUserActiveTicket } from '@/features/tickets/services/ticketService';
import { QueueTracker } from '@/features/tickets/components/QueueTracker';
import { StepByStepGuide } from '@/features/guide/components/StepByStepGuide';
import { PaymentSection } from '@/features/payment/components/PaymentSection';
import { TicketModal } from '@/features/tickets/components/TicketModal';
import { EditPlanModal } from '@/features/tickets/components/EditPlanModal';
import { UserMenu } from '@/features/auth/components/UserMenu';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { Ticket, ServicePlan } from '@/types';
import { parseTicketPaymentInfo } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Tv,
  ArrowLeft,
  Sparkles,
  Ticket as TicketIcon,
  ShieldCheck,
  Video,
  CreditCard,
  AlertTriangle,
  Lock,
  RefreshCw,
  LogOut,
  MessageCircle,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, signInWithGoogle } = useAuth();
  const { canIssueTicket, maxTickets, totalCount, refreshQueue, waitingTickets, whatsappThreshold } = useQueue();

  const [userTicket, setUserTicket] = useState<Ticket | null>(null);
  const [ticketLoading, setTicketLoading] = useState(true);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [preselectedPlan, setPreselectedPlan] = useState<ServicePlan | null>(null);
  const [preselectedMagicApps, setPreselectedMagicApps] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && isAuthenticated) {
      if (sessionStorage.getItem('pending_whatsapp_consult') === 'true') {
        sessionStorage.removeItem('pending_whatsapp_consult');
        // Desplazamiento suave directo a la sección de asesoría en el panel
        setTimeout(() => {
          const el = document.getElementById('asesoria');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      }
    }
  }, [isAuthenticated]);

  // Load user active ticket
  const loadUserTicket = useCallback(async () => {
    if (!user) {
      setUserTicket(null);
      setTicketLoading(false);
      return;
    }
    setTicketLoading(true);
    try {
      const ticket = await getUserActiveTicket(user.id, user.email);
      setUserTicket(ticket);
    } catch (err) {
      console.error('Failed to load user active ticket:', err);
    } finally {
      setTicketLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserTicket();
    } else if (!authLoading) {
      setTicketLoading(false);
    }
  }, [user, authLoading, loadUserTicket]);

  const handleTicketCreated = (ticket: Ticket) => {
    setUserTicket(ticket);
    setIsTicketModalOpen(false);
    refreshQueue();
  };

  const handleOpenWhatsAppConsult = () => {
    const phone = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/\D/g, '');
    const clientName = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
    const clientEmail = user?.email || '';
    const userIdentifier = clientName ? `${clientName} (${clientEmail})` : clientEmail;
    const message = `¡Hola Smart TV Like a Pro! Soy cliente registrado (${userIdentifier}). Me gustaría recibir asesoría técnica / consultar sobre mi Smart TV.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  // If still checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060913] dark:text-slate-400 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-500 dark:text-cyan-400" />
          <p className="text-sm">Verificando sesión segura...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, prompt login
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060913] dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
        <header className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <span className="font-black text-slate-900 dark:text-white text-base">Smart TV Like a Pro</span>
            </Link>
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

        <main className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400 mx-auto flex items-center justify-center shadow-sm dark:shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <Badge variant="cyan" className="mb-2">
              Módulo de Clientes Verificados
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Ingresa para Acceder a tu Panel de Turno
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              El seguimiento en vivo de turnos, la asignación de tickets y la guía técnica de preparación son exclusivos para usuarios registrados con Google.
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
          Smart TV Like a Pro · Servicio Remoto para Android TV y Google TV
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060913] dark:text-slate-100 selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-200">
      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-slate-950/85 border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              title="Volver a la landing pública"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <Link href="/" className="flex items-center">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-slate-900 dark:text-white">Smart TV</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-slate-950">
                    PANEL DE USUARIO
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  Gestión de Turnos & Tutoriales
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick action button */}
            {!userTicket && canIssueTicket && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsTicketModalOpen(true)}
                className="text-xs font-bold hidden sm:inline-flex"
              >
                <TicketIcon className="w-3.5 h-3.5 mr-1.5" />
                <span>Tomar Turno</span>
              </Button>
            )}

            <ThemeToggle />
            <UserMenu onOpenAuth={() => setIsAuthModalOpen(true)} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pb-24">
        {/* Banner Welcome & Fast Navigation Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950/40 py-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Hola, {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </h1>
                <Badge variant="cyan">Sesión Activa</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Bienvenido a tu panel personal. Aquí puedes ver tu turno en tiempo real y completar los tutoriales obligatorios antes de que te toque.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <a
                href="#cola"
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 shadow-sm transition-colors flex items-center gap-1.5"
              >
                <TicketIcon className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>1. Estado de Turno</span>
              </a>
              <a
                href="#guia"
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Video className="w-3.5 h-3.5 text-fuchsia-600 dark:text-fuchsia-400" />
                <span>2. Tutoriales TV</span>
              </a>
              <a
                href="#pago"
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-sm transition-colors flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  3. Pago {userTicket && parseTicketPaymentInfo(userTicket).isCrypto ? 'Binance' : 'Bre-B'}
                </span>
              </a>
              <a
                href="#asesoria"
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-sm transition-colors flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>4. Asesoría Directa</span>
              </a>
            </div>
          </div>
        </div>

        {/* SECTION 1: TURNOS & COLA EN VIVO */}
        <QueueTracker
          isAuthenticated={true}
          userTicket={userTicket}
          onOpenAuthModal={() => {}}
          onOpenTicketModal={() => setIsTicketModalOpen(true)}
          onEditPlan={() => setIsEditPlanModalOpen(true)}
        />

        {/* SECTION 2: GUÍA TÉCNICA Y TUTORIALES (Pasos obligatorios + Videos de pantalla completa + WhatsApp) */}
        <StepByStepGuide
          currentTicket={userTicket}
          isAuthenticated={true}
          queuePosition={
            userTicket && waitingTickets.findIndex((t) => t.id === userTicket.id) !== -1
              ? waitingTickets.findIndex((t) => t.id === userTicket.id) + 1
              : undefined
          }
          whatsappThreshold={whatsappThreshold}
          onOpenAuthModal={() => {}}
          onOpenTicketModal={() => setIsTicketModalOpen(true)}
        />

        {/* SECTION 3: MEDIO DE PAGO BRE-B (Pagas tras conectar tu TV) */}
        <PaymentSection userTicket={userTicket} />

        {/* SECTION 4: ASESORÍA PERSONALIZADA & CONSULTA TÉCNICA */}
        <section id="asesoria" className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
          <div className="bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-slate-100 dark:from-emerald-950/30 dark:via-cyan-950/20 dark:to-slate-900 border border-emerald-500/30 dark:border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-200/60 dark:border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      ¿Necesitas Asesoría o Tienes Dudas?
                    </h2>
                    <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                      Atención Prioritaria
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Consulta directa con nuestro equipo técnico sobre compatibilidad, launchers o apps recomendadas.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-500/30 text-xs shrink-0 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Usuario Verificado:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px] block">
                    {user?.email}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">1. Sin Spam ni Esperas</span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Al escribir con tu cuenta verificada, el asesor técnico te atiende de inmediato con prioridad.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">2. Soporte Multidispositivo</span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Asistencia para Android TV, Google TV, Fire TV Stick, Xiaomi Box y proyectores compatibles.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">3. Sin Compromiso</span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Pregunta antes o durante tu turno. Te ayudamos a elegir el mejor plan para tu televisor.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
                Horario de soporte activo: lunes a domingo · Respuesta promedio en menos de 5 minutos.
              </p>

              <Button
                type="button"
                variant="whatsapp"
                size="lg"
                onClick={handleOpenWhatsAppConsult}
                className="w-full sm:w-auto font-bold text-xs py-3.5 px-6 shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Abrir Asesoría por WhatsApp</span>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Ticket Modal */}
      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        initialPlan={preselectedPlan}
        initialMagicApps={preselectedMagicApps}
        onTicketCreated={handleTicketCreated}
      />

      {/* Edit Ticket Plan Modal */}
      {userTicket && (
        <EditPlanModal
          isOpen={isEditPlanModalOpen}
          onClose={() => setIsEditPlanModalOpen(false)}
          ticket={userTicket}
          onPlanUpdated={(updated) => {
            setUserTicket(updated);
            refreshQueue();
          }}
        />
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
