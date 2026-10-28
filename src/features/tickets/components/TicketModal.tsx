'use client';

import { RequiredIndicator } from '@/components/ui/RequiredIndicator';
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  SERVICE_PLANS,
  MAGIC_APPS_PRICE_COP,
  MAGIC_APPS_PRICE_USDT,
  PLAN_USDT_PRICES,
} from '@/features/services-catalog/constants/plans';
import { ServicePlan, Ticket } from '@/types';
import { formatCOP } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useQueue } from '../hooks/useQueue';
import { createTicket } from '../services/ticketService';
import { TicketCard } from './TicketCard';
import { getOperatingHoursInfo, OperatingHoursInfo } from '@/lib/operatingHours';
import {
  DiscountCoupon,
  validateDiscountCoupon,
  incrementCouponUsage,
} from '@/features/discounts/services/discountService';
import {
  getAffiliateByCode,
  getActiveReferralCode,
  storeReferralCode,
  recordEstimatedCommission,
} from '@/features/affiliates/services/affiliateService';
import { Affiliate } from '@/types/affiliate';
import { AlertTriangle, Check, Lock } from 'lucide-react';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: ServicePlan | null;
  initialMagicApps?: boolean;
  onTicketCreated?: (ticket: Ticket) => void;
}

const BRANDS = [
  'Android TV / Google TV (TCL, Xiaomi, Sony, Chromecast, Onn, TV Box)',
];

