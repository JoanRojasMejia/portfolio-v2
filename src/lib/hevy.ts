// Días de gimnasio desde Hevy (API pública, solo con Hevy Pro). Solo se usa en el
// frontmatter de Astro (build time), así la API key nunca llega al navegador: al
// cliente solo pasan, por día, el nombre de cada entreno y cuánto duró.
// Docs: https://api.hevyapp.com/docs/

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { buildCalendar, type Calendar } from './calendar';

export interface GymSession {
  title: string;
  minutes: number; // duración redondeada a minutos (0 si Hevy no trae la hora de fin)
}

export interface GymCalendar extends Calendar {
  sessions: Record<string, GymSession[]>; // AAAA-MM-DD → entrenos de ese día
}

interface Workout extends GymSession {
  date: string; // AAAA-MM-DD en hora de Bogotá
}

const API = 'https://api.hevyapp.com/v1/workouts';
const TIMEOUT_MS = 8000;
const PAGE_SIZE = 10; // máximo que permite la API
const MAX_PAGES = 100; // tope de seguridad: 1000 entrenos
// La API limita las solicitudes (responde 429) y el dev server renderiza la portada en
// cada recarga, así que el resultado se guarda en disco: dentro de una hora se reutiliza
// sin llamar a Hevy y, si la API falla, se usa aunque sea más viejo.
const CACHE_FILE = join(process.cwd(), 'node_modules', '.cache', 'hevy.json');
const CACHE_TTL_MS = 60 * 60 * 1000;

interface HevyWorkout { start_time?: string; end_time?: string; title?: string }
interface HevyPage { page_count?: number; workouts?: HevyWorkout[] }
interface CacheFile { fetchedAt: number; workouts: Workout[] }

const dayFmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' });

async function readCache(): Promise<CacheFile | null> {
  try {
    return JSON.parse(await readFile(CACHE_FILE, 'utf8')) as CacheFile;
  } catch {
    return null;
  }
}

async function writeCache(workouts: Workout[]) {
  try {
    await mkdir(dirname(CACHE_FILE), { recursive: true });
    await writeFile(CACHE_FILE, JSON.stringify({ fetchedAt: Date.now(), workouts } satisfies CacheFile));
  } catch {
    // Sin caché solo se pierde la reutilización; el sitio funciona igual.
  }
}

async function fetchWorkouts(key: string): Promise<Workout[]> {
  const out: Workout[] = [];
  // El orden de la API no está documentado, así que se recorren todas las páginas
  // (con un tope); buildCalendar se queda solo con el último año.
  for (let page = 1, pageCount = 1; page <= pageCount && page <= MAX_PAGES; page++) {
    const res = await fetch(`${API}?page=${page}&pageSize=${PAGE_SIZE}`, {
      headers: { 'api-key': key, accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: HevyPage = await res.json();
    pageCount = data.page_count ?? 1;
    for (const w of data.workouts ?? []) {
      const start = Date.parse(w.start_time ?? '');
      if (Number.isNaN(start)) continue;
      const end = Date.parse(w.end_time ?? '');
      out.push({
        date: dayFmt.format(start), // día en hora de Bogotá
        title: w.title?.trim() || '',
        minutes: Number.isNaN(end) ? 0 : Math.max(0, Math.round((end - start) / 60_000)),
      });
    }
  }
  return out;
}

// Calendario del último año con una sola fuente (counts[0] = entrenos ese día) y el
// detalle de cada día. Sin clave, sin datos o sin entrenos en el periodo devuelve null.
export async function getGymCalendar(): Promise<GymCalendar | null> {
  const key = import.meta.env.HEVY_API_KEY;
  if (!key) {
    console.warn('[hevy] Falta HEVY_API_KEY; no se muestran los días de gimnasio.');
    return null;
  }

  const cache = await readCache();
  let workouts: Workout[];
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    workouts = cache.workouts;
  } else {
    try {
      workouts = await fetchWorkouts(key);
      await writeCache(workouts);
    } catch (err) {
      // Nunca se registran los headers: llevan la API key.
      if (!cache) {
        console.warn(`[hevy] No se pudieron leer los entrenos: ${(err as Error).message}`);
        return null;
      }
      console.warn(`[hevy] No se pudieron leer los entrenos (${(err as Error).message}); se usa la última copia guardada.`);
      workouts = cache.workouts;
    }
  }

  const counts: Record<string, number> = {};
  for (const w of workouts) counts[w.date] = (counts[w.date] ?? 0) + 1;
  const cal = buildCalendar([counts]);
  if (!cal) return null;

  // Solo viajan al cliente los días que entran en la cuadrícula.
  const inGrid = new Set(cal.weeks.flat().map((d) => d.date));
  const sessions: Record<string, GymSession[]> = {};
  for (const { date, title, minutes } of workouts) {
    if (inGrid.has(date)) (sessions[date] ??= []).push({ title, minutes });
  }
  return { ...cal, sessions };
}
