import Link from 'next/link';
import { SEO_PAGES } from '@/content/seo-pages';
import { Footer } from '@/components/layout/Footer';

export function PublicArticle({ path }: { path: string }) {
  const article = SEO_PAGES[path];
  return <>
    <main className="mx-auto w-full max-w-4xl px-6 py-12 space-y-8">
      <Link href="/" className="text-cyan-700 dark:text-cyan-300">← SmartvPro · Inicio</Link>
      <header className="space-y-4">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight">{article.heading}</h1>
        <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">{article.intro}</p>
      </header>
      {article.sections.map(section => <section key={section.heading} className="space-y-3">
        <h2 className="text-2xl font-bold">{section.heading}</h2>
        {section.paragraphs.map(paragraph => <p key={paragraph} className="leading-relaxed text-slate-700 dark:text-slate-300">{paragraph}</p>)}
      </section>)}
      <Link href="/#planes" className="inline-block rounded-xl bg-cyan-600 px-6 py-3 font-bold text-white">Ver planes y reservar</Link>
      <nav aria-label="Servicios y guías relacionadas" className="space-y-3 border-t border-slate-300 pt-6">
        <h2 className="text-xl font-bold">Servicios y guías relacionadas</h2>
        <ul className="space-y-2">{Object.entries(SEO_PAGES).filter(([url]) => url !== path).map(([url, page]) => <li key={url}><Link href={url} className="text-cyan-700 dark:text-cyan-300 underline">{page.heading}</Link></li>)}</ul>
      </nav>
    </main>
    <Footer />
  </>;
}
