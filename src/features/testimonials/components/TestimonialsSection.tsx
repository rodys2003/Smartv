'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { Star, ShieldCheck, MapPin, Tv, Sparkles, CheckCircle2, ZoomIn, X } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  tvInfo: string;
  plan: string;
  rating: number;
  comment: string;
  image?: string;
  imageOrientation?: 'landscape' | 'portrait';
  tag: string;
  highlight: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 'client-1',
    name: 'Juan Camilo V.',
    location: 'Soledad, Atlántico',
    tvInfo: 'TCL 55" 4K Smart TV',
    plan: 'Personalización PRO (70k) + Apps Mágicas',
    rating: 5,
    tag: 'TCL Acelerado',
    highlight: 'Tema Gojo Satoru + Cero publicidad',
    comment:
      'Mi televisor TCL con Google TV de fábrica se quedaba pegado abriendo cualquier app. Me hicieron la optimización remota por WhatsApp en 20 minutos, me pusieron el tema de Gojo con TizenTube sin anuncios y el cambio en fluidez fue brutal. Prende al instante.',
    image: '/images/client-gojo-purple.png',
    imageOrientation: 'landscape',
  },
  {
    id: 'client-2',
    name: 'Mateo R. & Camila',
    location: 'Bogotá D.C.',
    tvInfo: 'Smart TV 50" + Luces Ambientales',
    plan: 'Personalización PRO (70k) + Apps Mágicas',
    rating: 5,
    tag: 'Setup Gamer',
    highlight: 'Integración visual con tira LED',
    comment:
      'Miren cómo luce con las luces LED de la habitación. No solo se ve cinematográfico con el arte de Gojo en alta resolución, sino que el consumo de memoria bajó una barbaridad. La navegación entre YouTube, Spotify y streaming es instantánea.',
    image: '/images/client-gojo-ambient.png',
    imageOrientation: 'portrait',
  },
  {
    id: 'client-3',
    name: 'Sebastián Gómez',
    location: 'Medellín, Antioquia',
    tvInfo: 'Samsung Crystal UHD 55"',
    plan: 'Interfaz Ultra-Ligera (50k)',
    rating: 5,
    tag: 'Samsung Revivido',
    highlight: 'Adiós a los menús lentos de Tizen',
    comment:
      'Tenía ganas de cambiar mi televisor porque el menú de Samsung cada año se pone más pesado con anuncios de películas que ni veo. Con el launcher ligero vuela, la respuesta del control remoto es inmediata y me ahorré comprar otro TV.',
  },
  {
    id: 'client-4',
    name: 'Daniela Morales',
    location: 'Cali, Valle del Cauca',
    tvInfo: 'Xiaomi Mi TV P1 43"',
    plan: 'Optimización Esencial (20k)',
    rating: 5,
    tag: 'Optimización Rápida',
    highlight: 'Excelente relación costo-beneficio',
    comment:
      'Por solo 20.000 COP le quitaron todo el lag a mi Xiaomi. Me atendieron en el turno exacto que tomé en la página y la guía de WhatsApp para enviar los datos fue súper clara.',
  },
];

