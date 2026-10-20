<template>
  <span ref="host" class="ascii-build">
    <slot />
    <canvas ref="canvas" class="ascii-build-canvas" aria-hidden="true"></canvas>
    <canvas ref="crewCanvas" class="ascii-build-canvas" aria-hidden="true"></canvas>
  </span>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { ARM_POSES, LOGO_H, LOGO_PATH, LOGO_W, WAVE_STEP_MS, wavePose, type ArmPose } from '../lib/logo';

// Arma una imagen (o un SVG) estilo Tetris cuando entra en pantalla, con dos
// mascotas (el logo) que entran por las esquinas superiores:
//   1. Pasada ASCII: cada mascota avanza de su esquina hacia el centro soltando
//      columnas de la imagen dibujadas con caracteres; cada columna cae con
//      gravedad hasta su lugar.
//   2. Se encuentran en el centro y regresan hacia su esquina soltando las
//      mismas columnas en píxeles (bloques del color real), que caen encima de
//      las de ASCII y las reemplazan.
//   3. Aparece la imagen real. Con finale "greet" (por defecto) las mascotas
//      bajan al borde superior de la imagen, caminan hacia el centro, saludan
//      con el brazo de afuera, lanzan una onda de corazón en el fondo y luego
//      siguen paseando lento sobre la imagen; cada 12–20 s se reencuentran en el
//      centro y repiten el saludo y el corazón. Con finale "leave" se juntan en el centro y se van volando.
// Respeta object-fit/object-position y los filtros grayscale/contrast/brightness
// del elemento, para que los bloques coincidan con lo que se ve al final.
const props = withDefaults(
  defineProps<{
    cell?: number; // tamaño de cada celda en px
    strip?: number; // ancho de cada columna que se suelta, en celdas
    stepMs?: number; // tiempo entre una columna y la siguiente
    delay?: number; // ms antes de empezar
    agentSize?: number; // ancho de cada mascota en px
    finale?: 'greet' | 'leave'; // al terminar: caminar al centro y saludar, o irse volando
  }>(),
  { cell: 8, strip: 3, stepMs: 110, delay: 0, agentSize: 22, finale: 'greet' },
);

const RAMP = ' .:-=+*#%@';
const NOISE = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const ENTER_MS = 450; // las mascotas entran volando antes de soltar la primera columna
const FALL_MS = 340; // caída de una columna (gravedad)
const BOUNCE_MS = 140; // rebote al aterrizar
const SCRAMBLE_MS = 180; // los caracteres son aleatorios este tiempo tras aterrizar
const MEET_MS = 260; // pausa en el centro entre pasadas
const REVEAL_MS = 320;
const HUDDLE_MS = 450; // (finale "leave") se juntan en el centro antes de irse
const LAND_MS = 600; // (finale "greet") aterrizan sobre el borde superior de la imagen
const GREET_MS = 1800; // saludo con la mano
// Paseo después del saludo: lento, con pausas entre tramos.
const PATROL_SPEED = 0.05; // fracción del ancho de la imagen por segundo
const PATROL_MIN_SPEED = 14; // px/s
const PATROL_REST_MS = [900, 2600] as const;
const REUNION_EVERY_MS = [12000, 20000] as const; // cada cuánto vuelven a encontrarse en el centro
// Física de las mascotas (resorte amortiguado hacia la columna que sueltan).
const SPRING = 260;
const DAMPING = 28;

interface Strip {
  x: number; // borde izquierdo en px
  w: number;
  cells: { y: number; dx: number; color: string; glyph: string }[];
  ascii: number; // ms en que se suelta la columna ASCII
  pixel: number; // ms en que se suelta la columna de píxeles
}

interface Agent {
  x: number;
  y: number;
  vx: number;
  vy: number;
  face: number;
  phase: number;
  mode: 'build' | 'land' | 'walk' | 'wait' | 'greet' | 'idle';
  stride: number; // distancia caminada (para el paso de las patas)
  pose: ArmPose | null; // pose del brazo de afuera al saludar (null = en reposo)
  drops: { at: number; x: number }[]; // sus columnas, en orden de tiempo
  next: number;
}

const host = ref<HTMLElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const crewCanvas = ref<HTMLCanvasElement | null>(null);
let stop: (() => void) | undefined;

