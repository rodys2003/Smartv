import Link from 'next/link';
import { ArrowLeft, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata(
  '/privacidad',
  'Privacidad y protección de datos | SmartvPro',
  'Conoce qué datos utiliza SmartvPro, cómo funciona el cifrado y cómo solicitar acceso, corrección o eliminación en aethelsoft@gmail.com.',
);

const contact = 'mailto:aethelsoft@gmail.com?subject=Solicitud%20de%20privacidad%20SmartvPro';
const sectionClass = 'scroll-mt-28 space-y-5 border-t border-slate-200 py-10 dark:border-slate-700';
const bodyClass = 'text-base leading-7 text-slate-600 dark:text-slate-300';
const dataUses = [
  { title: 'Tu cuenta', text: 'Nombre, correo e imagen de perfil que Google comparta al iniciar sesión. Se utilizan para identificar tu cuenta y asociar tus solicitudes.' },
  { title: 'Tus servicios y turnos', text: 'Datos de contacto, marca y modelo del televisor, plan elegido, estado del ticket y observaciones que facilites. Permiten organizar la atención y dar seguimiento al servicio.' },
  { title: 'Tu participación como afiliado', text: 'Nombre de perfil, WhatsApp, TikTok, código de referido y Binance UID que proporciones. Se utilizan para revisar la afiliación, atribuir ventas y gestionar comisiones y liquidaciones.' },
  { title: 'Referencias de pagos y comunicaciones', text: 'Importes, estado de las operaciones, referencias de liquidación y la información que decidas enviar al coordinar la atención. Comparte solo lo necesario para el trámite.' },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060913] dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
        <nav aria-label="Navegación de privacidad" className="mx-auto flex min-h-20 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-500">
            <span><span className="block text-sm font-black">SmartvPro</span><span className="block text-xs text-slate-600 dark:text-slate-400">Centro de privacidad</span></span>
          </Link>
          <ThemeToggle className="min-h-11 min-w-11 justify-center" />
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
        <Link href="/" className="my-5 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-500 dark:text-slate-300"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Volver al inicio</Link>
        <section className="space-y-6 pb-10 pt-3 sm:pb-14">
          <p className="flex items-center gap-2 text-sm font-semibold text-cyan-700 dark:text-cyan-300"><ShieldCheck aria-hidden="true" className="h-5 w-5" />Privacidad en SmartvPro</p>
          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">Tus datos merecen protección e información clara.</h1>
          <p className={`${bodyClass} max-w-3xl`}>Aquí puedes conocer qué información usamos para prestar el servicio, qué alcance tiene el cifrado y cómo contactar al equipo para revisar tus datos. No necesitas iniciar sesión para consultar esta página o escribirnos por privacidad.</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Última actualización: <time dateTime="2026-10-27">27 de octubre de 2026</time>.</p>
          <nav aria-label="Secciones de privacidad" className="flex flex-wrap gap-3">
            {[['#datos', 'Qué datos usamos'], ['#proteccion', 'Cómo se protegen'], ['#derechos', 'Tus solicitudes']].map(([href, label]) => <a key={href} href={href} className="inline-flex min-h-12 items-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold hover:border-cyan-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-500 dark:border-slate-700 dark:bg-slate-900">{label}</a>)}
          </nav>
        </section>

        <section id="datos" className={sectionClass}>
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Qué información utilizamos y para qué</h2>
          <dl className="grid gap-6 sm:grid-cols-2">
            {dataUses.map(item => <div key={item.title} className="space-y-2"><dt className="text-lg font-bold">{item.title}</dt><dd className={bodyClass}>{item.text}</dd></div>)}
          </dl>
        </section>

        <section id="proteccion" className={sectionClass}>
          <h2 className="flex items-center gap-3 text-2xl font-black tracking-tight sm:text-3xl"><LockKeyhole aria-hidden="true" className="h-6 w-6 shrink-0 text-cyan-700 dark:text-cyan-300" />Cómo se protegen los datos</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <article className="space-y-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-5 dark:border-cyan-800 dark:bg-cyan-950">
              <h3 className="text-lg font-bold">Cifrado en tránsito</h3>
              <p className={bodyClass}>Cuando accedes a SmartvPro por HTTPS, la conexión cifra la información entre tu navegador y el servidor mediante TLS. Utiliza siempre la dirección HTTPS del sitio.</p>
            </article>
            <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
              <h3 className="text-lg font-bold">Cifrado en reposo</h3>
              <p className={bodyClass}>Supabase, proveedor de autenticación y base de datos utilizado por SmartvPro, documenta cifrado AES-256 para los datos alojados en su infraestructura.</p>
              <a href="https://supabase.com/security" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-cyan-700 underline underline-offset-4 dark:text-cyan-300">Consultar la documentación de Supabase</a>
            </article>
          </div>
          <p className={bodyClass}>Estas medidas protegen la transmisión y el almacenamiento indicado. No equivalen a cifrado de extremo a extremo de todo el servicio ni eliminan todos los riesgos. SmartvPro necesita procesar información para gestionar las solicitudes y los pagos.</p>
          <p className={bodyClass}>No envíes contraseñas de Google o Binance, códigos de verificación, claves privadas ni frases de recuperación al equipo de soporte. En dispositivos compartidos, cierra tu sesión al terminar.</p>
        </section>

        <section id="proveedores" className={sectionClass}>
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Servicios externos y datos de tu navegador</h2>
          <p className={bodyClass}>Google interviene en el inicio de sesión y Supabase en la autenticación y la base de datos. Si decides comunicarte por WhatsApp o utilizar Binance, esas plataformas aplican sus propias condiciones y prácticas de privacidad.</p>
          <p className={bodyClass}>El enlace de consulta de WhatsApp puede preparar un mensaje con tu nombre y correo de la cuenta conectada. Revisa el contenido antes de enviarlo. Los datos compartidos en servicios externos no quedan cubiertos únicamente por las medidas de la base de datos de SmartvPro.</p>
          <p className={bodyClass}>El navegador conserva información de sesión y preferencias, como el tema visual. También puede guardar un código de referido en almacenamiento local, con validez de 30 días. Borrar ese almacenamiento puede cerrar la sesión, restablecer preferencias o eliminar la atribución del referido.</p>
        </section>

        <section id="derechos" className={sectionClass}>
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Cómo solicitar la revisión de tus datos</h2>
          <p className={bodyClass}>Puedes escribirnos para conocer qué información está asociada a tu cuenta, solicitar su corrección o actualización, pedir la eliminación o consultar el uso que se hace de ella. Las solicitudes se atienden por correo; esta página no realiza cambios ni elimina registros automáticamente.</p>
          <ol className="list-decimal space-y-3 pl-5 text-base leading-7 text-slate-600 dark:text-slate-300">
            <li>Escribe a <a href={contact} className="break-all font-semibold text-cyan-700 underline underline-offset-4 dark:text-cyan-300">aethelsoft@gmail.com</a>, preferiblemente desde el correo asociado a tu cuenta.</li>
            <li>Indica si necesitas acceso, corrección, actualización, eliminación o información sobre el tratamiento de tus datos. No adjuntes contraseñas ni documentos sensibles de forma preventiva.</li>
            <li>El equipo revisará tu solicitud y podrá pedir la información mínima necesaria para comprobar tu identidad antes de compartir o modificar datos.</li>
          </ol>
          <p className={bodyClass}>Una solicitud de eliminación puede requerir revisar obligaciones de conservación o gestiones pendientes, por ejemplo, operaciones de pago. Puedes consultar por correo qué información se conserva, por qué motivo y durante cuánto tiempo; no prometemos una eliminación inmediata de todos los registros.</p>
        </section>

        <section id="contacto" aria-labelledby="privacy-contact-title" className="scroll-mt-28 space-y-4 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-900">
          <h2 id="privacy-contact-title" className="text-2xl font-black tracking-tight">Contacto de privacidad</h2>
          <p className={bodyClass}>Para consultas sobre el tratamiento de datos en SmartvPro, contacta al equipo de desarrollo de software a la medida a través del correo indicado.</p>
          <a href={contact} className="inline-flex min-h-12 max-w-full items-center gap-3 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-500 dark:bg-cyan-400 dark:text-slate-950"><Mail aria-hidden="true" className="h-4 w-4 shrink-0" /><span className="break-all">aethelsoft@gmail.com</span></a>
          <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">No necesitas una cuenta activa para enviar una solicitud de privacidad. Abrir este enlace prepara un correo; solo se envía cuando tú lo confirmas en tu aplicación de correo.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
