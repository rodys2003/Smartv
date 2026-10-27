'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  getAffiliateProfile,
  getMyCommissions,
  getMyPayouts,
  updateAffiliateBinanceUid,
  registerAffiliateRequest,
  createPayoutRequest,
  FIXED_WITHDRAWAL_FEE_USDT,
  MIN_WITHDRAWAL_AMOUNT_USDT,
} from '@/features/affiliates/services/affiliateService';
import { Affiliate, AffiliateCommission, AffiliatePayout } from '@/types/affiliate';
import { formatCOP, formatTicketNumber } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Sparkles,
  Copy,
  Check,
  Coins,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  LogOut,
  ArrowLeft,
  ExternalLink,
  Wallet,
  Pencil,
  Info,
} from 'lucide-react';

export default function AffiliatePortalPage() {
  const { user, isAuthenticated, loading: authLoading, signInWithGoogle, signOut } = useAuth();

  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [commissions, setCommissions] = useState<AffiliateCommission[]>([]);
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([]);
  const [loading, setLoading] = useState(true);

  // Registration Form State (for users not yet affiliates)
  const [requestedCode, setRequestedCode] = useState('');
  const [requestedBinanceUid, setRequestedBinanceUid] = useState('');
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
        setPayouts(payoutData);
      }
    } catch (err) {
      console.error('Error loading affiliate profile:', err);
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
    setRegisterError(null);
    setRegistering(true);
    try {
      const created = await registerAffiliateRequest({
        userId: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || undefined,
        requestedCode,
        binanceUid: requestedBinanceUid || undefined,
      });
      setAffiliate(created);
      setRegisterSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al solicitar afiliación';
      setRegisterError(msg);
    } finally {
      setRegistering(false);
    }
  };

  // Handle Updating Binance UID
  const handleSaveBinanceUid = async () => {
    if (!affiliate || !newBinanceUid.trim()) return;
    setUpdatingBinanceUid(true);
    try {
      const ok = await updateAffiliateBinanceUid(affiliate.id, newBinanceUid.trim());
      if (ok) {
        setAffiliate({ ...affiliate, binance_uid: newBinanceUid.trim() });
        setIsEditingBinanceUid(false);
      }
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

  // Totals & Calculations
  const availableCommissions = commissions.filter((c) => c.status === 'available');
  const availableUSDT = availableCommissions
    .filter((c) => c.currency === 'USDT')
    .reduce((sum, c) => sum + Number(c.commission_amount || 0), 0);
  const availableCOP = availableCommissions
    .filter((c) => c.currency === 'COP')
    .reduce((sum, c) => sum + Number(c.commission_amount || 0), 0);

  // Estimación referencial COP a USDT (tasa comercial aproximada ~4.000 COP/USDT sólo para vista previa)
  const estimatedCopToUsdt = availableCOP > 0 ? Number((availableCOP / 4000).toFixed(2)) : 0;
  const totalGrossAvailableUSDT = Number((availableUSDT + estimatedCopToUsdt).toFixed(2));

  const validatingCommissions = commissions.filter((c) => c.status === 'validating');
  const validatingUSDT = validatingCommissions
    .filter((c) => c.currency === 'USDT')
    .reduce((sum, c) => sum + Number(c.commission_amount || 0), 0);
  const validatingCOP = validatingCommissions
    .filter((c) => c.currency === 'COP')
    .reduce((sum, c) => sum + Number(c.commission_amount || 0), 0);

  const estimatedCommissions = commissions.filter((c) => c.status === 'estimated');
  const estimatedUSDT = estimatedCommissions
    .filter((c) => c.currency === 'USDT')
    .reduce((sum, c) => sum + Number(c.commission_amount || 0), 0);
  const estimatedCOP = estimatedCommissions
    .filter((c) => c.currency === 'COP')
    .reduce((sum, c) => sum + Number(c.commission_amount || 0), 0);

  const totalPaidUSDT = payouts
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.net_amount_usdt || 0), 0);

  // Handle Request Payout
  const handleRequestPayout = async () => {
    if (!affiliate || !affiliate.binance_uid) {
      setPayoutError('Debes registrar tu Binance UID antes de solicitar la liquidación.');
      return;
    }
    if (totalGrossAvailableUSDT <= FIXED_WITHDRAWAL_FEE_USDT) {
      setPayoutError(`El saldo disponible debe superar la tarifa fija de ${FIXED_WITHDRAWAL_FEE_USDT} USDT.`);
      return;
    }

    setSubmittingPayout(true);
    setPayoutError(null);
    try {
      const availableIds = availableCommissions.map((c) => c.id);
      await createPayoutRequest({
        affiliateId: affiliate.id,
        binanceUid: affiliate.binance_uid,
        grossAmountUsdt: totalGrossAvailableUSDT,
        copTotalOriginal: availableCOP,
        commissionIdsToInclude: availableIds,
        notes: `Solicitud de retiro portal afiliado`,
      });
      setIsPayoutModalOpen(false);
      await loadAffiliateData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar la liquidación';
      setPayoutError(msg);
    } finally {
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
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060913] dark:text-slate-100 flex flex-col justify-between p-6">
        <div className="max-w-md mx-auto my-auto w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 mx-auto flex items-center justify-center">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Portal de Afiliados</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              Inicia sesión con Google para acceder a tus enlaces de referido, ver tus comisiones acumuladas y solicitar retiros por Binance.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={signInWithGoogle}
            className="w-full font-bold text-sm py-4 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <span>Iniciar Sesión con Google</span>
          </Button>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>
    );
  }

  // Not an Affiliate Yet -> Registration Request Form
  if (!affiliate) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060913] dark:text-slate-100 p-6 flex flex-col justify-between">
        <div className="max-w-lg mx-auto my-auto w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/30 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">Programa de Afiliados SmartvPro</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gana el <strong>30% de comisión</strong> por cada servicio vendido y cobra en USDT vía Binance.
              </p>
            </div>
          </div>

          {registerSuccess ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs space-y-2">
              <p className="font-bold text-sm flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                ¡Solicitud Registrada con Éxito!
              </p>
              <p>
                Tu cuenta ha quedado registrada con el código <strong>{requestedCode}</strong>. Nuestro equipo administrativo activará tu enlace a la brevedad.
              </p>
            </div>
          ) : (
            <form onSubmit={handleRegisterAffiliate} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  Conectado como: <strong>{user.email}</strong>
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Código de Referido Deseado *
                </label>
                <input
                  type="text"
                  required
                  value={requestedCode}
                  onChange={(e) => setRequestedCode(e.target.value.toUpperCase())}
                  placeholder="Ej. ANA8X2"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold uppercase text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Tu enlace será: <code>smartvpro.ordely.online/r/{requestedCode || 'CODIGO'}</code>
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tu Binance UID (Para recibir tus pagos)
                </label>
                <input
                  type="text"
                  value={requestedBinanceUid}
                  onChange={(e) => setRequestedBinanceUid(e.target.value)}
                  placeholder="Ej. 85419203"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Lo encuentras en tu perfil de Binance. Puedes agregarlo o editarlo después.
                </span>
              </div>

              {registerError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200 text-xs flex items-center gap-2 border border-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{registerError}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={registering || !requestedCode.trim()}
                className="w-full font-bold text-xs py-3.5 cursor-pointer"
              >
                {registering ? 'Registrando...' : 'Solicitar Activación de Afiliado'}
              </Button>
            </form>
          )}

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
            <Link href="/" className="text-slate-400 hover:text-slate-600">
              ← Volver a SmartvPro
            </Link>
            <button onClick={() => signOut()} className="text-rose-500 hover:underline">
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pending Approval State
  if (affiliate.status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060913] dark:text-slate-100 p-6 flex flex-col justify-between">
        <div className="max-w-md mx-auto my-auto w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-500/30 rounded-3xl p-8 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <Clock className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">Cuenta en Proceso de Activación</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Tu solicitud con el código <strong className="text-amber-600 font-mono">{affiliate.referral_code}</strong> fue recibida. Un administrador revisará tu cuenta y la activará en breve.
          </p>
          <div className="pt-4 flex justify-center gap-3 text-xs">
            <Link href="/" className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
              Ir al inicio
            </Link>
            <button onClick={() => signOut()} className="px-4 py-2 rounded-xl text-rose-500 hover:bg-rose-50 font-bold">
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Enlace de Referido Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-white to-white dark:from-cyan-950/40 dark:via-slate-900 dark:to-slate-900 border border-cyan-300 dark:border-cyan-500/30 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 block">
                Tu Enlace Exclusivo de Referido (Comisión: 30%)
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
                Cualquier persona que ingrese mediante este enlace quedará asociada a tu cuenta durante <strong>30 días</strong> (*last click*). Cuando compre cualquier servicio, acumularás el 30% del valor neto.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 p-2 rounded-2xl shrink-0">
              <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 px-2 truncate max-w-[240px] sm:max-w-xs">
                {referralUrl}
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCopyLink}
                className="text-xs font-bold px-3 py-2 shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Enlace</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Metric Cards (4 columnas) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Saldo Disponible */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-500/30 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Wallet className="w-4 h-4" />
                Disponible para Retiro
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {availableUSDT > 0 ? `${availableUSDT.toFixed(2)} USDT` : '$0 COP'}
              </div>
              {availableCOP > 0 && (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                  + {formatCOP(availableCOP)} (est. ~{estimatedCopToUsdt} USDT)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
              Tarifa fija de retiro: <strong>2 USDT</strong>
            </p>
          </div>

          {/* Card 2: En Validación */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                En Validación (Garantía 7d)
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {validatingUSDT > 0 ? `${validatingUSDT.toFixed(2)} USDT` : '$0 COP'}
              </div>
              {validatingCOP > 0 && (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                  + {formatCOP(validatingCOP)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
              Servicios con pago confirmado en período de espera.
            </p>
          </div>

          {/* Card 3: Comisiones Estimadas */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Tickets en Cola (Estimadas)
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {estimatedUSDT > 0 ? `${estimatedUSDT.toFixed(2)} USDT` : '$0 COP'}
              </div>
              {estimatedCOP > 0 && (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                  + {formatCOP(estimatedCOP)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
              Clientes que crearon ticket pero aún no han sido atendidos.
            </p>
          </div>

          {/* Card 4: Total Liquidado */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Total Pagado Histórico
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {totalPaidUSDT.toFixed(2)} USDT
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                {payouts.filter((p) => p.status === 'completed').length} transferencias completadas
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
              Enviado directamente a tu Binance UID.
            </p>
          </div>
        </div>

        {/* Binance UID Settings & Payout Button Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              Cuenta Receptora de Liquidaciones (Binance Pay)
            </span>
            {isEditingBinanceUid ? (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newBinanceUid}
                  onChange={(e) => setNewBinanceUid(e.target.value)}
                  placeholder="Tu Binance UID (ej. 85419203)"
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white"
                />
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleSaveBinanceUid}
                  disabled={updatingBinanceUid || !newBinanceUid.trim()}
                  className="text-xs font-bold"
                >
                  {updatingBinanceUid ? 'Guardando...' : 'Guardar'}
                </Button>
                <button
                  type="button"
                  onClick={() => setIsEditingBinanceUid(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 pt-1">
                <span className="font-mono text-base font-black text-slate-900 dark:text-white">
                  {affiliate.binance_uid || 'No configurado'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingBinanceUid(true)}
                  className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                  <span>{affiliate.binance_uid ? 'Cambiar' : 'Configurar'}</span>
                </button>
              </div>
            )}
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Todas las liquidaciones se envían en <strong>USDT</strong> sin excepción. Se aplica una tarifa fija de <strong>2 USDT</strong> por retiro.
            </p>
          </div>

          {totalGrossAvailableUSDT >= MIN_WITHDRAWAL_AMOUNT_USDT && affiliate.binance_uid && (
            <Button
              variant="whatsapp"
              size="md"
              onClick={() => setIsPayoutModalOpen(true)}
              className="font-bold text-xs shrink-0 cursor-pointer shadow-md"
            >
              <Wallet className="w-4 h-4 mr-1.5" />
              <span>Solicitar Liquidación ({totalGrossAvailableUSDT.toFixed(2)} USDT)</span>
            </Button>
          )}
        </div>

        {/* Tablas: Mis Ventas & Historial de Pagos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Tus Ventas Referidas ({commissions.length})</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Privacidad activa: No se muestran datos personales de los clientes
            </span>
          </div>

          {commissions.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              Aún no registras ventas con tu enlace. ¡Comparte tu link <code>/r/{affiliate.referral_code}</code> para empezar a comisionar!
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Ticket</th>
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4">Plan</th>
                      <th className="py-3 px-4">Venta Neta</th>
                      <th className="py-3 px-4">Comisión (30%)</th>
                      <th className="py-3 px-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {commissions.map((c) => {
                      const isCOP = c.currency === 'COP';
                      const formattedNet = isCOP ? formatCOP(c.net_sale_price) : `${c.net_sale_price} USDT`;
                      const formattedComm = isCOP ? formatCOP(c.commission_amount) : `${c.commission_amount} USDT`;

                      let statusBadge = (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300">
                          Estimada
                        </span>
                      );
                      if (c.status === 'validating') {
                        statusBadge = (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                            En Validación
                          </span>
                        );
                      } else if (c.status === 'available') {
                        statusBadge = (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                            Disponible
                          </span>
                        );
                      } else if (c.status === 'paid') {
                        statusBadge = (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            Pagada
                          </span>
                        );
                      }

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                            {c.ticket_number ? formatTicketNumber(c.ticket_number) : 'Sin asignar'}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {new Date(c.created_at).toLocaleDateString('es-CO')}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                            {c.service_name}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                            {formattedNet}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-cyan-700 dark:text-cyan-400">
                            {formattedComm}
                          </td>
                          <td className="py-3 px-4">{statusBadge}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Historial de Liquidaciones USDT */}
        {payouts.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>Historial de Liquidaciones USDT ({payouts.length})</span>
            </h3>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4">Bruto USDT</th>
                      <th className="py-3 px-4">Tarifa Fija</th>
                      <th className="py-3 px-4">Neto Enviado</th>
                      <th className="py-3 px-4">Binance UID</th>
                      <th className="py-3 px-4">Referencia / Tx</th>
                      <th className="py-3 px-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {payouts.map((p) => (
                      <tr key={p.id}>
                        <td className="py-3 px-4 text-slate-500 font-sans">
                          {new Date(p.created_at).toLocaleDateString('es-CO')}
                        </td>
                        <td className="py-3 px-4">{p.gross_amount_usdt.toFixed(2)} USDT</td>
                        <td className="py-3 px-4 text-rose-500">-{p.withdrawal_fee_usdt.toFixed(2)} USDT</td>
                        <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                          {p.net_amount_usdt.toFixed(2)} USDT
                        </td>
                        <td className="py-3 px-4">{p.binance_uid}</td>
                        <td className="py-3 px-4 text-slate-400 font-sans truncate max-w-[150px]">
                          {p.binance_tx_reference || 'En proceso'}
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                            }`}
                          >
                            {p.status === 'completed' ? 'Completada' : 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal para Solicitar Liquidación */}
      <Modal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        title="Confirmar Solicitud de Liquidación"
        description="Revisa el desglose de tu saldo disponible y confirma la transferencia a tu Binance UID."
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Saldo Bruto Disponible:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {totalGrossAvailableUSDT.toFixed(2)} USDT
              </span>
            </div>
            <div className="flex justify-between text-rose-600 dark:text-rose-400">
              <span>Tarifa fija de retiro:</span>
              <span className="font-mono font-bold">-2.00 USDT</span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between text-sm">
              <span className="font-bold text-slate-900 dark:text-white">Neto a transferir:</span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                {(totalGrossAvailableUSDT - 2.0).toFixed(2)} USDT
              </span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-2 text-[11px] text-slate-500">
              <span>Destino: </span>
              <strong className="text-slate-900 dark:text-white font-mono">{affiliate.binance_uid}</strong> (Binance Pay)
            </div>
          </div>

          {payoutError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs flex items-center gap-2 border border-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{payoutError}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsPayoutModalOpen(false)}
              className="w-full text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={submittingPayout}
              onClick={handleRequestPayout}
              className="w-full text-xs font-bold"
            >
              {submittingPayout ? 'Enviando...' : 'Confirmar Retiro'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
