'use client';

import React, { useState } from 'react';
import { TV_GUIDES, TAILSCALE_TUTORIAL, USB_DEBUGGING_VIDEOS } from '../constants/brandSteps';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { generateWhatsAppLink } from '@/lib/whatsapp/generateLink';
import { Ticket } from '@/types';
import {
  Camera,
  MessageCircle,
  CheckSquare,
  Lock,
  Play,
  Tv2,
  AlertTriangle,
  Network,
  Usb,
  ArrowRight
} from 'lucide-react';

interface StepByStepGuideProps {
  currentTicket?: Partial<Ticket> | null;
  isAuthenticated: boolean;
  onOpenAuthModal: () => void;
  onOpenTicketModal: () => void;
}

export function StepByStepGuide({
  currentTicket,
  isAuthenticated,
  onOpenAuthModal,
  onOpenTicketModal,
}: StepByStepGuideProps) {
  const [selectedBrandId, setSelectedBrandId] = useState<string>('android-tv');
  const [activeVideoId, setActiveVideoId] = useState<string>(USB_DEBUGGING_VIDEOS[0].id);

  const currentBrand = TV_GUIDES.find((b) => b.id === selectedBrandId) || TV_GUIDES[0];

  const handleWhatsAppClick = () => {
    if (!currentTicket?.ticket_number) {
      onOpenTicketModal();
      return;
    }
    const link = generateWhatsAppLink(currentTicket);
    window.open(link, '_blank');
  };

  return (
    <section id="guia" className="py-16 md:py-24 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="cyan" className="mb-3">
            Preparación Técnica del TV
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Configuración & Tutoriales en Video
          </h2>
          <p className="text-slate-400 mt-3 text-sm md:text-base">
            Ten listo tu televisor antes de que llegue tu turno con estos tutoriales paso a paso de Depuración USB y Tailscale.
          </p>
        </div>

        {/* LOCKED STATE FOR NON-LOGGED USERS */}
        {!isAuthenticated ? (
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 md:p-12 text-center max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center mb-5 shadow-[0_0_25px_rgba(6,182,212,0.25)]">
              <Lock className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-white tracking-tight mb-3">
              Guía Técnica y Tutoriales Exclusivos para Clientes
            </h3>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6 max-w-xl mx-auto">
              Para garantizar que los televisores estén correctamente preparados y asignar tu turno en la cola de atención 1 a 1, inicia sesión con Google.
            </p>

            <div className="inline-flex flex-col sm:flex-row items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={onOpenAuthModal}
                className="px-8 py-3.5 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              >
                Iniciar Sesión con Google para Ver la Guía
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Usb className="w-4 h-4 text-cyan-400" />
                Videos de Depuración USB
              </span>
              <span className="flex items-center gap-1.5">
                <Network className="w-4 h-4 text-cyan-400" />
                Configuración Tailscale
              </span>
              <span className="flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                Chat Directo de WhatsApp
              </span>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED STATE: FULL GUIDE & VIDEOS */
          <div className="space-y-12">
            {/* Device Compatibility Notice: ONLY Android TV / Google TV */}
            <div className="p-4 md:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 text-xs text-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300 text-sm">
                  Dispositivos soportados: Únicamente Android TV y Google TV
                </p>
                <p className="mt-0.5 text-amber-200/90 leading-relaxed">
                  Los televisores <strong>Samsung Smart TV (Tizen OS)</strong> y <strong>LG (webOS)</strong> quedan <strong>totalmente descartados</strong> debido a bloqueos de seguridad del fabricante. Si tu televisor es Samsung o LG, puedes conectarle un Chromecast con Google TV o TV Box Android para optimizarlo.
                </p>
              </div>
            </div>

            {/* Brand Selector Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {TV_GUIDES.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrandId(brand.id)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs md:text-sm font-bold border transition-all cursor-pointer ${
                    selectedBrandId === brand.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className="text-lg">{brand.logo}</span>
                  <span>{brand.name}</span>
                </button>
              ))}
            </div>

            {/* Brand Tagline */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 text-center">
              <p className="text-xs text-slate-300">
                <span className="text-cyan-400 font-bold uppercase tracking-wider">Aplica para: </span>
                {currentBrand.tag}
              </p>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentBrand.steps.map((step) => (
                <div
                  key={step.step}
                  className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-cyan-500/40 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 font-black text-base flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {step.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                        {step.description}
                      </p>

                      <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5 text-xs text-cyan-300">
                        <Camera className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-white font-semibold">Qué hacer: </strong>
                          {step.actionable}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* VIDEO TUTORIALS SECTION */}
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 md:p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Play className="w-5 h-5 fill-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">
                    Tutoriales Oficiales en Video (Play List)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Reproduce cada guía en tu televisor o celular para seguir los pasos exactos.
                  </p>
                </div>
              </div>

              {/* Video 1 to 3: USB Debugging Playlist */}
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Usb className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Habilitar Depuración USB en Android TV / Google TV
                  </h4>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {USB_DEBUGGING_VIDEOS.map((video, idx) => (
                    <div
                      key={video.id}
                      className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between"
                    >
                      <div className="relative aspect-video w-full bg-black">
                        <iframe
                          src={video.embedUrl}
                          title={video.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                      <div className="p-4">
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                          Video #{idx + 1}
                        </span>
                        <h5 className="text-xs font-bold text-white line-clamp-1">
                          {video.title}
                        </h5>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {video.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video 4: Tailscale Setup (Mandatory) */}
              <div className="pt-6 border-t border-slate-800">
                <div className="flex items-center gap-2 mb-4">
                  <Network className="w-4 h-4 text-fuchsia-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Configuración Obligatoria: Conexión Remota con Tailscale
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-[10px] font-bold border border-fuchsia-500/30">
                    Indispensable
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-slate-950 p-4 md:p-6 rounded-2xl border border-fuchsia-500/30">
                  <div className="lg:col-span-7 relative aspect-video w-full rounded-xl overflow-hidden">
                    <iframe
                      src={TAILSCALE_TUTORIAL.embedUrl}
                      title={TAILSCALE_TUTORIAL.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>

                  <div className="lg:col-span-5 space-y-3">
                    <h5 className="text-base font-bold text-white">
                      ¿Por qué necesitas Tailscale?
                    </h5>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Tailscale crea un túnel cifrado punto a punto directo entre tu TV y nuestro equipo técnico. Nos permite optimizar y personalizar tu pantalla de forma remota sin pedir contraseñas ni poner en riesgo tu router.
                    </p>
                    <div className="p-3 bg-fuchsia-950/30 border border-fuchsia-500/30 rounded-xl text-xs text-fuchsia-200">
                      <strong>Paso clave:</strong> Cuando abras Tailscale en tu TV, anota o toma foto de la IP de 10 dígitos (ej. 100.x.x.x) y envíala por WhatsApp junto a tu ticket.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Checklist Box with Direct WhatsApp Button */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 md:p-10 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                <div className="max-w-2xl space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Canal de Atención Exclusivo por WhatsApp</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    Checklist para enviar a tu Técnico
                  </h3>
                  <p className="text-xs md:text-sm text-slate-300">
                    Envía estos datos cuando tomes tu turno para que la atención sea ágil:
                  </p>

                  <div className="space-y-2 pt-2">
                    {currentBrand.whatsappChecklist.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs md:text-sm text-slate-200">
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA side */}
                <div className="w-full lg:w-auto shrink-0 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
                  {currentTicket?.ticket_number ? (
                    <div>
                      <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold block">
                        Tu Turno Asignado
                      </span>
                      <span className="text-3xl font-black text-white block mt-1">
                        #{currentTicket.ticket_number.toString().padStart(3, '0')}
                      </span>
                      <Button
                        variant="whatsapp"
                        size="lg"
                        onClick={handleWhatsAppClick}
                        className="w-full mt-4 text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Abrir WhatsApp con mi Ticket</span>
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">
                        Turno pendiente
                      </span>
                      <p className="text-sm font-bold text-white mb-4">
                        Toma tu turno para obtener tu número de ticket
                      </p>
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={onOpenTicketModal}
                        className="w-full text-sm font-bold flex items-center justify-center gap-2"
                      >
                        <span>Tomar mi Turno Ahora</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
