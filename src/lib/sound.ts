import { ref } from 'vue';
import { ls } from './site';

// Sonidos de interfaz sintetizados con Web Audio: no hay archivos de audio.
// Cada sonido es una lista de "voces" (un oscilador con envolvente), inspirado
// en la técnica de lokiii.me pero con afinación y timbres propios (escala de
// re mayor, ondas triangulares). Activado por defecto; el visitante puede
// apagarlo desde el header y la preferencia se recuerda.
//
// LIBRARY tiene todos los sonidos disponibles y ROLES dice cuál suena en cada
// interacción. Para elegir, abre /sonidos con `pnpm dev`.

interface Voice {
  wave: OscillatorType;
  freq: number | [number, number]; // fija o deslizamiento [inicio, fin]
  delay?: number; // s
  attack?: number; // s
  decay: number; // s hasta el silencio
  gain: number;
  fm?: { ratio: number; depth: number }; // modulación de frecuencia (timbre de campana)
}

export interface SoundDef {
  label: string;
  hint: string;
  voices: Voice[];
}

export const LIBRARY = {
  // Cortos y sutiles: pensados para hover.
  tick: { label: 'Tick', hint: 'Tic corto que cae de tono, casi táctil', voices: [{ wave: 'triangle', freq: [2400, 1700], decay: 0.03, gain: 0.05 }] },
  blip: { label: 'Blip', hint: 'Punto agudo y limpio', voices: [{ wave: 'sine', freq: 1975, decay: 0.025, gain: 0.05 }] },
  breath: { label: 'Aire', hint: 'Grave y apagado, apenas se nota', voices: [{ wave: 'sine', freq: [1180, 990], attack: 0.006, decay: 0.05, gain: 0.05 }] },
  glint: { label: 'Destello', hint: 'Brillo metálico muy breve', voices: [{ wave: 'sine', freq: 2960, decay: 0.04, gain: 0.035, fm: { ratio: 1.41, depth: 300 } }] },
  // Clics.
  tap: { label: 'Tap', hint: 'Dos notas ascendentes (fa# → la)', voices: [
    { wave: 'triangle', freq: [740, 760], decay: 0.09, gain: 0.12 },
    { wave: 'sine', freq: 880, delay: 0.05, decay: 0.12, gain: 0.07 },
  ] },
  pop: { label: 'Pop', hint: 'Burbuja que sube rápido', voices: [{ wave: 'sine', freq: [320, 720], decay: 0.07, gain: 0.14 }] },
  wood: { label: 'Madera', hint: 'Golpe seco, como un bloque de madera', voices: [
    { wave: 'triangle', freq: [520, 430], decay: 0.045, gain: 0.16 },
    { wave: 'sine', freq: 1040, decay: 0.02, gain: 0.05 },
  ] },
  chirp: { label: 'Chirp', hint: 'Silbido corto ascendente', voices: [{ wave: 'triangle', freq: [990, 1480], decay: 0.08, gain: 0.08 }] },
  // Cambios de estado (tema, idioma).
  toggle: { label: 'Tercera', hint: 'Re → fa#, suave', voices: [
    { wave: 'sine', freq: 587, decay: 0.16, gain: 0.1 },
    { wave: 'triangle', freq: 740, delay: 0.06, decay: 0.2, gain: 0.08 },
  ] },
  flip: { label: 'Flip', hint: 'Dos notas que bajan, como un interruptor', voices: [
    { wave: 'triangle', freq: 988, decay: 0.06, gain: 0.09 },
    { wave: 'triangle', freq: 740, delay: 0.05, decay: 0.09, gain: 0.09 },
  ] },
  swell: { label: 'Ola', hint: 'Sube despacio y se va', voices: [{ wave: 'sine', freq: [440, 660], attack: 0.04, decay: 0.22, gain: 0.09 }] },
  // Confirmaciones.
  success: { label: 'Arpegio', hint: 'Re–fa#–la con un poco de campana', voices: [
    { wave: 'sine', freq: 587, decay: 0.35, gain: 0.1, fm: { ratio: 2, depth: 60 } },
    { wave: 'sine', freq: 740, delay: 0.08, decay: 0.35, gain: 0.09, fm: { ratio: 2, depth: 50 } },
    { wave: 'sine', freq: 880, delay: 0.16, decay: 0.5, gain: 0.09, fm: { ratio: 2, depth: 40 } },
  ] },
  chime: { label: 'Campana', hint: 'Una sola nota de campana que resuena', voices: [{ wave: 'sine', freq: 1175, decay: 0.7, gain: 0.08, fm: { ratio: 3.5, depth: 220 } }] },
} satisfies Record<string, SoundDef>;

export type SoundId = keyof typeof LIBRARY;
export type SoundRole = 'hover' | 'tap' | 'toggle' | 'success';

