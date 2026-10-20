<template>
  <section id="playground" class="sheet" data-screen-label="Playground">
    <SheetLabel no="03" label="PLAYGROUND" />
    <p class="lead-serif line">{{ t.funLine }}</p>
    <div class="carousel" @scroll="onScroll">
      <article v-for="(x, i) in items" :key="x.id" class="exp">
        <!-- Cada experimento corre aquí mismo; solo el de tokens es un clip -->
        <div class="stage" :class="`is-${x.id}`">
          <button v-if="x.id === 'heart'" type="button" class="heart-pad mono" data-sound="none" @click="heart">
            <span aria-hidden="true">♡</span> {{ t.clickHere }}
          </button>

          <template v-else-if="x.id === 'build'">
            <div class="build">
              <AsciiBuild :key="runs" :cell="5" :agent-size="16" finale="leave">
                <img src="/assets/motos.jpg" :alt="x.title" />
              </AsciiBuild>
            </div>
            <button type="button" class="replay mono" data-sound="tap" @click="runs++">↻ {{ t.replay }}</button>
          </template>

          <span v-else-if="x.id === 'wave'" class="wave jr-waves" tabindex="0" :aria-label="x.title">
            <Logo :width="132" />
          </span>

          <span v-else-if="x.id === 'ink'" class="ink-line serif" @mouseenter="inkRuns++">
            <span :key="inkRuns" class="ink">{{ t.inkSample }}</span>
          </span>

          <div v-else-if="x.id === 'sound'" class="pads">
            <button v-for="r in soundRoles" :key="r.role" type="button" class="pad mono" data-sound="none" @click="preview(ROLES[r.role])">
              {{ r.label }}
            </button>
          </div>

          <LazyVideo v-else-if="x.id === 'tokens'" src="/assets/play/tokens.mp4" poster="/assets/play/tokens.webp" :label="x.title" />
        </div>

        <div class="caption mono">
          <span>Exp. {{ String(i + 1).padStart(2, '0') }}</span>
          <span class="tag">{{ x.tag }}<template v-if="x.kind === 'clip'"> · {{ t.clip }}</template></span>
        </div>
        <h3 class="serif title">{{ x.title }}</h3>
        <p class="hint">{{ x.hint }}</p>
      </article>
    </div>
    <div class="progress"><div class="bar" :style="{ width: pct + '%' }"></div></div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import SheetLabel from './SheetLabel.vue';
import AsciiBuild from './AsciiBuild.vue';
import Logo from './Logo.vue';
import LazyVideo from './LazyVideo.vue';
import { EXPERIMENTS } from '../lib/data';
import { L } from '../lib/i18n';
import { lang, t } from '../lib/site';
import { preview, ROLES, type SoundRole } from '../lib/sound';

const items = computed(() => EXPERIMENTS.map((x) => ({ ...x, title: L(x.title, lang.value), hint: L(x.hint, lang.value) })));

// Onda de corazón: el mismo evento que lanzan las mascotas al saludar (AsciiBackground).
// Con teclado no hay coordenadas de clic: sale del centro del botón.
const heart = (e: MouseEvent) => {
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const x = e.detail ? e.clientX : r.left + r.width / 2;
  const y = e.detail ? e.clientY : r.top + r.height / 2;
  window.dispatchEvent(new CustomEvent('jr:wave', { detail: { x, y, heart: true } }));
};

const runs = ref(0); // cambiar la key vuelve a armar la imagen
const inkRuns = ref(0); // cambiar la key reinicia la animación de la tinta

const soundRoles = computed<{ role: SoundRole; label: string }[]>(() => [
  { role: 'hover', label: t.value.sHover },
  { role: 'tap', label: t.value.sTap },
  { role: 'toggle', label: t.value.sToggle },
  { role: 'success', label: t.value.sSuccess },
]);

