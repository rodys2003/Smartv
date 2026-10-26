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
    name: 'Android TV / Google TV',
    logo: '📺',
    tag: 'TCL, Xiaomi, Sony, Chromecast con Google TV, Onn, TV Box Android',
    steps: [
      {
        step: 1,
        title: 'Habilitar Opciones de Desarrollador y Depuración USB',
        description:
          'Ve a Ajustes > Sistema > Información > Compilación del SO y pulsa 7 veces OK. Luego entra a "Opciones de desarrollador" y activa "Depuración por USB" o "Depuración por red".',
        actionable: 'Mira la lista de videos tutoriales abajo para tu modelo exacto.',
      },
      {
        step: 2,
        title: 'Instalar y Vincular Tailscale en la TV (Obligatorio)',
        description:
          'Descarga "Tailscale" desde la Google Play Store de tu televisor. Ábrelo, inicia sesión con tu cuenta y déjalo conectado (estado "Connected").',
        actionable: 'Sigue el video tutorial de Tailscale para dejar lista la IP de conexión.',
      },
      {
        step: 3,
        title: 'Prueba de Velocidad de Conexión',
        description:
          'Abre el navegador web o descarga Speedtest en tu TV para verificar la estabilidad de tu red.',
        actionable: 'Toma una foto clara a la velocidad de descarga en pantalla.',
      },
      {
        step: 4,
        title: 'Descargar e Instalar Downloader by AFTVnews',
        description:
          'Instala la aplicación naranja "Downloader" desde Google Play Store. Servirá para descargar el launcher optimizado y las herramientas.',
        actionable: 'Confirma que Downloader abra sin problemas en tu televisor.',
      },
    ],
    whatsappChecklist: [
      'Foto nítida de Ajustes > Información (Modelo de TV y versión de Android)',
      'Foto de Tailscale en tu TV mostrando la IP asignada (ej. 100.x.x.x)',
      'Foto de la Depuración USB activada',
      'Si elegiste plan de 70k: Personaje o temática deseada (Anime, Gamer, Película)',
      'Confirmación si deseas añadir el paquete de Apps Mágicas (+20.000 COP)',
    ],
    videos: USB_DEBUGGING_VIDEOS,
  },
  {
    id: 'samsung-tizen',
    name: 'Samsung Smart TV (Tizen OS)',
    logo: '🪐',
    tag: 'Tizen OS (QLED, Crystal UHD, Neo QLED, Series 7/8/9)',
    steps: [
      {
        step: 1,
        title: 'Revisar versión de Tizen y Almacenamiento Disponible',
        description:
          'Menú > Configuración > Soporte técnico > Acerca de este TV. Revisa la versión de software.',
        actionable: 'Toma foto clara a la versión del firmware de tu Samsung.',
      },
      {
        step: 2,
        title: 'Activar Modo Desarrollador en Samsung Tizen (Apps)',
        description:
          'Abre la sección "Apps" en tu Samsung. En el control remoto presiona 1, 2, 3, 4, 5. En la ventana emergente activa "Developer Mode: ON" e ingresa la IP del host que te facilitaremos.',
        actionable: 'Te brindaremos la IP por WhatsApp cuando sea tu turno.',
      },
      {
        step: 3,
        title: 'Instalar Tailscale o puente de red remoto',
        description:
          'Configuraremos el túnel seguro para acceder al sistema Tizen y desplegar el nuevo perfil optimizado.',
        actionable: 'Mira el video de configuración de red Tailscale para sincronizar tu red.',
      },
      {
        step: 4,
        title: 'Desactivar Autorun Samsung TV Plus y Bloatware',
        description:
          'Configuración > General > Funciones inteligentes > Desactiva Autorun Samsung TV Plus y Autorun Smart Hub.',
        actionable: 'Evita que el TV se quede cargando canales publicitarios al encender.',
      },
    ],
    whatsappChecklist: [
      'Foto de Soporte técnico > Acerca de este TV',
      'Foto de la pantalla de Apps con el Developer Mode visible',
      'Foto del test de velocidad (Fast.com desde el navegador web de Samsung)',
      'Nombre de tu operador de internet para asignar los DNS óptimos',
    ],
    videos: [TAILSCALE_TUTORIAL],
  },
];
