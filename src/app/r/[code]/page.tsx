'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { storeReferralCode } from '@/features/affiliates/services/affiliateService';

export default function ReferralRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const rawCode = params?.code;

  useEffect(() => {
    if (typeof rawCode === 'string' && rawCode) {
      const code = rawCode.trim().toUpperCase();
      storeReferralCode(code);
      if (typeof document !== 'undefined') {
        document.cookie = `smartv_referral=${encodeURIComponent(code)}; max-age=${30 * 24 * 60 * 60}; path=/; SameSite=Lax`;
      }
    }
    // Redirige al catálogo de planes en la página principal
    router.replace('/#planes');
  }, [rawCode, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#060913] text-slate-900 dark:text-white p-4 transition-colors">
      <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
      <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">
        Conectando tu recomendación...
      </h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Te estamos redirigiendo a los planes oficiales de Smart TV Like a Pro.
      </p>
    </div>
  );
}
