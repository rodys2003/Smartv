import { notFound } from 'next/navigation';
import { PublicArticle } from '@/components/seo/PublicArticle';
import { SEO_PAGES } from '@/content/seo-pages';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(SEO_PAGES).filter(path => path.startsWith('/servicios/')).map(path => ({ slug: path.split('/')[2] }));
}

export async function generateMetadata({ params }: Props) {
  const path = `/servicios/${(await params).slug}`;
  const article = SEO_PAGES[path];
  if (!article) notFound();
  return pageMetadata(path, article.title, article.description);
}

export default async function ArticlePage({ params }: Props) {
  const path = `/servicios/${(await params).slug}`;
  if (!SEO_PAGES[path]) notFound();
  return <PublicArticle path={path} />;
}
