import { TVBrandGuide, VideoTutorial } from '@/types';

export const TAILSCALE_TUTORIAL: VideoTutorial = {
  id: 'tailscale-guide',
  title: 'Configuración Obligatoria: Instalar y Activar Tailscale',
  description:
    'Tailscale nos permite conectarnos de forma segura y remota a tu Smart TV para realizar la optimización sin necesidad de abrir puertos ni poner en riesgo tu red.',
  embedUrl: 'https://www.youtube.com/embed/Gs-Q9kkfnmU?si=kli3Y0SKs7oOb-iP',
  category: 'tailscale',
};

export const USB_DEBUGGING_VIDEOS: VideoTutorial[] = [
  {
    id: 'usb-debug-1',
    title: 'Tutorial 1: Cómo habilitar Depuración USB en Android TV / Google TV',
    description: 'Paso a paso para desbloquear el menú de opciones de desarrollador y activar la depuración USB.',
    embedUrl: 'https://www.youtube.com/embed/YZdGtqNbfXw?si=nDFlNQwXlmd1mERT',
    category: 'usb-debugging',
  },
  {
    id: 'usb-debug-2',
    title: 'Tutorial 2: Depuración por red y permisos de conexión en TV',
    description: 'Cómo aceptar la clave RSA y autorizar la conexión remota desde tu control.',
    embedUrl: 'https://www.youtube.com/embed/zCZK1BDlNWE?si=rMAdSVLzcVuIcr_G',
    category: 'usb-debugging',
  },
  {
    id: 'usb-debug-3',
    title: 'Tutorial 3: Guía alternativa para diferentes marcas Android TV',
    description: 'Procedimiento para marcas como TCL, Xiaomi, Chromecast y cajas TV Box.',
    embedUrl: 'https://www.youtube.com/embed/izcec2QCTkk?si=X8CJNESIofG5Vogu',
    category: 'usb-debugging',
  },
];

export const TV_GUIDES: TVBrandGuide[] = [
  {
    id: 'android-tv',
    name: 'Android TV / Google TV (Único Sistema Soportado)',
    logo: '📺',
    tag: 'TCL, Xiaomi, Sony Bravia, Chromecast con Google TV, Onn, TV Box Android',
    steps: [
      {
        step: 1,
        title: 'Habilitar Opciones de Desarrollador y Depuración USB',
        description:
          'Ve a Ajustes > Sistema > Información > Compilación del SO y pulsa 7 veces seguidas el botón OK hasta que aparezca el mensaje de desarrollador. Luego entra a "Opciones de desarrollador" y activa "Depuración por USB".',
        actionable: 'Mira los 3 videos tutoriales abajo para tu modelo exacto.',
      },
      {
        step: 2,
        title: 'Instalar y Activar Tailscale en tu TV (Obligatorio)',
        description:
          'Entra a Google Play Store en tu televisor, busca "Tailscale" e instálala. Inicia sesión y déjala en estado "Connected".',
        actionable: 'Anota o toma foto a la IP asignada (ej. 100.x.x.x).',
      },
      {
        step: 3,
        title: 'Test de Velocidad de Internet',
        description:
          'Descarga Speedtest o abre Fast.com en el navegador de tu TV para verificar que la red esté estable.',
        actionable: 'Toma una foto clara al resultado de velocidad en pantalla.',
      },
      {
        step: 4,
        title: 'Instalar la App Downloader by AFTVnews',
        description:
          'Instala la aplicación naranja "Downloader" desde Google Play Store para descargar el launcher optimizado.',
        actionable: 'Abre la app y acepta los permisos de almacenamiento.',
      },
    ],
    whatsappChecklist: [
      'Foto nítida de Ajustes > Información (Modelo de TV y versión de Android TV/Google TV)',
      'Foto de Tailscale en la TV con la IP visible (ej. 100.x.x.x)',
      'Foto de las Opciones de Desarrollador con Depuración USB activa',
      'Si elegiste plan de 70k: Foto o temática que deseas (Anime, Gamer, Cine)',
      'Confirmar si deseas el paquete de Apps Mágicas (+20.000 COP)',
    ],
    videos: USB_DEBUGGING_VIDEOS,
  },
];
