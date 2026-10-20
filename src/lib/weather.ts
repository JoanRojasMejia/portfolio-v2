// Clima actual de Bogotá desde Open-Meteo (gratis, sin API key, permite CORS).
// Se consulta desde el navegador y se guarda 15 min en sessionStorage para no
// repetir la petición en cada página.

export type Sky = 'clear' | 'partly' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'storm';

export interface Weather {
  temp: number; // °C, redondeada
  sky: Sky;
  day: boolean;
}

export const BOGOTA = { lat: 4.711, lon: -74.0721 };
const URL = `https://api.open-meteo.com/v1/forecast?latitude=${BOGOTA.lat}&longitude=${BOGOTA.lon}&current=temperature_2m,weather_code,is_day&timezone=America%2FBogota`;
const CACHE_KEY = 'jr_weather';
export const WEATHER_TTL_MS = 15 * 60 * 1000;

// Códigos WMO → estado del cielo.
const skyOf = (code: number): Sky => {
  if (code <= 1) return 'clear';
  if (code === 2) return 'partly';
  if (code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 95) return 'storm';
  return 'rain'; // llovizna (51–57), lluvia (61–67) y chubascos (80–82)
};

export async function getWeather(): Promise<Weather | null> {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) ?? 'null') as { at: number; data: Weather } | null;
    if (cached && Date.now() - cached.at < WEATHER_TTL_MS) return cached.data;
  } catch {}
  try {
    const res = await fetch(URL, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const { current } = await res.json();
    if (typeof current?.temperature_2m !== 'number') return null;
    const data: Weather = {
      temp: Math.round(current.temperature_2m),
      sky: skyOf(current.weather_code ?? 0),
      day: current.is_day === 1,
    };
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
    } catch {}
    return data;
  } catch {
    return null; // sin red o API caída: simplemente no se muestra el clima
  }
}
