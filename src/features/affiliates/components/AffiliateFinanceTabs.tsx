'use client';
import React from 'react';
export type AffiliateFinanceTab = 'summary' | 'sales' | 'withdrawals' | 'account';
const tabs: { id: AffiliateFinanceTab; label: string }[] = [
  { id: 'summary', label: 'Resumen' }, { id: 'sales', label: 'Mis ventas' },
  { id: 'withdrawals', label: 'Retiros' }, { id: 'account', label: 'Cuenta de cobro' },
];
export function AffiliateFinanceTabs({ value, onChange }: { value: AffiliateFinanceTab; onChange: (tab: AffiliateFinanceTab) => void }) {
  return <nav aria-label="Panel de afiliados" className="grid grid-cols-2 gap-2 border-b border-slate-200 pb-4 sm:grid-cols-4 dark:border-slate-700">
    {tabs.map(tab => <button key={tab.id} type="button" aria-current={value === tab.id ? 'page' : undefined} aria-controls="affiliate-finance-content" onClick={() => onChange(tab.id)} className={`min-h-11 rounded-xl px-3 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 ${value === tab.id ? 'bg-cyan-700 text-white dark:bg-cyan-300 dark:text-slate-950' : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'}`}>{tab.label}</button>)}
  </nav>;
}
