<template>
  <SubPage :links="[{ href: '/album', label: t.nAlbum }, { href: '/colophon', label: 'Colophon' }]" active="work">
    <section class="sheet top" data-screen-label="Caso · cabecera">
      <SheetLabel :no="`02.${p.n}`" :label="pt.caseUp" :right="`${p.n} / ${PROJECTS.length}`" class="mb28" />
      <Breadcrumb :items="[{ label: pt.home, href: '/' }, { label: pt.homeWork, href: '/#trabajo' }, { label: p.title }]" class="mb40" />
      <div class="intro">
        <div class="intro-copy">
          <div class="meta mono">
            <span>{{ p.company }}</span><span>·</span><span>{{ p.period }}</span>
            <span v-if="p.featured" class="badge">{{ t.featured }}</span>
          </div>
          <h1 class="serif">{{ p.title }}</h1>
          <p class="desc">{{ p.desc }}</p>
        </div>

        <div class="ficha">
          <div v-for="f in ficha" :key="f.k" class="ficha-row">
            <span class="mono k">{{ f.k }}</span><span class="v">{{ f.v }}</span>
          </div>
          <div v-if="p.link" class="ficha-row">
            <span class="mono k">{{ pt.linkUp }}</span>
            <a class="v link" :href="p.link" target="_blank" rel="noopener noreferrer">{{ p.linkLabel }} <span aria-hidden="true">↗</span></a>
          </div>
          <!-- Banda sonora del proyecto. Con preview de iTunes toda la fila es un botón
               que la reproduce 30 s; el ícono del disco y la etiqueta lo dejan claro. -->
          <component
            :is="song?.preview ? 'button' : 'div'"
            :type="song?.preview ? 'button' : undefined"
            class="song"
            :class="{ playable: song?.preview, playing }"
            :data-sound="song?.preview ? 'none' : undefined"
            :aria-pressed="song?.preview ? playing : undefined"
            @click="song?.preview && toggleSong()"
          >
            <span class="vinyl disc" aria-hidden="true">
              <img v-if="song?.artwork" :src="song.artwork" alt="" class="art" decoding="async" />
              <span class="hole"></span>
            </span>
            <span v-if="song?.preview" class="state" aria-hidden="true">
              <svg v-if="playing" viewBox="0 0 10 10"><rect x="2" y="1.5" width="2" height="7" /><rect x="6" y="1.5" width="2" height="7" /></svg>
              <svg v-else viewBox="0 0 10 10"><path d="M3 1.5 8.5 5 3 8.5Z" /></svg>
            </span>
            <span class="song-text">
              <span class="mono k-plain">{{ pt.song }}</span>
              <span v-if="song" class="song-name">{{ song.name }} <span class="muted">— {{ song.artist }}</span></span>
              <span v-else class="muted">{{ pt.songSlot }}</span>
            </span>
            <span v-if="song?.preview" class="cta mono">{{ playing ? t.pause : t.playPreview }}</span>
            <audio v-if="song?.preview" ref="audio" :src="song.preview" preload="none" @ended="playing = false"></audio>
          </component>
        </div>
      </div>
    </section>

    <!-- Proyectos con video: demo en bucle y recorrido completo con controles -->
    <section v-if="media" class="sheet tight" data-screen-label="Caso · video">
      <div class="tabs mono" role="tablist" :aria-label="p.title">
        <button
          v-for="v in views"
          :key="v.id"
          role="tab"
          type="button"
          class="tab"
          data-sound="tap"
          :aria-selected="view === v.id"
          @click="view = v.id"
        >{{ v.label }} <span class="secs">{{ v.secs }}</span></button>
      </div>
      <div class="screen">
        <LazyVideo
          v-if="view === 'demo'"
          key="demo"
          :src="media.demo.src"
          :poster="media.demo.poster"
          :label="`${pt.demo} · ${p.title}`"
          pausable
          :play-label="`▶ ${pt.play}`"
          :pause-label="`❚❚ ${pt.pause}`"
        />
        <LazyVideo
          v-else
          key="walk"
          mode="player"
          :src="media.walk.src"
          :poster="media.walk.poster"
          :label="`${pt.walk} · ${p.title}`"
        />
      </div>
      <div class="mono fig">Fig 2.{{ p.n }} · {{ view === 'demo' ? pt.figDemo : pt.figWalk }}</div>
    </section>

    <section v-else class="sheet tight" data-screen-label="Caso · imagen">
      <img class="main-shot" :src="p.cover" :alt="p.shot" decoding="async" />
      <div class="mono fig">Fig 2.{{ p.n }} · {{ pt.figMain }}</div>
    </section>

    <section v-if="compare" class="sheet mid" data-screen-label="Caso · antes/después">
      <div class="ba-head">
        <h2 class="serif h2">B2C → B2B</h2>
        <span class="mono muted small">{{ pt.drag }}</span>
      </div>
      <div class="ba">
        <img class="ba-img" :src="compare.after" :alt="`B2B · ${pt.after}`" loading="lazy" decoding="async" />
        <img
          class="ba-img"
          :src="compare.before"
          :alt="`B2C · ${pt.before}`"
          loading="lazy"
          decoding="async"
          :style="{ clipPath: `inset(0 ${100 - ba}% 0 0)` }"
        />
        <span class="ba-line" :style="{ left: ba + '%' }" aria-hidden="true"></span>
        <span class="ba-tag left mono" aria-hidden="true">B2C · {{ pt.before }}</span>
        <span class="ba-tag right mono" aria-hidden="true">B2B · {{ pt.after }}</span>
        <input
          v-model.number="ba"
          class="ba-range"
          type="range"
          min="0"
          max="100"
          :aria-label="`${pt.before} / ${pt.after}`"
        />
        <div class="ba-knob mono" :style="{ left: ba + '%' }" aria-hidden="true">⟷</div>
      </div>
    </section>

    <!-- Relato numerado: una idea por bloque; sin video, las decisiones llevan captura -->
    <section v-if="sum" class="sheet mid" data-screen-label="Caso · relato">
      <div v-for="(b, i) in steps" :key="b.title" class="step" :class="{ 'has-img': b.img }">
        <div class="step-head">
          <span class="mono n">{{ pad(i + 1) }}</span>
          <span class="mono label">{{ b.label }}</span>
        </div>
        <div class="step-body">
          <h3 class="serif step-t">{{ b.title }}</h3>
          <p v-if="b.body" class="step-p">{{ b.body }}</p>
          <div v-if="b.facts" class="facts">
            <div v-for="f in b.facts" :key="f.label" class="fact">
              <span class="serif fact-v">{{ f.value }}</span><span class="fact-k">{{ f.label }}</span>
            </div>
          </div>
        </div>
        <img v-if="b.img" class="step-img" :src="b.img" :alt="`${b.title} · ${p.title}`" loading="lazy" decoding="async" />
      </div>
    </section>

    <section class="sheet next-sec" data-screen-label="Caso · siguiente">
      <a :href="`/caso/${next.id}`" class="next">
        <span class="next-copy">
          <span class="mono label">{{ pt.next }}</span>
          <span class="serif big">{{ L(next.title, lang) }}</span>
        </span>
        <span class="serif big">→</span>
      </a>
    </section>
  </SubPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import SubPage from './SubPage.vue';
