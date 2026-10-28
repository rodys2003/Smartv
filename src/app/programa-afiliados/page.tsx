import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Wallet } from 'lucide-react';
import { AffiliateHeader } from '@/features/affiliates/components/AffiliateHeader';
import { Footer } from '@/components/layout/Footer';
import { SERVICE_PLANS, PLAN_USDT_PRICES } from '@/features/services-catalog/constants/plans';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata(
  '/programa-afiliados',
  'Afiliados SmartvPro | Recomienda Android TV y gana el 30%',
  'Recomienda optimización y personalización de Android TV y Google TV. Solicita tu activación manual, comparte tu enlace y cobra comisiones en USDT por Binance.',
);

const actionClass = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-cyan-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-500 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300';
const cop = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
const usdt = (value: number) => `${value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`;
const steps = [
  { title: 'Envía tu solicitud', text: 'Inicia sesión con Google y completa tu nombre, WhatsApp y cuenta de TikTok. Puedes editar el nombre sugerido antes de enviar.' },
  { title: 'Espera la aprobación manual', text: 'Revisamos tu perfil. Cuando se active tu cuenta, encontrarás tu enlace personal y podrás registrar tu Binance UID en el panel.' },
  { title: 'Comparte y consulta tus comisiones', text: 'Recomienda servicios compatibles a tu comunidad. Sigue tus ventas y distingue las comisiones estimadas, en validación, disponibles y pagadas.' },
];
const faqs = [
  { question: '¿Necesito hacer la optimización del televisor?', answer: 'No. Tú recomiendas el servicio y compartes tu enlace; SmartvPro se encarga de la atención técnica remota. Explica el alcance con claridad: trabajamos con Android TV y Google TV compatibles, no con Samsung Tizen ni LG webOS.' },
  { question: '¿Mi cuenta se activa al enviar el formulario?', answer: 'No. La aprobación es manual. Tu WhatsApp y TikTok permiten revisar la solicitud y coordinar contigo. No se garantiza la aprobación ni un plazo de respuesta concreto.' },
  { question: '¿Cómo se atribuye una venta a mi enlace?', answer: 'El referido se guarda durante 30 días en el navegador del cliente. Se utiliza el último enlace válido antes de crear el ticket. El registro puede perderse si cambia de dispositivo o borra las cookies; no se permiten autorreferidos.' },
  { question: '¿Crear un ticket ya genera dinero disponible?', answer: 'No. Una reserva puede aparecer como comisión estimada. La comisión queda disponible 7 días después de que el administrador confirme el pago de la venta. Crear el ticket o comenzar el servicio no inicia ese plazo.' },
  { question: '¿Cuánto cuesta retirar y cuándo registro mi Binance UID?', answer: 'Registras tu Binance UID después de la activación. Los retiros se pagan en USDT por Binance, con mínimo de 5 USDT brutos y una tarifa fija del programa de 2 USDT por retiro, para cualquier monto. No es una tarifa de red. Por ejemplo, un retiro bruto de 5 USDT deja 3 USDT netos.' },
];

