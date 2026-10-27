'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, LockKeyhole } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { AuthModal } from '@/features/auth/components/AuthModal';

interface FooterProps {
  onOpenAuthModal?: () => void;
}

export function Footer({ onOpenAuthModal }: FooterProps = {}) {
  const currentYear = new Date().getFullYear();
  const { user, isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const phone = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/\D/g, '');
  const isPhoneValid = /^\d{8,15}$/.test(phone) && phone !== '573105555555';

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pending_whatsapp_consult', 'true');
      }
      if (onOpenAuthModal) {
        onOpenAuthModal();
      } else {
        setIsAuthModalOpen(true);
      }
      return;
    }

    if (!isPhoneValid) return;

    const clientName = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
    const clientEmail = user?.email || '';
    const userIdentifier = clientName ? `${clientName} (${clientEmail})` : clientEmail;

    const message = `¡Hola Smart TV Like a Pro! Soy cliente registrado (${userIdentifier}). Me gustaría consultar sobre el servicio / compatibilidad de mi Smart TV.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 py-12 relative z-10 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  Smart TV Like a
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-slate-950 tracking-wider">
                  PRO
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
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
            <Link href="/programa-afiliados" className="hover:text-cyan-600 dark:hover:text-cyan-400">Programa de Afiliados</Link>
            <Link href="/privacidad" className="hover:text-cyan-600 dark:hover:text-cyan-400">Privacidad</Link>
            {isPhoneValid && (
              <button
                type="button"
                onClick={handleWhatsAppClick}
                className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer text-xs font-medium"
              >
                Consultar por WhatsApp
              </button>
            )}
          </div>
        </div>

        <section aria-labelledby="footer-privacy-title" className="mt-6 flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
          <LockKeyhole aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-cyan-700 dark:text-cyan-300" />
          <div className="space-y-2">
            <h2 id="footer-privacy-title" className="text-base font-bold text-slate-900 dark:text-white">Privacidad y protección de tus datos</h2>
            <p className="max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Las conexiones HTTPS cifran la información en tránsito. La base de datos alojada en Supabase utiliza cifrado en reposo, según la documentación del proveedor.</p>
            <Link href="/privacidad" className="inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-cyan-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-500 dark:text-cyan-300">Conoce cómo usamos y protegemos tus datos</Link>
          </div>
        </section>

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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Identifícate para Consultar"
        description="Para evitar el spam y garantizar una atención personalizada, inicia sesión con Google antes de abrir el chat de WhatsApp."
        infoTitle="Control Antispam & Soporte Directo"
        infoDescription="Tu consulta de WhatsApp quedará vinculada a tu cuenta verificada para evitar mensajes no deseados."
        cancelLabel="Cancelar"
      />
    </footer>
  );
}
