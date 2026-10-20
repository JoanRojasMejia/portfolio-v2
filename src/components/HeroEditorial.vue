<template>
  <section class="hero" data-screen-label="Hero editorial">
    <div class="copy">
      <div class="kicker mono">
        <span class="diamond"></span>
        <span><ScrambleText :text="greeting" /> — {{ t.sheet }} 01 · {{ t.identity }}</span>
      </div>
      <h1 class="serif">
        <span>Joan</span>
        <span class="indent">Rojas</span>
      </h1>
      <p class="intro">
        {{ intro.lead }}<a class="company" :href="GLOBAL66" target="_blank" rel="noopener noreferrer"><img src="/assets/global66-iso.svg" alt="" width="16" height="16" />Global66</a>{{ intro.middle
        }}<a :href="LINKEDIN" target="_blank" rel="noopener noreferrer">{{ intro.link }}<span class="arrow" aria-hidden="true">↗</span></a>{{ intro.after }}
      </p>
      <div class="status">
        <NowPlaying :track="track" />
      </div>
    </div>
    <div class="figure">
      <!-- Temporal: antes era /assets/tat-hannya.jpg (alt "Hannya"), con las etiquetas "FIG. 1 — HANNYA" y t.back. -->
      <AsciiBuild :delay="250" :agent-size="28"><img src="/assets/hero-mirror.jpg" alt="Joan Rojas frente al espejo" /></AsciiBuild>
      <div class="tag tag-left mono">
        <span>{{ t.fig1 }}</span><span class="tick"></span>
      </div>
      <div class="tag tag-right mono">{{ t.elevation }}<br />{{ t.scale }}</div>
    </div>
    <!-- Filtro de "tinta" para el resaltado de Global66: bordes irregulares y vetas de marcador. -->
    <svg class="defs" width="0" height="0" aria-hidden="true" focusable="false">
      <filter id="marker-ink" x="-10%" y="-40%" width="120%" height="180%">
        <feTurbulence type="fractalNoise" baseFrequency="0.05 0.3" numOctaves="2" seed="4" result="edges" />
        <feDisplacementMap in="SourceGraphic" in2="edges" scale="7" xChannelSelector="R" yChannelSelector="G" result="rough" />
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.28" numOctaves="1" seed="11" result="streaks" />
        <feColorMatrix in="streaks" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.35 0 0 0 1.1" result="ink" />
        <feComposite in="rough" in2="ink" operator="in" />
      </filter>
    </svg>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AsciiBuild from './AsciiBuild.vue';
import ScrambleText from './ScrambleText.vue';
import NowPlaying from './NowPlaying.vue';
import type { RecentTrack } from '../lib/lastfm';
import { GLOBAL66, HERO_INTRO, LINKEDIN } from '../lib/hero-copy';
import { greeting, lang, t } from '../lib/site';

defineProps<{ track?: RecentTrack | null }>();

const intro = computed(() => HERO_INTRO[lang.value]);
</script>

<style scoped>
.hero {
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(40px, 7vw, 96px) var(--gutter) 40px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 380px), 1fr));
  gap: 40px;
  align-items: center;
  border-left: 1px solid var(--frame-edge, var(--rule));
  border-right: 1px solid var(--frame-edge, var(--rule));
}
.copy { display: flex; flex-direction: column; gap: 28px; }
.kicker {
  font-size: 12px;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--muted);
  display: flex;
  gap: 10px;
  align-items: center;
}
h1 {
  margin: 0;
  font-size: clamp(84px, 13vw, 176px);
  line-height: .86;
  letter-spacing: -.02em;
}
h1 span { display: block; }
h1 .indent { padding-left: .6em; }
.intro {
  margin: 0;
  max-width: 30em;
  font-size: 19px;
  line-height: 1.5;
  color: var(--muted);
  text-wrap: pretty;
}
/* "Abierto a oportunidades": enlace a LinkedIn dentro del párrafo */
.intro a {
  color: var(--fg);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
  white-space: nowrap;
}
.intro a:hover { color: var(--fg); text-decoration-thickness: 2px; }
.intro .arrow { display: inline-block; margin-left: 2px; font-size: .8em; transition: transform .25s; }
.intro a:hover .arrow { transform: translate(2px, -2px); }
/* Empresa resaltada con marcador, en el azul de Global66 (#2746C7). El trazo
   está detrás del texto, un poco inclinado y pasado por el filtro #marker-ink
   (bordes irregulares y tinta desigual). Entra de izquierda a derecha al cargar. */
.company {
  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  gap: .3em;
  margin: 0 .1em;
  padding: .02em .4em .02em .3em;
  color: var(--fg);
  white-space: nowrap;
}
.company::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset: .12em -.2em .04em -.25em;
  background: var(--g66-mark);
  border-radius: 3px 9px 4px 11px / 9px 4px 10px 3px;
  transform: rotate(-1.4deg) skewX(-8deg);
  filter: url(#marker-ink);
  animation: jrmark .7s cubic-bezier(.3, .7, .2, 1) .6s both;
}
.company img { width: 1em; height: 1em; display: block; flex: none; }
/* Es un enlace, pero sin el subrayado de los demás enlaces del párrafo. */
.intro a.company { text-decoration: none; white-space: nowrap; }
.company::before { transition: transform .25s ease; }
.company:hover::before { transform: rotate(-1.4deg) skewX(-8deg) scale(1.05, 1.12); }
.company:focus-visible { outline: 2px solid var(--fg); outline-offset: 3px; border-radius: 4px; }
.defs { position: absolute; width: 0; height: 0; overflow: hidden; }
@keyframes jrmark {
  from { clip-path: inset(-20% 100% -20% 0); }
  to { clip-path: inset(-20% -5% -20% 0); }
}
.status { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }

.figure { position: relative; display: flex; justify-content: center; }
.figure img {
  width: 100%;
  max-width: 460px;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  object-position: center 30%;
  filter: grayscale(1) contrast(1.45) brightness(1.05);
  mix-blend-mode: var(--blend);
  -webkit-mask-image: linear-gradient(to bottom, #000 70%, transparent);
  mask-image: linear-gradient(to bottom, #000 70%, transparent);
}
.tag {
  position: absolute;
  background: var(--bg);
  padding: 4px 8px;
  font-size: 11px;
  color: var(--muted);
  letter-spacing: .06em;
}
.tag-left { left: 0; top: 18%; display: flex; align-items: center; gap: 8px; }
.tick { width: 48px; height: 1px; background: var(--muted); display: block; }
.tag-right { right: 8px; bottom: 22%; text-align: right; }
</style>
