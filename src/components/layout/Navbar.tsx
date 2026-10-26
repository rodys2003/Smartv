'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { UserMenu } from '@/features/auth/components/UserMenu';
import { Tv, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenTicketModal: () => void;
  onOpenAuthModal: () => void;
}

export function Navbar({ onOpenTicketModal, onOpenAuthModal }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/75 border-b border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-2xl overflow-hidden border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.35)] group-hover:scale-105 transition-transform">
            <Image
              src="/images/logo.jpg"
              alt="Smart TV Like a Pro"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                Smart TV
              </span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-slate-950 tracking-wider">
                PRO
              </span>
            </div>
            <span className="text-[10px] text-slate-400 tracking-wide block">
              Optimización & Personalización Global
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <a href="#planes" className="hover:text-cyan-400 transition-colors">
            Planes & Precios
          </a>
          <a href="#galeria" className="hover:text-cyan-400 transition-colors">
            Galería PRO
          </a>
          <a href="#testimonios" className="hover:text-cyan-400 transition-colors">
            Clientes Satisfechos
          </a>
          <a href="#guia" className="hover:text-cyan-400 transition-colors">
            Paso a Paso TV
          </a>
          <a href="#cola" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Cola en Vivo
          </a>
        </nav>

        {/* Actions & User */}
        <div className="flex items-center gap-3">
          <UserMenu onOpenAuth={onOpenAuthModal} />

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenTicketModal}
            className="text-xs font-bold hidden sm:inline-flex"
          >
            Tomar Turno
          </Button>
        </div>
      </div>
    </header>
  );
}