// Qué sonido va en cada interacción (esto es lo que se publica).
export const ROLES: Record<SoundRole, SoundId> = {
  hover: 'tick',
  tap: 'tap',
  toggle: 'toggle',
  success: 'success',
};

const STORAGE_KEY = 'jr_sound';
// Solo en desarrollo: la página /sonidos guarda aquí una asignación de prueba.
export const ROLES_DEV_KEY = 'jr_sound_roles';
const INTERACTIVE = 'a, button, [role="button"], summary, input, select, label';

export const soundOn = ref(true);

export function currentRoles(): Record<SoundRole, SoundId> {
  if (!import.meta.env.DEV) return ROLES;
  try {
    const saved = JSON.parse(ls(ROLES_DEV_KEY) ?? 'null') as Partial<Record<SoundRole, string>> | null;
    const valid = Object.fromEntries(Object.entries(saved ?? {}).filter(([, id]) => id && id in LIBRARY));
    return { ...ROLES, ...valid } as Record<SoundRole, SoundId>;
  } catch {
    return ROLES;
  }
}

let ctx: AudioContext | null = null;
let out: GainNode | null = null;

const audio = () => {
  if (!ctx) {
    ctx = new AudioContext();
    // Compresor suave: evita picos si se juntan varios sonidos.
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    out = ctx.createGain();
    out.gain.value = 0.9;
    out.connect(comp).connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return { ctx, out: out! };
};

const voice = (c: AudioContext, dest: AudioNode, v: Voice, at: number) => {
  const t = at + (v.delay ?? 0);
  const attack = v.attack ?? 0.002;
  const osc = c.createOscillator();
  osc.type = v.wave;
  if (Array.isArray(v.freq)) {
    osc.frequency.setValueAtTime(v.freq[0], t);
    osc.frequency.exponentialRampToValueAtTime(v.freq[1], t + v.decay);
  } else {
    osc.frequency.setValueAtTime(v.freq, t);
  }
  const env = c.createGain();
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(v.gain, t + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, t + attack + v.decay);
  osc.connect(env).connect(dest);

  if (v.fm) {
    const base = Array.isArray(v.freq) ? v.freq[0] : v.freq;
    const mod = c.createOscillator();
    mod.frequency.value = base * v.fm.ratio;
    const depth = c.createGain();
    depth.gain.setValueAtTime(v.fm.depth, t);
    depth.gain.exponentialRampToValueAtTime(1, t + v.decay); // el brillo se apaga antes que la nota
    mod.connect(depth).connect(osc.frequency);
    mod.start(t);
    mod.stop(t + attack + v.decay + 0.05);
  }
  osc.start(t);
  osc.stop(t + attack + v.decay + 0.05);
};

// Reproduce un sonido de la biblioteca, esté o no activado el sonido (para /sonidos).
export function preview(id: SoundId) {
  try {
    const { ctx: c, out: dest } = audio();
    for (const v of LIBRARY[id].voices as Voice[]) voice(c, dest, v, c.currentTime + 0.005);
  } catch {
    // Sin Web Audio (o bloqueado): la interfaz sigue igual, sin sonido.
  }
}

// Reproduce el sonido asignado a una interacción, si el visitante activó el sonido.
export function play(role: SoundRole) {
  if (!soundOn.value) return;
  // El navegador no deja sonar audio antes de la primera interacción (clic o tecla;
  // pasar el mouse no cuenta). Antes de eso no se intenta, para no llenar la consola de avisos.
  const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
  if (activation && !activation.hasBeenActive) return;
  preview(currentRoles()[role]);
}

export function setSound(on: boolean) {
  soundOn.value = on;
  ls(STORAGE_KEY, on ? 'on' : 'off');
  if (on) play('success');
}

// Escucha hover y clics en elementos interactivos de toda la página.
// `data-sound="toggle"` elige otro rol para ese elemento; `data-sound="none"` lo silencia.
export function startSound() {
  soundOn.value = ls(STORAGE_KEY) !== 'off'; // solo se apaga si el visitante lo apagó
  let hovered: Element | null = null;

  const roleOf = (el: Element) => (el.closest('[data-sound]')?.getAttribute('data-sound') ?? 'tap') as SoundRole | 'none';

  const onClick = (e: MouseEvent) => {
    const el = (e.target as Element | null)?.closest?.(INTERACTIVE);
    if (!el) return;
    const role = roleOf(el);
    if (role !== 'none') play(role);
  };
  const onOver = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return; // en táctil el "hover" llega junto al toque
    const el = (e.target as Element | null)?.closest?.(INTERACTIVE) ?? null;
    if (el && el !== hovered && roleOf(el) !== 'none') play('hover');
    hovered = el;
  };

  document.addEventListener('click', onClick, true);
  document.addEventListener('pointerover', onOver, true);
  return () => {
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('pointerover', onOver, true);
  };
}
