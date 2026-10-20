// Última canción escuchada en Last.fm. Solo se usa en el frontmatter de Astro
// (build time), así la API key nunca llega al navegador: al cliente solo pasan
// los datos de la canción. El preview de audio y la carátula de respaldo salen
// de iTunes (ver itunes.ts).

import { findPreview } from './itunes';

export interface RecentTrack {
  name: string;
  artist: string;
  url: string;
  image: string | null; // null → disco de respaldo
  nowPlaying: boolean;
  preview: string | null; // audio de ~30 s de iTunes; null → el botón solo anima
}

const API = 'https://ws.audioscrobbler.com/2.0/';
const TIMEOUT_MS = 5000;
// Imagen genérica que Last.fm devuelve cuando no tiene carátula.
const PLACEHOLDER_HASH = '2a96cbd8b46e442fc41c2b86b821562f';

interface LastfmImage { size: string; '#text': string }
interface LastfmTrack {
  name?: string;
  url?: string;
  artist?: { '#text'?: string };
  image?: LastfmImage[];
  '@attr'?: { nowplaying?: string };
}

const coverOf = (images: LastfmImage[] = []) => {
  // "large" (174 px) alcanza para el disco de 40 px en pantallas retina.
  const url = (images.find((i) => i.size === 'large') ?? images.at(-1))?.['#text'] ?? '';
  return url && !url.includes(PLACEHOLDER_HASH) ? url : null;
};

export async function getRecentTrack(): Promise<RecentTrack | null> {
  const key = import.meta.env.LASTFM_KEY;
  const user = import.meta.env.LASTFM_USER;
  if (!key || !user) {
    console.warn('[lastfm] Faltan LASTFM_KEY o LASTFM_USER; se usa el estado de respaldo.');
    return null;
  }

  const params = new URLSearchParams({ method: 'user.getrecenttracks', user, api_key: key, limit: '1', format: 'json' });
  try {
    const res = await fetch(`${API}?${params}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(`${data.error}: ${data.message}`);
    // Con una canción sonando, Last.fm devuelve dos (la actual y la última
    // registrada) aunque se pida limit=1; la primera es la más reciente.
    const raw = data.recenttracks?.track;
    const track: LastfmTrack | undefined = Array.isArray(raw) ? raw[0] : raw;
    if (!track?.name || !track.url) return null;
    const artist = track.artist?.['#text'] ?? '';
    const itunes = await findPreview(artist, track.name);
    return {
      name: track.name,
      artist,
      url: track.url,
      // Last.fm a veces no trae carátula; la de iTunes cubre ese caso.
      image: coverOf(track.image) ?? itunes?.artwork ?? null,
      nowPlaying: track['@attr']?.nowplaying === 'true',
      preview: itunes?.preview ?? null,
    };
  } catch (err) {
    // Nunca se registra la URL: lleva la API key.
    console.warn(`[lastfm] No se pudo leer la última canción: ${(err as Error).message}`);
    return null;
  }
}
