<template>
  <div class="np-wrap">
    <div class="now-playing" :class="{ playing }">
      <button
        type="button"
        class="disc"
        data-sound="none"
        :aria-label="playing ? t.pause : hasAudio ? t.playPreview : t.play"
        :aria-pressed="playing"
        :disabled="!track"
        @click="toggle"
      >
        <span class="record">
          <img v-if="cover" :src="cover" alt="" class="cover" width="40" height="40" decoding="async" @error="broken = true" />
          <span v-else class="cover fallback"></span>
          <span class="grooves"></span>
          <span class="spindle"></span>
        </span>
        <span v-if="track" class="state" aria-hidden="true">
          <svg v-if="playing" viewBox="0 0 10 10"><rect x="2" y="1.5" width="2" height="7" /><rect x="6" y="1.5" width="2" height="7" /></svg>
          <svg v-else viewBox="0 0 10 10"><path d="M3 1.5 8.5 5 3 8.5Z" /></svg>
        </span>
      </button>
      <div class="np-text">
        <span class="mono np-label">{{ track?.nowPlaying ? t.nowPlaying : t.listening }}</span>
        <a v-if="track" class="serif np-title" :href="track.url" target="_blank" rel="noopener noreferrer" :title="`${track.name} — ${track.artist}`">
          {{ track.name }}<span v-if="track.artist" class="np-by"> — {{ track.artist }}</span>
        </a>
        <span v-else class="serif np-title">{{ t.lastfmOff }}</span>
      </div>
      <div class="eq" aria-hidden="true"><span></span><span></span><span></span></div>
      <audio v-if="track?.preview" ref="audio" :src="track.preview" preload="none" @ended="onEnded" @error="audioFailed = true"></audio>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import type { RecentTrack } from '../lib/lastfm';
import { t } from '../lib/site';

// Pastilla "Últimamente escuchando" con la última canción de Last.fm. Los datos
// llegan ya resueltos desde el frontmatter de Astro (la API key no pasa por aquí).
// Si iTunes tiene preview, el disco lo reproduce (30 s); si no, play/pausa solo anima.
const VOLUME = 0.35; // el sonido no debe sorprender a nadie
const FADE_IN_MS = 600;
const FADE_OUT_MS = 250;

const props = defineProps<{ track?: RecentTrack | null }>();

const audio = ref<HTMLAudioElement | null>(null);
const audioFailed = ref(false);
const hasAudio = computed(() => !!props.track?.preview && !audioFailed.value);
// Con audio empieza en pausa: solo suena si el visitante hace clic.
const playing = ref(!!props.track && !props.track.preview);
const broken = ref(false); // la carátula no cargó → disco de respaldo
const cover = computed(() => (broken.value ? null : props.track?.image ?? null));

let fadeTimer = 0;
const fade = (el: HTMLAudioElement, to: number, ms: number, done?: () => void) => {
  clearInterval(fadeTimer);
  const from = el.volume;
  const start = performance.now();
  fadeTimer = window.setInterval(() => {
    const p = Math.min(1, (performance.now() - start) / ms);
    el.volume = from + (to - from) * p; // en iOS el volumen es fijo: el fundido no aplica
    if (p < 1) return;
    clearInterval(fadeTimer);
    done?.();
  }, 16);
};

const toggle = () => {
  const el = audio.value;
  if (!hasAudio.value || !el) {
    playing.value = !playing.value;
    return;
  }
  if (playing.value) {
    playing.value = false;
    fade(el, 0, FADE_OUT_MS, () => el.pause());
    return;
  }
  playing.value = true;
  clearInterval(fadeTimer);
  el.volume = 0;
  el.play()
    .then(() => fade(el, VOLUME, FADE_IN_MS))
    // Si el navegador no puede reproducirlo, el disco sigue funcionando sin sonido.
    .catch(() => (audioFailed.value = true));
};

const onEnded = () => {
  playing.value = false;
  if (audio.value) audio.value.currentTime = 0;
};

onBeforeUnmount(() => {
  clearInterval(fadeTimer);
  audio.value?.pause();
});
</script>

<style scoped>
.np-wrap { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; min-width: 0; }
.now-playing {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 16px 10px 10px;
  border: 1px solid var(--rule);
  border-radius: 999px;
  background: var(--card);
  max-width: 100%;
}

/* Disco: botón de play/pausa */
.disc {
  position: relative;
  flex: none;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  color: inherit;
  cursor: pointer;
}
.disc:disabled { cursor: default; }
.disc:focus-visible { outline: 2px solid var(--fg); outline-offset: 3px; }
.record {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  overflow: hidden;
  /* Gira siempre, pero pausado; play/pausa solo cambia el estado para no reiniciar la vuelta. */
  animation: jrspin 8s linear infinite;
  animation-play-state: paused;
}
.playing .record { animation-play-state: running; }
.cover { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.fallback { background: repeating-radial-gradient(circle, #1a1a19 0 2px, #2a2a28 2px 3px); }
/* Surcos sutiles sobre la carátula para que se lea como vinilo */
.grooves {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background:
    radial-gradient(circle, transparent 0 30%, rgba(0, 0, 0, .25) 31%, transparent 33%),
    repeating-radial-gradient(circle, rgba(0, 0, 0, .14) 0 1px, transparent 1px 4px);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .25);
}
.spindle {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 8px;
  height: 8px;
  margin: -4px 0 0 -4px;
  border-radius: 50%;
  background: var(--bg);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, .35);
}
/* Indicador de estado en la esquina del disco */
.state {
  position: absolute;
  right: -3px;
  bottom: -3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--fg);
  color: var(--bg);
  display: grid;
  place-items: center;
  box-shadow: 0 0 0 2px var(--card);
  transition: transform .2s ease;
}
.state svg { width: 9px; height: 9px; fill: currentColor; }
.disc:hover .state { transform: scale(1.12); }

.np-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.np-label { font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
.np-title {
  font-size: 21px;
  line-height: 1;
  display: block;
  max-width: 15em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.np-by { color: var(--muted); font-style: italic; }

.eq { flex: none; display: flex; gap: 2px; align-items: flex-end; height: 16px; margin-left: 6px; }
.eq span {
  width: 3px;
  height: 16px;
  background: var(--fg);
  transform: scaleY(.3);
  transform-origin: bottom;
  animation: jreq .9s ease-in-out infinite;
  animation-play-state: paused;
}
.playing .eq span { animation-play-state: running; }
.eq span:nth-child(2) { animation-delay: .2s; }
.eq span:nth-child(3) { animation-delay: .4s; }


@media (max-width: 480px) {
  .np-title { max-width: 52vw; font-size: 19px; }
}
@media (prefers-reduced-motion: reduce) {
  .record, .eq span { animation: none; }
}
</style>
