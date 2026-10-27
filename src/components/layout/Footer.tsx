'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const phone = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/\D/g, '');
  const contactUrl = /^\d{8,15}$/.test(phone) && phone !== '573105555555'
    ? `https://wa.me/${phone}?text=${encodeURIComponent('Hola, quiero consultar la compatibilidad de mi Android TV o Google TV.')}`
    : null;

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 py-12 relative z-10 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-cyan-500/30">
              <Image
                src="/images/logo-optimized.webp"
                alt="Smart TV Like a Pro"
                fill
                sizes="36px"
                className="object-cover"
              />
            </div>
            <div>
              <span className="text-sm font-black text-slate-900 dark:text-white block">
                Smart TV Like a Pro
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Optimización y personalización de televisores a nivel global.
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <Link href="/#planes" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              Planes
            </Link>
            <Link href="/#galeria" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              Galería
            </Link>
            <Link href="/compatibilidad" className="hover:text-cyan-600 dark:hover:text-cyan-400">Compatibilidad y proceso</Link>
            <Link href="/guias/smart-tv-lento" className="hover:text-cyan-600 dark:hover:text-cyan-400">Guía de rendimiento</Link>
            {contactUrl && <a href={contactUrl} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600 dark:hover:text-cyan-400">Consultar por WhatsApp</a>}
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
            <span>Servicio remoto para Android TV y Google TV compatibles.</span>
          </div>

          <p className="text-center sm:text-right">
            © {currentYear} Smart TV Like a Pro. Hecho con pasión técnica.
          </p>
        </div>
      </div>
    </footer>
  );
}
