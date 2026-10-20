<template>
  <svg
    :viewBox="`0 0 ${LOGO_W} ${LOGO_H}`"
    :width="width"
    :height="Math.round(width * LOGO_H / LOGO_W)"
    fill="currentColor"
    shape-rendering="crispEdges"
    aria-label="Joan Rojas"
    role="img"
    class="logo"
  >
    <defs>
      <!-- El brazo izquierdo va aparte: en reposo es el del trazo original; al saludar
           se cambia por las poses de abajo (ver SiteHeader) -->
      <clipPath :id="`${uid}-body`"><path :d="`M0 0H${LOGO_W}V${LOGO_H}H0Z M${ARM.join(' ')}`" clip-rule="evenodd" /></clipPath>
      <clipPath :id="`${uid}-arm`"><rect :x="ARM_BOX[0]" :y="ARM_BOX[1]" :width="ARM_BOX[2]" :height="ARM_BOX[3]" /></clipPath>
    </defs>
    <path :d="LOGO_PATH" :clip-path="`url(#${uid}-body)`" />
    <g class="arm-rest"><path :d="LOGO_PATH" :clip-path="`url(#${uid}-arm)`" /></g>
    <!-- Poses del saludo, dibujadas en bloques del tamaño de un pixel del logo.
         Ocultas por atributo (opacity="0"); SiteHeader las muestra por fotogramas. -->
    <g v-for="(rects, name) in ARM_POSES" :key="name" :class="['pose', `pose-${name}`]" opacity="0">
      <rect v-for="(r, i) in rects" :key="i" :x="r[0]" :y="r[1]" :width="r[2]" :height="r[3]" />
    </g>
    <!-- Párpados: bajan sobre los huecos de los ojos al parpadear. Se anima la
         altura (no un transform de CSS) para que conserven los bordes nítidos del
         pixel art. Con altura 0 son invisibles, también cuando AsciiBuild
         serializa el SVG para muestrearlo. -->
    <rect v-for="x in EYES_X" :key="x" :x="x" :y="EYE_Y" :width="EYE_W" :height="EYE_H * lid" />
  </svg>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId } from 'vue';
import { ARM_POSES, LOGO_H, LOGO_PATH, LOGO_W } from '../lib/logo';

withDefaults(defineProps<{ width?: number }>(), { width: 40 });

// Brazo izquierdo (bloque que sobresale a la izquierda), en unidades del viewBox.
const ARM_BOX = [0, 331, 80, 99] as const;
const ARM = [`${ARM_BOX[0]} ${ARM_BOX[1]}`, `H${ARM_BOX[2]}`, `V${ARM_BOX[1] + ARM_BOX[3]}`, `H${ARM_BOX[0]}Z`];
const uid = useId();

// Huecos de los ojos en el trazo del logo (x 225–267 y 477–519, y 244–358, en
// unidades del viewBox), con 3 unidades de margen para que el párpado se monte
// sobre la cabeza y no quede una rayita en la unión.
const EYES_X = [222, 474];
const EYE_Y = 241;
const EYE_W = 48;
const EYE_H = 120;

// Parpadeo con ritmo humano: cada 2,5–7 s al azar, cierra rápido, se queda
// cerrado un instante y abre más lento; a veces hace un doble parpadeo.
// No parpadea con "reducir movimiento".
const BLINK_EVERY_MS = [2500, 7000] as const;
const CLOSE_MS = 110;
const HOLD_MS = 70;
const OPEN_MS = 180;
const DOUBLE_CHANCE = 0.2;

const lid = ref(0); // 0 = abierto, 1 = cerrado
let timer = 0;
let raf = 0;

const tween = (from: number, to: number, ms: number, done: () => void) => {
  const start = performance.now();
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / ms);
    const eased = to > from ? p * p : 1 - (1 - p) * (1 - p); // cierra acelerando, abre frenando
    lid.value = from + (to - from) * eased;
    if (p < 1) raf = requestAnimationFrame(step);
    else done();
  };
  raf = requestAnimationFrame(step);
};

const blink = (then: () => void) =>
  tween(0, 1, CLOSE_MS, () => {
    timer = window.setTimeout(() => tween(1, 0, OPEN_MS, then), HOLD_MS);
  });

const schedule = () => {
  const wait = BLINK_EVERY_MS[0] + Math.random() * (BLINK_EVERY_MS[1] - BLINK_EVERY_MS[0]);
  timer = window.setTimeout(() => {
    blink(() => (Math.random() < DOUBLE_CHANCE ? blink(schedule) : schedule()));
  }, wait);
};

onMounted(() => {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) schedule();
});
onBeforeUnmount(() => {
  clearTimeout(timer);
  cancelAnimationFrame(raf);
});
</script>
