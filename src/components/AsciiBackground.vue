<template>
  <canvas ref="base" class="ascii-bg" aria-hidden="true"></canvas>
  <canvas ref="wave" class="ascii-wave" aria-hidden="true"></canvas>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

// Fondo ASCII animado: una cuadrícula de letras y números aleatorios, casi
// invisible, que solo asoma en vetas orgánicas que se desplazan lentamente.
// La máscara CSS lo oculta detrás de la columna de 1200px para que solo se
// vea en los márgenes.
//
// Al hacer clic en el fondo nace una onda expansiva de letras y números en
// todo el viewport (segundo canvas, sin máscara). Casi siempre es un círculo;
// a veces es un corazón. Conserva su forma mientras crece, con el borde
// irregular, un eco más tenue por dentro y una textura que la va rompiendo.
const FPS = 15;
const CELL_W = 7; // los caracteres van casi pegados, como texto
const CELL_H = 12;
const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const LEVELS = 6; // niveles de opacidad para agrupar fillStyle
const INK = { light: '17, 17, 17', dark: '237, 235, 230' };
const BASE_ALPHA = { light: 0.13, dark: 0.15 };

// Onda: Mauve de Catppuccin (Latte en claro, Mocha en oscuro).
const MAUVE = { light: '136, 57, 239', dark: '203, 166, 247' };
const WAVE_ALPHA = { light: 0.2, dark: 0.28 };
const WAVE_FPS = 40;
const WAVE_MS = 2200;
const HEART_CHANCE = 0.35;
const MAX_WAVES = 6;

// Radio del corazón por ángulo (0..1), muestreado de la curva paramétrica
// clásica x = 16 sin³t, y = 13 cos t − 5 cos 2t − 2 cos 3t − cos 4t.
const BINS = 180;
const HEART = (() => {
  const r = new Float32Array(BINS);
  for (let k = 0; k < 2400; k++) {
    const s = (k / 2400) * Math.PI * 2;
    const x = 16 * Math.sin(s) ** 3;
    // Centrar verticalmente e invertir y (en pantalla y crece hacia abajo).
    const y = -(13 * Math.cos(s) - 5 * Math.cos(2 * s) - 2 * Math.cos(3 * s) - Math.cos(4 * s) + 2.5);
    const b = Math.floor(((Math.atan2(y, x) + Math.PI) / (Math.PI * 2)) * BINS) % BINS;
    r[b] = Math.max(r[b], Math.hypot(x, y));
  }
  for (let b = 0; b < BINS; b++) if (!r[b]) r[b] = r[(b + BINS - 1) % BINS];
  const max = Math.max(...r);
  return r.map((v) => v / max);
})();

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Ruido de valor 2D (0..1) para la textura de manchas del anillo.
const hash = (x: number, y: number) => {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
};
const noise = (x: number, y: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const u = smooth(0, 1, x - xi);
  const v = smooth(0, 1, y - yi);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};

interface Wave { x: number; y: number; born: number; heart: boolean; seed: number; reach: number }

const base = ref<HTMLCanvasElement | null>(null);
const wave = ref<HTMLCanvasElement | null>(null);
let cleanup: (() => void) | undefined;

