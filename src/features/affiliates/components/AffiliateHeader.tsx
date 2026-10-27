import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function AffiliateHeader({ showPortalLink = true }: { showPortalLink?: boolean }) {
  return <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
    <nav aria-label="Navegación de afiliados" className="mx-auto flex min-h-20 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
      <Link href="/" className="flex min-w-0 items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-500">
        <span><span className="block whitespace-nowrap text-sm font-black tracking-tight">Smart TV <span className="rounded bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-1 text-slate-950">PRO</span></span>
          <span className="block text-xs text-slate-600 dark:text-slate-400">Afiliados SmartvPro</span></span>
      </Link>
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle className="min-h-11 min-w-11 justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500" />
        {showPortalLink && <Link href="/afiliados" className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-3 text-sm font-bold transition-colors hover:border-cyan-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 dark:border-slate-700">Mi panel</Link>}
      </div>
    </nav>
  </header>;
}
