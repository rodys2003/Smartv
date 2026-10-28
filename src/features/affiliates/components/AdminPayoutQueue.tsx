'use client';

import React, { useState } from 'react';
import { RequiredIndicator } from '@/components/ui/RequiredIndicator';
import { Affiliate, AffiliatePayout } from '@/types/affiliate';
import { completePayoutAdmin, rejectPayoutAdmin } from '@/features/affiliates/services/affiliateService';
import { markPayoutProcessing } from '@/features/affiliates/services/affiliateFinanceService';

const statusLabels = { pending: 'Pendiente', processing: 'En proceso', completed: 'Pagado', rejected: 'Rechazado' };
const inputClass = 'mt-1 block min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 focus:outline-2 focus:outline-cyan-600 dark:border-slate-600 dark:bg-slate-950 dark:text-white';
const buttonClass = 'min-h-11 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 disabled:opacity-50 dark:border-slate-600';
const amount = (value: number) => `${Number(value).toFixed(2)} USDT`;

export function AdminPayoutQueue({ payouts, affiliates, onChanged }: { payouts: AffiliatePayout[]; affiliates: Affiliate[]; onChanged: () => Promise<void> }) {
  const [selected, setSelected] = useState<AffiliatePayout | null>(null);
  const [reference, setReference] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ error: boolean; text: string } | null>(null);
  const pending = payouts.filter(p => p.status === 'pending' || p.status === 'processing');
  const history = payouts.filter(p => p.status === 'completed' || p.status === 'rejected');

  async function act(action: 'processing' | 'completed' | 'rejected') {
    if (!selected || busy || selected.status === 'completed' || selected.status === 'rejected') return;
    if (action === 'completed' && (selected.status !== 'processing' || !reference.trim())) return;
    if (action === 'rejected' && !reason.trim()) return;
    setBusy(true); setFeedback(null);
    try {
      if (action === 'processing') await markPayoutProcessing(selected.id);
      if (action === 'completed' && !await completePayoutAdmin({ payoutId: selected.id, binanceTxReference: reference.trim() })) throw new Error('No se pudo registrar la transferencia. Actualiza y revisa el retiro antes de volver a intentarlo.');
      if (action === 'rejected' && !await rejectPayoutAdmin(selected.id, reason.trim())) throw new Error('No se pudo rechazar el retiro. Revisa su estado y vuelve a intentarlo.');
      setSelected({ ...selected, status: action, ...(action === 'completed' ? { binance_tx_reference: reference.trim() } : {}), ...(action === 'rejected' ? { rejected_reason: reason.trim() } : {}) });
      setFeedback({ error: false, text: 'Retiro actualizado.' });
      await onChanged();
    } catch (error) {
      setFeedback({ error: true, text: error instanceof Error ? error.message : 'No se pudo actualizar el retiro. Revisa su estado antes de repetir la operación.' });
    } finally { setBusy(false); }
  }
  async function copyUid() {
    if (!selected) return;
    try { await navigator.clipboard.writeText(selected.binance_uid); setFeedback({ error: false, text: 'Binance UID copiado.' }); }
    catch { setFeedback({ error: true, text: 'No se pudo copiar el UID. Selecciónalo y cópialo manualmente.' }); }
  }
  function rows(items: AffiliatePayout[]) {
    return items.map(p => {
      const affiliate = affiliates.find(a => a.id === p.affiliate_id);
      return <li key={p.id} className="flex flex-col gap-3 border-b border-slate-200 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
        <div className="min-w-0 space-y-1">
          <p className="break-words font-semibold">{affiliate?.user_name || affiliate?.user_email || p.affiliate_id}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">{statusLabels[p.status]} · {new Date(p.created_at).toLocaleString('es-CO')}</p>
          <p className="text-sm">Neto: <strong>{amount(p.net_amount_usdt)}</strong>
          </p>
        </div>
        <button type="button" aria-label={`Revisar retiro ${p.id}`} className={buttonClass} onClick={() => { setSelected(p); setReference(''); setReason(''); setFeedback(null); }}>Ver detalle</button>
      </li>;
    });
  }
  const editable = selected?.status === 'pending' || selected?.status === 'processing';
  return <div className="space-y-6">
    <section aria-labelledby="withdrawals-queue-heading">
      <h4 id="withdrawals-queue-heading" className="text-lg font-bold">Retiros solicitados ({pending.length})</h4>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Las transferencias se realizan manualmente en Binance, fuera de esta aplicación.</p>{pending.length ? <ul>{rows(pending)}</ul> : <p className="py-5 text-sm text-slate-500">No hay solicitudes pendientes ni en proceso.</p>}</section>
    {selected && <section aria-labelledby="withdrawal-detail-heading" className="space-y-5 rounded-2xl border border-slate-300 bg-slate-50 p-4 sm:p-6 dark:border-slate-600 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-4">
        <h4 id="withdrawal-detail-heading" className="text-lg font-bold">Detalle del retiro</h4>
        <button type="button" className={buttonClass} disabled={busy} onClick={() => { setSelected(null); setFeedback(null); }}>Cerrar detalle</button>
      </div>
      <p className="break-all text-sm text-slate-600 dark:text-slate-300">Solicitud: {selected.id} · {statusLabels[selected.status]}</p>
      <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-600 dark:text-slate-300">Binance UID confirmado al solicitar</dt>
          <dd className="mt-1 break-all font-semibold">{selected.binance_uid}</dd>
          <button type="button" aria-label="Copiar Binance UID" className={`${buttonClass} mt-2`} onClick={copyUid}>Copiar UID</button>
        </div>
        <div>
          <dt className="text-slate-600 dark:text-slate-300">Tasa congelada</dt>
          <dd className="mt-1 font-semibold">{selected.cop_to_usdt_rate ? `1 USDT = ${selected.cop_to_usdt_rate} COP` : 'Solo comisiones USDT'}</dd>{!!selected.cop_total_original && <p className="mt-1">Comisiones: {Number(selected.cop_total_original).toLocaleString('es-CO')} COP</p>}</div>
        <div>
          <dt className="text-slate-600 dark:text-slate-300">Importe bruto</dt>
          <dd className="mt-1 font-semibold">{amount(selected.gross_amount_usdt)}</dd>
        </div>
        <div>
          <dt className="text-slate-600 dark:text-slate-300">Tarifa fija</dt>
          <dd className="mt-1 font-semibold">{amount(selected.withdrawal_fee_usdt)}</dd>
        </div>
        <div className="border-t border-slate-300 pt-3 sm:col-span-2 dark:border-slate-600">
          <dt>Neto a transferir</dt>
          <dd className="mt-1 text-2xl font-bold tabular-nums">{amount(selected.net_amount_usdt)}</dd>
        </div>
      </dl>
      <p className="text-sm text-slate-600 dark:text-slate-300">Estos importes y el destino no cambian al actualizar la tasa del programa.</p>
      {selected.binance_tx_reference && <p className="break-all text-sm">Referencia Binance: <strong>{selected.binance_tx_reference}</strong>
      </p>}
      {selected.rejected_reason && <p className="break-words text-sm">Motivo del rechazo: {selected.rejected_reason}</p>}
      {editable && <div className="space-y-5 border-t border-slate-300 pt-5 dark:border-slate-600">
        {selected.status === 'pending' && <button type="button" className={buttonClass} disabled={busy} onClick={() => act('processing')}>Marcar en proceso</button>}
        <p className="text-sm font-medium">Si no sabes si Binance realizó la transferencia, concilia primero la operación. No vuelvas a enviarla ni rechaces el retiro hasta confirmarlo.</p>
        <form id="complete-withdrawal" onSubmit={event => {
          event.preventDefault();
          return act('completed');
        }} className="space-y-3">
          <label htmlFor="withdrawal-reference" className="block text-sm font-semibold">Referencia de transferencia Binance<RequiredIndicator />
            <input id="withdrawal-reference" required type="text" autoComplete="off" value={reference} disabled={busy || selected.status !== 'processing'} onChange={event => setReference(event.target.value)} className={inputClass} />
          </label>
          <p className="text-sm text-slate-600 dark:text-slate-300">Marca el retiro en proceso y registra la referencia solo después de enviar y verificar el importe exacto en Binance.</p>
          <button type="submit" className={`${buttonClass} bg-cyan-700 text-white`} disabled={busy || selected.status !== 'processing' || !reference.trim()}>Registrar transferencia</button>
        </form>
        <form id="reject-withdrawal" onSubmit={event => {
          event.preventDefault();
          return act('rejected');
        }} className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
          <label htmlFor="withdrawal-reason" className="block text-sm font-semibold">Motivo del rechazo<RequiredIndicator />
            <textarea id="withdrawal-reason" required value={reason} disabled={busy} onChange={event => setReason(event.target.value)} className={`${inputClass} py-2`} />
          </label>
          <p className="text-sm text-slate-600 dark:text-slate-300">Rechaza únicamente si no hubo transferencia. Las comisiones reservadas vuelven al saldo del afiliado.</p>
          <button type="submit" className={buttonClass} disabled={busy || !reason.trim()}>Rechazar solicitud</button>
        </form>
      </div>}
    </section>}
    {feedback && <p role={feedback.error ? 'alert' : 'status'} className={feedback.error ? 'rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200' : 'text-sm text-slate-700 dark:text-slate-200'}>{feedback.text}</p>}
    <section aria-labelledby="withdrawals-history-heading">
      <h4 id="withdrawals-history-heading" className="text-lg font-bold">Historial de retiros ({history.length})</h4>{history.length ? <ul>{rows(history)}</ul> : <p className="py-5 text-sm text-slate-500">Todavía no hay retiros pagados ni rechazados.</p>}</section>
  </div>;
}
