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
  getDiscountCoupons,
  createDiscountCoupon,
  toggleCouponStatus,
  deleteDiscountCoupon,
  DiscountCoupon,
} from '@/features/discounts/services/discountService';
import {
  getAllAffiliates,
  createOrActivateAffiliateAdmin,
  updateAffiliateStatus,
  markCommissionPaymentConfirmed,
  markCommissionServiceCompleted,
  markCommissionCancelled,
  getAllPayouts,
  completePayoutAdmin,
  rejectPayoutAdmin,
  getAllCommissions,
} from '@/features/affiliates/services/affiliateService';
import { Affiliate, AffiliatePayout, AffiliateCommission } from '@/types/affiliate';
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
  Tag,
  Plus,
  Trash2,
  Copy,
  Check,
  UserCheck,
  Share2,
  Coins,
  Wallet,
  ArrowUpRight,
  FileText,
  X,
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

  // Discount Coupons state
  const [coupons, setCoupons] = useState<DiscountCoupon[]>([]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponPercentage, setNewCouponPercentage] = useState('');
  const [newCouponMaxUses, setNewCouponMaxUses] = useState('');
  const [creatingCoupon, setCreatingCoupon] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Affiliates & Payouts state
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([]);
  const [allCommissions, setAllCommissions] = useState<AffiliateCommission[]>([]);
  const [affiliateSubTab, setAffiliateSubTab] = useState<'affiliates' | 'settlements' | 'commissions'>('affiliates');
  const [newAffEmail, setNewAffEmail] = useState('');
  const [newAffName, setNewAffName] = useState('');
  const [newAffCode, setNewAffCode] = useState('');
  const [newAffBinanceUid, setNewAffBinanceUid] = useState('');
  const [creatingAffiliate, setCreatingAffiliate] = useState(false);
  const [affiliateFeedback, setAffiliateFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal de Liquidación Binance USDT
  const [selectedPayout, setSelectedPayout] = useState<AffiliatePayout | null>(null);
  const [binanceTxRef, setBinanceTxRef] = useState('');
  const [payoutCopRate, setPayoutCopRate] = useState('');
  const [processingPayout, setProcessingPayout] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ticketsData, settingsData, couponsData, affiliatesData, payoutsData, commissionsData] = await Promise.all([
        getTickets(200),
        getQueueSettings(),
        getDiscountCoupons(),
        getAllAffiliates(),
        getAllPayouts(),
        getAllCommissions(),
      ]);
      setTickets(ticketsData);
      setSettings(settingsData);
      setCoupons(couponsData);
      setAffiliates(affiliatesData);
      setPayouts(payoutsData);
      setAllCommissions(commissionsData);
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
    const targetTicket = tickets.find((t) => t.id === id);
    const ok = await updateTicketStatus(id, newStatus);
    if (ok) {
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
      if (targetTicket?.ticket_number) {
        if (newStatus === 'in_progress') {
          markCommissionPaymentConfirmed(targetTicket.ticket_number).catch((err) =>
            console.warn('Failed to confirm affiliate commission:', err)
          );
        } else if (newStatus === 'completed') {
          markCommissionServiceCompleted(targetTicket.ticket_number).catch((err) =>
            console.warn('Failed to complete affiliate commission:', err)
          );
        } else if (newStatus === 'cancelled') {
          markCommissionCancelled(targetTicket.ticket_number).catch((err) =>
            console.warn('Failed to cancel affiliate commission:', err)
          );
        }
      }
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

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim() || !newCouponPercentage || !newCouponMaxUses) return;

    setCreatingCoupon(true);
    setCouponFeedback(null);

    const res = await createDiscountCoupon({
      code: newCouponCode,
      percentage: Number(newCouponPercentage),
      max_uses: Number(newCouponMaxUses),
    });

    if (res.success && res.coupon) {
      setCoupons((prev) => [res.coupon!, ...prev]);
      setNewCouponCode('');
      setNewCouponPercentage('');
      setNewCouponMaxUses('');
      setCouponFeedback({
        type: 'success',
        text: `¡Cupón ${res.coupon.code} (-${res.coupon.percentage}%) creado con éxito!`,
      });
      setTimeout(() => setCouponFeedback(null), 4000);
    } else {
      setCouponFeedback({
        type: 'error',
        text: res.error || 'No se pudo crear el cupón.',
      });
    }

    setCreatingCoupon(false);
  };

  const handleToggleCoupon = async (id: string, currentStatus: boolean) => {
    const ok = await toggleCouponStatus(id, !currentStatus);
    if (ok) {
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: !currentStatus } : c))
      );
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el cupón "${code}"?`)) return;
    const ok = await deleteDiscountCoupon(id);
    if (ok) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      setCouponFeedback({
        type: 'success',
        text: `Cupón ${code} eliminado.`,
      });
      setTimeout(() => setCouponFeedback(null), 3000);
    }
  };

  const handleCreateAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAffiliateFeedback(null);
    if (!newAffEmail.trim() || !newAffCode.trim()) {
      setAffiliateFeedback({ type: 'error', text: 'Email y Código de Referido son obligatorios.' });
      return;
    }
    setCreatingAffiliate(true);
    try {
      const created = await createOrActivateAffiliateAdmin({
        email: newAffEmail,
        name: newAffName || undefined,
        referralCode: newAffCode,
        binanceUid: newAffBinanceUid || undefined,
        status: 'active',
      });
      setAffiliates((prev) => [created, ...prev.filter((a) => a.id !== created.id)]);
      setNewAffEmail('');
      setNewAffName('');
      setNewAffCode('');
      setNewAffBinanceUid('');
      setAffiliateFeedback({ type: 'success', text: `¡Afiliado ${created.referral_code} activado con éxito!` });
      setTimeout(() => setAffiliateFeedback(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear o activar afiliado';
      setAffiliateFeedback({ type: 'error', text: msg });
    } finally {
      setCreatingAffiliate(false);
    }
  };

  const handleToggleAffiliateStatus = async (affiliateId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const ok = await updateAffiliateStatus(affiliateId, nextStatus as any);
    if (ok) {
      setAffiliates((prev) =>
        prev.map((a) => (a.id === affiliateId ? { ...a, status: nextStatus as any } : a))
      );
    }
  };

  const handleCopyReferralLink = (code: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://smartvpro.ordely.online';
    const url = `${origin}/r/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCompletePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayout || !binanceTxRef.trim()) return;
    setProcessingPayout(true);
    try {
      const rateNum = payoutCopRate.trim() ? parseFloat(payoutCopRate.trim()) : undefined;
      const ok = await completePayoutAdmin({
        payoutId: selectedPayout.id,
        binanceTxReference: binanceTxRef.trim(),
        copToUsdtRate: rateNum,
      });
      if (ok) {
        setPayouts((prev) =>
          prev.map((p) =>
            p.id === selectedPayout.id
              ? {
                  ...p,
                  status: 'completed',
                  binance_tx_reference: binanceTxRef.trim(),
                  paid_at: new Date().toISOString(),
                }
              : p
          )
        );
        setSelectedPayout(null);
        setBinanceTxRef('');
        setPayoutCopRate('');
        setAffiliateFeedback({ type: 'success', text: '¡Liquidación completada y registrada en Binance!' });
        setTimeout(() => setAffiliateFeedback(null), 3000);
      } else {
        setAffiliateFeedback({ type: 'error', text: 'Error al registrar la liquidación.' });
      }
    } finally {
      setProcessingPayout(false);
    }
  };

  const handleRejectPayout = async (payoutId: string) => {
    if (!confirm('¿Deseas rechazar esta solicitud? Las comisiones volverán a estar disponibles.')) return;
    const ok = await rejectPayoutAdmin(payoutId);
    if (ok) {
      setPayouts((prev) => prev.map((p) => (p.id === payoutId ? { ...p, status: 'rejected' } : p)));
      setAffiliateFeedback({ type: 'success', text: 'Solicitud rechazada y comisiones liberadas.' });
      setTimeout(() => setAffiliateFeedback(null), 3000);
    }
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

        {/* GESTIÓN DE CUPONES DE DESCUENTO */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-md dark:shadow-[0_0_30px_rgba(6,182,212,0.12)] space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                  <Tag className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  Gestión de Cupones de Descuento
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30">
                  {coupons.filter((c) => c.is_active && c.used_count < c.max_uses).length} Activos
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
                Crea códigos promocionales con porcentaje de descuento manual y límite de usos. Los clientes podrán aplicarlos al momento de generar su turno.
              </p>
            </div>

            {couponFeedback && (
              <div
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                  couponFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30'
                    : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30'
                }`}
              >
                <span>{couponFeedback.text}</span>
              </div>
            )}
          </div>

          {/* Form: Crear Nuevo Cupón */}
          <form
            onSubmit={handleCreateCoupon}
            className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800"
          >
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Código Promocional:
              </label>
              <input
                type="text"
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                placeholder="Ej. VIP20"
                required
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                % Descuento (1 - 100):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newCouponPercentage}
                  onChange={(e) => setNewCouponPercentage(e.target.value)}
                  placeholder="Ej. 20"
                  required
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 pr-7"
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">%</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Límite de Usos:
              </label>
              <input
                type="number"
                min="1"
                value={newCouponMaxUses}
                onChange={(e) => setNewCouponMaxUses(e.target.value)}
                placeholder="Ej. 10"
                required
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={creatingCoupon || !newCouponCode.trim() || !newCouponPercentage || !newCouponMaxUses}
                className="w-full text-xs font-bold py-2.5 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{creatingCoupon ? 'Creando...' : 'Crear Cupón'}</span>
              </Button>
            </div>
          </form>

          {/* List of Coupons */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
              <span>Cupones Registrados ({coupons.length})</span>
              <span>
                Total canjes: {coupons.reduce((acc, c) => acc + (c.used_count || 0), 0)}
              </span>
            </div>

            {coupons.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
                <Tag className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">No hay cupones creados todavía.</p>
                <p className="text-[11px] mt-0.5">Usa el formulario superior para crear el primer código de descuento con límite de usos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {coupons.map((coupon) => {
                  const isExhausted = coupon.used_count >= coupon.max_uses;
                  const usagePercent = Math.min(100, Math.round((coupon.used_count / coupon.max_uses) * 100));

                  return (
                    <div
                      key={coupon.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-sm ${
                        !coupon.is_active
                          ? 'bg-slate-100/60 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-70'
                          : isExhausted
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-500/30'
                          : 'bg-white dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 hover:border-cyan-500/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-slate-900 dark:text-white px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                              {coupon.code}
                            </span>
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                              -{coupon.percentage}%
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                            Creado: {new Date(coupon.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            !coupon.is_active
                              ? 'bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                              : isExhausted
                              ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30'
                          }`}
                        >
                          {!coupon.is_active ? 'Pausado' : isExhausted ? 'Agotado' : 'Activo'}
                        </span>
                      </div>

                      {/* Progress bar of uses */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Usos canjeados:</span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono">
                            {coupon.used_count} / {coupon.max_uses} ({usagePercent}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-200 dark:border-slate-800">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isExhausted
                                ? 'bg-amber-500'
                                : usagePercent >= 80
                                ? 'bg-cyan-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleToggleCoupon(coupon.id, coupon.is_active)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            coupon.is_active
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 border-slate-200 dark:border-slate-700'
                              : 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
                          }`}
                        >
                          {coupon.is_active ? 'Pausar' : 'Activar'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Eliminar cupón"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* GESTIÓN DEL PROGRAMA DE AFILIADOS */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-md dark:shadow-[0_0_30px_rgba(6,182,212,0.12)] space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  Programa de Afiliados (30% Comisión · Liquidación Binance USDT)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30">
                  {affiliates.filter((a) => a.status === 'active').length} Activos
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
                Activa o suspende afiliados, valida su Binance UID para transferir comisiones y comparte su enlace oficial de referido.
              </p>
            </div>

            {affiliateFeedback && (
              <div
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                  affiliateFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30'
                    : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30'
                }`}
              >
                {affiliateFeedback.type === 'success' ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5" />
                )}
                <span>{affiliateFeedback.text}</span>
              </div>
            )}
          </div>

          {/* Subtabs del Módulo de Afiliados */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <button
              type="button"
              onClick={() => setAffiliateSubTab('affiliates')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                affiliateSubTab === 'affiliates'
                  ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Cuentas y Enlaces ({affiliates.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setAffiliateSubTab('settlements')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                affiliateSubTab === 'settlements'
                  ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Liquidaciones Binance USDT</span>
              {payouts.filter((p) => p.status === 'pending').length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950">
                  {payouts.filter((p) => p.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setAffiliateSubTab('commissions')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                affiliateSubTab === 'commissions'
                  ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ledger de Comisiones ({allCommissions.length})</span>
            </button>
          </div>

          {/* Subtab 1: Cuentas y Enlaces de Afiliados */}
          {affiliateSubTab === 'affiliates' && (
            <div className="space-y-6">
              {/* Formulario de Activación de Afiliado */}
              <form
                onSubmit={handleCreateAffiliate}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Plus className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Activar Nuevo Afiliado Manualmente</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      value={newAffEmail}
                      onChange={(e) => setNewAffEmail(e.target.value)}
                      placeholder="ej. ana@gmail.com"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={newAffName}
                      onChange={(e) => setNewAffName(e.target.value)}
                      placeholder="ej. Ana Gómez"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Código de referido *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAffCode}
                      onChange={(e) => setNewAffCode(e.target.value.toUpperCase())}
                      placeholder="ej. ANA8X2"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Binance UID (Receptor)
                    </label>
                    <input
                      type="text"
                      value={newAffBinanceUid}
                      onChange={(e) => setNewAffBinanceUid(e.target.value)}
                      placeholder="ej. 85419203"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Comisión: <strong>30%</strong> sobre el valor neto cobrado del plan · Tarifa de retiro fija: <strong>2 USDT</strong>
                  </span>

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={creatingAffiliate || !newAffEmail.trim() || !newAffCode.trim()}
                    className="text-xs font-bold px-4 py-2 shrink-0 cursor-pointer"
                  >
                    {creatingAffiliate ? 'Activando...' : 'Activar Afiliado'}
                  </Button>
                </div>
              </form>

              {/* Listado de Afiliados */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Afiliados Registrados ({affiliates.length})
                </h4>

                {affiliates.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    No hay afiliados registrados todavía. Usa el formulario superior para activar el primero.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {affiliates.map((aff) => {
                      const isActive = aff.status === 'active';
                      const isCopied = copiedCode === aff.referral_code;

                      return (
                        <div
                          key={aff.id}
                          className={`p-4 rounded-2xl border transition-all space-y-3 ${
                            isActive
                              ? 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800/60 opacity-75'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-black text-sm text-cyan-700 dark:text-cyan-300">
                                  {aff.referral_code}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                    isActive
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30'
                                      : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30'
                                  }`}
                                >
                                  {isActive ? 'Activo' : 'Suspendido'}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">
                                {aff.user_name || 'Afiliado'}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                                {aff.user_email}
                              </p>
                            </div>

                            <span className="text-xs font-mono font-extrabold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 px-2 py-1 rounded-lg">
                              {Math.round((aff.commission_rate ?? 0.3) * 100)}%
                            </span>
                          </div>

                          {/* Binance UID */}
                          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] flex items-center justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Binance UID:</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                              {aff.binance_uid || 'No registrado'}
                            </span>
                          </div>

                          {/* Enlace de referido y botones */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                            <button
                              type="button"
                              onClick={() => handleCopyReferralLink(aff.referral_code)}
                              className="flex items-center gap-1 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 cursor-pointer"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  <span className="text-emerald-600 dark:text-emerald-400">¡Enlace copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copiar /r/{aff.referral_code}</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleAffiliateStatus(aff.id, aff.status)}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border-slate-200 dark:border-slate-700'
                                  : 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
                              }`}
                            >
                              {isActive ? 'Suspender' : 'Activar'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subtab 2: Liquidaciones Binance USDT */}
          {affiliateSubTab === 'settlements' && (
            <div className="space-y-6">
              {/* Regla Operativa y Financiera */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
                <Coins className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Protocolo de Pagos en USDT (Binance Pay UID):</p>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed">
                    1. Revisa la solicitud y copia el <strong>Binance UID</strong> del afiliado.
                    <br />
                    2. Envía exactamente el <strong>Neto a Enviar</strong> desde tu Binance (la tarifa fija de <strong>2 USDT</strong> ya está descontada).
                    <br />
                    3. Ingresa el <strong>ID o Hash de Transacción de Binance</strong> y confirma para que las comisiones queden marcadas como pagadas sin riesgo de duplicidad.
                  </p>
                </div>
              </div>

              {/* Solicitudes Pendientes */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>Solicitudes Pendientes de Liquidación</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300">
                    {payouts.filter((p) => p.status === 'pending').length}
                  </span>
                </h4>

                {payouts.filter((p) => p.status === 'pending').length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    No hay solicitudes de liquidación pendientes en este momento.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payouts
                      .filter((p) => p.status === 'pending')
                      .map((payout) => {
                        const aff = affiliates.find((a) => a.id === payout.affiliate_id);
                        return (
                          <div
                            key={payout.id}
                            className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-amber-200 dark:border-amber-500/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900 dark:text-white">
                                  {aff?.user_name || 'Afiliado'} ({aff?.referral_code || 'N/A'})
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(payout.created_at).toLocaleString('es-CO')}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xs">
                                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg">
                                  <span className="text-[11px] text-slate-500">Binance UID:</span>
                                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                                    {payout.binance_uid}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyReferralLink(payout.binance_uid)}
                                    className="text-cyan-600 hover:text-cyan-500 cursor-pointer ml-1"
                                    title="Copiar UID"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>

                                {payout.cop_total_original ? (
                                  <span className="text-[11px] text-slate-500">
                                    Original: ${payout.cop_total_original.toLocaleString()} COP
                                  </span>
                                ) : null}
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-[11px] text-slate-400">
                                  Bruto: <span className="font-mono font-semibold">{payout.gross_amount_usdt.toFixed(2)} USDT</span> · Fee: <span className="font-mono text-rose-500">-2.00 USDT</span>
                                </div>
                                <div className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                                  {payout.net_amount_usdt.toFixed(2)} USDT a transferir
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="primary"
                                  onClick={() => {
                                    setSelectedPayout(payout);
                                    setBinanceTxRef('');
                                    setPayoutCopRate(payout.cop_to_usdt_rate ? String(payout.cop_to_usdt_rate) : '');
                                  }}
                                  className="text-xs font-bold px-3 py-2 cursor-pointer flex items-center gap-1"
                                >
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                  <span>Pagar en Binance</span>
                                </Button>

                                <button
                                  type="button"
                                  onClick={() => handleRejectPayout(payout.id)}
                                  className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                                  title="Rechazar solicitud"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Historial de Liquidaciones Completadas */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Historial de Liquidaciones ({payouts.filter((p) => p.status !== 'pending').length})
                </h4>

                {payouts.filter((p) => p.status !== 'pending').length === 0 ? (
                  <div className="p-4 text-center rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                    Aún no hay liquidaciones registradas en el historial.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="py-2.5 px-3">Fecha</th>
                          <th className="py-2.5 px-3">Afiliado</th>
                          <th className="py-2.5 px-3">Binance UID</th>
                          <th className="py-2.5 px-3">Bruto</th>
                          <th className="py-2.5 px-3">Tarifa Fija</th>
                          <th className="py-2.5 px-3">Neto Pagado</th>
                          <th className="py-2.5 px-3">Tasa COP/USDT</th>
                          <th className="py-2.5 px-3">Ref. Binance (TxHash)</th>
                          <th className="py-2.5 px-3">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {payouts
                          .filter((p) => p.status !== 'pending')
                          .map((p) => {
                            const aff = affiliates.find((a) => a.id === p.affiliate_id);
                            return (
                              <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                <td className="py-2 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                  {new Date(p.paid_at || p.created_at).toLocaleDateString('es-CO')}
                                </td>
                                <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                                  {aff?.user_name || aff?.user_email || p.affiliate_id.slice(0, 8)}
                                </td>
                                <td className="py-2 px-3 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                  {p.binance_uid}
                                </td>
                                <td className="py-2 px-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                  {p.gross_amount_usdt.toFixed(2)} USDT
                                </td>
                                <td className="py-2 px-3 font-mono text-rose-500 whitespace-nowrap">
                                  -{p.withdrawal_fee_usdt.toFixed(2)} USDT
                                </td>
                                <td className="py-2 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                  {p.net_amount_usdt.toFixed(2)} USDT
                                </td>
                                <td className="py-2 px-3 font-mono text-slate-500 whitespace-nowrap">
                                  {p.cop_to_usdt_rate ? `$${p.cop_to_usdt_rate.toLocaleString()}` : '-'}
                                </td>
                                <td className="py-2 px-3 font-mono text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
                                  {p.binance_tx_reference || '-'}
                                </td>
                                <td className="py-2 px-3 whitespace-nowrap">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                      p.status === 'completed'
                                        ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                        : 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
                                    }`}
                                  >
                                    {p.status === 'completed' ? 'Pagado' : 'Rechazado'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subtab 3: Ledger de Comisiones Referidas */}
          {affiliateSubTab === 'commissions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Historial de Comisiones Generadas ({allCommissions.length})
                </h4>
                <span className="text-[11px] text-slate-500">
                  Regla contable: 30% sobre el importe neto cobrado del plan
                </span>
              </div>

              {allCommissions.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                  Aún no se han generado comisiones referidas.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="py-2.5 px-3">Ticket</th>
                        <th className="py-2.5 px-3">Fecha</th>
                        <th className="py-2.5 px-3">Afiliado</th>
                        <th className="py-2.5 px-3">Plan</th>
                        <th className="py-2.5 px-3">Venta Neta</th>
                        <th className="py-2.5 px-3">Comisión 30%</th>
                        <th className="py-2.5 px-3">Estado</th>
                        <th className="py-2.5 px-3">ID Liquidación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {allCommissions.map((comm) => {
                        const aff = affiliates.find((a) => a.id === comm.affiliate_id);
                        const isUSDT = comm.currency === 'USDT';
                        return (
                          <tr key={comm.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                            <td className="py-2 px-3 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                              #{comm.ticket_number ? comm.ticket_number : (comm.ticket_id ? comm.ticket_id.slice(-6).toUpperCase() : 'N/A')}
                            </td>
                            <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                              {new Date(comm.created_at).toLocaleDateString('es-CO')}
                            </td>
                            <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                              {aff?.referral_code || comm.referral_code || comm.affiliate_id.slice(0, 8)}
                            </td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-400 capitalize whitespace-nowrap">
                              {comm.service_name}
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                              {isUSDT
                                ? `${Number(comm.net_sale_price).toFixed(2)} USDT`
                                : `$${Number(comm.net_sale_price).toLocaleString()} COP`}
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                              {isUSDT
                                ? `${Number(comm.commission_amount).toFixed(2)} USDT`
                                : `$${Number(comm.commission_amount).toLocaleString()} COP`}
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  comm.status === 'paid'
                                    ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                    : comm.status === 'available'
                                    ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300'
                                    : comm.status === 'validating'
                                    ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                                    : comm.status === 'cancelled'
                                    ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                }`}
                              >
                                {comm.status === 'paid'
                                  ? 'Pagada'
                                  : comm.status === 'available'
                                  ? 'Disponible'
                                  : comm.status === 'validating'
                                  ? 'En Validación'
                                  : comm.status === 'cancelled'
                                  ? 'Cancelada'
                                  : 'Estimada'}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                              {comm.payout_id ? `#${comm.payout_id.slice(0, 8)}` : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal para Registrar Liquidación Binance USDT */}
        {selectedPayout && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-sm">
                  <Coins className="w-5 h-5" />
                  <span>Registrar Liquidación Binance USDT</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPayout(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Resumen del Payout */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Binance UID Destino:</span>
                  <div className="flex items-center gap-1.5 font-mono font-black text-cyan-600 dark:text-cyan-400 text-sm">
                    <span>{selectedPayout.binance_uid}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyReferralLink(selectedPayout.binance_uid)}
                      className="hover:opacity-75 cursor-pointer"
                      title="Copiar UID"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Monto Bruto:</span>
                  <span className="font-mono font-semibold">{selectedPayout.gross_amount_usdt.toFixed(2)} USDT</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Tarifa Fija de Retiro:</span>
                  <span className="font-mono font-semibold text-rose-500">-2.00 USDT</span>
                </div>

                {selectedPayout.cop_total_original ? (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Comisiones COP originales:</span>
                    <span className="font-mono text-slate-400">
                      ${selectedPayout.cop_total_original.toLocaleString()} COP
                    </span>
                  </div>
                ) : null}

                <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-800 dark:text-white">Neto a Transferir en Binance:</span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base">
                    {selectedPayout.net_amount_usdt.toFixed(2)} USDT
                  </span>
                </div>
              </div>

              {/* Formulario de Confirmación */}
              <form onSubmit={handleCompletePayout} className="space-y-4">
                {selectedPayout.cop_total_original ? (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Tasa de conversión COP/USDT aplicada (opcional para auditoría)
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="ej. 4150"
                      value={payoutCopRate}
                      onChange={(e) => setPayoutCopRate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                ) : null}

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Referencia / ID de Transacción Binance *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. 28475819382 o Binance Pay Order ID"
                    value={binanceTxRef}
                    onChange={(e) => setBinanceTxRef(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Ingresa el ID generado por Binance tras enviar la transferencia a {selectedPayout.binance_uid}.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPayout(null)}
                    disabled={processingPayout}
                    className="text-xs"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={processingPayout || !binanceTxRef.trim()}
                    className="text-xs font-bold px-4 py-2 cursor-pointer"
                  >
                    {processingPayout ? 'Registrando...' : 'Confirmar Liquidación'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                        {(() => {
                          if (t.notes?.startsWith('{')) {
                            try {
                              const p = JSON.parse(t.notes);
                              const badges: React.ReactNode[] = [];
                              if (p.discount_code && p.discount_percentage) {
                                badges.push(
                                  <span key="disc" className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/20 ml-2">
                                    <Tag className="w-2.5 h-2.5" />
                                    {p.discount_code} (-{p.discount_percentage}%)
                                  </span>
                                );
                              }
                              if (p.referral_code) {
                                badges.push(
                                  <span key="ref" className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-800 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-500/20 ml-2">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    Ref: {p.referral_code}
                                  </span>
                                );
                              }
                              return badges.length > 0 ? <>{badges}</> : null;
                            } catch {
                              // ignore
                            }
                          }
                          return null;
                        })()}
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
