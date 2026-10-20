<template>
  <!-- ambient: bucle mudo que se reproduce solo mientras está en pantalla.
       player: con controles, el visitante decide cuándo verlo. Ninguno descarga
       el video hasta que hace falta (preload="none"). -->
  <div class="lazy-video">
    <video
      ref="el"
      :src="src"
      :poster="poster"
      :aria-label="label"
      preload="none"
      playsinline
      muted
      :loop="mode === 'ambient'"
      :controls="mode === 'player'"
      :disablepictureinpicture="mode === 'ambient'"
    ></video>
    <!-- Un bucle de más de 5 s necesita una forma de detenerlo (WCAG 2.2.2). -->
    <button v-if="pausable && mode === 'ambient'" class="toggle mono" type="button" data-sound="toggle" @click="toggle">
      {{ paused ? playLabel : pauseLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    src: string;
    poster: string;
    label: string;
    mode?: 'ambient' | 'player';
    pausable?: boolean;
    playLabel?: string;
    pauseLabel?: string;
  }>(),
  { mode: 'ambient', pausable: false, playLabel: '▶', pauseLabel: '❚❚' },
);

const el = ref<HTMLVideoElement | null>(null);
const paused = ref(false); // pausado por el visitante (o por "reducir movimiento")
let visible = false;
let io: IntersectionObserver | undefined;

const sync = () => {
  const v = el.value;
  if (!v || props.mode !== 'ambient') return;
  if (visible && !paused.value) v.play().catch(() => {});
  else v.pause();
};

const toggle = () => {
  paused.value = !paused.value;
  sync();
};

onMounted(() => {
  if (props.mode !== 'ambient') return;
  // Con "reducir movimiento" queda el póster; el visitante puede darle play.
  paused.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    sync();
  }, { threshold: 0.35 });
  if (el.value) io.observe(el.value);
});

// Al cambiar de video (p. ej. el tema claro/oscuro del teaser) se retoma si estaba en pantalla.
watch(() => props.src, () => nextTick(sync));

onBeforeUnmount(() => io?.disconnect());
</script>

<style scoped>
.lazy-video { position: relative; width: 100%; height: 100%; }
video { display: block; width: 100%; height: 100%; object-fit: cover; background: var(--card); }
.toggle {
  position: absolute;
  right: 12px;
  bottom: 12px;
  padding: 6px 12px;
  border: 1px solid var(--rule);
  border-radius: 999px;
  background: var(--bg);
  color: var(--fg);
  font-size: 11px;
  letter-spacing: .08em;
  cursor: pointer;
  opacity: .85;
  transition: opacity .2s;
}
.toggle:hover,
.toggle:focus-visible { opacity: 1; }
</style>
