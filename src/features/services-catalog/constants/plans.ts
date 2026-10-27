import { ServicePlan } from '@/types';
import { getR2Url } from '@/lib/r2';

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
    tagline: 'Ajustes de rendimiento según tu equipo',
    description: 'Revisión de caché y ajustes de servicios innecesarios para mejorar el rendimiento según el modelo.',
    features: [
      'Limpieza profunda de memoria RAM y caché oculta',
      'Revisión de anuncios de la interfaz según compatibilidad',
      'Revisión de configuración de red para streaming',
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
    tagline: 'Interfaz sencilla y accesos organizados',
    description: 'Optimización completa combinada con un launcher minimalista ultra-liviano para Android TV y Google TV compatibles.',
    previewImage: getR2Url('/images/minimal-theme.png'),
    features: [
      'Todo lo incluido en el plan de Optimización Esencial',
      'Instalación y configuración de Launcher Ultra-Ligero',
      'Consumo de recursos según el launcher y el dispositivo',
      'Acceso rápido con un solo clic a todas tus apps favoritas',
      'Interfaz sin anuncios del launcher elegido, según compatibilidad',
      'Configuración de inicio según restricciones del sistema',
    ],
  },
  {
    id: 'custom_pro_70k',
    name: 'Optimización + Personalización Premium',
    price: 70000,
    badge: 'NIVEL PRO',
    tagline: 'Fondo de pantalla personalizado & Estilo cinematográfico',
    description: 'La experiencia definitiva: interfaz con estética personalizada (Anime, Gamer, Cine o Arte) a tu gusto.',
    previewImage: getR2Url('/images/itachi-theme.jpg'),
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
