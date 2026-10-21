// Cuadrícula del último año, como la de GitHub: 53 semanas que terminan en la
// semana actual, con cada columna de domingo a sábado. La comparten el calendario
// de Actividad (GitHub + CodeCommit) y el de días de gimnasio (Hevy).

export interface CalendarDay {
  date: string; // AAAA-MM-DD
  counts: number[]; // un conteo por fuente, en el mismo orden en que se pasaron
}

export interface Calendar {
  weeks: CalendarDay[][]; // columnas de domingo a sábado, la última es la semana actual
  totals: number[]; // total por fuente dentro de la cuadrícula
  total: number;
}

const WEEKS = 53;

// Fecha de hoy en Bogotá, como AAAA-MM-DD.
const todayBogota = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date());

const iso = (d: Date) => d.toISOString().slice(0, 10);

// Arma la cuadrícula a partir de conteos por día de una o varias fuentes.
// Devuelve null si no hay nada en el periodo (mejor que un calendario vacío).
export function buildCalendar(sources: Record<string, number>[]): Calendar | null {
  const end = new Date(`${todayBogota()}T00:00:00Z`);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - end.getUTCDay() - (WEEKS - 1) * 7);

  const weeks: CalendarDay[][] = [];
  const totals = sources.map(() => 0);
  for (const d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    if (d.getUTCDay() === 0) weeks.push([]);
    const date = iso(d);
    const counts = sources.map((s) => s[date] ?? 0);
    counts.forEach((c, i) => (totals[i] += c));
    weeks[weeks.length - 1].push({ date, counts });
  }

  const total = totals.reduce((a, b) => a + b, 0);
  return total ? { weeks, totals, total } : null;
}
