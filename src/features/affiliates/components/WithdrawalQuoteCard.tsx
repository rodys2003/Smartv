import React from 'react';
import type { WithdrawalQuote } from '@/features/affiliates/services/affiliateFinanceService';
export function WithdrawalQuoteCard({ quote }: { quote: WithdrawalQuote }) {
  const cop = (amount: number) => `${Number(amount).toLocaleString('es-CO')} COP`;
  const usdt = (amount: number) => `${Number(amount).toFixed(2)} USDT`;
  return <div className="space-y-4 rounded-2xl border border-slate-300 bg-slate-50 p-4 text-sm leading-6 dark:border-slate-700 dark:bg-slate-950">
    <dl className="space-y-3">
      <div className="flex flex-wrap justify-between gap-2"><dt>Comisiones incluidas</dt><dd>{quote.commission_ids.length}</dd></div>
      <div className="flex flex-wrap justify-between gap-2"><dt>Comisiones en COP</dt><dd>{cop(quote.cop_amount)}</dd></div>
      <div className="flex flex-wrap justify-between gap-2"><dt>Comisiones en USDT</dt><dd>{usdt(quote.usdt_amount)}</dd></div>
      <div className="flex flex-wrap justify-between gap-2"><dt>Tasa de conversión</dt><dd>{quote.cop_per_usdt ? `1 USDT = ${cop(quote.cop_per_usdt)}` : 'Sin tasa configurada; COP no incluidos'}</dd></div>
      <div className="flex flex-wrap justify-between gap-2"><dt>Importe bruto</dt><dd>{usdt(quote.gross_usdt)}</dd></div>
      <div className="flex flex-wrap justify-between gap-2"><dt>Tarifa fija del programa</dt><dd>−{usdt(quote.fee_usdt)}</dd></div>
      <div className="flex flex-wrap justify-between gap-2 border-t border-slate-300 pt-3 text-lg font-bold dark:border-slate-700"><dt>Recibirás</dt><dd>{usdt(quote.net_usdt)}</dd></div>
      <div><dt className="font-semibold">Destino Binance UID</dt><dd className="break-all">{quote.binance_uid || 'Registra tu Binance UID en Cuenta de cobro'}</dd></div>
    </dl>
    <p>La tasa y el importe quedan congelados al solicitar el retiro. El administrador revisará tu solicitud y realizará la transferencia manualmente.</p>
    {!quote.eligible && <p className="font-semibold">Para solicitar el retiro necesitas al menos 5 USDT brutos disponibles y un Binance UID registrado.</p>}
  </div>;
}