export function TicketModal({
  isOpen,
  onClose,
  initialPlan,
  initialMagicApps = false,
  onTicketCreated,
}: TicketModalProps) {
  const { user, isAuthenticated, signInWithGoogle } = useAuth();
  const { waitingTickets, whatsappThreshold } = useQueue();

  const [selectedBrand] = useState(BRANDS[0]);
  const [tvModel, setTvModel] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan>(
    initialPlan || SERVICE_PLANS[1]
  );
  const [hasMagicApps, setHasMagicApps] = useState<boolean>(initialMagicApps);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'bre_b' | 'binance'>('bre_b');
  const [clientNameDraft, setClientNameDraft] = useState<{ userId: string; value: string } | null>(null);
  const suggestedName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  // An intentionally empty draft must not be replaced by the Google suggestion.
  const clientName = user && clientNameDraft?.userId === user.id ? clientNameDraft.value : suggestedName;
  const setClientName = (value: string) => {
    if (user) setClientNameDraft({ userId: user.id, value });
  };
  const [clientWhatsApp, setClientWhatsApp] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hoursInfo, setHoursInfo] = useState<OperatingHoursInfo>(() => getOperatingHoursInfo());

  // Discount coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<DiscountCoupon | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError(null);
    setValidatingCoupon(true);
    try {
      const res = await validateDiscountCoupon(couponCode);
      if (res.valid && res.coupon) {
        setAppliedCoupon(res.coupon);
        setCouponError(null);
      } else {
        setAppliedCoupon(null);
        setCouponError(res.error || 'Código no válido');
      }
    } catch {
      setCouponError('Error al validar el cupón.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };

  // Affiliate Referral state
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [activeAffiliate, setActiveAffiliate] = useState<Affiliate | null>(null);
  const [validatingReferral, setValidatingReferral] = useState(false);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [showManualReferralInput, setShowManualReferralInput] = useState(false);

  useEffect(() => {
    const stored = getActiveReferralCode();
    if (stored && !activeAffiliate) {
      getAffiliateByCode(stored).then((aff) => {
        if (aff && aff.status === 'active' && aff.referral_code) {
          if (user?.id && aff.id === user.id) return;
          if (user?.email && aff.user_email?.toLowerCase() === user.email.toLowerCase()) return;
          setActiveAffiliate(aff);
          setReferralCodeInput(aff.referral_code);
        }
      });
    }
  }, [user, activeAffiliate]);

  const handleApplyReferral = async () => {
    if (!referralCodeInput.trim()) return;
    setReferralError(null);
    setValidatingReferral(true);
    try {
      const clean = referralCodeInput.trim().toUpperCase();
      const aff = await getAffiliateByCode(clean);
      if (!aff || aff.status !== 'active' || !aff.referral_code) {
        setReferralError('Código de referido inexistente o inactivo.');
        setActiveAffiliate(null);
        return;
      }
      if (user?.id && aff.id === user.id) {
        setReferralError('No puedes usar tu propio código de referido.');
        setActiveAffiliate(null);
        return;
      }
      if (user?.email && aff.user_email?.toLowerCase() === user.email.toLowerCase()) {
        setReferralError('No puedes usar tu propio código de referido.');
        setActiveAffiliate(null);
        return;
      }
      setActiveAffiliate(aff);
      storeReferralCode(aff.referral_code);
      setReferralError(null);
      setShowManualReferralInput(false);
    } catch {
      setReferralError('Error al validar código de referido.');
    } finally {
      setValidatingReferral(false);
    }
  };

  const handleRemoveReferral = () => {
    setActiveAffiliate(null);
    setReferralCodeInput('');
    setReferralError(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('smartv_referral');
    }
  };

  useEffect(() => {
    setHoursInfo(getOperatingHoursInfo());
  }, []);

  useEffect(() => {
    if (initialPlan) {
      setSelectedPlan(initialPlan);
    }
    if (initialMagicApps !== undefined) {
      setHasMagicApps(initialMagicApps);
    }
  }, [initialPlan, initialMagicApps]);

  const baseCOP = selectedPlan.price + (hasMagicApps ? MAGIC_APPS_PRICE_COP : 0);
  const baseUSDT = (PLAN_USDT_PRICES[selectedPlan.id] ?? 17) + (hasMagicApps ? MAGIC_APPS_PRICE_USDT : 0);

  const discountMultiplier = appliedCoupon ? (100 - appliedCoupon.percentage) / 100 : 1;
  const finalCOP = appliedCoupon ? Math.round(baseCOP * discountMultiplier) : baseCOP;
  const finalUSDT = appliedCoupon ? Math.max(1, Math.round(baseUSDT * discountMultiplier)) : baseUSDT;

  const savingsCOP = baseCOP - finalCOP;
  const savingsUSDT = baseUSDT - finalUSDT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isAuthenticated) {
      setErrorMsg('Debes iniciar sesión con Google para tomar un turno oficial.');
      return;
    }

    if (!clientName.trim()) {
      setErrorMsg('Por favor indica tu nombre.');
      return;
    }

    if (!clientWhatsApp.trim()) {
      setErrorMsg('Por favor indica tu número de WhatsApp para poder coordinar la atención de tu turno.');
      return;
    }

    setLoading(true);

    try {
      const isBinance = selectedPaymentMethod === 'binance';
      const totalPrice = isBinance ? finalUSDT : finalCOP;
      const notesJson = JSON.stringify({
        payment_method: selectedPaymentMethod,
        usdt_price: finalUSDT,
        cop_price: finalCOP,
        ...(appliedCoupon && {
          discount_code: appliedCoupon.code,
          discount_percentage: appliedCoupon.percentage,
          original_cop_price: baseCOP,
          original_usdt_price: baseUSDT,
        }),
        ...(activeAffiliate && {
          referral_code: activeAffiliate.referral_code,
          affiliate_id: activeAffiliate.id,
          affiliate_name: activeAffiliate.user_name || activeAffiliate.referral_code,
        }),
      });

      const ticket = await createTicket({
        user_id: user?.id ?? null,
        user_email: user?.email ?? null,
        user_name: clientName || user?.user_metadata?.full_name || 'Cliente TV',
        user_avatar: user?.user_metadata?.avatar_url || null,
        tv_brand: selectedBrand,
        tv_model: tvModel.trim() || null,
        service_tier: selectedPlan.id,
        service_name: selectedPlan.name,
        has_magic_apps: hasMagicApps,
        total_price: totalPrice,
        client_whatsapp: clientWhatsApp.trim() || null,
        notes: notesJson,
      });

      if (appliedCoupon) {
        incrementCouponUsage(appliedCoupon.code).catch((err) =>
          console.error('Failed to increment coupon usage:', err)
        );
      }

      if (activeAffiliate && activeAffiliate.referral_code && ticket) {
        recordEstimatedCommission({
          referralCode: activeAffiliate.referral_code,
          ticketId: ticket.id,
          ticketNumber: ticket.ticket_number,
          serviceName: selectedPlan.name,
          currency: selectedPaymentMethod === 'binance' ? 'USDT' : 'COP',
          grossSalePrice: isBinance ? baseUSDT : baseCOP,
          discountAmount: isBinance ? savingsUSDT : savingsCOP,
        }).catch((err) =>
          console.error('Failed to record estimated commission:', err)
        );
      }

      setCreatedTicket(ticket);
      if (onTicketCreated) onTicketCreated(ticket);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('No se pudo generar el turno. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCreatedTicket(null);
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
    onClose();
  };

  const fieldClass = 'min-h-11 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-400';
  const labelClass = 'mb-2 block text-sm font-semibold text-slate-900 dark:text-slate-100';
  const choiceClass = (selected: boolean) => `min-h-14 rounded-xl border p-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 ${selected ? 'border-cyan-700 bg-cyan-50 text-slate-950 ring-1 ring-cyan-700 dark:border-cyan-400 dark:bg-cyan-950 dark:text-white dark:ring-cyan-400' : 'border-slate-300 bg-white text-slate-800 hover:border-slate-500 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-400'}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={createdTicket ? '¡Turno Asignado con Éxito!' : 'Tomar turno de optimización'}
      description={createdTicket ? 'Guarda tu ticket digital y envíanoslo por WhatsApp para iniciar la atención.' : 'Completa los datos de tu TV y elige cómo pagar. Al confirmar recibirás tu número de turno.'}
      maxWidth="lg"
      className="[&>div]:flex [&>div]:max-h-[calc(100dvh-3rem)] [&>div]:flex-col [&>div>div:last-child]:min-h-0 [&>div>div:last-child]:max-h-none [&>div>div:last-child]:overscroll-contain"
    >
      {createdTicket ? (
        <div className="pt-2">
          <TicketCard ticket={createdTicket} whatsappThreshold={whatsappThreshold} queuePosition={waitingTickets.findIndex((t) => t.id === createdTicket.id) !== -1 ? waitingTickets.findIndex((t) => t.id === createdTicket.id) + 1 : waitingTickets.length + 1} />
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm" onClick={handleReset}>Cerrar y volver a la web</Button>
          </div>
        </div>
      ) : !isAuthenticated ? (
        <div className="space-y-4 py-4 text-center text-sm leading-6 text-slate-700 dark:text-slate-200">
          <Lock aria-hidden="true" className="mx-auto h-7 w-7 text-slate-500 dark:text-slate-400" />
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">Inicia sesión con Google</h3>
          <p>Para registrar tu turno y seguir su estado, inicia sesión con tu cuenta de Google.</p>
          <Button type="button" variant="secondary" onClick={() => signInWithGoogle()} className="min-h-11 w-full">Continuar con Google</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 pt-1 text-sm leading-6 text-slate-700 dark:text-slate-200">
          {errorMsg && <p role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-rose-800 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-200">{errorMsg}</p>}

          <div className="flex items-start gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
            <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0" />
            <p className="min-w-0 break-words">Cuenta verificada: <strong className="font-semibold text-slate-950 dark:text-white">{user?.user_metadata?.full_name || user?.email}</strong></p>
          </div>

          <section aria-labelledby="ticket-device-title" className="space-y-3">
            <div>
              <h3 id="ticket-device-title" className={labelClass}>Tu dispositivo</h3>
              <p className="font-medium text-slate-900 dark:text-slate-100">Android TV o Google TV</p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">Compatible con TCL, Xiaomi, Sony, Chromecast, Onn y TV Box con estos sistemas.</p>
              <p role="note" className="mt-3 flex items-start gap-2 rounded-r-lg border-l-4 border-slate-600 bg-slate-100 p-3 text-slate-950 dark:border-slate-300 dark:bg-slate-800 dark:text-white">
                <AlertTriangle aria-hidden="true" className="mt-1 h-5 w-5 shrink-0" />
                <strong>No compatible con Samsung Tizen ni LG webOS.</strong>
              </p>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                <strong>Requisito indispensable:</strong> En tu televisor debes poder instalar la app <strong>Tailscale</strong> para enviar el código QR cuando sea tu turno. Si en tu TV no se puede instalar Tailscale, no se le podrá realizar el servicio.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ticket-client-name" className={labelClass}>Tu nombre<RequiredIndicator /></label>
                <input id="ticket-client-name" name="clientName" autoComplete="name" type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Ej. Carlos Mendoza" className={fieldClass} />
              </div>
              <div>
                <label htmlFor="ticket-client-whatsapp" className={labelClass}>Número de WhatsApp<RequiredIndicator /></label>
                <input id="ticket-client-whatsapp" name="clientWhatsApp" autoComplete="tel" type="tel" required value={clientWhatsApp} onChange={(e) => setClientWhatsApp(e.target.value)} placeholder="Ej. +57 300 123 4567" className={fieldClass} />
              </div>
            </div>
            <div>
              <label htmlFor="ticket-tv-model" className={labelClass}>Modelo / pulgadas <span className="font-normal text-slate-600 dark:text-slate-300">(opcional)</span></label>
              <input id="ticket-tv-model" name="tvModel" type="text" value={tvModel} onChange={(e) => setTvModel(e.target.value)} placeholder="Ej. TCL 55 / Xiaomi P1" className={fieldClass} />
            </div>
          </section>

          <fieldset>
            <legend className={labelClass}>Método de pago</legend>
            <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
              <button type="button" aria-pressed={selectedPaymentMethod === 'bre_b'} onClick={() => setSelectedPaymentMethod('bre_b')} className={choiceClass(selectedPaymentMethod === 'bre_b')}>
                <span className="flex items-center justify-between gap-2 font-semibold">Llave Bre-B {selectedPaymentMethod === 'bre_b' && <Check aria-hidden="true" className="h-4 w-4 shrink-0" />}</span>
                <span className="mt-1 block text-slate-600 dark:text-slate-300">Pesos (COP)</span>
              </button>
              <button type="button" aria-pressed={selectedPaymentMethod === 'binance'} onClick={() => setSelectedPaymentMethod('binance')} className={choiceClass(selectedPaymentMethod === 'binance')}>
                <span className="flex items-center justify-between gap-2 font-semibold">Binance (USDT) {selectedPaymentMethod === 'binance' && <Check aria-hidden="true" className="h-4 w-4 shrink-0" />}</span>
                <span className="mt-1 block text-slate-600 dark:text-slate-300">Red Tron (TRC20)</span>
              </button>
            </div>
          </fieldset>

          <fieldset>
            <legend className={labelClass}>Elige tu plan</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {SERVICE_PLANS.map((plan) => (
                <button type="button" key={plan.id} aria-pressed={selectedPlan.id === plan.id} onClick={() => setSelectedPlan(plan)} className={`${choiceClass(selectedPlan.id === plan.id)} flex flex-col justify-between gap-3`}>
                  <span className="flex w-full items-start justify-between gap-2 font-semibold">{plan.name}{selectedPlan.id === plan.id && <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0" />}</span>
                  <span className="text-base font-bold">{selectedPaymentMethod === 'binance' ? `${PLAN_USDT_PRICES[plan.id]} USDT` : formatCOP(plan.price)}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <label htmlFor="ticket-magic-apps" className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-300 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-950">
            <input id="ticket-magic-apps" type="checkbox" checked={hasMagicApps} onChange={(e) => setHasMagicApps(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-cyan-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-700 dark:accent-cyan-400" />
            <span>
              <span className="block font-semibold text-slate-950 dark:text-white">Añadir Apps Mágicas <span className="font-normal">(opcional)</span></span>
              <span className="block font-semibold">{selectedPaymentMethod === 'binance' ? '+7 USDT' : '+20.000 COP'}</span>
              <span className="mt-1 block text-slate-600 dark:text-slate-300">Instalación de apps de streaming libres de anuncios.</span>
            </span>
          </label>

          <details className="border-y border-slate-200 py-3 dark:border-slate-700">
            <summary className="cursor-pointer font-medium text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 dark:text-slate-100">Horario y atención: {hoursInfo.colombiaHours} (Colombia). Tienes 5 minutos para responder cuando llegue tu turno.</summary>
            <div className="mt-3 space-y-3 text-slate-600 dark:text-slate-300">
              {!hoursInfo.isSameAsColombia && <p>En tu país ({hoursInfo.userCity}): <strong>{hoursInfo.localHours}</strong>.</p>}
              {!hoursInfo.isOpen && <p><strong>Reserva anticipada activa:</strong> Puedes apartar tu turno ahora mismo y serás atendido a primera hora al abrir ({hoursInfo.localOpenTime} en tu hora local).</p>}
              <p><strong>Tolerancia de 5 minutos:</strong> Una vez reanudada la jornada o cuando llegue tu turno, tienes un tiempo de espera de <strong>5 minutos</strong> para responder y enviar tus documentos/fotos por WhatsApp. Si no se recibe respuesta en 5 minutos, el ticket se cancelará automáticamente para dar paso al siguiente en la fila.</p>
            </div>
          </details>

          <div>
            {activeAffiliate ? (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p>Recomendado por: <strong>{activeAffiliate.user_name || activeAffiliate.referral_code}</strong></p>
                <button type="button" onClick={handleRemoveReferral} className="min-h-11 underline underline-offset-4">Cambiar</button>
              </div>
            ) : !showManualReferralInput ? (
              <button type="button" onClick={() => setShowManualReferralInput(true)} className="min-h-11 text-left underline underline-offset-4">¿Llegas por recomendación de un asesor o amigo?</button>
            ) : (
              <div className="space-y-2">
                <label htmlFor="ticket-referral" className={labelClass}>Código de referido (opcional)</label>
                <div className="flex items-center gap-2">
                  <input id="ticket-referral" type="text" value={referralCodeInput} onChange={(e) => { setReferralCodeInput(e.target.value.toUpperCase()); setReferralError(null); }} placeholder="Ej. ANA8X2" className={fieldClass} aria-invalid={!!referralError} aria-describedby={referralError ? 'ticket-referral-error' : undefined} />
                  <Button type="button" variant="outline" size="sm" disabled={validatingReferral || !referralCodeInput.trim()} onClick={handleApplyReferral} className="min-h-11 shrink-0">{validatingReferral ? 'Validando...' : 'Asociar'}</Button>
                </div>
                <button type="button" onClick={() => setShowManualReferralInput(false)} className="min-h-11 underline underline-offset-4">Cerrar</button>
              </div>
            )}
            {referralError && <p id="ticket-referral-error" role="alert" className="text-rose-800 dark:text-rose-200">{referralError}</p>}
          </div>

          <details className="border-t border-slate-200 pt-3 dark:border-slate-700">
            <summary className="cursor-pointer font-medium text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 dark:text-slate-100">{appliedCoupon ? `Cupón aplicado: ${appliedCoupon.code} (${appliedCoupon.percentage}% de descuento)` : '¿Tienes un cupón de descuento? (opcional)'}</summary>
            <div className="mt-3">
              {!appliedCoupon ? (
                <div>
                  <label htmlFor="ticket-coupon" className={labelClass}>Código de descuento</label>
                  <div className="flex items-center gap-2">
                    <input id="ticket-coupon" type="text" value={couponCode} onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(null); }} placeholder="Ej. SMART20" className={fieldClass} aria-invalid={!!couponError} aria-describedby={couponError ? 'ticket-coupon-error' : undefined} />
                    <Button type="button" variant="outline" size="sm" disabled={validatingCoupon || !couponCode.trim()} onClick={handleApplyCoupon} className="min-h-11 shrink-0">{validatingCoupon ? 'Validando...' : 'Aplicar'}</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p><strong>{appliedCoupon.code}</strong>: {appliedCoupon.percentage}% de descuento aplicado.</p>
                  <button type="button" onClick={handleRemoveCoupon} className="min-h-11 underline underline-offset-4">Quitar</button>
                </div>
              )}
              {couponError && <p id="ticket-coupon-error" role="alert" className="mt-2 text-rose-800 dark:text-rose-200">{couponError}</p>}
            </div>
          </details>

          <div className="space-y-4 border-t border-slate-300 pt-5 dark:border-slate-600">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <span className="font-medium">Total a pagar ({selectedPaymentMethod === 'binance' ? 'Binance USDT' : 'Bre-B COP'})</span>
              <div className="flex flex-wrap items-baseline gap-2">
                {appliedCoupon && <span className="text-slate-500 line-through dark:text-slate-400">{selectedPaymentMethod === 'binance' ? `${baseUSDT} USDT` : formatCOP(baseCOP)}</span>}
                <span className="text-2xl font-bold text-slate-950 dark:text-white">{selectedPaymentMethod === 'binance' ? `${finalUSDT} USDT` : formatCOP(finalCOP)}</span>
              </div>
            </div>
            {appliedCoupon && <p>Ahorras {selectedPaymentMethod === 'binance' ? `${savingsUSDT} USDT` : formatCOP(savingsCOP)} con tu cupón.</p>}
            <button type="submit" disabled={loading || !clientName.trim() || !clientWhatsApp.trim()} className="min-h-12 w-full rounded-xl bg-cyan-700 px-4 py-3 text-base font-semibold text-white hover:bg-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-cyan-700 dark:hover:bg-cyan-800">
              {loading ? 'Asignando Turno...' : 'Confirmar y Asignar Turno'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
