import Link from 'next/link';
import { SEO_PAGES } from '@/content/seo-pages';

export function PublicResources() {
  return <section className="mx-auto max-w-6xl px-6 py-16 space-y-6">
    <h2 className="text-3xl font-black">Servicios y guías para tu Android TV</h2>
    <p className="text-slate-600 dark:text-slate-300">Atención remota desde Colombia. Consulta compatibilidad y aprende qué puedes mejorar antes de reservar.</p>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.entries(SEO_PAGES).map(([path, page]) => <Link key={path} href={path} className="rounded-2xl border border-slate-300 dark:border-slate-700 p-5 hover:border-cyan-500">
        <h3 className="font-bold text-cyan-700 dark:text-cyan-300">{page.heading}</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{page.description}</p>
      </Link>)}
    </div>
  </section>;
}
