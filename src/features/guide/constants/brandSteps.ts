import { TVBrandGuide, VideoTutorial } from '@/types';

export const TAILSCALE_TUTORIAL: VideoTutorial = {
  id: 'tailscale-guide',
  title: 'Configuración Obligatoria: Instalar y Activar Tailscale',
  description:
    'Tailscale nos permite conectarnos de forma segura y remota a tu Smart TV para realizar la optimización sin necesidad de abrir puertos ni poner en riesgo tu red.',
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
        title: 'Activar el Modo Desarrollador en tu TV',
        description: 'Desbloquea las opciones de desarrollador y la depuración USB en los ajustes del sistema.',
        actionable: 'Mira los 3 videos tutoriales abajo para tu modelo si tienes dudas.',
        details: [
          'En tu control remoto, ingresá a Ajustes (ícono de tuerca) ➔ Preferencias del dispositivo (o Sistema) ➔ Información.',
          'Bajá hasta la opción "Compilación del SO de Android TV" (o "Número de compilación").',
          'Presioná el botón central del control 7 veces seguidas sobre esa opción hasta que aparezca el mensaje: "¡Ya eres desarrollador!".',
          'Volvé atrás, ingresá al nuevo menú "Opciones para desarrolladores" y activá: ✅ Depuración por USB (y si te aparece, también activá Depuración de red).',
        ],
      },
      {
        step: 2,
        title: 'Instalar y Conectar la Red Segura (Tailscale)',
        description: 'Instala la app oficial Tailscale para establecer el túnel cifrado privado.',
        actionable: 'Mantené abierta la pantalla con el código o estado de conexión de Tailscale.',
        details: [
          'Abrí la Google Play Store en tu televisor y buscá la app gratuita: Tailscale.',
          'Dale a Instalar y luego a Abrir.',
          'Presioná el botón "Get Started".',
          'Cuando el televisor te muestre la ventana: "Solicitud de conexión / Tailscale quiere configurar una VPN", seleccioná ACEPTAR.',
          'Mantené la pantalla abierta donde aparece el código o el estado de conexión.',
        ],
      },
      {
        step: 3,
        title: 'Confirmación por WhatsApp y Conexión',
        description: 'Envía tu foto a WhatsApp al iniciar tu turno para proceder con la optimización.',
        actionable: 'Envía la foto de la pantalla con Tailscale abierto y tu número de turno a WhatsApp.',
        details: [
          'Tomale una foto con tu celular a la pantalla de tu televisor mostrando la app Tailscale abierta.',
          'Escribinos a nuestro WhatsApp enviando la foto de la pantalla junto con tu número de comprobante/turno.',
          'En ese momento iniciaremos la conexión: en tu televisor aparecerá una ventana que dice "¿Permitir depuración por USB?". Solo deberás marcar la casilla "Permitir siempre" y presionar ACEPTAR.',
        ],
      },
    ],
    whatsappChecklist: [
      'Foto nítida de la pantalla de tu televisor mostrando la app Tailscale abierta',
      'Número de comprobante / ticket de turno obtenido en la web',
      'Si elegiste plan de 70k: Foto o temática que deseas para tu TV (Anime, Gamer, Cine)',
      'Confirmar si deseas el paquete de Apps Mágicas (+20.000 COP)',
    ],
    videos: USB_DEBUGGING_VIDEOS,
  },
];
