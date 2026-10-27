import { supabase } from '@/lib/supabase/client';

export interface DiscountCoupon {
  id: string;
  code: string;
  percentage: number; // 1 - 100
  max_uses: number;
  used_count: number;
  is_active: boolean;
  created_at: string;
}

export interface ValidateCouponResult {
  valid: boolean;
  coupon?: DiscountCoupon;
  error?: string;
}

const SETTINGS_KEY = 'discount_coupons';

/**
 * Obtiene todos los cupones registrados en la plataforma.
 */
export async function getDiscountCoupons(): Promise<DiscountCoupon[]> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', SETTINGS_KEY)
      .maybeSingle();

    if (error || !data?.value || !Array.isArray(data.value)) {
      return [];
    }

    return data.value as DiscountCoupon[];
  } catch (err) {
    console.error('Error fetching discount coupons:', err);
    return [];
  }
}

/**
 * Guarda la lista actualizada de cupones en Supabase.
 */
export async function saveDiscountCoupons(coupons: DiscountCoupon[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        key: SETTINGS_KEY,
        value: coupons,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving discount coupons:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error saving discount coupons:', err);
    return false;
  }
}

/**
 * Crea un nuevo cupón de descuento con límite de usos.
 */
export async function createDiscountCoupon(params: {
  code: string;
  percentage: number;
  max_uses: number;
}): Promise<{ success: boolean; coupon?: DiscountCoupon; error?: string }> {
  try {
    const cleanCode = params.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');

    if (!cleanCode || cleanCode.length < 2) {
      return { success: false, error: 'El código debe tener al menos 2 caracteres alfanuméricos.' };
    }

    const percentage = Math.min(100, Math.max(1, Math.round(Number(params.percentage))));
    if (isNaN(percentage) || percentage <= 0) {
      return { success: false, error: 'El porcentaje debe ser un número entre 1 y 100.' };
    }

    const maxUses = Math.max(1, Math.round(Number(params.max_uses)));
    if (isNaN(maxUses) || maxUses <= 0) {
      return { success: false, error: 'El límite de usos debe ser mínimo 1.' };
    }

    const currentCoupons = await getDiscountCoupons();

    // Check if code already exists
    const exists = currentCoupons.some((c) => c.code.toUpperCase() === cleanCode);
    if (exists) {
      return { success: false, error: `Ya existe un cupón activo con el código "${cleanCode}".` };
    }

    const newCoupon: DiscountCoupon = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `coupon_${Date.now()}`,
      code: cleanCode,
      percentage,
      max_uses: maxUses,
      used_count: 0,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const updatedList = [newCoupon, ...currentCoupons];
    const ok = await saveDiscountCoupons(updatedList);

    if (!ok) {
      return { success: false, error: 'No se pudo guardar el cupón en la base de datos.' };
    }

    return { success: true, coupon: newCoupon };
  } catch (err) {
    console.error('Error creating discount coupon:', err);
    return { success: false, error: 'Ocurrió un error inesperado al crear el cupón.' };
  }
}

/**
 * Alterna el estado activo / pausado de un cupón.
 */
export async function toggleCouponStatus(id: string, is_active: boolean): Promise<boolean> {
  try {
    const currentCoupons = await getDiscountCoupons();
    const updated = currentCoupons.map((c) => (c.id === id ? { ...c, is_active } : c));
    return await saveDiscountCoupons(updated);
  } catch (err) {
    console.error('Error toggling coupon status:', err);
    return false;
  }
}

/**
 * Elimina un cupón del sistema.
 */
export async function deleteDiscountCoupon(id: string): Promise<boolean> {
  try {
    const currentCoupons = await getDiscountCoupons();
    const updated = currentCoupons.filter((c) => c.id !== id);
    return await saveDiscountCoupons(updated);
  } catch (err) {
    console.error('Error deleting coupon:', err);
    return false;
  }
}

/**
 * Valida si un código de descuento es válido para canjear en la creación de un ticket.
 */
export async function validateDiscountCoupon(code: string): Promise<ValidateCouponResult> {
  try {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { valid: false, error: 'Ingresa un código de descuento.' };
    }

    const currentCoupons = await getDiscountCoupons();
    const coupon = currentCoupons.find((c) => c.code.toUpperCase() === cleanCode);

    if (!coupon) {
      return { valid: false, error: 'El código de descuento no existe.' };
    }

    if (!coupon.is_active) {
      return { valid: false, error: 'Este código de descuento está pausado temporalmente.' };
    }

    if (coupon.used_count >= coupon.max_uses) {
      return {
        valid: false,
        error: `Este cupón ya alcanzó su límite máximo de ${coupon.max_uses} usos.`,
      };
    }

    return { valid: true, coupon };
  } catch (err) {
    console.error('Error validating coupon:', err);
    return { valid: false, error: 'No se pudo validar el cupón.' };
  }
}

/**
 * Registra el uso de un cupón cuando se crea un ticket exitosamente.
 */
export async function incrementCouponUsage(code: string): Promise<boolean> {
  try {
    const cleanCode = code.trim().toUpperCase();
    const currentCoupons = await getDiscountCoupons();
    let found = false;

    const updated = currentCoupons.map((c) => {
      if (c.code.toUpperCase() === cleanCode) {
        found = true;
        return {
          ...c,
          used_count: c.used_count + 1,
        };
      }
      return c;
    });

    if (!found) return false;
    return await saveDiscountCoupons(updated);
  } catch (err) {
    console.error('Error incrementing coupon usage:', err);
    return false;
  }
}
