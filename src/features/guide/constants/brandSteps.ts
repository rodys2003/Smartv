import { TVBrandGuide } from '@/types';

export const TV_GUIDES: TVBrandGuide[] = [
  {
    id: 'android-tv',
    name: 'Android TV & Google TV',
    logo: '📺',
    tag: 'Xiaomi, Sony, TCL, Chromecast, Onn, TV Box',
    steps: [
      {
        step: 1,
        title: 'Verifica la versión y modelo del televisor',
        description: 'Ve a Ajustes (icono de engranaje) > Sistema o Preferencias del dispositivo > Información / Acerca de.',
        actionable: 'Toma una foto clara a la pantalla donde se vea la "Versión de Android" y el "Modelo".',
      },
      {
        step: 2,
        title: 'Activa Opciones de Desarrollador',
        description: 'Dentro de Información, baja hasta "Compilación del SO de Android TV" y presiona 7 veces seguidas el botón OK de tu control hasta ver "¡Ya eres desarrollador!".',
        actionable: 'Nos permitirá acelerar las animaciones del sistema a 0.5x y habilitar depuración para la optimización remota.',
      },
      {
        step: 3,
        title: 'Prueba de velocidad de tu conexión',
        description: 'Abre el navegador de tu TV o descarga "Analiti / Speedtest" desde la Play Store.',
        actionable: 'Toma foto al resultado de velocidad de bajada (Mbps) y ping (latencia).',
      },
      {
        step: 4,
        title: 'Instala la aplicación Downloader',
        description: 'Busca en Google Play Store la app naranja llamada "Downloader by AFTVnews" e instálala.',
        actionable: 'Será la herramienta con la que te instalaremos el launcher ligero y tus aplicaciones.',
      },
    ],
    whatsappChecklist: [
      'Foto nítida de Ajustes > Información (Modelo y Versión de Android)',
      'Foto del test de velocidad de Internet en la TV',
      'Si elegiste plan de 70k: Qué fondo o personaje deseas (Anime, Gamer, Película)',
      'Confirmación si deseas añadir el paquete de Apps Mágicas (+20.000 COP)',
    ],
  },
  {
    id: 'samsung-tizen',
    name: 'Samsung Smart TV',
    logo: '🪐',
    tag: 'Tizen OS (Cualquier serie QLED, Crystal UHD, Neo QLED)',
    steps: [
      {
        step: 1,
        title: 'Revisar versión de Tizen y Almacenamiento',
        description: 'Presiona Inicio (Home) en el control remoto > Menú > Configuración > Soporte técnico > Acerca de este TV.',
        actionable: 'Toma una foto de la pantalla con la versión de software (ej. T-KTSU... o versión Tizen).',
      },
      {
        step: 2,
        title: 'Liberar memoria RAM (Samsung Device Care)',
        description: 'Ve a Configuración > Soporte técnico > Cuidado del dispositivo > Autodiagnóstico o Iniciar Cuidado del Dispositivo.',
        actionable: 'Ejecuta la limpieza para cerrar procesos colgados de fábrica.',
      },
      {
        step: 3,
        title: 'Desactivar Samsung TV Plus en segundo plano',
        description: 'Configuración > General > Funciones inteligentes > Desactiva Autorun Samsung TV Plus y Autorun Smart Hub.',
        actionable: 'Esto hace que el televisor encienda inmediatamente sin trabarse cargando canales automáticos.',
      },
      {
        step: 4,
        title: 'Configurar DNS de alta velocidad',
        description: 'Configuración > General > Red > Estado de red > Configuración de IP > Servidor DNS: manual.',
        actionable: 'Te daremos el DNS óptimo según tu proveedor de internet para evitar buffering.',
      },
    ],
    whatsappChecklist: [
      'Foto de Soporte técnico > Acerca de este TV',
      'Foto de Cuidado del dispositivo (Espacio disponible)',
      'Si cuentas con una memoria USB o TV Box adicional',
      'Nombre de tu proveedor de internet (Claro, Tigo, Movistar, ETB, etc.)',
    ],
  },
  {
    id: 'lg-webos',
    name: 'LG Smart TV',
    logo: '🔴',
    tag: 'webOS (OLED, NanoCell, QNED, UHD)',
    steps: [
      {
        step: 1,
        title: 'Verificar versión de webOS',
        description: 'Mantén presionado el botón de Engranaje (Ajustes) > Todos los ajustes > General > Acerca de esta TV.',
        actionable: 'Toma foto al "Modelo de TV" y "Versión de software de webOS".',
      },
      {
        step: 2,
        title: 'Desactivar QuickStart+ y Publicidad de LG',
        description: 'En General > Sistema > Ajustes adicionales > Desactiva "QuickStart+" y en Privacidad desactiva "Anuncios basados en intereses".',
        actionable: 'QuickStart+ acumula memoria residual que satura el procesador tras varios días encendido.',
      },
      {
        step: 3,
        title: 'Limpiar caché del Navegador Web',
        description: 'Abre la app Navegador de LG > Ajustes (tres puntos arriba a la derecha) > Borrar datos de navegación.',
        actionable: 'Libera hasta 500MB de memoria temporal del sistema.',
      },
      {
        step: 4,
        title: 'Modo Desarrollador LG (Si aplica para sideloading)',
        description: 'Te guiaremos para instalar Developer Mode desde la LG Content Store para instalar apps sin restricciones.',
        actionable: 'Te enviaremos los comandos exactos por WhatsApp.',
      },
    ],
    whatsappChecklist: [
      'Foto de Acerca de esta TV (Modelo exacto de LG)',
      'Foto del test de velocidad (Fast.com desde el navegador web de tu LG)',
      'Apps que más utilizas y las que deseas optimizar',
    ],
  },
  {
    id: 'amazon-firetv',
    name: 'Amazon Fire TV',
    logo: '🔥',
    tag: 'Fire TV Stick Lite, 4K, 4K Max, Cube',
    steps: [
      {
        step: 1,
        title: 'Revisar modelo y almacenamiento',
        description: 'Configuración > Mi Fire TV > Acerca de > Almacenamiento.',
        actionable: 'Toma foto de cuánto almacenamiento libre te queda (mínimo recomendamos 1.5 GB).',
      },
      {
        step: 2,
        title: 'Activar Opciones de Desarrollador en Fire OS',
        description: 'En Mi Fire TV > Acerca de, resalta el nombre de tu dispositivo y pulsa OK 7 veces seguidas.',
        actionable: 'Aparecerá el menú "Opciones de desarrollador" en Mi Fire TV.',
      },
      {
        step: 3,
        title: 'Habilitar Apps de fuentes desconocidas',
        description: 'Entra a Opciones de Desarrollador > Activa "Depuración ADB" e "Instalar apps desconocidas".',
        actionable: 'Necesario para instalar el launcher ultra-ligero y las apps mágicas.',
      },
      {
        step: 4,
        title: 'Instalar Downloader desde la tienda de Amazon',
        description: 'Busca "Downloader" en la lupa de Amazon Appstore y descárgala gratis.',
        actionable: 'Quedará lista para ingresar el código especial de instalación que te pasaremos por WhatsApp.',
      },
    ],
    whatsappChecklist: [
      'Foto de Mi Fire TV > Acerca de > Almacenamiento',
      'Captura de velocidad de conexión a Internet',
      'Si elegiste plan de 70k: Elige tu fondo (ej. Naruto, Batman, Minimalista Cyberpunk)',
      'Confirmar si deseas Apps Mágicas (+20.000 COP)',
    ],
  },
];
