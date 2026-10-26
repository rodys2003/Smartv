'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
  Tv
} from 'lucide-react';

interface StepByStepGuideProps {
  currentTicket?: Partial<Ticket> | null;
  isAuthenticated: boolean;
  onOpenAuthModal: () => void;
  onOpenTicketModal: () => void;
  queuePosition?: number;
  whatsappThreshold?: number;
}

export function StepByStepGuide({
  currentTicket,
  isAuthenticated,
  onOpenAuthModal,
  onOpenTicketModal,
  queuePosition,
  whatsappThreshold = 5,
}: StepByStepGuideProps) {
  const [fullscreenVideo, setFullscreenVideo] = useState<VideoTutorial | null>(null);

  const currentBrand = TV_GUIDES[0]; // Exclusively Android TV / Google TV

  // Close fullscreen on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFullscreenVideo(null);
      }
    };
    if (fullscreenVideo) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [fullscreenVideo]);

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

  const getAutoplayUrl = (url: string) => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}autoplay=1&playsinline=1&rel=0`;
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

            {/* 3 STEPS GRID */}
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

                    {/* Detailed sub-list (Clean, No duplication) */}
                    {step.details ? (
                      <div className="space-y-2.5 mb-5 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
                        {step.details.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                            <span className="w-5 h-5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed">{item}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-300 leading-relaxed mb-4">
                        {step.description}
                      </p>
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
                      Haz clic en cualquier video para reproducirlo directamente en pantalla completa.
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
                      className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between group hover:border-cyan-500/60 transition-all shadow-lg"
                    >
                      {/* Video Thumbnail with interactive full-screen play trigger */}
                      <button
                        type="button"
                        onClick={() => openFullscreen(video)}
                        className="relative aspect-video w-full bg-slate-900 overflow-hidden cursor-pointer group text-left"
                        aria-label={`Reproducir en pantalla completa: ${video.title}`}
                      >
                        {video.thumbnailUrl && (
                          <Image
                            src={video.thumbnailUrl}
                            alt={video.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                            unoptimized
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent group-hover:from-slate-950/70 transition-colors flex items-center justify-center">
                          {/* Centered Glowing Red YouTube-style Play Button */}
                          <div className="w-14 h-14 rounded-full bg-red-600/95 group-hover:bg-red-500 shadow-[0_0_25px_rgba(239,68,68,0.7)] group-hover:shadow-[0_0_35px_rgba(239,68,68,0.9)] flex items-center justify-center transition-all group-hover:scale-110">
                            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                          </div>
                        </div>

                        {/* Top badge */}
                        <div className="absolute top-2.5 right-2.5">
                          <span className="px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-bold text-cyan-300 border border-slate-700/80 backdrop-blur-md flex items-center gap-1">
                            <Maximize2 className="w-2.5 h-2.5" />
                            <span>Pantalla Completa</span>
                          </span>
                        </div>
                      </button>

                      {/* Video Controls & Info Bar */}
                      <div className="p-4 space-y-3">
                        <div>
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

                        {/* Primary Action Button: Always Opens Fullscreen */}
                        <button
                          type="button"
                          onClick={() => openFullscreen(video)}
                          className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer hover:scale-[1.01]"
                        >
                          <Play className="w-3.5 h-3.5 fill-slate-950" />
                          <span>Reproducir en Pantalla Completa</span>
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
                  {/* Tailscale Thumbnail with Play trigger */}
                  <div className="lg:col-span-7">
                    <button
                      type="button"
                      onClick={() => openFullscreen(TAILSCALE_TUTORIAL)}
                      className="relative aspect-video w-full rounded-2xl overflow-hidden group cursor-pointer border border-fuchsia-500/40 text-left block"
                      aria-label="Reproducir Tailscale en pantalla completa"
                    >
                      {TAILSCALE_TUTORIAL.thumbnailUrl && (
                        <Image
                          src={TAILSCALE_TUTORIAL.thumbnailUrl}
                          alt={TAILSCALE_TUTORIAL.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-red-600/95 group-hover:bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.7)] flex items-center justify-center transition-all group-hover:scale-110">
                          <Play className="w-7 h-7 text-white fill-white ml-0.5" />
                        </div>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-md bg-black/80 text-xs font-bold text-fuchsia-300 border border-fuchsia-500/40 backdrop-blur-md flex items-center gap-1.5">
                          <Maximize2 className="w-3 h-3" />
                          <span>Pantalla Completa</span>
                        </span>
                      </div>
                    </button>
                  </div>

                  <div className="lg:col-span-5 space-y-4">
                    <span className="text-xs uppercase font-bold text-fuchsia-400 tracking-wider block">
                      Guía de Red VPN Segura
                    </span>

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
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-400 hover:to-pink-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all cursor-pointer hover:scale-[1.01]"
                    >
                      <Play className="w-4 h-4 fill-slate-950" />
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
                    Envía estos datos cuando tomes tu turno para que la atención sea ágil. Recuerda que al llegar tu turno dispones de <strong className="text-amber-300 font-bold">5 minutos</strong> para responder y adjuntar estas fotos antes de que el ticket se cancele:
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
                      {queuePosition !== undefined && queuePosition > whatsappThreshold && currentTicket.status !== 'in_progress' ? (
                        <div className="mt-4 space-y-2">
                          <div className="w-full py-3 px-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed select-none">
                            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>WhatsApp en Top {whatsappThreshold} (Turno #{queuePosition})</span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-snug">
                            Se habilitará automáticamente cuando estés en el Top {whatsappThreshold} de la fila.
                          </p>
                        </div>
                      ) : (
                        <Button
                          variant="whatsapp"
                          size="lg"
                          onClick={handleWhatsAppClick}
                          className="w-full mt-4 text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Abrir WhatsApp con mi Ticket</span>
                        </Button>
                      )}
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
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6"
          onClick={() => setFullscreenVideo(null)}
        >
          <div
            className="relative w-full max-w-5xl bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.95)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with title, escape hint and close button */}
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-red-600 text-white">
                  <Play className="w-3.5 h-3.5 fill-white" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white truncate max-w-sm sm:max-w-lg md:max-w-2xl">
                    {fullscreenVideo.title}
                  </h4>
                  <span className="text-[10px] text-cyan-400 block">
                    Modo Pantalla Completa Activo · Presiona ESC o haz clic afuera para salir
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFullscreenVideo(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5"
                aria-label="Cerrar video"
              >
                <span>Cerrar</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Theater Iframe with Autoplay */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={getAutoplayUrl(fullscreenVideo.embedUrl)}
                title={fullscreenVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
              />
            </div>

            {/* Bottom info */}
            <div className="p-4 bg-slate-900/90 text-xs text-slate-300 flex items-center justify-between gap-4">
              <p className="line-clamp-2">{fullscreenVideo.description}</p>
              <button
                type="button"
                onClick={() => setFullscreenVideo(null)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 shrink-0 cursor-pointer"
              >
                Listo, volver al paso a paso
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
