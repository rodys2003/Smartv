export interface OperatingHoursInfo {
  isOpen: boolean;
  colombiaHours: string;
  localHours: string;
  userTimeZone: string;
  userCity: string;
  isSameAsColombia: boolean;
  statusText: string;
  nextOpeningText: string;
  localOpenTime: string;
  localCloseTime: string;
}

const TZ_FRIENDLY_NAMES: Record<string, string> = {
  'America/Bogota': 'Colombia',
  'America/Argentina/Buenos_Aires': 'Argentina (Buenos Aires)',
  'America/Argentina/Cordoba': 'Argentina',
  'America/Santiago': 'Chile',
  'America/Mexico_City': 'México (CDMX)',
  'America/Monterrey': 'México',
  'America/Cancun': 'México (Cancún)',
  'America/Tijuana': 'México (Tijuana)',
  'America/Lima': 'Perú',
  'America/Guayaquil': 'Ecuador',
  'America/Caracas': 'Venezuela',
  'America/La_Paz': 'Bolivia',
  'America/Montevideo': 'Uruguay',
  'America/Asuncion': 'Paraguay',
  'Europe/Madrid': 'España (Península)',
  'Atlantic/Canary': 'España (Canarias)',
  'America/New_York': 'Estados Unidos (ET)',
  'America/Chicago': 'Estados Unidos (CT)',
  'America/Denver': 'Estados Unidos (MT)',
  'America/Los_Angeles': 'Estados Unidos (PT)',
  'America/Panama': 'Panamá',
  'America/Costa_Rica': 'Costa Rica',
  'America/Guatemala': 'Guatemala',
  'America/Santo_Domingo': 'República Dominicana',
  'America/Tegucigalpa': 'Honduras',
  'America/El_Salvador': 'El Salvador',
  'America/Managua': 'Nicaragua',
  'America/Puerto_Rico': 'Puerto Rico',
  'America/Havana': 'Cuba',
};

export function getOperatingHoursInfo(): OperatingHoursInfo {
  const now = new Date();
  const colombiaTz = 'America/Bogota';
  let userTz = colombiaTz;

  if (typeof window !== 'undefined') {
    try {
      userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || colombiaTz;
    } catch {
      userTz = colombiaTz;
    }
  }

  // Get Colombia current hour & minute
  const colTimeParts = new Intl.DateTimeFormat('en-US', {
    timeZone: colombiaTz,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(now);

  const colHour = parseInt(colTimeParts.find((p) => p.type === 'hour')?.value || '0', 10);
  const colMin = parseInt(colTimeParts.find((p) => p.type === 'minute')?.value || '0', 10);

  // Open between 06:00 and 21:00 Colombia
  const isOpen =
    (colHour > 6 || (colHour === 6 && colMin >= 0)) &&
    (colHour < 21 || (colHour === 21 && colMin === 0));

  // Build today's 06:00 and 21:00 dates in Colombia ISO format
  const colDateParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: colombiaTz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  const startColombia = new Date(`${colDateParts}T06:00:00-05:00`);
  const endColombia = new Date(`${colDateParts}T21:00:00-05:00`);

  const formatTime = (d: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: userTz,
    }).format(d);
  };

  const localOpenTime = formatTime(startColombia);
  const localCloseTime = formatTime(endColombia);
  const colombiaHours = '6:00 AM - 9:00 PM';
  const localHours = `${localOpenTime} - ${localCloseTime}`;
  const isSameAsColombia = userTz === 'America/Bogota';

  const friendlyName =
    TZ_FRIENDLY_NAMES[userTz] ||
    userTz.split('/').pop()?.replace(/_/g, ' ') ||
    'tu país';

  return {
    isOpen,
    colombiaHours,
    localHours,
    userTimeZone: userTz,
    userCity: friendlyName,
    isSameAsColombia,
    statusText: isOpen ? 'En Horario de Atención' : 'Fuera de Horario de Atención',
    nextOpeningText: `La atención reanuda a las 6:00 AM hora Colombia${
      !isSameAsColombia ? ` (${localOpenTime} en ${friendlyName})` : ''
    }`,
    localOpenTime,
    localCloseTime,
  };
}
