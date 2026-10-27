import { SERVICE_PLANS } from '@/features/services-catalog/constants/plans';
import { SITE_NAME, SITE_URL } from '@/lib/seo';

export function StructuredData() {
  const organization = `${SITE_URL}/#organization`;
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': organization, name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/images/logo-optimized.webp` },
      { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: SITE_NAME, url: SITE_URL, inLanguage: 'es-CO', publisher: { '@id': organization } },
      ...SERVICE_PLANS.map(plan => ({
        '@type': 'Service', '@id': `${SITE_URL}/#${plan.id}`,
        name: plan.name, description: 'Servicio remoto para optimizar o personalizar Android TV y Google TV compatibles. El resultado depende del modelo y del sistema.',
        serviceType: plan.name, url: `${SITE_URL}/#planes`, provider: { '@id': organization },
        offers: { '@type': 'Offer', price: plan.price, priceCurrency: 'COP', url: `${SITE_URL}/#planes` },
      })),
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
