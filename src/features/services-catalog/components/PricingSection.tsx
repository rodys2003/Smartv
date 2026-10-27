'use client';

import React, { useState } from 'react';
import {
  SERVICE_PLANS,
  MAGIC_APPS_PRICE_COP,
  MAGIC_APPS_PRICE_USDT,
  PLAN_USDT_PRICES,
} from '../constants/plans';
import { ServicePlan } from '@/types';
import { ServiceCard } from './ServiceCard';
import { formatCOP } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  Sparkles,
  Wand2,
  ShieldAlert,
  Lock,
  ArrowRight,
  Globe,
  Coins,
  CreditCard,
} from 'lucide-react';

interface PricingSectionProps {
  isAuthenticated: boolean;
  onOpenAuthModal: () => void;
  onPlanChosen: (plan: ServicePlan, hasMagicApps: boolean, method?: 'bre_b' | 'binance') => void;
}

export function PricingSection({
  isAuthenticated,
  onOpenAuthModal,
  onPlanChosen,
}: PricingSectionProps) {
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan>(SERVICE_PLANS[1]); // Ultra-Light default
  const [hasMagicApps, setHasMagicApps] = useState<boolean>(true);
  const [currency, setCurrency] = useState<'COP' | 'USDT'>('COP');

  const isUSDT = currency === 'USDT';

  const calculateTotalCOP = () => {
    return selectedPlan.price + (hasMagicApps ? MAGIC_APPS_PRICE_COP : 0);
  };

  const calculateTotalUSDT = () => {
    const base = PLAN_USDT_PRICES[selectedPlan.id] ?? 17;
    return base + (hasMagicApps ? MAGIC_APPS_PRICE_USDT : 0);
  };

  const handleAction = () => {
    if (!isAuthenticated) {
      onOpenAuthModal();
      return;
    }
    onPlanChosen(selectedPlan, hasMagicApps, isUSDT ? 'binance' : 'bre_b');
  };

  return (
    <section id="planes" className="py-16 md:py-24 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Tarifas Claras & Sin Sorpresas</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Elige el nivel de poder para tu Smart TV
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-4 text-sm md:text-base leading-relaxed">
            Desde ajustes de rendimiento según tu equipo hasta personalización temática de la interfaz.
          </p>
        </div>

        {/* Global Customers Notice Banner */}
        <div className="max-w-2xl mx-auto mb-8 p-3.5 sm:p-4 rounded-2xl bg-amber-50/90 dark:bg-gradient-to-r dark:from-amber-500/10 dark:via-slate-900 dark:to-amber-500/10 border border-amber-300 dark:border-amber-400/30 text-center shadow-sm dark:shadow-[0_0_25px_rgba(251,191,36,0.12)]">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1">
            <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>¿No eres de Colombia? ¡No te preocupes!</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Atendemos de forma remota a cualquier país del mundo. Aceptamos pagos internacionales por <strong>Binance en USDT (Red Tron TRC20)</strong> y pagos nacionales por <strong>Llave Bre-B (COP)</strong>.
          </p>
        </div>

        {/* Currency & Payment Method Segmented Switcher */}
        <div className="flex items-center justify-center mb-10">
          <div className="bg-slate-100 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 shadow-sm dark:shadow-xl max-w-lg w-full">
            <button
              type="button"
              onClick={() => setCurrency('COP')}
              className={`flex-1 py-3 px-3.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                currency === 'COP'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/60'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>🇨🇴 Colombia (Pesos COP / Bre-B)</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrency('USDT')}
              className={`flex-1 py-3 px-3.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                currency === 'USDT'
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.35)] scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/60'
              }`}
            >
              <Coins className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>🌐 Internacional (Binance USDT)</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {SERVICE_PLANS.map((plan) => (
            <ServiceCard
              key={plan.id}
              plan={plan}
              currency={currency}
              isSelected={selectedPlan.id === plan.id}
              onSelect={(p) => setSelectedPlan(p)}
            />
          ))}
        </div>

        {/* Magic Apps Add-on Box */}
        <div className="mt-10 bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 border border-fuchsia-300 dark:border-fuchsia-500/30 rounded-3xl p-6 md:p-8 shadow-md dark:shadow-[0_0_30px_rgba(217,70,239,0.1)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-fuchsia-50 dark:bg-fuchsia-500/20 border border-fuchsia-200 dark:border-fuchsia-500/40 text-fuchsia-600 dark:text-fuchsia-400 shrink-0">
              <Wand2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                  Add-on: Instalación de aplicaciones compatibles
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-fuchsia-50 dark:bg-fuchsia-500/20 text-fuchsia-800 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-500/30 text-xs font-bold">
                  + {isUSDT ? `${MAGIC_APPS_PRICE_USDT} USDT` : formatCOP(MAGIC_APPS_PRICE_COP)}
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Asistencia para instalar y configurar aplicaciones de fuentes confiables. No incluye licencias, suscripciones ni acceso no autorizado a contenido de pago. La publicidad dentro de cada aplicación depende de su proveedor.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer shrink-0 bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-fuchsia-400/50 transition-colors">
            <input
              type="checkbox"
              checked={hasMagicApps}
              onChange={(e) => setHasMagicApps(e.target.checked)}
              className="w-5 h-5 rounded accent-fuchsia-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              {hasMagicApps
                ? 'Apps Mágicas Incluidas'
                : isUSDT
                ? 'Agregar Apps (+7 USDT)'
                : 'Agregar Apps (+20k COP)'}
            </span>
          </label>
        </div>

        {/* Selected Summary Bar */}
        <div
          className={`mt-8 bg-white dark:bg-slate-900/90 border rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm dark:shadow-none ${
            isUSDT ? 'border-amber-400/60' : 'border-cyan-500/40'
          }`}
        >
          <div className="text-center sm:text-left">
            <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              Tu selección actual ({isUSDT ? 'Tarifa en USDT Binance' : 'Tarifa en Pesos Colombianos'}):
            </p>
            <p className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
              <span>{selectedPlan.name}</span>
              {hasMagicApps && (
                <span className="text-xs text-fuchsia-600 dark:text-fuchsia-400 font-normal">
                  + Apps Mágicas ({isUSDT ? '+7 USDT' : '+20k'})
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Total a pagar:</span>
              <span
                className={`text-2xl font-black ${
                  isUSDT ? 'text-amber-500 dark:text-amber-400 font-mono' : 'text-cyan-600 dark:text-cyan-400'
                }`}
              >
                {isUSDT ? `${calculateTotalUSDT()} USDT` : formatCOP(calculateTotalCOP())}
              </span>
            </div>
            <Button
              variant={isUSDT ? 'whatsapp' : 'primary'}
              size="lg"
              onClick={handleAction}
              className="px-6 py-3 font-bold text-sm"
            >
              {isAuthenticated ? (
                <>
                  <span>Tomar Turno con este Plan</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-1.5" />
                  <span>Ingresar con Google para Turno</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          <span>Atención remota paso a paso 1 a 1 por WhatsApp solo para usuarios registrados. Pagas únicamente al conectar tu TV.</span>
        </div>
      </div>
    </section>
  );
}
