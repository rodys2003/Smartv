'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { isUserAdmin } from '@/lib/admin';
import { Button } from '@/components/ui/Button';
import { LogOut, User as UserIcon, Shield } from 'lucide-react';
import Image from 'next/image';

interface UserMenuProps {
  onOpenAuth: () => void;
}

export function UserMenu({ onOpenAuth }: UserMenuProps) {
  const { user, isAuthenticated, signOut, loading } = useAuth();

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />;
  }

  if (!isAuthenticated || !user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onOpenAuth}
        className="text-xs font-medium border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-cyan-500/60"
      >
        <UserIcon className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
        <span>Ingresar</span>
      </Button>
    );
  }

  const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';
  const isAdmin = isUserAdmin(user.email);

  return (
    <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-full py-1 pl-1.5 pr-2 shadow-sm">
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
      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
        {name}
      </span>
      {isAdmin && (
        <Link
          href="/admin"
          className="px-2 py-0.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/30 dark:border-cyan-500/40 text-[10px] font-extrabold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 dark:hover:bg-cyan-500/30 transition-colors flex items-center gap-1"
          title="Panel de Administración"
        >
          <Shield className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
          <span>ADMIN</span>
        </Link>
      )}
      <button
        onClick={() => signOut()}
        title="Cerrar sesión"
        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors ml-1 cursor-pointer"
        aria-label="Cerrar sesión"
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
