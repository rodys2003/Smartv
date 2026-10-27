import { PublicResources } from '@/components/seo/PublicResources';
import HomePageClient from '@/components/layout/HomePageClient';
import { StructuredData } from '@/components/seo/StructuredData';
import { HOME_DESCRIPTION, HOME_TITLE, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata('/', HOME_TITLE, HOME_DESCRIPTION);

export default function HomePage() {
  return <><StructuredData /><HomePageClient><PublicResources /></HomePageClient></>;
}
