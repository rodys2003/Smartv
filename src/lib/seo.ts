import type { Metadata } from 'next';

export const SITE_URL = 'https://smartvpro.ordely.online';
export const SITE_NAME = 'SmartvPro';
export const HOME_TITLE = 'Optimización y Personalización Android TV | SmartvPro';
export const HOME_DESCRIPTION = '¿Tu Android TV o Google TV está lento? Mejoramos su rendimiento, instalamos interfaces ligeras y personalizamos tu pantalla. Servicio remoto desde $20.000 COP.';

export function pageMetadata(path: string, title: string, description: string): Metadata {
  return {
    title, description, alternates: { canonical: path },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website', locale: 'es_CO', siteName: SITE_NAME,
      url: path, title, description,
      images: [{ url: '/images/itachi-theme-optimized.webp', width: 1024, height: 576, alt: 'Interfaz de Android TV personalizada por SmartvPro' }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/images/itachi-theme-optimized.webp'] },
  };
}