export default function AffiliateProgramInfoPage() {
  return <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060913] dark:text-slate-100">
    <AffiliateHeader />
    <main id="contenido">
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-cyan-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-500 dark:text-slate-300 dark:hover:text-cyan-300"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          <span>Volver al inicio</span>
        </Link>
      </div>
      <section className="relative overflow-hidden px-4 py-8 sm:px-6 sm:py-16">
        <div aria-hidden="true" className="pointer-events-none absolute right-0 top-10 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl dark:bg-fuchsia-500/10" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-sm font-semibold text-cyan-900 dark:border-cyan-700 dark:bg-cyan-950 dark:text-cyan-200"><CheckCircle2 aria-hidden="true" className="h-4 w-4" /> Programa de afiliados SmartvPro</p>
            <h1 className="max-w-xl text-4xl font-black leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">Recomienda SmartvPro.<br /><span className="text-cyan-700 dark:text-cyan-300">Gana el 30% por cada plan.</span></h1>
            <p className="max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">Ayuda a tu comunidad a descubrir una mejor experiencia en Android TV y Google TV. Comparte tu enlace; nosotros realizamos el servicio remoto y tú recibes comisiones por ventas válidas.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/afiliados" className={actionClass}>Solicitar afiliación <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
              <Link href="#comisiones" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-bold hover:border-cyan-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-500 dark:border-slate-700 dark:bg-slate-900">Ver comisiones y condiciones</Link>
            </div>
            <p className="flex items-start gap-2 text-sm leading-6 text-slate-600 dark:text-slate-400"><ShieldCheck aria-hidden="true" className="mt-1 h-4 w-4 shrink-0" /> Activación manual. Cobros en USDT por Binance. Sin promesas de ingresos garantizados.</p>
          </div>
          <div className="space-y-4">
            <div className="overflow-hidden rounded-3xl border border-slate-300 bg-slate-950 p-2 shadow-xl dark:border-slate-700">
              <Image src="/images/itachi-theme-optimized.webp" alt="Ejemplo de una interfaz Android TV personalizada por SmartvPro" width={1024} height={576} sizes="(max-width: 1024px) 100vw, 560px" priority className="h-auto w-full rounded-2xl" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div><p className="text-sm text-slate-600 dark:text-slate-300">Ejemplo: plan Premium vendido en USDT</p><p className="mt-1 text-sm">{PLAN_USDT_PRICES.custom_pro_70k} USDT × 30% de comisión</p></div>
              <div><p className="text-3xl font-black text-cyan-700 dark:text-cyan-300">{usdt(PLAN_USDT_PRICES.custom_pro_70k * 0.3)}</p><p className="text-xs text-slate-500 dark:text-slate-400">Sin descuentos, antes de tarifa de retiro</p></div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="como-funciona" className="border-y border-slate-200 bg-white px-4 py-14 sm:px-6 dark:border-slate-800 dark:bg-slate-950/60">
        <div className="mx-auto max-w-6xl">
          <h2 id="como-funciona" className="text-3xl font-black tracking-tight">De tu recomendación a tu primera comisión</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">Antes de compartir un enlace, necesitamos conocer tu perfil y activar tu cuenta.</p>
          <ol className="mt-8 grid gap-8 md:grid-cols-3">{steps.map((step, index) => <li key={step.title} className="border-l-2 border-cyan-300 pl-5 dark:border-cyan-800">
            <span className="text-sm font-bold text-cyan-700 dark:text-cyan-300">Paso {index + 1}</span>
            <h3 className="mt-2 text-xl font-bold">{step.title}</h3>
            <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">{step.text}</p>
          </li>)}</ol>
        </div>
      </section>

      <section id="comisiones" aria-labelledby="comisiones-titulo" className="scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl space-y-8">
          <div><h2 id="comisiones-titulo" className="text-3xl font-black tracking-tight">Tus comisiones, con números claros</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">Ejemplos al 30% sobre el precio del plan, sin descuentos. Los valores COP y USDT son precios de venta independientes, no una tasa de conversión.</p></div>
          <div className="grid gap-5 md:grid-cols-3">{SERVICE_PLANS.map(plan => <article key={plan.id} className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="min-h-14 text-xl font-bold leading-7">{plan.name}</h3>
            <dl className="mt-5 space-y-5">
              <div className="border-t border-slate-200 pt-4 dark:border-slate-700"><dt className="text-sm text-slate-600 dark:text-slate-400">Venta en Colombia: {cop(plan.price)} COP</dt><dd className="mt-1 text-2xl font-black text-cyan-700 dark:text-cyan-300">{cop(plan.price * 0.3)} <span className="text-sm font-semibold">COP de comisión</span></dd></div>
              <div className="border-t border-slate-200 pt-4 dark:border-slate-700"><dt className="text-sm text-slate-600 dark:text-slate-400">Venta en USDT: {PLAN_USDT_PRICES[plan.id]} USDT</dt><dd className="mt-1 text-2xl font-black text-cyan-700 dark:text-cyan-300">{usdt(PLAN_USDT_PRICES[plan.id] * 0.3)} <span className="text-sm font-semibold">de comisión</span></dd></div>
            </dl>
          </article>)}</div>
          <p className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5 text-sm leading-7 text-cyan-950 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-100">La comisión se calcula sobre el importe neto del plan efectivamente cobrado, después de descuentos. Si la venta se cobra en COP, el administrador configura la tasa COP/USDT. Verás la tasa y el neto antes de solicitar el retiro; ambos quedan congelados al confirmar. Sin tasa configurada, las comisiones COP quedan pendientes de conversión. Los ejemplos no representan ingresos garantizados ni el importe neto de un retiro.</p>
        </div>
      </section>

      <section id="reglas" aria-labelledby="condiciones-titulo" className="scroll-mt-24 border-y border-slate-200 bg-white px-4 py-14 sm:px-6 dark:border-slate-800 dark:bg-slate-950/60">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_2fr]">
          <div><Wallet aria-hidden="true" className="mb-4 h-7 w-7 text-cyan-600 dark:text-cyan-300" /><h2 id="condiciones-titulo" className="text-3xl font-black tracking-tight">Lo que debes saber antes de postularte</h2><p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">Condiciones visibles desde el principio, no al momento de retirar.</p></div>
          <dl className="grid gap-6 sm:grid-cols-2">
            <div><dt className="text-lg font-bold">Retiro mínimo: 5 USDT</dt><dd className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">Pago exclusivamente en USDT por Binance. Tarifa del programa: 2 USDT por retiro. Se descuenta del importe bruto solicitado.</dd></div>
            <div><dt className="text-lg font-bold">Referido válido por 30 días</dt><dd className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">Se atribuye al último enlace válido antes de crear el ticket. La reserva no equivale a un pago confirmado.</dd></div>
            <div><dt className="text-lg font-bold">Validación de 7 días</dt><dd className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">Puedes retirar la comisión 7 días después del pago de la venta confirmado por el administrador. Los fondos reservados para un retiro no vuelven a estar disponibles mientras se revisa.</dd></div>
            <div><dt className="text-lg font-bold">Recomendaciones responsables</dt><dd className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">Sin autorreferidos, spam ni promesas de compatibilidad universal. Samsung Tizen y LG webOS no están incluidos.</dd></div>
          </dl>
        </div>
      </section>

      <section aria-labelledby="preguntas-titulo" className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <h2 id="preguntas-titulo" className="mb-8 text-3xl font-black tracking-tight">Resuelve tus dudas</h2>
        <div className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-700 dark:border-slate-700">{faqs.map(faq => <details key={faq.question} className="group py-5">
          <summary className="cursor-pointer rounded-lg pr-2 text-base font-bold leading-7 marker:text-cyan-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-500 dark:marker:text-cyan-300">{faq.question}</summary>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">{faq.answer}</p>
        </details>)}</div>
      </section>

      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-3xl border border-cyan-200 bg-cyan-50 p-6 sm:p-10 lg:flex-row lg:items-center dark:border-cyan-800 dark:bg-cyan-950">
          <div className="max-w-2xl"><h2 className="text-2xl font-black tracking-tight sm:text-3xl">Comparte lo que SmartvPro puede hacer por un Android TV.</h2><p className="mt-3 text-base leading-7 text-slate-700 dark:text-slate-300">Necesitas tu cuenta de Google, un WhatsApp de contacto y tu perfil de TikTok. Nosotros revisamos la solicitud; tú decides cómo presentarte.</p></div>
          <Link href="/afiliados" className={`${actionClass} shrink-0`}>Solicitar afiliación <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
        </div>
      </section>
    </main>
    <Footer />
  </div>;
}
