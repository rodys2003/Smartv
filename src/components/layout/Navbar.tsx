'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { UserMenu } from '@/features/auth/components/UserMenu';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  isAuthenticated: boolean;
  onOpenTicketModal?: () => void;
  onOpenAuthModal: () => void;
}

export function Navbar({ isAuthenticated, onOpenAuthModal }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-slate-950/75 border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex min-w-0 items-center group">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-slate-900 dark:text-white tracking-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                Smart TV
              </span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-slate-950 tracking-wider">
                PRO
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 tracking-wide block">
              Optimización & Personalización Global
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="flex shrink-0 items-center gap-4 xl:gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <a href="#planes" className="hidden xl:inline hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
            Planes & Precios
          </a>
          <a href="#galeria" className="hidden xl:inline hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
            Galería PRO
          </a>
          <a href="#testimonios" className="hidden xl:inline hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
            Clientes Satisfechos
          </a>
          {isAuthenticated && (
            <Link
              href="/dashboard"
              aria-label="Mi Panel de Turnos"
              className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors flex items-center gap-1.5 font-bold"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden md:inline whitespace-nowrap">Mi Panel de Turnos</span>
            </Link>
          )}
        </nav>

        {/* Actions & User */}
        <div className="flex shrink-0 items-center gap-2.5">
          <ThemeToggle />

          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenAuthModal}
              className="text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] whitespace-nowrap"
            >
              <span>Ingresar con Google</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
