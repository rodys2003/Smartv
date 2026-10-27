import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Coins,
  CheckCircle2,
  Clock,
  HelpCircle,
  TrendingUp,
  ArrowLeft,
  Share2,
  Wallet,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Programa de Afiliados SmartvPro | 30% de Comisión en USDT',
  description:
    'Monetiza tu comunidad recomendando el servicio líder de optimización de Smart TV y Fire TV Sticks. Gana 30% de comisión neta y cobra en USDT por Binance Pay.',
  alternates: {
    canonical: 'https://smartvpro.ordely.online/programa-afiliados',
  },
};

export default function AffiliateProgramInfoPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060913] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Bar Navigation */}
      <nav className="border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a SmartvPro</span>
          </Link>

          <Link
            href="/afiliados"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-sm shadow-cyan-600/30 cursor-pointer"
          >
            <span>Acceder al Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Programa Oficial para Creadores & Referidos</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Gana el <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-500 dark:from-cyan-400 dark:to-blue-400">30% de Comisión</span> en USDT por Cada Venta
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Recomienda nuestro servicio de optimización remota para Android TV y Fire TV Stick. 
            Sin inventarios ni complicaciones técnicas: tú compartes tu enlace, nosotros realizamos el soporte y tú cobras directamente en <strong>USDT por Binance Pay</strong>.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/afiliados"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-sm font-black bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Postularme como Afiliado</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="#reglas"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-center"
            >
              Conocer Reglas y Comisiones
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Pasos: Cómo Funciona */}
      <section className="py-12 border-y border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/50 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              ¿Cómo Funciona el Programa?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Un flujo transparente diseñado para creadores de contenido, técnicos y entusiastas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm relative">
              <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-black text-lg flex items-center justify-center">
                1
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Postúlate con Google y TikTok
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Inicia sesión con tu cuenta de Google e ingresa tu <strong>número de WhatsApp</strong> y tu <strong>cuenta de TikTok</strong> en el formulario de solicitud. Nuestro equipo revisará tu perfil para validar tu cuenta.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm relative">
              <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-black text-lg flex items-center justify-center">
                2
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Aprobación y Enlace Automático
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Al ser aprobado por el administrador, se te asignará tu <strong>código único</strong> de referido (ej. <code>/r/TU_CODIGO</code>). En ese momento podrás registrar tu <strong>Binance UID</strong> en tu panel privado.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm relative">
              <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-black text-lg flex items-center justify-center">
                3
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Cobra el 30% en USDT
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Cada vez que un cliente contrata con tu enlace, acumulas el 30% del plan neto. Podrás solicitar liquidaciones directas a tu Binance con tarifa fija de solo 2 USDT.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabla de Ganancias */}
      <section id="reglas" className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Tabla de Comisiones por Plan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Ganancias reales calculadas con base en el 30% del valor neto del servicio.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Plan de Servicio</th>
                  <th className="py-3.5 px-4 sm:px-6">Precio de Venta</th>
                  <th className="py-3.5 px-4 sm:px-6 text-cyan-600 dark:text-cyan-400 font-black">
                    Tu Comisión (30%)
                  </th>
                  <th className="py-3.5 px-4 sm:px-6">Tipo de Cliente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                  <td className="py-4 px-4 sm:px-6 font-bold text-slate-900 dark:text-white">
                    Optimización Android TV
                  </td>
                  <td className="py-4 px-4 sm:px-6 font-mono text-slate-600 dark:text-slate-400">
                    $20.000 COP / 7 USDT
                  </td>
                  <td className="py-4 px-4 sm:px-6 font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm sm:text-base">
                    $6.000 COP / 2,10 USDT
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-slate-500">
                    Smart TVs lentos o con memoria llena
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                  <td className="py-4 px-4 sm:px-6 font-bold text-slate-900 dark:text-white">
                    Interfaz Ligera (Más Vendido)
                  </td>
                  <td className="py-4 px-4 sm:px-6 font-mono text-slate-600 dark:text-slate-400">
                    $50.000 COP / 17 USDT
                  </td>
                  <td className="py-4 px-4 sm:px-6 font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm sm:text-base">
                    $15.000 COP / 5,10 USDT
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-slate-500">
                    Reemplazo de launcher pesado sin publicidad
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                  <td className="py-4 px-4 sm:px-6 font-bold text-slate-900 dark:text-white">
                    Personalización Premium
                  </td>
                  <td className="py-4 px-4 sm:px-6 font-mono text-slate-600 dark:text-slate-400">
                    $70.000 COP / 23 USDT
                  </td>
                  <td className="py-4 px-4 sm:px-6 font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm sm:text-base">
                    $21.000 COP / 6,90 USDT
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-slate-500">
                    Optimización total + apps especiales + soporte
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/40 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p className="font-bold text-cyan-900 dark:text-cyan-200">
              * Base de cálculo transparente:
            </p>
            <p>
              La comisión del 30% se calcula sobre el importe neto efectivamente cobrado del plan contratado (después de aplicar cupones de descuento). Si la venta se cobra en COP, conservas tu saldo original y se liquida a la tasa COP/USDT oficial documentada en el lote de pago.
            </p>
          </div>
        </div>
      </section>

      {/* Reglas Operativas */}
      <section className="py-12 border-t border-slate-200 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-950/40 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Reglas Claras del Programa
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cuentas claras conservan la amistad y la confianza profesional.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-xs">
                <Coins className="w-4 h-4" />
                <span>Pagos Exclusivos en USDT por Binance</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Todas las liquidaciones se pagan en USDT mediante <strong>Binance Pay (Binance UID)</strong>. Se aplica una tarifa fija de <strong>2 USDT</strong> por retiro de cualquier monto. Umbral mínimo de retiro: 5 USDT.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-xs">
                <Clock className="w-4 h-4" />
                <span>Atribución de 30 Días (Último Clic)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Cuando un usuario hace clic en tu enlace <code>/r/CODIGO</code>, el navegador guarda la cookie por 30 días. Si contrata cualquier servicio durante ese plazo, la comisión es tuya.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Periodo de Garantía (7 Días)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Las comisiones pasan a estado disponible 7 días después de finalizado el servicio técnico, garantizando la satisfacción total del cliente y evitando problemas por reembolsos.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Sin Auto-compras ni Spam</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                El sistema bloquea automáticamente auto-referidos para compras personales. Solo se premia la recomendación genuina a terceros y audiencias interesadas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Preguntas Frecuentes (FAQ) */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Preguntas Frecuentes
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Todo lo que necesitas saber antes de empezar.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-500" />
                <span>¿Quién puede postularse como afiliado?</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Cualquier persona o creador de contenido con presencia en TikTok u otras redes sociales que recomiende soluciones de entretenimiento, televisores inteligentes y tecnología.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-500" />
                <span>¿Cuándo configuro mi cuenta de Binance UID?</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Por seguridad y orden, la configuración de Binance UID se habilita una vez que el administrador revisa tu postulación y activa tu cuenta de afiliado en el sistema.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-500" />
                <span>¿Cómo sabe el sistema que un cliente vino de mi parte?</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tu enlace oficial de referido (ej. <code>/r/TU_CODIGO</code>) guarda una cookie de 30 días en el dispositivo del cliente. Al solicitar el servicio, el ticket se asocia automáticamente a tu cuenta y muestra la insignia: <em>&ldquo;Recomendado por ti&rdquo;</em>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner Final */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white p-8 sm:p-12 text-center space-y-6 shadow-2xl shadow-cyan-600/20">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            ¿Listo para Empezar a Generar Ingresos en USDT?
          </h2>
          <p className="text-xs sm:text-sm text-cyan-100 max-w-xl mx-auto leading-relaxed">
            Inicia sesión con tu cuenta de Google, indícanos tu WhatsApp y cuenta de TikTok, y únete hoy al equipo de afiliados de SmartvPro.
          </p>
          <div className="pt-2">
            <Link
              href="/afiliados"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-black bg-white text-cyan-700 hover:bg-cyan-50 transition-all shadow-lg shadow-black/10 cursor-pointer"
            >
              <span>Postularme Ahora</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
