'use client';

import React, { useState } from 'react';
import { TV_GUIDES } from '../constants/brandSteps';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { generateWhatsAppLink } from '@/lib/whatsapp/generateLink';
import { Ticket } from '@/types';
import {
  Camera,
  MessageCircle,
  HelpCircle,
  CheckSquare,
  ArrowRight,
  Tv2
} from 'lucide-react';

interface StepByStepGuideProps {
  currentTicket?: Partial<Ticket> | null;
  onOpenTicketModal: () => void;
}

export function StepByStepGuide({ currentTicket, onOpenTicketModal }: StepByStepGuideProps) {
  const [selectedBrandId, setSelectedBrandId] = useState<string>('android-tv');
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
            Preparación Previa
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Paso a Paso en tu Televisor
          </h2>
          <p className="text-slate-400 mt-3 text-sm md:text-base">
            Sigue estos pasos sencillos en tu TV y envíanos las fotos por WhatsApp para atenderte en tu turno exacto.
          </p>
        </div>

        {/* Brand Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
          {TV_GUIDES.map((brand) => (
            <button
              key={brand.id}
              onClick={() => setSelectedBrandId(brand.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold border transition-all cursor-pointer ${
                selectedBrandId === brand.id
                  ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span className="text-base">{brand.logo}</span>
              <span>{brand.name}</span>
            </button>
          ))}
        </div>

        {/* Brand Tagline */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 mb-8 text-center">
          <p className="text-xs text-slate-300">
            <span className="text-cyan-400 font-bold uppercase tracking-wider">Aplica para: </span>
            {currentBrand.tag}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
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

        {/* WhatsApp Checklist Box */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 md:p-10 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Envío obligatorio por WhatsApp</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Checklist: ¿Qué debes enviarnos por WhatsApp?
              </h3>
              <p className="text-xs md:text-sm text-slate-300">
                Una vez tomes tu turno, abre el chat oficial y envíanos los siguientes elementos para que el proceso de optimización sea inmediato:
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
                    Turno asignado
                  </span>
                  <span className="text-3xl font-black text-white block mt-1">
                    #{currentTicket.ticket_number.toString().padStart(3, '0')}
                  </span>
                  <Button
                    variant="whatsapp"
                    size="lg"
                    onClick={handleWhatsAppClick}
                    className="w-full mt-4 text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Enviar datos por WhatsApp</span>
                  </Button>
                </div>
              ) : (
                <div>
                  <span className="text-xs text-slate-400 block mb-1">
                    Paso previo obligatorio
                  </span>
                  <p className="text-sm font-bold text-white mb-4">
                    Primero toma tu ticket para saber tu posición en la cola
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
    </section>
  );
}
