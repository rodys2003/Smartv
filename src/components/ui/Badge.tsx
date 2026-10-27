import React from 'react';
import { cn } from '@/lib/utils';
import { TicketStatus } from '@/types';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'cyan' | 'fuchsia' | 'emerald' | 'amber' | 'slate';
  status?: TicketStatus;
  className?: string;
}

export function Badge({ children, variant = 'cyan', status, className }: BadgeProps) {
  if (status) {
    const statusMap: Record<TicketStatus, { bg: string; dot: string; label: string }> = {
      waiting: {
        bg: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300',
        dot: 'bg-amber-500 dark:bg-amber-400',
        label: 'En espera',
      },
      in_progress: {
        bg: 'bg-cyan-50 text-cyan-800 border-cyan-300 dark:bg-cyan-500/10 dark:border-cyan-500/30 dark:text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]',
        dot: 'bg-cyan-500 dark:bg-cyan-400 animate-ping',
        label: 'En atención',
      },
      completed: {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300',
        dot: 'bg-emerald-500 dark:bg-emerald-400',
        label: 'Completado',
      },
      cancelled: {
        bg: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300',
        dot: 'bg-rose-500 dark:bg-rose-400',
        label: 'Cancelado',
      },
    };

    const config = statusMap[status];

    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm',
          config.bg,
          className
        )}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />
        {children || config.label}
      </span>
    );
  }

  const variants: Record<'cyan' | 'fuchsia' | 'emerald' | 'amber' | 'slate', string> = {
    cyan: 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-500/10 dark:border-cyan-500/30 dark:text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]',
    fuchsia: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-500/10 dark:border-fuchsia-500/30 dark:text-fuchsia-300 shadow-[0_0_10px_rgba(217,70,239,0.15)]',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300',
    slate: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide uppercase',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
