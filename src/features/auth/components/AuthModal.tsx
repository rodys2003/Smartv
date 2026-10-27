'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Error al conectar con Google';
      setErrorMessage(
        msg.includes('provider is not enabled')
          ? 'Nota técnica: El proveedor de Google OAuth aún no ha sido activado en la consola de Supabase. Puedes continuar creando tu turno directamente con tus datos.'
          : msg
      );
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Identifícate para tu Turno"
      description="Inicia sesión con Google para registrar tu ticket y darle seguimiento a la optimización de tu Smart TV."
      maxWidth="md"
    >
      <div className="space-y-6 pt-2">
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white text-sm">Turno Oficial & Soporte 1 a 1</p>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              Tu ticket quedará asociado a tu cuenta para verificar el estado de atención en tiempo real.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 bg-white text-slate-900 hover:bg-slate-100 font-bold border border-slate-300 shadow-md flex items-center justify-center gap-3 text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {loading ? 'Conectando con Google...' : 'Continuar con Google'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="w-full text-xs text-slate-400 hover:text-white"
          >
            Continuar llenando ticket primero
          </Button>
        </div>

        <div className="pt-2 border-t border-slate-800 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs text-cyan-400/90 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Servicio global · Más de 500 TVs optimizados
          </span>
        </div>
      </div>
    </Modal>
  );
}
