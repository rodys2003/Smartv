import type { MetadataRoute } from 'next';
import { SEO_PAGES } from '@/content/seo-pages';
import { SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', ...Object.keys(SEO_PAGES)].map(path => ({ url: `${SITE_URL}${path}` }));
}
