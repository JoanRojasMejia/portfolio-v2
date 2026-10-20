<template>
  <SubPage :links="[{ href: '/', label: pt.home }, { href: '/album', label: t.nAlbum }]">
    <section class="sheet top" data-screen-label="Colophon · intro">
      <SheetLabel no="07" label="COLOPHON" right="07 / 07" class="mb28" />
      <Breadcrumb :items="[{ label: pt.home, href: '/' }, { label: 'Colophon' }]" class="mb32" />
      <h1 class="serif">Colophon</h1>
      <p class="intro">{{ pt.colIntro }}</p>
    </section>

    <section class="sheet sec" data-screen-label="Colophon · tipografía">
      <div class="mono label">07.1 · {{ pt.typeUp }}</div>
      <div class="specimens">
        <div class="specimen">
          <span class="serif sample">Aa <em>Rr</em></span>
          <span class="spec-name"><span>Instrument Serif</span><span class="mono use">{{ pt.useDisplay }}</span></span>
        </div>
        <div class="specimen">
          <span class="sample sans">Aa Gg</span>
          <span class="spec-name"><span>Bricolage Grotesque</span><span class="mono use">{{ pt.useText }}</span></span>
        </div>
        <div class="specimen">
          <span class="mono sample monosample">0123 ·</span>
          <span class="spec-name"><span>Geist Mono</span><span class="mono use">{{ pt.useMono }}</span></span>
        </div>
        <div class="specimen">
          <span class="sample hand">{{ pt.handSample }}</span>
          <span class="spec-name"><span>Caveat</span><span class="mono use">{{ pt.useHand }}</span></span>
        </div>
      </div>
    </section>

    <section class="sheet sec split" data-screen-label="Colophon · color y stack">
      <div>
        <div class="mono label">07.2 · {{ pt.colorUp }}</div>
        <div class="swatches">
          <div v-for="s in swatches" :key="s" class="swatch">
            <div class="chip" :style="{ background: s }"></div>
            <span class="mono hex">{{ s }}</span>
          </div>
        </div>
        <p class="note">{{ pt.colorNote }}</p>
      </div>
      <div>
        <div class="mono label">07.3 · STACK</div>
        <div v-for="[k, v] in pt.stack" :key="k" class="row">
          <span>{{ k }}</span><span class="mono v">{{ v }}</span>
        </div>
      </div>
    </section>

    <section class="sheet sec bottom" data-screen-label="Colophon · detalles">
      <div class="mono label">07.4 · {{ pt.detailsUp }}</div>
      <div class="details">
        <div v-for="([k, v], i) in pt.details" :key="k" class="detail">
          <span class="mono n">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="dk">{{ k }}</span>
          <span class="dv">{{ v }}</span>
        </div>
      </div>
    </section>
  </SubPage>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SubPage from './SubPage.vue';
import SheetLabel from './SheetLabel.vue';
import Breadcrumb from './Breadcrumb.vue';
import { pt, t, theme } from '../lib/site';

const swatches = computed(() =>
  theme.value === 'dark' ? ['#0E0E0D', '#EDEBE6', '#8C8B86', '#2B2B29'] : ['#F3F2EE', '#111111', '#6E6D68', '#D9D7D0'],
);
</script>

<style scoped>
.top { padding-top: 40px; padding-bottom: 40px; }
.sec { padding-top: 40px; }
.bottom { padding-bottom: 56px; }
.mb28 { margin-bottom: 28px; }
.mb32 { margin-bottom: 32px; }
.label { font-size: 12px; letter-spacing: .1em; color: var(--muted); margin-bottom: 16px; }

h1 { margin: 0 0 20px; font-size: clamp(64px, 10vw, 140px); line-height: .88; letter-spacing: -.02em; }
.intro { margin: 0; font-size: 20px; line-height: 1.5; color: var(--muted); max-width: 30em; }

.specimens { border-top: 1px solid var(--rule); }
.specimen {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 24px;
  padding: 28px 0;
  border-bottom: 1px solid var(--rule);
  align-items: end;
}
.sample { font-size: clamp(64px, 9vw, 120px); line-height: .9; }
.sans { font-family: var(--sans); font-weight: 400; }
.monosample { font-size: clamp(48px, 7vw, 88px); }
.hand { font-family: var(--hand); font-size: clamp(56px, 8vw, 100px); }
.spec-name { display: flex; flex-direction: column; gap: 4px; font-size: 18px; }
.use { font-size: 12px; color: var(--muted); }

.split { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr)); gap: 48px; }
.swatches { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.swatch { display: flex; flex-direction: column; gap: 8px; }
.chip { aspect-ratio: 1; border: 1px solid var(--rule); }
.hex { font-size: 11px; color: var(--muted); }
.note { margin: 16px 0 0; font-size: 15px; line-height: 1.5; color: var(--muted); }
.row { display: flex; justify-content: space-between; gap: 16px; padding: 12px 0; border-top: 1px solid var(--rule); font-size: 16px; }
.v { font-size: 12px; color: var(--muted); }

.details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  border-top: 1px solid var(--rule);
  border-left: 1px solid var(--rule);
}
.detail {
  padding: 18px;
  border-right: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.n { font-size: 11px; color: var(--muted); }
.dk { font-size: 17px; }
.dv { font-size: 14px; color: var(--muted); }
</style>
