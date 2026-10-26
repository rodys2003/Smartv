'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getWhatsAppNumber } from '@/lib/whatsapp/generateLink';
import { Shield } from 'lucide-react';

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 py-12 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-cyan-500/30">
              <Image
                src="/images/logo.jpg"
                alt="Smart TV Like a Pro"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="text-sm font-black text-white block">
                Smart TV Like a Pro
              </span>
              <span className="text-[11px] text-slate-400">
                Optimización y personalización de televisores a nivel global.
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <a href="#planes" className="hover:text-cyan-400 transition-colors">
              Planes
            </a>
            <a href="#galeria" className="hover:text-cyan-400 transition-colors">
              Galería
            </a>
            <a href="#guia" className="hover:text-cyan-400 transition-colors">
              Guía Paso a Paso
            </a>
            <a href="#cola" className="hover:text-cyan-400 transition-colors">
              Cola de Turnos
            </a>
            <Link href="/admin" className="hover:text-cyan-400 transition-colors text-slate-600">
              Panel Admin
            </Link>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Servicio seguro sin alteración de hardware. Garantía de fluidez.</span>
          </div>

          <p className="text-center sm:text-right">
            © {currentYear} Smart TV Like a Pro. Hecho con pasión técnica.
          </p>
        </div>
      </div>
    </footer>
  );
}
