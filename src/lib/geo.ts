// Distancia aproximada del visitante a Bogotá, sin pedir permisos ni enviar
// datos a ningún servicio: la zona horaria del navegador (p. ej. Europe/Madrid)
// se traduce a la ciudad principal de esa zona.

import { BOGOTA } from './weather';

// Zona horaria IANA → [lat, lon] de su ciudad principal.
const ZONES: Record<string, [number, number]> = {
  // América
  'America/Bogota': [4.71, -74.07],
  'America/New_York': [40.71, -74.01],
  'America/Detroit': [42.33, -83.05],
  'America/Chicago': [41.88, -87.63],
  'America/Denver': [39.74, -104.99],
  'America/Phoenix': [33.45, -112.07],
  'America/Los_Angeles': [34.05, -118.24],
  'America/Anchorage': [61.22, -149.9],
  'Pacific/Honolulu': [21.31, -157.86],
  'America/Toronto': [43.65, -79.38],
  'America/Vancouver': [49.28, -123.12],
  'America/Edmonton': [53.55, -113.49],
  'America/Winnipeg': [49.9, -97.14],
  'America/Halifax': [44.65, -63.58],
  'America/Mexico_City': [19.43, -99.13],
  'America/Monterrey': [25.69, -100.32],
  'America/Cancun': [21.16, -86.85],
  'America/Tijuana': [32.51, -117.04],
  'America/Guatemala': [14.63, -90.51],
  'America/El_Salvador': [13.69, -89.22],
  'America/Tegucigalpa': [14.07, -87.19],
  'America/Managua': [12.11, -86.24],
  'America/Costa_Rica': [9.93, -84.08],
  'America/Panama': [8.98, -79.52],
  'America/Havana': [23.11, -82.37],
  'America/Santo_Domingo': [18.49, -69.93],
  'America/Puerto_Rico': [18.47, -66.11],
  'America/Caracas': [10.48, -66.9],
  'America/Lima': [-12.05, -77.04],
  'America/Guayaquil': [-2.19, -79.89],
  'America/La_Paz': [-16.5, -68.15],
  'America/Santiago': [-33.45, -70.67],
  'America/Argentina/Buenos_Aires': [-34.6, -58.38],
  'America/Buenos_Aires': [-34.6, -58.38],
  'America/Argentina/Cordoba': [-31.42, -64.18],
  'America/Montevideo': [-34.9, -56.16],
  'America/Asuncion': [-25.26, -57.58],
  'America/Sao_Paulo': [-23.55, -46.63],
  'America/Manaus': [-3.12, -60.02],
  'America/Fortaleza': [-3.73, -38.53],
  'America/Recife': [-8.05, -34.88],
  // Europa
  'Europe/London': [51.51, -0.13],
  'Europe/Dublin': [53.35, -6.26],
  'Europe/Lisbon': [38.72, -9.14],
  'Europe/Madrid': [40.42, -3.7],
  'Atlantic/Canary': [28.12, -15.43],
  'Europe/Paris': [48.86, 2.35],
  'Europe/Brussels': [50.85, 4.35],
  'Europe/Amsterdam': [52.37, 4.9],
  'Europe/Berlin': [52.52, 13.4],
  'Europe/Zurich': [47.38, 8.54],
  'Europe/Rome': [41.9, 12.5],
  'Europe/Vienna': [48.21, 16.37],
  'Europe/Prague': [50.08, 14.44],
  'Europe/Warsaw': [52.23, 21.01],
  'Europe/Budapest': [47.5, 19.04],
  'Europe/Copenhagen': [55.68, 12.57],
  'Europe/Stockholm': [59.33, 18.07],
  'Europe/Oslo': [59.91, 10.75],
  'Europe/Helsinki': [60.17, 24.94],
  'Atlantic/Reykjavik': [64.15, -21.94],
  'Europe/Athens': [37.98, 23.73],
  'Europe/Bucharest': [44.43, 26.1],
  'Europe/Istanbul': [41.01, 28.98],
  'Europe/Kyiv': [50.45, 30.52],
  'Europe/Kiev': [50.45, 30.52],
  'Europe/Moscow': [55.76, 37.62],
  // África y Medio Oriente
  'Africa/Casablanca': [33.57, -7.59],
  'Africa/Lagos': [6.52, 3.38],
  'Africa/Cairo': [30.04, 31.24],
  'Africa/Nairobi': [-1.29, 36.82],
  'Africa/Johannesburg': [-26.2, 28.05],
  'Asia/Jerusalem': [31.77, 35.21],
  'Asia/Tel_Aviv': [32.09, 34.78],
  'Asia/Riyadh': [24.71, 46.68],
  'Asia/Dubai': [25.2, 55.27],
  'Asia/Tehran': [35.69, 51.39],
  // Asia y Oceanía
  'Asia/Karachi': [24.86, 67.01],
  'Asia/Kolkata': [28.61, 77.21],
  'Asia/Calcutta': [28.61, 77.21],
  'Asia/Dhaka': [23.81, 90.41],
  'Asia/Bangkok': [13.76, 100.5],
  'Asia/Ho_Chi_Minh': [10.82, 106.63],
  'Asia/Kuala_Lumpur': [3.14, 101.69],
  'Asia/Singapore': [1.35, 103.82],
  'Asia/Jakarta': [-6.21, 106.85],
  'Asia/Manila': [14.6, 120.98],
  'Asia/Hong_Kong': [22.32, 114.17],
  'Asia/Shanghai': [31.23, 121.47],
  'Asia/Taipei': [25.03, 121.57],
  'Asia/Seoul': [37.57, 126.98],
  'Asia/Tokyo': [35.68, 139.69],
  'Australia/Perth': [-31.95, 115.86],
  'Australia/Adelaide': [-34.93, 138.6],
  'Australia/Brisbane': [-27.47, 153.03],
  'Australia/Melbourne': [-37.81, 144.96],
  'Australia/Sydney': [-33.87, 151.21],
  'Pacific/Auckland': [-36.85, 174.76],
};

const CRUISE_KMH = 800; // velocidad media de un vuelo comercial

// Distancia en línea recta (fórmula del haversine), en km.
const haversine = ([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]) => {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
};

export type Nearness =
  | { kind: 'same' } // el visitante también está en Colombia
  | { kind: 'far'; km: number; flightMin: number }
  | null; // zona desconocida: no se muestra distancia

export function visitorDistance(): Nearness {
  let zone = '';
  try {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return null;
  }
  if (zone === 'America/Bogota') return { kind: 'same' };
  const here = ZONES[zone];
  if (!here) return null;
  const km = haversine(here, [BOGOTA.lat, BOGOTA.lon]);
  return { kind: 'far', km, flightMin: (km / CRUISE_KMH) * 60 };
}

// 4.300 km / 4,300 km (redondeado para que se lea como aproximado).
export const formatKm = (km: number, es: boolean) =>
  `${Math.round(km / (km >= 1000 ? 100 : 10)) * (km >= 1000 ? 100 : 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, es ? '.' : ',') + ' km';

// 5 h 30 · redondeado a 5 minutos.
export const formatFlight = (min: number) => {
  const m = Math.max(5, Math.round(min / 5) * 5);
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return h ? `${h} h${rest ? ` ${String(rest).padStart(2, '0')}` : ''}` : `${rest} min`;
};