// Lee grayscale/contrast/brightness del filtro CSS para replicarlos en los píxeles.
const parseFilter = (filter: string) => {
  const get = (name: string, fallback: number) => {
    const m = filter.match(new RegExp(`${name}\\(([\\d.]+)(%?)\\)`));
    return m ? parseFloat(m[1]) / (m[2] ? 100 : 1) : fallback;
  };
  return { gray: get('grayscale', 0), contrast: get('contrast', 1), bright: get('brightness', 1) };
};

const loadSource = async (el: Element): Promise<CanvasImageSource | null> => {
  if (el instanceof HTMLImageElement) {
    if (!el.complete) await new Promise((r) => el.addEventListener('load', r, { once: true }));
    return el.naturalWidth ? el : null;
  }
  if (el instanceof SVGSVGElement) {
    // currentColor no existe fuera del documento: se reemplaza por el color calculado.
    const color = getComputedStyle(el).color;
    const markup = new XMLSerializer().serializeToString(el).replace(/currentColor/g, color);
    const img = new Image();
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
    await img.decode();
    return img;
  }
  return null;
};

// La mascota (el logo) separada en partes para animarla, en unidades del logo:
// brazos = bloques que sobresalen a los costados; patas = bloques de abajo.
const ARM_L = [0, 331, 80, 99] as const; // x, y, ancho, alto
const ARM_R = [663, 331, 79, 99] as const;
const LEGS_Y = 491;

type Part = 'body' | 'armL' | 'armR' | 'legL' | 'legR';

const makeRig = (width: number, color: string, dpr: number) => {
  const height = Math.round((width * LOGO_H) / LOGO_W);
  const logo = new Path2D(LOGO_PATH);
  const part = (clip: (c: CanvasRenderingContext2D) => void) => {
    const cv = document.createElement('canvas');
    cv.width = Math.ceil(width * dpr);
    cv.height = Math.ceil(height * dpr);
    const c = cv.getContext('2d');
    if (c) {
      c.scale((width * dpr) / LOGO_W, (height * dpr) / LOGO_H);
      c.fillStyle = color;
      clip(c);
    }
    return cv;
  };
  const only = (x: number, y: number, w: number, h: number) => (c: CanvasRenderingContext2D) => {
    c.beginPath();
    c.rect(x, y, w, h);
    c.clip();
    c.fill(logo);
  };
  const parts: Record<Part, HTMLCanvasElement> = {
    body: part((c) => {
      c.fill(logo);
      c.clearRect(...ARM_L);
      c.clearRect(...ARM_R);
      c.clearRect(0, LEGS_Y, LOGO_W, LOGO_H - LEGS_Y);
    }),
    armL: part(only(...ARM_L)),
    armR: part(only(...ARM_R)),
    legL: part(only(0, LEGS_Y, LOGO_W / 2, LOGO_H - LEGS_Y)),
    legR: part(only(LOGO_W / 2, LEGS_Y, LOGO_W / 2, LOGO_H - LEGS_Y)),
  };
  return { parts, width, height, color, scale: width / LOGO_W };
};

// Desplazamiento vertical de una columna que cae: gravedad y un rebote corto.
const fallOffset = (dt: number, from: number) => {
  if (dt < FALL_MS) {
    const p = dt / FALL_MS;
    return -from * (1 - p * p);
  }
  const q = (dt - FALL_MS) / BOUNCE_MS;
  return q < 1 ? -Math.min(6, from * 0.02) * Math.sin(Math.PI * q) * (1 - q) : 0;
};

