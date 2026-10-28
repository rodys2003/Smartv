'use client';

import React, { useEffect, useState } from 'react';
import { RequiredIndicator } from '@/components/ui/RequiredIndicator';
import { AffiliateCommission, AffiliatePayout } from '@/types/affiliate';
import { FinanceRate, getFinanceRate, setFinanceRate } from '@/features/affiliates/services/affiliateFinanceService';

export function AdminFinanceOverview({ commissions, payouts }: { commissions: AffiliateCommission[]; payouts: AffiliatePayout[] }) {
  const [asOf, setAsOf] = useState(() => Date.now());
  const [rate, setRate] = useState<FinanceRate | null>(null);
  const [draft, setDraft] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ error: boolean; text: string } | null>(null);
  useEffect(() => {
    let active = true;
    getFinanceRate().then(value => { if (active) { setRate(value); setDraft(value.cop_per_usdt ? String(value.cop_per_usdt) : ''); } }).catch(error => { if (active) setFeedback({ error: true, text: error instanceof Error ? error.message : 'No se pudo cargar la tasa. Actualiza la página.' }); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    const timer = setInterval(() => setAsOf(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    const value = Number(draft);
    if (!Number.isFinite(value) || value <= 0) {
      setFeedback({ error: true, text: 'La tasa debe ser un número mayor que cero.' });
      return;
    }
    if (busy) return;
    setBusy(true); setFeedback(null);
    try { const updated = await setFinanceRate(value, reason.trim() || undefined); setRate(updated); setDraft(String(updated.cop_per_usdt)); setReason(''); setFeedback({ error: false, text: 'Tasa actualizada. Los retiros anteriores conservan sus importes.' }); }
    catch (error) { setFeedback({ error: true, text: error instanceof Error ? error.message : 'No se pudo guardar la tasa. Revisa el valor e inténtalo de nuevo.' }); }
    finally { setBusy(false); }
  }
  const reserved = payouts.filter(p => p.status === 'pending' || p.status === 'processing');
  const paid = payouts.filter(p => p.status === 'completed');
  const available = commissions.filter(c => !c.payout_id && !c.requires_reconciliation && (c.status === 'available' || c.status === 'validating') && !!c.ticket_paid_at && new Date(c.ticket_paid_at).getTime() + 7 * 86400000 <= asOf);
  const availableCop = available.filter(c => c.currency === 'COP').reduce((sum, c) => sum + Number(c.commission_amount), 0);
  const availableUsdt = available.filter(c => c.currency === 'USDT').reduce((sum, c) => sum + Number(c.commission_amount), 0);
  return <div className="space-y-7">
    <div className="grid gap-5 border-y border-slate-200 py-5 sm:grid-cols-3 dark:border-slate-700">
      <div>
        <h4 className="text-sm text-slate-600 dark:text-slate-300">Comisiones disponibles sin reservar</h4>
        <p className="mt-2 font-bold tabular-nums">{availableCop.toLocaleString('es-CO')} COP + {availableUsdt.toFixed(2)} USDT</p>
        <p className="mt-1 text-xs text-slate-500">El servidor valida las condiciones al solicitar el retiro.</p>
      </div>
      <div>
        <h4 className="text-sm text-slate-600 dark:text-slate-300">Reservado para retiros</h4>
        <p className="mt-2 text-xl font-bold tabular-nums">{reserved.reduce((sum, p) => sum + Number(p.gross_amount_usdt), 0).toFixed(2)} USDT</p>
        <p className="mt-1 text-xs text-slate-500">{reserved.length} solicitudes pendientes o en proceso · importe bruto</p>
      </div>
      <div>
        <h4 className="text-sm text-slate-600 dark:text-slate-300">Transferido a afiliados</h4>
        <p className="mt-2 text-xl font-bold tabular-nums">{paid.reduce((sum, p) => sum + Number(p.net_amount_usdt), 0).toFixed(2)} USDT</p>
        <p className="mt-1 text-xs text-slate-500">Importe neto de retiros pagados</p>
      </div>
    </div>
    <section aria-labelledby="finance-rate-heading" className="max-w-2xl space-y-3">
      <h4 id="finance-rate-heading" className="text-lg font-bold">Tasa del programa</h4>
      <p className="text-sm">{rate?.cop_per_usdt ? `Tasa actual: 1 USDT = ${rate.cop_per_usdt} COP` : 'Sin tasa configurada: las comisiones COP no se pueden retirar.'}</p>
      {rate?.updated_at && <p className="text-sm text-slate-600 dark:text-slate-300">Última actualización: {new Date(rate.updated_at).toLocaleString('es-CO')} · Versión {rate.version}</p>}
      <form id="finance-rate-form" onSubmit={save} className="space-y-4">
        <label htmlFor="finance-rate" className="block text-sm font-semibold">COP por 1 USDT<RequiredIndicator />
          <input id="finance-rate" required type="number" min="0.000001" step="any" inputMode="decimal" value={draft} onChange={event => setDraft(event.target.value)} className="mt-1 block min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base focus:outline-2 focus:outline-cyan-600 dark:border-slate-600 dark:bg-slate-950" />
        </label>
        <label htmlFor="finance-rate-reason" className="block text-sm font-semibold">Motivo del cambio (opcional)<input id="finance-rate-reason" value={reason} onChange={event => setReason(event.target.value)} className="mt-1 block min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base focus:outline-2 focus:outline-cyan-600 dark:border-slate-600 dark:bg-slate-950" />
        </label>
        <p className="text-sm text-slate-600 dark:text-slate-300">La nueva tasa se usa en próximas solicitudes. No modifica retiros pendientes ni históricos. Tarifa fija: 2 USDT por retiro. Mínimo bruto: 5 USDT.</p>
        <button type="submit" disabled={busy || !rate} className="min-h-11 rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 disabled:opacity-50">{busy ? 'Guardando…' : 'Guardar tasa'}</button>
      </form>
      {feedback && <p role={feedback.error ? 'alert' : 'status'} className={feedback.error ? 'text-sm text-red-700 dark:text-red-300' : 'text-sm text-slate-700 dark:text-slate-200'}>{feedback.text}</p>}
    </section>
  </div>;
}
