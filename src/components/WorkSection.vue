<template>
  <section id="trabajo" class="sheet" data-screen-label="Trabajo">
    <SheetLabel no="02" :label="t.work" class="label" />

    <!-- Global66: proyectos actuales, en tarjetas grandes -->
    <div class="list">
      <article v-for="p in current" :key="p.id" class="project">
        <a :href="p.href" class="shot" :aria-label="`${t.viewCase}: ${p.title}`">
          <LazyVideo v-if="p.teaser" :src="teaserOf(p.teaser).src" :poster="teaserOf(p.teaser).poster" :label="p.shot" />
          <img v-else :src="p.cover" :alt="p.shot" loading="lazy" decoding="async" />
        </a>
        <div class="body">
          <div class="meta mono">
            <span>{{ p.company }}</span><span>·</span><span>{{ p.period }}</span>
            <span v-if="p.featured" class="badge">{{ t.featured }}</span>
          </div>
          <a :href="p.href"><h3 class="serif">{{ p.title }}</h3></a>
          <p class="desc">{{ p.desc }}</p>
          <div class="facts">
            <div><span class="mono k">{{ t.role }}</span><span>{{ p.role }}</span></div>
            <div><span class="mono k">STACK</span><span>{{ p.stack }}</span></div>
            <div><span class="mono k">{{ t.timeline }}</span><span>{{ p.period }}</span></div>
          </div>
          <a :href="p.href" class="cta">{{ t.viewCase }} <span>↗</span></a>
        </div>
      </article>
    </div>

    <!-- Trabajo previo: oculto hasta que el visitante lo pide, para que la sección
         muestre solo los tres proyectos principales -->
    <button
      type="button"
      class="more mono"
      data-sound="toggle"
      :aria-expanded="showPrev"
      aria-controls="trabajo-previo"
      @click="showPrev = !showPrev"
    >
      <span>{{ showPrev ? t.lessWork : t.moreWork }}</span>
      <span class="more-n">{{ previous.length }}</span>
      <span class="more-i" aria-hidden="true">{{ showPrev ? '−' : '+' }}</span>
    </button>

    <!-- Índice compacto, como el índice de planos de un juego de planos -->
    <div v-show="showPrev" id="trabajo-previo" class="index">
      <div class="index-head mono">
        <span class="nowrap">{{ t.prevUp }}</span><span class="rule"></span><span>{{ previous.length }}</span>
      </div>
      <div class="table" role="table" :aria-label="t.prevUp">
        <div class="row head mono" role="row">
          <span role="columnheader">{{ t.colNo }}</span>
          <span role="columnheader">{{ t.colProject }}</span>
          <span role="columnheader" class="ctx">{{ t.colContext }}</span>
          <span role="columnheader" class="stk">STACK</span>
          <span role="columnheader" class="yr">{{ t.colYear }}</span>
          <span role="columnheader" aria-hidden="true"></span>
        </div>
        <a v-for="p in previous" :key="p.id" :href="p.href" class="row item" role="row">
          <span class="mono no" role="cell">{{ p.no }}</span>
          <span class="title" role="cell">
            <span class="serif name">{{ p.title }}</span>
            <span class="sub">{{ p.desc }}</span>
          </span>
          <span class="mono ctx" role="cell">{{ p.company }}</span>
          <span class="mono stk" role="cell">{{ p.stack }}</span>
          <span class="mono yr" role="cell">{{ p.period }}</span>
          <span class="arrow" role="cell" aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import SheetLabel from './SheetLabel.vue';
import LazyVideo from './LazyVideo.vue';
import { PROJECTS } from '../lib/data';
import { L } from '../lib/i18n';
import { lang, t, theme } from '../lib/site';
import { WORK_CONTENT } from '../lib/work-content';
import { WORK_MEDIA, type WorkMedia } from '../lib/work-media';

const all = computed(() =>
  PROJECTS.map((p, i) => ({
    id: p.id,
    group: p.group,
    no: `02.${String(i + 1).padStart(2, '0')}`,
    href: `/caso/${p.id}`,
    featured: !!p.featured,
    company: L(p.company, lang.value),
    period: L(p.period, lang.value),
    title: L(p.title, lang.value),
    desc: L(p.desc, lang.value),
    role: L(p.role, lang.value),
    shot: L(p.shot, lang.value),
    stack: p.stack,
    cover: WORK_CONTENT[p.id]?.cover,
    teaser: WORK_MEDIA[p.id]?.teaser,
  })),
);