const pct = ref(0);
function onScroll(e: Event) {
  const el = e.currentTarget as HTMLElement;
  const max = el.scrollWidth - el.clientWidth;
  pct.value = Math.round((max > 0 ? el.scrollLeft / max : 1) * 100);
}
</script>

<style scoped>
.line { margin-bottom: 28px; max-width: 22em; }
.carousel {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 8px;
  scrollbar-width: none;
}
.carousel::-webkit-scrollbar { display: none; }
.exp {
  flex: none;
  width: clamp(270px, 32vw, 380px);
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.stage {
  position: relative;
  aspect-ratio: 4 / 3;
  border: 1px solid var(--rule);
  border-radius: 6px;
  overflow: hidden;
  background: var(--card);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}
.caption { display: flex; justify-content: space-between; font-size: 12px; }
.tag { color: var(--muted); }
.title { margin: 0; font-size: 26px; line-height: 1.1; font-weight: 400; }
.hint { margin: 0; font-size: 15px; line-height: 1.45; color: var(--muted); }
.progress { height: 2px; background: var(--rule); margin-top: 18px; position: relative; }
.bar { position: absolute; left: 0; top: 0; bottom: 0; background: var(--fg); transition: width .15s; }

/* 01 · el recuadro es transparente para ver la onda del fondo */
.stage.is-heart { background: transparent; border-style: dashed; }
.heart-pad {
  position: absolute;
  inset: 0;
  border: 0;
  background: transparent;
  color: var(--muted);
  font-size: 12px;
  letter-spacing: .08em;
  cursor: pointer;
}
.heart-pad span { font-size: 18px; margin-right: 4px; vertical-align: -2px; }
.heart-pad:hover { color: var(--fg); }

/* 02 · margen alrededor de la foto para que las mascotas tengan dónde volar */
.build { position: relative; width: 78%; }
.build img { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 2px; }

/* 03 */
.wave { color: var(--fg); cursor: pointer; padding: 24px; border-radius: 8px; }
.wave :deep(svg) { display: block; overflow: visible; }
.wave:focus-visible { outline: 2px solid var(--fg); outline-offset: 2px; }

/* 04 · mismo trazo que el "Global66" del hero (#marker-ink está en HeroEditorial) */
.ink-line { font-size: clamp(30px, 3vw, 40px); padding: 0 24px; cursor: default; white-space: nowrap; }
.ink { position: relative; isolation: isolate; padding: 0 .2em; }
.ink::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset: .12em -.2em .04em -.25em;
  background: var(--g66-mark);
  border-radius: 3px 9px 4px 11px / 9px 4px 10px 3px;
  transform: rotate(-1.4deg) skewX(-8deg);
  filter: url(#marker-ink);
  animation: ink-in .7s cubic-bezier(.3, .7, .2, 1) .15s both;
}
@keyframes ink-in {
  from { clip-path: inset(-20% 100% -20% 0); }
  to { clip-path: inset(-20% -5% -20% 0); }
}

/* 05 */
.pads { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; width: 78%; }
.pad {
  padding: 14px 10px;
  border: 1px solid var(--rule);
  border-radius: 999px;
  background: var(--bg);
  color: var(--fg);
  font-size: 12px;
  letter-spacing: .06em;
  cursor: pointer;
  transition: background .15s, color .15s, transform .1s;
}
.pad:hover { background: var(--fg); color: var(--bg); }
.pad:active { transform: scale(.97); }

/* 06 · clip */
.stage.is-tokens :deep(.lazy-video) { position: absolute; inset: 0; }

/* 02 · botón para repetir */
.replay {
  position: absolute;
  right: 10px;
  bottom: 10px;
  padding: 5px 10px;
  border: 1px solid var(--rule);
  border-radius: 999px;
  background: var(--bg);
  color: var(--fg);
  font-size: 11px;
  cursor: pointer;
}

@media (prefers-reduced-motion: reduce) {
  .ink::before { animation: none; }
}
</style>
