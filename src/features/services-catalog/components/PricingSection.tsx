'use client';

import React, { useState } from 'react';
import { SERVICE_PLANS, MAGIC_APPS_PRICE } from '../constants/plans';
import { ServicePlan } from '@/types';
import { ServiceCard } from './ServiceCard';
import { formatCOP } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Sparkles, Wand2, ShieldAlert, Lock, ArrowRight } from 'lucide-react';

interface PricingSectionProps {
  isAuthenticated: boolean;
  onOpenAuthModal: () => void;
  onPlanChosen: (plan: ServicePlan, hasMagicApps: boolean) => void;
}

export function PricingSection({
  isAuthenticated,
  onOpenAuthModal,
  onPlanChosen,
}: PricingSectionProps) {
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan>(SERVICE_PLANS[1]); // Ultra-Light default
  const [hasMagicApps, setHasMagicApps] = useState<boolean>(true);

  const calculateTotal = () => {
    return selectedPlan.price + (hasMagicApps ? MAGIC_APPS_PRICE : 0);
  };

  const handleAction = () => {
    if (!isAuthenticated) {
      onOpenAuthModal();
      return;
    }
    onPlanChosen(selectedPlan, hasMagicApps);
  };

  return (
    <section id="planes" className="py-16 md:py-24 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tarifas Claras & Sin Sorpresas</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Elige el nivel de poder para tu Smart TV
          </h2>
          <p className="text-slate-400 mt-4 text-sm md:text-base leading-relaxed">
            Desde la optimización básica para eliminar el lag hasta personalización temática completa estilo consola gamer.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {SERVICE_PLANS.map((plan) => (
            <ServiceCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan.id === plan.id}
              onSelect={(p) => setSelectedPlan(p)}
            />
          ))}
        </div>

        {/* Magic Apps Add-on Box */}
        <div className="mt-10 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-fuchsia-500/30 rounded-3xl p-6 md:p-8 shadow-[0_0_30px_rgba(217,70,239,0.1)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-400 shrink-0">
              <Wand2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg md:text-xl font-bold text-white">
                  Add-on: Instalación de Apps Mágicas
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 text-xs font-bold">
                  + {formatCOP(MAGIC_APPS_PRICE)}
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Instalamos y configuramos reproductores premium de streaming, utilidades sin anuncios publicitarios, reproductores IPTV optimizados y exploradores de archivos desbloqueados.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer shrink-0 bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700 hover:border-fuchsia-400/50 transition-colors">
            <input
              type="checkbox"
              checked={hasMagicApps}
              onChange={(e) => setHasMagicApps(e.target.checked)}
              className="w-5 h-5 rounded accent-fuchsia-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {hasMagicApps ? 'Apps Mágicas Incluidas' : 'Agregar Apps (+20k)'}
            </span>
          </label>
        </div>

        {/* Selected Summary Bar */}
        <div className="mt-8 bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Tu selección actual:
            </p>
            <p className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
              <span>{selectedPlan.name}</span>
              {hasMagicApps && (
                <span className="text-xs text-fuchsia-400 font-normal">
                  + Apps Mágicas
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total a pagar:</span>
              <span className="text-2xl font-black text-cyan-400">
                {formatCOP(calculateTotal())}
              </span>
            </div>
            <Button
              variant="primary"
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
          <span>Atención remota paso a paso 1 a 1 por WhatsApp solo para usuarios registrados.</span>
        </div>
      </div>
    </section>
  );
}
