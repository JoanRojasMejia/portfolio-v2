<template>
  <footer class="site-footer" data-screen-label="Footer">
    <div class="top">
      <div class="contact">
        <h2 class="serif">{{ t.talk }}</h2>
        <div class="links">
          <a v-for="l in LINKS" :key="l" href="#top"><span>{{ l }}</span><span class="arrow">↗</span></a>
        </div>
      </div>
      <div class="ticket">
        <div class="stub mono">
          <span>{{ t.admit }}</span>
          <span class="serif no">Nº {{ visitor }}</span>
          <span class="muted">{{ t.visitor }} · {{ today }}</span>
        </div>
        <div class="side mono">BOG · CO</div>
      </div>
    </div>
    <div class="titleblock mono">
      <div class="trow head">
        <span>REV</span><span>{{ t.date }}</span><span>{{ t.descr }}</span><span>{{ t.by }}</span>
      </div>
      <div class="trow">
        <span>A</span><span>{{ today }}</span><span>{{ t.rev1 }}</span><span>JR</span>
      </div>
      <div class="colophon">
        <span>{{ t.type }}: Instrument Serif · Geist · Geist Mono</span>
        <a href="/colophon">Stack: Astro + Vue · Colophon →</a>
        <span>Bogotá {{ clock }} · 4°40′ N 74°03′ W</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { LINKS } from '../lib/data';
import { clock, t, today } from '../lib/site';

const visitor = ref('');
onMounted(() => {
  let n = 1;
  try {
    n = (parseInt(localStorage.getItem('jr_visits') || '0', 10) || 0) + 1;
    localStorage.setItem('jr_visits', String(n));
  } catch {}
  visitor.value = String(4217 + n).padStart(6, '0').replace(/(\d{3})(\d{3})/, '$1·$2');
});
</script>

<style scoped>
.site-footer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px var(--gutter) 40px;
  border: 1px solid var(--rule);
  border-bottom: 0;
}
.top {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: 40px;
  align-items: start;
}
.contact { display: flex; flex-direction: column; gap: 20px; }
h2 { margin: 0; font-size: clamp(44px, 6vw, 72px); line-height: .95; }
.links { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 24px; }
.links a { display: flex; justify-content: space-between; padding: 10px 0; border-top: 1px solid var(--rule); font-size: 15px; }
.arrow { color: var(--muted); }
.ticket { justify-self: end; width: 100%; max-width: 320px; display: flex; color: #111; transform: rotate(-2deg); }
.stub {
  flex: 1;
  background: #FBFAF7;
  padding: 18px;
  border: 1px solid #d9d7d0;
  border-right: 1px dashed #bdbbb5;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 10px;
  letter-spacing: .08em;
}
.no { font-size: 40px; letter-spacing: 0; line-height: 1; min-height: 1em; }
.muted { color: #6E6D68; }
.side {
  width: 64px;
  background: #FBFAF7;
  border: 1px solid #d9d7d0;
  border-left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  letter-spacing: .14em;
  writing-mode: vertical-rl;
}
.titleblock { margin-top: 48px; border: 1px solid var(--rule); font-size: 11px; }
.trow { display: grid; grid-template-columns: 60px 120px minmax(0, 1fr) 60px; }
.trow.head { color: var(--muted); letter-spacing: .08em; border-bottom: 1px solid var(--rule); }
.trow span, .colophon > * { padding: 8px 10px; }
.trow span + span, .colophon > * + * { border-left: 1px solid var(--rule); }
.colophon {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  border-top: 1px solid var(--rule);
  color: var(--muted);
}
.colophon a { color: var(--fg); }
</style>
