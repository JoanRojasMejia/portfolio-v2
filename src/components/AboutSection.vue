<template>
  <section id="sobre" class="sheet about" data-screen-label="Sobre mí">
    <SheetLabel no="06" :label="t.aboutUp" class="label" />
    <div class="grid">
      <div class="photos">
        <figure class="polaroid p1">
          <img src="/assets/mirror.jpg" alt="Joan" />
          <figcaption>Bogotá</figcaption>
        </figure>
        <figure class="polaroid p2">
          <img src="/assets/portrait-night.jpg" alt="Joan" />
          <figcaption>4°40′ N</figcaption>
        </figure>
      </div>
      <div class="text">
        <div v-if="isEs" class="bio">
          <p class="serif pull">Diseño, producto y economía. Las tres cosas en la misma mesa.</p>
          <p>Soy Joan Sebastián Rojas Mejía, de Bogotá. Soy Product Engineer en Global66, donde lideré el design system que llevó el producto de B2C a B2B. Diseño las interfaces y también las construyo, con Astro y Vue.</p>
          <p>Estudio Economía en la Universidad Jorge Tadeo Lozano. Ese cruce entre diseño, producto y economía es parte de mi historia.</p>
        </div>
        <div v-else class="bio">
          <p class="serif pull">Design, product and economics. All three on the same table.</p>
          <p>I'm Joan Sebastián Rojas Mejía, from Bogotá. I'm a Product Engineer at Global66, where I led the design system that took the product from B2C to B2B. I design interfaces and I build them too, with Astro and Vue.</p>
          <p>I study Economics at Universidad Jorge Tadeo Lozano. That crossing of design, product and economics is part of my story.</p>
        </div>
        <div class="mono outside-label">{{ t.outside }}</div>
        <div class="outside">
          <div v-for="o in outside" :key="o.k" class="row">
            <span>{{ o.k }}</span><span class="mono v">{{ o.v }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SheetLabel from './SheetLabel.vue';
import { isEs, nowArtist, t } from '../lib/site';

const outside = computed(() =>
  isEs.value
    ? [{ k: 'Tatuajes', v: 'blackwork · flash' }, { k: 'Música', v: nowArtist.value }, { k: 'Moto', v: 'rodar Bogotá' }, { k: 'Economía', v: 'UJTL' }]
    : [{ k: 'Tattoos', v: 'blackwork · flash' }, { k: 'Music', v: nowArtist.value }, { k: 'Riding', v: 'around Bogotá' }, { k: 'Economics', v: 'UJTL' }],
);
</script>

<style scoped>
.about { padding-bottom: 48px; }
.label { margin-bottom: 40px; }
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr));
  gap: 56px;
  align-items: start;
}
.photos { position: relative; height: 460px; max-width: 440px; }
.polaroid { position: absolute; margin: 0; }
.polaroid img { display: block; width: 100%; aspect-ratio: 3 / 4; object-fit: cover; }
.p1 { left: 0; top: 20px; width: 58%; transform: rotate(-6deg); box-shadow: 0 12px 28px rgba(0, 0, 0, .16); }
.p2 { right: 0; top: 110px; width: 56%; transform: rotate(5deg); box-shadow: 0 12px 28px rgba(0, 0, 0, .18); }
.text { display: flex; flex-direction: column; gap: 22px; }
.bio {
  display: flex;
  flex-direction: column;
  gap: 18px;
  font-size: 18px;
  line-height: 1.6;
  color: var(--muted);
  text-wrap: pretty;
}
.bio p { margin: 0; }
.bio .pull { font-size: clamp(28px, 3vw, 36px); line-height: 1.15; color: var(--fg); }
.outside-label { font-size: 11px; letter-spacing: .1em; color: var(--muted); margin-top: 12px; }
.outside { display: flex; flex-direction: column; }
.row { display: flex; justify-content: space-between; gap: 16px; padding: 12px 0; border-top: 1px solid var(--rule); font-size: 16px; }
.v { color: var(--muted); font-size: 12px; }
</style>
