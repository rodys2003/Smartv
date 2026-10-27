'use client';

import React from 'react';
import Image from 'next/image';
import { ServicePlan } from '@/types';
import { formatCOP } from '@/lib/utils';
import { PLAN_USDT_PRICES } from '../constants/plans';
import { Button } from '@/components/ui/Button';
import { Check, Sparkles, Zap, Tv } from 'lucide-react';

interface ServiceCardProps {
  plan: ServicePlan;
  isSelected?: boolean;
  currency?: 'COP' | 'USDT';
  onSelect: (plan: ServicePlan) => void;
}

export function ServiceCard({ plan, isSelected, currency = 'COP', onSelect }: ServiceCardProps) {
  const isCustomPro = plan.id === 'custom_pro_70k';
  const isUltraLight = plan.id === 'ultra_light_50k';
  const isUSDT = currency === 'USDT';

  return (
    <div
      className={`relative rounded-3xl p-6 md:p-7 flex flex-col justify-between transition-all duration-300 border ${
        isSelected
          ? isUSDT
            ? 'bg-white dark:bg-slate-900/90 border-amber-400 shadow-lg dark:shadow-[0_0_35px_rgba(251,191,36,0.35)] scale-[1.02]'
            : 'bg-white dark:bg-slate-900/90 border-cyan-500 dark:border-cyan-400 shadow-lg dark:shadow-[0_0_35px_rgba(6,182,212,0.35)] scale-[1.02]'
          : isUltraLight
          ? 'bg-white dark:bg-slate-900/70 border-cyan-300 dark:border-cyan-500/40 shadow-sm dark:shadow-[0_0_25px_rgba(6,182,212,0.15)] hover:border-cyan-500 dark:hover:border-cyan-400/80 hover:scale-[1.01]'
          : isCustomPro
          ? 'bg-white dark:bg-slate-900/70 border-fuchsia-300 dark:border-fuchsia-500/40 shadow-sm dark:shadow-[0_0_25px_rgba(217,70,239,0.15)] hover:border-fuchsia-500 dark:hover:border-fuchsia-400/80 hover:scale-[1.01]'
          : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 hover:scale-[1.01]'
      }`}
    >
      {/* Popular or PRO Badge */}
      {plan.badge && (
        <div className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold tracking-wide shadow-sm ${
            isCustomPro
              ? 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300 dark:bg-fuchsia-950 dark:text-fuchsia-100 dark:border-fuchsia-400'
              : 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950 dark:text-cyan-100 dark:border-cyan-400'
          }`}>
            {plan.badge}
          </span>
        </div>
      )}

      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-cyan-600 dark:text-cyan-400">
            {isCustomPro ? (
              <Sparkles className="w-5 h-5 text-fuchsia-500 dark:text-fuchsia-400" />
            ) : isUltraLight ? (
              <Zap className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
            ) : (
              <Tv className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            )}
          </div>
          <span className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-200 font-semibold text-right leading-relaxed">
            {plan.tagline}
          </span>
        </div>

        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {plan.name}
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
          {plan.description}
        </p>

        {/* Preview image if available */}
        {plan.previewImage && (
          <div className="my-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/60 relative aspect-video group">
            <Image
              src={isCustomPro ? "/images/itachi-theme-optimized.webp" : isUltraLight ? "/images/minimal-theme-optimized.webp" : plan.previewImage}
              alt={plan.name}
              fill
              sizes="(max-width: 768px) 100vw, 360px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-300 bg-slate-900/80 px-2 py-0.5 rounded-md border border-cyan-500/30">
                {isCustomPro ? 'Fondo Temático Personalizado' : 'Interfaz Minimalista Ligera'}
              </span>
            </div>
          </div>
        )}

        {/* Price */}
        <div className="my-5 flex items-baseline gap-1.5">
          <span
            className={`text-3xl md:text-4xl font-extrabold tracking-tight ${
              isUSDT ? 'text-amber-500 dark:text-amber-400 font-mono' : 'text-slate-900 dark:text-white'
            }`}
          >
            {isUSDT ? `${PLAN_USDT_PRICES[plan.id]} USDT` : formatCOP(plan.price)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">/ pago único</span>
        </div>

        {/* Feature List */}
        <ul className="space-y-2.5 mb-6 text-xs text-slate-700 dark:text-slate-300">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <div
                className={`p-0.5 rounded-full mt-0.5 shrink-0 ${
                  isCustomPro
                    ? 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/20 dark:text-fuchsia-400'
                    : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="leading-snug">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button
        variant={isSelected ? (isUSDT ? 'whatsapp' : 'accent') : isCustomPro ? 'accent' : 'primary'}
        onClick={() => onSelect(plan)}
        className="w-full py-3 text-sm font-bold mt-auto"
      >
        {isSelected ? '✓ Plan Seleccionado' : 'Elegir este Plan'}
      </Button>
    </div>
  );
}
