export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Nomenclatura oficial de turnos:
 * # A001 hasta # A999, luego pasa a # B001 hasta # B999, etc.
 */
export function formatTicketNumber(num: number): string {
  if (!num || num < 1) return '# A001';
  const zeroIndexed = num - 1;
  const letterIndex = Math.floor(zeroIndexed / 999);
  const numberPart = (zeroIndexed % 999) + 1;
  const letterCode = String.fromCharCode(65 + (letterIndex % 26));
  const prefix =
    letterIndex >= 26
      ? `${String.fromCharCode(64 + Math.floor(letterIndex / 26))}${letterCode}`
      : letterCode;
  return `# ${prefix}${numberPart.toString().padStart(3, '0')}`;
}

/**
 * Tiempo de espera acumulado:
 * Suma de 15 en 15 minutos según usuarios con turnos pendientes.
 * Al pasar a horas cambia a: + 1h, + 2h, + 3h...
 */
export function formatWaitTime(pendingCount: number): string {
  if (pendingCount <= 0) return 'Inmediato (~15 min)';
  const totalMinutes = pendingCount * 15;
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  return `+ ${hours}h`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
