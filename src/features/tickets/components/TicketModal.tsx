'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  SERVICE_PLANS,
  MAGIC_APPS_PRICE_COP,
  MAGIC_APPS_PRICE_USDT,
  PLAN_USDT_PRICES,
} from '@/features/services-catalog/constants/plans';
import { ServicePlan, Ticket } from '@/types';
import { formatCOP } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useQueue } from '../hooks/useQueue';
import { createTicket } from '../services/ticketService';
import { TicketCard } from './TicketCard';
import { getOperatingHoursInfo, OperatingHoursInfo } from '@/lib/operatingHours';
import { Sparkles, Tv, Check, AlertCircle, AlertTriangle, Lock, CreditCard, Coins, Clock, Globe } from 'lucide-react';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: ServicePlan | null;
  initialMagicApps?: boolean;
  onTicketCreated?: (ticket: Ticket) => void;
}

const BRANDS = [
  'Android TV / Google TV (TCL, Xiaomi, Sony, Chromecast, Onn, TV Box)',
];

export function TicketModal({
  isOpen,
  onClose,
  initialPlan,
  initialMagicApps = false,
  onTicketCreated,
}: TicketModalProps) {
  const { user, isAuthenticated, signInWithGoogle } = useAuth();
  const { waitingTickets, whatsappThreshold } = useQueue();

  const [selectedBrand, setSelectedBrand] = useState(BRANDS[0]);
  const [tvModel, setTvModel] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan>(
    initialPlan || SERVICE_PLANS[1]
  );
  const [hasMagicApps, setHasMagicApps] = useState<boolean>(initialMagicApps);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'bre_b' | 'binance'>('bre_b');
  const [clientName, setClientName] = useState('');
  const [clientWhatsApp, setClientWhatsApp] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hoursInfo, setHoursInfo] = useState<OperatingHoursInfo>(() => getOperatingHoursInfo());

  useEffect(() => {
    setHoursInfo(getOperatingHoursInfo());
  }, []);

  useEffect(() => {
    if (initialPlan) {
      setSelectedPlan(initialPlan);
    }
    if (initialMagicApps !== undefined) {
      setHasMagicApps(initialMagicApps);
    }
  }, [initialPlan, initialMagicApps]);

  useEffect(() => {
    if (user) {
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
      if (!clientName) setClientName(name);
    }
  }, [user, clientName]);

  const calculateTotalCOP = () => {
    return selectedPlan.price + (hasMagicApps ? MAGIC_APPS_PRICE_COP : 0);
  };

  const calculateTotalUSDT = () => {
    const base = PLAN_USDT_PRICES[selectedPlan.id] ?? 17;
    return base + (hasMagicApps ? MAGIC_APPS_PRICE_USDT : 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isAuthenticated) {
      setErrorMsg('Debes iniciar sesión con Google para tomar un turno oficial.');
      return;
    }

    setLoading(true);

    try {
      const isBinance = selectedPaymentMethod === 'binance';
      const totalPrice = isBinance ? calculateTotalUSDT() : calculateTotalCOP();
      const notesJson = JSON.stringify({
        payment_method: selectedPaymentMethod,
        usdt_price: calculateTotalUSDT(),
        cop_price: calculateTotalCOP(),
      });

      const ticket = await createTicket({
        user_id: user?.id ?? null,
        user_email: user?.email ?? null,
        user_name: clientName || user?.user_metadata?.full_name || 'Cliente TV',
        user_avatar: user?.user_metadata?.avatar_url || null,
        tv_brand: selectedBrand,
        tv_model: tvModel.trim() || null,
        service_tier: selectedPlan.id,
        service_name: selectedPlan.name,
        has_magic_apps: hasMagicApps,
        total_price: totalPrice,
        client_whatsapp: clientWhatsApp.trim() || null,
        notes: notesJson,
      });

      setCreatedTicket(ticket);
      if (onTicketCreated) onTicketCreated(ticket);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('No se pudo generar el turno. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCreatedTicket(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={createdTicket ? '¡Turno Asignado con Éxito!' : 'Tomar Turno de Optimización'}
      description={
        createdTicket
          ? 'Guarda tu ticket digital y envíanoslo por WhatsApp para iniciar la atención.'
          : 'Completa los datos de tu TV para asignarte un número de turno en la cola de atención global.'
      }
      maxWidth="lg"
    >
      {createdTicket ? (
        <div className="pt-2">
          <TicketCard
            ticket={createdTicket}
            whatsappThreshold={whatsappThreshold}
            queuePosition={
              waitingTickets.findIndex((t) => t.id === createdTicket.id) !== -1
                ? waitingTickets.findIndex((t) => t.id === createdTicket.id) + 1
                : waitingTickets.length + 1
            }
          />
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs text-slate-400">
              Cerrar y volver a la web
            </Button>
          </div>
        </div>
      ) : !isAuthenticated ? (
        /* If not logged in, prompt Google Login */
        <div className="py-6 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">
              Inicio de Sesión con Google Requerido
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
              Para garantizar que los turnos se atiendan uno a uno y puedas hacer seguimiento en vivo de tu ticket, debes autenticarte con tu cuenta de Google.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => signInWithGoogle()}
            className="w-full py-3.5 bg-white text-slate-900 hover:bg-slate-100 font-bold border border-slate-300 shadow-md flex items-center justify-center gap-3 text-sm cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continuar con Google</span>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* User Auth banner */}
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Usuario verificado: <strong>{user?.user_metadata?.full_name || user?.email}</strong>
            </span>
          </div>

          {/* Device restriction banner */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Exclusivo para Android TV y Google TV.</strong> Equipos con Samsung (Tizen OS) y LG (webOS) quedan descartados.
            </span>
          </div>

          {/* Operating hours info banner & 5 min response rule */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5 w-full">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white">Horario de atención:</span>
                <span className="text-cyan-300 font-semibold">{hoursInfo.colombiaHours} (Hora Colombia)</span>
                {!hoursInfo.isSameAsColombia && (
                  <span className="text-fuchsia-300 font-medium flex items-center gap-1">
                    <Globe className="w-3 h-3 inline text-fuchsia-400" />
                    <span>En tu país ({hoursInfo.userCity}):</span>
                    <strong>{hoursInfo.localHours}</strong>
                  </span>
                )}
              </div>
              {!hoursInfo.isOpen && (
                <p className="text-amber-300 font-medium leading-relaxed">
                  🌙 <strong>Reserva anticipada activa:</strong> Puedes apartar tu turno ahora mismo y serás atendido a primera hora al abrir ({hoursInfo.localOpenTime} en tu hora local).
                </p>
              )}
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-[10.5px] leading-relaxed">
                ⏱️ <strong>Tolerancia de 5 minutos:</strong> Una vez reanudada la jornada o cuando llegue tu turno, tienes un tiempo de espera de <strong>5 minutos</strong> para responder y enviar tus documentos/fotos por WhatsApp. Si no se recibe respuesta en 5 minutos, el ticket se cancelará automáticamente para dar paso al siguiente en la fila.
              </div>
            </div>
          </div>

          {/* Brand selection (Only Android TV & Samsung) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
              Dispositivo a Optimizar:
            </label>
            <div className="grid grid-cols-1 gap-2">
              {BRANDS.map((brand) => (
                <button
                  type="button"
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`p-3 rounded-xl text-xs font-semibold border text-left transition-all cursor-pointer ${
                    selectedBrand === brand
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Model info & Client info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Tu Nombre:
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej. Carlos Mendoza"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Modelo / Pulgadas:
              </label>
              <input
                type="text"
                value={tvModel}
                onChange={(e) => setTvModel(e.target.value)}
                placeholder="Ej. TCL 55 / Samsung Crystal UHD"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
              Método de Pago:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedPaymentMethod('bre_b')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  selectedPaymentMethod === 'bre_b'
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <CreditCard className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold block text-white">🇨🇴 Llave Bre-B</span>
                  <span className="text-[10px] text-slate-400 block">En Pesos (COP)</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPaymentMethod('binance')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  selectedPaymentMethod === 'binance'
                    ? 'bg-amber-400/20 border-amber-400 text-white shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold block text-white">🌐 Binance (USDT)</span>
                  <span className="text-[10px] text-slate-400 block">Red Tron (TRC20)</span>
                </div>
              </button>
            </div>
          </div>

          {/* Plan selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
              Selecciona tu Plan:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SERVICE_PLANS.map((plan) => {
                const isBinance = selectedPaymentMethod === 'binance';
                const priceFormatted = isBinance
                  ? `${PLAN_USDT_PRICES[plan.id]} USDT`
                  : formatCOP(plan.price);

                return (
                  <button
                    type="button"
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      selectedPlan.id === plan.id
                        ? isBinance
                          ? 'bg-amber-400/20 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.25)]'
                          : 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">
                      {plan.name}
                    </span>
                    <span
                      className={`text-sm font-black mt-2 block ${
                        isBinance ? 'text-amber-300 font-mono' : 'text-cyan-300'
                      }`}
                    >
                      {priceFormatted}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Magic apps add-on checkbox */}
          <div className="bg-fuchsia-950/20 border border-fuchsia-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-fuchsia-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-white block">
                  Add-on Apps Mágicas ({selectedPaymentMethod === 'binance' ? '+7 USDT' : '+20.000 COP'})
                </span>
                <span className="text-slate-400 text-[11px]">
                  Instalación de apps de streaming libres de anuncios.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={hasMagicApps}
              onChange={(e) => setHasMagicApps(e.target.checked)}
              className="w-4 h-4 accent-fuchsia-500 cursor-pointer"
            />
          </div>

          {/* Price & Submit Button */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-bold">
                Total a pagar ({selectedPaymentMethod === 'binance' ? 'Binance USDT' : 'Bre-B COP'}):
              </span>
              <span
                className={`text-2xl font-black ${
                  selectedPaymentMethod === 'binance'
                    ? 'text-amber-400 font-mono'
                    : 'text-cyan-400'
                }`}
              >
                {selectedPaymentMethod === 'binance'
                  ? `${calculateTotalUSDT()} USDT`
                  : formatCOP(calculateTotalCOP())}
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading || !clientName.trim()}
              className="px-6 py-3 font-bold text-sm"
            >
              {loading ? 'Asignando Turno...' : 'Confirmar y Asignar Turno'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
