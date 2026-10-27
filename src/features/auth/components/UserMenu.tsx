'use client';

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut } from 'lucide-react';
import Image from 'next/image';

interface UserMenuProps {
  onOpenAuth?: () => void;
}

export function UserMenu({ onOpenAuth }: UserMenuProps = {}) {
  const { user, isAuthenticated, signOut, loading } = useAuth();

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';

  return (
    <div className="flex shrink-0 items-center gap-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-full py-1 pl-1.5 pr-2 shadow-sm">
      <div className="flex items-center gap-2">
        {avatar ? (
          <Image
            src={avatar}
            alt={name}
            width={24}
            height={24}
            unoptimized
            className="rounded-full ring-1 ring-cyan-400/40"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="hidden sm:inline text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
          {name}
        </span>
      </div>
      <button
        onClick={() => signOut()}
        title="Cerrar sesión"
        className="flex items-center justify-center p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors ml-0.5 cursor-pointer"
        aria-label="Cerrar sesión"
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
