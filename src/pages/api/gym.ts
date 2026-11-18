// Calendario del gimnasio (Hevy), consultado en cada visita en vez de solo en el build.
// Corre como función de Vercel: la API key se queda en el servidor y al navegador solo
// llega el calendario ya armado. AboutSection.vue lo pide una vez al cargar la página.

import type { APIRoute } from 'astro';
import { getGymCalendar } from '../../lib/hevy';

export const prerender = false;

// Hevy limita las solicitudes (429) y un calendario de entrenos no necesita estar al
// minuto: la CDN de Vercel guarda la respuesta 10 min y, mientras trae una nueva,
// sigue sirviendo la anterior hasta 1 h.
const CACHE = 'public, max-age=0, s-maxage=600, stale-while-revalidate=3600';

export const GET: APIRoute = async () => {
  const gym = await getGymCalendar();
  // Si Hevy falla no se cachea: la página se queda con los datos del build y la
  // siguiente visita vuelve a intentar.
  return new Response(JSON.stringify({ gym }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': gym ? CACHE : 'no-store',
      'CDN-Cache-Control': gym ? CACHE : 'no-store',
    },
  });
};