import SheetLabel from './SheetLabel.vue';
import Breadcrumb from './Breadcrumb.vue';
import LazyVideo from './LazyVideo.vue';
import { PROJECTS } from '../lib/data';
import { WORK_CONTENT } from '../lib/work-content';
import { WORK_MEDIA } from '../lib/work-media';
import { CASE_SUMMARY } from '../lib/case-summary';
import { L } from '../lib/i18n';
import { lang, pt, t } from '../lib/site';

const props = defineProps<{
  id: string;
  /** Canción del proyecto con su preview de iTunes, buscada en build time ([id].astro). */
  song?: { artist: string; name: string; preview: string | null; artwork: string | null } | null;
}>();

const pad = (n: number) => String(n).padStart(2, '0');
const idx = computed(() => Math.max(0, PROJECTS.findIndex(x => x.id === props.id)));
const next = computed(() => PROJECTS[(idx.value + 1) % PROJECTS.length]);

const p = computed(() => {
  const pr = PROJECTS[idx.value];
  const l = lang.value;
  const c = WORK_CONTENT[pr.id];
  const link = c?.link ?? null;
  return {
    id: pr.id,
    n: idx.value + 1,
    featured: !!pr.featured,
    company: L(pr.company, l),
    period: L(pr.period, l),
    title: L(pr.title, l) ?? '',
    desc: L(pr.desc, l),
    shot: L(pr.shot, l),
    cover: c?.cover ?? '',
    // Capturas del proyecto, para los bloques del relato cuando no hay video.
    shots: c?.gallery ?? [],
    link,
    linkLabel: link ? new URL(link).hostname.replace(/^www\./, '') : '',
    role: L(pr.role, l),
    stack: pr.stack,
  };
});

const ficha = computed(() => [
  { k: pt.value.company, v: p.value.company },
  { k: t.value.role, v: p.value.role },
  { k: t.value.platform, v: 'Web' },
  { k: t.value.timeline, v: p.value.period },
  { k: 'STACK', v: p.value.stack },
]);

const ba = ref(50);

