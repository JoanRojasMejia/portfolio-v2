<template>
  <section class="hero" data-screen-label="Hero técnico">
    <div class="ruler-x mono" aria-hidden="true">
      <span v-for="n in rulerX" :key="n">{{ n }}</span>
    </div>
    <div class="ruler-y" aria-hidden="true"></div>
    <div class="inner">
      <div class="column mono">
        <span>+</span><span>{{ t.column }}</span><span class="line"></span><span>+</span>
      </div>
      <div class="grid">
        <div class="copy">
          <div class="kicker mono">
            <span class="diamond light"></span><span class="nowrap">{{ t.sheetUp }} 01 · {{ t.identity }}</span>
          </div>
          <div class="hello"><ScrambleText :text="greeting" />, {{ t.iam }}</div>
          <h1>Joan <span class="thin">Rojas</span></h1>
          <div class="cross">{{ t.cross }}</div>
          <p v-if="isEs" class="intro">Product Engineer en Global66, una fintech. Lideré el design system que llevó el producto de B2C a B2B. Diseño y construyo con Astro y Vue. Estudio Economía en la Universidad Jorge Tadeo Lozano.</p>
          <p v-else class="intro">Product Engineer at Global66, a fintech. I led the design system that took the product from B2C to B2B. I design and build with Astro and Vue. I study Economics at Universidad Jorge Tadeo Lozano.</p>
        </div>
        <div class="meta mono">
          <div v-for="r in metaRows" :key="r.k" class="row">
            <span class="k">{{ r.k }}</span><span>{{ r.v }}</span>
          </div>
          <div class="row playing">
            <div class="vinyl disc"><div class="hole"></div></div>
            <span class="k">{{ t.listening }}</span><span>{{ nowArtist }}</span>
          </div>
        </div>
      </div>
      <div class="fig mono">{{ t.fig }}</div>
    </div>
    <div class="strip">
      <img v-for="src in strip" :key="src" :src="src" alt="" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ScrambleText from './ScrambleText.vue';
import { clock, greeting, isEs, nowArtist, t } from '../lib/site';

const rulerX = Array.from({ length: 20 }, (_, i) => String(i * 100));
const strip = ['tat-sleeve-a', 'tat-hannya', 'tat-blackwork', 'tat-sleeve-b', 'motos'].map(n => `/assets/${n}.jpg`);

const metaRows = computed(() => [
  { k: t.value.location, v: 'Bogotá, Colombia' },
  { k: 'COORD.', v: '4°40′ N · 74°03′ W' },
  { k: t.value.localTime, v: clock.value + ' COT' },
  { k: 'STACK', v: 'Astro · Vue' },
  { k: t.value.status, v: t.value.open },
]);
</script>

<style scoped>
.hero { background: #0D0D0C; color: #EDEBE6; position: relative; overflow: hidden; }
.ruler-x {
  height: 28px;
  border-bottom: 1px solid #2B2B29;
  background-image:
    repeating-linear-gradient(to right, #3a3a37 0 1px, transparent 1px 10px),
    repeating-linear-gradient(to right, #5a5a56 0 1px, transparent 1px 100px);
  background-size: 100% 6px, 100% 12px;
  background-repeat: no-repeat;
  background-position: 0 100%, 0 100%;
  padding-left: 28px;
  display: flex;
  font-size: 10px;
  color: #6a6a66;
}
.ruler-x span { width: 100px; flex: none; padding-left: 4px; padding-top: 3px; }
.ruler-y {
  position: absolute;
  left: 0; top: 28px; bottom: 0;
  width: 28px;
  border-right: 1px solid #2B2B29;
  background-image:
    repeating-linear-gradient(to bottom, #3a3a37 0 1px, transparent 1px 10px),
    repeating-linear-gradient(to bottom, #5a5a56 0 1px, transparent 1px 100px);
  background-size: 6px 100%, 12px 100%;
  background-repeat: no-repeat;
  background-position: 100% 0, 100% 0;
}
.inner { max-width: 1200px; margin: 0 auto; padding: 0 var(--gutter) 0 calc(var(--gutter) + 28px); }
.column { display: flex; align-items: center; gap: 12px; padding: 22px 0; font-size: 11px; color: #7a7a75; }
.line { flex: 1; height: 1px; background: #2B2B29; display: block; }
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr));
  gap: 48px;
  padding: clamp(32px, 6vw, 80px) 0 56px clamp(16px, 3vw, 40px);
  border-left: 1px dashed #2B2B29;
}
.copy { display: flex; flex-direction: column; gap: 22px; }
.kicker { font-size: 12px; letter-spacing: .12em; color: #8C8B86; display: flex; gap: 10px; align-items: center; }
.diamond.light { border-color: #EDEBE6; }
.nowrap { white-space: nowrap; flex: none; }
.hello { font-size: 22px; color: #BDBBB5; }
h1 { margin: 0; font-weight: 600; font-size: clamp(64px, 9vw, 120px); line-height: .92; letter-spacing: -.04em; }
.thin { font-weight: 300; color: #6E6D68; }
.cross { font-size: 20px; color: #8C8B86; }
.intro { margin: 8px 0 0; max-width: 34em; font-size: 18px; line-height: 1.6; color: #BDBBB5; text-wrap: pretty; }
.meta { display: flex; flex-direction: column; justify-content: flex-end; font-size: 12px; }
.row { display: grid; grid-template-columns: 120px 1fr; gap: 16px; padding: 12px 0; border-top: 1px solid #2B2B29; }
.k { color: #6E6D68; letter-spacing: .08em; }
.row.playing { display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #2B2B29; }
.disc { width: 28px; height: 28px; background: repeating-radial-gradient(circle, #1a1a19 0 2px, #33332f 2px 3px); }
.hole { width: 8px; height: 8px; border-radius: 50%; background: #EDEBE6; }
.fig { font-size: 11px; color: #6E6D68; padding: 0 0 14px; }
.strip { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); height: clamp(160px, 22vw, 280px); }
.strip img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(1) contrast(1.2); }
</style>
