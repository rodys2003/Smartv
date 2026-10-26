'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { getR2Url } from '@/lib/r2';
import { ShieldCheck, MapPin, Sparkles, ZoomIn, X } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  tvInfo: string;
  plan: string;
  rating: number;
  comment: string;
  image?: string;
  highlight: string;
}

const FEATURED_CLIENT_PHOTOS: Testimonial[] = [
  {
    id: 'client-deadpool',
    name: 'Alejandro P.',
    location: 'Bucaramanga, Santander',
    tvInfo: 'Haier 50" Smart TV (Android TV)',
    plan: 'Personalización PRO (70k) + Apps Mágicas',
    rating: 5,
    highlight: 'Tema Deadpool Chimenea 4K',
    comment:
      'Quedó de locos el fondo de Deadpool junto a la chimenea. Mi TV Haier se demoraba una eternidad en prender y ahora con el dock limpio entra a Netflix, TizenTube y Magis TV de un solo toque sin trabarse.',
    image: getR2Url('/images/client-deadpool.png'),
  },
  {
    id: 'client-tcl-gojo',
    name: 'Juan Camilo V.',
    location: 'Soledad, Atlántico',
    tvInfo: 'TCL 55" 4K Google TV',
    plan: 'Personalización PRO (70k) + Apps Mágicas',
    rating: 5,
    highlight: 'Tema Gojo Satoru Morado',
    comment:
      'Mi televisor TCL de fábrica se quedaba pegado abriendo cualquier app. Me hicieron la optimización remota por WhatsApp en 20 minutos, me pusieron el tema de Gojo con TizenTube sin anuncios y el cambio en fluidez fue brutal.',
    image: getR2Url('/images/client-gojo-purple.png'),
  },
  {
    id: 'client-ambient-gojo',
    name: 'Mateo R. & Camila',
    location: 'Bogotá D.C.',
    tvInfo: 'Smart TV 50" + Luces Ambientales',
    plan: 'Personalización PRO (70k) + Apps Mágicas',
    rating: 5,
    highlight: 'Integración con Tira LED',
    comment:
      'Miren cómo luce con las luces LED de la habitación. No solo se ve cinematográfico con el arte de Gojo en alta resolución, sino que el consumo de memoria bajó una barbaridad. La navegación entre apps es instantánea.',
    image: getR2Url('/images/client-gojo-ambient.png'),
  },
];

const OTHER_REVIEWS = [
  {
    id: 'client-3',
    name: 'Sebastián Gómez',
    location: 'Medellín, Antioquia',
    tvInfo: 'Chromecast con Google TV 4K',
    plan: 'Interfaz Ultra-Ligera (50k)',
    rating: 5,
    comment:
      'Mi Chromecast 4K andaba saturado de publicidad y apps de fábrica. Con el launcher ligero vuela, la respuesta del control remoto es inmediata y el consumo de RAM quedó súper optimizado.',
  },
  {
    id: 'client-4',
    name: 'Daniela Morales',
    location: 'Cali, Valle del Cauca',
    tvInfo: 'Xiaomi Mi TV P1 43"',
    plan: 'Optimización Esencial (20k)',
    rating: 5,
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
            Fotografías reales enviadas por nuestros clientes tras la optimización y personalización en sus hogares.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="text-amber-400 flex">
                {'★'.repeat(5)}
              </span>
              <strong className="text-white">5.0 / 5.0</strong> en satisfacción
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

        {/* Featured 3-Column Real Photo Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {FEATURED_CLIENT_PHOTOS.map((client) => (
            <div
              key={client.id}
              className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between hover:border-cyan-500/50 transition-all duration-300 shadow-xl group"
            >
              <div>
                {/* Photo container */}
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-700/80 mb-4 bg-slate-950">
                  <Image
                    src={client.image!}
                    alt={`Instalación real cliente ${client.name}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-cyan-400/40 text-[10px] font-bold text-cyan-300 backdrop-blur-md">
                      Foto Real · {client.location}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(client.image!)}
                    className="absolute bottom-2.5 right-2.5 p-1.5 rounded-xl bg-slate-900/80 hover:bg-cyan-500 hover:text-slate-950 text-white transition-colors cursor-pointer border border-slate-700 backdrop-blur-md"
                    title="Ampliar foto"
                    aria-label="Ampliar foto"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center text-amber-400 text-xs">
                    {'★'.repeat(client.rating)}
                  </div>
                  <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    {client.plan}
                  </span>
                </div>

                <h3 className="text-base font-black text-white mt-1">
                  &ldquo;{client.highlight}&rdquo;
                </h3>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {client.comment}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 text-slate-950 font-bold flex items-center justify-center text-xs">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-white block text-xs">{client.name}</span>
                    <span className="text-slate-400 text-[10px] flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-cyan-400" />
                      {client.location}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium text-right max-w-[110px] truncate">
                  {client.tvInfo}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Reviews Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {OTHER_REVIEWS.map((t) => (
            <div
              key={t.id}
              className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center text-amber-400 text-xs">
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
