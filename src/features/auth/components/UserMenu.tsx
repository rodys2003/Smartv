'use client';

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { LogOut, User as UserIcon } from 'lucide-react';
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
        className="text-xs font-medium border-slate-700 bg-slate-900/60 hover:border-cyan-500/60"
      >
        <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
        <span>Ingresar</span>
      </Button>
    );
  }

  const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';

  return (
    <div className="flex items-center gap-2.5 bg-slate-900/80 border border-slate-800 rounded-full py-1 pl-1.5 pr-2">
      {avatar ? (
        <Image
          src={avatar}
          alt={name}
          width={24}
          height={24}
          className="rounded-full ring-1 ring-cyan-400/40"
        />
      ) : (
        <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <span className="text-xs font-semibold text-slate-200 max-w-[100px] truncate">
        {name}
      </span>
      <button
        onClick={() => signOut()}
        title="Cerrar sesión"
        className="p-1 text-slate-400 hover:text-rose-400 transition-colors ml-1 cursor-pointer"
        aria-label="Cerrar sesión"
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