onMounted(() => {
  const el = base.value;
  const wel = wave.value;
  const ctx = el?.getContext('2d');
  const wctx = wel?.getContext('2d');
  if (!el || !ctx || !wel || !wctx) return;

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let mode: 'light' | 'dark' = root.dataset.theme === 'dark' ? 'dark' : 'light';
  let waves: Wave[] = [];
  let waveDirty = false;
  let t = 0;
  let last = 0;
  let raf = 0;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    for (const [c, x] of [[el, ctx], [wel, wctx]] as const) {
      c.width = Math.ceil(window.innerWidth * dpr);
      c.height = Math.ceil(window.innerHeight * dpr);
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.font = '10px "Geist Mono", ui-monospace, monospace';
    }
  };

  // Carácter de una celda: aleatorio, y cada celda cambia a su propio ritmo.
  const charAt = (c: number, r: number, now: number) => {
    const tick = Math.floor(now / 700 + hash(c, r) * 10);
    return CHARS[Math.floor(hash(c, r + tick * 0.37) * CHARS.length)];
  };

  // Vetas: ruido "ridged" (1 − |2n − 1|) sobre coordenadas inclinadas, para
  // que asomen trazos diagonales finos en lugar de manchas redondas.
  const vein = (px: number, py: number) => {
    const u = (px + py * 0.6) * 0.004 + t * 0.6;
    const v = (py - px * 0.35) * 0.008 - t * 0.4;
    const n = 0.65 * noise(u, v) + 0.35 * noise(u * 2.1 + 5.2, v * 2.1 + 1.3);
    // Zonas más calmadas: suben el umbral (menos vetas) pero nunca vacían el fondo.
    // Antes multiplicaban la intensidad y podían dejar los márgenes en negro por minutos.
    const zone = noise(px * 0.004 + 11.3 + t * 0.25, py * 0.004 - t * 0.35);
    const threshold = 0.74 + 0.12 * (1 - zone);
    return smooth(threshold, threshold + 0.2, 1 - Math.abs(2 * n - 1));
  };

  // Agrupa celdas por nivel de opacidad y las pinta con pocos cambios de fillStyle.
  const paint = (x: CanvasRenderingContext2D, buckets: number[][], rgb: string, alpha: number, now: number) => {
    for (let l = 0; l < LEVELS; l++) {
      const cells = buckets[l];
      if (!cells.length) continue;
      x.fillStyle = `rgba(${rgb}, ${(((l + 1) / LEVELS) * alpha).toFixed(3)})`;
      for (let i = 0; i < cells.length; i += 2) {
        const px = cells[i];
        const py = cells[i + 1];
        x.fillText(charAt((px - CELL_W / 2) / CELL_W, (py - CELL_H / 2) / CELL_H, now), px, py);
      }
    }
  };

  const drawBase = (now = performance.now()) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cols = Math.ceil(w / CELL_W);
    const rows = Math.ceil(h / CELL_H);
    const buckets: number[][] = Array.from({ length: LEVELS }, () => []);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const px = c * CELL_W + CELL_W / 2;
        const py = r * CELL_H + CELL_H / 2;
        const s = vein(px, py);
        if (s < 0.08) continue;
        buckets[Math.min(LEVELS - 1, Math.floor(s * LEVELS))].push(px, py);
      }
    }

    ctx.clearRect(0, 0, w, h);
    paint(ctx, buckets, INK[mode], BASE_ALPHA[mode], now);
  };

  // Intensidad (0..1) de las ondas activas en un punto.
  const waveAt = (px: number, py: number, now: number) => {
    let s = 0;
    for (const wv of waves) {
      const p = (now - wv.born) / WAVE_MS;
      const radius = wv.reach * (1 - (1 - p) ** 2.2);
      const dx = px - wv.x;
      const dy = py - wv.y;
      const dist = Math.hypot(dx, dy);
      if (dist > radius * 1.25 + 80) continue;
      const angle = Math.atan2(dy, dx);
      const shape = wv.heart ? HEART[Math.floor(((angle + Math.PI) / (Math.PI * 2)) * BINS) % BINS] : 1;
      // Borde orgánico: la deformación crece a medida que la onda se abre.
      const wobble = 1 + (0.03 + 0.08 * p) *
        (0.6 * Math.sin(3 * angle + wv.seed + 2 * p) + 0.4 * Math.sin(5 * angle - wv.seed * 1.7 - 3 * p));
      const edge = shape * radius * wobble;
      const width = 12 + 52 * p;
      const ring = Math.exp(-(((dist - edge) / width) ** 2));
      // Ecos interiores, cada uno con su propia deformación para que no queden concéntricos.
      const bend = (k: number) => 1 + (0.05 + 0.1 * p) * Math.sin(k * angle + wv.seed * k + 4 * p);
      const echo = smooth(0.1, 0.35, p) *
        (0.6 * Math.exp(-(((dist - edge * 0.72 * bend(2)) / (width * 1.2)) ** 2)) +
          0.3 * Math.exp(-(((dist - edge * 0.45 * bend(4)) / (width * 1.5)) ** 2)));
      // Vetas: ruido en coordenadas polares, estirado a lo largo del anillo.
      // Deja huecos en la banda y la va rompiendo al final.
      const patch = noise(Math.cos(angle) * 4 + wv.seed * 10, Math.sin(angle) * 4 + dist * 0.035 - p * 2);
      const texture = (0.2 + 0.8 * smooth(0.2, 0.75, patch)) * (1 - 0.7 * p * (1 - patch));
      const fade = smooth(0, 0.05, p) * (1 - p) ** 0.9;
      s = Math.max(s, (ring + echo) * texture * fade);
    }
    return Math.min(1, s);
  };

  const drawWaves = (now: number) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    waves = waves.filter((wv) => now - wv.born < WAVE_MS);
    if (!waves.length) {
      if (waveDirty) wctx.clearRect(0, 0, w, h);
      waveDirty = false;
      return;
    }
    waveDirty = true;

    const cols = Math.ceil(w / CELL_W);
    const rows = Math.ceil(h / CELL_H);
    const buckets: number[][] = Array.from({ length: LEVELS }, () => []);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const px = c * CELL_W + CELL_W / 2;
        const py = r * CELL_H + CELL_H / 2;
        const s = waveAt(px, py, now);
        if (s < 0.05) continue;
        buckets[Math.min(LEVELS - 1, Math.floor(s * LEVELS))].push(px, py);
      }
    }

    wctx.clearRect(0, 0, w, h);
    paint(wctx, buckets, MAUVE[mode], WAVE_ALPHA[mode], now);
  };

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if (now - last < 1000 / (waves.length ? WAVE_FPS : FPS)) return;
    // Velocidad constante sin importar los fps; se limita el salto al volver a la pestaña.
    t += Math.min(0.1, (now - last) / 1000) * 0.15;
    last = now;
    drawBase(now);
    drawWaves(now);
  };

  const start = () => {
    cancelAnimationFrame(raf);
    if (reduceMotion.matches) drawBase();
    else raf = requestAnimationFrame(loop);
  };

  const onResize = () => {
    resize();
    drawBase();
  };

  const addWave = (x: number, y: number, heart: boolean) => {
    if (reduceMotion.matches) return;
    waves.push({
      x,
      y,
      born: performance.now(),
      heart,
      seed: Math.random() * Math.PI * 2,
      reach: Math.min(900, Math.max(380, 0.48 * Math.max(window.innerWidth, window.innerHeight))),
    });
    if (waves.length > MAX_WAVES) waves.shift();
  };

  // Cualquier clic en el fondo (no en enlaces ni controles) lanza una onda.
  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    if ((e.target as Element | null)?.closest('a, button, input, textarea, select, label, [role="button"]')) return;
    addWave(e.clientX, e.clientY, Math.random() < HEART_CHANCE);
  };

  // Otras partes del sitio pueden lanzar una onda (p. ej. las mascotas al saludar):
  // window.dispatchEvent(new CustomEvent('jr:wave', { detail: { x, y, heart: true } }))
  const onWaveEvent = (e: Event) => {
    const { x, y, heart } = (e as CustomEvent<{ x: number; y: number; heart?: boolean }>).detail ?? {};
    if (Number.isFinite(x) && Number.isFinite(y)) addWave(x, y, heart ?? true);
  };

  const themeObserver = new MutationObserver(() => {
    mode = root.dataset.theme === 'dark' ? 'dark' : 'light';
    drawBase();
  });

  resize();
  start();
  window.addEventListener('resize', onResize);
  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('jr:wave', onWaveEvent);
  reduceMotion.addEventListener('change', start);
  themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  document.fonts?.ready.then(() => drawBase());

  cleanup = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('jr:wave', onWaveEvent);
    reduceMotion.removeEventListener('change', start);
    themeObserver.disconnect();
  };
});

onBeforeUnmount(() => cleanup?.());
</script>

<style scoped>
.ascii-bg,
.ascii-wave {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
}
.ascii-bg {
  --clear: 600px; /* mitad de la columna .sheet */
  --fade: 80px;
  -webkit-mask-image: linear-gradient(to right, #000 0, #000 calc(50% - var(--clear) - var(--fade)), transparent calc(50% - var(--clear)), transparent calc(50% + var(--clear)), #000 calc(50% + var(--clear) + var(--fade)), #000 100%);
  mask-image: linear-gradient(to right, #000 0, #000 calc(50% - var(--clear) - var(--fade)), transparent calc(50% - var(--clear)), transparent calc(50% + var(--clear)), #000 calc(50% + var(--clear) + var(--fade)), #000 100%);
}
</style>
