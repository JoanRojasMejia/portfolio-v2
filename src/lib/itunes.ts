// Preview de 30 s y carátula desde la iTunes Search API (sin key). Solo se usa en
// build time, junto con Last.fm. Si la búsqueda no encuentra la misma canción
// (mismo artista y título), no se devuelve nada: mejor sin preview que uno equivocado.

export interface ItunesMatch {
  preview: string; // audio AAC de ~30 s
  artwork: string | null;
}

const API = 'https://itunes.apple.com/search';
const TIMEOUT_MS = 5000;

interface ItunesResult {
  artistName?: string;
  trackName?: string;
  previewUrl?: string;
  artworkUrl100?: string;
}

// Minúsculas, sin tildes, sin "(feat. …)"/"[Remix]" ni signos: para comparar nombres.
const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\(.*?\)|\[.*?\]/g, ' ')
    .replace(/\b(feat|ft)\.?\s.*$/, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

// Coincide si uno contiene al otro ("Funk Tribu" ↔ "Funk Tribu & X", "Hold On" ↔ "Hold On (Extended)").
const same = (a: string, b: string) => {
  const [x, y] = [normalize(a), normalize(b)];
  return !!x && !!y && (x === y || x.includes(y) || y.includes(x));
};

export async function findPreview(artist: string, name: string): Promise<ItunesMatch | null> {
  if (!artist || !name) return null;
  const params = new URLSearchParams({ term: `${artist} ${name}`, entity: 'song', limit: '10' });
  try {
    const res = await fetch(`${API}?${params}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { results = [] } = (await res.json()) as { results?: ItunesResult[] };
    const hit = results.find(
      (r) => r.previewUrl && same(r.artistName ?? '', artist) && same(r.trackName ?? '', name),
    );
    if (!hit) return null;
    return {
      preview: hit.previewUrl!,
      // 100×100 es poco para retina; Apple sirve otros tamaños cambiando el sufijo.
      artwork: hit.artworkUrl100?.replace(/\/\d+x\d+bb\./, '/200x200bb.') ?? null,
    };
  } catch (err) {
    console.warn(`[itunes] No se pudo buscar el preview: ${(err as Error).message}`);
    return null;
  }
}
