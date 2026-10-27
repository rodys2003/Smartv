'use client';

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut } from 'lucide-react';
import Image from 'next/image';

function AccountAvatar({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div aria-hidden="true" className="h-6 w-6 shrink-0 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold">
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt=""
      width={24}
      height={24}
      unoptimized
      onError={() => setFailed(true)}
      className="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-cyan-400/40"
    />
  );
}

interface UserMenuProps {
  onOpenAuth?: () => void;
}

export function UserMenu(props: UserMenuProps = {}) {
  void props;
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
      <div className="hidden xl:flex [@media(hover:none)]:!hidden min-w-0 items-center gap-2">
        <AccountAvatar key={`${user.id}:${avatar || ''}`} src={avatar} name={name} />
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
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
