'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { getR2Url } from '@/lib/r2';
import { Sparkles, Gauge, Layers, CheckCircle2 } from 'lucide-react';

export function ShowcaseGallery() {
  const [activeTab, setActiveTab] = useState<'custom' | 'minimal'>('custom');

  return (
    <section id="galeria" className="py-16 md:py-24 relative z-10 bg-slate-950/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="cyan" className="mb-3">
            Galería de Resultados Reales
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Así lucirá tu Smart TV
          </h2>
          <p className="text-slate-400 mt-3 text-sm md:text-base">
            Diseñamos interfaces que combinan rendimiento brutal con una estética visual impresionante.
          </p>

          {/* Toggle buttons */}
          <div className="mt-8 inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800 gap-1.5">
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'custom'
                  ? 'bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔥 Personalización PRO
            </button>
            <button
              onClick={() => setActiveTab('minimal')}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'minimal'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚡ Interfaz Ultra-Ligera (Bajo Consumo)
            </button>
          </div>
        </div>

        {/* Gallery Showcase Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 md:p-8 shadow-2xl relative overflow-hidden">
          {activeTab === 'custom' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 relative aspect-[16/9] rounded-2xl overflow-hidden border border-fuchsia-500/40 shadow-[0_0_30px_rgba(217,70,239,0.2)]">
                <Image
                  src={getR2Url('/images/itachi-theme.jpg')}
                  alt="Personalización Itachi Akatsuki Smart TV"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="lg:col-span-4 space-y-4">
                <div className="inline-flex items-center gap-1.5 text-xs text-fuchsia-400 font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Plan 70.000 COP</span>
                </div>
                <h3 className="text-2xl font-black text-white">
                  Edición Temática Anime Itachi Akatsuki
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Fondo de pantalla oscuro en alta definición con Itachi Uchiha, cuervos en vuelo y luna carmesí, dock inferior flotante con apps destacadas (Netflix, Prime, TizenTube, Crunchyroll, Magis TV, Moonlight) y reloj minimalista.
                </p>

                <div className="pt-2 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-fuchsia-400 shrink-0" />
                    <span>Fondo 4K sin consumo excesivo de memoria</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-fuchsia-400 shrink-0" />
                    <span>Barra dock inspirada en consolas de nueva generación</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-fuchsia-400 shrink-0" />
                    <span>Personalizable con cualquier personaje o foto</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 relative aspect-[16/9] rounded-2xl overflow-hidden border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                <Image
                  src={getR2Url('/images/minimal-theme.png')}
                  alt="Interfaz Minimalista Bajo Consumo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="lg:col-span-4 space-y-4">
                <div className="inline-flex items-center gap-1.5 text-xs text-cyan-400 font-bold uppercase tracking-wider">
                  <Gauge className="w-4 h-4" />
                  <span>Plan 50.000 COP</span>
                </div>
                <h3 className="text-2xl font-black text-white">
                  Interfaz Minimalista Limpia
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Adiós a los menús pesados que tardan 10 segundos en abrir. Cuadrícula limpia con íconos vectoriales de alto contraste, reloj elegante y accesos inmediatos a tus fuentes y ajustes.
                </p>

                <div className="pt-2 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Consumo de RAM reducido hasta un 75%</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Cero banners publicitarios molestos</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Ideal para televisores con 1GB o 1.5GB de RAM</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Comparison stats */}
          <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-2xl bg-slate-800/40">
              <span className="text-xs text-slate-400 block font-medium">Tiempo de encendido</span>
              <span className="text-lg md:text-xl font-extrabold text-cyan-400 mt-0.5 block">
                2.4 seg vs 14 seg
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/40">
              <span className="text-xs text-slate-400 block font-medium">Uso de memoria RAM</span>
              <span className="text-lg md:text-xl font-extrabold text-emerald-400 mt-0.5 block">
                ~58 MB vs 420 MB
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/40">
              <span className="text-xs text-slate-400 block font-medium">Anuncios en pantalla</span>
              <span className="text-lg md:text-xl font-extrabold text-fuchsia-400 mt-0.5 block">
                0% Bloatware
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/40">
              <span className="text-xs text-slate-400 block font-medium">Compatibilidad</span>
              <span className="text-lg md:text-xl font-extrabold text-white mt-0.5 block">
                Global / Todas marcas
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
