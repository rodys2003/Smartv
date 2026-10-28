'use client';

import { RequiredIndicator } from '@/components/ui/RequiredIndicator';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useApplicantName } from '@/features/affiliates/hooks/useApplicantName';
import { AffiliateHeader } from '@/features/affiliates/components/AffiliateHeader';
import {
  getAffiliateProfile,
  getMyCommissions,
  getMyPayouts,
  updateAffiliateBinanceUid,
  registerAffiliateRequest,
} from '@/features/affiliates/services/affiliateService';
import { getWithdrawalQuote, requestQuotedWithdrawal, type WithdrawalQuote } from '@/features/affiliates/services/affiliateFinanceService';
import { AffiliateFinanceTabs, type AffiliateFinanceTab } from '@/features/affiliates/components/AffiliateFinanceTabs';
import { WithdrawalQuoteCard } from '@/features/affiliates/components/WithdrawalQuoteCard';
import { Affiliate, AffiliateCommission, AffiliatePayout } from '@/types/affiliate';
import { formatCOP, formatTicketNumber } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Sparkles,
  Copy,
  Check,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  LogOut,
  ArrowLeft,
} from 'lucide-react';

export default function AffiliatePortalPage() {
  const { user, isAuthenticated, loading: authLoading, signInWithGoogle, signOut } = useAuth();

  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [commissions, setCommissions] = useState<AffiliateCommission[]>([]);
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [balanceTime, setBalanceTime] = useState(0);
  const [dataError, setDataError] = useState<string | null>(null);
  const [tab, setTab] = useState<AffiliateFinanceTab>('summary');
  const [quote, setQuote] = useState<WithdrawalQuote | null>(null);
  const [requestId, setRequestId] = useState('');
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountSaved, setAccountSaved] = useState(false);
  const payoutLock = useRef(false);

  // Registration Form State (for users not yet affiliates)
  const [applicantName, setApplicantName] = useApplicantName(user);
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantTiktok, setApplicantTiktok] = useState('');
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Edit Binance UID State
  const [isEditingBinanceUid, setIsEditingBinanceUid] = useState(false);
  const [newBinanceUid, setNewBinanceUid] = useState('');
  const [updatingBinanceUid, setUpdatingBinanceUid] = useState(false);

  // Payout Request State
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);

  // Copy referral link feedback
  const [copiedLink, setCopiedLink] = useState(false);

  const loadAffiliateData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setDataError(null);
    try {
      const aff = await getAffiliateProfile(user.id, user.email);
      setAffiliate(aff);

      if (aff) {
        setNewBinanceUid(aff.binance_uid || '');
        const [commData, payoutData] = await Promise.all([
          getMyCommissions(aff.id),
          getMyPayouts(aff.id),
        ]);
        setCommissions(commData);
        setBalanceTime(Date.now());
        setPayouts(payoutData);
      }
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'No se pudo cargar el panel. Intenta actualizar.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadAffiliateData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, user, authLoading, loadAffiliateData]);

  // Handle Affiliate Registration Request
  const handleRegisterAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!applicantPhone.trim()) {
      setRegisterError('Por favor ingresa tu número de WhatsApp para contacto.');
      return;
    }
    if (!applicantTiktok.trim()) {
      setRegisterError('Por favor ingresa tu cuenta o enlace de TikTok.');
      return;
    }
    setRegisterError(null);
    setRegistering(true);
    try {
      const created = await registerAffiliateRequest({
        userId: user.id,
        email: user.email || '',
        name: applicantName.trim() || undefined,
        phone: applicantPhone.trim(),
        tiktokAccount: applicantTiktok.trim(),
      });
      setAffiliate(created);
      setRegisterSuccess(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string'
          ? (err as { message: string }).message
          : 'Error al solicitar afiliación';
      setRegisterError(msg);
    } finally {
      setRegistering(false);
    }
  };

  // Handle Updating Binance UID
  const handleSaveBinanceUid = async () => {
    if (!affiliate || !newBinanceUid.trim()) return;
    setUpdatingBinanceUid(true);
    setAccountError(null);
    setAccountSaved(false);
    try {
      const ok = await updateAffiliateBinanceUid(affiliate.id, newBinanceUid.trim());
      if (!ok) throw new Error('No se pudo guardar el Binance UID. Intenta nuevamente.');
      if (ok) {
        setAffiliate({ ...affiliate, binance_uid: newBinanceUid.trim() });
        setIsEditingBinanceUid(false);
        setAccountSaved(true);
        setQuote(null);
      }
    } catch (error) {
      setAccountError(error instanceof Error ? error.message : 'No se pudo guardar el Binance UID.');
    } finally {
      setUpdatingBinanceUid(false);
    }
  };

  // Copy Referral Link Helper
  const handleCopyLink = () => {
    if (!affiliate) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://smartvpro.ordely.online';
    const link = `${origin}/r/${affiliate.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Display original currencies; only server quotes calculate payable USDT.
  const availableCommissions = commissions.filter((c) => (c.status === 'available' || c.status === 'validating') && !c.payout_id && !c.requires_reconciliation && c.ticket_paid_at && c.available_at && Math.max(new Date(c.available_at).getTime(), new Date(c.ticket_paid_at).getTime() + 7 * 24 * 60 * 60 * 1000) <= balanceTime);
  const pendingCommissions = commissions.filter(c => !c.payout_id && c.status !== 'cancelled' && c.status !== 'paid' && !availableCommissions.includes(c));
  const originalBalance = (rows: AffiliateCommission[]) => {
    const cop = rows.filter(c => c.currency === 'COP').reduce((sum, c) => sum + Number(c.commission_amount), 0);
    const usdt = rows.filter(c => c.currency === 'USDT').reduce((sum, c) => sum + Number(c.commission_amount), 0);
    return `${formatCOP(cop)} COP · ${usdt.toFixed(2)} USDT`;
  };
  const totalPaidUSDT = payouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + Number(p.net_amount_usdt), 0);
  const reservedUSDT = payouts.filter(p => p.status === 'pending' || p.status === 'processing').reduce((sum, p) => sum + Number(p.gross_amount_usdt), 0);
  const refreshQuote = async () => {
    if (!affiliate || payoutLock.current) return;
    setQuoteLoading(true);
    setPayoutError(null);
    setQuote(null);
    try {
      const next = await getWithdrawalQuote(affiliate.id);
      setQuote(next);
      setRequestId(crypto.randomUUID());
    } catch (error) {
      setPayoutError(error instanceof Error ? error.message : 'No se pudo obtener el desglose. Intenta nuevamente.');
    } finally { setQuoteLoading(false); }
  };
  const handleRequestPayout = async () => {
    if (!quote || !quote.eligible || !requestId || payoutLock.current) return;
    payoutLock.current = true;
    setSubmittingPayout(true);
    setPayoutError(null);
    try {
      await requestQuotedWithdrawal(quote, requestId);
      setIsPayoutModalOpen(false);
      setQuote(null);
      await loadAffiliateData();
    } catch (error) {
      // Never silently substitute amounts or replay a request using a new quote.
      setPayoutError(`${error instanceof Error ? error.message : 'No se pudo solicitar el retiro.'} Vuelve a revisar el desglose antes de confirmar. Si la respuesta fue incierta, revisa primero el historial.`);
      setQuote(null);
      await loadAffiliateData();
    } finally {
      payoutLock.current = false;
      setSubmittingPayout(false);
    }
  };

  // Loading Screen
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060913] dark:text-slate-400 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-500" />
          <p className="text-sm font-semibold">Cargando Portal de Afiliados...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated State
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060913] dark:text-slate-100">
        <AffiliateHeader showPortalLink={false} />
        <main className="mx-auto w-full max-w-lg px-4 py-8 sm:px-6 sm:py-12">
          <nav aria-label="Volver al sitio" className="mb-4">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-sm font-semibold text-slate-600 transition-colors hover:text-cyan-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-500 dark:text-slate-300 dark:hover:text-cyan-300"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              <span>Volver al inicio</span>
            </Link>
          </nav>
          <div className="w-full space-y-6 rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl sm:p-8 dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
              <Sparkles aria-hidden="true" className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Portal de Afiliados</h1>
              <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
                Inicia sesión con Google para acceder a tus enlaces de referido, ver tus comisiones acumuladas y solicitar retiros por Binance.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={signInWithGoogle}
              className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 py-4 text-sm font-bold shadow-lg shadow-cyan-500/20"
            >
              <span>Continuar con Google</span>
            </Button>
            <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
              <Link
                href="/programa-afiliados"
                className="flex min-h-11 w-full items-center justify-center rounded-lg px-2 py-2 text-sm font-semibold leading-6 text-cyan-700 underline decoration-cyan-300 underline-offset-4 hover:text-cyan-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 dark:text-cyan-300 dark:hover:text-cyan-200"
              >
                Conocer el programa y sus condiciones
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (dataError && !affiliate) return <main className="mx-auto max-w-lg p-6"><h1 className="text-2xl font-bold">Portal de Afiliados</h1><p role="alert" className="my-4">{dataError}</p><Button onClick={loadAffiliateData}>Volver a intentar</Button></main>;

  // Registration keeps account identity separate from the editable application name.
  if (!affiliate) {
    const inputClass = 'min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500';
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060913] dark:text-slate-100">
        <AffiliateHeader showPortalLink={false} />
        <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <aside className="space-y-6 lg:pt-5">
            <Link href="/programa-afiliados" className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-cyan-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-500 dark:text-cyan-300"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Conocer el programa</Link>
            <div><p className="text-sm font-bold text-cyan-700 dark:text-cyan-300">Tu comunidad, tu recomendación</p><h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">Da el primer paso como afiliado de SmartvPro.</h1><p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">Cuéntanos cómo te conocen y dónde compartirías el servicio. Revisaremos tu perfil antes de activar tu cuenta.</p></div>
            <ul className="space-y-4 text-base leading-7 text-slate-700 dark:text-slate-300">
              <li className="flex gap-3"><CheckCircle aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-cyan-600 dark:text-cyan-300" />30% de comisión sobre el importe neto del plan vendido.</li>
              <li className="flex gap-3"><CheckCircle aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-cyan-600 dark:text-cyan-300" />Tu enlace y el registro de Binance UID se habilitan después de la aprobación.</li>
              <li className="flex gap-3"><CheckCircle aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-cyan-600 dark:text-cyan-300" />Pagos en USDT por Binance. Retiro mínimo de 5 USDT y tarifa del programa de 2 USDT.</li>
            </ul>
            <p className="border-l-2 border-cyan-400 pl-4 text-sm leading-6 text-slate-600 dark:text-slate-400">Enviar la solicitud no activa automáticamente tu cuenta. No necesitas compartir contraseñas ni datos de acceso de Binance.</p>
          </aside>
          <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-2xl font-bold tracking-tight">Tu solicitud de afiliación</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Los campos con asterisco rojo son obligatorios. El nombre es una sugerencia que puedes cambiar.</p>
            {registerSuccess ? (
              <div role="status" className="mt-6 space-y-2 rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-base leading-7 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100">
                <p className="flex items-center gap-2 font-bold"><CheckCircle aria-hidden="true" className="h-5 w-5" />Solicitud enviada</p>
                <p>Revisaremos tu información antes de activar tu cuenta. Después podrás configurar tu Binance UID en el panel.</p>
              </div>
            ) : (
              <form onSubmit={handleRegisterAffiliate} aria-busy={registering} className="mt-6 space-y-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cuenta de Google conectada</p><p className="mt-1 break-all text-sm font-semibold">{user.email}</p>
                </div>
                <div>
                  <label htmlFor="affiliate-name" className="mb-2 block text-sm font-semibold">Nombre para tu perfil <span className="font-normal text-slate-500 dark:text-slate-400">(opcional)</span></label>
                  <input id="affiliate-name" name="name" type="text" autoComplete="name" aria-describedby="affiliate-name-help" value={applicantName} onChange={(e) => setApplicantName(e.target.value)} placeholder="Ej. Ana Gómez" className={inputClass} />
                  <p id="affiliate-name-help" className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Puedes borrar el nombre sugerido y usar el que prefieras. Esto no cambia tu cuenta de Google.</p>
                </div>
                <div>
                  <label htmlFor="affiliate-phone" className="mb-2 block text-sm font-semibold">WhatsApp de contacto<RequiredIndicator /></label>
                  <input id="affiliate-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required aria-describedby="affiliate-phone-help" value={applicantPhone} onChange={(e) => setApplicantPhone(e.target.value)} placeholder="Ej. +57 300 123 4567" className={inputClass} />
                  <p id="affiliate-phone-help" className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Incluye el código de tu país. Lo usamos para coordinar la revisión de tu solicitud.</p>
                </div>
                <div>
                  <label htmlFor="affiliate-tiktok" className="mb-2 block text-sm font-semibold">Cuenta de TikTok<RequiredIndicator /></label>
                  <input id="affiliate-tiktok" name="tiktok" type="text" autoCapitalize="none" autoCorrect="off" spellCheck={false} required aria-describedby="affiliate-tiktok-help" value={applicantTiktok} onChange={(e) => setApplicantTiktok(e.target.value)} placeholder="Ej. @tu_usuario o tiktok.com/@tu_usuario" className={inputClass} />
                  <p id="affiliate-tiktok-help" className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Comparte el usuario o enlace del perfil donde publicarías tus recomendaciones.</p>
                </div>
                {registerError && <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm leading-6 text-rose-800 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-100"><AlertCircle aria-hidden="true" className="mt-1 h-4 w-4 shrink-0" /><span>{registerError}</span></div>}
                <Button type="submit" variant="primary" size="lg" disabled={registering} className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 py-3 text-base font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-500">
                  {registering && <RefreshCw aria-hidden="true" className="h-4 w-4 animate-spin motion-reduce:animate-none" />}<span>{registering ? 'Enviando solicitud...' : 'Enviar solicitud de afiliación'}</span>
                </Button>
                <p className="text-center text-sm leading-6 text-slate-500 dark:text-slate-400">La activación es manual. Podrás consultar el estado desde este panel.</p>
              </form>
            )}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm dark:border-slate-700">
              <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-cyan-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 dark:text-slate-300 dark:hover:text-cyan-300"><ArrowLeft aria-hidden="true" className="h-4 w-4" /><span>Volver al inicio</span></Link>
              <button type="button" onClick={() => signOut()} className="min-h-11 cursor-pointer rounded-lg px-2 font-semibold text-rose-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:text-rose-300">Cerrar sesión</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Pending Approval State
  if (affiliate.status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060913] dark:text-slate-100 p-6 flex flex-col justify-between">
        <div className="max-w-md mx-auto my-auto w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-500/30 rounded-3xl p-8 shadow-xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
              Solicitud en Revisión
            </span>
            <h1 className="text-xl font-black text-slate-900 dark:text-white mt-2">
              Postulación en Proceso de Aprobación
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
              Tu solicitud fue recibida correctamente. El administrador revisará tus datos para activar tu cuenta de afiliado.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">WhatsApp:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {affiliate.phone || 'No registrado'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">TikTok:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                {affiliate.tiktok_account || 'No registrado'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-200 text-left">
            <strong>Importante:</strong> Tu código oficial de referido y la configuración de tu cuenta <strong>Binance UID</strong> para recibir tus pagos en USDT se generarán y activarán automáticamente una vez que el administrador apruebe tu postulación.
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3 text-xs">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-cyan-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 dark:text-slate-300 dark:hover:text-cyan-300"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              <span>Volver al inicio</span>
            </Link>
            <button
              onClick={() => signOut()}
              className="px-4 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold cursor-pointer"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Suspended State
  if (affiliate.status === 'suspended') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060913] dark:text-slate-100 p-6 flex flex-col justify-between">
        <div className="max-w-md mx-auto my-auto w-full bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-500/30 rounded-3xl p-8 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">Afiliación Suspendida</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Tu cuenta de afiliado se encuentra suspendida temporalmente. Para más detalles, ponte en contacto con nuestro equipo de soporte.
          </p>
          <div className="pt-4">
            <button onClick={() => signOut()} className="px-4 py-2 rounded-xl text-rose-500 hover:bg-rose-50 font-bold text-xs">
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE AFFILIATE DASHBOARD
  const referralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/r/${affiliate.referral_code}`
    : `https://smartvpro.ordely.online/r/${affiliate.referral_code}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060913] dark:text-slate-100 pb-20 transition-colors">
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                Smart TV <span className="text-cyan-600 dark:text-cyan-400">Afiliados</span>
              </span>
            </Link>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300">
              Activo
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 hidden sm:inline-block">
              {affiliate.user_name || affiliate.user_email}
            </span>
            <button
              onClick={() => signOut()}
              title="Cerrar sesión"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 pt-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">Tu actividad como afiliado</h1><Button variant="secondary" onClick={loadAffiliateData}>Actualizar</Button></div>
        {dataError && <p role="alert" className="rounded-xl border border-rose-300 p-4 text-rose-800 dark:text-rose-200">{dataError}</p>}
        <AffiliateFinanceTabs value={tab} onChange={setTab} />
        <section id="affiliate-finance-content" aria-label={{ summary: 'Resumen', sales: 'Mis ventas', withdrawals: 'Retiros', account: 'Cuenta de cobro' }[tab]} className="space-y-6">
          {tab === 'summary' && <>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
              <h2 className="text-lg font-bold">Tu enlace de referido · 30% de comisión</h2><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Se atribuye el último enlace válido durante 30 días. Comparte servicios compatibles con Android TV y Google TV.</p>
              <div className="mt-4 flex min-w-0 flex-wrap items-center gap-3"><span className="min-w-0 break-all text-sm">{referralUrl}</span><Button variant="secondary" onClick={handleCopyLink}>{copiedLink ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}{copiedLink ? 'Copiado' : 'Copiar enlace'}</Button></div>
            </section>
            <dl className="grid gap-4 sm:grid-cols-2">
              {[['Disponible en moneda original', originalBalance(availableCommissions)], ['En espera de pago o validación', originalBalance(pendingCommissions)], ['Reservado para retiros', `${reservedUSDT.toFixed(2)} USDT brutos`], ['Transferido', `${totalPaidUSDT.toFixed(2)} USDT netos`]].map(([label, amount]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"><dt className="text-sm text-slate-600 dark:text-slate-300">{label}</dt><dd className="mt-2 break-words text-xl font-bold">{amount}</dd></div>)}
            </dl>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">La comisión se habilita 7 días después de confirmar el pago de la venta. El saldo reservado no se puede retirar de nuevo. Consulta el importe exacto convertido en Retiros.</p>
            <Button onClick={() => setTab('withdrawals')}>Ver cuánto puedo retirar</Button>
          </>}
          {tab === 'sales' && <><h2 className="text-lg font-bold">Mis ventas ({commissions.length})</h2>{!commissions.length && <p>Aún no tienes ventas referidas. Comparte tu enlace desde Resumen.</p>}
            <div className="grid gap-4 sm:grid-cols-2">{commissions.map(c => <article key={c.id} className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 text-sm dark:border-slate-700 dark:bg-slate-900"><h3 className="font-bold">{c.service_name}</h3><p>Ticket {c.ticket_number ? formatTicketNumber(c.ticket_number) : 'Sin asignar'} · {new Date(c.created_at).toLocaleDateString('es-CO')}</p><p>Venta neta: {Number(c.net_sale_price).toLocaleString('es-CO')} {c.currency}</p><p className="font-semibold">Comisión: {Number(c.commission_amount).toLocaleString('es-CO')} {c.currency}</p><p>{c.status === 'paid' ? 'Pagada' : c.status === 'cancelled' ? 'Cancelada' : c.payout_id ? 'Reservada para retiro' : c.requires_reconciliation ? 'Requiere conciliación' : availableCommissions.includes(c) ? 'Disponible' : c.ticket_paid_at ? 'En validación' : 'Pago por confirmar'}</p>{c.available_at && !c.requires_reconciliation && <p>Disponible desde: {new Date(c.available_at).toLocaleString('es-CO')}</p>}</article>)}</div>
          </>}
          {tab === 'withdrawals' && <>
            <div className="space-y-3"><h2 className="text-lg font-bold">Solicitar retiro</h2><p className="text-sm leading-6">Mínimo 5 USDT brutos. Tarifa fija del programa: 2 USDT para cualquier monto. Revisa el neto y el destino antes de confirmar.</p><p className="text-sm leading-6">Si no hay tasa configurada, el saldo COP queda pendiente de conversión; solo podrán incluirse comisiones nativas en USDT. No se aplica una tasa aproximada.</p><Button disabled={quoteLoading || submittingPayout} onClick={refreshQuote}>{quoteLoading ? 'Consultando...' : 'Consultar desglose de retiro'}</Button></div>
            {payoutError && <p role="alert" className="rounded-xl border border-rose-300 p-4 text-sm text-rose-800 dark:text-rose-200">{payoutError}</p>}
            {quote && <><WithdrawalQuoteCard quote={quote} /><Button disabled={!quote.eligible || submittingPayout} onClick={() => setIsPayoutModalOpen(true)}>Revisar y confirmar retiro</Button></>}
            <h2 className="border-t border-slate-200 pt-6 text-lg font-bold dark:border-slate-700">Historial de retiros</h2>
            {!payouts.length && <p className="text-sm">Aún no has solicitado retiros.</p>}
            <div className="grid gap-4 sm:grid-cols-2">{payouts.map(p => <article key={p.id} className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 text-sm dark:border-slate-700 dark:bg-slate-900"><h3 className="font-bold">{{ pending: 'Pendiente de revisión', processing: 'En proceso de transferencia', completed: 'Pagado', rejected: 'Rechazado' }[p.status]}</h3><p>{new Date(p.created_at).toLocaleString('es-CO')}</p><dl className="space-y-2">{[['Bruto', `${Number(p.gross_amount_usdt).toFixed(2)} USDT`], ['Tarifa', `${Number(p.withdrawal_fee_usdt).toFixed(2)} USDT`], [p.status === 'completed' ? 'Neto enviado' : 'Neto solicitado', `${Number(p.net_amount_usdt).toFixed(2)} USDT`], ['COP incluidos', `${Number(p.cop_total_original || 0).toLocaleString('es-CO')} COP`], ['Tasa congelada', p.cop_to_usdt_rate ? `1 USDT = ${Number(p.cop_to_usdt_rate).toLocaleString('es-CO')} COP` : 'Sin conversión COP'], ['Binance UID de esta solicitud', p.binance_uid], ['Referencia', p.binance_tx_reference || 'Sin referencia registrada']].map(([label, value]) => <div key={label} className="flex flex-wrap justify-between gap-2"><dt>{label}</dt><dd className="break-all font-semibold">{value}</dd></div>)}</dl>{p.rejected_reason && <p>Motivo del rechazo: {p.rejected_reason}</p>}{p.status === 'processing' && <p>El administrador está revisando la transferencia. No necesitas solicitarla otra vez.</p>}</article>)}</div>
          </>}
          {tab === 'account' && <section className="max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"><h2 className="text-lg font-bold">Cuenta de cobro</h2><p className="text-sm leading-6">Recibirás USDT en el Binance UID registrado. No compartas contraseñas ni claves de acceso. Cambiarlo no modifica el destino guardado en retiros ya solicitados.</p>{isEditingBinanceUid ? <form onSubmit={event => { event.preventDefault(); void handleSaveBinanceUid(); }} className="space-y-4"><div><label htmlFor="binance-uid" className="mb-2 block text-sm font-semibold">Binance UID<RequiredIndicator /></label><input id="binance-uid" required value={newBinanceUid} onChange={event => setNewBinanceUid(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-300 bg-transparent px-4 text-base dark:border-slate-600" /></div><div className="flex flex-wrap gap-3"><Button type="submit" disabled={updatingBinanceUid || !newBinanceUid.trim()}>{updatingBinanceUid ? 'Guardando...' : 'Guardar Binance UID'}</Button><Button type="button" variant="secondary" disabled={updatingBinanceUid} onClick={() => setIsEditingBinanceUid(false)}>Cancelar</Button></div></form> : <><p className="break-all font-semibold">{affiliate.binance_uid || 'Binance UID no registrado'}</p><Button variant="secondary" onClick={() => { setNewBinanceUid(affiliate.binance_uid || ''); setIsEditingBinanceUid(true); setAccountSaved(false); }}>Editar Binance UID</Button></>}{accountError && <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">{accountError}</p>}{accountSaved && <p role="status" className="text-sm">Binance UID guardado. Los destinos de solicitudes anteriores no cambian.</p>}</section>}
        </section>
      </main>
      <Modal isOpen={isPayoutModalOpen} onClose={() => { if (!submittingPayout) setIsPayoutModalOpen(false); }} title="Confirmar solicitud de retiro" description="Confirma el importe y el destino que acabas de revisar." maxWidth="md">
        {quote ? <div className="space-y-4"><WithdrawalQuoteCard quote={quote} /><div className="flex flex-wrap gap-3"><Button disabled={submittingPayout || !quote.eligible} onClick={handleRequestPayout}>{submittingPayout ? 'Enviando solicitud...' : 'Confirmar retiro'}</Button><Button variant="secondary" disabled={submittingPayout} onClick={() => setIsPayoutModalOpen(false)}>Volver</Button></div></div> : <div className="space-y-4"><p role="alert">{payoutError || 'Vuelve a consultar el desglose antes de confirmar.'}</p><Button variant="secondary" onClick={() => setIsPayoutModalOpen(false)}>Volver al historial</Button></div>}
      </Modal>
    </div>
  );
}