onMounted(() => {
  const wrap = host.value;
  const cv = canvas.value;
  const crew = crewCanvas.value;
  const target = wrap?.firstElementChild as HTMLElement | SVGSVGElement | null;
  const ctx = cv?.getContext('2d');
  const cctx = crew?.getContext('2d');
  if (!wrap || !cv || !crew || !target || target === cv) return;
  // El CSS oculta el elemento desde el primer render (sin destello antes de hidratar);
  // cualquier salida temprana lo vuelve a mostrar.
  if (!ctx || !cctx || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    target.style.opacity = '1';
    return;
  }

  let raf = 0;
  let revealed = false;
  let done = false;
  let stopIdle: (() => void) | undefined;

  const fadeOut = (c: HTMLCanvasElement) => {
    c.style.transition = `opacity ${REVEAL_MS}ms ease`;
    c.style.opacity = '0';
    setTimeout(() => (c.width = c.height = 0), REVEAL_MS + 50);
  };

  // Muestra la imagen real en lugar de los bloques.
  const revealImage = () => {
    if (revealed) return;
    revealed = true;
    target.style.transition = `opacity ${REVEAL_MS}ms ease`;
    target.style.opacity = '1';
    fadeOut(cv);
    setTimeout(() => (target.style.transition = ''), REVEAL_MS + 50);
  };

  // Termina todo: imagen visible y mascotas fuera.
  const reveal = () => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    revealImage();
    fadeOut(crew);
  };

  const build = async () => {
    const source = await loadSource(target).catch(() => null);
    let rect = target.getBoundingClientRect();
    if (!source || done || !rect.width || !rect.height) return reveal();

    // Canvas de bloques exactamente sobre el elemento, con su misma máscara y
    // mezcla; el de mascotas, igual pero con margen para entrar y salir volando.
    const parent = (cv.offsetParent as HTMLElement | null) ?? document.body;
    const pr = parent.getBoundingClientRect();
    const style = getComputedStyle(target);
    const left = rect.left - pr.left - parent.clientLeft;
    const top = rect.top - pr.top - parent.clientTop;
    Object.assign(cv.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      mixBlendMode: style.mixBlendMode,
      maskImage: style.maskImage,
      webkitMaskImage: style.getPropertyValue('-webkit-mask-image'),
    });
    const pad = props.agentSize * 3;
    Object.assign(crew.style, {
      left: `${left - pad}px`,
      top: `${top - pad}px`,
      width: `${rect.width + pad * 2}px`,
      height: `${rect.height + pad * 2}px`,
    });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.ceil(rect.width * dpr);
    cv.height = Math.ceil(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    crew.width = Math.ceil((rect.width + pad * 2) * dpr);
    crew.height = Math.ceil((rect.height + pad * 2) * dpr);
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Muestrear la imagen a una cuadrícula de celdas, imitando object-fit: cover.
    const cols = Math.max(1, Math.round(rect.width / props.cell));
    const rows = Math.max(1, Math.round(rect.height / props.cell));
    const cw = rect.width / cols;
    const ch = rect.height / rows;
    const sample = document.createElement('canvas');
    sample.width = cols;
    sample.height = rows;
    const sctx = sample.getContext('2d', { willReadFrequently: true });
    if (!sctx) return reveal();
    let sx = 0;
    let sy = 0;
    let sw = (source as HTMLImageElement).naturalWidth || (source as HTMLImageElement).width;
    let sh = (source as HTMLImageElement).naturalHeight || (source as HTMLImageElement).height;
    if (target instanceof HTMLImageElement && style.objectFit === 'cover') {
      const [px, py] = style.objectPosition.split(' ').map((v) => parseFloat(v) / 100);
      const scale = Math.max(rect.width / sw, rect.height / sh);
      const vw = rect.width / scale;
      const vh = rect.height / scale;
      sx = (sw - vw) * (Number.isFinite(px) ? px : 0.5);
      sy = (sh - vh) * (Number.isFinite(py) ? py : 0.5);
      sw = vw;
      sh = vh;
    }
    sctx.imageSmoothingQuality = 'high';
    sctx.drawImage(source, sx, sy, sw, sh, 0, 0, cols, rows);
    const data = sctx.getImageData(0, 0, cols, rows).data;

    // Agrupar las celdas en columnas de `strip` celdas de ancho.
    const { gray, contrast, bright } = parseFilter(style.filter);
    const dark = document.documentElement.dataset.theme === 'dark';
    const stripCount = Math.ceil(cols / props.strip);
    const strips: Strip[] = Array.from({ length: stripCount }, (_, s) => {
      const c0 = s * props.strip;
      const c1 = Math.min(cols, c0 + props.strip);
      return { x: c0 * cw, w: (c1 - c0) * cw, cells: [], ascii: 0, pixel: 0 };
    });
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = (r * cols + c) * 4;
        if (data[i + 3] < 128) continue; // transparente (SVG)
        let [red, green, blue] = [data[i], data[i + 1], data[i + 2]];
        const lum = 0.299 * red + 0.587 * green + 0.114 * blue;
        const tone = (v: number) => {
          const g = v + (lum - v) * gray;
          return Math.max(0, Math.min(255, ((g * bright) / 255 - 0.5) * contrast * 255 + 127.5));
        };
        [red, green, blue] = [tone(red), tone(green), tone(blue)];
        const l = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
        // La "tinta" es lo oscuro en tema claro y lo brillante en tema oscuro.
        const ink = dark ? l : 1 - l;
        const glyph = RAMP[Math.min(RAMP.length - 1, Math.floor(ink * RAMP.length))];
        const strip = strips[Math.floor(c / props.strip)];
        strip.cells.push({ y: r * ch, dx: c * cw - strip.x, color: `rgb(${red | 0} ${green | 0} ${blue | 0})`, glyph });
      }
    }

    // Calendario: la mascota izquierda cubre la mitad izquierda y la derecha la otra.
    // Ida (ASCII) de las esquinas al centro; vuelta (píxeles) del centro a las esquinas.
    const half = Math.ceil(stripCount / 2);
    const leftSide = strips.slice(0, half);
    const rightSide = strips.slice(half).reverse(); // de la esquina derecha al centro
    const steps = Math.max(leftSide.length, rightSide.length);
    const pass2 = ENTER_MS + (steps - 1) * props.stepMs + FALL_MS + MEET_MS;
    for (const side of [leftSide, rightSide]) {
      side.forEach((strip, i) => {
        strip.ascii = ENTER_MS + i * props.stepMs;
        strip.pixel = pass2 + (side.length - 1 - i) * props.stepMs;
      });
    }
    const end = pass2 + (steps - 1) * props.stepMs + FALL_MS + BOUNCE_MS;
    const fallFrom = rect.height + props.agentSize; // cae desde los pies de la mascota

    const fg = () => getComputedStyle(wrap).getPropertyValue('--fg').trim() || style.color;
    let rig = makeRig(props.agentSize, fg(), dpr);
    const { width: aw, height: ah } = rig;
    const hoverY = -ah * 0.4; // mientras arman, flotan justo encima del borde superior
    const makeAgent = (side: Strip[], startX: number): Agent => ({
      x: startX,
      y: -pad,
      vx: 0,
      vy: 0,
      face: startX < rect.width / 2 ? 1 : -1,
      phase: Math.random() * Math.PI * 2,
      mode: 'build',
      stride: 0,
      pose: null,
      drops: [
        ...side.map((s) => ({ at: s.ascii, x: s.x + s.w / 2 })),
        ...[...side].reverse().map((s) => ({ at: s.pixel, x: s.x + s.w / 2 })),
      ],
      next: 0,
    });
    const agents = [makeAgent(leftSide, -aw), makeAgent(rightSide, rect.width + aw)];

    // Final "greet": esquinas → centro caminando sobre el borde superior de la imagen.
    const corner = (k: number) => (k === 0 ? aw * 0.7 : rect.width - aw * 0.7);
    const meet = (k: number) => rect.width / 2 + (k === 0 ? -aw * 0.75 : aw * 0.75);
    const walkSpeed = Math.max(60, rect.width * 0.22); // px/s
    let greetAt = -1;
    let waved = false;

    const fontSize = Math.max(4, Math.min(cw, ch) * 1.15);
    ctx.font = `${fontSize}px "Geist Mono", ui-monospace, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const t0 = performance.now();
    let prev = t0;

    const spring = (a: Agent, tx: number, ty: number, dt: number) => {
      a.vx += ((tx - a.x) * SPRING - DAMPING * a.vx) * dt;
      a.vy += ((ty - a.y) * SPRING - DAMPING * a.vy) * dt;
      a.x += a.vx * dt;
      a.y += a.vy * dt;
    };

    // Onda de corazón en el fondo (AsciiBackground escucha este evento).
    const sendHeart = () => {
      const r = crew.getBoundingClientRect();
      window.dispatchEvent(
        new CustomEvent('jr:wave', { detail: { x: r.left + pad + rect.width / 2, y: r.top + pad - ah * 0.5, heart: true } }),
      );
    };

    const moveAgents = (t: number, now: number, dt: number) => {
      const after = t - end;
      agents.forEach((a, k) => {
        if (after < 0) {
          // Armando: saltito al soltar cada columna.
          while (a.next < a.drops.length && a.drops[a.next].at <= t) {
            a.next++;
            a.vy -= 140;
          }
          const tx = a.drops[Math.min(a.next, a.drops.length - 1)]?.x ?? a.x;
          spring(a, tx, hoverY + 2 * Math.sin(now / 140 + a.phase), dt);
          if (Math.abs(a.vx) > 8) a.face = Math.sign(a.vx);
          return;
        }
        if (props.finale === 'leave') {
          if (after < HUDDLE_MS) {
            spring(a, rect.width / 2 + (k === 0 ? -aw * 0.7 : aw * 0.7), hoverY, dt);
            a.face = Math.abs(a.vx) > 8 ? Math.sign(a.vx) : k === 0 ? 1 : -1;
          } else {
            a.vy -= 1100 * dt;
            a.vx += (k === 0 ? -180 : 180) * dt;
            a.x += a.vx * dt;
            a.y += a.vy * dt;
            a.face = k === 0 ? -1 : 1;
          }
          return;
        }
        if (a.mode === 'build') a.mode = 'land';
        if (a.mode === 'land') {
          // Bajan a pararse sobre el borde superior, en su esquina.
          spring(a, corner(k), 0, dt);
          a.face = k === 0 ? 1 : -1;
          const settled = Math.abs(a.x - corner(k)) < 2 && Math.abs(a.y) < 1.5 && Math.abs(a.vy) < 30;
          if (settled || after > LAND_MS) Object.assign(a, { mode: 'walk', y: 0, vx: 0, vy: 0 });
        } else if (a.mode === 'walk') {
          const dir = k === 0 ? 1 : -1;
          const step = Math.min(walkSpeed * dt, Math.abs(meet(k) - a.x));
          a.x += dir * step;
          a.stride += step;
          a.face = dir;
          if (Math.abs(meet(k) - a.x) < 0.5) a.mode = 'wait';
        } else if (a.mode === 'greet' || a.mode === 'idle') {
          // Saludan con el brazo de afuera, por fotogramas (ver wavePose en logo.ts).
          const g = now - greetAt;
          a.pose = wavePose(g, GREET_MS);
          if (g >= GREET_MS + WAVE_STEP_MS) a.mode = 'idle';
        }
      });
      // Saludo sincronizado cuando llegan los dos.
      if (props.finale === 'greet' && greetAt < 0 && agents.every((a) => a.mode === 'wait')) {
        greetAt = now;
        agents.forEach((a, k) => Object.assign(a, { mode: 'greet', face: k === 0 ? 1 : -1 }));
      }
      if (greetAt >= 0 && !waved) {
        waved = true;
        sendHeart();
      }
    };

    const drawAgents = () => {
      cctx.clearRect(0, 0, rect.width + pad * 2, rect.height + pad * 2);
      const { parts } = rig;
      for (const a of agents) {
        // Paso: patas alternadas y un rebote leve del cuerpo mientras caminan.
        const walking = a.mode === 'walk';
        const swing = Math.sin(a.stride / (aw * 0.18));
        const liftL = walking ? Math.max(0, swing) * ah * 0.14 : 0;
        const liftR = walking ? Math.max(0, -swing) * ah * 0.14 : 0;
        const bob = walking ? -Math.abs(swing) * ah * 0.05 : 0;
        const x0 = -aw / 2;
        const y0 = -ah;
        cctx.save();
        cctx.translate(pad + a.x, pad + a.y);
        if (a.mode === 'build' || props.finale === 'leave') cctx.rotate(Math.max(-0.35, Math.min(0.35, a.vx * 0.0015)));
        cctx.scale(a.face, 1);
        cctx.drawImage(parts.legL, x0, y0 - liftL, aw, ah);
        cctx.drawImage(parts.legR, x0, y0 - liftR, aw, ah);
        cctx.drawImage(parts.body, x0, y0 + bob, aw, ah);
        cctx.drawImage(parts.armR, x0, y0 + bob, aw, ah);
        // Brazo de afuera (el izquierdo del sprite; al voltear la mascota queda a la
        // derecha): en reposo, o la pose del saludo dibujada en bloques.
        if (a.pose) {
          cctx.fillStyle = rig.color;
          const ux = aw / LOGO_W;
          const uy = ah / LOGO_H;
          for (const [x, y, w, h] of ARM_POSES[a.pose]) cctx.fillRect(x0 + x * ux, y0 + bob + y * uy, w * ux, h * uy);
        } else {
          cctx.drawImage(parts.armL, x0, y0 + bob, aw, ah);
        }
        cctx.restore();
      }
    };

    const drawStrips = (t: number) => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      // Columnas ASCII, hasta que su columna de píxeles termina de caer encima.
      ctx.fillStyle = fg();
      ctx.globalAlpha = 0.85;
      for (const s of strips) {
        if (t < s.ascii || t >= s.pixel + FALL_MS) continue;
        const dt = t - s.ascii;
        const oy = fallOffset(dt, fallFrom);
        const scrambling = dt < FALL_MS + SCRAMBLE_MS;
        for (const c of s.cells) {
          const glyph = scrambling ? NOISE[(Math.random() * NOISE.length) | 0] : c.glyph;
          if (glyph !== ' ') ctx.fillText(glyph, s.x + c.dx + cw / 2, c.y + oy + ch / 2);
        }
      }
      // Columnas de píxeles.
      ctx.globalAlpha = 1;
      for (const s of strips) {
        if (t < s.pixel) continue;
        const oy = fallOffset(t - s.pixel, fallFrom);
        for (const c of s.cells) {
          ctx.fillStyle = c.color;
          // +0.5 cubre las uniones entre bloques para que no se vean líneas.
          ctx.fillRect(s.x + c.dx, c.y + oy, cw + 0.5, ch + 0.5);
        }
      }
    };

    // Final "greet": después del saludo, cada mascota pasea lento sobre el borde
    // superior de la imagen, dentro de su mitad (camina a un punto, se detiene y
    // sigue). El paseo se pausa si la imagen sale de la pantalla. Si cambia el
    // tamaño o el tema, se reubican y se repintan con el color de tinta actual.
    const stayOnImage = () => {
      done = true;
      const range = (k: number): [number, number] =>
        k === 0 ? [aw * 0.7, rect.width / 2 - aw * 0.75] : [rect.width / 2 + aw * 0.75, rect.width - aw * 0.7];
      const goals = agents.map(() => ({ x: 0, until: 0 }));
      const rest = (k: number, now: number) => {
        const [lo, hi] = range(k);
        goals[k].x = lo + Math.random() * (hi - lo);
        goals[k].until = now + PATROL_REST_MS[0] + Math.random() * (PATROL_REST_MS[1] - PATROL_REST_MS[0]);
      };
      const start = performance.now();
      agents.forEach((a, k) => {
        Object.assign(a, { y: 0, pose: null, mode: 'idle', face: k === 0 ? 1 : -1 });
        rest(k, start);
      });

      let last = start;
      let visible = true;
      let idleRaf = 0;
      // De vez en cuando se reencuentran en el centro, saludan y lanzan otro corazón.
      const nextReunion = (now: number) =>
        now + REUNION_EVERY_MS[0] + Math.random() * (REUNION_EVERY_MS[1] - REUNION_EVERY_MS[0]);
      let reunionAt = nextReunion(start);
      let reunion: 'off' | 'going' | 'greeting' = 'off';
      let greetStart = 0;

      const walkTo = (a: Agent, x: number, speed: number, dt: number) => {
        const dist = x - a.x;
        if (Math.abs(dist) < 0.5) return true;
        const step = Math.min(speed * dt, Math.abs(dist));
        a.x += Math.sign(dist) * step;
        a.stride += step;
        a.face = Math.sign(dist);
        a.mode = 'walk';
        return false;
      };

      const patrol = (now: number) => {
        const dt = Math.min(1 / 30, (now - last) / 1000);
        last = now;
        const speed = Math.max(PATROL_MIN_SPEED, rect.width * PATROL_SPEED);

        if (reunion === 'off' && now >= reunionAt) reunion = 'going';

        if (reunion === 'going') {
          const arrived = agents.map((a, k) => walkTo(a, meet(k), speed * 1.6, dt));
          agents.forEach((a, k) => {
            if (arrived[k]) Object.assign(a, { mode: 'idle', face: k === 0 ? 1 : -1 });
          });
          if (arrived.every(Boolean)) {
            reunion = 'greeting';
            greetStart = now;
            sendHeart();
          }
        } else if (reunion === 'greeting') {
          const g = now - greetStart;
          agents.forEach((a) => (a.pose = wavePose(g, GREET_MS)));
          if (g >= GREET_MS + WAVE_STEP_MS) {
            reunion = 'off';
            reunionAt = nextReunion(now);
            agents.forEach((a, k) => {
              Object.assign(a, { pose: null, mode: 'idle' });
              rest(k, now);
            });
          }
        } else {
          agents.forEach((a, k) => {
            const goal = goals[k];
            if (now < goal.until) {
              a.mode = 'idle';
              return;
            }
            if (walkTo(a, goal.x, speed, dt)) {
              rest(k, now); // llegó: se detiene un momento
              a.mode = 'idle';
            }
          });
        }
        drawAgents();
        if (visible) idleRaf = requestAnimationFrame(patrol);
      };
      idleRaf = requestAnimationFrame(patrol);

      const place = () => {
        const old = rect.width;
        const r = target.getBoundingClientRect();
        const pr2 = parent.getBoundingClientRect();
        rect = r;
        crew.style.left = `${r.left - pr2.left - parent.clientLeft - pad}px`;
        crew.style.top = `${r.top - pr2.top - parent.clientTop - pad}px`;
        crew.style.width = `${r.width + pad * 2}px`;
        crew.style.height = `${r.height + pad * 2}px`;
        crew.width = Math.ceil((r.width + pad * 2) * dpr);
        crew.height = Math.ceil((r.height + pad * 2) * dpr);
        cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // Conservan su posición relativa y vuelven a su mitad.
        agents.forEach((a, k) => {
          const [lo, hi] = range(k);
          a.x = Math.min(hi, Math.max(lo, (a.x / old) * r.width));
          goals[k].x = Math.min(hi, Math.max(lo, (goals[k].x / old) * r.width));
        });
        drawAgents();
      };
      const recolor = () => {
        rig = makeRig(props.agentSize, fg(), dpr);
        drawAgents();
      };
      const seen = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        cancelAnimationFrame(idleRaf);
        if (visible) {
          const now = performance.now();
          // Al volver a la pantalla no se recupera un reencuentro "atrasado" de golpe.
          if (reunion === 'off') reunionAt = Math.max(reunionAt, now + 2000);
          last = now;
          idleRaf = requestAnimationFrame(patrol);
        }
      });
      seen.observe(target);
      window.removeEventListener('resize', reveal);
      window.addEventListener('resize', place);
      const themeObserver = new MutationObserver(recolor);
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      stopIdle = () => {
        cancelAnimationFrame(idleRaf);
        seen.disconnect();
        window.removeEventListener('resize', place);
        themeObserver.disconnect();
      };
    };

    const frame = (now: number) => {
      const t = now - t0;
      const dt = Math.min(1 / 30, (now - prev) / 1000);
      prev = now;
      moveAgents(t, now, dt);
      drawAgents();
      if (!revealed) drawStrips(t);
      if (t >= end) revealImage();
      if (props.finale === 'greet') {
        if (agents.every((a) => a.mode === 'idle')) return stayOnImage();
        if (t > end + 10000) return stayOnImage(); // por si algo se atasca
      } else {
        const away = agents.every((a) => a.y < -pad - ah);
        if ((revealed && away) || t > end + 4000) return reveal();
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  };

  // Empieza cuando al menos un 30 % del elemento es visible.
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      setTimeout(build, props.delay);
    },
    { threshold: 0.3 },
  );
  io.observe(target);
  // Si cambia el tamaño a mitad del armado, mostrar la imagen final.
  window.addEventListener('resize', reveal, { once: true });

  stop = () => {
    io.disconnect();
    window.removeEventListener('resize', reveal);
    stopIdle?.();
    cancelAnimationFrame(raf);
    target.style.opacity = '1';
  };
});

onBeforeUnmount(() => stop?.());
</script>

<style scoped>
.ascii-build { display: contents; }
.ascii-build > :slotted(:first-child) { opacity: 0; }
.ascii-build-canvas {
  position: absolute;
  pointer-events: none;
}
</style>
