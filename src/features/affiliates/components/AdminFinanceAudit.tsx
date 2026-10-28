'use client';

import React, { useEffect, useState } from 'react';
import { FinanceAudit, getFinanceAudit } from '@/features/affiliates/services/affiliateFinanceService';

export function AdminFinanceAudit() {
  const [entries, setEntries] = useState<FinanceAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    getFinanceAudit().then(rows => { if (active) setEntries(rows); }).catch(value => { if (active) setError(value instanceof Error ? value.message : 'No se pudo cargar el historial. Actualiza la página.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return <section aria-labelledby="finance-audit-heading" className="space-y-4">
    <h4 id="finance-audit-heading" className="text-lg font-bold">Historial financiero</h4>
    <p className="text-sm text-slate-600 dark:text-slate-300">Registro de solo lectura: cambios de tasa, comisiones y retiros con su responsable y fecha. Las correcciones se registran; no se borra el historial.</p>
    {loading && <p role="status">Cargando historial…</p>}{error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
    {!loading && !error && !entries.length && <p className="text-sm text-slate-500">No hay movimientos registrados.</p>}
    <ol className="divide-y divide-slate-200 dark:divide-slate-700">{entries.map(entry => <li key={entry.id} className="space-y-2 py-4 text-sm">
      <p className="font-semibold">{entry.action}</p>
      <p className="text-slate-600 dark:text-slate-300">{new Date(entry.created_at).toLocaleString('es-CO')}</p>
      <p className="break-all">Responsable: {entry.actor_id || 'Sistema'} · Operación: {entry.entity_id || 'Configuración'}</p>
      <pre className="whitespace-pre-wrap break-all rounded-xl bg-slate-50 p-3 text-xs text-slate-700 dark:bg-slate-950 dark:text-slate-200">{JSON.stringify(entry.details, null, 2)}</pre>
    </li>)}</ol>
  </section>;
}
