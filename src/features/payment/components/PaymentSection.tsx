'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Ticket } from '@/types';
import {
  formatCOP,
  formatTicketNumber,
  parseTicketPaymentInfo,
} from '@/lib/utils';
import {
  PLAN_USDT_PRICES,
  MAGIC_APPS_PRICE_USDT,
} from '@/features/services-catalog/constants/plans';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  CreditCard,
  QrCode,
  Copy,
  Check,
  MessageCircle,
  ShieldCheck,
  AlertTriangle,
  Coins,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface PaymentSectionProps {
  userTicket?: Ticket | null;
}

export function PaymentSection({ userTicket }: PaymentSectionProps) {
  const paymentInfo = parseTicketPaymentInfo(userTicket);

  const [activeMethod, setActiveMethod] = useState<'bre_b' | 'binance'>(
    userTicket && paymentInfo.isCrypto ? 'binance' : 'bre_b'
  );
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCryptoAddress, setCopiedCryptoAddress] = useState(false);

  const breBKey = '@DAVIRRS582';
  const binanceAddress = 'TUXZ3iN4XaT6t5NjpWLbvA3GpcdpaWCgYT';
  const binanceNetwork = 'TRX Tron (TRC20)';
  const binanceAsset = 'USDT';

  // Fixed USDT pricing calculation:
  // 7 USDT optimizacion, 17 USDT interfaz ligera, 23 USDT custom pro, 7 USDT magic apps
  const getTicketUsdtPrice = (ticket?: Ticket | null) => {
    if (!ticket) return 17;
    const base = PLAN_USDT_PRICES[ticket.service_tier] ?? 17;
    return base + (ticket.has_magic_apps ? MAGIC_APPS_PRICE_USDT : 0);
  };

  const handleCopyBreBKey = async () => {
    try {
      await navigator.clipboard.writeText(breBKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2500);
    } catch (err) {
      console.error('Failed to copy Bre-B key:', err);
    }
  };

  const handleCopyBinanceAddress = async () => {
    try {
      await navigator.clipboard.writeText(binanceAddress);
      setCopiedCryptoAddress(true);
      setTimeout(() => setCopiedCryptoAddress(false), 2500);
    } catch (err) {
      console.error('Failed to copy Binance address:', err);
    }
  };

  const handleSendPaymentSupportWhatsApp = () => {
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573105555555';
    const ticketStr = userTicket
      ? formatTicketNumber(userTicket.ticket_number)
      : 'mi turno';
    const planStr = userTicket ? ` (${userTicket.service_name})` : '';

    let text = '';
    if (activeMethod === 'bre_b') {
      const amountStr = userTicket ? formatCOP(userTicket.total_price) : '';
      text = encodeURIComponent(
        `¡Hola! Ya realicé el pago de ${ticketStr}${amountStr ? ` por valor de ${amountStr}` : ''}${planStr} mediante llave Bre-B (${breBKey}). Adjunto el comprobante de pago para continuar con la optimización de mi Smart TV.`
      );
    } else {
      const usdtVal = userTicket ? `${getTicketUsdtPrice(userTicket)} USDT` : 'USDT';
      text = encodeURIComponent(
        `¡Hola! Ya realicé el pago de ${ticketStr} (${usdtVal})${planStr} a través de Binance en USDT por la red ${binanceNetwork} a la dirección ${binanceAddress}. Adjunto el comprobante / captura de la transacción para continuar con la optimización.`
      );
    }

    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <section id="pago" className="py-12 md:py-16 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <Badge variant="cyan" className="mb-2.5">
            Medios de Pago Oficiales
          </Badge>
          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight">
            Instrucciones y Métodos de Pago
          </h2>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            Aceptamos transferencias nacionales por llave Bre-B y pagos internacionales en USDT vía Binance.
          </p>
        </div>

        {/* Golden Rule Notice: PAY ONLY AFTER TECH CONNECTS */}
        <div className="mb-8 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 border border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.15)] flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm md:text-base font-extrabold text-white flex items-center gap-2">
              <span>¿Cuándo debes realizar el pago?</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                Cero Riesgo · Sin Anticipos
              </span>
            </h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              <strong>El pago se realiza únicamente cuando el técnico se conecte a tu televisor</strong> (una vez aceptes la ventana de depuración USB en tu pantalla). En ese momento realizas el pago por Bre-B o Binance y nos envías el comprobante por WhatsApp para proceder de inmediato con la optimización.
            </p>
          </div>
        </div>

        {/* Method Switcher Tabs */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-2 max-w-md w-full shadow-lg">
            <button
              type="button"
              onClick={() => setActiveMethod('bre_b')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeMethod === 'bre_b'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.35)] scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>🇨🇴 Llave Bre-B (Colombia)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMethod('binance')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeMethod === 'binance'
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.35)] scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Coins className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>🌐 Binance (USDT TRC20)</span>
            </button>
          </div>
        </div>

        {/* METHOD 1: BRE-B */}
        {activeMethod === 'bre_b' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column: Key & Instructions */}
            <div className="lg:col-span-7 bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xl space-y-6">
              <div>
                {/* Ticket Price Highlight */}
                {userTicket ? (
                  <div className="mb-6 p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-cyan-300 tracking-wider block">
                        Total a pagar para tu turno:
                      </span>
                      <span className="text-xs text-white font-semibold">
                        {formatTicketNumber(userTicket.ticket_number)} · {userTicket.service_name}
                        {userTicket.has_magic_apps && (
                          <span className="text-fuchsia-400 font-bold ml-1">+ Apps Mágicas</span>
                        )}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-cyan-400 block">
                        {formatCOP(userTicket.total_price)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                    <span className="text-slate-400 block mb-0.5">Tarifa según tu plan:</span>
                    <span className="text-white font-bold">
                      Desde 20.000 COP (Básica) hasta 70.000 COP (PRO Itachi Akatsuki) + Add-ons.
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Opción 1: Transferir por Llave Bre-B
                      </h3>
                      <p className="text-xs text-slate-400">
                        Compatible con Daviplata, Nequi, Bancolombia, Nu, Dale, Lulo y demás bancos de Colombia.
                      </p>
                    </div>
                  </div>

                  {/* Copyable Key Box */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                    <div className="text-center sm:text-left">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Llave Bre-B Oficial:
                      </span>
                      <span className="text-2xl font-mono font-black text-white tracking-wider select-all">
                        {breBKey}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyBreBKey}
                      className={`w-full sm:w-auto px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                        copiedKey
                          ? 'bg-emerald-500 text-slate-950 scale-105'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                      }`}
                    >
                      {copiedKey ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>¡Llave Copiada!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar Llave</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Instructions list */}
                  <div className="space-y-2 pt-2 text-xs text-slate-300 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
                    <p className="font-bold text-white mb-1">Pasos sencillos para transferir:</p>
                    <p className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <span>Abre tu app bancaria o billetera digital favorita en tu celular.</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        Selecciona la opción <strong>Transferir con Llave Bre-B</strong> y pega <strong>{breBKey}</strong>.
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <span>Ingresa el valor de tu plan, confirma la transacción y toma captura del comprobante.</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Receipt Button */}
              <div className="pt-4 border-t border-slate-800">
                <Button
                  variant="whatsapp"
                  size="lg"
                  onClick={handleSendPaymentSupportWhatsApp}
                  className="w-full text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar Soporte de Bre-B a WhatsApp</span>
                </Button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  Envíanos la captura una vez realizada la transferencia para confirmar de inmediato.
                </p>
              </div>
            </div>

            {/* Right Column: Bre-B QR Code */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-between shadow-xl text-center">
              <div className="w-full space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="p-2 rounded-xl bg-fuchsia-500/20 text-fuchsia-400">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Opción 2: Escanear Código QR Bre-B
                  </h3>
                </div>

                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Abre la cámara de pagos o escáner QR de tu aplicación bancaria y apunta a este código.
                </p>

                {/* QR Code Container */}
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto bg-white p-3 rounded-3xl shadow-[0_0_35px_rgba(255,255,255,0.15)] flex items-center justify-center overflow-hidden border-2 border-red-500">
                  <Image
                    src="/images/bre-b-qr.png"
                    alt="Código QR Bre-B para pagos"
                    fill
                    className="object-contain p-2"
                    priority
                  />
                </div>

                <div className="pt-2 text-center">
                  <span className="text-[11px] font-mono text-cyan-300 bg-slate-950 px-3 py-1 rounded-full border border-slate-800 inline-block">
                    Llave asociada: {breBKey}
                  </span>
                </div>
              </div>

              <div className="w-full mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                Acepta transferencias inmediatas sin costo desde todas las entidades adscritas a Bre-B.
              </div>
            </div>
          </div>
        )}

        {/* METHOD 2: BINANCE USDT (TRC20) */}
        {activeMethod === 'binance' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column: Crypto specs, Address & Copy */}
            <div className="lg:col-span-7 bg-slate-900/90 border border-amber-500/40 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xl space-y-6">
              <div>
                {/* Ticket Price Equivalent in USDT */}
                {userTicket ? (
                  <div className="mb-6 p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block">
                        Total a pagar en Binance:
                      </span>
                      <span className="text-xs text-white font-semibold">
                        {formatTicketNumber(userTicket.ticket_number)} · {userTicket.service_name}
                        {userTicket.has_magic_apps && (
                          <span className="text-fuchsia-400 font-bold ml-1">+ Apps Mágicas (+7 USDT)</span>
                        )}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-amber-400 block font-mono">
                        {getTicketUsdtPrice(userTicket)} USDT
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                    <span className="text-slate-400 block mb-0.5">Tarifas oficiales en Binance:</span>
                    <span className="text-white font-bold">
                      7 USDT (Optimización) · 17 USDT (Optimización + Interfaz Ligera) · 23 USDT (Personalización Premium) · +7 USDT (Apps Mágicas).
                    </span>
                  </div>
                )}

                {/* Critical Network Warning */}
                <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-start gap-3 text-xs text-amber-200">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300 block mb-0.5">
                      ¡Atención! Red requerida: TRX Tron (TRC20)
                    </span>
                    <span>
                      Debes seleccionar obligatoriamente la red <strong>TRX Tron (TRC20)</strong>. Si envías por otra red (como BSC o Ethereum), los fondos podrían perderse.
                    </span>
                  </div>
                </div>

                {/* Configuration Specs matching the screenshot */}
                <div className="space-y-3 mb-5">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">1. Activo / Moneda:</span>
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span>USDT (Tether USD)</span>
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">2. Red de Transferencia:</span>
                    <span className="font-bold text-amber-300">
                      TRX Tron (TRC20)
                    </span>
                  </div>
                </div>

                {/* Copyable Address Box with Screenshot-exact Highlighting */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    3. Dirección de Depósito Oficial:
                  </span>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_20px_rgba(251,191,36,0.15)]">
                    <div className="text-center sm:text-left min-w-0 flex-1">
                      <span className="text-xs sm:text-sm font-mono font-bold text-white tracking-wide break-all block">
                        <span className="text-amber-400 font-extrabold">TUXZ3I</span>
                        <span>N4XaT6t5NjpWLbvA3Gpcdp</span>
                        <span className="text-amber-400 font-extrabold">aWCgYT</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyBinanceAddress}
                      className={`w-full sm:w-auto px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-md ${
                        copiedCryptoAddress
                          ? 'bg-emerald-500 text-slate-950 scale-105'
                          : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                      }`}
                    >
                      {copiedCryptoAddress ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>¡Dirección Copiada!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar Dirección</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Receipt Button */}
              <div className="pt-4 border-t border-slate-800">
                <Button
                  variant="whatsapp"
                  size="lg"
                  onClick={handleSendPaymentSupportWhatsApp}
                  className="w-full text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar TxID / Soporte USDT a WhatsApp</span>
                </Button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  Envíanos la captura de retiro o el TxID para confirmar la recepción en la blockchain de inmediato.
                </p>
              </div>
            </div>

            {/* Right Column: Binance USDT QR Code */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-between shadow-xl text-center">
              <div className="w-full space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Código QR de Depósito Binance
                  </h3>
                </div>

                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Escanea directamente desde la app de Binance en <strong>Depositar &gt; USDT &gt; Red Tron (TRC20)</strong>.
                </p>

                {/* QR Code Container with Binance Yellow Border Accent */}
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto bg-white p-3 rounded-3xl shadow-[0_0_35px_rgba(251,191,36,0.15)] flex items-center justify-center overflow-hidden border-2 border-amber-400">
                  <Image
                    src="/images/binance-usdt-qr.png"
                    alt="Código QR Binance USDT TRC20"
                    fill
                    className="object-contain p-2"
                    priority
                  />
                </div>

                <div className="pt-2 text-center">
                  <span className="text-[10px] font-mono text-amber-300 bg-slate-950 px-3 py-1 rounded-full border border-slate-800 inline-block truncate max-w-xs">
                    Red: Tron (TRC20) · USDT
                  </span>
                </div>
              </div>

              <div className="w-full mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                Acreditación rápida (1-3 minutos según confirmaciones de la red Tron).
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