export function TestimonialsSection() {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  return (
    <section id="testimonios" className="py-16 md:py-24 relative z-10 bg-slate-950/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="cyan" className="mb-3">
            Casos de Éxito Reales
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Clientes Satisfechos a Nivel Global
          </h2>
          <p className="text-slate-400 mt-3 text-sm md:text-base leading-relaxed">
            Así es como quedan los televisores de nuestros clientes tras la optimización y personalización 1 a 1.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="text-amber-400 flex">
                {'★'.repeat(5)}
              </span>
              <strong className="text-white">4.9 / 5.0</strong> en satisfacción
            </span>
            <span className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Más de 500 TVs optimizados
            </span>
            <span className="flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              100% Remoto & Seguro
            </span>
          </div>
        </div>

        {/* Featured Real Client Setups (With User Images) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-10">
          {/* Client Setup 1: TCL Gojo Purple (Landscape) */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 md:p-6 flex flex-col justify-between hover:border-cyan-500/50 transition-all duration-300 shadow-xl group">
            <div>
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-cyan-500/30 mb-5 bg-slate-950">
                <Image
                  src={TESTIMONIALS[0].image!}
                  alt="Instalación real cliente Gojo TCL"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-cyan-400/40 text-[11px] font-bold text-cyan-300 backdrop-blur-md">
                    Foto Real de Cliente · {TESTIMONIALS[0].location}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(TESTIMONIALS[0].image!)}
                  className="absolute bottom-3 right-3 p-2 rounded-xl bg-slate-900/80 hover:bg-cyan-500 hover:text-slate-950 text-white transition-colors cursor-pointer border border-slate-700 backdrop-blur-md"
                  title="Ampliar foto"
                  aria-label="Ampliar foto"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  {'★'.repeat(TESTIMONIALS[0].rating)}
                </div>
                <span className="text-xs font-semibold text-cyan-400 bg-cyan-950/40 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                  {TESTIMONIALS[0].plan}
                </span>
              </div>

              <h3 className="text-lg font-black text-white mt-1">
                &ldquo;{TESTIMONIALS[0].highlight}&rdquo;
              </h3>

              <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                {TESTIMONIALS[0].comment}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 text-slate-950 font-bold flex items-center justify-center text-xs">
                  {TESTIMONIALS[0].name.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-white block">{TESTIMONIALS[0].name}</span>
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    {TESTIMONIALS[0].location}
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {TESTIMONIALS[0].tvInfo}
              </span>
            </div>
          </div>

          {/* Client Setup 2: Bedroom Ambient Gojo (Portrait / Showcase) */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 md:p-6 flex flex-col justify-between hover:border-fuchsia-500/50 transition-all duration-300 shadow-xl group">
            <div>
              <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-[4/5] rounded-2xl overflow-hidden border border-fuchsia-500/30 mb-5 bg-slate-950">
                <Image
                  src={TESTIMONIALS[1].image!}
                  alt="Instalación real cliente con luces ambientales"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-fuchsia-400/40 text-[11px] font-bold text-fuchsia-300 backdrop-blur-md">
                    Foto Real de Cliente · {TESTIMONIALS[1].location}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(TESTIMONIALS[1].image!)}
                  className="absolute bottom-3 right-3 p-2 rounded-xl bg-slate-900/80 hover:bg-fuchsia-500 hover:text-white text-white transition-colors cursor-pointer border border-slate-700 backdrop-blur-md"
                  title="Ampliar foto"
                  aria-label="Ampliar foto"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  {'★'.repeat(TESTIMONIALS[1].rating)}
                </div>
                <span className="text-xs font-semibold text-fuchsia-400 bg-fuchsia-950/40 px-2.5 py-0.5 rounded-full border border-fuchsia-500/30">
                  {TESTIMONIALS[1].plan}
                </span>
              </div>

              <h3 className="text-lg font-black text-white mt-1">
                &ldquo;{TESTIMONIALS[1].highlight}&rdquo;
              </h3>

              <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                {TESTIMONIALS[1].comment}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-fuchsia-400 to-rose-600 text-white font-bold flex items-center justify-center text-xs">
                  {TESTIMONIALS[1].name.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-white block">{TESTIMONIALS[1].name}</span>
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-fuchsia-400" />
                    {TESTIMONIALS[1].location}
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {TESTIMONIALS[1].tvInfo}
              </span>
            </div>
          </div>
        </div>

        {/* Secondary Testimonials Row (Other Plans 20k / 50k) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TESTIMONIALS.slice(2).map((t) => (
            <div
              key={t.id}
              className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-amber-400 text-xs">
                  {'★'.repeat(t.rating)}
                </div>
                <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-md">
                  {t.plan}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed italic">
                &ldquo;{t.comment}&rdquo;
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-white">{t.name} ({t.location})</span>
                <span className="text-[11px] text-cyan-400">{t.tvInfo}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal for Full Size Photo */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-2 right-2 z-10 p-2.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors cursor-pointer"
              aria-label="Cerrar vista previa"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full h-[85vh] rounded-2xl overflow-hidden">
              <Image
                src={selectedPhoto}
                alt="Foto ampliada instalación de cliente"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
