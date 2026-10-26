'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Zap, Tv, Sparkles, ShieldCheck, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onOpenTicketModal: () => void;
  onOpenAuthModal: () => void;
  isAuthenticated: boolean;
  waitingCount: number;
}

export function Hero({
  onOpenTicketModal,
  onOpenAuthModal,
  isAuthenticated,
  waitingCount,
}: HeroProps) {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      {/* Background ambient neon glow lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Compatibility & Status Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.2)] flex-wrap justify-center">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <span className="text-xs font-semibold text-slate-200">
              {isAuthenticated
                ? `Cola Activa · ${waitingCount > 0 ? `${waitingCount} turnos en espera` : 'Turno inmediato disponible'}`
                : 'Servicio Remoto Exclusivo · Android TV & Google TV'}
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
            Convierte tu Smart TV en una máquina{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-fuchsia-400">
              Ultra Rápida & PRO
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Eliminamos el lag, instalamos launchers ultra-livianos de bajo consumo de recursos y personalizamos la pantalla con temas exclusivos (Anime, Cine, Gamer).
          </p>

          {/* Key Value Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-300 pt-1">
            <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Desde 20.000 COP
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              Apps Mágicas disponibles (+20k)
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Atención 1 a 1 por WhatsApp
            </span>
          </div>

          {/* Compatible devices highlight */}
          <div className="pt-1">
            <p className="text-xs text-slate-400">
              Soporte exclusivo: <strong className="text-white">Android TV y Google TV</strong> (TCL, Xiaomi, Sony, Chromecast, TV Box)
              <span className="text-amber-400/90 ml-2">(Samsung Tizen y LG webOS descartados)</span>
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            {isAuthenticated ? (
              <Button
                variant="primary"
                size="lg"
                onClick={onOpenTicketModal}
                className="w-full sm:w-auto px-8 py-4 text-sm md:text-base font-extrabold flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.4)]"
              >
                <span>Tomar Turno Digital</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={onOpenAuthModal}
                className="w-full sm:w-auto px-8 py-4 text-sm md:text-base font-extrabold flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.4)]"
              >
                <Lock className="w-4 h-4" />
                <span>Iniciar con Google para Tomar Turno</span>
              </Button>
            )}

            <a
              href="#planes"
              className="w-full sm:w-auto px-6 py-4 rounded-xl text-xs md:text-sm font-bold text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Tv className="w-4 h-4 text-cyan-400" />
              <span>Ver Servicios & Precios</span>
            </a>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="mt-14 md:mt-20 max-w-4xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 via-purple-500/20 to-fuchsia-500/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000" />
          <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl">
            {/* TV Bezel */}
            <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[11px] font-mono font-semibold text-slate-400">
                SMART TV 4K · INTERFAZ PRO PERSONALIZADA
              </span>
              <div className="w-12" />
            </div>

            <div className="relative aspect-[16/9] w-full">
              <Image
                src="/images/itachi-theme.jpg"
                alt="Smart TV Personalizado Tema Itachi Akatsuki"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-4 md:p-6">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <span className="text-xs uppercase font-extrabold text-cyan-300 tracking-wider block">
                      Resultado Nivel PRO (70k)
                    </span>
                    <p className="text-xs text-slate-300 hidden sm:block">
                      Fondo HD temático + Dock flotante de apps directas sin publicidad
                    </p>
                  </div>
                  <a
                    href="#galeria"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                  >
                    Ver interfaz minimalista →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
