// Canción actual de Last.fm, consultada en cada visita (no en el build). Corre como
// función de Vercel: la API key se queda en el servidor y al navegador solo llega
// el JSON con la canción. NowPlaying.vue lo pide al cargar y cada cierto tiempo.

import type { APIRoute } from 'astro';
import { getRecentTrack } from '../../lib/lastfm';

export const prerender = false;

// La CDN de Vercel guarda la respuesta 20 s: con muchas visitas a la vez, Last.fm
// recibe como mucho una consulta cada 20 s, y la canción llega con poco atraso.
const CACHE = 'public, max-age=0, s-maxage=20, stale-while-revalidate=40';

export const GET: APIRoute = async () => {
  const track = await getRecentTrack();
  return new Response(JSON.stringify({ track }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': CACHE,
      'CDN-Cache-Control': CACHE,
    },
  });
};
