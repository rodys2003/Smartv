export interface SeoArticle {
  title: string;
  description: string;
  heading: string;
  intro: string;
  sections: { heading: string; paragraphs: string[] }[];
}

export const SEO_PAGES: Record<string, SeoArticle> = {
  '/servicios/optimizar-android-tv': {
    title: 'Optimizar Android TV lento | SmartvPro',
    description: 'Optimización remota de Android TV y Google TV: revisión de almacenamiento, aplicaciones y configuración. Consulta compatibilidad y planes desde $20.000 COP.',
    heading: 'Optimizar un Android TV lento sin cambiar de televisor',
    intro: 'Si tu televisor tarda en responder, primero conviene identificar si el problema está en el sistema, una aplicación o la conexión. SmartvPro ofrece atención remota para revisar tu Android TV o Google TV.',
    sections: [
      { heading: 'Qué revisamos', paragraphs: ['Revisamos el espacio disponible, las aplicaciones que ya no necesitas y la configuración del sistema. La optimización puede incluir limpieza de caché y ajustes de interfaz según el equipo.', 'No todos los bloqueos se solucionan con software. La memoria, el procesador, el estado del almacenamiento y la conexión limitan el resultado; no prometemos tiempos de arranque ni mejoras idénticas en todos los modelos.'] },
      { heading: 'Cuándo elegir una interfaz ligera', paragraphs: ['Si buscas una pantalla de inicio más simple, el plan con launcher permite organizar accesos y reducir elementos visuales donde el sistema lo permita. La publicidad dentro de Netflix, YouTube u otras aplicaciones no depende del launcher.'] },
      { heading: 'Antes de reservar', paragraphs: ['Confirma el modelo y la versión del sistema en Ajustes. El servicio está dirigido a Android TV y Google TV compatibles; Samsung Tizen y LG webOS no están incluidos. Revisa los planes vigentes en la página principal.'] },
    ],
  },
  '/servicios/personalizar-google-tv': {
    title: 'Personalizar Google TV y Android TV | SmartvPro',
    description: 'Personaliza Google TV con fondos, accesos directos y una interfaz adaptada a tu estilo. Atención remota y revisión de compatibilidad antes de instalar un launcher.',
    heading: 'Personalización de Google TV y Android TV',
    intro: 'Organiza tu pantalla de inicio para encontrar tus aplicaciones sin recorrer filas que no utilizas. Una interfaz personalizada combina accesos claros con un fondo elegido por ti.',
    sections: [
      { heading: 'Qué puedes personalizar', paragraphs: ['Según el launcher y el modelo, puedes cambiar fondos, ordenar aplicaciones y ajustar widgets disponibles. Puedes elegir una estética minimalista, gamer o cinematográfica sin modificar el hardware.', 'Usa fotografías propias o imágenes que tengas permiso de utilizar. Un fondo muy pesado o animado puede consumir más recursos; en equipos modestos conviene priorizar una interfaz estática.'] },
      { heading: 'Límites del sistema', paragraphs: ['Google TV puede restringir el cambio de pantalla de inicio o el comportamiento del botón Home. Una actualización del fabricante puede cambiar esas posibilidades. Primero revisamos la compatibilidad, sin garantizar un launcher concreto para todos los modelos.'] },
      { heading: 'Elige el alcance que necesitas', paragraphs: ['La página principal muestra los planes con interfaz ligera y personalización premium, con sus precios vigentes. La personalización no incluye suscripciones de terceros ni acceso a contenido de pago sin autorización.'] },
    ],
  },
  '/servicios/instalar-apps-android-tv': {
    title: 'Instalar aplicaciones en Android TV | SmartvPro',
    description: 'Asistencia remota para instalar y organizar aplicaciones compatibles en Android TV y Google TV. Fuentes oficiales, requisitos del dispositivo y suscripciones claras.',
    heading: 'Instalación de aplicaciones en Android TV y Google TV',
    intro: 'Te orientamos para instalar y organizar aplicaciones compatibles con tu televisor. Antes de instalar, revisamos el sistema, el espacio disponible y la procedencia de la aplicación.',
    sections: [
      { heading: 'Prioriza fuentes oficiales', paragraphs: ['Busca primero la aplicación en la tienda del televisor y consulta la información de su desarrollador. Una aplicación para teléfono no necesariamente funciona con el mando o la pantalla de Android TV.', 'No instales archivos de origen desconocido ni desactives protecciones por una promesa de contenido gratis. Los permisos solicitados deben corresponder con la función de la aplicación.'] },
      { heading: 'Qué no incluye una instalación', paragraphs: ['Instalar una aplicación no concede licencias, suscripciones ni derechos sobre películas, deportes o música. Las cuentas y los pagos de cada servicio siguen sujetos a sus condiciones. No ofrecemos acceso no autorizado a contenido de pago.'] },
      { heading: 'Confirma antes de contratar', paragraphs: ['Indica qué aplicación necesitas, el modelo de tu televisor y la versión del sistema. La disponibilidad depende del país y del dispositivo; consulta el alcance y el precio antes de reservar. Samsung Tizen y LG webOS no forman parte del servicio actual.'] },
    ],
  },
  '/compatibilidad': {
    title: 'Compatibilidad Android TV y Google TV | SmartvPro',
    description: 'Consulta qué equipos pueden optimizarse o personalizarse con SmartvPro. Android TV y Google TV sujetos a revisión; Samsung Tizen y LG webOS no incluidos.',
    heading: '¿Tu televisor es compatible con SmartvPro?',
    intro: 'La marca no basta para determinar compatibilidad. Un mismo fabricante puede vender televisores con distintos sistemas operativos; comprueba el sistema y el modelo exacto antes de reservar.',
    sections: [
      { heading: 'Android TV y Google TV: sujetos a revisión', paragraphs: ['Los servicios se orientan a equipos con Android TV o Google TV, incluidos televisores y dispositivos externos compatibles. La posibilidad de cambiar el launcher depende del modelo, los permisos disponibles y la versión del sistema.', 'Busca el nombre del modelo y la versión en Ajustes → Sistema → Información, o en la sección equivalente de tu fabricante. No compartas números de serie, contraseñas ni códigos de acceso en capturas públicas.'] },
      { heading: 'Samsung Tizen y LG webOS: no incluidos', paragraphs: ['Los servicios actuales no están disponibles para Samsung con Tizen ni LG con webOS. Si conectas un dispositivo externo Android TV o Google TV, se revisa ese dispositivo por separado; no transforma el sistema del televisor.'] },
      { heading: 'Cómo funciona la atención remota', paragraphs: ['Primero identifica tu equipo y consulta el alcance del servicio. Para administrar un turno, la plataforma utiliza inicio de sesión con Google; no necesitas iniciar sesión para leer estas guías o consultar compatibilidad por el contacto público cuando esté disponible.', 'Al elegir un plan, revisa en tu panel las instrucciones del turno y del pago antes de continuar. Confirma con el técnico los pasos, los permisos y el tiempo estimado para tu equipo. No compartas contraseñas ni autorices acceso que no entiendas.', 'El rendimiento depende del hardware y del estado del sistema. Antes de pagar, solicita las condiciones de soporte, garantía y reembolso aplicables: estas guías no establecen condiciones comerciales nuevas.'] },
    ],
  },
  '/guias/smart-tv-lento': {
    title: 'Mi Android TV está lento: qué revisar | SmartvPro',
    description: 'Guía para diagnosticar un Android TV o Google TV lento: reinicio, espacio, caché y conexión. Identifica cuándo conviene solicitar optimización profesional.',
    heading: 'Mi Smart TV está lento: qué puedo hacer',
    intro: 'Esta guía se centra en Android TV y Google TV. Distingue un menú lento de un vídeo que se detiene: el primero suele requerir revisar el equipo; el segundo también puede deberse a la red o al servicio de streaming.',
    sections: [
      { heading: '1. Reinicia y compara', paragraphs: ['Reinicia desde el menú del sistema y prueba varias aplicaciones. Si solo falla una, comprueba si hay una actualización oficial y consulta su soporte. Si todo responde lento, continúa con la revisión del almacenamiento.', 'Si el problema es la reproducción, compara otra aplicación y otro dispositivo en la misma red. No cambies el DNS esperando resolver cualquier fallo: también influyen la cobertura Wi-Fi y el proveedor del contenido.'] },
      { heading: '2. Revisa espacio y aplicaciones', paragraphs: ['Consulta el almacenamiento en Ajustes. Desinstala únicamente aplicaciones que reconozcas y que ya no uses. Puedes borrar la caché de una aplicación desde su ficha; borrar datos es distinto y puede cerrar tu sesión o eliminar preferencias.', 'No borres componentes del sistema ni uses herramientas que prometan liberar toda la RAM. Las actualizaciones oficiales y una pantalla de inicio sencilla son un punto de partida más prudente.'] },
      { heading: '3. Cuándo pedir ayuda', paragraphs: ['Si persiste la lentitud, anota el modelo, versión y cuándo ocurre. Evita restablecer de fábrica sin respaldar lo necesario y entender qué se perderá. La optimización remota permite revisar ajustes, pero no repara un fallo físico ni sustituye memoria o procesador.'] },
    ],
  },
  '/guias/cambiar-launcher-google-tv': {
    title: 'Cambiar launcher en Google TV: límites y opciones | SmartvPro',
    description: 'Qué revisar antes de cambiar el launcher de Google TV o Android TV: compatibilidad, botón Home, permisos y vuelta a la interfaz original.',
    heading: 'Cómo evaluar un cambio de launcher en Google TV',
    intro: 'Un launcher es la pantalla de inicio desde la que abres aplicaciones. Cambiarlo puede simplificar la navegación, pero no cambia el sistema operativo ni mejora por sí solo la calidad de la conexión.',
    sections: [
      { heading: '1. Comprueba modelo y versión', paragraphs: ['Revisa la información del sistema y las instrucciones oficiales del launcher elegido. Instálalo desde una fuente de confianza y comprueba que sea compatible con mando a distancia. Algunas versiones de Google TV no permiten seleccionarlo como inicio predeterminado.'] },
      { heading: '2. Prueba antes de reemplazar', paragraphs: ['Abre el launcher como una aplicación y configura pocos accesos para evaluar su comportamiento. Comprueba el mando, el botón Home y las entradas del televisor. No deshabilites ni elimines el launcher original para seguir una guía genérica.', 'Si un método requiere depuración o permisos especiales, entiende su alcance y cómo revocarlos antes de seguir. No publiques códigos de emparejamiento ni dejes accesos de depuración abiertos tras la asistencia.'] },
      { heading: '3. Mantén una forma de volver', paragraphs: ['Conserva las instrucciones para abrir Ajustes y volver al inicio del fabricante. Una actualización puede restablecer el comportamiento original. Reducir anuncios en la pantalla de inicio no elimina la publicidad dentro de aplicaciones ni sustituye suscripciones.', 'Si prefieres asistencia, consulta el servicio de personalización y confirma primero tu compatibilidad. El resultado se adapta a las restricciones reales de tu dispositivo.'] },
    ],
  },
};