const audio = ref<HTMLAudioElement | null>(null);
const playing = ref(false);
const toggleSong = () => {
  const a = audio.value;
  if (!a) return;
  if (playing.value) {
    a.pause();
    playing.value = false;
  } else {
    a.play().then(() => (playing.value = true)).catch(() => (playing.value = false));
  }
};

// Resumen del caso (case-summary.ts) en el idioma actual.
const sum = computed(() => {
  const c = CASE_SUMMARY[p.value.id];
  if (!c) return null;
  const l = lang.value;
  return { problem: L(c.problem, l), did: L(c.did, l), result: L(c.result, l), facts: L(c.facts, l) ?? [], deep: L(c.deep, l) ?? [] };
});

// Relato: un bloque por idea; sin video, las decisiones llevan una captura del proyecto.
const steps = computed(() => {
  const s = sum.value;
  if (!s) return [];
  return [
    { label: pt.value.sumProblem, title: s.problem },
    { label: pt.value.sumDid, title: s.did },
    ...s.deep.map((d, i) => ({ label: pt.value.stepKey, title: d.title, body: d.body, img: media.value ? undefined : p.value.shots[i] })),
    { label: pt.value.sumResult, title: s.result, facts: s.facts },
  ] as { label: string; title: string; body?: string; img?: string; facts?: { value: string; label: string }[] }[];
});

const media = computed(() => WORK_MEDIA[p.value.id]);
const compare = computed(() => media.value?.compare);
const view = ref<'demo' | 'walk'>('demo');
// 59 → "0:59", 69 → "1:09"
const dur = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const views = computed(() =>
  media.value
    ? [
        { id: 'demo' as const, label: pt.value.demo, secs: dur(media.value.demo.secs) },
        { id: 'walk' as const, label: pt.value.walk, secs: dur(media.value.walk.secs) },
      ]
    : [],
);
</script>

<style scoped>
.top { padding-top: 40px; padding-bottom: 40px; }
.tight { padding-top: 0; }
.mid { padding-top: 56px; }
.next-sec { padding-top: 56px; padding-bottom: 56px; }
.mb28 { margin-bottom: 28px; }
.mb40 { margin-bottom: 40px; }
.muted { color: var(--muted); }
.small { font-size: 12px; }
.label { font-size: 12px; letter-spacing: .1em; color: var(--muted); }

.intro {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr));
  gap: clamp(32px, 5vw, 72px);
  align-items: end;
}
.intro-copy { display: flex; flex-direction: column; gap: 20px; }
.meta { display: flex; gap: 10px; align-items: center; font-size: 12px; color: var(--muted); flex-wrap: wrap; }
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
h1 { margin: 0; font-size: clamp(56px, 8vw, 112px); line-height: .92; letter-spacing: -.02em; text-wrap: balance; }
.desc { margin: 0; font-size: 20px; line-height: 1.5; color: var(--muted); max-width: 30em; text-wrap: pretty; }

.ficha { border: 1px solid var(--rule); font-size: 15px; }
.ficha-row { display: grid; grid-template-columns: 120px minmax(0, 1fr); border-bottom: 1px solid var(--rule); }
.ficha-row .k { padding: 12px 14px; font-size: 11px; letter-spacing: .1em; color: var(--muted); border-right: 1px solid var(--rule); }
.ficha-row .v { padding: 12px 14px; }
.ficha-row .link { text-decoration: underline; text-underline-offset: 4px; overflow-wrap: anywhere; }