// El teaser sigue el tema del sitio. Antes de montar se usa el claro, como en el
// HTML del servidor, para que la hidratación coincida.
const mounted = ref(false);
onMounted(() => (mounted.value = true));
const teaserOf = (tz: WorkMedia['teaser']) => tz[mounted.value && theme.value === 'dark' ? 'dark' : 'light'];
const current = computed(() => all.value.filter(p => p.group === 'g66'));
const showPrev = ref(false);
const previous = computed(() => all.value.filter(p => p.group === 'prev'));
</script>

<style scoped>
.label { margin-bottom: 40px; }
.list { display: flex; flex-direction: column; gap: 28px; }
.project {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr));
  gap: clamp(24px, 4vw, 56px);
  padding: 20px;
  border: 1px solid var(--rule);
  border-radius: 6px;
  background: var(--card);
}
.shot {
  display: block;
  aspect-ratio: 4 / 3;
  border: 1px solid var(--rule);
  border-radius: 3px;
  overflow: hidden;
  background: var(--bg);
}
.shot img,
.shot :deep(video) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform .6s cubic-bezier(.2, .8, .2, 1);
}
.project:hover .shot img,
.project:hover .shot :deep(video) { transform: scale(1.03); }
.body { display: flex; flex-direction: column; gap: 18px; padding: 8px 4px; }
.meta {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 12px;
  color: var(--muted);
  letter-spacing: .04em;
  flex-wrap: wrap;
}
.badge {
  margin-left: 6px;
  padding: 2px 8px;
  border: 1px solid var(--fg);
  border-radius: 999px;
  color: var(--fg);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: .08em;
}
h3 { margin: 0; font-size: clamp(34px, 4vw, 48px); line-height: 1; letter-spacing: -.01em; }
.desc { margin: 0; font-size: 17px; line-height: 1.55; color: var(--muted); max-width: 32em; text-wrap: pretty; }
.facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 1px solid var(--rule);
  margin-top: auto;
}
.facts > div { padding: 12px 12px 0; display: flex; flex-direction: column; gap: 4px; font-size: 14px; }
.facts > div:first-child { padding-left: 0; }
.facts > div:last-child { padding-right: 0; }
.facts > div + div { border-left: 1px solid var(--rule); }
.k { font-size: 10px; letter-spacing: .1em; color: var(--muted); }
.cta {
  align-self: flex-start;
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 15px;
  font-weight: 500;
  border-bottom: 1px solid var(--fg);
  padding-bottom: 2px;
}

/* ---- Más proyectos ---- */
.more {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 40px auto 0;
  padding: 12px 20px;
  border: 1px solid var(--fg);
  border-radius: 999px;
  background: transparent;
  color: var(--fg);
  font-size: 12px;
  letter-spacing: .1em;
  cursor: pointer;
  transition: background .2s, color .2s;
}
.more:hover,
.more[aria-expanded="true"] { background: var(--fg); color: var(--bg); }
.more-n { opacity: .6; }
.more-i { font-size: 16px; line-height: 1; }

/* ---- Índice de trabajo previo ---- */
.index { margin-top: 40px; animation: index-in .35s ease both; }
@keyframes index-in { from { opacity: 0; transform: translateY(-6px); } }
@media (prefers-reduced-motion: reduce) { .index { animation: none; } }
.index-head {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 12px;
  letter-spacing: .1em;
  color: var(--muted);
  margin-bottom: 8px;
}
.nowrap { white-space: nowrap; }
.rule { flex: 1; height: 1px; background: var(--rule); }
.table { border-top: 1px solid var(--fg); }
.row {
  display: grid;
  grid-template-columns: 64px minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, 1fr) 96px 24px;
  gap: 16px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--rule);
}
.row.head { padding: 10px 0; font-size: 10px; letter-spacing: .1em; color: var(--muted); }
.item { color: var(--fg); transition: background .2s, padding .2s; }
.item:hover { color: var(--fg); background: var(--card); padding-left: 10px; padding-right: 10px; }
.no, .ctx, .stk, .yr { font-size: 12px; color: var(--muted); }
.title { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.name { font-size: 26px; line-height: 1.05; }
.sub { font-size: 14px; color: var(--muted); line-height: 1.4; }
.arrow { justify-self: end; transition: transform .25s; }
.item:hover .arrow { transform: translate(2px, -2px); }

/* En pantallas angostas el índice se apila: número, proyecto y una línea de datos. */
@media (max-width: 760px) {
  .row { grid-template-columns: 48px minmax(0, 1fr) 20px; row-gap: 6px; }
  .row.head { display: none; }
  .ctx, .stk, .yr { grid-column: 2; }
  .arrow { grid-row: 1; grid-column: 3; }
}
</style>
