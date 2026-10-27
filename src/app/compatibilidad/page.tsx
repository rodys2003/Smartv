import { PublicArticle } from '@/components/seo/PublicArticle';
import { SEO_PAGES } from '@/content/seo-pages';
import { pageMetadata } from '@/lib/seo';

const path = '/compatibilidad';
export const metadata = pageMetadata(path, SEO_PAGES[path].title, SEO_PAGES[path].description);

export default function CompatibilityPage() {
  return <PublicArticle path={path} />;
}
