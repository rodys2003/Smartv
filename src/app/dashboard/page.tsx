'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
import { AuthModal } from '@/features/auth/components/AuthModal';
import { Ticket, ServicePlan } from '@/types';
import { getR2Url } from '@/lib/r2';
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

  // If still checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#060913] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
          <p className="text-sm">Verificando sesión segura...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, prompt login
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col justify-between">
        <header className="p-4 sm:p-6 border-b border-slate-800/80">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-cyan-500/40">
                <Image src={getR2Url('/images/logo.jpg')} alt="Logo" fill className="object-cover" />
              </div>
              <span className="font-black text-white text-base">Smart TV Like a Pro</span>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-xs">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                <span>Volver al Inicio</span>
              </Button>
            </Link>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <Badge variant="cyan" className="mb-2">
              Módulo de Clientes Verificados
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ingresa para Acceder a tu Panel de Turno
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              El seguimiento en vivo de turnos, la asignación de tickets y la guía técnica de preparación son exclusivos para usuarios registrados con Google.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => signInWithGoogle()}
              className="w-full py-4 bg-white text-slate-950 hover:bg-slate-100 font-black text-sm shadow-[0_0_25px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 cursor-pointer"
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

        <footer className="p-6 text-center text-xs text-slate-600 border-t border-slate-900">
          Smart TV Like a Pro · Servicio Remoto para Android TV y Google TV
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-slate-700 transition-colors"
              title="Volver a la landing pública"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                <Image src={getR2Url('/images/logo.jpg')} alt="Logo" fill className="object-cover" priority />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-white">Smart TV</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-slate-950">
                    PANEL DE USUARIO
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Gestión de Turnos & Tutoriales
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
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

            <UserMenu onOpenAuth={() => setIsAuthModalOpen(true)} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pb-24">
        {/* Banner Welcome & Fast Navigation Tabs */}
        <div className="border-b border-slate-800/80 bg-slate-950/40 py-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  Hola, {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </h1>
                <Badge variant="cyan">Sesión Activa</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Bienvenido a tu panel personal. Aquí puedes ver tu turno en tiempo real y completar los tutoriales obligatorios antes de que te toque.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <a
                href="#cola"
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-cyan-400 hover:border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <TicketIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>1. Estado de Turno</span>
              </a>
              <a
                href="#guia"
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-cyan-400 hover:border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Video className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>2. Tutoriales TV</span>
              </a>
              <a
                href="#pago"
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-emerald-400 hover:border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span>3. Pago Bre-B</span>
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
