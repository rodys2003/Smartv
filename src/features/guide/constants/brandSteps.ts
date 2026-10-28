import { TVBrandGuide, VideoTutorial } from '@/types';

export const TAILSCALE_MANDATORY_NOTICE =
  'Requisito Excluyente: Si en tu Smart TV no es posible instalar la app Tailscale, lamentablemente no se le podrá realizar el servicio de optimización remota.';

export const TAILSCALE_TUTORIAL: VideoTutorial = {
  id: 'tailscale-guide',
  title: 'Tutorial Oficial: Cómo Instalar Tailscale y Obtener tu Código QR',
  description:
    'Tailscale nos permite conectarnos de forma segura y remota a tu Smart TV para realizar la optimización. Solo debes descargar la app en tu TV y tener listo el código QR en tu pantalla.',
  embedUrl: 'https://www.youtube.com/embed/Gs-Q9kkfnmU?si=kli3Y0SKs7oOb-iP',
  thumbnailUrl: 'https://img.youtube.com/vi/Gs-Q9kkfnmU/hqdefault.jpg',
  category: 'tailscale',
};

export const USB_DEBUGGING_VIDEOS: VideoTutorial[] = [
  {
    id: 'usb-debug-1',
    title: 'Tutorial 1: Cómo habilitar Depuración USB en Android TV / Google TV',
    description: 'Paso a paso para desbloquear el menú de opciones de desarrollador y activar la depuración USB.',
    embedUrl: 'https://www.youtube.com/embed/YZdGtqNbfXw?si=nDFlNQwXlmd1mERT',
    thumbnailUrl: 'https://img.youtube.com/vi/YZdGtqNbfXw/hqdefault.jpg',
    category: 'usb-debugging',
  },
  {
    id: 'usb-debug-2',
    title: 'Tutorial 2: Depuración por red y permisos de conexión en TV',
    description: 'Cómo aceptar la clave RSA y autorizar la conexión remota desde tu control.',
    embedUrl: 'https://www.youtube.com/embed/zCZK1BDlNWE?si=rMAdSVLzcVuIcr_G',
    thumbnailUrl: 'https://img.youtube.com/vi/zCZK1BDlNWE/hqdefault.jpg',
    category: 'usb-debugging',
  },
  {
    id: 'usb-debug-3',
    title: 'Tutorial 3: Guía alternativa para diferentes marcas Android TV',
    description: 'Procedimiento para marcas como TCL, Xiaomi, Chromecast y cajas TV Box.',
    embedUrl: 'https://www.youtube.com/embed/izcec2QCTkk?si=X8CJNESIofG5Vogu',
    thumbnailUrl: 'https://img.youtube.com/vi/izcec2QCTkk/hqdefault.jpg',
    category: 'usb-debugging',
  },
];

export const TV_GUIDES: TVBrandGuide[] = [
  {
    id: 'android-tv',
    name: 'Android TV & Google TV',
    logo: '📺',
    tag: 'TCL, Xiaomi, Sony Bravia, Chromecast con Google TV, Onn, TV Box Android',
    steps: [
      {
        step: 1,
        title: 'Activar Modo Desarrollador y Depuración USB',
        description: 'Desbloquea las opciones de desarrollador en los ajustes de tu TV y activa la depuración USB para permitir la optimización técnica.',
        actionable: 'Activa la depuración USB en tu TV (mira los videos de apoyo abajo si tienes dudas).',
        details: [
          'En tu control remoto, ingresá a Ajustes (ícono de tuerca) ➔ Preferencias del dispositivo (o Sistema) ➔ Información.',
          'Bajá hasta la opción "Compilación del SO de Android TV" (o "Número de compilación").',
          'Presioná el botón central del control 7 veces seguidas hasta que aparezca el mensaje: "¡Ya eres desarrollador!".',
          'Volvé atrás, ingresá al nuevo menú "Opciones para desarrolladores" y activá: ✅ Depuración por USB.',
        ],
      },
      {
        step: 2,
        title: 'Descargar e Instalar Tailscale en tu TV',
        description: 'Instala la app oficial y gratuita Tailscale desde la tienda de tu TV para establecer la conexión remota segura.',
        actionable: 'Instalá Tailscale en tu TV, presioná "Sign in" o "Get Started" y dejá el código QR visible en pantalla.',
        details: [
          'Abrí la Google Play Store (o tienda de aplicaciones oficial de tu Smart TV, Google TV, Fire TV o TV Box).',
          'Buscá la aplicación gratuita oficial: Tailscale.',
          'Instalala y dale a Abrir en tu televisor.',
          'Al abrir la app, presioná en "Sign in" o "Get Started". En la pantalla de tu TV aparecerá un código QR grande de vinculación.',
        ],
      },
      {
        step: 3,
        title: 'Enviar el Código QR por WhatsApp en tu Turno',
        description: 'Cuando llegue tu turno de atención, tómale una foto clara al código QR de Tailscale en tu televisor y envíanosla por WhatsApp.',
        actionable: 'Tomale una foto al QR de tu TV y envíanosla por WhatsApp junto a tu número de turno.',
        details: [
          'Mantené la pantalla de Tailscale abierta en tu TV con el código QR visible.',
          'Cuando el sistema o el técnico te avise que es tu turno de atención, abrí nuestro WhatsApp.',
          'Tomale una foto nítida con tu teléfono celular a la pantalla de tu televisor mostrando el código QR.',
          'Envianos la foto junto con tu número de turno. Al conectarnos, en tu TV aparecerá la ventana de depuración: marcá "Permitir siempre" y ACEPTAR.',
        ],
      },
    ],
    whatsappChecklist: [
      'Modo desarrollador y depuración USB activados en tu TV',
      'Tener descargada la app Tailscale en tu televisor (Requisito indispensable)',
      'Foto nítida del código QR que muestra Tailscale en la pantalla de tu TV',
      'Número de comprobante / ticket de turno obtenido en la web',
      'Si elegiste plan de 70k: Foto o temática que deseas para tu TV (Anime, Gamer, Cine)',
      'Confirmar si deseas el paquete de Apps Mágicas (+20.000 COP)',
    ],
    videos: [TAILSCALE_TUTORIAL, ...USB_DEBUGGING_VIDEOS],
  },
];
