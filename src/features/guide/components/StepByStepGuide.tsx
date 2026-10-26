'use client';

import React, { useState } from 'react';
import { TV_GUIDES, TAILSCALE_TUTORIAL, USB_DEBUGGING_VIDEOS } from '../constants/brandSteps';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { generateWhatsAppLink } from '@/lib/whatsapp/generateLink';
import { Ticket, VideoTutorial } from '@/types';
import {
  Camera,
  MessageCircle,
  CheckSquare,
  Lock,
  Play,
  Maximize2,
  X,
  AlertTriangle,
  Network,
  Usb,
  ArrowRight,
  CheckCircle2,
  Tv
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
  const [fullscreenVideo, setFullscreenVideo] = useState<VideoTutorial | null>(null);

  const currentBrand = TV_GUIDES[0]; // Exclusively Android TV / Google TV

  const handleWhatsAppClick = () => {
    if (!currentTicket?.ticket_number) {
      onOpenTicketModal();
      return;
    }
    const link = generateWhatsAppLink(currentTicket);
    window.open(link, '_blank');
  };

  const openFullscreen = (video: VideoTutorial) => {
    setFullscreenVideo(video);
  };

  return (
    <section id="guia" className="py-16 md:py-24 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="cyan" className="mb-3">
            Preparación Técnica Obligatoria
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Pasos que Debes Hacer en tu TV
          </h2>
          <p className="text-slate-400 mt-3 text-sm md:text-base">
            Sigue estos 3 pasos obligatorios en tu Android TV o Google TV para que podamos conectarnos cuando llegue tu turno.
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
            {/* Device Compatibility Notice: ONLY Android TV, NO Samsung Tizen NO WebOS */}
            <div className="p-4 md:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 text-xs text-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300 text-sm">
                  Dispositivos soportados: Únicamente Android TV y Google TV
                </p>
                <p className="mt-0.5 text-amber-200/90 leading-relaxed">
                  Los televisores <strong>Samsung Smart TV (Tizen OS)</strong> y <strong>LG (webOS)</strong> quedan <strong>totalmente descartados</strong> debido a restricciones y bloqueos de seguridad del fabricante. Si tu televisor es Samsung o LG, puedes conectarle un Chromecast con Google TV o TV Box Android para optimizarlo.
                </p>
              </div>
            </div>

            {/* Compatible Brand Pill */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 text-center">
              <p className="text-xs text-slate-300 flex items-center justify-center gap-2">
                <Tv className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 font-bold uppercase tracking-wider">Aplica para:</span>
                <span>{currentBrand.tag}</span>
              </p>
            </div>

            {/* 3 STEPS GRID (REPLACING THE PREVIOUS 4) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              {currentBrand.steps.map((step) => (
                <div
                  key={step.step}
                  className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-all duration-300 shadow-xl relative overflow-hidden"
                >
                  <div>
                    {/* Header with step number */}
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 font-black text-lg flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                        {step.step}
                      </div>
                      <h3 className="text-base font-extrabold text-white tracking-tight leading-snug">
                        {step.title}
                      </h3>
                    </div>

                    {/* Step description */}
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {step.description}
                    </p>

                    {/* Detailed sub-list if provided */}
                    {step.details && (
                      <div className="space-y-2 mb-4 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                        {step.details.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-300">
                            <span className="font-bold text-cyan-400 shrink-0">
                              {idx + 1}.
                            </span>
                            <span className="leading-snug">{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actionable tag */}
                  <div className="mt-2 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-2.5 text-xs text-cyan-300">
                    <Camera className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white font-semibold">Qué hacer: </strong>
                      {step.actionable}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* VIDEO TUTORIALS SECTION WITH FULLSCREEN & PLAY BUTTONS */}
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 md:p-8 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <Play className="w-5 h-5 fill-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">
                      Tutoriales Oficiales en Video (Play List)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Haz clic en Reproducir o Ampliar Pantalla para ver cada guía en detalle.
                    </p>
                  </div>
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
                      className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between group hover:border-cyan-500/50 transition-colors"
                    >
                      {/* Video Player */}
                      <div className="relative aspect-video w-full bg-black">
                        <iframe
                          src={video.embedUrl}
                          title={video.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                          allowFullScreen
                        />
                      </div>

                      {/* Video Controls Bar: Play & Ampliar Pantalla */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                            Video #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => openFullscreen(video)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-[11px] font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <Maximize2 className="w-3 h-3 text-cyan-400" />
                            <span>Ampliar Pantalla</span>
                          </button>
                        </div>

                        <div>
                          <h5 className="text-xs font-bold text-white line-clamp-1">
                            {video.title}
                          </h5>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                            {video.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => openFullscreen(video)}
                          className="w-full py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-cyan-400" />
                          <span>Ver en Pantalla Completa</span>
                        </button>
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
                  <div className="lg:col-span-7 relative aspect-video w-full rounded-xl overflow-hidden group">
                    <iframe
                      src={TAILSCALE_TUTORIAL.embedUrl}
                      title={TAILSCALE_TUTORIAL.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                      allowFullScreen
                    />
                  </div>

                  <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-bold text-fuchsia-400 tracking-wider">
                        Guía de Red VPN Segura
                      </span>
                      <button
                        type="button"
                        onClick={() => openFullscreen(TAILSCALE_TUTORIAL)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-fuchsia-500/40 hover:border-fuchsia-400 text-xs font-bold text-fuchsia-200 transition-colors cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-fuchsia-400" />
                        <span>Ampliar Pantalla</span>
                      </button>
                    </div>

                    <h5 className="text-base font-bold text-white">
                      ¿Por qué necesitas Tailscale?
                    </h5>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Tailscale crea un túnel cifrado punto a punto directo entre tu TV y nuestro equipo técnico. Nos permite optimizar y personalizar tu pantalla de forma remota sin pedir contraseñas ni poner en riesgo tu router.
                    </p>

                    <div className="p-3 bg-fuchsia-950/30 border border-fuchsia-500/30 rounded-xl text-xs text-fuchsia-200">
                      <strong>Paso clave:</strong> Cuando abras Tailscale en tu TV y le des &quot;Get Started&quot;, tomale una foto a la pantalla donde aparece el código o estado y envíala por WhatsApp junto con tu ticket.
                    </div>

                    <button
                      type="button"
                      onClick={() => openFullscreen(TAILSCALE_TUTORIAL)}
                      className="w-full py-2.5 rounded-xl bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(217,70,239,0.3)] transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Reproducir Video en Pantalla Completa</span>
                    </button>
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

      {/* FULLSCREEN THEATER MODAL FOR VIDEOS */}
      {fullscreenVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setFullscreenVideo(null)}
        >
          <div
            className="relative w-full max-w-5xl bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with title and close button */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                <h4 className="text-sm font-bold text-white truncate max-w-md sm:max-w-xl">
                  {fullscreenVideo.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setFullscreenVideo(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Cerrar video ampliado"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Theater Iframe */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`${fullscreenVideo.embedUrl}&autoplay=1`}
                title={fullscreenVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
              />
            </div>

            {/* Bottom info */}
            <div className="p-4 bg-slate-900/90 text-xs text-slate-300">
              <p>{fullscreenVideo.description}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
