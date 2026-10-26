import { ServicePlan } from '@/types';

export const MAGIC_APPS_PRICE = 20000;
export const MAGIC_APPS_PRICE_COP = 20000;
export const MAGIC_APPS_PRICE_USDT = 7;

export const PLAN_USDT_PRICES: Record<string, number> = {
  basic_20k: 7,
  ultra_light_50k: 17,
  custom_pro_70k: 23,
};

export const SERVICE_PLANS: ServicePlan[] = [
  {
    id: 'basic_20k',
    name: 'Optimización de TV',
    price: 20000,
    tagline: 'Fluidez y aceleración inmediata',
    description: 'Elimina el lag, optimiza la memoria caché y desactiva servicios en segundo plano innecesarios.',
    features: [
      'Limpieza profunda de memoria RAM y caché oculta',
      'Desactivación de telemetría y anuncios del fabricante',
      'Configuración de DNS de baja latencia para streaming',
      'Aceleración de transiciones y animaciones del sistema',
      'Diagnóstico de red y estabilidad Wi-Fi/Ethernet',
    ],
  },
  {
    id: 'ultra_light_50k',
    name: 'Optimización + Interfaz Ligera',
    price: 50000,
    popular: true,
    badge: 'MÁS POPULAR',
    tagline: 'Bajo consumo de recursos & Cero bloatware',
    description: 'Optimización completa combinada con un launcher minimalista ultra-liviano que revive cualquier televisor.',
    previewImage: '/images/minimal-theme.png',
    features: [
      'Todo lo incluido en el plan de Optimización Esencial',
      'Instalación y configuración de Launcher Ultra-Ligero',
      'Consumo mínimo de RAM (<60MB vs >400MB de interfaz de fábrica)',
      'Acceso rápido con un solo clic a todas tus apps favoritas',
      'Cero publicidad en pantalla principal',
      'Inicio instantáneo al encender el televisor',
    ],
  },
  {
    id: 'custom_pro_70k',
    name: 'Optimización + Personalización Premium',
    price: 70000,
    badge: 'NIVEL PRO',
    tagline: 'Fondo de pantalla personalizado & Estilo cinematográfico',
    description: 'La experiencia definitiva: televisor ultra rápido con estética personalizada (Anime, Gamer, Cine o Arte) a tu gusto.',
    previewImage: '/images/itachi-theme.jpg',
    features: [
      'Todo lo incluido en Optimización + Interfaz Ligera',
      'Fondo temático personalizado 4K (Anime, Gamer, Películas o Fotos propias)',
      'Dock de aplicaciones estilizado estilo consola de videojuegos',
      'Reloj digital y widgets minimalistas en pantalla principal',
      'Acomodo ergonómico de accesos directos e inputs (HDMI, Cable)',
      'Soporte prioritario 1 a 1 vía WhatsApp',
    ],
  },
];
