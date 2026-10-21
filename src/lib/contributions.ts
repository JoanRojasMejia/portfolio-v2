// Calendario de contribuciones del último año, como el de GitHub, sumando dos
// fuentes por día:
//   - GitHub: la API GraphQL (contributionCalendar), en build time con
//     GITHUB_TOKEN (solo el scope read:user), así el token nunca llega al navegador.
//   - Extra: conteos por día de repos que no están en GitHub (CodeCommit), que se
//     exportan aparte a src/data/contributions-extra.json. Solo fechas y números.

import extra from '../data/contributions-extra.json';
import { buildCalendar, type Calendar } from './calendar';

const API = 'https://api.github.com/graphql';
const TIMEOUT_MS = 8000;

const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

// Contribuciones por día en GitHub, o un mapa vacío si falta el token o falla la API.
async function githubDays(): Promise<Record<string, number>> {
  const token = import.meta.env.GITHUB_TOKEN;
  const login = import.meta.env.GITHUB_USER;
  if (!token || !login) {
    console.warn('[github] Faltan GITHUB_TOKEN o GITHUB_USER; el calendario usa solo los datos extra.');
    return {};
  }
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: QUERY, variables: { login } }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.errors?.length) throw new Error(data.errors[0].message);
    const weeks: { contributionDays: { date: string; contributionCount: number }[] }[] =
      data.data?.user?.contributionsCollection?.contributionCalendar?.weeks ?? [];
    const days: Record<string, number> = {};
    for (const w of weeks) for (const d of w.contributionDays) days[d.date] = d.contributionCount;
    return days;
  } catch (err) {
    console.warn(`[github] No se pudo leer el calendario: ${(err as Error).message}`);
    return {};
  }
}

// Fuentes en orden fijo: counts[0] = GitHub, counts[1] = CodeCommit (AWS).
// Sin ninguna de las dos devuelve null y la sección no se muestra.
export async function getContributions(): Promise<Calendar | null> {
  const gh = await githubDays();
  const ex: Record<string, number> = (extra as { days?: Record<string, number> }).days ?? {};
  return buildCalendar([gh, ex]);
}