.tabs { display: flex; gap: 6px; margin-bottom: 14px; flex-wrap: wrap; }
.tab {
  padding: 7px 14px;
  border: 1px solid var(--rule);
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  font-size: 12px;
  letter-spacing: .06em;
  cursor: pointer;
  transition: color .2s, border-color .2s, background .2s;
}
.tab:hover { color: var(--fg); }
.tab[aria-selected="true"] { color: var(--bg); background: var(--fg); border-color: var(--fg); }
.secs { opacity: .6; margin-left: 4px; }
/* Ventana de la app: el marco lo pone el sitio, así sirve en claro y oscuro */
.screen {
  aspect-ratio: 16 / 10;
  border: 1px solid var(--rule);
  border-radius: 10px;
  overflow: hidden;
  background: var(--card);
  box-shadow: 0 1px 2px rgba(0, 0, 0, .04), 0 18px 40px -18px rgba(0, 0, 0, .18);
}
/* La app solo existe en claro: en modo oscuro se baja un poco para que no encandile */
:global(:root[data-theme="dark"]) .screen :deep(video) { filter: brightness(.88); }
.song {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
}
.song.playable { cursor: pointer; transition: background .2s; }
.song.playable:hover,
.song.playing { background: var(--card); }
.song:focus-visible { outline: 2px solid var(--fg); outline-offset: -2px; }
.disc { position: relative; width: 34px; height: 34px; flex: none; overflow: hidden; animation-play-state: paused; }
.song.playing .disc { animation-play-state: running; }
.art { position: absolute; inset: 22%; width: 56%; height: 56%; border-radius: 50%; object-fit: cover; }
.hole { position: relative; width: 9px; height: 9px; border-radius: 50%; background: var(--bg); }
.disc .art + .hole { width: 5px; height: 5px; }
/* Botón de play sobre el disco, como en el reproductor del hero */
.state {
  position: absolute;
  left: 36px;
  top: 34px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--fg);
  color: var(--bg);
  display: grid;
  place-items: center;
  box-shadow: 0 0 0 2px var(--bg);
}
.state svg { width: 8px; height: 8px; fill: currentColor; }
.song-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.song-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* Lo que hace el clic, dicho en texto */
.cta {
  flex: none;
  padding: 4px 10px;
  border: 1px solid var(--rule);
  border-radius: 999px;
  font-size: 11px;
  letter-spacing: .04em;
  color: var(--fg);
  white-space: nowrap;
  transition: background .2s, color .2s, border-color .2s;
}
.song.playable:hover .cta,
.song.playing .cta { background: var(--fg); color: var(--bg); border-color: var(--fg); }
.k-plain { font-size: 10px; letter-spacing: .1em; color: var(--muted); }
.main-shot { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 4px; border: 1px solid var(--rule); background: var(--card); }
.fig { font-size: 11px; color: var(--muted); padding: 10px 0 0; }

.h2 { margin: 0; font-size: clamp(36px, 4vw, 52px); line-height: 1; }
.ba-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
.ba {
  position: relative;
  aspect-ratio: 16 / 10;
  border: 1px solid var(--rule);
  border-radius: 4px;
  overflow: hidden;
  background: var(--card);
}
.ba-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
:global(:root[data-theme="dark"]) .ba-img { filter: brightness(.88); }
.ba-line { position: absolute; top: 0; bottom: 0; width: 2px; margin-left: -1px; background: var(--fg); pointer-events: none; }
.ba-tag {
  position: absolute;
  top: 14px;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--fg);
  color: var(--bg);
  font-size: 11px;
  letter-spacing: .06em;
  pointer-events: none;
}
.ba-tag.left { left: 14px; }
.ba-tag.right { right: 14px; }
.ba-range {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: .0001;
  cursor: ew-resize;
}
.ba-range:focus-visible + .ba-knob { outline: 2px solid var(--fg); outline-offset: 3px; }
.ba-knob {
  position: absolute;
  top: 50%;
  width: 40px;
  height: 40px;
  margin: -20px 0 0 -20px;
  border-radius: 50%;
  background: var(--fg);
  color: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  pointer-events: none;
}



.next {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  flex-wrap: wrap;
  padding: 32px 0;
  border-top: 1px solid var(--fg);
  border-bottom: 1px solid var(--fg);
  transition: padding .3s;
}
.next:hover { color: var(--fg); padding-left: 12px; }
.next-copy { display: flex; flex-direction: column; gap: 10px; }
.big { font-size: clamp(40px, 6vw, 80px); line-height: 1; }

/* Datos duros del resultado */
.facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr)); gap: 12px; }
.fact { display: flex; flex-direction: column; gap: 6px; padding: 16px 18px; border: 1px solid var(--rule); border-radius: 6px; background: var(--card); }
.fact-v { font-size: clamp(30px, 3.4vw, 42px); line-height: 1; }
.fact-k { font-size: 14px; color: var(--muted); line-height: 1.35; }
.n { font-size: 12px; color: var(--muted); }

/* Relato numerado */
.step {
  display: grid;
  grid-template-columns: minmax(0, 200px) minmax(0, 1fr);
  gap: 16px 40px;
  padding: 28px 0;
  border-top: 1px solid var(--rule);
}
.step.has-img { grid-template-columns: minmax(0, 200px) minmax(0, 1fr) minmax(0, 1.1fr); align-items: start; }
.step-head { display: flex; gap: 12px; align-items: baseline; }
.step-body { display: flex; flex-direction: column; gap: 12px; }
.step-t { margin: 0; font-size: clamp(24px, 2.6vw, 32px); line-height: 1.15; font-weight: 400; text-wrap: balance; }
.step-p { margin: 0; font-size: 17px; line-height: 1.6; color: var(--muted); max-width: 34em; text-wrap: pretty; }
.step-img { width: 100%; aspect-ratio: 16 / 10; object-fit: cover; border: 1px solid var(--rule); border-radius: 6px; background: var(--card); }
@media (max-width: 860px) {
  .step, .step.has-img { grid-template-columns: minmax(0, 1fr); }
}
</style>
