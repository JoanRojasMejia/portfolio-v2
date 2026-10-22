<template>
  <SubPage :links="[{ href: '/', label: pt.home }, { href: '/colophon', label: 'Colophon' }]" active="album">
    <section class="sheet top" data-screen-label="Álbum · intro">
      <SheetLabel no="05" :label="t.albumUp" right="05.1 — 05.3" class="mb28" />
      <Breadcrumb :items="[{ label: pt.home, href: '/' }, { label: pt.album }]" class="mb32" />
      <div class="title-row">
        <h1 class="serif">{{ pt.album }}</h1>
        <div class="chips mono">
          <a href="#collage">05.1 Collage</a>
          <a href="#flash">05.2 Flash</a>
          <a href="#discos">05.3 {{ pt.records }}</a>
        </div>
      </div>
    </section>

    <section id="collage" class="sheet collage-sec" data-screen-label="Álbum · collage">
      <div class="collage-head">
        <span class="mono label">05.1 · COLLAGE — {{ pt.dragHint }}</span>
        <button class="pill mono" @click="collage?.reset()">↺ {{ t.reset }}</button>
      </div>
      <Collage ref="collage" :items="ALBUM_PAGE" aspect="16 / 18" :max-y="92" />
    </section>

    <section id="flash" class="sheet mid" data-screen-label="Álbum · flash">
      <div class="rule-head mono">
        <span class="nowrap">05.2 · {{ pt.flashUp }}</span><span class="line"></span><span>{{ pt.inkHint }}</span>
      </div>
      <div class="flash-grid">
        <article
          v-for="(f, i) in FLASH"
          :key="f.no"
          class="flash"
          @pointerenter="inked = i"
          @pointerleave="inked = -1"
        >
          <div class="flash-top mono"><span>{{ f.no }}</span><span class="muted">{{ L(f.place, lang) }}</span></div>
          <div
            class="flash-img"
            :class="{ inked: inked === i }"
            role="img"
            :aria-label="L(f.name, lang)"
            :style="{ backgroundImage: `url(${f.src})` }"
          ></div>
          <h3 class="serif">{{ L(f.name, lang) }}</h3>
          <div class="flash-meta">
            <span class="mono k">{{ t.date }}</span><span class="muted">—</span>
            <span class="mono k">{{ pt.storyUp }}</span><span class="muted hand">{{ pt.storySlot }}</span>
          </div>
        </article>
      </div>
    </section>

    <section id="discos" class="sheet mid bottom" data-screen-label="Álbum · discos">
      <div class="rule-head mono">
        <span class="nowrap">05.3 · {{ t.rotation }}</span><span class="line"></span><span>{{ t.lastfm }}</span>
      </div>
      <Records :min="150" :gap="24" :title-size="24" />
    </section>
  </SubPage>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SubPage from './SubPage.vue';
import SheetLabel from './SheetLabel.vue';
import Breadcrumb from './Breadcrumb.vue';
import Collage from './Collage.vue';
import Records from './Records.vue';
import { ALBUM_PAGE, FLASH } from '../lib/data';
import { L } from '../lib/i18n';
import { lang, pt, t } from '../lib/site';

const collage = ref<InstanceType<typeof Collage> | null>(null);
const inked = ref(-1);
</script>

<style scoped>
.top { padding-top: 40px; }
.collage-sec { padding-top: 32px; }
.mid { padding-top: 56px; }
.bottom { padding-bottom: 56px; }
.mb28 { margin-bottom: 28px; }
.mb32 { margin-bottom: 32px; }
.muted { color: var(--muted); }
.nowrap { white-space: nowrap; flex: none; }
.label { font-size: 12px; letter-spacing: .1em; color: var(--muted); }

.title-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; flex-wrap: wrap; }
h1 { margin: 0; font-size: clamp(64px, 10vw, 140px); line-height: .88; letter-spacing: -.02em; }
.chips { display: flex; gap: 6px; flex-wrap: wrap; font-size: 12px; }
.chips a { padding: 7px 12px; border: 1px solid var(--rule); border-radius: 999px; }
.chips a:hover { border-color: var(--fg); color: var(--fg); }

.collage-head { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; }
.pill {
  font-size: 12px;
  padding: 8px 14px;
  border: 1px solid var(--rule);
  border-radius: 999px;
  background: var(--card);
  color: var(--fg);
  cursor: pointer;
}

.rule-head { display: flex; align-items: center; gap: 14px; font-size: 12px; letter-spacing: .1em; color: var(--muted); margin-bottom: 20px; }
.line { flex: 1; height: 1px; background: var(--rule); display: block; }

.flash-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
  border-top: 1px solid var(--fg);
  border-left: 1px solid var(--fg);
}
.flash {
  border-right: 1px solid var(--fg);
  border-bottom: 1px solid var(--fg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--card);
}
.flash-top { display: flex; justify-content: space-between; font-size: 11px; letter-spacing: .06em; }
.flash-img {
  width: 100%;
  aspect-ratio: 4 / 5;
  background-size: cover;
  background-position: center;
  filter: grayscale(1) contrast(1.5) brightness(1.08);
  transition: filter .6s;
}
.flash-img.inked { filter: grayscale(0) contrast(1.05); }
h3 { margin: 0; font-size: 30px; line-height: 1; }
.flash-meta {
  display: grid;
  grid-template-columns: 70px minmax(0, 1fr);
  gap: 6px 10px;
  font-size: 14px;
  border-top: 1px solid var(--rule);
  padding-top: 10px;
}
.k { font-size: 10px; letter-spacing: .1em; color: var(--muted); padding-top: 2px; }
.hand { font-family: var(--hand); font-size: 20px; line-height: 1.1; }
</style>
