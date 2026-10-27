'use client';

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
import { formatCOP, formatTicketNumber, parseTicketPaymentInfo } from '@/lib/utils';
import { updateTicketPlan } from '../services/ticketService';
import { Sparkles, Tv, Check, AlertCircle, CreditCard, Coins, CheckCircle2 } from 'lucide-react';

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  onPlanUpdated: (updatedTicket: Ticket) => void;
}

export function EditPlanModal({
  isOpen,
  onClose,
  ticket,
  onPlanUpdated,
}: EditPlanModalProps) {
  const initialPaymentInfo = parseTicketPaymentInfo(ticket);

  const [selectedPlan, setSelectedPlan] = useState<ServicePlan>(() => {
    const found = SERVICE_PLANS.find((p) => p.id === ticket.service_tier);
    return found || SERVICE_PLANS[1];
  });
  const [hasMagicApps, setHasMagicApps] = useState<boolean>(ticket.has_magic_apps);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'bre_b' | 'binance'>(
    initialPaymentInfo.method
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (ticket && isOpen) {
      const found = SERVICE_PLANS.find((p) => p.id === ticket.service_tier);
      if (found) setSelectedPlan(found);
      setHasMagicApps(ticket.has_magic_apps);
      const parsed = parseTicketPaymentInfo(ticket);
      setSelectedPaymentMethod(parsed.method);
    }
  }, [ticket, isOpen]);

  // Extract discount if ticket already had one applied
  let appliedDiscount: { code: string; percentage: number } | null = null;
  if (ticket.notes?.startsWith('{')) {
    try {
      const parsed = JSON.parse(ticket.notes);
      if (parsed.discount_code && parsed.discount_percentage) {
        appliedDiscount = {
          code: parsed.discount_code,
          percentage: parsed.discount_percentage,
        };
      }
    } catch {
      // ignore
    }
  }

  const baseCOP = selectedPlan.price + (hasMagicApps ? MAGIC_APPS_PRICE_COP : 0);
  const baseUSDT = (PLAN_USDT_PRICES[selectedPlan.id] ?? 17) + (hasMagicApps ? MAGIC_APPS_PRICE_USDT : 0);

  const discountMultiplier = appliedDiscount ? (100 - appliedDiscount.percentage) / 100 : 1;
  const finalCOP = appliedDiscount ? Math.round(baseCOP * discountMultiplier) : baseCOP;
  const finalUSDT = appliedDiscount ? Math.max(1, Math.round(baseUSDT * discountMultiplier)) : baseUSDT;

  const calculateTotalCOP = () => finalCOP;
  const calculateTotalUSDT = () => finalUSDT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const isBinance = selectedPaymentMethod === 'binance';
      const totalPrice = isBinance ? finalUSDT : finalCOP;
      const notesJson = JSON.stringify({
        payment_method: selectedPaymentMethod,
        usdt_price: finalUSDT,
        cop_price: finalCOP,
        ...(appliedDiscount && {
          discount_code: appliedDiscount.code,
          discount_percentage: appliedDiscount.percentage,
          original_cop_price: baseCOP,
          original_usdt_price: baseUSDT,
        }),
      });

      const updated = await updateTicketPlan(ticket.id, {
        service_tier: selectedPlan.id,
        service_name: selectedPlan.name,
        has_magic_apps: hasMagicApps,
        total_price: totalPrice,
        notes: notesJson,
      });

      if (!updated) {
        setErrorMsg('No se pudo actualizar el plan del ticket. Intenta de nuevo.');
        setLoading(false);
        return;
      }

      onPlanUpdated(updated);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg('Ocurrió un error inesperado al actualizar el ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modificar Plan del Ticket"
      description={`Turno ${formatTicketNumber(ticket.ticket_number)} · Conservarás tu posición actual en la fila de atención.`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Current ticket info badge */}
        <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-xs text-cyan-800 dark:text-cyan-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span>
              Dispositivo: <strong>{ticket.tv_brand} {ticket.tv_model ? `(${ticket.tv_model})` : ''}</strong>
            </span>
          </div>
          <span className="font-mono font-bold text-slate-900 dark:text-white">
            {formatTicketNumber(ticket.ticket_number)}
          </span>
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
            Método de Pago:
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedPaymentMethod('bre_b')}
              className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                selectedPaymentMethod === 'bre_b'
                  ? 'bg-cyan-50 dark:bg-cyan-500/20 border-cyan-500 dark:border-cyan-400 text-slate-900 dark:text-white shadow-sm dark:shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <CreditCard className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <div>
                <span className="text-xs font-bold block text-slate-900 dark:text-white">🇨🇴 Llave Bre-B</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">En Pesos (COP)</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPaymentMethod('binance')}
              className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                selectedPaymentMethod === 'binance'
                  ? 'bg-amber-50 dark:bg-amber-400/20 border-amber-500 dark:border-amber-400 text-slate-900 dark:text-white shadow-sm dark:shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <Coins className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
              <div>
                <span className="text-xs font-bold block text-slate-900 dark:text-white">🌐 Binance (USDT)</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Red Tron (TRC20)</span>
              </div>
            </button>
          </div>
        </div>

        {/* Plan selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
            Selecciona el Nuevo Plan:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {SERVICE_PLANS.map((plan) => {
              const isBinance = selectedPaymentMethod === 'binance';
              const priceFormatted = isBinance
                ? `${PLAN_USDT_PRICES[plan.id]} USDT`
                : formatCOP(plan.price);

              return (
                <button
                  type="button"
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    selectedPlan.id === plan.id
                      ? isBinance
                        ? 'bg-amber-50 dark:bg-amber-400/20 border-amber-500 dark:border-amber-400 shadow-sm dark:shadow-[0_0_15px_rgba(251,191,36,0.25)]'
                        : 'bg-cyan-50 dark:bg-cyan-500/20 border-cyan-500 dark:border-cyan-400 shadow-sm dark:shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {plan.name}
                  </span>
                  <span
                    className={`text-sm font-black mt-2 block ${
                      isBinance ? 'text-amber-700 dark:text-amber-300 font-mono' : 'text-cyan-700 dark:text-cyan-300'
                    }`}
                  >
                    {priceFormatted}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Magic apps add-on checkbox */}
        <div className="bg-fuchsia-50 dark:bg-fuchsia-950/20 border border-fuchsia-200 dark:border-fuchsia-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-fuchsia-600 dark:text-fuchsia-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-slate-900 dark:text-white block">
                Add-on Apps Mágicas ({selectedPaymentMethod === 'binance' ? '+7 USDT' : '+20.000 COP'})
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                Instalación de apps de streaming libres de anuncios.
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={hasMagicApps}
            onChange={(e) => setHasMagicApps(e.target.checked)}
            className="w-4 h-4 accent-fuchsia-500 cursor-pointer"
          />
        </div>

        {/* Price & Submit Button */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block font-bold">
                Nuevo Total a pagar:
              </span>
              {appliedDiscount && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  ({appliedDiscount.code} -{appliedDiscount.percentage}%)
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              {appliedDiscount && (
                <span className="text-sm line-through text-slate-400 font-semibold font-mono">
                  {selectedPaymentMethod === 'binance' ? `${baseUSDT} USDT` : formatCOP(baseCOP)}
                </span>
              )}
              <span
                className={`text-2xl font-black ${
                  appliedDiscount
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : selectedPaymentMethod === 'binance'
                    ? 'text-amber-600 dark:text-amber-400 font-mono'
                    : 'text-cyan-600 dark:text-cyan-400'
                }`}
              >
                {selectedPaymentMethod === 'binance'
                  ? `${calculateTotalUSDT()} USDT`
                  : formatCOP(calculateTotalCOP())}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onClose}
              disabled={loading}
              className="text-xs text-slate-500 dark:text-slate-400"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="px-6 py-3 font-bold text-sm"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
